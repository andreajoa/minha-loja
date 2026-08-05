import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  applyPercentDiscount,
  getPostPurchaseRecommendations,
  parseSerializedCart,
  productPreview,
} from "@/lib/commerce";
import { products } from "@/data/products";
import { BASE_PATH } from "@/lib/paths";

export const runtime = "nodejs";

const OFFER_PERCENT = 30;
const OFFER_WINDOW_SECONDS = 30 * 60;

type Payload = {
  action?: "status" | "claim" | "finalize";
  sessionId?: unknown;
  productId?: unknown;
  paymentIntentId?: unknown;
};

function appUrlFor(req: Request) {
  const requestUrl = new URL(req.url);
  return (
    process.env.NEXT_PUBLIC_APP_URL || `${requestUrl.origin}${BASE_PATH}`
  ).replace(/\/$/, "");
}

function customerId(session: Stripe.Checkout.Session) {
  return typeof session.customer === "string" ? session.customer : session.customer?.id || "";
}

function paymentMethodId(paymentIntent: Stripe.PaymentIntent | string | null) {
  if (!paymentIntent || typeof paymentIntent === "string") return "";
  const method = paymentIntent.payment_method;
  return typeof method === "string" ? method : method?.id || "";
}

async function updateOriginalSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  updates: Record<string, string>,
) {
  await stripe.checkout.sessions.update(session.id, {
    metadata: {
      ...session.metadata,
      ...updates,
    },
  });
}

async function createFallbackCheckout({
  stripe,
  req,
  originalSession,
  productId,
}: {
  stripe: Stripe;
  req: Request;
  originalSession: Stripe.Checkout.Session;
  productId: string;
}) {
  const product = products.find((item) => item.id === productId);
  if (!product) throw new Error("Produto da oferta não encontrado.");
  const offerPrice = applyPercentDiscount(product.price, OFFER_PERCENT);
  const customer = customerId(originalSession);
  const appUrl = appUrlFor(req);

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    payment_method_types: ["card"],
    ...(customer ? { customer } : { customer_creation: "always" as const }),
    saved_payment_method_options: { payment_method_save: "enabled" },
    line_items: [
      {
        price_data: {
          currency: "brl",
          unit_amount: offerPrice,
          product_data: {
            name: `${product.name} · oferta pós-compra`,
            description: `30% de desconto para envio junto ao pedido ${originalSession.id.slice(-10).toUpperCase()}.`,
            metadata: { productId: product.id },
          },
        },
        quantity: 1,
      },
    ],
    return_url: `${appUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}&extra=1`,
    metadata: {
      store: "brinqueteando",
      source: "post_purchase_offer",
      originalSessionId: originalSession.id,
      cart: `${product.id}:1`,
      discountPercent: String(OFFER_PERCENT),
      shippingAmount: "0",
      shippingLabel: "Envio junto ao pedido original",
      postPurchaseOfferViewed: "true",
      postPurchaseOfferClaimed: "true",
    },
    payment_intent_data: {
      metadata: {
        store: "brinqueteando",
        source: "post_purchase_offer",
        originalSessionId: originalSession.id,
        productId: product.id,
      },
    },
  });

  if (!session.client_secret) {
    throw new Error("A Stripe não retornou o pagamento incorporado da oferta.");
  }

  return session.client_secret;
}

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: "Stripe não configurada." }, { status: 503 });
    }

    const payload = (await req.json()) as Payload;
    if (typeof payload.sessionId !== "string" || !payload.sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
    }

    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(payload.sessionId, {
      expand: ["payment_intent.payment_method"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "O pagamento principal ainda não foi confirmado." }, { status: 409 });
    }

    const ageSeconds = Math.floor(Date.now() / 1000) - session.created;
    const expired = ageSeconds > OFFER_WINDOW_SECONDS;
    const purchasedIds = parseSerializedCart(session.metadata?.cart).map((line) => line.id);
    const recommendations = getPostPurchaseRecommendations(purchasedIds, 4);
    const offerProduct = recommendations[0] || null;
    const claimed = session.metadata?.postPurchaseOfferClaimed === "true";
    const viewed = session.metadata?.postPurchaseOfferViewed === "true";

    if (payload.action === "status") {
      if (!offerProduct || claimed || viewed || expired || session.metadata?.source === "post_purchase_offer") {
        return NextResponse.json({ visible: false, claimed, expired });
      }

      await updateOriginalSession(stripe, session, {
        postPurchaseOfferViewed: "true",
        postPurchaseOfferProductId: offerProduct.id,
        postPurchaseOfferExpiresAt: String(session.created + OFFER_WINDOW_SECONDS),
      });

      return NextResponse.json({
        visible: true,
        expiresAt: session.created + OFFER_WINDOW_SECONDS,
        offer: {
          product: productPreview(offerProduct),
          originalPrice: offerProduct.price,
          offerPrice: applyPercentDiscount(offerProduct.price, OFFER_PERCENT),
          percent: OFFER_PERCENT,
        },
        recommendations: recommendations.slice(1).map(productPreview),
      });
    }

    if (payload.action === "finalize") {
      if (typeof payload.paymentIntentId !== "string") {
        return NextResponse.json({ error: "Pagamento adicional inválido." }, { status: 400 });
      }
      const paymentIntent = await stripe.paymentIntents.retrieve(payload.paymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json({ error: "O pagamento adicional ainda não foi concluído." }, { status: 409 });
      }
      await updateOriginalSession(stripe, session, {
        postPurchaseOfferClaimed: "true",
        postPurchasePaymentIntentId: paymentIntent.id,
      });
      return NextResponse.json({ success: true });
    }

    if (payload.action !== "claim") {
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    }

    if (claimed) {
      return NextResponse.json({ error: "Esta oferta já foi utilizada." }, { status: 409 });
    }
    if (expired) {
      return NextResponse.json({ error: "A janela desta oferta terminou." }, { status: 410 });
    }
    if (typeof payload.productId !== "string") {
      return NextResponse.json({ error: "Produto da oferta inválido." }, { status: 400 });
    }

    const allowedProductId = session.metadata?.postPurchaseOfferProductId || offerProduct?.id;
    if (!allowedProductId || payload.productId !== allowedProductId) {
      return NextResponse.json({ error: "Esta oferta não corresponde ao pedido." }, { status: 400 });
    }

    const product = products.find((item) => item.id === payload.productId);
    if (!product || product.stock <= 0) {
      return NextResponse.json({ error: "O produto da oferta ficou indisponível." }, { status: 409 });
    }

    const customer = customerId(session);
    const method = paymentMethodId(session.payment_intent);
    const amount = applyPercentDiscount(product.price, OFFER_PERCENT);

    if (customer && method) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: "brl",
          customer,
          payment_method: method,
          payment_method_types: ["card"],
          confirm: true,
          use_stripe_sdk: true,
          description: `${product.name} · oferta pós-compra BrinqueTEAndo`,
          receipt_email: session.customer_details?.email || session.customer_email || undefined,
          metadata: {
            store: "brinqueteando",
            source: "post_purchase_offer",
            originalSessionId: session.id,
            productId: product.id,
            discountPercent: String(OFFER_PERCENT),
          },
        });

        if (paymentIntent.status === "succeeded") {
          await updateOriginalSession(stripe, session, {
            postPurchaseOfferClaimed: "true",
            postPurchasePaymentIntentId: paymentIntent.id,
          });
          return NextResponse.json({ success: true, paymentIntentId: paymentIntent.id });
        }

        if (paymentIntent.status === "requires_action" && paymentIntent.client_secret) {
          return NextResponse.json({
            requiresAction: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          });
        }
      } catch (directChargeError) {
        console.warn("Post-purchase direct charge unavailable:", directChargeError);
      }
    }

    const embeddedClientSecret = await createFallbackCheckout({
      stripe,
      req,
      originalSession: session,
      productId: product.id,
    });

    return NextResponse.json({
      requiresCheckout: true,
      embeddedClientSecret,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível processar a oferta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
