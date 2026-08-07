import { NextResponse } from "next/server";
import { products } from "@/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    gallery: product.gallery ?? [product.image],
    variants: product.variants ?? [],
    category: product.category,
    stock: product.stock,
    ageRange: product.ageRange,
    benefits: product.benefits,
    shipping: product.shipping,
  }));

  return NextResponse.json(
    {
      ok: true,
      connector: "open-store-connector",
      protocolVersion: "2026-08-01",
      catalog: {
        currency: "BRL",
        priceUnit: "centavos",
        count: catalog.length,
        products: catalog,
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
