import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionJourney } from "@/lib/analytics-dashboard";
import { requireDashboardAdmin } from "@/lib/dashboard-auth";

export const metadata: Metadata = {
  title: "Jornada da sessão",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function s(value: unknown) { return String(value ?? ""); }
function n(value: unknown) { const result = Number(value ?? 0); return Number.isFinite(result) ? result : 0; }
function money(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
function duration(seconds: number) { const v = Math.round(seconds); return v < 60 ? `${v}s` : `${Math.floor(v / 60)}m ${v % 60}s`; }

const eventLabels: Record<string, { label: string; icon: string; tone: string }> = {
  page_view: { label: "Abriu página", icon: "↗", tone: "bg-sky-50 border-sky-200" },
  product_view: { label: "Viu produto", icon: "◉", tone: "bg-indigo-50 border-indigo-200" },
  click: { label: "Clicou", icon: "↘", tone: "bg-slate-50 border-slate-200" },
  whatsapp_click: { label: "Abriu WhatsApp", icon: "✆", tone: "bg-emerald-50 border-emerald-200" },
  add_to_cart: { label: "Adicionou ao carrinho", icon: "+", tone: "bg-orange-50 border-orange-200" },
  remove_from_cart: { label: "Removeu do carrinho", icon: "−", tone: "bg-rose-50 border-rose-200" },
  cart_quantity_changed: { label: "Alterou quantidade", icon: "±", tone: "bg-amber-50 border-amber-200" },
  cart_view: { label: "Abriu carrinho", icon: "▣", tone: "bg-orange-50 border-orange-200" },
  checkout_started: { label: "Iniciou checkout", icon: "→", tone: "bg-violet-50 border-violet-200" },
  purchase: { label: "Compra aprovada", icon: "✓", tone: "bg-emerald-50 border-emerald-300" },
  scroll_depth: { label: "Profundidade de leitura", icon: "↓", tone: "bg-slate-50 border-slate-200" },
  page_engagement: { label: "Tempo na página", icon: "◷", tone: "bg-slate-50 border-slate-200" },
  rage_click: { label: "Cliques repetidos", icon: "!", tone: "bg-red-50 border-red-200" },
  client_error: { label: "Erro no navegador", icon: "!", tone: "bg-red-50 border-red-300" },
  performance: { label: "Performance", icon: "⚡", tone: "bg-slate-50 border-slate-200" },
};

function description(event: Awaited<ReturnType<typeof getSessionJourney>> extends infer T ? T extends { events: infer E } ? E extends Array<infer R> ? R : never : never : never) {
  const properties = event.properties as Record<string, unknown>;
  if (event.eventName === "page_view") return event.path;
  if (event.eventName === "product_view") return event.productName || event.path;
  if (event.eventName === "click" || event.eventName === "whatsapp_click") return event.label || event.targetUrl || "Clique sem rótulo";
  if (event.eventName === "add_to_cart") return `${event.productName || event.productId}${event.quantity ? ` · ${event.quantity} un.` : ""}`;
  if (event.eventName === "remove_from_cart") return event.productName || event.productId;
  if (event.eventName === "cart_quantity_changed") return `${event.productName || event.productId} · quantidade ${event.quantity}`;
  if (event.eventName === "checkout_started") return "Cliente chegou à etapa de pagamento";
  if (event.eventName === "purchase") return `Pedido confirmado · ${money(event.valueCents)}`;
  if (event.eventName === "scroll_depth") return `${n(properties.threshold)}% da página`;
  if (event.eventName === "page_engagement") return `${duration(n(properties.durationSeconds))} ativo · scroll máximo ${n(properties.maxScroll)}%`;
  if (event.eventName === "rage_click") return event.label || "3+ cliques muito próximos";
  if (event.eventName === "client_error") return event.label || "Erro JavaScript";
  if (event.eventName === "performance") return `TTFB ${n(properties.ttfbMs)}ms · DOM ${n(properties.domReadyMs)}ms · Load ${n(properties.loadMs)}ms`;
  return event.label || event.path || event.eventName;
}

export default async function SessionPage({ params, searchParams }: { params: Promise<{ sessionId: string }>; searchParams: Promise<{ range?: string }> }) {
  await requireDashboardAdmin();
  const { sessionId } = await params;
  const query = await searchParams;
  const journey = await getSessionJourney(decodeURIComponent(sessionId));
  if (!journey) notFound();

  const session = journey.session as Record<string, unknown>;
  const converted = Boolean(session.converted);
  const revenue = n(session.revenue_cents);

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-[#F4F1EE] text-[#09274B]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#09274B]/96 text-white shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#DFA486]">Replay textual da jornada</p>
            <h1 className="mt-1 font-serif text-2xl sm:text-3xl">Sessão {s(session.session_id).slice(0, 8)}…</h1>
          </div>
          <Link href={`/dashboard?range=${query.range || "7"}`} className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-bold hover:bg-white/14">← Voltar ao painel</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          {[
            ["Origem", s(session.source) || "Direct"],
            ["Meio", s(session.medium) || "none"],
            ["Cidade", s(session.city) || "—"],
            ["Estado", s(session.region) || "—"],
            ["Dispositivo", s(session.device_type) || "—"],
            ["Navegador", s(session.browser) || "—"],
            ["Páginas", String(n(session.page_views))],
            ["Tempo ativo", duration(n(session.engaged_seconds))],
          ].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#DCE2E8] bg-white p-4 shadow-sm"><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#7C8998]">{label}</p><p className="mt-2 truncate font-semibold" title={value}>{value}</p></div>)}
        </section>

        <section className={`rounded-[1.75rem] border p-5 sm:p-6 ${converted ? "border-emerald-200 bg-emerald-50" : "border-[#DCE2E8] bg-white"}`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#7C8998]">Resultado da sessão</p>
              <h2 className="mt-1 font-serif text-3xl">{converted ? `Compra concluída · ${money(revenue)}` : "Não houve compra nesta sessão"}</h2>
            </div>
            <div className="text-sm text-[#697789] sm:text-right">
              <p>Entrada: <strong>{s(session.landing_path) || "/"}</strong></p>
              <p className="mt-1">Scroll máximo: <strong>{n(session.max_scroll)}%</strong></p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#DCE2E8] bg-white p-5 shadow-[0_18px_55px_rgba(4,21,40,.06)] sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#B0522D]">Linha do tempo</p>
          <h2 className="mt-1 font-serif text-3xl">Tudo o que foi registrado nesta jornada</h2>

          <div className="relative mt-7 space-y-3 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-[#DCE2E8]">
            {journey.events.map((event, index) => {
              const meta = eventLabels[event.eventName] || { label: event.eventName, icon: "•", tone: "bg-slate-50 border-slate-200" };
              const properties = event.properties as Record<string, unknown>;
              return (
                <article key={`${event.occurredAt}-${index}`} className="relative grid grid-cols-[40px_1fr] gap-3">
                  <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#D8E0E7] bg-white font-black text-[#B0522D] shadow-sm">{meta.icon}</div>
                  <div className={`rounded-2xl border p-4 ${meta.tone}`}>
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-bold text-[#09274B]">{meta.label}</h3>
                        <p className="mt-1 break-words text-sm leading-6 text-[#617084]">{description(event)}</p>
                      </div>
                      <time className="shrink-0 text-xs text-[#82909E]">{new Date(event.occurredAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#758393]">
                      {event.path ? <span className="rounded-full bg-white/70 px-2.5 py-1">{event.path}</span> : null}
                      {event.xPct > 0 || event.yPct > 0 ? <span className="rounded-full bg-white/70 px-2.5 py-1">Clique: X {event.xPct.toFixed(0)}% · Y {event.yPct.toFixed(0)}%</span> : null}
                      {event.targetUrl ? <span className="max-w-full truncate rounded-full bg-white/70 px-2.5 py-1" title={event.targetUrl}>{event.targetUrl}</span> : null}
                      {properties.action ? <span className="rounded-full bg-white/70 px-2.5 py-1">ação: {s(properties.action)}</span> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="pb-8 text-center text-xs text-[#84909D]">IDs aleatórios first-party. O painel não exibe IP bruto nem fingerprint do visitante.</footer>
      </main>
    </div>
  );
}
