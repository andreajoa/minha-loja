import { Resend } from "resend";
import { getAnalyticsSql, hasAnalyticsDatabase } from "@/lib/analytics-db";
import { allMarketingTemplates } from "@/lib/marketing-emails";

export type EmailRange = 1 | 7 | 30 | 90;

export type EmailTemplateMetric = {
  templateId: string;
  alias: string;
  name: string;
  subject: string;
  status: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  failed: number;
  orders: number;
  revenue: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  conversionRate: number;
  score: number;
  grade: "Excelente" | "Boa" | "Atenção" | "Fraca" | "Sem amostra";
  recommendation: string;
};

export type EmailIntelligenceData = {
  configured: boolean;
  webhook: { enabled: boolean; id?: string; error?: string };
  tracking: {
    domain: string;
    openTracking: boolean;
    clickTracking: boolean;
    trackingSubdomain: string;
    trackingRecord?: { name: string; type: string; value: string; status: string };
    error?: string;
  };
  summary: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complained: number;
    failed: number;
    orders: number;
    revenue: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    conversionRate: number;
  };
  templates: EmailTemplateMetric[];
  recent: Array<{
    emailId: string;
    recipient: string;
    subject: string;
    templateId: string;
    status: string;
    sentAt: string | null;
    deliveredAt: string | null;
    openedAt: string | null;
    clickedAt: string | null;
    lastClickedUrl: string;
    opens: number;
    clicks: number;
    orders: number;
    revenue: number;
  }>;
  insights: Array<{ tone: "good" | "warn" | "info"; title: string; text: string }>;
};

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    template_id?: string;
    broadcast_id?: string;
    subject?: string;
    from?: string;
    to?: string[];
    tags?: Record<string, string>;
    click?: { link?: string; timestamp?: string; ipAddress?: string; userAgent?: string };
    bounce?: { message?: string; type?: string; subType?: string };
  };
};

function n(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pct(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : 0;
}

function sinceIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function resendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
}

async function schemaReady() {
  if (!hasAnalyticsDatabase()) return false;
  const sql = getAnalyticsSql();
  if (!sql) return false;
  try {
    const rows = await sql.query(`
      SELECT
        to_regclass('public.email_messages') IS NOT NULL AS messages,
        to_regclass('public.email_events') IS NOT NULL AS events,
        to_regclass('public.email_intelligence_config') IS NOT NULL AS config,
        to_regclass('public.email_template_changes') IS NOT NULL AS changes,
        to_regclass('public.email_attributions') IS NOT NULL AS attributions
    `);
    const row = rows[0] as Record<string, unknown> | undefined;
    return Boolean(row?.messages && row?.events && row?.config && row?.changes && row?.attributions);
  } catch {
    return false;
  }
}

async function getConfig<T = Record<string, unknown>>(key: string): Promise<T | null> {
  const sql = getAnalyticsSql();
  if (!sql) return null;
  const rows = await sql.query(`SELECT value FROM email_intelligence_config WHERE key = $1 LIMIT 1`, [key]);
  return (rows[0]?.value as T | undefined) || null;
}

async function setConfig(key: string, value: Record<string, unknown>) {
  const sql = getAnalyticsSql();
  if (!sql) return;
  await sql.query(
    `INSERT INTO email_intelligence_config (key, value, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, JSON.stringify(value)],
  );
}

export async function ensureResendEmailWebhook() {
  if (!(await schemaReady())) return { enabled: false, error: "schema_not_ready" };
  const resend = resendClient();
  if (!resend) return { enabled: false, error: "RESEND_API_KEY ausente" };
  const endpoint = "https://www.brinqueteando.online/api/resend/webhook";

  try {
    const api = resend as unknown as {
      webhooks: {
        list: () => Promise<any>;
        get: (id: string) => Promise<any>;
        create: (payload: { endpoint: string; events: string[] }) => Promise<any>;
      };
    };
    const saved = await getConfig<{ id?: string; signingSecret?: string; endpoint?: string }>("resend_webhook");
    if (saved?.id && saved?.signingSecret && saved.endpoint === endpoint) {
      return { enabled: true, id: saved.id };
    }

    const listed = await api.webhooks.list();
    const items = listed?.data?.data || listed?.data || [];
    let webhook = Array.isArray(items) ? items.find((item: any) => item.endpoint === endpoint) : null;
    let secret = "";

    if (webhook?.id) {
      const detail = await api.webhooks.get(webhook.id);
      webhook = detail?.data || detail || webhook;
      secret = String(webhook?.signing_secret || webhook?.signingSecret || "");
    } else {
      const created = await api.webhooks.create({
        endpoint,
        events: [
          "email.sent",
          "email.delivered",
          "email.opened",
          "email.clicked",
          "email.bounced",
          "email.complained",
          "email.failed",
          "email.delivery_delayed",
        ],
      });
      if (created?.error) throw new Error(created.error.message || "Falha ao criar webhook Resend");
      webhook = created?.data || created;
      secret = String(webhook?.signing_secret || webhook?.signingSecret || "");
    }

    if (!webhook?.id || !secret) throw new Error("Webhook criado sem signing secret");
    await setConfig("resend_webhook", { id: webhook.id, signingSecret: secret, endpoint });
    return { enabled: true, id: webhook.id };
  } catch (error) {
    return { enabled: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getResendWebhookSecret() {
  const saved = await getConfig<{ signingSecret?: string }>("resend_webhook");
  return saved?.signingSecret || "";
}

export async function getResendTrackingStatus() {
  const resend = resendClient();
  const fallback = {
    domain: "send.brinqueteando.online",
    openTracking: false,
    clickTracking: false,
    trackingSubdomain: "",
  };
  if (!resend) return { ...fallback, error: "RESEND_API_KEY ausente" };

  try {
    const api = resend as unknown as { domains: { list: () => Promise<any>; get: (id: string) => Promise<any> } };
    const listed = await api.domains.list();
    const items = listed?.data?.data || listed?.data || [];
    const found = Array.isArray(items)
      ? items.find((item: any) => item.name === "send.brinqueteando.online") ||
        items.find((item: any) => String(item.name || "").endsWith("brinqueteando.online"))
      : null;
    if (!found?.id) return { ...fallback, error: "Domínio de envio não localizado no Resend" };
    const detailResult = await api.domains.get(found.id);
    const detail = detailResult?.data || detailResult || found;
    const records = Array.isArray(detail?.records) ? detail.records : [];
    const trackingRecord = records.find((record: any) => String(record.record || "").toLowerCase() === "tracking");
    return {
      domain: String(detail?.name || found.name || fallback.domain),
      domainId: String(found.id),
      openTracking: Boolean(detail?.open_tracking ?? detail?.openTracking),
      clickTracking: Boolean(detail?.click_tracking ?? detail?.clickTracking),
      trackingSubdomain: String(detail?.tracking_subdomain || detail?.trackingSubdomain || ""),
      trackingRecord: trackingRecord
        ? {
            name: String(trackingRecord.name || ""),
            type: String(trackingRecord.type || "CNAME"),
            value: String(trackingRecord.value || ""),
            status: String(trackingRecord.status || ""),
          }
        : undefined,
    };
  } catch (error) {
    return { ...fallback, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function enableResendOpenClickTracking() {
  const resend = resendClient();
  if (!resend) throw new Error("RESEND_API_KEY ausente");
  const status = await getResendTrackingStatus();
  const domainId = (status as typeof status & { domainId?: string }).domainId;
  if (!domainId) throw new Error(status.error || "Domínio de envio não localizado");
  const api = resend as unknown as {
    domains: { update: (payload: { id: string; openTracking: boolean; clickTracking: boolean; trackingSubdomain: string }) => Promise<any> };
  };
  const updated = await api.domains.update({
    id: domainId,
    openTracking: true,
    clickTracking: true,
    trackingSubdomain: status.trackingSubdomain || "links",
  });
  if (updated?.error) throw new Error(updated.error.message || "Falha ao ativar tracking");
  return getResendTrackingStatus();
}

function sanitizeEvent(event: ResendWebhookEvent) {
  const data = { ...(event.data || {}) } as Record<string, any>;
  if (data.click) {
    data.click = {
      link: data.click.link || "",
      timestamp: data.click.timestamp || "",
    };
  }
  return { type: event.type || "", created_at: event.created_at || "", data };
}

export async function storeResendEmailEvent(eventKey: string, event: ResendWebhookEvent) {
  if (!(await schemaReady())) throw new Error("Email intelligence schema unavailable");
  const sql = getAnalyticsSql();
  if (!sql) throw new Error("Database unavailable");

  const type = String(event.type || "");
  const data = event.data || {};
  const emailId = String(data.email_id || "");
  if (!eventKey || !type || !emailId) throw new Error("Invalid Resend webhook payload");
  const occurredAt = String(data.click?.timestamp || event.created_at || data.created_at || new Date().toISOString());
  const recipient = Array.isArray(data.to) ? String(data.to[0] || "").toLowerCase() : "";
  const templateId = String(data.template_id || "");
  const subject = String(data.subject || "");
  const sender = String(data.from || "");
  const broadcastId = String(data.broadcast_id || "");
  const link = String(data.click?.link || "");
  const tags = data.tags || {};
  const safePayload = sanitizeEvent(event);

  const inserted = await sql.query(
    `INSERT INTO email_events
      (event_key, email_id, event_type, occurred_at, template_id, subject, recipient_email, link, tags, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb)
     ON CONFLICT (event_key) DO NOTHING
     RETURNING event_key`,
    [eventKey, emailId, type, occurredAt, templateId, subject, recipient, link, JSON.stringify(tags), JSON.stringify(safePayload)],
  );
  if (!inserted.length) return { duplicate: true };

  await sql.query(
    `INSERT INTO email_messages
      (email_id, template_id, broadcast_id, subject, recipient_email, sender, status, sent_at, tags, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $7='email.sent' THEN $8::timestamptz ELSE NULL END,$9::jsonb,NOW())
     ON CONFLICT (email_id) DO UPDATE SET
       template_id = COALESCE(NULLIF(EXCLUDED.template_id,''), email_messages.template_id),
       broadcast_id = COALESCE(NULLIF(EXCLUDED.broadcast_id,''), email_messages.broadcast_id),
       subject = COALESCE(NULLIF(EXCLUDED.subject,''), email_messages.subject),
       recipient_email = COALESCE(NULLIF(EXCLUDED.recipient_email,''), email_messages.recipient_email),
       sender = COALESCE(NULLIF(EXCLUDED.sender,''), email_messages.sender),
       tags = CASE WHEN EXCLUDED.tags = '{}'::jsonb THEN email_messages.tags ELSE EXCLUDED.tags END,
       updated_at = NOW()`,
    [emailId, templateId, broadcastId, subject, recipient, sender, type, occurredAt, JSON.stringify(tags)],
  );

  await sql.query(
    `UPDATE email_messages SET
       status = CASE
         WHEN $2='email.complained' THEN 'complained'
         WHEN $2='email.bounced' THEN 'bounced'
         WHEN $2='email.failed' THEN 'failed'
         WHEN status IN ('complained','bounced','failed') THEN status
         WHEN $2='email.clicked' THEN 'clicked'
         WHEN status='clicked' THEN status
         WHEN $2='email.opened' THEN 'opened'
         WHEN status='opened' THEN status
         WHEN $2='email.delivered' THEN 'delivered'
         WHEN status='delivered' THEN status
         WHEN $2='email.delivery_delayed' THEN 'delayed'
         ELSE status
       END,
       sent_at = CASE WHEN $2='email.sent' THEN COALESCE(sent_at,$3::timestamptz) ELSE sent_at END,
       delivered_at = CASE WHEN $2='email.delivered' THEN COALESCE(delivered_at,$3::timestamptz) ELSE delivered_at END,
       first_opened_at = CASE WHEN $2='email.opened' THEN COALESCE(first_opened_at,$3::timestamptz) ELSE first_opened_at END,
       last_opened_at = CASE WHEN $2='email.opened' THEN GREATEST(COALESCE(last_opened_at,$3::timestamptz),$3::timestamptz) ELSE last_opened_at END,
       first_clicked_at = CASE WHEN $2='email.clicked' THEN COALESCE(first_clicked_at,$3::timestamptz) ELSE first_clicked_at END,
       last_clicked_at = CASE WHEN $2='email.clicked' THEN GREATEST(COALESCE(last_clicked_at,$3::timestamptz),$3::timestamptz) ELSE last_clicked_at END,
       bounced_at = CASE WHEN $2='email.bounced' THEN COALESCE(bounced_at,$3::timestamptz) ELSE bounced_at END,
       complained_at = CASE WHEN $2='email.complained' THEN COALESCE(complained_at,$3::timestamptz) ELSE complained_at END,
       failed_at = CASE WHEN $2='email.failed' THEN COALESCE(failed_at,$3::timestamptz) ELSE failed_at END,
       delivery_delayed_at = CASE WHEN $2='email.delivery_delayed' THEN COALESCE(delivery_delayed_at,$3::timestamptz) ELSE delivery_delayed_at END,
       open_count = open_count + CASE WHEN $2='email.opened' THEN 1 ELSE 0 END,
       click_count = click_count + CASE WHEN $2='email.clicked' THEN 1 ELSE 0 END,
       last_clicked_url = CASE WHEN $2='email.clicked' AND $4<>'' THEN $4 ELSE last_clicked_url END,
       updated_at = NOW()
     WHERE email_id=$1`,
    [emailId, type, occurredAt, link],
  );

  return { duplicate: false };
}

export async function attributeEmailPurchase(input: {
  recipientEmail: string;
  orderId: string;
  revenueCents: number;
}) {
  if (!(await schemaReady())) return { attributed: false };
  const sql = getAnalyticsSql();
  if (!sql) return { attributed: false };
  const email = input.recipientEmail.trim().toLowerCase();
  if (!email || !input.orderId) return { attributed: false };

  const candidate = await sql.query(
    `SELECT email_id
       FROM email_messages
      WHERE LOWER(recipient_email)=LOWER($1)
        AND last_clicked_at IS NOT NULL
        AND last_clicked_at >= NOW() - INTERVAL '7 days'
      ORDER BY last_clicked_at DESC
      LIMIT 1`,
    [email],
  );
  const emailId = String(candidate[0]?.email_id || "");
  if (!emailId) return { attributed: false };

  const inserted = await sql.query(
    `INSERT INTO email_attributions (order_id, email_id, recipient_email, revenue_cents, attributed_at)
     VALUES ($1,$2,$3,$4,NOW())
     ON CONFLICT (order_id) DO NOTHING
     RETURNING order_id`,
    [input.orderId, emailId, email, Math.max(0, Math.round(input.revenueCents || 0))],
  );
  if (!inserted.length) return { attributed: false, duplicate: true };

  await sql.query(
    `UPDATE email_messages
        SET order_count = order_count + 1,
            attributed_revenue_cents = attributed_revenue_cents + $2,
            last_order_id = $3,
            updated_at = NOW()
      WHERE email_id=$1`,
    [emailId, Math.max(0, Math.round(input.revenueCents || 0)), input.orderId],
  );
  return { attributed: true, emailId };
}

function scoreTemplate(metric: Omit<EmailTemplateMetric, "score" | "grade" | "recommendation">) {
  if (metric.sent < 10) {
    return { score: 0, grade: "Sem amostra" as const, recommendation: "Ainda não há volume suficiente para tomar uma decisão. Evite alterar o e-mail com base em poucos envios." };
  }
  const deliveryScore = Math.min(100, metric.deliveryRate / 0.99);
  const openSignal = Math.min(100, metric.openRate * 2.5);
  const clickSignal = Math.min(100, metric.clickRate * 12.5);
  const ctorSignal = Math.min(100, metric.clickToOpenRate * 5);
  const conversionSignal = Math.min(100, metric.conversionRate * 10);
  const penalty = Math.min(35, pct(metric.bounced + metric.complained, metric.sent) * 6);
  const score = Math.max(0, Math.min(100, deliveryScore * 0.15 + openSignal * 0.15 + clickSignal * 0.25 + ctorSignal * 0.2 + conversionSignal * 0.25 - penalty));
  const grade: EmailTemplateMetric["grade"] = score >= 80 ? "Excelente" : score >= 65 ? "Boa" : score >= 45 ? "Atenção" : "Fraca";

  let recommendation = "Desempenho equilibrado. Preserve a promessa principal e teste apenas uma variável por vez.";
  if (metric.deliveryRate < 95 || pct(metric.bounced, metric.sent) > 3) {
    recommendation = "Prioridade: entregabilidade. Revise contatos inválidos e reputação antes de alterar copy ou oferta.";
  } else if (metric.openRate < 20) {
    recommendation = "Abertura abaixo do desejado: teste assunto e preheader. Mantenha o corpo igual para saber se o ganho veio do assunto.";
  } else if (metric.clickRate < 2 || metric.clickToOpenRate < 8) {
    recommendation = "O assunto gera atenção, mas o corpo não transforma essa atenção em ação. Reforce o primeiro parágrafo, benefício e CTA.";
  } else if (metric.clicked >= 5 && metric.conversionRate < 2) {
    recommendation = "O e-mail gera clique, mas a venda não acompanha. O próximo teste deve ser oferta, produto indicado ou página de destino.";
  } else if (metric.conversionRate >= 5) {
    recommendation = "E-mail forte em conversão. Preserve estrutura e proposta; use seus padrões como referência para os próximos envios.";
  }
  return { score: Math.round(score), grade, recommendation };
}

async function templateDirectory() {
  const resend = resendClient();
  const remote: any[] = [];
  if (resend) {
    try {
      const api = resend as unknown as { templates: { list: (args?: any) => Promise<any> } };
      const listed = await api.templates.list({ limit: 100 });
      const data = listed?.data?.data || listed?.data || [];
      if (Array.isArray(data)) remote.push(...data);
    } catch {}
  }

  const sql = getAnalyticsSql();
  const changes = sql
    ? await sql.query(`
        SELECT DISTINCT ON (template_alias) template_alias, new_subject
          FROM email_template_changes
         ORDER BY template_alias, changed_at DESC
      `).catch(() => [])
    : [];
  const subjectByAlias = new Map(changes.map((row: any) => [String(row.template_alias), String(row.new_subject || "")]));

  return allMarketingTemplates.map((local) => {
    const match = remote.find((item) => item.alias === local.alias);
    return {
      templateId: String(match?.id || local.alias),
      alias: local.alias,
      name: local.name,
      subject: subjectByAlias.get(local.alias) || local.subject,
      status: String(match?.status || "unknown"),
    };
  });
}

export async function getEmailIntelligenceData(range: EmailRange): Promise<EmailIntelligenceData> {
  const configured = await schemaReady();
  const empty: EmailIntelligenceData = {
    configured,
    webhook: { enabled: false },
    tracking: { domain: "send.brinqueteando.online", openTracking: false, clickTracking: false, trackingSubdomain: "" },
    summary: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0, failed: 0, orders: 0, revenue: 0, deliveryRate: 0, openRate: 0, clickRate: 0, clickToOpenRate: 0, conversionRate: 0 },
    templates: [], recent: [], insights: [],
  };
  if (!configured) return empty;
  const sql = getAnalyticsSql();
  if (!sql) return empty;
  const since = sinceIso(range);

  const [webhook, tracking, directory, summaryRows, templateRows, recentRows] = await Promise.all([
    ensureResendEmailWebhook(),
    getResendTrackingStatus(),
    templateDirectory(),
    sql.query(`
      SELECT
        COUNT(*)::int AS sent,
        COUNT(*) FILTER (WHERE delivered_at IS NOT NULL)::int AS delivered,
        COUNT(*) FILTER (WHERE first_opened_at IS NOT NULL)::int AS opened,
        COUNT(*) FILTER (WHERE first_clicked_at IS NOT NULL)::int AS clicked,
        COUNT(*) FILTER (WHERE bounced_at IS NOT NULL)::int AS bounced,
        COUNT(*) FILTER (WHERE complained_at IS NOT NULL)::int AS complained,
        COUNT(*) FILTER (WHERE failed_at IS NOT NULL)::int AS failed,
        COALESCE(SUM(order_count),0)::int AS orders,
        COALESCE(SUM(attributed_revenue_cents),0)::bigint AS revenue
      FROM email_messages WHERE sent_at >= $1::timestamptz`, [since]),
    sql.query(`
      SELECT template_id,
             MAX(subject) FILTER (WHERE subject<>'') AS subject,
             COUNT(*)::int AS sent,
             COUNT(*) FILTER (WHERE delivered_at IS NOT NULL)::int AS delivered,
             COUNT(*) FILTER (WHERE first_opened_at IS NOT NULL)::int AS opened,
             COUNT(*) FILTER (WHERE first_clicked_at IS NOT NULL)::int AS clicked,
             COUNT(*) FILTER (WHERE bounced_at IS NOT NULL)::int AS bounced,
             COUNT(*) FILTER (WHERE complained_at IS NOT NULL)::int AS complained,
             COUNT(*) FILTER (WHERE failed_at IS NOT NULL)::int AS failed,
             COALESCE(SUM(order_count),0)::int AS orders,
             COALESCE(SUM(attributed_revenue_cents),0)::bigint AS revenue
        FROM email_messages
       WHERE sent_at >= $1::timestamptz
       GROUP BY template_id`, [since]),
    sql.query(`
      SELECT email_id, recipient_email, subject, template_id, status,
             sent_at, delivered_at, first_opened_at, first_clicked_at,
             last_clicked_url, open_count, click_count, order_count, attributed_revenue_cents
        FROM email_messages
       WHERE sent_at >= $1::timestamptz
       ORDER BY sent_at DESC NULLS LAST
       LIMIT 80`, [since]),
  ]);

  const rawSummary = summaryRows[0] || {};
  const sent = n(rawSummary.sent);
  const delivered = n(rawSummary.delivered);
  const opened = n(rawSummary.opened);
  const clicked = n(rawSummary.clicked);
  const orders = n(rawSummary.orders);
  const summary = {
    sent,
    delivered,
    opened,
    clicked,
    bounced: n(rawSummary.bounced),
    complained: n(rawSummary.complained),
    failed: n(rawSummary.failed),
    orders,
    revenue: n(rawSummary.revenue),
    deliveryRate: pct(delivered, sent),
    openRate: pct(opened, delivered),
    clickRate: pct(clicked, delivered),
    clickToOpenRate: pct(clicked, opened),
    conversionRate: pct(orders, clicked),
  };

  const rowByTemplate = new Map(templateRows.map((row: any) => [String(row.template_id || ""), row]));
  const templates: EmailTemplateMetric[] = directory.map((item) => {
    const row = rowByTemplate.get(item.templateId) || {};
    const base = {
      ...item,
      subject: String(row.subject || item.subject),
      sent: n(row.sent), delivered: n(row.delivered), opened: n(row.opened), clicked: n(row.clicked),
      bounced: n(row.bounced), complained: n(row.complained), failed: n(row.failed),
      orders: n(row.orders), revenue: n(row.revenue),
      deliveryRate: pct(n(row.delivered), n(row.sent)),
      openRate: pct(n(row.opened), n(row.delivered)),
      clickRate: pct(n(row.clicked), n(row.delivered)),
      clickToOpenRate: pct(n(row.clicked), n(row.opened)),
      conversionRate: pct(n(row.orders), n(row.clicked)),
    };
    return { ...base, ...scoreTemplate(base) };
  });

  const recent = recentRows.map((row: any) => ({
    emailId: String(row.email_id || ""),
    recipient: String(row.recipient_email || ""),
    subject: String(row.subject || ""),
    templateId: String(row.template_id || ""),
    status: String(row.status || ""),
    sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : null,
    deliveredAt: row.delivered_at ? new Date(row.delivered_at).toISOString() : null,
    openedAt: row.first_opened_at ? new Date(row.first_opened_at).toISOString() : null,
    clickedAt: row.first_clicked_at ? new Date(row.first_clicked_at).toISOString() : null,
    lastClickedUrl: String(row.last_clicked_url || ""),
    opens: n(row.open_count), clicks: n(row.click_count), orders: n(row.order_count), revenue: n(row.attributed_revenue_cents),
  }));

  const insights: EmailIntelligenceData["insights"] = [];
  if (!tracking.openTracking || !tracking.clickTracking) {
    insights.push({ tone: "warn", title: "Tracking de engajamento incompleto", text: "Aberturas e/ou cliques ainda não estão habilitados no domínio de marketing. Entregas continuam sendo medidas normalmente." });
  }
  if (sent >= 20 && summary.openRate < 20 && tracking.openTracking) {
    insights.push({ tone: "warn", title: "Assuntos precisam de teste", text: `Abertura de ${summary.openRate.toFixed(1)}%. Priorize assunto e preheader antes de mudar oferta ou layout.` });
  }
  if (opened >= 20 && summary.clickToOpenRate < 8 && tracking.clickTracking) {
    insights.push({ tone: "warn", title: "Corpo e CTA estão perdendo atenção", text: `Só ${summary.clickToOpenRate.toFixed(1)}% dos que abriram também clicaram. Revise promessa, clareza do benefício e CTA.` });
  }
  if (clicked >= 10 && summary.conversionRate < 2) {
    insights.push({ tone: "warn", title: "Clique existe, compra não", text: "O gargalo está depois do e-mail. Teste produto indicado, oferta, preço, confiança e página de destino." });
  }
  if (sent >= 20 && summary.deliveryRate >= 98 && (summary.clickRate >= 3 || summary.conversionRate >= 4)) {
    insights.push({ tone: "good", title: "Base saudável", text: "Entregabilidade e resposta estão fortes. Use os melhores padrões de assunto, corpo e CTA como modelo para os próximos e-mails." });
  }
  if (!insights.length) insights.push({ tone: "info", title: "Coletando sinal", text: "O sistema já está preparado. As recomendações ficam mais confiáveis conforme chegam mais envios, cliques e compras." });

  return { configured, webhook, tracking, summary, templates, recent, insights };
}

export async function getMarketingTemplateForEditor(alias: string) {
  const allowed = allMarketingTemplates.find((item) => item.alias === alias);
  if (!allowed) return null;
  const resend = resendClient();
  if (!resend) throw new Error("RESEND_API_KEY ausente");
  const api = resend as unknown as { templates: { get: (id: string) => Promise<any> } };
  const result = await api.templates.get(alias);
  if (result?.error) throw new Error(result.error.message || "Template não encontrado");
  const data = result?.data || result;
  return {
    id: String(data?.id || alias), alias,
    name: String(data?.name || allowed.name),
    subject: String(data?.subject || allowed.subject),
    html: String(data?.html || allowed.html),
    status: String(data?.status || "unknown"),
    updatedAt: String(data?.updated_at || ""),
  };
}

export async function updateMarketingTemplate(input: {
  alias: string;
  subject: string;
  html: string;
  changedBy: string;
  reason?: string;
}) {
  const allowed = allMarketingTemplates.find((item) => item.alias === input.alias);
  if (!allowed) throw new Error("Template não autorizado");
  const subject = input.subject.trim().slice(0, 180);
  const html = input.html.trim();
  if (!subject || html.length < 100) throw new Error("Assunto ou corpo inválido");
  const resend = resendClient();
  if (!resend) throw new Error("RESEND_API_KEY ausente");
  const current = await getMarketingTemplateForEditor(input.alias);
  if (!current) throw new Error("Template não encontrado");
  const api = resend as unknown as {
    templates: { update: (id: string, payload: any) => Promise<any>; publish: (id: string) => Promise<any> };
  };
  const updated = await api.templates.update(input.alias, { subject, html });
  if (updated?.error) throw new Error(updated.error.message || "Falha ao atualizar template");
  const published = await api.templates.publish(current.id);
  if (published?.error) throw new Error(published.error.message || "Falha ao publicar template");

  const sql = getAnalyticsSql();
  if (sql && (await schemaReady())) {
    await sql.query(
      `INSERT INTO email_template_changes
        (template_id, template_alias, old_subject, new_subject, changed_by, reason, published, changed_at)
       VALUES ($1,$2,$3,$4,$5,$6,TRUE,NOW())`,
      [current.id, input.alias, current.subject, subject, input.changedBy, (input.reason || "").slice(0, 500)],
    );
  }
  return { ok: true };
}
