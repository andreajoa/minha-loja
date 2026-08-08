import { isStoreManagerManagedProductId } from "@/lib/store-manager-managed";

type StripeProductLike = {
  metadata?: Record<string, string> | null;
};

type StripeLineLike = {
  description?: string | null;
  quantity?: number | null;
  amount_subtotal?: number | null;
  amount_total?: number | null;
  price?: {
    unit_amount?: number | null;
    product?: string | StripeProductLike | null;
  } | null;
};

type StripeLike = {
  checkout: {
    sessions: {
      listLineItems(
        sessionId: string,
        params: { limit: number; expand: string[] },
      ): Promise<{ data: StripeLineLike[]; has_more?: boolean }>;
    };
  };
};

type CheckoutSessionLike = {
  id: string;
  amount_subtotal?: number | null;
  amount_total?: number | null;
  currency?: string | null;
  total_details?: { amount_discount?: number | null; amount_shipping?: number | null } | null;
  customer_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: AddressLike | null;
  } | null;
  shipping_details?: {
    name?: string | null;
    address?: AddressLike | null;
  } | null;
  collected_information?: {
    shipping_details?: {
      name?: string | null;
      address?: AddressLike | null;
    } | null;
  } | null;
};

type AddressLike = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type ManagedLine = {
  externalProductId: string;
  externalVariantId: string | null;
  title: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  discountCents: number;
};

function integerCents(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function productMetadata(line: StripeLineLike) {
  const product = line.price?.product;
  return product && typeof product === "object" && !Array.isArray(product)
    ? product.metadata || {}
    : {};
}

function managedLine(line: StripeLineLike): ManagedLine | null {
  const metadata = productMetadata(line);
  const productId = metadata.productId?.trim();
  if (!productId || !isStoreManagerManagedProductId(productId)) return null;

  const quantity = typeof line.quantity === "number" && Number.isInteger(line.quantity) && line.quantity > 0
    ? line.quantity
    : null;
  const unitPriceCents = integerCents(line.price?.unit_amount);
  const subtotalCents = integerCents(line.amount_subtotal);
  const finalCents = integerCents(line.amount_total);

  if (!quantity || unitPriceCents === null || subtotalCents === null || finalCents === null) {
    throw new Error(`Linha Stripe gerenciada sem valores inteiros válidos: ${productId}`);
  }
  if (unitPriceCents * quantity !== subtotalCents) {
    throw new Error(`Subtotal Stripe incompatível com preço × quantidade: ${productId}`);
  }
  if (finalCents > subtotalCents) {
    throw new Error(`Total Stripe maior que subtotal do item: ${productId}`);
  }

  return {
    externalProductId: productId,
    externalVariantId: metadata.variantId?.trim() || null,
    title: line.description?.trim() || productId,
    quantity,
    unitPriceCents,
    subtotalCents,
    discountCents: subtotalCents - finalCents,
  };
}

function shippingAddress(session: CheckoutSessionLike) {
  const shipping = session.collected_information?.shipping_details || session.shipping_details || null;
  const address = shipping?.address || session.customer_details?.address || null;
  const recipient = shipping?.name?.trim() || session.customer_details?.name?.trim() || "";

  if (!address || !recipient || !address.line1 || !address.city || !address.state || !address.postal_code) {
    throw new Error("Checkout pago sem endereço de entrega completo para o Store Manager.");
  }

  return {
    recipient,
    line1: address.line1,
    line2: address.line2 || null,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    countryCode: (address.country || "BR").toUpperCase(),
  };
}

export async function pushPaidCheckoutToStoreManager(input: {
  stripe: StripeLike;
  session: CheckoutSessionLike;
  stripeEventId: string;
  stripeEventCreated: number;
}) {
  const webhookUrl = process.env.STORE_MANAGER_WEBHOOK_URL?.trim();
  const webhookToken = process.env.STORE_MANAGER_WEBHOOK_TOKEN?.trim();
  if (!webhookUrl || !webhookToken) {
    return { sent: false, skipped: true, reason: "STORE_MANAGER_WEBHOOK_NOT_CONFIGURED" } as const;
  }

  const listed = await input.stripe.checkout.sessions.listLineItems(input.session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });
  if (listed.has_more) {
    throw new Error("Checkout possui mais de 100 linhas; envio ao Store Manager bloqueado para evitar pedido parcial.");
  }

  const allLines = listed.data;
  const managed = allLines.flatMap((line) => {
    const normalized = managedLine(line);
    return normalized ? [normalized] : [];
  });
  if (managed.length === 0) {
    return { sent: false, skipped: true, reason: "NO_MANAGED_ITEMS" } as const;
  }

  const sourceOrderTotalCents = integerCents(input.session.amount_total);
  if (sourceOrderTotalCents === null) {
    throw new Error("Checkout Stripe sem amount_total inteiro.");
  }

  const fullOrder = managed.length === allLines.length;
  const subtotalCents = managed.reduce((sum, item) => sum + item.subtotalCents, 0);
  const managedDiscountCents = managed.reduce((sum, item) => sum + item.discountCents, 0);
  const shippingAmountCents = fullOrder
    ? integerCents(input.session.total_details?.amount_shipping) ?? 0
    : 0;
  const discountAmountCents = fullOrder
    ? integerCents(input.session.total_details?.amount_discount) ?? managedDiscountCents
    : managedDiscountCents;
  const totalCents = subtotalCents - discountAmountCents + shippingAmountCents;

  if (totalCents < 0 || (fullOrder && totalCents !== sourceOrderTotalCents)) {
    throw new Error("Reconciliação do checkout Stripe divergiu; envio ao Store Manager bloqueado.");
  }

  const event = {
    eventId: input.stripeEventId,
    eventType: "order.paid",
    occurredAt: new Date(input.stripeEventCreated * 1000).toISOString(),
    order: {
      id: input.session.id,
      scope: fullOrder ? "FULL_ORDER" : "MANAGED_ITEMS",
      sourceOrderTotalCents,
      currency: (input.session.currency || "brl").toUpperCase(),
      subtotalCents,
      shippingAmountCents,
      discountAmountCents,
      totalCents,
      customer: {
        name: input.session.customer_details?.name?.trim() || shippingAddress(input.session).recipient,
        email: input.session.customer_details?.email?.trim() || null,
        phone: input.session.customer_details?.phone?.trim() || null,
      },
      shippingAddress: shippingAddress(input.session),
      items: managed.map((item) => ({
        externalProductId: item.externalProductId,
        externalVariantId: item.externalVariantId,
        title: item.title,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        totalPriceCents: item.subtotalCents,
      })),
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${webhookToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(event),
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await response.text().catch(() => "");
    if (!response.ok) {
      throw new Error(`Store Manager respondeu HTTP ${response.status}: ${body.slice(0, 500)}`);
    }
    return { sent: true, skipped: false, scope: event.order.scope } as const;
  } finally {
    clearTimeout(timeout);
  }
}
