import { NextResponse } from "next/server";
import { quoteShipping } from "@/lib/shipping-server";
import type { CartLine } from "@/lib/commerce";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as {
      cep?: unknown;
      cart?: CartLine[];
    };

    if (typeof payload.cep !== "string") {
      return NextResponse.json({ error: "Informe o CEP para calcular o frete." }, { status: 400 });
    }

    if (!Array.isArray(payload.cart) || payload.cart.length === 0) {
      return NextResponse.json({ error: "Adicione ao menos um produto para calcular o frete." }, { status: 400 });
    }

    const quote = await quoteShipping(payload.cep, payload.cart);
    return NextResponse.json(quote, {
      headers: { "Cache-Control": "private, max-age=120" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível calcular o frete.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
