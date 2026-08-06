import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { BASE_PATH } from "@/lib/paths";
import {
  approvedPaymentEmail,
  failedPaymentEmail,
  formatAmount,
  friendlyPaymentFailureReason,
  orderPreparationEmail,
} from "@/lib/transactional-email-templates";

export const runtime = "nodejs";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

function getObjectId(value: string | { id: string } | null | undefined) {
  if (!value) return "";
  return typeof value === "string" ? value : value.id;
}

function getAppUrl(req: Request) {
  const requestUrl = new URL(req.url);
  return (
    process.env.NEXT_PUBLIC_APP_URL || `${requestUrl.origin}${BASE_PATH}`
  ).replace(/\/$/, "");
}

async function findFailedPaymentRecipient(
  stripe: Stripe,
  intent: Stripe.PaymentIntent,
) {
  let email = intent.receipt_email || "";
  let name = "";
  let session: Stripe.Checkout.Session | undefined;

  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: intent.id,
      limit: 1,
    });
    session = sessions.data[0];
    email =
      email || session?.customer_details?.email || session?.customer_email || "";
    name = session?.customer_details?.name || "";
  } catch (error) {
    console.error("Falha ao localizar sessão do pagamento recusado:", error);
  }

  const paymentMethodId = getObjectId(intent.payment_method);
  if (paymentMethodId && (!email || !name)) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      email = email || paymentMethod.billing_details.email || "";
      name = name || paymentMethod.billing_details.name || "";
    } catch (error) {
      console.error("Falha ao consultar dados de cobrança do cartão:", error);
    }
  }

  const customerId = getObjectId(intent.customer);
  if (customerId && (!email || !name)) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!("deleted" in customer && customer.deleted)) {
        email = email || customer.email || "";
        name = name || customer.name || "";
      }
    } catch (error) {
      console.error("Falha ao consultar cliente do pagamento recusado:", error);
    }
  }

  return { email, name, session };
}

async function handleSuccessfulCheckout({
  stripe,
  resend,
  from,
  replyTo,
  event,
}: {
  stripe: Stripe;
  resend: Resend;
  from: string;
  replyTo: string;
  event: Stripe.Event;
}) {
  const eventSession = event.data.object as Stripe.Checkout.Session;
  if (eventSession.payment_status !== "paid") return;

  const session = await stripe.checkout.sessions.retrieve(eventSession.id);
  const isPostPurchase = session.metadata?.source === "post_purchase_offer";
  const originalSessionId = session.metadata?.originalSessionId;

  if (isPostPurchase && originalSessionId?.startsWith("cs_")) {
    try {
      const original = await stripe.checkout.sessions.retrieve(originalSessionId);
      await stripe.checkout.sessions.update(originalSessionId, {
        metadata: {
          ...original.metadata,
          postPurchaseOfferClaimed: "true",
          postPurchaseExtraSessionId: session.id,
        },
      });
    } catch (error) {
      console.error("Falha ao vincular compra adicional:", error);
    }
  }

  const email = session.customer_details?.email || session.customer_email;
  if (!email) {
    console.warn(`Checkout ${session.id} aprovado sem e-mail do cliente.`);
    return;
  }

  const customerName = session.customer_details?.name || "";
  const paymentIntentId = getObjectId(session.payment_intent);
  const reference = (paymentIntentId || session.id).slice(-10).toUpperCase();
  const shippingLabel =
    session.metadata?.shippingLabel ||
    (isPostPurchase ? "Envio junto ao pedido original" : "Conforme checkout");
  const discountPercent =
    Number.parseInt(session.metadata?.discountPercent || "0", 10) || 0;
  const metadata = { ...session.metadata };

  if (metadata.orderConfirmationEmailSent !== "true") {
    const { error } = await resend.emails.send(
      {
        from,
        to: [email],
        replyTo,
        subject: isPostPurchase
          ? "Compra adicional confirmada | BrinqueTEAndo"
          : "Pagamento aprovado e pedido confirmado | BrinqueTEAndo",
        html: approvedPaymentEmail({
          customerName,
          reference,
          total: formatAmount(session.amount_total),
          shippingLabel,
          discountPercent,
          isPostPurchase,
        }),
        tags: [
          {
            name: "category",
            value: isPostPurchase
              ? "post_purchase_confirmation"
              : "order_confirmation",
          },
        ],
      },
      {
        idempotencyKey: `${
          isPostPurchase ? "post-purchase-confirmation" : "order-confirmation"
        }/${session.id}`,
      },
    );

    if (error) {
      throw new Error(`Falha no e-mail de confirmação: ${error.message}`);
    }

    metadata.orderConfirmationEmailSent = "true";
    metadata.orderConfirmationEmailEvent = event.id;
  }

  if (!isPostPurchase && metadata.preparationEmailScheduled !== "true") {
    const scheduledAt = new Date(Date.now() + ONE_DAY_IN_MS).toISOString();
    const { data, error } = await resend.emails.send(
      {
        from,
        to: [email],
        replyTo,
        subject: "Seu pedido entrou em preparação | BrinqueTEAndo",
        html: orderPreparationEmail({
          customerName,
          reference,
          shippingLabel,
        }),
        scheduledAt,
        tags: [{ name: "category", value: "order_preparation" }],
      },
      { idempotencyKey: `order-preparation/${session.id}` },
    );

    if (error) {
      throw new Error(`Falha ao agendar atualização do pedido: ${error.message}`);
    }

    metadata.preparationEmailScheduled = "true";
    metadata.preparationEmailScheduledAt = scheduledAt;
    if (data?.id) metadata.preparationEmailId = data.id;
  }

  await stripe.checkout.sessions.update(session.id, { metadata });
}

async function handleFailedPayment({
  stripe,
  resend,
  from,
  replyTo,
  appUrl,
  event,
}: {
  stripe: Stripe;
  resend: Resend;
  from: string;
  replyTo: string;
  appUrl: string;
  event: Stripe.Event;
}) {
  const intent = event.data.object as Stripe.PaymentIntent;

  // Evita disparar mensagens para pagamentos de outros projetos da mesma conta Stripe.
  if (intent.metadata?.store !== "brinqueteando") return;

  const { email, name } = await findFailedPaymentRecipient(stripe, intent);
  if (!email) {
    console.warn(`PaymentIntent ${intent.id} falhou sem e-mail recuperável.`);
    return;
  }

  const reference = intent.id.slice(-10).toUpperCase();
  const { error } = await resend.emails.send(
    {
      from,
      to: [email],
      replyTo,
      subject: "Não conseguimos concluir seu pagamento | BrinqueTEAndo",
      html: failedPaymentEmail({
        customerName: name,
        reference,
        total: formatAmount(intent.amount),
        reason: friendlyPaymentFailureReason(intent),
        retryUrl: `${appUrl}/carrinho`,
      }),
      tags: [{ name: "category", value: "payment_failed" }],
    },
    {
      // Um único aviso por PaymentIntent dentro da janela de idempotência do Resend.
      idempotencyKey: `payment-failed/${intent.id}`,
    },
  );

  if (error) {
    throw new Error(`Falha no e-mail de pagamento recusado: ${error.message}`);
  }
}

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "BrinqueTEAndo <pedidos@send.brinqueteando.online>";
  const replyTo =
    process.env.RESEND_REPLY_TO_EMAIL || "contato@brinqueteando.online";

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook Stripe não configurado." },
      { status: 503 },
    );
  }

  if (!resendApiKey) {
    return NextResponse.json(
      { error: "Resend não configurado." },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const body = await req.text();
  const stripe = new Stripe(stripeSecretKey);
  const resend = new Resend(resendApiKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleSuccessfulCheckout({
        stripe,
        resend,
        from,
        replyTo,
        event,
      });
    }

    if (event.type === "payment_intent.payment_failed") {
      await handleFailedPayment({
        stripe,
        resend,
        from,
        replyTo,
        appUrl: getAppUrl(req),
        event,
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao processar webhook.";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ received: true });
}
