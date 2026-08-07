"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { analyticsConsentGranted, trackAnalytics } from "@/lib/analytics-client";

function cleanLabel(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 240);
}

function targetLabel(target: HTMLElement) {
  return cleanLabel(
    target.getAttribute("aria-label") ||
      target.getAttribute("title") ||
      target.textContent ||
      "",
  );
}

function scrollPercent() {
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  return Math.max(0, Math.min(100, Math.round((window.scrollY / max) * 100)));
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const pageStartedAt = useRef(Date.now());
  const maxScroll = useRef(0);
  const thresholdsSent = useRef(new Set<number>());
  const lastClicks = useRef<Array<{ at: number; x: number; y: number }>>([]);

  useEffect(() => {
    function trackCurrentPage() {
      if (!analyticsConsentGranted() || pathname.startsWith("/dashboard")) return;
      pageStartedAt.current = Date.now();
      maxScroll.current = scrollPercent();
      thresholdsSent.current = new Set();
      trackAnalytics("page_view");
      if (pathname.startsWith("/produto/")) trackAnalytics("product_view");
      if (pathname === "/carrinho") trackAnalytics("cart_view");
      if (pathname.startsWith("/checkout")) trackAnalytics("checkout_started");
    }

    trackCurrentPage();
    const consentHandler = () => trackCurrentPage();
    window.addEventListener("bt:cookie-consent", consentHandler);
    return () => window.removeEventListener("bt:cookie-consent", consentHandler);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      if (!analyticsConsentGranted()) return;
      const value = scrollPercent();
      maxScroll.current = Math.max(maxScroll.current, value);
      for (const threshold of [50, 90]) {
        if (value >= threshold && !thresholdsSent.current.has(threshold)) {
          thresholdsSent.current.add(threshold);
          trackAnalytics("scroll_depth", { properties: { threshold } });
        }
      }
    }

    function onClick(event: MouseEvent) {
      if (!analyticsConsentGranted()) return;
      const node = event.target instanceof Element ? event.target.closest("a,button,[role='button']") : null;
      if (!(node instanceof HTMLElement)) return;

      const anchor = node instanceof HTMLAnchorElement ? node : node.closest("a");
      const href = anchor?.href || "";
      const label = targetLabel(node);
      const element = node.tagName.toLowerCase();
      const docHeight = Math.max(document.documentElement.scrollHeight, 1);
      const xPct = Math.round((event.clientX / Math.max(window.innerWidth, 1)) * 10000) / 100;
      const yPct = Math.round(((window.scrollY + event.clientY) / docHeight) * 10000) / 100;
      const explicitAction = node.dataset.analyticsAction || node.closest<HTMLElement>("[data-analytics-action]")?.dataset.analyticsAction || "";
      const productId = node.dataset.analyticsProductId || node.closest<HTMLElement>("[data-analytics-product-id]")?.dataset.analyticsProductId || "";
      const productName = node.dataset.analyticsProductName || node.closest<HTMLElement>("[data-analytics-product-name]")?.dataset.analyticsProductName || "";
      const isWhatsapp = /wa\.link|whatsapp\.com|w\.app/i.test(href) || explicitAction === "whatsapp";

      trackAnalytics(isWhatsapp ? "whatsapp_click" : "click", {
        element,
        label,
        targetUrl: href,
        productId,
        productName,
        xPct,
        yPct,
        properties: explicitAction ? { action: explicitAction } : {},
      });

      const now = Date.now();
      const recent = lastClicks.current.filter((item) => now - item.at < 1400);
      recent.push({ at: now, x: event.clientX, y: event.clientY });
      lastClicks.current = recent;
      if (recent.length >= 3) {
        const tail = recent.slice(-3);
        const close = tail.every((item) => Math.hypot(item.x - tail[0].x, item.y - tail[0].y) < 55);
        if (close) {
          trackAnalytics("rage_click", { element, label, targetUrl: href, xPct, yPct });
          lastClicks.current = [];
        }
      }
    }

    function onError(event: ErrorEvent) {
      trackAnalytics("client_error", {
        label: cleanLabel(event.message || "Erro JavaScript"),
        properties: {
          filename: (event.filename || "").slice(0, 300),
          line: event.lineno || 0,
          column: event.colno || 0,
        },
      });
    }

    function onUnhandled(event: PromiseRejectionEvent) {
      const message = event.reason instanceof Error ? event.reason.message : String(event.reason || "Promise rejeitada");
      trackAnalytics("client_error", { label: cleanLabel(message) });
    }

    function sendEngagement() {
      if (!analyticsConsentGranted()) return;
      const durationSeconds = Math.min(1800, Math.max(0, Math.round((Date.now() - pageStartedAt.current) / 1000)));
      if (durationSeconds < 1) return;
      trackAnalytics(
        "page_engagement",
        { properties: { durationSeconds, maxScroll: maxScroll.current } },
        true,
      );
      pageStartedAt.current = Date.now();
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") sendEngagement();
      else pageStartedAt.current = Date.now();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandled);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendEngagement);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandled);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendEngagement);
      sendEngagement();
    };
  }, []);

  useEffect(() => {
    if (!analyticsConsentGranted()) return;
    const timer = window.setTimeout(() => {
      try {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if (!nav) return;
        trackAnalytics("performance", {
          properties: {
            ttfbMs: Math.max(0, Math.round(nav.responseStart - nav.requestStart)),
            domReadyMs: Math.max(0, Math.round(nav.domContentLoadedEventEnd - nav.startTime)),
            loadMs: Math.max(0, Math.round(nav.loadEventEnd - nav.startTime)),
            transferBytes: Math.max(0, Math.round(nav.transferSize || 0)),
          },
        });
      } catch {
        // Sem impacto na navegação.
      }
    }, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
