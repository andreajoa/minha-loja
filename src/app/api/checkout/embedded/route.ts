import Stripe from "stripe";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  applyPercentDiscount,
  calculateDiscount,
  formatMoney,
  normalizeCart,
  serializeCart,
  type CartLine,
} from "@/lib/commerce";
import { quoteShipping } from "@/lib/shipping-server";
import { BASE_PATH } from "@/lib/paths";
import { verifyMarketingToken } from "@/lib/marketing-token";

export const runtime = "nodejs";

type Payload = {
  cart?: CartLine[];
  cep?: unknown;
  shippingId?: unknown;
  couponCode?: unknown;
};

function safeAnalyticsId(value: string) {
  return /^[a-zA-Z0-9:_-]{8,120}$/.test(value) ? value : "";
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "O pagamento ainda não foi configurado no servidor." },
        { status: 503 },
      );
    }

    const payload = (await req.json()) as Payload;
    if (!Array.isArray(payload.cart)) {
      return NextResponse.json({ error: "Carrinho inválido." }, { status: 400 });
    }
    if (typeof payload.cep !== "string") {
      return NextResponse.json({ error: "Calcule o frete antes de pagar." }, { status: 400 });
    }

    const normalizedCart = normalizeCart(payload.cart);
    const subtotal = normalizedCart.reduce(
      (total, line) => total + line.unitPrice * line.quantity,
      0,
    );
    const couponCode =
      typeof payload.couponCode === "string" ? payload.couponCode : "";
    const discount = calculateDiscount(subtotal, couponCode);
    const shippingQuote = await quoteShipping(payload.cep, payload.cart);
    const requestedShippingId =
      typeof payload.shippingId === "string" ? payload.shippingId : "";
    const shipping =
      shippingQuote.options.find((option) => option.id === requestedShippingId) ||
      shippingQuote.options[0];

    if (!shipping) {
      return NextResponse.json(
        { error: "Nenhuma opção de entrega está disponível." },
        { status: 400 },
      );
    }

    const requestUrl = new URL(req.url);
    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || `${requestUrl.origin}${BASE_PATH}`
    ).replace(/\/$/, "");
    const stripe = new Stripe(stripeSecretKey);
    const cartMetadata = serializeCart(payload.cart);
    const discountDescription =
      discount.source === "coupon"
        ? `Cupom ${discount.coupon.code} de ${discount.tier.percent}% aplicado.`
        : discount.source === "progressive"
          ? `Desconto progressivo de ${discount.tier.percent}% aplicado.`
          : "";

    const cookieStore = await cookies();
    const marketingEmail = cookieStore.get("bt_marketing_email")?.value || "";
    const marketingToken = cookieStore.get("bt_marketing_token")?.value || "";
    const analyticsSessionId = safeAnalyticsId(
      cookieStore.get("bt_analytics_session")?.value || "",
    );
    const analyticsVisitorId = safeAnalyticsId(
      cookieStore.get("bt_analytics_visitor")?.value || "",
    );
    const canRecover = Boolean(
      marketingEmail && verifyMarketingToken(marketingToken, marketingEmail),
    );

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      locale: "pt-BR",
      payment_method_types: ["card"],
      customer_creation: "always",
      ...(canRecover ? { customer_email: marketingEmail } : {}),
      saved_payment_method_options: { payment_method_save: "enabled" },
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["BR"] },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      custom_fields: [
        {
          key: "whatsapp",
          label: { type: "custom", custom: "WhatsApp com DDD" },
          type: "text",
          optional: false,
          text: { minimum_length: 10, maximum_length: 20 },
        },
        {
          key: "referencia",
          label: { type: "custom", custom: "Bairro, complemento e referência" },
          type: "text",
          optional: false,
          text: { minimum_length: 2, maximum_length: 160 },
        },
      ],
      custom_text: {
        shipping_address: {
          message:
            "Informe o endereço completo e correto. Use o campo adicional para bairro, complemento e ponto de referência.",
        },
        submit: {
          message:
            "Revise o endereço, o WhatsApp e os dados do pedido antes de concluir o pagamento.",
        },
      },
      line_items: normalizedCart.map(
        ({ product, variant, variantId, unitPrice, quantity }) => {
          const discountedUnitAmount = applyPercentDiscount(
            unitPrice,
            discount.tier.percent,
          );
          const displayName = variant
            ? `${product.name} · ${variant.name}`
            : product.name;

          return {
            price_data: {
              currency: "brl",
              product_data: {
                name: displayName,
                description: discountDescription
                  ? `${product.description} ${discountDescription}`
                  : product.description,
                metadata: {
                  productId: product.id,
                  variantId: variantId || "",
                  variantName: variant?.name || "",
                  originalUnitAmount: String(unitPrice),
                },
              },
              unit_amount: discountedUnitAmount,
            },
            quantity,
          };
        },
      ),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shipping.amount, currency: "brl" },
            display_name: shipping.label,
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: Math.max(1, shipping.minimumDays),
              },
              maximum: {
                unit: "business_day",
                value: Math.max(shipping.minimumDays, shipping.maximumDays),
              },
            },
          },
        },
      ],
      return_url: `${appUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        store: "brinqueteando",
        cart: cartMetadata,
        discountPercent: String(discount.tier.percent),
        discountAmount: String(discount.amount),
        discountSource: discount.source,
        couponCode: discount.coupon.valid ? discount.coupon.code : "",
        couponApplied: String(discount.coupon.applied),
        shippingId: shipping.id,
        shippingAmount: String(shipping.amount),
        shippingLabel: shipping.label.slice(0, 200),
        destinationCep: shippingQuote.cep,
        destinationCity: shippingQuote.city.slice(0, 100),
        marketingRecovery: String(canRecover),
        analyticsSessionId,
        analyticsVisitorId,
        postPurchaseOfferViewed: "false",
        postPurchaseOfferClaimed: "false",
      },
      payment_intent_data: {
        metadata: {
          store: "brinqueteando",
          cart: cartMetadata,
          discountPercent: String(discount.tier.percent),
          discountSource: discount.source,
          couponCode: discount.coupon.valid ? discount.coupon.code : "",
          shippingId: shipping.id,
          analyticsSessionId,
          analyticsVisitorId,
        },
      },
    });

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "A Stripe não retornou o checkout incorporado." },
        { status: 502 },
      );
    }

    if (canRecover && process.env.RESEND_API_KEY) {
      try {
        const first = normalizedCart[0].product;
        const recoveryUrl = `${appUrl}/carrinho?restore=${encodeURIComponent(cartMetadata)}`;
        const productImage = new URL(first.image, appUrl).toString();
        const resend = new Resend(process.env.RESEND_API_KEY);

        const stopCart = await resend.events.send({
          event: "cart.recovery_stop",
          email: marketingEmail,
          payload: { reason: "checkout_started" },
        });
        if (stopCart.error) {
          console.error("Cart recovery stop at checkout:", stopCart.error);
        }

        const startCheckout = await resend.events.send({
          event: "checkout.recovery_started",
          email: marketingEmail,
          payload: {
            productName: first.name,
            productImage,
            productUrl: `${appUrl}/produto/${first.id}`,
            recoveryUrl,
            cartTotal: formatMoney(discount.totalAfterDiscount + shipping.amount),
          },
        });
        if (startCheckout.error) {
          console.error("Checkout recovery event:", startCheckout.error);
        }
      } catch (marketingError) {
        console.error("Checkout recovery exception:", marketingError);
      }
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      summary: {
        subtotal,
        discountPercent: discount.tier.percent,
        discountAmount: discount.amount,
        discountSource: discount.source,
        couponCode: discount.coupon.valid ? discount.coupon.code : "",
        couponApplied: discount.coupon.applied,
        shippingAmount: shipping.amount,
        shippingLabel: shipping.label,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao iniciar o pagamento.";
    const clientError =
      message.includes("inválid") ||
      message.includes("Estoque") ||
      message.includes("não encontrado") ||
      message.includes("CEP") ||
      message.includes("frete") ||
      message.includes("entrega");
    return NextResponse.json(
      { error: message },
      { status: clientError ? 400 : 500 },
    );
  }
}
