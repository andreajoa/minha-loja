import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/products";

const trustPoints = [
  ["Curadoria responsável", "Escolhas organizadas por objetivo do brincar"],
  ["Compra protegida", "Pagamento seguro no checkout da Stripe"],
  ["Suporte humanizado", "Informação clara antes e depois da compra"],
] as const;

const steps = [
  ["01", "Observe o interesse", "Perceba o que chama a atenção da criança hoje: textura, movimento, encaixe, som, sequência ou faz de conta."],
  ["02", "Considere o momento", "Observe a faixa etária, o perfil da criança e o tipo de apoio necessário naquela fase."],
  ["03", "Participe da brincadeira", "Apresente um recurso por vez, nomeie ações, espere turnos e acompanhe a resposta da criança."],
] as const;

const categoryIcons: Record<string, string> = {
  Sensorial: "🖐️",
  Comunicação: "💬",
  Cognitivo: "🧠",
  Autonomia: "🌱",
  Motor: "🧩",
  Criatividade: "🎨",
  Aquático: "💧",
};

const editorialBanners = [
  { image: "/homepage-banners/banner-1.svg", href: "/colecoes", label: "Brincar com intenção" },
  { image: "/homepage-banners/banner-2.svg", href: "/colecoes?categoria=Sensorial", label: "Estimulação lúdica" },
  { image: "/homepage-banners/banner-3.svg", href: "/sobre", label: "Escolha com clareza" },
  { image: "/homepage-banners/banner-4.svg", href: "/contato", label: "Mediação no brincar" },
] as const;

function SectionHeading({ eyebrow, title, text, centered = false }: { eyebrow: string; title: string; text?: string; centered?: boolean }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-secondary">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl leading-[1.02] text-primary sm:text-5xl lg:text-6xl">{title}</h2>
      {text ? <p className="mt-5 text-base leading-7 text-text-light sm:text-lg">{text}</p> : null}
    </div>
  );
}

export default function StorefrontHome() {
  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">BrinqueTEAndo</p>
        <h1 className="mt-4 font-display text-5xl text-primary">Cadastre o primeiro produto para ativar a loja.</h1>
      </section>
    );
  }

  const categoryList = categories.filter((category) => category !== "Todos");
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="overflow-hidden bg-background">
      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/12 px-5 py-6 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {trustPoints.map(([title, text], index) => (
            <div key={title} className="px-6 py-5">
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-secondary-light" aria-hidden="true">{index === 0 ? "✦" : index === 1 ? "◇" : "♡"}</span>
              <p className="mt-3 font-display text-2xl">{title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/65">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-escolher" className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Ensinar antes de vender"
          title="A melhor escolha começa observando a criança."
          text="Não existe um brinquedo universal. Existe um recurso que conversa melhor com o interesse, o momento e o objetivo daquela criança."
          centered
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(([number, title, text], index) => (
            <article key={number} className="brand-card relative overflow-hidden rounded-[2rem] border border-border/55 bg-white p-7 sm:p-8">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-background-alt" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl text-secondary-light">{number}</span>
                  <span className="text-4xl" aria-hidden="true">{index === 0 ? "👀" : index === 1 ? "🎯" : "🤝"}</span>
                </div>
                <h3 className="mt-8 font-display text-3xl text-primary">{title}</h3>
                <p className="mt-4 leading-7 text-text-light">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/45 bg-background-alt py-18 sm:py-22">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <SectionHeading eyebrow="Navegação simples" title="Escolha pelo objetivo do brincar" text="Acesse as categorias sem depender de fotografias promocionais." centered />
          <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-5 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {categoryList.slice(0, 6).map((category) => (
              <Link key={category} href={`/colecoes?categoria=${encodeURIComponent(category)}`} className="group min-w-36 snap-start text-center">
                <div className="relative mx-auto flex aspect-square w-32 items-center justify-center rounded-full border-4 border-white bg-background shadow-[0_18px_45px_rgba(9,38,71,0.10)] transition duration-300 group-hover:-translate-y-2 group-hover:border-secondary-light/50">
                  <div className="absolute inset-2 rounded-full border border-secondary/15" />
                  <span className="relative text-5xl" aria-hidden="true">{categoryIcons[category] ?? "✦"}</span>
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-primary transition group-hover:text-secondary">{category}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Produtos reais" title="Recursos disponíveis na loja" text="As fotografias, descrições, preços e estoque agora fazem parte do próprio projeto." />
          <Link href="/colecoes" className="nav-link shrink-0 text-sm font-black uppercase tracking-[0.14em] text-secondary">Ver todos →</Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="bg-background-alt py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading eyebrow="Curadoria com propósito" title="Conteúdo que orienta antes de vender" text="As áreas editoriais da homepage usam os banners criados para a marca, sem transformar fotografias de produtos em decoração." centered />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {editorialBanners.map((banner) => (
              <Link key={banner.image} href={banner.href} className="group overflow-hidden rounded-[2rem] border border-border/45 bg-white shadow-[0_22px_60px_rgba(9,38,71,0.09)] transition duration-300 hover:-translate-y-1">
                <img src={banner.image} alt={banner.label} className="aspect-[16/9] w-full object-contain transition duration-500 group-hover:scale-[1.01]" loading="lazy" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <span className="font-display text-6xl text-secondary-light" aria-hidden="true">“</span>
          <blockquote className="mx-auto mt-3 max-w-4xl font-display text-4xl italic leading-tight sm:text-5xl">
            Um bom recurso abre uma possibilidade. A mediação transforma essa possibilidade em experiência e aprendizagem.
          </blockquote>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-white/55">Margareth Almeida · Neuropsicopedagoga</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-secondary">Precisa de ajuda?</p>
            <h2 className="mt-4 font-display text-5xl leading-none text-primary">Dúvidas antes da compra são bem-vindas.</h2>
            <p className="mt-5 leading-7 text-text-light">O suporte ajuda com informações sobre produto, faixa etária, medidas, pagamento e entrega.</p>
            <Link href="/contato" className="button-shimmer mt-8 inline-flex min-h-12 items-center rounded-full bg-secondary px-7 text-xs font-black uppercase tracking-[0.15em] text-white hover:bg-primary">Falar com a loja</Link>
          </div>
          <div className="space-y-3">
            {[
              ["Como escolher um produto para a minha criança?", "Comece pelo interesse atual, pela faixa etária e pelo tipo de experiência que você deseja criar."],
              ["Os brinquedos substituem terapia ou avaliação?", "Não. São recursos de brincar e aprendizagem e não substituem acompanhamento individualizado."],
              ["Como funciona o pagamento?", "O checkout é processado pela Stripe e os dados do cartão não ficam armazenados na loja."],
              ["Posso pedir ajuda antes de comprar?", "Sim. Envie a idade, o interesse atual e o que você busca para receber uma orientação mais objetiva."],
            ].map(([question, answer]) => (
              <details key={question} className="group rounded-2xl border border-border/50 bg-white px-6 py-5 open:border-secondary/30 open:bg-background-alt">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black text-primary">
                  {question}<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-xl font-light text-secondary transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-2xl leading-7 text-text-light">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background-alt py-18 sm:py-22">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <p className="font-display text-3xl text-primary">@neuromargarethapoio</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-muted">Conteúdo que ensina antes de vender</p>
        </div>
      </section>
    </div>
  );
}
