import { NextResponse } from "next/server";
import { recordAnalyticsEvent, type AnalyticsEventInput } from "@/lib/analytics-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENT_RE = /^[a-z0-9_.-]{2,80}$/i;
const ID_RE = /^[a-zA-Z0-9:_-]{8,120}$/;
const BOT_RE = /bot|crawler|spider|crawling|headless|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|googleother/i;

function decodeHeader(value: string | null) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function sameSite(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const requestHost = new URL(req.url).hostname;
    const originHost = new URL(origin).hostname;
    return originHost === requestHost || originHost.endsWith(".brinqueteando.online") || originHost.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function sanitizePayload(value: unknown): AnalyticsEventInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const eventId = typeof input.eventId === "string" ? input.eventId : "";
  const sessionId = typeof input.sessionId === "string" ? input.sessionId : "";
  const visitorId = typeof input.visitorId === "string" ? input.visitorId : "";
  const eventName = typeof input.eventName === "string" ? input.eventName : "";
  const path = typeof input.path === "string" ? input.path : "/";
  if (!ID_RE.test(eventId) || !ID_RE.test(sessionId) || !ID_RE.test(visitorId) || !EVENT_RE.test(eventName)) return null;

  const string = (key: string, max = 1000) => typeof input[key] === "string" ? String(input[key]).slice(0, max) : "";
  const number = (key: string) => typeof input[key] === "number" && Number.isFinite(input[key]) ? Number(input[key]) : undefined;
  const properties = input.properties && typeof input.properties === "object" && !Array.isArray(input.properties)
    ? (input.properties as Record<string, unknown>)
    : {};

  return {
    eventId,
    sessionId,
    visitorId,
    eventName,
    path: path.slice(0, 1000),
    title: string("title", 500),
    landingPath: string("landingPath", 1000),
    landingQuery: string("landingQuery", 1500),
    referrer: string("referrer", 1500),
    source: string("source", 120),
    medium: string("medium", 120),
    campaign: string("campaign", 240),
    term: string("term", 240),
    content: string("content", 240),
    deviceType: string("deviceType", 40),
    browser: string("browser", 80),
    os: string("os", 80),
    language: string("language", 40),
    screenWidth: number("screenWidth"),
    screenHeight: number("screenHeight"),
    viewportWidth: number("viewportWidth"),
    viewportHeight: number("viewportHeight"),
    element: string("element", 80),
    label: string("label", 500),
    targetUrl: string("targetUrl", 1500),
    productId: string("productId", 120),
    productName: string("productName", 500),
    valueCents: number("valueCents"),
    quantity: number("quantity"),
    xPct: number("xPct"),
    yPct: number("yPct"),
    properties,
  };
}

export async function POST(req: Request) {
  try {
    if (!sameSite(req)) return NextResponse.json({ ok: false }, { status: 403 });
    const length = Number(req.headers.get("content-length") || 0);
    if (length > 48_000) return NextResponse.json({ ok: false }, { status: 413 });

    const userAgent = req.headers.get("user-agent") || "";
    if (BOT_RE.test(userAgent)) return new NextResponse(null, { status: 204 });

    const payload = sanitizePayload(await req.json());
    if (!payload) return NextResponse.json({ ok: false }, { status: 400 });

    const result = await recordAnalyticsEvent(payload, {
      city: decodeHeader(req.headers.get("x-vercel-ip-city")),
      region: decodeHeader(req.headers.get("x-vercel-ip-country-region")),
      country: decodeHeader(req.headers.get("x-vercel-ip-country")),
      timezone: decodeHeader(req.headers.get("x-vercel-ip-timezone")),
      userAgent,
    });

    return NextResponse.json({ ok: true, configured: result.configured }, { status: result.configured ? 200 : 202 });
  } catch (error) {
    console.error("Analytics event error:", error);
    return NextResponse.json({ ok: true }, { status: 202 });
  }
}
