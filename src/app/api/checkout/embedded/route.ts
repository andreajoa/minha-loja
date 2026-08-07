import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  applyPercentDiscount,
  calculateDiscount,
  normalizeCart,
  serializeCart,
  type CartLine,
} from "@/lib/commerce";
import { quoteShipping } from "@/lib/shipping-server";
import { BASE_PATH } from "@/lib/paths";

export const runtime = "nodejs";

type Payload = {
  cart?: CartLine[];
  cep?: unknown;
  shippingId?: unknown;
};

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
      (total, line) => total + line.product.price * line.quantity,
      0,
    );
    const discount = calculateDiscount(subtotal);
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

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      locale: "pt-BR",
      payment_method_types: ["card"],
      customer_creation: "always",
      saved_payment_method_options: { payment_method_save: "enabled" },
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["BR"] },
      custom_fields: [
        {
          key: "whatsapp",
          label: {
            type: "custom",
            custom: "WhatsApp com DDD",
          },
          type: "text",
          optional: false,
          text: {
            minimum_length: 10,
            maximum_length: 20,
          },
        },
        {
          key: "referencia",
          label: {
            type: "custom",
            custom: "Bairro, complemento e referência",
          },
          type: "text",
          optional: false,
          text: {
            minimum_length: 2,
            maximum_length: 160,
          },
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
      line_items: normalizedCart.map(({ product, quantity }) => {
        const discountedUnitAmount = applyPercentDiscount(
          product.price,
          discount.tier.percent,
        );
        return {
          price_data: {
            currency: "brl",
            product_data: {
              name: product.name,
              description:
                discount.tier.percent > 0
                  ? `${product.description} Desconto progressivo de ${discount.tier.percent}% aplicado.`
                  : product.description,
              metadata: {
                productId: product.id,
                originalUnitAmount: String(product.price),
              },
            },
            unit_amount: discountedUnitAmount,
          },
          quantity,
        };
      }),
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
        shippingId: shipping.id,
        shippingAmount: String(shipping.amount),
        shippingLabel: shipping.label.slice(0, 200),
        destinationCep: shippingQuote.cep,
        destinationCity: shippingQuote.city.slice(0, 100),
        postPurchaseOfferViewed: "false",
        postPurchaseOfferClaimed: "false",
      },
      payment_intent_data: {
        metadata: {
          store: "brinqueteando",
          cart: cartMetadata,
          discountPercent: String(discount.tier.percent),
          shippingId: shipping.id,
        },
      },
    });

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "A Stripe não retornou o checkout incorporado." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      summary: {
        subtotal,
        discountPercent: discount.tier.percent,
        discountAmount: discount.amount,
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
