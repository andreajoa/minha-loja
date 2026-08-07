import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!stripeKey || !resendKey) {
      return NextResponse.json({ received: true });
    }

    const incoming = (await req.json()) as { id?: unknown };
    if (typeof incoming.id !== "string" || !incoming.id.startsWith("evt_")) {
      return NextResponse.json({ received: true });
    }

    const stripe = new Stripe(stripeKey);
    const event = await stripe.events.retrieve(incoming.id);
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const eventSession = event.data.object as Stripe.Checkout.Session;
    const session = await stripe.checkout.sessions.retrieve(eventSession.id);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const email = session.customer_details?.email || session.customer_email || "";
    if (!email) return NextResponse.json({ received: true });

    const resend = new Resend(resendKey);
    const events = [
      { event: "cart.recovery_stop", payload: { reason: "order_completed" } },
      { event: "checkout.recovery_stop", payload: { reason: "order_completed" } },
      { event: "order.completed", payload: { orderId: session.id } },
    ] as const;

    for (const item of events) {
      try {
        const result = await resend.events.send({
          event: item.event,
          email,
          payload: item.payload,
        });
        if (result.error) console.error(`${item.event} event:`, result.error);
      } catch (eventError) {
        console.error(`${item.event} exception:`, eventError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Marketing Stripe event:", error);
    return NextResponse.json({ received: true });
  }
}
