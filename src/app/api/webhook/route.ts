import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatAmount(amount: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((amount || 0) / 100);
}

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "BrinqueTEAndo <pedidos@adhdautism.online>";

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

    if (session.payment_status === "paid") {
      const email = session.customer_details?.email || session.customer_email;

      if (email) {
        if (!resendApiKey) {
          return NextResponse.json(
            { error: "Resend não configurado." },
            { status: 503 },
          );
        }

        const customerName = escapeHtml(session.customer_details?.name || "");
        const reference = (session.payment_intent?.toString() || session.id)
          .slice(-10)
          .toUpperCase();
        const resend = new Resend(resendApiKey);

        const { error } = await resend.emails.send(
          {
            from,
            to: [email],
            replyTo: "contato@adhdautism.online",
            subject: "Pagamento aprovado | BrinqueTEAndo",
            html: `
              <div style="background:#FBF8F3;padding:32px 16px;font-family:Arial,sans-serif;color:#33404A">
                <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dcebea">
                  <div style="background:#5EB8B3;padding:28px;text-align:center;color:white">
                    <div style="font-size:30px;font-weight:800">BrinqueTEAndo</div>
                    <div style="margin-top:8px;font-size:15px">Seu pagamento foi aprovado</div>
                  </div>
                  <div style="padding:32px">
                    <h1 style="font-size:26px;margin:0 0 16px">Obrigada pela compra${customerName ? `, ${customerName}` : ""}!</h1>
                    <p style="font-size:16px;line-height:1.7;margin:0 0 20px">
                      Recebemos a confirmação do seu pagamento e seu pedido seguirá para preparação.
                    </p>
                    <div style="background:#F4FAF9;border-radius:16px;padding:20px;margin:24px 0">
                      <p style="margin:0 0 8px"><strong>Referência:</strong> ${reference}</p>
                      <p style="margin:0"><strong>Total pago:</strong> ${formatAmount(session.amount_total)}</p>
                    </div>
                    <p style="font-size:15px;line-height:1.7;margin:0">
                      As próximas informações, incluindo envio e rastreamento, serão encaminhadas para este e-mail.
                    </p>
                  </div>
                  <div style="padding:20px 32px;background:#33404A;color:#ffffff;font-size:13px;text-align:center">
                    BrinqueTEAndo · Curadoria de Margareth Almeida, Neuropsicopedagoga
                  </div>
                </div>
              </div>
            `,
          },
          { idempotencyKey: `stripe-checkout/${event.id}` },
        );

        if (error) {
          return NextResponse.json(
            { error: `Falha no envio do e-mail: ${error.message}` },
            { status: 502 },
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
