import { neon } from "@neondatabase/serverless";

export type AnalyticsServerContext = {
  city: string;
  region: string;
  country: string;
  timezone: string;
  userAgent: string;
};

export type AnalyticsEventInput = {
  eventId: string;
  sessionId: string;
  visitorId: string;
  eventName: string;
  path: string;
  title?: string;
  landingPath?: string;
  landingQuery?: string;
  referrer?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  language?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  element?: string;
  label?: string;
  targetUrl?: string;
  productId?: string;
  productName?: string;
  valueCents?: number;
  quantity?: number;
  xPct?: number;
  yPct?: number;
  properties?: Record<string, unknown>;
};

const globalAnalytics = globalThis as typeof globalThis & {
  __btAnalyticsSchema?: Promise<boolean>;
};

export function analyticsDatabaseUrl() {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
}

export function hasAnalyticsDatabase() {
  return Boolean(analyticsDatabaseUrl());
}

export function getAnalyticsSql() {
  const url = analyticsDatabaseUrl();
  if (!url) return null;
  return neon(url);
}

export async function ensureAnalyticsSchema() {
  if (!hasAnalyticsDatabase()) return false;
  if (globalAnalytics.__btAnalyticsSchema) return globalAnalytics.__btAnalyticsSchema;

  globalAnalytics.__btAnalyticsSchema = (async () => {
    const sql = getAnalyticsSql();
    if (!sql) return false;

    await sql.query(`
      CREATE TABLE IF NOT EXISTS analytics_sessions (
        session_id TEXT PRIMARY KEY,
        visitor_id TEXT NOT NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        landing_path TEXT NOT NULL DEFAULT '/',
        landing_query TEXT NOT NULL DEFAULT '',
        referrer TEXT NOT NULL DEFAULT '',
        referrer_host TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT 'Direct',
        medium TEXT NOT NULL DEFAULT 'none',
        campaign TEXT NOT NULL DEFAULT '',
        term TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        city TEXT NOT NULL DEFAULT '',
        region TEXT NOT NULL DEFAULT '',
        country TEXT NOT NULL DEFAULT '',
        timezone TEXT NOT NULL DEFAULT '',
        device_type TEXT NOT NULL DEFAULT 'unknown',
        browser TEXT NOT NULL DEFAULT 'unknown',
        os TEXT NOT NULL DEFAULT 'unknown',
        language TEXT NOT NULL DEFAULT '',
        screen_width INTEGER,
        screen_height INTEGER,
        viewport_width INTEGER,
        viewport_height INTEGER,
        page_views INTEGER NOT NULL DEFAULT 0,
        event_count INTEGER NOT NULL DEFAULT 0,
        engaged_seconds INTEGER NOT NULL DEFAULT 0,
        max_scroll INTEGER NOT NULL DEFAULT 0,
        last_path TEXT NOT NULL DEFAULT '',
        last_event TEXT NOT NULL DEFAULT '',
        converted BOOLEAN NOT NULL DEFAULT FALSE,
        revenue_cents BIGINT NOT NULL DEFAULT 0,
        order_id TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id BIGSERIAL PRIMARY KEY,
        event_id TEXT NOT NULL UNIQUE,
        session_id TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        path TEXT NOT NULL DEFAULT '/',
        title TEXT NOT NULL DEFAULT '',
        element TEXT NOT NULL DEFAULT '',
        label TEXT NOT NULL DEFAULT '',
        target_url TEXT NOT NULL DEFAULT '',
        product_id TEXT NOT NULL DEFAULT '',
        product_name TEXT NOT NULL DEFAULT '',
        value_cents BIGINT NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 0,
        x_pct NUMERIC(6,2),
        y_pct NUMERIC(6,2),
        properties JSONB NOT NULL DEFAULT '{}'::jsonb
      )
    `);

    await Promise.all([
      sql.query("CREATE INDEX IF NOT EXISTS analytics_sessions_started_idx ON analytics_sessions(started_at DESC)"),
      sql.query("CREATE INDEX IF NOT EXISTS analytics_sessions_source_idx ON analytics_sessions(source, started_at DESC)"),
      sql.query("CREATE INDEX IF NOT EXISTS analytics_sessions_geo_idx ON analytics_sessions(region, city, started_at DESC)"),
      sql.query("CREATE INDEX IF NOT EXISTS analytics_events_time_idx ON analytics_events(occurred_at DESC)"),
      sql.query("CREATE INDEX IF NOT EXISTS analytics_events_name_idx ON analytics_events(event_name, occurred_at DESC)"),
      sql.query("CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON analytics_events(session_id, occurred_at ASC)"),
      sql.query("CREATE INDEX IF NOT EXISTS analytics_events_product_idx ON analytics_events(product_id, occurred_at DESC)"),
      sql.query("CREATE INDEX IF NOT EXISTS analytics_events_path_idx ON analytics_events(path, occurred_at DESC)"),
    ]);

    return true;
  })().catch((error) => {
    globalAnalytics.__btAnalyticsSchema = undefined;
    throw error;
  });

  return globalAnalytics.__btAnalyticsSchema;
}

function safeUrlHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function classifyAcquisition(input: {
  referrer?: string;
  source?: string;
  medium?: string;
  landingQuery?: string;
}) {
  const query = new URLSearchParams((input.landingQuery || "").replace(/^\?/, ""));
  const utmSource = (input.source || query.get("utm_source") || "").trim();
  const utmMedium = (input.medium || query.get("utm_medium") || "").trim();
  const gclid = query.get("gclid");
  const fbclid = query.get("fbclid");
  const ttclid = query.get("ttclid");

  if (utmSource) {
    return {
      source: utmSource,
      medium: utmMedium || "campaign",
      referrerHost: safeUrlHost(input.referrer || ""),
    };
  }
  if (gclid) return { source: "Google Ads", medium: "paid", referrerHost: safeUrlHost(input.referrer || "") };
  if (fbclid) return { source: "Meta Ads", medium: "paid", referrerHost: safeUrlHost(input.referrer || "") };
  if (ttclid) return { source: "TikTok Ads", medium: "paid", referrerHost: safeUrlHost(input.referrer || "") };

  const host = safeUrlHost(input.referrer || "");
  if (!host) return { source: "Direct", medium: "none", referrerHost: "" };
  if (/google\./.test(host)) return { source: "Google", medium: "organic", referrerHost: host };
  if (/bing\./.test(host)) return { source: "Bing", medium: "organic", referrerHost: host };
  if (/instagram\./.test(host)) return { source: "Instagram", medium: "social", referrerHost: host };
  if (/facebook\.|fb\.com/.test(host)) return { source: "Facebook", medium: "social", referrerHost: host };
  if (/tiktok\./.test(host)) return { source: "TikTok", medium: "social", referrerHost: host };
  if (/youtube\.|youtu\.be/.test(host)) return { source: "YouTube", medium: "social", referrerHost: host };
  if (/pinterest\./.test(host)) return { source: "Pinterest", medium: "social", referrerHost: host };
  if (/brinqueteando\.online$/.test(host)) return { source: "Internal", medium: "internal", referrerHost: host };
  return { source: host, medium: "referral", referrerHost: host };
}

export async function recordAnalyticsEvent(input: AnalyticsEventInput, context: AnalyticsServerContext) {
  if (!(await ensureAnalyticsSchema())) return { configured: false, inserted: false };
  const sql = getAnalyticsSql();
  if (!sql) return { configured: false, inserted: false };

  const acquisition = classifyAcquisition(input);
  const query = new URLSearchParams((input.landingQuery || "").replace(/^\?/, ""));
  const campaign = (input.campaign || query.get("utm_campaign") || "").slice(0, 240);
  const term = (input.term || query.get("utm_term") || "").slice(0, 240);
  const content = (input.content || query.get("utm_content") || "").slice(0, 240);
  const properties = JSON.stringify(input.properties || {});

  await sql.query(
    `INSERT INTO analytics_sessions (
      session_id, visitor_id, landing_path, landing_query, referrer, referrer_host,
      source, medium, campaign, term, content, city, region, country, timezone,
      device_type, browser, os, language, screen_width, screen_height, viewport_width,
      viewport_height, last_path, last_event
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
    ) ON CONFLICT (session_id) DO UPDATE SET
      last_seen_at = NOW(),
      city = CASE WHEN analytics_sessions.city = '' THEN EXCLUDED.city ELSE analytics_sessions.city END,
      region = CASE WHEN analytics_sessions.region = '' THEN EXCLUDED.region ELSE analytics_sessions.region END,
      country = CASE WHEN analytics_sessions.country = '' THEN EXCLUDED.country ELSE analytics_sessions.country END,
      timezone = CASE WHEN analytics_sessions.timezone = '' THEN EXCLUDED.timezone ELSE analytics_sessions.timezone END,
      device_type = EXCLUDED.device_type,
      browser = EXCLUDED.browser,
      os = EXCLUDED.os,
      language = EXCLUDED.language,
      screen_width = EXCLUDED.screen_width,
      screen_height = EXCLUDED.screen_height,
      viewport_width = EXCLUDED.viewport_width,
      viewport_height = EXCLUDED.viewport_height,
      last_path = EXCLUDED.last_path,
      last_event = EXCLUDED.last_event,
      updated_at = NOW()`,
    [
      input.sessionId,
      input.visitorId,
      input.landingPath || input.path || "/",
      input.landingQuery || "",
      (input.referrer || "").slice(0, 1500),
      acquisition.referrerHost,
      acquisition.source.slice(0, 120),
      acquisition.medium.slice(0, 120),
      campaign,
      term,
      content,
      context.city.slice(0, 160),
      context.region.slice(0, 80),
      context.country.slice(0, 8),
      context.timezone.slice(0, 120),
      (input.deviceType || "unknown").slice(0, 40),
      (input.browser || "unknown").slice(0, 80),
      (input.os || "unknown").slice(0, 80),
      (input.language || "").slice(0, 40),
      Number.isFinite(input.screenWidth) ? Math.round(input.screenWidth || 0) : null,
      Number.isFinite(input.screenHeight) ? Math.round(input.screenHeight || 0) : null,
      Number.isFinite(input.viewportWidth) ? Math.round(input.viewportWidth || 0) : null,
      Number.isFinite(input.viewportHeight) ? Math.round(input.viewportHeight || 0) : null,
      (input.path || "/").slice(0, 1000),
      input.eventName.slice(0, 80),
    ],
  );

  const inserted = await sql.query(
    `INSERT INTO analytics_events (
      event_id, session_id, visitor_id, event_name, path, title, element, label,
      target_url, product_id, product_name, value_cents, quantity, x_pct, y_pct, properties
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb)
    ON CONFLICT (event_id) DO NOTHING
    RETURNING id`,
    [
      input.eventId,
      input.sessionId,
      input.visitorId,
      input.eventName.slice(0, 80),
      (input.path || "/").slice(0, 1000),
      (input.title || "").slice(0, 500),
      (input.element || "").slice(0, 80),
      (input.label || "").slice(0, 500),
      (input.targetUrl || "").slice(0, 1500),
      (input.productId || "").slice(0, 120),
      (input.productName || "").slice(0, 500),
      Math.max(0, Math.round(input.valueCents || 0)),
      Math.max(0, Math.round(input.quantity || 0)),
      Number.isFinite(input.xPct) ? input.xPct : null,
      Number.isFinite(input.yPct) ? input.yPct : null,
      properties,
    ],
  );

  if (!inserted.length) return { configured: true, inserted: false };

  const duration = Math.max(0, Math.min(3600, Number(input.properties?.durationSeconds || 0)));
  const scroll = Math.max(0, Math.min(100, Number(input.properties?.maxScroll || 0)));
  const isPageView = input.eventName === "page_view" ? 1 : 0;

  await sql.query(
    `UPDATE analytics_sessions SET
      last_seen_at = NOW(),
      page_views = page_views + $2,
      event_count = event_count + 1,
      engaged_seconds = engaged_seconds + $3,
      max_scroll = GREATEST(max_scroll, $4),
      last_path = $5,
      last_event = $6,
      updated_at = NOW()
    WHERE session_id = $1`,
    [input.sessionId, isPageView, Math.round(duration), Math.round(scroll), input.path || "/", input.eventName],
  );

  return { configured: true, inserted: true };
}

export async function recordAnalyticsPurchase(input: {
  eventId: string;
  sessionId: string;
  visitorId: string;
  orderId: string;
  revenueCents: number;
  cart?: string;
}) {
  if (!(await ensureAnalyticsSchema())) return false;
  const sql = getAnalyticsSql();
  if (!sql) return false;

  const sessionId = input.sessionId || `stripe:${input.orderId}`;
  const visitorId = input.visitorId || `stripe:${input.orderId}`;

  await sql.query(
    `INSERT INTO analytics_sessions (
      session_id, visitor_id, landing_path, source, medium, last_path, last_event, converted, revenue_cents, order_id
    ) VALUES ($1,$2,'/','Unknown','unknown','/sucesso','purchase',TRUE,$3,$4)
    ON CONFLICT (session_id) DO UPDATE SET
      converted = TRUE,
      revenue_cents = GREATEST(analytics_sessions.revenue_cents, EXCLUDED.revenue_cents),
      order_id = EXCLUDED.order_id,
      last_event = 'purchase',
      last_path = '/sucesso',
      last_seen_at = NOW(),
      updated_at = NOW()`,
    [sessionId, visitorId, Math.max(0, Math.round(input.revenueCents)), input.orderId],
  );

  await sql.query(
    `INSERT INTO analytics_events (
      event_id, session_id, visitor_id, event_name, path, value_cents, properties
    ) VALUES ($1,$2,$3,'purchase','/sucesso',$4,$5::jsonb)
    ON CONFLICT (event_id) DO NOTHING`,
    [
      input.eventId,
      sessionId,
      visitorId,
      Math.max(0, Math.round(input.revenueCents)),
      JSON.stringify({ orderId: input.orderId, cart: input.cart || "" }),
    ],
  );

  return true;
}
