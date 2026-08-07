import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  formatMoney,
  normalizeCart,
  serializeCart,
  type CartLine,
} from "@/lib/commerce";
import { createMarketingToken } from "@/lib/marketing-token";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  email?: unknown;
  consent?: unknown;
  cart?: CartLine[];
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Payload;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    if (payload.consent !== true) {
      return NextResponse.json(
        { error: "Confirme que deseja receber os lembretes desta compra." },
        { status: 400 },
      );
    }
    if (!Array.isArray(payload.cart) || payload.cart.length === 0) {
      return NextResponse.json({ error: "Seu carrinho está vazio." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "Serviço temporariamente indisponível." }, { status: 503 });
    }

    const normalized = normalizeCart(payload.cart);
    const serialized = serializeCart(payload.cart);
    const subtotal = normalized.reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    );
    const first = normalized[0].product;
    const origin = new URL(req.url).origin;
    const resend = new Resend(apiKey);

    const result = await resend.events.send({
      event: "cart.recovery_started",
      email,
      payload: {
        productName: first.name,
        productImage: new URL(first.image, origin).toString(),
        productUrl: `${origin}/produto/${first.id}`,
        recoveryUrl: `${origin}/carrinho?restore=${encodeURIComponent(serialized)}`,
        cartTotal: formatMoney(subtotal),
      },
    });

    if (result.error) {
      console.error("Recovery consent event:", result.error);
      return NextResponse.json(
        { error: "Não foi possível ativar os lembretes agora." },
        { status: 502 },
      );
    }

    const token = createMarketingToken(email);
    const response = NextResponse.json({
      ok: true,
      message: "Pronto. Se a compra ficar pendente, podemos lembrar você por e-mail. Você pode cancelar a qualquer momento.",
    });

    if (token) {
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
      };
      response.cookies.set("bt_marketing_email", email, options);
      response.cookies.set("bt_marketing_token", token, options);
    }

    return response;
  } catch (error) {
    console.error("Recovery consent:", error);
    return NextResponse.json(
      { error: "Não foi possível ativar os lembretes agora." },
      { status: 500 },
    );
  }
}
