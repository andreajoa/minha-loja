import Stripe from "stripe";
import { NextResponse } from "next/server";
import { products } from "@/data/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { cart } = await req.json(); // [{ id, qty }]

  const line_items = cart.map((item: { id: string; qty: number }) => {
    const p = products.find((x) => x.id === item.id);
    if (!p) throw new Error("Produto invalido");
    return {
      price_data: {
        currency: "brl",
        product_data: { name: p.name },
        unit_amount: p.price,
      },
      quantity: item.qty,
    };
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/carrinho`,
  });

  return NextResponse.json({ url: session.url });
}
