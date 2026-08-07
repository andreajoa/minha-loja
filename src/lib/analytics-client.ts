"use client";

type SessionState = {
  id: string;
  startedAt: number;
  lastSeen: number;
  landingPath: string;
  landingQuery: string;
  referrer: string;
};

export type TrackDetails = {
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

const VISITOR_KEY = "bt_analytics_visitor_v1";
const SESSION_KEY = "bt_analytics_session_v1";
const SESSION_TIMEOUT = 30 * 60 * 1000;

function uuid() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }
}

function setIdCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
}

export function analyticsConsentGranted() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("cookie-consent") === "true";
}

function getVisitorId() {
  let id = window.localStorage.getItem(VISITOR_KEY) || "";
  if (!id) {
    id = uuid();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  setIdCookie("bt_analytics_visitor", id, 60 * 60 * 24 * 365);
  return id;
}

function getSessionState(): SessionState {
  const now = Date.now();
  let current: SessionState | null = null;
  try {
    current = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null") as SessionState | null;
  } catch {
    current = null;
  }

  if (!current?.id || now - Number(current.lastSeen || 0) > SESSION_TIMEOUT) {
    current = {
      id: uuid(),
      startedAt: now,
      lastSeen: now,
      landingPath: window.location.pathname || "/",
      landingQuery: window.location.search || "",
      referrer: document.referrer || "",
    };
  } else {
    current.lastSeen = now;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(current));
  setIdCookie("bt_analytics_session", current.id, 60 * 30);
  return current;
}

function detectDeviceType() {
  const ua = navigator.userAgent || "";
  const width = window.innerWidth;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (width >= 600 && width < 1024 && navigator.maxTouchPoints > 1)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua) || width < 600) return "mobile";
  return "desktop";
}

function detectBrowser() {
  const ua = navigator.userAgent || "";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/CriOS\//.test(ua)) return "Chrome iOS";
  if (/FxiOS\//.test(ua)) return "Firefox iOS";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return "Safari";
  return "Other";
}

function detectOs() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS/iPadOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

function parseProductId(path: string) {
  const match = path.match(/^\/produto\/([^/?#]+)/);
  return match?.[1] || "";
}

export function getAnalyticsIdentity() {
  if (typeof window === "undefined" || !analyticsConsentGranted()) {
    return { sessionId: "", visitorId: "" };
  }
  const session = getSessionState();
  return { sessionId: session.id, visitorId: getVisitorId() };
}

function buildPayload(eventName: string, details: TrackDetails = {}) {
  const session = getSessionState();
  const path = window.location.pathname || "/";
  const query = new URLSearchParams(session.landingQuery.replace(/^\?/, ""));

  return {
    eventId: uuid(),
    sessionId: session.id,
    visitorId: getVisitorId(),
    eventName,
    path,
    title: document.title || "",
    landingPath: session.landingPath,
    landingQuery: session.landingQuery,
    referrer: session.referrer,
    source: query.get("utm_source") || "",
    medium: query.get("utm_medium") || "",
    campaign: query.get("utm_campaign") || "",
    term: query.get("utm_term") || "",
    content: query.get("utm_content") || "",
    deviceType: detectDeviceType(),
    browser: detectBrowser(),
    os: detectOs(),
    language: navigator.language || "",
    screenWidth: window.screen?.width || 0,
    screenHeight: window.screen?.height || 0,
    viewportWidth: window.innerWidth || 0,
    viewportHeight: window.innerHeight || 0,
    productId: details.productId || parseProductId(path),
    ...details,
  };
}

export function trackAnalytics(eventName: string, details: TrackDetails = {}, useBeacon = false) {
  if (typeof window === "undefined" || !analyticsConsentGranted()) return;
  const payload = buildPayload(eventName, details);
  const body = JSON.stringify(payload);

  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/event", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => undefined);
  } catch {
    // Analytics nunca pode interromper a experiência da loja.
  }
}
