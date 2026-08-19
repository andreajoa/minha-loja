"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/data/products";

/* ─── Types ─── */
type Stats = {
  revenue: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number };
  averageTicket: number;
  totalProducts: number;
  lowStockProducts: { id: string; name: string; stock: number; category: string }[];
  categoryCount: Record<string, number>;
};

type Order = {
  id: string;
  created: number;
  amount: number;
  customerName: string;
  customerEmail: string;
  city: string;
  state: string;
  paymentStatus: string;
  items: { name: string; quantity: number; amount: number }[];
};

type EmailSummary = {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
};

type Email = {
  id: string;
  to: string[];
  subject: string;
  status: string;
  createdAt: string;
};

type TrackEvent = {
  type: string;
  path: string;
  referrer: string;
  userAgent: string;
  timestamp: string;
  ip: string;
  country?: string;
};

/* ─── Helpers ─── */
function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatIso(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

function statusLabel(s: string) {
  const map: Record<string, { label: string; color: string }> = {
    delivered: { label: "Entregue", color: "bg-emerald-500/15 text-emerald-400" },
    opened: { label: "Aberto", color: "bg-blue-500/15 text-blue-400" },
    clicked: { label: "Clicado", color: "bg-violet-500/15 text-violet-400" },
    bounced: { label: "Rejeitado", color: "bg-red-500/15 text-red-400" },
    sent: { label: "Enviado", color: "bg-slate-500/15 text-slate-400" },
    complained: { label: "Spam", color: "bg-orange-500/15 text-orange-400" },
  };
  return map[s] || { label: s, color: "bg-slate-500/15 text-slate-400" };
}

function deviceFromUA(ua: string) {
  if (/mobile|android|iphone/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

function browserFromUA(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Outro";
}

/* ─── Components ─── */
function Metric({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-amber-500/30 bg-amber-500/5" : "border-white/[0.06] bg-white/[0.03]"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-light tracking-tight text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{children}</h2>;
}

function Pill({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>{label}</span>;
}

/* ─── Login Screen ─── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      onLogin();
    } else {
      setError("Senha incorreta");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-light tracking-[0.15em] text-white/80">BRINQUETEANDO</h1>
          <p className="mt-1 text-xs text-slate-600">Painel administrativo</p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha de acesso"
            autoFocus
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-white/20 focus:bg-white/[0.06]"
          />
          {error && <p className="text-center text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-40"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Dashboard ─── */
export default function DashboardPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [emailSummary, setEmailSummary] = useState<EmailSummary | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<TrackEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "orders" | "emails" | "visitors">("overview");

  // Check auth
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, emailsRes, eventsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/orders?limit=50"),
        fetch("/api/admin/emails"),
        fetch("/api/admin/stats").then(() => fetch("/api/track?key=" + encodeURIComponent(""))),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
      if (emailsRes.ok) {
        const data = await emailsRes.json();
        setEmailSummary(data.summary);
        setEmails(data.emails || []);
      }

      // Load events directly
      const eventsDirectRes = await fetch("/api/track?key=" + encodeURIComponent(document.cookie.split("brq-admin-session=")[1]?.split(";")[0] || ""));
      if (!eventsDirectRes.ok) {
        // Try fetching events from stats-adjacent endpoint
        setEvents([]);
      } else {
        const evData = await eventsDirectRes.json();
        setEvents(evData.events || []);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="h-6 w-6 animate-spin rounded-full border border-white/20 border-t-white/60" />
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLogin={() => { setAuthed(true); }} />;
  }

  // Analytics from events
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter((e) => e.timestamp.startsWith(todayStr));
  const uniqueIPs = new Set(todayEvents.map((e) => e.ip)).size;

  const topPages = Object.entries(
    todayEvents.reduce<Record<string, number>>((acc, e) => {
      acc[e.path] = (acc[e.path] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const topReferrers = Object.entries(
    events.filter((e) => e.referrer).reduce<Record<string, number>>((acc, e) => {
      try {
        const host = new URL(e.referrer).hostname || e.referrer;
        acc[host] = (acc[host] || 0) + 1;
      } catch {
        acc[e.referrer] = (acc[e.referrer] || 0) + 1;
      }
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const devices = Object.entries(
    todayEvents.reduce<Record<string, number>>((acc, e) => {
      acc[deviceFromUA(e.userAgent)] = (acc[deviceFromUA(e.userAgent)] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const browsers = Object.entries(
    todayEvents.reduce<Record<string, number>>((acc, e) => {
      acc[browserFromUA(e.userAgent)] = (acc[browserFromUA(e.userAgent)] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const countries = Object.entries(
    events.filter((e) => e.country).reduce<Record<string, number>>((acc, e) => {
      acc[e.country!] = (acc[e.country!] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const tabs = [
    { id: "overview" as const, label: "Visão geral" },
    { id: "orders" as const, label: "Pedidos" },
    { id: "emails" as const, label: "E-mails" },
    { id: "visitors" as const, label: "Visitantes" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-sm font-light tracking-[0.15em] text-white/70">BRINQUETEANDO</h1>
            <nav className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${tab === t.id ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadData} disabled={loading} className="text-xs text-slate-500 transition hover:text-white disabled:opacity-40">
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
            <button onClick={handleLogout} className="text-xs text-slate-600 transition hover:text-red-400">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        {/* ─── OVERVIEW ─── */}
        {tab === "overview" && stats && (
          <div className="space-y-10">
            <section>
              <SectionTitle>Receita</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Hoje" value={formatPrice(stats.revenue.today)} sub={`${stats.orders.today} pedido${stats.orders.today !== 1 ? "s" : ""}`} />
                <Metric label="Esta semana" value={formatPrice(stats.revenue.week)} sub={`${stats.orders.week} pedido${stats.orders.week !== 1 ? "s" : ""}`} />
                <Metric label="Este mês" value={formatPrice(stats.revenue.month)} sub={`${stats.orders.month} pedido${stats.orders.month !== 1 ? "s" : ""}`} />
                <Metric label="Ticket médio" value={formatPrice(stats.averageTicket)} sub={`${stats.totalProducts} produtos`} />
              </div>
            </section>

            <section>
              <SectionTitle>Visitantes hoje</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric label="Pageviews" value={String(todayEvents.length)} />
                <Metric label="Visitantes únicos" value={String(uniqueIPs)} />
                <Metric label="Eventos totais" value={String(events.length)} sub="últimos registros" />
              </div>
            </section>

            {emailSummary && (
              <section>
                <SectionTitle>E-mails</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-5">
                  <Metric label="Enviados" value={String(emailSummary.totalSent)} />
                  <Metric label="Entregues" value={String(emailSummary.delivered)} />
                  <Metric label="Abertos" value={String(emailSummary.opened)} sub={emailSummary.totalSent > 0 ? `${Math.round((emailSummary.opened / emailSummary.totalSent) * 100)}% taxa` : ""} />
                  <Metric label="Clicados" value={String(emailSummary.clicked)} />
                  <Metric label="Rejeitados" value={String(emailSummary.bounced)} accent={emailSummary.bounced > 0} />
                </div>
              </section>
            )}

            {stats.lowStockProducts.length > 0 && (
              <section>
                <SectionTitle>Estoque crítico</SectionTitle>
                <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Produto</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Categoria</th>
                        <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-600">Estoque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lowStockProducts.map((p) => (
                        <tr key={p.id} className="border-b border-white/[0.04] last:border-0">
                          <td className="px-5 py-3 text-slate-300">{p.name}</td>
                          <td className="px-5 py-3 text-slate-500">{p.category}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`inline-flex min-w-[1.5rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${p.stock <= 2 ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                              {p.stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section>
              <SectionTitle>Catálogo por categoria</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats.categoryCount).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3">
                    <span className="text-sm text-slate-400">{cat}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ─── ORDERS ─── */}
        {tab === "orders" && (
          <section>
            <SectionTitle>Últimos pedidos</SectionTitle>
            {orders.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-600">Nenhum pedido encontrado.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Data</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Cliente</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Local</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Itens</th>
                        <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-slate-600">Valor</th>
                        <th className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-white/[0.04] last:border-0 transition hover:bg-white/[0.02]">
                          <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(order.created)}</td>
                          <td className="px-5 py-3">
                            <p className="text-slate-300">{order.customerName}</p>
                            <p className="text-xs text-slate-600">{order.customerEmail}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-500">{order.city}, {order.state}</td>
                          <td className="px-5 py-3 text-slate-500">
                            {order.items.map((item, i) => (
                              <span key={i}>{item.quantity}x {item.name}{i < order.items.length - 1 ? ", " : ""}</span>
                            ))}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-white">
                            {formatPrice(order.amount || 0)}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <Pill label={order.paymentStatus === "paid" ? "Pago" : order.paymentStatus} color="bg-emerald-500/15 text-emerald-400" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── EMAILS ─── */}
        {tab === "emails" && (
          <div className="space-y-10">
            {emailSummary && (
              <section>
                <SectionTitle>Resumo de e-mails</SectionTitle>
                <div className="grid gap-4 sm:grid-cols-5">
                  <Metric label="Enviados" value={String(emailSummary.totalSent)} />
                  <Metric label="Entregues" value={String(emailSummary.delivered)} />
                  <Metric label="Abertos" value={String(emailSummary.opened)} sub={emailSummary.totalSent > 0 ? `${Math.round((emailSummary.opened / emailSummary.totalSent) * 100)}%` : "0%"} />
                  <Metric label="Clicados" value={String(emailSummary.clicked)} sub={emailSummary.totalSent > 0 ? `${Math.round((emailSummary.clicked / emailSummary.totalSent) * 100)}%` : "0%"} />
                  <Metric label="Rejeitados" value={String(emailSummary.bounced)} accent={emailSummary.bounced > 0} />
                </div>
              </section>
            )}

            <section>
              <SectionTitle>Histórico de e-mails</SectionTitle>
              {emails.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-600">Nenhum e-mail encontrado.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Quando</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Destinatário</th>
                        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Assunto</th>
                        <th className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map((email) => {
                        const st = statusLabel(email.status);
                        return (
                          <tr key={email.id} className="border-b border-white/[0.04] last:border-0 transition hover:bg-white/[0.02]">
                            <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatIso(email.createdAt)}</td>
                            <td className="px-5 py-3 text-slate-300">{Array.isArray(email.to) ? email.to.join(", ") : email.to}</td>
                            <td className="px-5 py-3 text-slate-500">{email.subject}</td>
                            <td className="px-5 py-3 text-center"><Pill label={st.label} color={st.color} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ─── VISITORS ─── */}
        {tab === "visitors" && (
          <div className="space-y-10">
            <section>
              <SectionTitle>Hoje</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric label="Pageviews" value={String(todayEvents.length)} />
                <Metric label="Visitantes únicos" value={String(uniqueIPs)} />
                <Metric label="Total rastreado" value={String(events.length)} sub="todos os eventos armazenados" />
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
              <section>
                <SectionTitle>Páginas mais visitadas (hoje)</SectionTitle>
                <div className="space-y-2">
                  {topPages.length === 0 && <p className="text-sm text-slate-600">Sem dados ainda.</p>}
                  {topPages.map(([path, count]) => (
                    <div key={path} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                      <span className="text-sm font-mono text-slate-400">{path}</span>
                      <span className="text-sm font-semibold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>De onde vieram</SectionTitle>
                <div className="space-y-2">
                  {topReferrers.length === 0 && <p className="text-sm text-slate-600">Sem dados de referrer.</p>}
                  {topReferrers.map(([ref, count]) => (
                    <div key={ref} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                      <span className="text-sm text-slate-400">{ref}</span>
                      <span className="text-sm font-semibold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>Dispositivos (hoje)</SectionTitle>
                <div className="space-y-2">
                  {devices.length === 0 && <p className="text-sm text-slate-600">Sem dados.</p>}
                  {devices.map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                      <span className="text-sm text-slate-400">{device}</span>
                      <span className="text-sm font-semibold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>Navegadores (hoje)</SectionTitle>
                <div className="space-y-2">
                  {browsers.length === 0 && <p className="text-sm text-slate-600">Sem dados.</p>}
                  {browsers.map(([browser, count]) => (
                    <div key={browser} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                      <span className="text-sm text-slate-400">{browser}</span>
                      <span className="text-sm font-semibold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </section>

              {countries.length > 0 && (
                <section>
                  <SectionTitle>Países</SectionTitle>
                  <div className="space-y-2">
                    {countries.map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                        <span className="text-sm text-slate-400">{country}</span>
                        <span className="text-sm font-semibold text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <section>
              <SectionTitle>Atividade recente</SectionTitle>
              {events.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-600">Sem eventos rastreados ainda.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Quando</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Página</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Referrer</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">Dispositivo</th>
                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">País</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.slice(0, 100).map((ev, i) => (
                          <tr key={i} className="border-b border-white/[0.04] last:border-0">
                            <td className="whitespace-nowrap px-5 py-2.5 text-slate-500">{timeAgo(ev.timestamp)}</td>
                            <td className="px-5 py-2.5 font-mono text-slate-400">{ev.path}</td>
                            <td className="px-5 py-2.5 text-slate-600">{ev.referrer ? new URL(ev.referrer).hostname : "direto"}</td>
                            <td className="px-5 py-2.5 text-slate-500">{deviceFromUA(ev.userAgent)}</td>
                            <td className="px-5 py-2.5 text-slate-500">{ev.country || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {!stats && !loading && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-sm text-slate-600">Erro ao carregar dados. Verifique as configurações.</p>
          </div>
        )}
      </main>
    </div>
  );
}
