import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  formatMoney,
  normalizeCart,
  serializeCart,
  type CartLine,
} from "@/lib/commerce";
import { verifyMarketingToken } from "@/lib/marketing-token";

export const runtime = "nodejs";

type Payload = { cart?: CartLine[] };

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ ok: true, tracked: false });

    const cookieStore = await cookies();
    const email = cookieStore.get("bt_marketing_email")?.value || "";
    const token = cookieStore.get("bt_marketing_token")?.value || "";
    if (!email || !verifyMarketingToken(token, email)) {
      return NextResponse.json({ ok: true, tracked: false, reason: "no_consent" });
    }

    const payload = (await req.json()) as Payload;
    if (!Array.isArray(payload.cart) || payload.cart.length === 0) {
      return NextResponse.json({ ok: true, tracked: false });
    }

    const normalized = normalizeCart(payload.cart);
    const serialized = serializeCart(payload.cart);
    const subtotal = normalized.reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    );
    const first = normalized[0].product;
    const origin = new URL(req.url).origin;
    const recoveryUrl = `${origin}/carrinho?restore=${encodeURIComponent(serialized)}`;
    const productImage = new URL(first.image, origin).toString();
    const productUrl = `${origin}/produto/${first.id}`;

    const resend = new Resend(apiKey);
    const result = await resend.events.send({
      event: "cart.recovery_started",
      email,
      payload: {
        productName: first.name,
        productImage,
        productUrl,
        recoveryUrl,
        cartTotal: formatMoney(subtotal),
      },
    });

    if (result.error) {
      console.error("Cart recovery event:", result.error);
      return NextResponse.json({ ok: true, tracked: false });
    }

    return NextResponse.json({ ok: true, tracked: true });
  } catch (error) {
    console.error("Cart recovery route:", error);
    return NextResponse.json({ ok: true, tracked: false });
  }
}
