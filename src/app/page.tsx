import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const commitments = [
  ["🧠", "Curadoria responsável", "Cada recurso é apresentado com possibilidades reais de uso, sem promessas terapêuticas."],
  ["🔒", "Compra protegida", "Pagamento processado pela Stripe. Os dados do cartão não ficam armazenados na loja."],
  ["💛", "Escolhas com propósito", "Materiais para brincar, comunicar, explorar e compartilhar momentos em família."],
] as const;

export default function Home() {
  const highlights = products.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal/20 via-creme to-lavanda/25">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-amarelo/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-menta/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex rounded-full border border-teal/20 bg-white/75 px-4 py-2 text-sm font-extrabold text-teal-dark shadow-sm backdrop-blur">
              Brinquedos sensoriais e pedagógicos
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-ardosia sm:text-5xl lg:text-6xl">
              Brincar também é uma forma de <span className="text-teal-dark">comunicar, aprender e se conectar.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ardosia/75">
              Uma seleção de recursos para crianças com diferentes formas de perceber e interagir com o mundo, com curadoria de Margareth Almeida, Neuropsicopedagoga.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/colecoes"
                className="rounded-full bg-teal px-8 py-4 text-center font-black text-white shadow-lg shadow-teal/20 transition hover:-translate-y-0.5 hover:bg-teal-dark"
              >
                Conhecer os produtos
              </Link>
              <Link
                href="/sobre"
                className="rounded-full border-2 border-ardosia/15 bg-white/70 px-8 py-4 text-center font-black transition hover:border-teal hover:text-teal-dark"
              >
                Entender a curadoria
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-ardosia/65">
              <span>✓ Pagamento por cartão</span>
              <span>✓ Compra segura</span>
              <span>✓ Suporte humanizado</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-[2.5rem] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-ardosia/10 backdrop-blur">
              <div className="grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((product, index) => (
                  <div
                    key={product.id}
                    className={`flex aspect-square items-center justify-center rounded-3xl text-6xl shadow-sm ${
                      index % 4 === 0
                        ? "bg-menta/30"
                        : index % 4 === 1
                          ? "bg-lavanda/30"
                          : index % 4 === 2
                            ? "bg-amarelo/30"
                            : "bg-coral/20"
                    }`}
                  >
                    {product.emoji}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-3xl bg-ardosia p-5 text-white">
                <p className="text-sm font-semibold text-amarelo">Mais do que comprar um brinquedo</p>
                <p className="mt-1 text-xl font-black">Escolha um recurso que faça sentido para a criança e para a rotina da família.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">Seleção em destaque</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Recursos para diferentes objetivos do brincar</h2>
          </div>
          <Link href="/colecoes" className="font-black text-teal-dark hover:underline">
            Ver todos os produtos →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-dark">Nosso compromisso</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Informação clara para uma escolha mais segura</h2>
            <p className="mt-4 leading-relaxed text-ardosia/70">
              Nenhum brinquedo substitui avaliação ou acompanhamento individualizado. A proposta da BrinqueTEAndo é ajudar famílias e profissionais a encontrarem materiais úteis para experiências de brincar mediadas e significativas.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {commitments.map(([icon, title, text]) => (
              <div key={title} className="rounded-3xl border border-teal/10 bg-creme p-7">
                <span className="text-4xl" aria-hidden="true">{icon}</span>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-relaxed text-ardosia/70">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="overflow-hidden rounded-[2.5rem] bg-ardosia px-6 py-12 text-white sm:px-12 md:flex md:items-center md:justify-between md:gap-10">
          <div className="max-w-2xl">
            <p className="font-black text-amarelo">Está em dúvida sobre qual material escolher?</p>
            <h2 className="mt-2 text-3xl font-black">Conte o que você busca e nossa equipe orienta a escolha.</h2>
            <p className="mt-4 text-white/75">Explique a idade da criança, o interesse atual e o tipo de atividade que deseja realizar.</p>
          </div>
          <Link
            href="/contato"
            className="mt-8 inline-flex shrink-0 rounded-full bg-amarelo px-8 py-4 font-black text-ardosia transition hover:-translate-y-0.5 md:mt-0"
          >
            Falar com a BrinqueTEAndo
          </Link>
        </div>
      </section>
    </>
  );
}
