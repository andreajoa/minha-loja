import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDashboardAdmin } from "@/lib/dashboard-auth";
import { getMarketingTemplateForEditor } from "@/lib/email-intelligence";
import { updateEmailTemplateAction } from "../actions";

export const metadata: Metadata = {
  title: "Editor de E-mail",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EmailTemplateEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ alias: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const admin = await requireDashboardAdmin();
  const { alias } = await params;
  const query = await searchParams;
  const template = await getMarketingTemplateForEditor(alias);
  if (!template) notFound();

  return (
    <div className="min-h-screen bg-[#F4F1EE] px-4 py-6 text-[#09274B] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="rounded-[2rem] bg-[#09274B] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#DFA486]">Editor controlado · Resend</p>
              <h1 className="mt-2 font-serif text-4xl">{template.name}</h1>
              <p className="mt-2 text-sm text-white/65">Alias: {template.alias} · Status: {template.status}</p>
            </div>
            <Link href="/dashboard/email" className="w-fit rounded-full bg-white px-5 py-2.5 text-xs font-black text-[#09274B]">← Voltar ao E-mail Intelligence</Link>
          </div>
        </header>

        {query.saved === "1" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Alteração salva e publicada no Resend. Os próximos envios da automação usarão esta versão.</div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <form action={updateEmailTemplateAction} className="rounded-[1.75rem] border border-[#DDE4EA] bg-white p-5 shadow-sm sm:p-6">
            <input type="hidden" name="alias" value={template.alias} />
            <div>
              <label htmlFor="subject" className="text-[10px] font-black uppercase tracking-[.15em] text-[#718094]">Assunto</label>
              <input id="subject" name="subject" defaultValue={template.subject} maxLength={180} required className="mt-2 w-full rounded-2xl border border-[#CCD5DE] bg-white px-4 py-3 text-base font-bold outline-none focus:border-[#B0522D]" />
              <p className="mt-2 text-xs leading-5 text-[#718094]">Quando a abertura estiver baixa e a entrega estiver saudável, altere primeiro apenas o assunto. Assim você consegue saber se a mudança realmente melhorou a abertura.</p>
            </div>

            <div className="mt-5">
              <label htmlFor="reason" className="text-[10px] font-black uppercase tracking-[.15em] text-[#718094]">Hipótese do teste</label>
              <textarea id="reason" name="reason" rows={3} placeholder="Ex.: tornar a promessa mais específica para aumentar abertura sem mudar o corpo." className="mt-2 w-full rounded-2xl border border-[#CCD5DE] px-4 py-3 text-sm leading-6 outline-none focus:border-[#B0522D]" />
            </div>

            <div className="mt-5">
              <label htmlFor="html" className="text-[10px] font-black uppercase tracking-[.15em] text-[#718094]">Corpo completo do e-mail · HTML</label>
              <textarea id="html" name="html" defaultValue={template.html} rows={26} required spellCheck={false} className="mt-2 w-full rounded-2xl border border-[#CCD5DE] bg-[#071B32] px-4 py-4 font-mono text-xs leading-5 text-[#E8F0F7] outline-none focus:border-[#B0522D]" />
              <p className="mt-2 text-xs leading-5 text-[#718094]">Este campo dá controle total do corpo, imagem, CTA e rodapé. A versão anterior fica registrada no histórico de alterações antes da publicação.</p>
            </div>

            <button type="submit" className="mt-6 w-full rounded-full bg-[#B0522D] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5">Salvar e publicar no Resend</button>
            <p className="mt-3 text-center text-[11px] text-[#8290A0]">Ação disponível somente para {admin.email}</p>
          </form>

          <section className="rounded-[1.75rem] border border-[#DDE4EA] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#B0522D]">Prévia atual</p><h2 className="mt-1 font-serif text-3xl">Como o e-mail está</h2></div>
              <span className="rounded-full bg-[#F3DED0] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-[#8F4328]">640px</span>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#DDE4EA] bg-[#FFF8F3]">
              <iframe title={`Prévia ${template.name}`} srcDoc={template.html} sandbox="" className="h-[900px] w-full bg-white" />
            </div>
            <div className="mt-4 rounded-2xl bg-[#F7F5F2] p-4 text-xs leading-5 text-[#667588]">
              Para preservar a leitura dos resultados, mude uma variável principal por teste: <strong>assunto</strong>, <strong>corpo/CTA</strong> ou <strong>oferta</strong>. O painel mostrará depois se abertura, clique e conversão melhoraram.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
