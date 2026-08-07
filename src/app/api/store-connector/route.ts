import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONNECTOR_VERSION = "1.1.0";
const PROTOCOL_VERSION = "2026-08-01";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      connector: "open-store-connector",
      connectorVersion: CONNECTOR_VERSION,
      protocolVersion: PROTOCOL_VERSION,
      platform: {
        framework: "nextjs",
        deployment: "vercel",
      },
      capabilities: {
        health: true,
        catalog: {
          mode: "github-managed",
          supported: true,
          read: true,
          write: false,
          endpoint: "/api/store-connector/catalog",
        },
        orders: {
          provider: "stripe",
          outboundWebhook: false,
        },
        tracking: {
          inboundUpdates: false,
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
