import { ensureAnalyticsSchema, getAnalyticsSql, hasAnalyticsDatabase } from "@/lib/analytics-db";
import { products } from "@/data/products";

export type DashboardRange = 1 | 7 | 30 | 90;

export type MetricRow = { label: string; value: number; secondary?: number; extra?: string };

function n(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function s(value: unknown) {
  return String(value ?? "");
}

function productName(id: string, fallback = "") {
  return products.find((item) => item.id === id)?.name || fallback || id || "Produto";
}

export async function getDashboardData(days: DashboardRange) {
  if (!hasAnalyticsDatabase()) return { configured: false as const };
  await ensureAnalyticsSchema();
  const sql = getAnalyticsSql();
  if (!sql) return { configured: false as const };

  const range = Math.max(1, Math.min(90, days));
  const params = [range];
  const where = "NOW() - ($1::int * INTERVAL '1 day')";

  const [summaryRows, previousRows, funnelRows, sourcesRows, geoRows, pageRows, clickRows, productRows, deviceRows, browserRows, campaignRows, performanceRows, recentRows, errorRows, whatsappRows] = await Promise.all([
    sql.query(`
      SELECT
        COUNT(*)::int AS sessions,
        COUNT(DISTINCT visitor_id)::int AS visitors,
        COALESCE(SUM(page_views),0)::int AS pageviews,
        COALESCE(AVG(engaged_seconds),0)::numeric AS avg_engagement,
        COUNT(*) FILTER (WHERE page_views <= 1 AND engaged_seconds < 10)::int AS bounces
      FROM analytics_sessions
      WHERE started_at >= ${where}
    `, params),
    sql.query(`
      SELECT
        COUNT(*)::int AS sessions,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM analytics_sessions
      WHERE started_at >= NOW() - ($1::int * 2 * INTERVAL '1 day')
        AND started_at < NOW() - ($1::int * INTERVAL '1 day')
    `, params),
    sql.query(`
      SELECT
        COUNT(DISTINCT CASE WHEN event_name='page_view' THEN session_id END)::int AS visited,
        COUNT(DISTINCT CASE WHEN event_name='product_view' THEN session_id END)::int AS product_view,
        COUNT(DISTINCT CASE WHEN event_name='add_to_cart' THEN session_id END)::int AS add_to_cart,
        COUNT(DISTINCT CASE WHEN event_name='checkout_started' THEN session_id END)::int AS checkout_started,
        COUNT(DISTINCT CASE WHEN event_name='purchase' THEN session_id END)::int AS purchase,
        COALESCE(SUM(CASE WHEN event_name='purchase' THEN value_cents ELSE 0 END),0)::bigint AS revenue
      FROM analytics_events
      WHERE occurred_at >= ${where}
    `, params),
    sql.query(`
      SELECT source, medium, COUNT(*)::int AS sessions,
        COUNT(*) FILTER (WHERE converted)::int AS orders,
        COALESCE(SUM(revenue_cents),0)::bigint AS revenue
      FROM analytics_sessions
      WHERE started_at >= ${where}
      GROUP BY source, medium
      ORDER BY sessions DESC
      LIMIT 12
    `, params),
    sql.query(`
      SELECT region, city, COUNT(*)::int AS sessions,
        COUNT(*) FILTER (WHERE converted)::int AS orders,
        COALESCE(SUM(revenue_cents),0)::bigint AS revenue
      FROM analytics_sessions
      WHERE started_at >= ${where} AND (region <> '' OR city <> '')
      GROUP BY region, city
      ORDER BY sessions DESC
      LIMIT 20
    `, params),
    sql.query(`
      SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT session_id)::int AS sessions
      FROM analytics_events
      WHERE occurred_at >= ${where} AND event_name='page_view'
      GROUP BY path
      ORDER BY views DESC
      LIMIT 15
    `, params),
    sql.query(`
      SELECT COALESCE(NULLIF(label,''), NULLIF(target_url,''), '(sem rótulo)') AS label,
        target_url, COUNT(*)::int AS clicks
      FROM analytics_events
      WHERE occurred_at >= ${where} AND event_name IN ('click','whatsapp_click')
      GROUP BY COALESCE(NULLIF(label,''), NULLIF(target_url,''), '(sem rótulo)'), target_url
      ORDER BY clicks DESC
      LIMIT 15
    `, params),
    sql.query(`
      SELECT product_id,
        MAX(NULLIF(product_name,'')) AS product_name,
        COUNT(*) FILTER (WHERE event_name='product_view')::int AS views,
        COUNT(*) FILTER (WHERE event_name='add_to_cart')::int AS adds,
        COUNT(DISTINCT CASE WHEN event_name='add_to_cart' THEN session_id END)::int AS add_sessions
      FROM analytics_events
      WHERE occurred_at >= ${where} AND product_id <> '' AND event_name IN ('product_view','add_to_cart')
      GROUP BY product_id
      ORDER BY views DESC, adds DESC
      LIMIT 15
    `, params),
    sql.query(`
      SELECT device_type, COUNT(*)::int AS sessions,
        COUNT(*) FILTER (WHERE converted)::int AS orders
      FROM analytics_sessions
      WHERE started_at >= ${where}
      GROUP BY device_type
      ORDER BY sessions DESC
    `, params),
    sql.query(`
      SELECT browser, COUNT(*)::int AS sessions
      FROM analytics_sessions
      WHERE started_at >= ${where}
      GROUP BY browser
      ORDER BY sessions DESC
      LIMIT 8
    `, params),
    sql.query(`
      SELECT campaign, source, COUNT(*)::int AS sessions,
        COUNT(*) FILTER (WHERE converted)::int AS orders,
        COALESCE(SUM(revenue_cents),0)::bigint AS revenue
      FROM analytics_sessions
      WHERE started_at >= ${where} AND campaign <> ''
      GROUP BY campaign, source
      ORDER BY sessions DESC
      LIMIT 12
    `, params),
    sql.query(`
      SELECT
        COALESCE(AVG(NULLIF(properties->>'ttfbMs','')::numeric),0) AS ttfb,
        COALESCE(AVG(NULLIF(properties->>'domReadyMs','')::numeric),0) AS dom_ready,
        COALESCE(AVG(NULLIF(properties->>'loadMs','')::numeric),0) AS load_ms
      FROM analytics_events
      WHERE occurred_at >= ${where} AND event_name='performance'
    `, params),
    sql.query(`
      SELECT session_id, visitor_id, started_at, last_seen_at, landing_path, source, medium,
        city, region, device_type, browser, page_views, engaged_seconds, max_scroll,
        last_path, last_event, converted, revenue_cents
      FROM analytics_sessions
      WHERE started_at >= ${where}
      ORDER BY last_seen_at DESC
      LIMIT 30
    `, params),
    sql.query(`SELECT COUNT(*)::int AS total FROM analytics_events WHERE occurred_at >= ${where} AND event_name='client_error'`, params),
    sql.query(`SELECT COUNT(*)::int AS total FROM analytics_events WHERE occurred_at >= ${where} AND event_name='whatsapp_click'`, params),
  ]);

  const timelineRows = range <= 1
    ? await sql.query(`
        SELECT date_trunc('hour', occurred_at) AS bucket,
          COUNT(DISTINCT session_id)::int AS sessions,
          COUNT(*) FILTER (WHERE event_name='page_view')::int AS pageviews,
          COUNT(*) FILTER (WHERE event_name='purchase')::int AS orders,
          COALESCE(SUM(CASE WHEN event_name='purchase' THEN value_cents ELSE 0 END),0)::bigint AS revenue
        FROM analytics_events
        WHERE occurred_at >= ${where}
        GROUP BY bucket ORDER BY bucket ASC
      `, params)
    : await sql.query(`
        SELECT date_trunc('day', occurred_at) AS bucket,
          COUNT(DISTINCT session_id)::int AS sessions,
          COUNT(*) FILTER (WHERE event_name='page_view')::int AS pageviews,
          COUNT(*) FILTER (WHERE event_name='purchase')::int AS orders,
          COALESCE(SUM(CASE WHEN event_name='purchase' THEN value_cents ELSE 0 END),0)::bigint AS revenue
        FROM analytics_events
        WHERE occurred_at >= ${where}
        GROUP BY bucket ORDER BY bucket ASC
      `, params);

  const summary = summaryRows[0] || {};
  const previous = previousRows[0] || {};
  const funnel = funnelRows[0] || {};
  const sessions = n(summary.sessions);
  const visitors = n(summary.visitors);
  const pageviews = n(summary.pageviews);
  const orders = n(funnel.purchase);
  const revenue = n(funnel.revenue);
  const conversion = sessions ? (orders / sessions) * 100 : 0;
  const bounceRate = sessions ? (n(summary.bounces) / sessions) * 100 : 0;
  const aov = orders ? revenue / orders : 0;

  const sources = sourcesRows.map((row) => ({
    source: s(row.source), medium: s(row.medium), sessions: n(row.sessions), orders: n(row.orders), revenue: n(row.revenue),
    conversion: n(row.sessions) ? (n(row.orders) / n(row.sessions)) * 100 : 0,
  }));
  const geo = geoRows.map((row) => ({ region: s(row.region), city: s(row.city), sessions: n(row.sessions), orders: n(row.orders), revenue: n(row.revenue) }));
  const pages = pageRows.map((row) => ({ path: s(row.path), views: n(row.views), sessions: n(row.sessions) }));
  const clicks = clickRows.map((row) => ({ label: s(row.label), targetUrl: s(row.target_url), clicks: n(row.clicks) }));
  const productStats = productRows.map((row) => ({
    productId: s(row.product_id),
    name: productName(s(row.product_id), s(row.product_name)),
    views: n(row.views),
    adds: n(row.adds),
    addRate: n(row.views) ? (n(row.add_sessions) / n(row.views)) * 100 : 0,
  }));
  const devices = deviceRows.map((row) => ({
    label: s(row.device_type) || "unknown", value: n(row.sessions), secondary: n(row.orders),
  }));
  const browsers = browserRows.map((row) => ({ label: s(row.browser) || "unknown", value: n(row.sessions) }));
  const campaigns = campaignRows.map((row) => ({
    campaign: s(row.campaign), source: s(row.source), sessions: n(row.sessions), orders: n(row.orders), revenue: n(row.revenue),
  }));
  const performance = performanceRows[0] || {};
  const recent = recentRows.map((row) => ({
    sessionId: s(row.session_id), visitorId: s(row.visitor_id), startedAt: s(row.started_at), lastSeenAt: s(row.last_seen_at),
    landingPath: s(row.landing_path), source: s(row.source), medium: s(row.medium), city: s(row.city), region: s(row.region),
    deviceType: s(row.device_type), browser: s(row.browser), pageViews: n(row.page_views), engagedSeconds: n(row.engaged_seconds),
    maxScroll: n(row.max_scroll), lastPath: s(row.last_path), lastEvent: s(row.last_event), converted: Boolean(row.converted), revenue: n(row.revenue_cents),
  }));
  const timeline = timelineRows.map((row) => ({ bucket: s(row.bucket), sessions: n(row.sessions), pageviews: n(row.pageviews), orders: n(row.orders), revenue: n(row.revenue) }));

  const funnelSteps = [
    { label: "Visitou", value: n(funnel.visited) },
    { label: "Viu produto", value: n(funnel.product_view) },
    { label: "Adicionou", value: n(funnel.add_to_cart) },
    { label: "Checkout", value: n(funnel.checkout_started) },
    { label: "Comprou", value: orders },
  ];

  const drops = funnelSteps.slice(1).map((step, index) => {
    const previousStep = funnelSteps[index];
    return {
      from: previousStep.label,
      to: step.label,
      drop: previousStep.value ? ((previousStep.value - step.value) / previousStep.value) * 100 : 0,
    };
  });
  const biggestDrop = drops.sort((a, b) => b.drop - a.drop)[0];
  const qualifiedSources = sources.filter((item) => item.sessions >= 5).sort((a, b) => b.conversion - a.conversion);
  const topSource = qualifiedSources[0];
  const topGeo = geo[0];
  const mobile = devices.find((item) => item.label === "mobile");
  const mobileShare = sessions && mobile ? (mobile.value / sessions) * 100 : 0;
  const errors = n(errorRows[0]?.total);
  const whatsappClicks = n(whatsappRows[0]?.total);

  const insights: Array<{ tone: "good" | "warn" | "info"; title: string; text: string }> = [];
  if (biggestDrop?.drop > 0) insights.push({ tone: biggestDrop.drop >= 60 ? "warn" : "info", title: "Maior vazamento do funil", text: `${biggestDrop.from} → ${biggestDrop.to}: queda de ${biggestDrop.drop.toFixed(1)}%.` });
  if (topSource) insights.push({ tone: "good", title: "Origem mais eficiente", text: `${topSource.source} converte ${topSource.conversion.toFixed(1)}% em ${topSource.sessions} sessões.` });
  if (topGeo) insights.push({ tone: "info", title: "Praça com mais tráfego", text: `${topGeo.city || "Cidade não identificada"}${topGeo.region ? `/${topGeo.region}` : ""} lidera com ${topGeo.sessions} sessões.` });
  if (mobileShare >= 50) insights.push({ tone: "info", title: "Mobile domina a loja", text: `${mobileShare.toFixed(0)}% das sessões são mobile. Priorize cada decisão de UX para telas pequenas.` });
  if (whatsappClicks > 0) insights.push({ tone: "good", title: "WhatsApp gera intenção", text: `${whatsappClicks} cliques no atendimento durante o período.` });
  if (errors > 0) insights.push({ tone: "warn", title: "Erros no navegador detectados", text: `${errors} eventos de erro foram capturados. Vale abrir as jornadas recentes e localizar o contexto.` });

  return {
    configured: true as const,
    range,
    summary: {
      sessions, visitors, pageviews, orders, revenue, conversion, bounceRate, aov,
      avgEngagement: n(summary.avg_engagement),
      sessionsDelta: n(previous.sessions) ? ((sessions - n(previous.sessions)) / n(previous.sessions)) * 100 : 0,
      visitorsDelta: n(previous.visitors) ? ((visitors - n(previous.visitors)) / n(previous.visitors)) * 100 : 0,
      errors,
      whatsappClicks,
    },
    funnel: funnelSteps,
    sources,
    geo,
    pages,
    clicks,
    products: productStats,
    devices,
    browsers,
    campaigns,
    performance: { ttfb: n(performance.ttfb), domReady: n(performance.dom_ready), loadMs: n(performance.load_ms) },
    recent,
    timeline,
    insights,
  };
}

export async function getSessionJourney(sessionId: string) {
  if (!hasAnalyticsDatabase()) return null;
  await ensureAnalyticsSchema();
  const sql = getAnalyticsSql();
  if (!sql) return null;

  const sessions = await sql.query(`SELECT * FROM analytics_sessions WHERE session_id=$1 LIMIT 1`, [sessionId]);
  if (!sessions.length) return null;
  const events = await sql.query(`
    SELECT event_name, occurred_at, path, title, element, label, target_url, product_id, product_name,
      value_cents, quantity, x_pct, y_pct, properties
    FROM analytics_events
    WHERE session_id=$1
    ORDER BY occurred_at ASC
    LIMIT 500
  `, [sessionId]);

  return {
    session: sessions[0],
    events: events.map((row) => ({
      eventName: s(row.event_name), occurredAt: s(row.occurred_at), path: s(row.path), title: s(row.title),
      element: s(row.element), label: s(row.label), targetUrl: s(row.target_url), productId: s(row.product_id),
      productName: productName(s(row.product_id), s(row.product_name)), valueCents: n(row.value_cents), quantity: n(row.quantity),
      xPct: n(row.x_pct), yPct: n(row.y_pct), properties: row.properties || {},
    })),
  };
}
