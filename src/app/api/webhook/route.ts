import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse("Assinatura invalida", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    if (email) {
      await resend.emails.send({
        from: "Loja <pedidos@seudominio.com>",
        to: email,
        subject: "Pedido confirmado!",
        html: "<h1>Obrigado pela compra!</h1><p>Seu pagamento foi aprovado.</p>",
      });
    }
  }

  return NextResponse.json({ received: true });
}
