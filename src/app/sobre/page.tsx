import Link from "next/link";

const values = [
  {
    icon: "♡",
    title: "Acolhimento",
    text: "Informação compreensível para apoiar famílias em escolhas mais seguras e conscientes.",
  },
  {
    icon: "✦",
    title: "Intencionalidade",
    text: "Recursos organizados pelo objetivo do brincar, sem promessas exageradas ou soluções universais.",
  },
  {
    icon: "🤝",
    title: "Mediação",
    text: "O brinquedo abre possibilidades; a presença do adulto amplia vínculo, comunicação e aprendizagem.",
  },
] as const;

export default function Sobre() {
  return (
    <div className="bg-background">
      <section className="hero-grid overflow-hidden border-b border-border/45 px-4 py-14 sm:px-5 sm:py-22">
        <div className="mx-auto grid max-w-7xl items-center gap-9 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">
              Nossa curadoria
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[0.98] text-primary sm:text-6xl lg:text-7xl">
              Brincar com propósito, respeito e informação responsável.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-text-light sm:text-lg">
              A BrinqueTEAndo nasceu do olhar de Margareth Almeida, Neuropsicopedagoga, para as necessidades reais de crianças e famílias que buscam recursos de brincar com mais clareza.
            </p>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[1.7rem] border border-white/70 bg-background-alt shadow-[0_28px_75px_rgba(9,38,71,0.12)] sm:rounded-[2.4rem]">
            <img
              src="/instagram-strip/3.png"
              alt="Criança explorando uma atividade de coordenação motora fina"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/45 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-display text-2xl leading-tight text-white drop-shadow sm:bottom-7 sm:left-7 sm:right-7 sm:text-3xl">
              Cada criança tem seu ritmo. Cada brincadeira pode começar por uma possibilidade diferente.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-[1.5rem] border border-border/50 bg-white p-6 shadow-[0_16px_42px_rgba(9,38,71,0.06)] sm:rounded-[2rem] sm:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background-alt text-2xl text-secondary" aria-hidden="true">
                {value.icon}
              </span>
              <h2 className="mt-5 font-display text-3xl text-primary">{value.title}</h2>
              <p className="mt-3 leading-7 text-text-light">{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary px-4 py-14 text-white sm:px-5 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary-light">
              Informação responsável
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              Os produtos são recursos de brincar. Não substituem avaliação, terapia ou acompanhamento individualizado.
            </h2>
            <p className="mt-5 max-w-3xl leading-7 text-white/72">
              Nossa proposta é ajudar a família a observar interesses, faixa etária, segurança, possibilidades de uso e formas de participação do adulto.
            </p>
          </div>
          <Link
            href="/colecoes"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-secondary px-7 text-center text-sm font-black text-white transition hover:bg-white hover:text-primary lg:w-auto"
          >
            Conhecer a curadoria
          </Link>
        </div>
      </section>
    </div>
  );
}
