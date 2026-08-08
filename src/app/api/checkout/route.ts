import Stripe from "stripe";
import { NextResponse } from "next/server";
import { normalizeCart, serializeCart, type CartLine } from "@/lib/commerce";
import { BASE_PATH } from "@/lib/paths";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "O pagamento ainda não foi configurado no servidor." },
        { status: 503 },
      );
    }

    const payload = (await req.json()) as { cart?: CartLine[] };
    if (!Array.isArray(payload.cart)) {
      return NextResponse.json({ error: "Carrinho inválido." }, { status: 400 });
    }

    const normalizedCart = normalizeCart(payload.cart);
    const stripe = new Stripe(stripeSecretKey);
    const requestUrl = new URL(req.url);
    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL || `${requestUrl.origin}${BASE_PATH}`
    ).replace(/\/$/, "");

    const shippingFee = Math.max(
      0,
      Number.parseInt(process.env.SHIPPING_FEE_CENTS || "1990", 10) || 0,
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_creation: "always",
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["BR"] },
      phone_number_collection: { enabled: true },
      line_items: normalizedCart.map(
        ({ product, variant, variantId, unitPrice, quantity }) => ({
          price_data: {
            currency: "brl",
            product_data: {
              name: variant ? `${product.name} · ${variant.name}` : product.name,
              description: product.description,
              metadata: {
                productId: product.id,
                variantId: variantId || "",
                variantName: variant?.name || "",
              },
            },
            unit_amount: unitPrice,
          },
          quantity,
        }),
      ),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingFee, currency: "brl" },
            display_name: shippingFee === 0 ? "Entrega grátis" : "Entrega padrão",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 15 },
            },
          },
        },
      ],
      success_url: `${appUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/carrinho`,
      metadata: {
        store: "brinqueteando",
        cart: serializeCart(payload.cart),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "A Stripe não retornou uma página de pagamento." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao iniciar o pagamento.";
    const status =
      message.includes("inválid") ||
      message.includes("Estoque") ||
      message.includes("não encontrado")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
