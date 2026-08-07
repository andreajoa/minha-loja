import Link from "next/link";
import type { ReactNode } from "react";

type Section = {
  title: string;
  content: ReactNode;
};

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
  note?: ReactNode;
};

export default function PolicyPage({ eyebrow, title, intro, sections, note }: Props) {
  return (
    <main className="bg-background">
      <section className="hero-grid relative overflow-hidden border-b border-border/45 px-5 py-14 sm:py-18 lg:py-22">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/8" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full border border-secondary/10" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-secondary sm:text-xs">{eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl leading-[1.02] text-primary sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-text-light sm:text-base sm:leading-8">{intro}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-muted">Última atualização: agosto de 2026</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <article className="min-w-0 space-y-5">
          {sections.map((section, index) => (
            <section key={section.title} className="rounded-[1.7rem] border border-border/50 bg-white p-6 shadow-[0_16px_45px_rgba(9,38,71,0.06)] sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-alt font-display text-xl text-secondary">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <h2 className="font-display text-2xl leading-tight text-primary sm:text-3xl">{section.title}</h2>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-text-light sm:text-base">{section.content}</div>
                </div>
              </div>
            </section>
          ))}

          {note ? (
            <div className="rounded-[1.5rem] border-l-4 border-secondary bg-background-alt p-6 text-sm leading-7 text-text-light sm:text-base">{note}</div>
          ) : null}
        </article>

        <aside className="h-fit rounded-[1.7rem] border border-border/50 bg-primary p-6 text-white shadow-[0_18px_50px_rgba(9,38,71,0.12)] lg:sticky lg:top-36">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-secondary-light">Precisa falar com a loja?</p>
          <h2 className="mt-3 font-display text-3xl">Atendimento humanizado</h2>
          <p className="mt-4 text-sm leading-6 text-white/75">Dúvidas sobre pedido, entrega, pagamento, privacidade, troca ou reembolso podem ser enviadas diretamente para nossa equipe.</p>
          <a href="mailto:info@brinqueteando.online" className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-secondary px-5 text-center text-sm font-black text-white transition hover:bg-white hover:text-primary">info@brinqueteando.online</a>
          <p className="mt-4 text-xs leading-5 text-white/60">Atendimento de segunda a sexta, das 9h às 18h.</p>
          <div className="mt-6 border-t border-white/15 pt-5">
            <Link href="/contato" className="text-xs font-black uppercase tracking-[0.13em] text-secondary-light hover:text-white">Central de atendimento →</Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
