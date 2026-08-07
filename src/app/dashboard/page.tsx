import type { Metadata } from "next";
import Link from "next/link";
import DashboardAutoRefresh from "@/components/DashboardAutoRefresh";
import { getDashboardData, type DashboardRange } from "@/lib/analytics-dashboard";
import { requireDashboardAdmin } from "@/lib/dashboard-auth";

export const metadata: Metadata = {
  title: "Inteligência da Loja",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const rangeOptions: Array<{ value: DashboardRange; label: string }> = [
  { value: 1, label: "Hoje" },
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function number(value: number) {
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

function percent(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function duration(seconds: number) {
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded}s`;
  return `${Math.floor(rounded / 60)}m ${rounded % 60}s`;
}

function shortPath(path: string) {
  if (!path) return "/";
  return path.length > 46 ? `${path.slice(0, 43)}…` : path;
}

function Kpi({ label, value, detail, accent = false }: { label: string; value: string; detail?: string; accent?: boolean }) {
  return (
    <article className={`rounded-[1.6rem] border p-5 shadow-[0_18px_55px_rgba(4,21,40,.07)] ${accent ? "border-[#B75A34]/25 bg-[#B75A34] text-white" : "border-[#DCE2E8] bg-white text-[#09274B]"}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.17em] ${accent ? "text-white/70" : "text-[#6B7A8C]"}`}>{label}</p>
      <p className="mt-2 font-serif text-[2.05rem] leading-none">{value}</p>
      {detail ? <p className={`mt-3 text-xs leading-5 ${accent ? "text-white/75" : "text-[#6B7A8C]"}`}>{detail}</p> : null}
    </article>
  );
}

function Panel({ title, eyebrow, children, className = "" }: { title: string; eyebrow?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[1.75rem] border border-[#DCE2E8] bg-white p-5 shadow-[0_18px_55px_rgba(4,21,40,.06)] sm:p-6 ${className}`}>
      {eyebrow ? <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B0522D]">{eyebrow}</p> : null}
      <h2 className="mt-1 font-serif text-2xl text-[#09274B] sm:text-3xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl bg-[#F8F5F2] px-4 py-8 text-center text-sm text-[#6B7A8C]">{text}</div>;
}

function Progress({ value, max, tone = "navy" }: { value: number; max: number; tone?: "navy" | "terracotta" | "green" }) {
  const width = max ? Math.max(3, Math.min(100, (value / max) * 100)) : 0;
  const color = tone === "terracotta" ? "bg-[#B0522D]" : tone === "green" ? "bg-emerald-500" : "bg-[#09274B]";
  return <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F4]"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div>;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const admin = await requireDashboardAdmin();
  const params = await searchParams;
  const requested = Number(params.range || 7);
  const range: DashboardRange = [1, 7, 30, 90].includes(requested) ? (requested as DashboardRange) : 7;
  const data = await getDashboardData(range);

  if (!data.configured) {
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto bg-[#F5F2EF] text-[#09274B]">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center px-5 py-12">
          <div className="w-full rounded-[2rem] border border-[#D7DEE5] bg-white p-7 shadow-2xl sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B0522D]">BrinqueTEAndo Intelligence</p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">O painel está pronto. Falta conectar o banco de dados.</h1>
            <p className="mt-5 max-w-2xl leading-7 text-[#617084]">O código de rastreamento, geolocalização aproximada, funil e painel já está instalado. Para começar a registrar jornadas reais, a Vercel precisa receber uma variável <strong>DATABASE_URL</strong> de um Postgres serverless.</p>
            <div className="mt-7 rounded-2xl bg-[#F5E8DF] p-5 text-sm leading-6 text-[#6B4636]">
              Nenhum dado de navegação é gravado enquanto essa conexão não existir. A loja continua funcionando normalmente.
            </div>
            <p className="mt-7 text-sm text-[#718094]">Acesso administrativo: {admin.email}</p>
          </div>
        </div>
      </div>
    );
  }

  const maxTimeline = Math.max(1, ...data.timeline.map((item) => item.sessions));
  const maxSource = Math.max(1, ...data.sources.map((item) => item.sessions));
  const maxGeo = Math.max(1, ...data.geo.map((item) => item.sessions));
  const maxPage = Math.max(1, ...data.pages.map((item) => item.views));
  const maxClick = Math.max(1, ...data.clicks.map((item) => item.clicks));
  const maxProduct = Math.max(1, ...data.products.map((item) => item.views));
  const maxDevice = Math.max(1, ...data.devices.map((item) => item.value));

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-[#F4F1EE] text-[#09274B] selection:bg-[#F1D8CA]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#09274B]/96 text-white shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1540px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#DFA486]">BrinqueTEAndo Intelligence</p>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl">Painel de comportamento & conversão</h1>
            </div>
            <div className="lg:hidden"><DashboardAutoRefresh /></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {rangeOptions.map((option) => (
              <Link key={option.value} href={`/dashboard?range=${option.value}`} className={`rounded-full px-4 py-2 text-xs font-bold transition ${range === option.value ? "bg-[#B0522D] text-white" : "bg-white/8 text-white/75 hover:bg-white/14"}`}>{option.label}</Link>
            ))}
            <div className="hidden lg:block"><DashboardAutoRefresh /></div>
            <span className="ml-1 hidden text-xs text-white/55 xl:inline">{admin.name}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1540px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 xl:grid-cols-10">
          <Kpi label="Visitantes" value={number(data.summary.visitors)} detail={`${data.summary.visitorsDelta >= 0 ? "+" : ""}${percent(data.summary.visitorsDelta)} vs. período anterior`} />
          <Kpi label="Sessões" value={number(data.summary.sessions)} detail={`${data.summary.sessionsDelta >= 0 ? "+" : ""}${percent(data.summary.sessionsDelta)} vs. período anterior`} />
          <Kpi label="Conversão" value={percent(data.summary.conversion)} detail={`${number(data.summary.orders)} pedidos`} accent />
          <Kpi label="Receita" value={money(data.summary.revenue)} detail={`Ticket médio ${money(data.summary.aov)}`} />
          <Kpi label="Pageviews" value={number(data.summary.pageviews)} detail={`${data.summary.sessions ? (data.summary.pageviews / data.summary.sessions).toFixed(1).replace(".", ",") : "0"} páginas/sessão`} />
          <Kpi label="Engajamento" value={duration(data.summary.avgEngagement)} detail="Tempo médio ativo" />
          <Kpi label="Rejeição" value={percent(data.summary.bounceRate)} detail="1 página e <10s" />
          <Kpi label="WhatsApp" value={number(data.summary.whatsappClicks)} detail="Cliques em atendimento" />
          <Kpi label="Erros JS" value={number(data.summary.errors)} detail="Detectados no navegador" />
          <Kpi label="Pedidos" value={number(data.summary.orders)} detail="Pagamentos confirmados" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <Panel eyebrow="Diagnóstico automático" title="O que merece sua atenção agora">
            {data.insights.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.insights.map((insight) => (
                  <div key={`${insight.title}-${insight.text}`} className={`rounded-2xl border p-4 ${insight.tone === "good" ? "border-emerald-200 bg-emerald-50" : insight.tone === "warn" ? "border-amber-200 bg-amber-50" : "border-[#D9E2EC] bg-[#F6F9FC]"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${insight.tone === "good" ? "bg-emerald-500" : insight.tone === "warn" ? "bg-amber-500" : "bg-[#47739F]"}`} />
                      <h3 className="text-sm font-black text-[#09274B]">{insight.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#647386]">{insight.text}</p>
                  </div>
                ))}
              </div>
            ) : <Empty text="Ainda não há volume suficiente para gerar diagnóstico automático." />}
          </Panel>

          <Panel eyebrow="Tendência" title="Tráfego no período">
            {data.timeline.length ? (
              <div className="flex h-44 items-end gap-1.5 overflow-hidden rounded-2xl bg-[#F7F5F2] px-3 pb-3 pt-5">
                {data.timeline.map((item, index) => {
                  const height = Math.max(4, (item.sessions / maxTimeline) * 100);
                  return <div key={`${item.bucket}-${index}`} className="group relative flex h-full min-w-0 flex-1 items-end"><div className="w-full rounded-t-md bg-[#09274B] transition group-hover:bg-[#B0522D]" style={{ height: `${height}%` }} title={`${new Date(item.bucket).toLocaleString("pt-BR")} · ${item.sessions} sessões`} /></div>;
                })}
              </div>
            ) : <Empty text="A curva aparecerá quando chegarem as primeiras sessões." />}
          </Panel>
        </div>

        <Panel eyebrow="Funil de compra" title="Onde o cliente avança — e onde desiste">
          <div className="grid gap-3 md:grid-cols-5">
            {data.funnel.map((step, index) => {
              const first = data.funnel[0]?.value || 0;
              const previous = index ? data.funnel[index - 1].value : step.value;
              const fromPrevious = previous ? (step.value / previous) * 100 : 0;
              return (
                <div key={step.label} className="relative rounded-2xl border border-[#E0E5EA] bg-[#FAFBFC] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#788596]">{step.label}</p>
                  <p className="mt-2 font-serif text-3xl text-[#09274B]">{number(step.value)}</p>
                  <div className="mt-3"><Progress value={step.value} max={first} tone={index === data.funnel.length - 1 ? "green" : index >= 2 ? "terracotta" : "navy"} /></div>
                  <p className="mt-2 text-xs text-[#7A8795]">{index === 0 ? "Base do período" : `${percent(fromPrevious)} da etapa anterior`}</p>
                  {index < data.funnel.length - 1 ? <span className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white px-1 text-[#B7C0CA] md:block">→</span> : null}
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel eyebrow="Aquisição" title="De onde os clientes vêm">
            {data.sources.length ? <div className="space-y-4">{data.sources.map((item) => <div key={`${item.source}-${item.medium}`}><div className="mb-1.5 flex items-end justify-between gap-3"><div><p className="font-bold">{item.source}</p><p className="text-xs text-[#7A8795]">{item.medium} · {percent(item.conversion)} conversão</p></div><div className="text-right"><p className="font-bold">{number(item.sessions)}</p><p className="text-xs text-[#7A8795]">{money(item.revenue)}</p></div></div><Progress value={item.sessions} max={maxSource} /></div>)}</div> : <Empty text="Ainda não há origens registradas." />}
          </Panel>

          <Panel eyebrow="Geografia aproximada" title="Cidades e estados que mais chegam">
            {data.geo.length ? <div className="space-y-4">{data.geo.slice(0, 12).map((item) => <div key={`${item.region}-${item.city}`}><div className="mb-1.5 flex items-end justify-between gap-3"><div><p className="font-bold">{item.city || "Cidade não identificada"}</p><p className="text-xs text-[#7A8795]">{item.region || "Estado não identificado"} · {item.orders} pedido(s)</p></div><div className="text-right"><p className="font-bold">{number(item.sessions)}</p><p className="text-xs text-[#7A8795]">{money(item.revenue)}</p></div></div><Progress value={item.sessions} max={maxGeo} tone="terracotta" /></div>)}</div> : <Empty text="A geografia aparecerá nas requisições processadas pela Vercel." />}
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel eyebrow="Conteúdo" title="Páginas mais visitadas">
            {data.pages.length ? <div className="space-y-3">{data.pages.slice(0, 10).map((item) => <div key={item.path}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="min-w-0 truncate font-semibold" title={item.path}>{shortPath(item.path)}</span><span className="shrink-0 text-[#6F7D8D]">{item.views}</span></div><Progress value={item.views} max={maxPage} /></div>)}</div> : <Empty text="Sem pageviews no período." />}
          </Panel>

          <Panel eyebrow="Interação" title="O que mais recebe cliques">
            {data.clicks.length ? <div className="space-y-3">{data.clicks.slice(0, 10).map((item, index) => <div key={`${item.label}-${index}`}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="min-w-0 truncate font-semibold" title={item.targetUrl}>{item.label || "Clique"}</span><span className="shrink-0 text-[#6F7D8D]">{item.clicks}</span></div><Progress value={item.clicks} max={maxClick} tone="terracotta" /></div>)}</div> : <Empty text="Sem cliques registrados ainda." />}
          </Panel>

          <Panel eyebrow="Catálogo" title="Produtos que despertam interesse">
            {data.products.length ? <div className="space-y-3">{data.products.slice(0, 10).map((item) => <div key={item.productId}><div className="mb-1 flex justify-between gap-3 text-sm"><div className="min-w-0"><p className="truncate font-semibold">{item.name}</p><p className="text-[11px] text-[#7A8795]">{item.adds} adições · {percent(item.addRate)} taxa de carrinho</p></div><span className="shrink-0 text-[#6F7D8D]">{item.views} views</span></div><Progress value={item.views} max={maxProduct} tone="green" /></div>)}</div> : <Empty text="Os produtos aparecerão conforme forem vistos." />}
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel eyebrow="Tecnologia" title="Dispositivos">
            {data.devices.length ? <div className="space-y-4">{data.devices.map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-sm"><span className="font-bold capitalize">{item.label}</span><span>{item.value} sessões · {item.secondary || 0} pedidos</span></div><Progress value={item.value} max={maxDevice} /></div>)}</div> : <Empty text="Sem dados de dispositivo." />}
          </Panel>
          <Panel eyebrow="Compatibilidade" title="Navegadores">
            {data.browsers.length ? <div className="divide-y divide-[#EEF1F4]">{data.browsers.map((item) => <div key={item.label} className="flex justify-between gap-3 py-3 text-sm"><span className="font-semibold">{item.label}</span><span className="text-[#6F7D8D]">{item.value}</span></div>)}</div> : <Empty text="Sem navegadores registrados." />}
          </Panel>
          <Panel eyebrow="Experiência" title="Performance & estabilidade">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F7F8FA] p-4"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#788596]">TTFB médio</p><p className="mt-2 font-serif text-2xl">{Math.round(data.performance.ttfb)}ms</p></div>
              <div className="rounded-2xl bg-[#F7F8FA] p-4"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#788596]">DOM pronto</p><p className="mt-2 font-serif text-2xl">{Math.round(data.performance.domReady)}ms</p></div>
              <div className="rounded-2xl bg-[#F7F8FA] p-4"><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#788596]">Load médio</p><p className="mt-2 font-serif text-2xl">{Math.round(data.performance.loadMs)}ms</p></div>
              <div className={`rounded-2xl p-4 ${data.summary.errors ? "bg-amber-50" : "bg-emerald-50"}`}><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#788596]">Erros JS</p><p className="mt-2 font-serif text-2xl">{data.summary.errors}</p></div>
            </div>
          </Panel>
        </div>

        {data.campaigns.length ? <Panel eyebrow="UTM" title="Campanhas rastreadas"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-[10px] uppercase tracking-[.13em] text-[#7A8795]"><tr><th className="pb-3">Campanha</th><th className="pb-3">Origem</th><th className="pb-3 text-right">Sessões</th><th className="pb-3 text-right">Pedidos</th><th className="pb-3 text-right">Receita</th></tr></thead><tbody className="divide-y divide-[#EEF1F4]">{data.campaigns.map((item) => <tr key={`${item.campaign}-${item.source}`}><td className="py-3 font-semibold">{item.campaign}</td><td className="py-3">{item.source}</td><td className="py-3 text-right">{item.sessions}</td><td className="py-3 text-right">{item.orders}</td><td className="py-3 text-right font-semibold">{money(item.revenue)}</td></tr>)}</tbody></table></div></Panel> : null}

        <Panel eyebrow="Jornadas" title="Sessões recentes — veja o caminho completo de cada pessoa">
          {data.recent.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="text-[10px] uppercase tracking-[.13em] text-[#7A8795]"><tr><th className="pb-3">Quando</th><th className="pb-3">Origem</th><th className="pb-3">Cidade/UF</th><th className="pb-3">Dispositivo</th><th className="pb-3">Páginas</th><th className="pb-3">Tempo</th><th className="pb-3">Última ação</th><th className="pb-3 text-right">Resultado</th></tr></thead>
                <tbody className="divide-y divide-[#EEF1F4]">{data.recent.map((item) => <tr key={item.sessionId} className="transition hover:bg-[#FAF8F6]"><td className="py-3"><Link href={`/dashboard/sessoes/${encodeURIComponent(item.sessionId)}?range=${range}`} className="font-bold text-[#B0522D] hover:underline">{new Date(item.startedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</Link></td><td className="py-3"><span className="font-semibold">{item.source}</span><br/><span className="text-xs text-[#84909D]">{item.medium}</span></td><td className="py-3">{item.city || "—"}{item.region ? `/${item.region}` : ""}</td><td className="py-3 capitalize">{item.deviceType}<br/><span className="text-xs text-[#84909D]">{item.browser}</span></td><td className="py-3">{item.pageViews}</td><td className="py-3">{duration(item.engagedSeconds)}</td><td className="max-w-[220px] truncate py-3" title={item.lastPath}>{item.lastEvent}<br/><span className="text-xs text-[#84909D]">{shortPath(item.lastPath)}</span></td><td className="py-3 text-right">{item.converted ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Comprou · {money(item.revenue)}</span> : <span className="text-[#84909D]">Sem compra</span>}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <Empty text="As jornadas aparecerão aqui assim que o rastreamento começar a receber tráfego consentido." />}
        </Panel>

        <footer className="pb-8 pt-2 text-center text-xs leading-5 text-[#85919D]">
          BrinqueTEAndo Intelligence · Analytics first-party com consentimento · Geografia aproximada, sem armazenamento de IP bruto ou fingerprint.
        </footer>
      </main>
    </div>
  );
}
