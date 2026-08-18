import { NextResponse } from "next/server";
import { products } from "@/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONNECTOR_VERSION = "1.2.0";
const PROTOCOL_VERSION = "2026-08-01";

export async function GET() {
  const categories = Array.from(
    new Set(
      products
        .map((product) => product.category?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  )
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((name) => ({
      id: name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      name,
      slug: name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));

  return NextResponse.json(
    {
      ok: true,
      connector: "open-store-connector",
      connectorVersion: CONNECTOR_VERSION,
      protocolVersion: PROTOCOL_VERSION,
      store: {
        name: "Brinqueteando",
        niche: "brinquedos educativos e recursos de brincar",
        brand: {
          primaryColor: "#092647",
          secondaryColor: "#a14d2d",
          accentColor: "#ca936d",
          backgroundColor: "#fdf9f6",
          surfaceColor: "#f2e6de",
          textColor: "#092647",
          mutedTextColor: "#435367",
          borderColor: "#c0bdbf",
          visualStyle: "premium playful clean",
          typography: {
            body: "Inter / system sans-serif",
            display: "Georgia / Times New Roman",
          },
        },
        categories,
        capabilities: {
          variants: true,
          variantPricing: true,
          inventoryByVariant: true,
          seo: true,
          editorialAssets: true,
          previewPublication: true,
          githubManagedCatalog: true,
          inventorySync: {
            endpointPath: "/api/store-connector/inventory",
            authToken: process.env.STORE_CONNECTOR_SYNC_TOKEN || "",
          },
          trackingSync: {
            endpointPath: "/api/store-connector/tracking",
            authToken: process.env.STORE_CONNECTOR_SYNC_TOKEN || "",
          },
        },
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
