import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONNECTOR_VERSION = "1.0.0";
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
        },
        orders: {
          provider: "stripe",
          outboundWebhook: true,
        },
        tracking: {
          inboundUpdates: true,
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
