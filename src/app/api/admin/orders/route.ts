import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);

  const sessions = await stripe.checkout.sessions.list({
    status: "complete",
    limit,
    expand: ["data.line_items"],
  });

  const orders = sessions.data.map((session) => ({
    id: session.id,
    created: session.created,
    amount: session.amount_total,
    currency: session.currency,
    customerName: session.customer_details?.name || "—",
    customerEmail: session.customer_details?.email || "—",
    city: session.customer_details?.address?.city || "—",
    state: session.customer_details?.address?.state || "—",
    paymentStatus: session.payment_status,
    items:
      session.line_items?.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        amount: item.amount_total,
      })) || [],
  }));

  return NextResponse.json({ orders });
}
