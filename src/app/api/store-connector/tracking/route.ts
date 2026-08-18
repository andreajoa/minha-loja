import { NextResponse } from "next/server";

import { setTracking, type TrackingUpdate } from "@/lib/inventory-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const token = process.env.STORE_CONNECTOR_SYNC_TOKEN?.trim();
  if (!token) return false;

  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() === token;
}

function isValidPayload(body: unknown): body is TrackingUpdate {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const obj = body as Record<string, unknown>;

  if (typeof obj.syncedAt !== "string") return false;
  if (typeof obj.externalOrderId !== "string") return false;
  if (typeof obj.trackingCode !== "string") return false;
  if (typeof obj.status !== "string") return false;
  if (obj.status !== "SHIPPED" && obj.status !== "DELIVERED") return false;

  return true;
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
      { ok: false, error: "Invalid tracking payload" },
      { status: 400 },
    );
  }

  setTracking(body);

  console.log(
    `[Store Connector] Tracking updated for order ${body.externalOrderId}: ${body.trackingCode} (${body.status})`,
  );

  return NextResponse.json(
    {
      ok: true,
      connector: "open-store-connector",
      received: {
        externalOrderId: body.externalOrderId,
        trackingCode: body.trackingCode,
        status: body.status,
        syncedAt: body.syncedAt,
      },
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
