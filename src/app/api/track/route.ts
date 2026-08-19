import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const DATA_DIR = join(process.cwd(), ".data");
const EVENTS_FILE = join(DATA_DIR, "events.json");
const MAX_EVENTS = 5000;

type TrackEvent = {
  type: string;
  path: string;
  referrer: string;
  userAgent: string;
  timestamp: string;
  ip: string;
  country?: string;
};

async function readEvents(): Promise<TrackEvent[]> {
  try {
    const raw = await readFile(EVENTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeEvents(events: TrackEvent[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(EVENTS_FILE, JSON.stringify(events), "utf-8");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { type?: string; path?: string; referrer?: string };
    const events = await readEvents();

    const event: TrackEvent = {
      type: String(body.type || "pageview"),
      path: String(body.path || "/"),
      referrer: String(body.referrer || ""),
      userAgent: req.headers.get("user-agent") || "",
      timestamp: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "",
      country: req.headers.get("x-vercel-ip-country") || undefined,
    };

    events.unshift(event);
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;

    await writeEvents(events);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (key !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const events = await readEvents();
  return NextResponse.json({ events });
}
