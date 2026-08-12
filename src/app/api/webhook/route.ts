import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type AddressDetails = {
  city?: string | null;
  country?: string | null;
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  state?: string | null;
};

type ShippingDetails = {
  name?: string | null;
  address?: AddressDetails | null;
};

type SessionWithShipping = Stripe.Checkout.Session & {
  collected_information?: {
    shipping_details?: ShippingDetails | null;
  } | null;
  shipping_details?: ShippingDetails | null;
};

type CheckoutCustomField = {
  key?: string;
  text?: { value?: string | null } | null;
  numeric?: { value?: string | null } | null;
  dropdown?: { value?: string | null } | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatAmount(amount: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((amount || 0) / 100);
}

function getCustomFieldValue(session: Stripe.Checkout.Session, key: string) {
  const fields = (session.custom_fields || []) as unknown as CheckoutCustomField[];
  const field = fields.find((item) => item.key === key);

  return (
    field?.text?.value ||
    field?.numeric?.value ||
    field?.dropdown?.value ||
    ""
  );
}

function getShippingDetails(session: Stripe.Checkout.Session) {
  const normalized = session as SessionWithShipping;
  return (
    normalized.collected_information?.shipping_details ||
    normalized.shipping_details ||
    null
  );
}

function formatAddressHtml(
  address: AddressDetails | null | undefined,
  destinationCep: string,
) {
  if (!address) {
    return destinationCep
      ? `CEP informado no cálculo do frete: ${escapeHtml(destinationCep)}`
      : "Endereço não disponível.";
  }

  const cityState = [address.city, address.state].filter(Boolean).join(" - ");
  const postalCode = address.postal_code || destinationCep;
  const parts = [
    address.line1,
    address.line2,
    cityState,
    postalCode ? `CEP ${postalCode}` : "",
    address.country === "BR" ? "Brasil" : address.country,
  ].filter((value): value is string => Boolean(value));

  return parts.map(escapeHtml).join("<br />");
}

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "BrinqueTEAndo <pedidos@adhdautism.online>";
  const ownerEmail =
    process.env.ORDER_NOTIFICATION_EMAIL ||
    process.env.RESEND_REPLY_TO_EMAIL ||
    "info@brinqueteando.online";

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook Stripe não configurado." },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const body = await req.text();
  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Esta conta Stripe atende outros projetos. O webhook da loja deve
    // ignorar qualquer checkout que não tenha sido criado pela BrinqueTEAndo.
    if (session.metadata?.store !== "brinqueteando") {
      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "foreign_checkout",
      });
    }

    if (session.payment_status === "paid") {
      if (!resendApiKey) {
        return NextResponse.json(
          { error: "Resend não configurado." },
          { status: 503 },
        );
      }

      const isPostPurchase =
        session.metadata?.source === "post_purchase_offer";
      const originalSessionId = session.metadata?.originalSessionId;
      let contactSession = session;

      if (isPostPurchase && originalSessionId?.startsWith("cs_")) {
        try {
          const original = await stripe.checkout.sessions.retrieve(
            originalSessionId,
          );
          contactSession = original;

          await stripe.checkout.sessions.update(originalSessionId, {
            metadata: {
              ...original.metadata,
              postPurchaseOfferClaimed: "true",
              postPurchaseExtraSessionId: session.id,
            },
          });
        } catch (linkError) {
          console.error("Falha ao vincular compra adicional:", linkError);
        }
      }

      const email =
        contactSession.customer_details?.email ||
        contactSession.customer_email ||
        session.customer_details?.email ||
        session.customer_email ||
        "";
      const shippingDetails = getShippingDetails(contactSession);
      const customerName =
        shippingDetails?.name ||
        contactSession.customer_details?.name ||
        session.customer_details?.name ||
        "Cliente";
      const whatsapp =
        getCustomFieldValue(contactSession, "whatsapp") ||
        contactSession.customer_details?.phone ||
        session.customer_details?.phone ||
        "Não informado";
      const referencePoint =
        getCustomFieldValue(contactSession, "referencia") || "Não informado";
      const destinationCep =
        contactSession.metadata?.destinationCep ||
        session.metadata?.destinationCep ||
        "";
      const address =
        shippingDetails?.address || contactSession.customer_details?.address;
      const addressHtml = formatAddressHtml(address, destinationCep);
      const orderReference = (
        session.payment_intent?.toString() || session.id
      )
        .slice(-10)
        .toUpperCase();
      const shippingLabel = escapeHtml(
        session.metadata?.shippingLabel ||
          (isPostPurchase
            ? "Envio junto ao pedido original"
            : "Conforme checkout"),
      );
      const discountPercent =
        Number.parseInt(session.metadata?.discountPercent || "0", 10) || 0;
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100 },
      );
      const itemsHtml = lineItems.data
        .map((item) => {
          const description = escapeHtml(item.description || "Produto");
          const quantity = item.quantity || 1;
          return `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #E7DDD6">${description}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #E7DDD6;text-align:center">${quantity}</td>
              <td style="padding:10px 0;border-bottom:1px solid #E7DDD6;text-align:right">${formatAmount(item.amount_total)}</td>
            </tr>
          `;
        })
        .join("");
      const resend = new Resend(resendApiKey);

      if (email) {
        const { error: customerError } = await resend.emails.send(
          {
            from,
            to: [email],
            replyTo: ownerEmail,
            subject: isPostPurchase
              ? "Compra adicional confirmada | BrinqueTEAndo"
              : "Pagamento aprovado | BrinqueTEAndo",
            html: `
              <div style="background:#FDF9F6;padding:32px 16px;font-family:Arial,sans-serif;color:#435367">
                <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #C0BDBF">
                  <div style="background:#092647;padding:28px;text-align:center;color:white">
                    <div style="font-size:30px;font-weight:800">BrinqueTEAndo</div>
                    <div style="margin-top:8px;font-size:15px;color:#F2E6DE">${
                      isPostPurchase
                        ? "Sua compra adicional foi aprovada"
                        : "Seu pagamento foi aprovado"
                    }</div>
                  </div>
                  <div style="padding:32px">
                    <h1 style="font-size:26px;color:#092647;margin:0 0 16px">Obrigada pela compra, ${escapeHtml(customerName)}!</h1>
                    <p style="font-size:16px;line-height:1.7;margin:0 0 20px">
                      ${
                        isPostPurchase
                          ? "O novo item foi identificado para seguir junto ao pedido original sempre que a preparação ainda permitir."
                          : "Recebemos a confirmação do pagamento e o pedido seguirá para preparação."
                      }
                    </p>

                    <div style="background:#F2E6DE;border-radius:16px;padding:20px;margin:24px 0">
                      <p style="margin:0 0 8px"><strong style="color:#092647">Referência:</strong> ${orderReference}</p>
                      <p style="margin:0 0 8px"><strong style="color:#092647">Total pago:</strong> ${formatAmount(session.amount_total)}</p>
                      <p style="margin:0 0 8px"><strong style="color:#092647">Entrega:</strong> ${shippingLabel}</p>
                      ${
                        discountPercent > 0
                          ? `<p style="margin:0;color:#A14D2D"><strong>Desconto aplicado:</strong> ${discountPercent}%</p>`
                          : ""
                      }
                    </div>

                    <h2 style="font-size:19px;color:#092647;margin:28px 0 10px">Itens do pedido</h2>
                    <table style="width:100%;border-collapse:collapse;font-size:14px">
                      <thead>
                        <tr>
                          <th style="padding:8px 0;text-align:left;color:#092647">Produto</th>
                          <th style="padding:8px;text-align:center;color:#092647">Qtd.</th>
                          <th style="padding:8px 0;text-align:right;color:#092647">Total</th>
                        </tr>
                      </thead>
                      <tbody>${itemsHtml}</tbody>
                    </table>

                    <h2 style="font-size:19px;color:#092647;margin:28px 0 10px">Dados de entrega informados</h2>
                    <p style="font-size:15px;line-height:1.7;margin:0 0 8px">${addressHtml}</p>
                    <p style="font-size:15px;line-height:1.7;margin:0 0 8px"><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
                    <p style="font-size:15px;line-height:1.7;margin:0"><strong>Bairro, complemento e referência:</strong> ${escapeHtml(referencePoint)}</p>

                    <p style="font-size:14px;line-height:1.7;margin:28px 0 0;color:#68778A">
                      Caso algum dado esteja incorreto, responda este e-mail imediatamente informando a referência do pedido.
                    </p>
                  </div>
                  <div style="padding:20px 32px;background:#A14D2D;color:#ffffff;font-size:13px;text-align:center">
                    BrinqueTEAndo · Curadoria de Margareth Almeida, Neuropsicopedagoga
                  </div>
                </div>
              </div>
            `,
          },
          { idempotencyKey: `stripe-checkout/customer/${event.id}` },
        );

        if (customerError) {
          return NextResponse.json(
            { error: `Falha no e-mail do cliente: ${customerError.message}` },
            { status: 502 },
          );
        }
      }

      const { error: ownerError } = await resend.emails.send(
        {
          from,
          to: [ownerEmail],
          replyTo: email || ownerEmail,
          subject: `${
            isPostPurchase ? "Compra adicional paga" : "Novo pedido pago"
          } | ${orderReference} | ${customerName}`,
          html: `
            <div style="background:#F4EEE9;padding:28px 14px;font-family:Arial,sans-serif;color:#24364A">
              <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #D9CBC1">
                <div style="background:#092647;padding:24px 28px;color:#ffffff">
                  <div style="font-size:26px;font-weight:800">Novo pedido BrinqueTEAndo</div>
                  <div style="margin-top:7px;color:#F2E6DE">Pagamento confirmado · Referência ${orderReference}</div>
                </div>

                <div style="padding:28px">
                  <div style="background:#F2E6DE;border-radius:14px;padding:18px;margin-bottom:24px">
                    <p style="margin:0 0 8px"><strong>Cliente:</strong> ${escapeHtml(customerName)}</p>
                    <p style="margin:0 0 8px"><strong>E-mail:</strong> ${escapeHtml(email || "Não informado")}</p>
                    <p style="margin:0 0 8px"><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
                    <p style="margin:0"><strong>Sessão Stripe:</strong> ${escapeHtml(session.id)}</p>
                  </div>

                  <h2 style="font-size:19px;color:#092647;margin:0 0 10px">Endereço para envio</h2>
                  <p style="font-size:15px;line-height:1.7;margin:0 0 8px">${addressHtml}</p>
                  <p style="font-size:15px;line-height:1.7;margin:0 0 24px"><strong>Bairro, complemento e referência:</strong> ${escapeHtml(referencePoint)}</p>

                  <h2 style="font-size:19px;color:#092647;margin:0 0 10px">Produtos comprados</h2>
                  <table style="width:100%;border-collapse:collapse;font-size:14px">
                    <thead>
                      <tr>
                        <th style="padding:8px 0;text-align:left;color:#092647">Produto</th>
                        <th style="padding:8px;text-align:center;color:#092647">Qtd.</th>
                        <th style="padding:8px 0;text-align:right;color:#092647">Total</th>
                      </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                  </table>

                  <div style="margin-top:24px;border-top:2px solid #E7DDD6;padding-top:18px">
                    <p style="margin:0 0 8px"><strong>Frete:</strong> ${shippingLabel}</p>
                    <p style="margin:0 0 8px"><strong>Desconto:</strong> ${discountPercent}%</p>
                    <p style="margin:0;font-size:20px;color:#092647"><strong>Total pago: ${formatAmount(session.amount_total)}</strong></p>
                  </div>

                  <div style="margin-top:24px;background:#FFF5ED;border-left:4px solid #A14D2D;padding:16px">
                    Confira nome, WhatsApp, endereço, CEP e referência antes de separar e despachar o pedido.
                  </div>
                </div>
              </div>
            </div>
          `,
        },
        { idempotencyKey: `stripe-checkout/store/${event.id}` },
      );

      if (ownerError) {
        return NextResponse.json(
          { error: `Falha no e-mail da loja: ${ownerError.message}` },
          { status: 502 },
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
