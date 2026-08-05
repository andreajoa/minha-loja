import type { Metadata } from "next";
import Link from "next/link";
import CollectionExplorer from "@/components/CollectionExplorer";
import { activeProducts, categories, goals } from "@/data/products";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Encontre brinquedos sensoriais e pedagógicos pelo objetivo do brincar, faixa etária e forma de uso.",
};

const choiceSteps = [
  {
    number: "1",
    title: "Comece pelo objetivo",
    text: "Pense no que deseja favorecer durante a brincadeira: turnos, exploração, rotina, coordenação ou foco.",
  },
  {
    number: "2",
    title: "Observe a criança",
    text: "Considere interesses, recusas, faixa etária e a forma como ela costuma explorar objetos e atividades.",
  },
  {
    number: "3",
    title: "Planeje a mediação",
    text: "Um recurso ganha valor quando o adulto sabe apresentar, adaptar e respeitar o ritmo da criança.",
  },
] as const;

export default function Colecoes() {
  return (
    <>
      <section className="border-b border-teal/10 bg-gradient-to-br from-teal/15 via-creme to-lavanda/20">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">
              Escolha com mais segurança
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Não comece pelo brinquedo. Comece pelo que você deseja construir durante o brincar.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ardosia/72">
              A BrinqueTEAndo organiza o catálogo por objetivo, forma de uso e faixa etária para reduzir dúvidas e ajudar famílias e profissionais a fazerem escolhas mais conscientes.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalogo"
                className="rounded-full bg-teal px-7 py-4 font-black text-white shadow-lg shadow-teal/20 transition hover:bg-teal-dark"
              >
                Encontrar um produto
              </a>
              <Link
                href="/contato"
                className="rounded-full border-2 border-ardosia/15 bg-white/70 px-7 py-4 font-black transition hover:border-teal hover:text-teal-dark"
              >
                Preciso de orientação
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:py-18">
        <div className="grid gap-5 md:grid-cols-3">
          {choiceSteps.map((step) => (
            <article key={step.number} className="rounded-[2rem] border border-teal/10 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal text-lg font-black text-white">
                {step.number}
              </span>
              <h2 className="mt-5 text-xl font-black">{step.title}</h2>
              <p className="mt-3 leading-relaxed text-ardosia/68">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-36 px-4 pb-16 md:pb-24">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-dark">
            Catálogo BrinqueTEAndo
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Encontre o recurso que combina com o momento atual da criança
          </h2>
          <p className="mt-4 leading-relaxed text-ardosia/68">
            Filtre pelo que você busca. Em cada produto, mostramos possibilidades de uso, para quem ele pode fazer sentido e quando não é indicado.
          </p>
        </div>

        <CollectionExplorer
          products={activeProducts}
          categories={categories}
          goals={goals}
        />
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">
              Comprar com consciência
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Um brinquedo não precisa prometer milagres para ser uma boa escolha.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ardosia/70">
              Ele precisa ser seguro, adequado, interessante para a criança e apresentar possibilidades reais de brincadeira. É isso que nossa curadoria procura tornar visível antes da compra.
            </p>
          </div>

          <div className="rounded-[2rem] bg-ardosia p-7 text-white shadow-xl">
            <p className="font-black text-amarelo">Ainda está em dúvida?</p>
            <p className="mt-3 text-xl font-black leading-snug">
              Conte a idade, os interesses e o tipo de atividade que você deseja realizar.
            </p>
            <Link
              href="/contato"
              className="mt-6 inline-flex rounded-full bg-amarelo px-6 py-3 font-black text-ardosia"
            >
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
