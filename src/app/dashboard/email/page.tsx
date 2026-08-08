import type { Metadata } from "next";
import Link from "next/link";
import { requireDashboardAdmin } from "@/lib/dashboard-auth";
import { getEmailIntelligenceData, type EmailRange } from "@/lib/email-intelligence";
import { enableEmailTrackingAction } from "./actions";

export const metadata: Metadata = {
  title: "E-mail Intelligence",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const ranges: Array<{ value: EmailRange; label: string }> = [
  { value: 1, label: "Hoje" },
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

function p(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function n(value: number) {
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#DDE4EA] bg-white p-5 shadow-[0_16px_45px_rgba(9,39,75,.06)]">
      <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#718094]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#09274B]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[#718094]">{detail}</p>
    </div>
  );
}

function Grade({ grade, score }: { grade: string; score: number }) {
  const cls = grade === "Excelente" ? "bg-emerald-100 text-emerald-800" : grade === "Boa" ? "bg-blue-100 text-blue-800" : grade === "Atenção" ? "bg-amber-100 text-amber-800" : grade === "Fraca" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] ${cls}`}>{grade}{grade !== "Sem amostra" ? ` · ${score}` : ""}</span>;
}

function kind(alias: string) {
  if (alias.includes("newsletter")) return "Newsletter";
  if (alias.includes("cart")) return "Carrinho";
  return "Checkout";
}

function mask(email: string) {
  const [left, domain] = email.split("@");
  if (!left || !domain) return email;
  return `${left.slice(0, 2)}•••@${domain}`;
}

export default async function EmailDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const admin = await requireDashboardAdmin();
  const params = await searchParams;
  const requested = Number(params.range || 7);
  const range: EmailRange = [1, 7, 30, 90].includes(requested) ? (requested as EmailRange) : 7;
  const data = await getEmailIntelligenceData(range);

  return (
    <div className="min-h-screen bg-[#F4F1EE] px-4 py-6 text-[#09274B] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1540px] space-y-6">
        <header className="rounded-[2rem] bg-[#09274B] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#DFA486]">BrinqueTEAndo Intelligence</p>
              <h1 className="mt-2 font-serif text-4xl sm:text-5xl">E-mail Intelligence</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">Entrega, abertura, clique, conversão, receita atribuída e diagnóstico de copy por e-mail. Aberturas são um sinal direcional; decisões de otimização dão mais peso a clique e compra.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ranges.map((item) => <Link key={item.value} href={`/dashboard/email?range=${item.value}`} className={`rounded-full px-4 py-2 text-xs font-bold ${range === item.value ? "bg-[#B0522D]" : "bg-white/10 hover:bg-white/15"}`}>{item.label}</Link>)}
              <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#09274B]">Comportamento & vendas</Link>
            </div>
          </div>
        </header>

        {!data.configured ? (
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <h2 className="font-serif text-3xl">Banco de e-mail ainda não inicializado</h2>
            <p className="mt-3 text-sm leading-6">O código já está preparado. As tabelas de inteligência de e-mail precisam ser criadas no Neon antes de receber os webhooks.</p>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              <Kpi label="Enviados" value={n(data.summary.sent)} detail="Mensagens disparadas" />
              <Kpi label="Entregues" value={p(data.summary.deliveryRate)} detail={`${n(data.summary.delivered)} entregues`} />
              <Kpi label="Abertura" value={p(data.summary.openRate)} detail={`${n(data.summary.opened)} aberturas únicas`} />
              <Kpi label="CTR" value={p(data.summary.clickRate)} detail={`${n(data.summary.clicked)} cliques únicos`} />
              <Kpi label="CTOR" value={p(data.summary.clickToOpenRate)} detail="Clique entre quem abriu" />
              <Kpi label="Conversão" value={p(data.summary.conversionRate)} detail={`${n(data.summary.orders)} pedidos atribuídos`} />
              <Kpi label="Receita" value={money(data.summary.revenue)} detail="Último clique em e-mail · 7 dias" />
              <Kpi label="Problemas" value={n(data.summary.bounced + data.summary.complained + data.summary.failed)} detail="Bounce + spam + falhas" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-[1.75rem] border border-[#DDE4EA] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#B0522D]">Diagnóstico automático</p>
                <h2 className="mt-1 font-serif text-3xl">O que mudar primeiro</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {data.insights.map((item) => <div key={item.title} className={`rounded-2xl border p-4 ${item.tone === "good" ? "border-emerald-200 bg-emerald-50" : item.tone === "warn" ? "border-amber-200 bg-amber-50" : "border-blue-100 bg-blue-50"}`}><p className="font-black">{item.title}</p><p className="mt-2 text-sm leading-6 text-[#617084]">{item.text}</p></div>)}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[#DDE4EA] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#B0522D]">Infraestrutura</p>
                <h2 className="mt-1 font-serif text-3xl">Tracking e webhooks</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-[#F7F5F2] p-4"><span>Webhook Resend</span><strong className={data.webhook.enabled ? "text-emerald-700" : "text-rose-700"}>{data.webhook.enabled ? "Ativo" : "Pendente"}</strong></div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#F7F5F2] p-4"><span>Open tracking</span><strong>{data.tracking.openTracking ? "Ativo" : "Desativado"}</strong></div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#F7F5F2] p-4"><span>Click tracking</span><strong>{data.tracking.clickTracking ? "Ativo" : "Desativado"}</strong></div>
                  {(!data.tracking.openTracking || !data.tracking.clickTracking) ? <form action={enableEmailTrackingAction}><button className="w-full rounded-full bg-[#B0522D] px-5 py-3 text-sm font-black text-white">Ativar abertura + cliques</button></form> : null}
                  {data.tracking.trackingRecord && data.tracking.trackingRecord.status !== "verified" ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><strong>DNS de tracking pendente</strong><br />{data.tracking.trackingRecord.type}: {data.tracking.trackingRecord.name}<br />Valor: <span className="break-all font-mono">{data.tracking.trackingRecord.value}</span></div> : null}
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[#DDE4EA] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#B0522D]">25 e-mails sob controle</p><h2 className="mt-1 font-serif text-3xl">Desempenho por assunto e template</h2></div>
                <p className="max-w-xl text-xs leading-5 text-[#718094]">Score combina entregabilidade, abertura, clique, clique após abertura e compra. Abertura recebe peso menor porque pixels podem ser afetados por proteções de privacidade.</p>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[1100px] w-full text-left text-sm">
                  <thead><tr className="border-b border-[#E4E9EE] text-[10px] uppercase tracking-[.12em] text-[#718094]"><th className="py-3 pr-4">E-mail</th><th className="px-3">Score</th><th className="px-3">Envios</th><th className="px-3">Abertura</th><th className="px-3">CTR</th><th className="px-3">CTOR</th><th className="px-3">Conversão</th><th className="px-3">Receita</th><th className="pl-3">Ação</th></tr></thead>
                  <tbody>{data.templates.map((item) => <tr key={item.alias} className="border-b border-[#EEF1F4] align-top"><td className="py-4 pr-4"><span className="text-[9px] font-black uppercase tracking-[.13em] text-[#B0522D]">{kind(item.alias)}</span><p className="mt-1 max-w-md font-bold">{item.subject}</p><p className="mt-1 max-w-md text-xs leading-5 text-[#718094]">{item.recommendation}</p></td><td className="px-3 py-4"><Grade grade={item.grade} score={item.score} /></td><td className="px-3 py-4 font-bold">{n(item.sent)}</td><td className="px-3 py-4">{p(item.openRate)}</td><td className="px-3 py-4">{p(item.clickRate)}</td><td className="px-3 py-4">{p(item.clickToOpenRate)}</td><td className="px-3 py-4">{p(item.conversionRate)}</td><td className="px-3 py-4 font-bold">{money(item.revenue)}</td><td className="pl-3 py-4"><Link href={`/dashboard/email/${item.alias}`} className="inline-flex rounded-full bg-[#09274B] px-4 py-2 text-xs font-black text-white">Editar</Link></td></tr>)}</tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[#DDE4EA] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#B0522D]">Auditoria de envio</p>
              <h2 className="mt-1 font-serif text-3xl">E-mails mais recentes</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[1000px] w-full text-left text-sm"><thead><tr className="border-b text-[10px] uppercase tracking-[.12em] text-[#718094]"><th className="py-3 pr-4">Data</th><th className="px-3">Destinatário</th><th className="px-3">Assunto</th><th className="px-3">Status</th><th className="px-3">Abriu</th><th className="px-3">Clicou</th><th className="px-3">Pedido</th></tr></thead><tbody>{data.recent.map((item) => <tr key={item.emailId} className="border-b border-[#EEF1F4]"><td className="py-3 pr-4 whitespace-nowrap">{item.sentAt ? new Date(item.sentAt).toLocaleString("pt-BR") : "—"}</td><td className="px-3">{mask(item.recipient)}</td><td className="px-3 max-w-sm">{item.subject}</td><td className="px-3 font-bold">{item.status}</td><td className="px-3">{item.openedAt ? `Sim · ${item.opens}x` : "Não"}</td><td className="px-3">{item.clickedAt ? `Sim · ${item.clicks}x` : "Não"}</td><td className="px-3">{item.orders ? `${item.orders} · ${money(item.revenue)}` : "—"}</td></tr>)}</tbody></table>
              </div>
              {!data.recent.length ? <p className="mt-5 rounded-2xl bg-[#F7F5F2] p-6 text-center text-sm text-[#718094]">Os próximos envios aparecerão aqui assim que o webhook começar a receber eventos.</p> : null}
            </section>
          </>
        )}

        <footer className="pb-8 text-center text-xs text-[#718094]">Acesso exclusivo: {admin.email}</footer>
      </div>
    </div>
  );
}
