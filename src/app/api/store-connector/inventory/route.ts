import { NextResponse } from "next/server";

import { setInventory, type InventoryUpdate } from "@/lib/inventory-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const token = process.env.STORE_CONNECTOR_SYNC_TOKEN?.trim();
  if (!token) return false;

  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() === token;
}

function isValidPayload(body: unknown): body is InventoryUpdate {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const obj = body as Record<string, unknown>;

  if (typeof obj.syncedAt !== "string") return false;
  if (typeof obj.sourceProductId !== "string") return false;
  if (!Array.isArray(obj.variants)) return false;

  return obj.variants.every(
    (v: unknown) =>
      v &&
      typeof v === "object" &&
      typeof (v as Record<string, unknown>).sourceSkuId === "string" &&
      typeof (v as Record<string, unknown>).stock === "number" &&
      typeof (v as Record<string, unknown>).available === "boolean",
  );
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { ok: false, error: "Invalid inventory payload" },
      { status: 400 },
    );
  }

  setInventory(body);

  console.log(
    `[Store Connector] Inventory updated for product ${body.sourceProductId}: ${body.variants.length} variants`,
  );

  return NextResponse.json(
    {
      ok: true,
      connector: "open-store-connector",
      received: {
        sourceProductId: body.sourceProductId,
        variantCount: body.variants.length,
        syncedAt: body.syncedAt,
      },
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
