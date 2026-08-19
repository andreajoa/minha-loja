import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { products } from "@/data/products";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  const sessions: Stripe.Checkout.Session[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const page = await stripe.checkout.sessions.list({
      status: "complete",
      limit: 100,
      created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    sessions.push(...page.data);
    hasMore = page.has_more;
    if (page.data.length > 0) {
      startingAfter = page.data[page.data.length - 1].id;
    }
  }

  let revenueToday = 0;
  let revenueWeek = 0;
  let revenueMonth = 0;
  let ordersToday = 0;
  let ordersWeek = 0;
  let ordersMonth = 0;

  for (const session of sessions) {
    const amount = session.amount_total || 0;
    const created = new Date((session.created || 0) * 1000);

    revenueMonth += amount;
    ordersMonth++;

    if (created >= startOfWeek) {
      revenueWeek += amount;
      ordersWeek++;
    }
    if (created >= startOfToday) {
      revenueToday += amount;
      ordersToday++;
    }
  }

  const averageTicket = ordersMonth > 0 ? Math.round(revenueMonth / ordersMonth) : 0;

  const lowStockProducts = products
    .filter((p) => p.stock <= 5)
    .map((p) => ({ id: p.id, name: p.name, stock: p.stock, category: p.category }));

  const categoryCount: Record<string, number> = {};
  for (const p of products) {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  }

  return NextResponse.json({
    revenue: { today: revenueToday, week: revenueWeek, month: revenueMonth },
    orders: { today: ordersToday, week: ordersWeek, month: ordersMonth },
    averageTicket,
    totalProducts: products.length,
    lowStockProducts,
    categoryCount,
  });
}
