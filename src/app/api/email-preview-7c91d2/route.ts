import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_HASH = "58da6a9ab94ab8f348b0e23fecdf7855c6052d7201c77096cb182628275492bb";
const PREVIEW_EMAIL = "andremuseu@gmail.com";
const SITE = "https://www.brinqueteando.online";

function authorized(req: Request) {
  const supplied = new URL(req.url).searchParams.get("token") || "";
  const digest = createHash("sha256").update(supplied).digest("hex");
  const expected = Buffer.from(TOKEN_HASH, "hex");
  const received = Buffer.from(digest, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY ausente" }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const sampleVariables = {
    PRODUCT_NAME: "Dinossauro Pop-It Sensorial",
    PRODUCT_IMAGE: `${SITE}/products/catalog/14955519050094/01.webp`,
    RECOVERY_URL: `${SITE}/carrinho`,
    CART_TOTAL: "R$ 69,80",
  };

  const previews = [
    {
      key: "newsletter",
      template: { id: "brinqueteando-newsletter-01" },
    },
    {
      key: "carrinho",
      template: {
        id: "brinqueteando-cart-01",
        variables: sampleVariables,
      },
    },
    {
      key: "checkout",
      template: {
        id: "brinqueteando-checkout-01",
        variables: sampleVariables,
      },
    },
  ] as const;

  const sent: Array<{ key: string; id: string | null }> = [];

  for (const preview of previews) {
    const result = await resend.emails.send(
      {
        to: [PREVIEW_EMAIL],
        template: preview.template,
      },
      { idempotencyKey: `brinqueteando-preview-${preview.key}-2026-08-07-v1` },
    );

    if (result.error) {
      return NextResponse.json(
        { ok: false, failed: preview.key, error: result.error.message, sent },
        { status: 502 },
      );
    }

    sent.push({ key: preview.key, id: result.data?.id || null });
  }

  return NextResponse.json({ ok: true, to: PREVIEW_EMAIL, sent });
}
