import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { activeProducts } from "@/data/products";

const decisionQuestions = [
  {
    icon: "🎯",
    title: "O que desejo favorecer?",
    text: "Foco, comunicação, coordenação, turnos, previsibilidade ou apenas uma nova experiência de brincar?",
  },
  {
    icon: "👀",
    title: "Como a criança costuma explorar?",
    text: "Ela aproxima, observa, manipula, organiza, repete, evita texturas ou prefere movimentos específicos?",
  },
  {
    icon: "🤝",
    title: "Como o adulto vai participar?",
    text: "A mediação transforma o objeto em oportunidade de escolha, interação, linguagem e brincadeira compartilhada.",
  },
] as const;

const commitments = [
  [
    "🧠",
    "Curadoria responsável",
    "Apresentamos possibilidades reais de uso, limites e cuidados, sem promessas terapêuticas ou resultados garantidos.",
  ],
  [
    "🧭",
    "Orientação antes da compra",
    "Você entende para quem o produto pode fazer sentido, como apresentar e quando ele pode não ser a melhor escolha.",
  ],
  [
    "🔒",
    "Compra protegida",
    "Pagamento processado pela Stripe. Os dados do cartão não ficam armazenados na BrinqueTEAndo.",
  ],
] as const;

const commonQuestions = [
  {
    question: "Os brinquedos são apenas para crianças autistas ou com TDAH?",
    answer:
      "Não. São recursos de brincar que podem interessar a diferentes crianças. A curadoria destaca formas de uso que ajudam famílias e profissionais a fazer escolhas mais conscientes.",
  },
  {
    question: "Um produto pode reduzir crises ou melhorar a atenção?",
    answer:
      "Não é responsável prometer esse resultado. Um recurso pode participar de uma rotina de apoio, mas comportamento e desenvolvimento dependem de contexto, necessidades individuais e mediação adequada.",
  },
  {
    question: "Como sei qual produto escolher?",
    answer:
      "Comece pelo objetivo do brincar, observe os interesses e recusas da criança e confira a faixa etária. Cada página de produto mostra possibilidades de uso, público e contraindicações práticas.",
  },
] as const;

export default function Home() {
  const featured = activeProducts.filter((product) => product.featured).slice(0, 3);
  const bestSeller =
    activeProducts.find((product) => product.bestSeller) || activeProducts[0];
  const goals = Array.from(new Set(activeProducts.map((product) => product.goal))).slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal/20 via-creme to-lavanda/25">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-amarelo/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-menta/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex rounded-full border border-teal/20 bg-white/80 px-4 py-2 text-sm font-black text-teal-dark shadow-sm backdrop-blur">
              Curadoria neuropsicopedagógica para o brincar
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-ardosia sm:text-5xl lg:text-6xl">
              Antes de comprar mais um brinquedo, entenda
              <span className="text-teal-dark"> o que ele pode construir na brincadeira.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ardosia/75">
              A BrinqueTEAndo ajuda você a escolher recursos pelo objetivo, pelo interesse da criança e pelas possibilidades reais de uso — não por promessas fáceis.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/colecoes"
                className="rounded-full bg-teal px-8 py-4 text-center font-black text-white shadow-lg shadow-teal/20 transition hover:-translate-y-0.5 hover:bg-teal-dark"
              >
                Encontrar o produto certo
              </Link>
              <a
                href="#como-escolher"
                className="rounded-full border-2 border-ardosia/15 bg-white/75 px-8 py-4 text-center font-black transition hover:border-teal hover:text-teal-dark"
              >
                Aprender antes de comprar
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-ardosia/65">
              <span>✓ Escolha por objetivo</span>
              <span>✓ Uso explicado</span>
              <span>✓ Compra segura</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-[2.5rem] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-ardosia/10 backdrop-blur">
              <div className="rounded-3xl bg-ardosia p-6 text-white">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-amarelo">
                  O erro mais comum
                </p>
                <p className="mt-3 text-2xl font-black leading-snug">
                  Comprar pelo rótulo “sensorial” sem saber como a criança vai usar aquele objeto.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {activeProducts.slice(0, 4).map((product, index) => (
                  <Link
                    href={`/produto/${product.slug}`}
                    key={product.id}
                    className={`group flex aspect-square flex-col items-center justify-center rounded-3xl p-4 text-center shadow-sm transition hover:-translate-y-1 ${
                      index % 4 === 0
                        ? "bg-menta/30"
                        : index % 4 === 1
                          ? "bg-lavanda/30"
                          : index % 4 === 2
                            ? "bg-amarelo/30"
                            : "bg-coral/20"
                    }`}
                  >
                    <span className="text-5xl" aria-hidden="true">{product.emoji}</span>
                    <span className="mt-3 text-xs font-black leading-tight group-hover:text-teal-dark">
                      {product.goal}
                    </span>
                  </Link>
                ))}
              </div>

              <p className="mt-5 rounded-2xl bg-creme p-4 text-sm font-bold leading-relaxed text-ardosia/70">
                Aqui, cada produto responde três perguntas: para quem pode fazer sentido, como usar e quando não escolher.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-escolher" className="mx-auto max-w-7xl scroll-mt-36 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">
            Ensinar primeiro
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Três perguntas evitam compras por impulso e brinquedos esquecidos
          </h2>
          <p className="mt-4 leading-relaxed text-ardosia/70">
            Um recurso tem mais chance de entrar na rotina quando a escolha considera intenção, interesse e participação do adulto.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {decisionQuestions.map((item) => (
            <article key={item.title} className="rounded-[2rem] border border-teal/10 bg-white p-7 shadow-sm">
              <span className="text-4xl" aria-hidden="true">{item.icon}</span>
              <h3 className="mt-5 text-xl font-black">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-ardosia/70">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-dark">
                Comece pela necessidade atual
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Escolha pelo objetivo da brincadeira, não apenas pela aparência do produto
              </h2>
            </div>
            <Link href="/colecoes" className="font-black text-teal-dark hover:underline">
              Explorar o catálogo completo →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => (
              <Link
                href="/colecoes"
                key={goal}
                className={`rounded-[1.75rem] border border-teal/10 p-6 transition hover:-translate-y-1 hover:shadow-lg ${
                  index % 3 === 0
                    ? "bg-menta/18"
                    : index % 3 === 1
                      ? "bg-lavanda/18"
                      : "bg-amarelo/18"
                }`}
              >
                <p className="text-sm font-black text-coral">Quero apoiar</p>
                <h3 className="mt-2 text-xl font-black">{goal}</h3>
                <p className="mt-3 text-sm font-bold text-teal-dark">Ver produtos relacionados →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {bestSeller ? (
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="overflow-hidden rounded-[2.5rem] border border-teal/10 bg-gradient-to-br from-ardosia to-[#1f2a31] text-white shadow-2xl shadow-ardosia/10">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[380px_1fr] lg:items-center lg:p-12">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-menta/30 via-lavanda/25 to-amarelo/30 text-9xl">
                {bestSeller.image ? (
                  <img src={bestSeller.image} alt={bestSeller.name} className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden="true">{bestSeller.emoji}</span>
                )}
              </div>

              <div>
                <span className="inline-flex rounded-full bg-amarelo px-4 py-2 text-sm font-black text-ardosia">
                  Produto mais procurado
                </span>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-teal">
                  Uma oferta clara, sem exageros
                </p>
                <h2 className="mt-3 text-3xl font-black sm:text-4xl">{bestSeller.name}</h2>
                <p className="mt-4 text-xl font-bold leading-relaxed text-white/90">
                  {bestSeller.hook}
                </p>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {bestSeller.benefits.slice(0, 4).map((benefit) => (
                    <li key={benefit} className="flex gap-3 rounded-2xl bg-white/8 p-4 font-bold">
                      <span className="text-amarelo">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href={`/produto/${bestSeller.slug}`}
                    className="rounded-full bg-teal px-7 py-4 text-center font-black text-white transition hover:bg-teal-dark"
                  >
                    Ver tudo o que preciso saber
                  </Link>
                  <p className="text-sm text-white/65">
                    Confira uso, público, limites e perguntas frequentes antes de comprar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">
              Seleção em destaque
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Recursos com diferentes possibilidades de uso
            </h2>
          </div>
          <Link href="/colecoes" className="font-black text-teal-dark hover:underline">
            Ver todos os produtos →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-dark">
              Por que comprar aqui
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Mais clareza para decidir. Menos promessas para convencer.
            </h2>
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

      <section className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">Dúvidas reais</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">O que você precisa saber antes da compra</h2>
        </div>

        <div className="mt-10 space-y-4">
          {commonQuestions.map((item) => (
            <details key={item.question} className="group rounded-3xl border border-teal/10 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none pr-8 text-lg font-black">
                {item.question}
              </summary>
              <p className="mt-4 max-w-4xl leading-relaxed text-ardosia/70">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:pb-20">
        <div className="overflow-hidden rounded-[2.5rem] bg-ardosia px-6 py-12 text-white sm:px-12 md:flex md:items-center md:justify-between md:gap-10">
          <div className="max-w-2xl">
            <p className="font-black text-amarelo">Agora você já sabe como escolher</p>
            <h2 className="mt-2 text-3xl font-black">
              Encontre um produto coerente com a criança, a rotina e a brincadeira que deseja construir.
            </h2>
            <p className="mt-4 text-white/75">
              Consulte objetivos, modo de uso, faixa etária e limites antes de adicionar ao carrinho.
            </p>
          </div>
          <Link
            href="/colecoes"
            className="mt-8 inline-flex shrink-0 rounded-full bg-amarelo px-8 py-4 font-black text-ardosia transition hover:-translate-y-0.5 md:mt-0"
          >
            Escolher meu produto
          </Link>
        </div>
      </section>
    </>
  );
}
