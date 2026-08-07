import Link from "next/link";

export default function Contato() {
  return (
    <div className="bg-background">
      <section className="hero-grid border-b border-border/45 px-4 py-12 sm:px-5 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">
            Atendimento humanizado
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[0.98] text-primary sm:text-6xl">
            Fale com a BrinqueTEAndo
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-light sm:text-lg">
            Dúvidas sobre produtos, pagamento, entrega ou escolha por objetivo do brincar são bem-vindas.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-5 sm:py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.6rem] border border-border/50 bg-white p-6 shadow-[0_20px_55px_rgba(9,38,71,0.07)] sm:rounded-[2rem] sm:p-9">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">
            Canal oficial
          </p>
          <h2 className="mt-3 font-display text-3xl text-primary sm:text-4xl">
            Como podemos ajudar?
          </h2>
          <p className="mt-4 leading-7 text-text-light">
            Ao escrever, informe o nome do produto ou a necessidade que deseja esclarecer. Isso ajuda a tornar o atendimento mais objetivo.
          </p>

          <a
            href="mailto:info@brinqueteando.online"
            className="mt-7 flex min-w-0 flex-col rounded-2xl bg-background-alt p-5 transition hover:-translate-y-0.5 hover:bg-secondary/10"
          >
            <span className="text-xs font-black uppercase tracking-[0.14em] text-secondary">
              E-mail
            </span>
            <strong className="mt-2 break-all text-lg text-primary sm:text-xl">
              info@brinqueteando.online
            </strong>
          </a>

          <div className="mt-4 rounded-2xl border border-border/45 p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-secondary">
              Horário de atendimento
            </p>
            <p className="mt-2 font-bold leading-6 text-primary">
              Segunda a sexta, das 9h às 18h
            </p>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[1.6rem] bg-primary p-6 text-white sm:rounded-[2rem] sm:p-9">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/8" />
          <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl" aria-hidden="true">
              ♡
            </span>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-secondary-light">
              Curadoria responsável
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight">
              Informação clara antes da compra
            </h2>
            <p className="mt-5 leading-7 text-white/75">
              A curadoria é conduzida por Margareth Almeida, Neuropsicopedagoga. Os produtos são recursos de brincar e não substituem avaliação ou acompanhamento individualizado.
            </p>
            <Link
              href="/colecoes"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-secondary px-6 text-center text-sm font-black text-white transition hover:bg-white hover:text-primary sm:w-auto"
            >
              Explorar produtos
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
