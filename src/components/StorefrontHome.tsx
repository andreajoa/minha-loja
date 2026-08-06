import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import { categories, formatPrice, products, type Product } from "@/data/products";

const visualBackgrounds = [
  "linear-gradient(145deg, #FDF9F6 0%, #F2E6DE 58%, #E9D4C8 100%)",
  "linear-gradient(145deg, #F2E6DE 0%, #FDF9F6 55%, #E4D7D5 100%)",
  "linear-gradient(145deg, #FDF9F6 0%, #E7EBF0 58%, #F2E6DE 100%)",
  "linear-gradient(145deg, #F2E6DE 0%, #FDF9F6 48%, #E3CFBF 100%)",
  "linear-gradient(145deg, #FDF9F6 0%, #EEE3DD 52%, #DDE3EA 100%)",
  "linear-gradient(145deg, #F2E6DE 0%, #FDF9F6 55%, #E7D8CF 100%)",
] as const;

const categoryIcons: Record<string, string> = {
  Fidget: "🌀",
  Sensorial: "🖐️",
  Motor: "🧩",
  Comunicação: "💬",
  Cognitivo: "🧠",
  Rotina: "🗓️",
};

const trustPoints = [
  ["Curadoria profissional", "Escolhas organizadas por objetivo do brincar"],
  ["Compra protegida", "Pagamento processado com segurança pela Stripe"],
  ["Suporte humanizado", "Orientação clara antes e depois da compra"],
] as const;

const steps = [
  ["01", "Observe o interesse", "O que chama a atenção da criança hoje: textura, movimento, encaixe, som, sequência ou faz de conta?"],
  ["02", "Defina o objetivo", "Você quer ampliar interação, organizar uma espera, explorar coordenação, comunicação ou autonomia?"],
  ["03", "Comece simples", "Apresente um recurso por vez, participe da brincadeira e observe como a criança responde."],
] as const;

function ProductVisual({
  product,
  index = 0,
  className = "",
  emojiClassName = "text-8xl",
  animated = false,
}: {
  product: Product;
  index?: number;
  className?: string;
  emojiClassName?: string;
  animated?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: visualBackgrounds[index % visualBackgrounds.length] }}
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-secondary-light/25" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/35" />
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className={`h-full w-full object-contain p-6 sm:p-8 ${animated ? "transition duration-700 hover:scale-105" : ""}`}
          loading={index > 1 ? "lazy" : "eager"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`${emojiClassName} ${animated ? "animate-sway" : ""} drop-shadow-[0_22px_28px_rgba(9,38,71,0.16)]`}
            aria-hidden="true"
          >
            {product.emoji}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  centered?: boolean;
}) {
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
        <h1 className="mt-4 font-display text-5xl">Cadastre o primeiro produto para ativar a loja.</h1>
      </section>
    );
  }

  const hero = products.find((product) => product.id === "14955388567918") ?? products[0];
  const campaign = products.find((product) => product.id === "14944174637422") ?? products[0];
  const categoryList = categories.filter((category) => category !== "Todos");
  const featuredIds = [
    "14955388567918",
    "14943278334318",
    "14943419564398",
    "14944174637422",
    "14943441977710",
    "14944017875310",
  ];
  const featuredProducts = featuredIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  const categoryNavigation = [
    { label: "Sensorial", category: "Sensorial", image: "/home-images/categoria-sensorial.png" },
    { label: "Comunicação", category: "Comunicação", image: "/home-images/categoria-comunicacao.png" },
    { label: "Motor", category: "Motor", image: "/home-images/categoria-motor.png" },
    { label: "Autonomia", category: "Autonomia", image: "/home-images/categoria-rotina.png" },
  ] as const;

  const collectionCards = [
    { title: "Exploração sensorial", category: "Sensorial", image: "/home-images/categoria-sensorial.png" },
    { title: "Linguagem e comunicação", category: "Comunicação", image: "/home-images/categoria-comunicacao.png" },
    { title: "Coordenação e movimento", category: "Motor", image: "/home-images/categoria-motor.png" },
    { title: "Rotina e autonomia", category: "Autonomia", image: "/home-images/categoria-rotina.png" },
  ] as const;

  const socialGallery = [
    "/home-images/galeria-nova-sensorial.png",
    "/home-images/galeria-nova-rotina.png",
    "/home-images/galeria-nova-motor.png",
    "/home-images/galeria-nova-comunicacao.png",
  ] as const;

  return (
    <div className="overflow-hidden bg-background">
      <section className="hero-grid relative min-h-[720px] overflow-hidden border-b border-border/45">
        <div className="absolute left-[7%] top-24 hidden h-20 w-20 animate-float items-center justify-center rounded-[32%] bg-white/80 text-4xl shadow-xl lg:flex" aria-hidden="true">🧩</div>
        <div className="absolute right-[7%] top-28 hidden h-16 w-16 animate-float-slow items-center justify-center rounded-full bg-secondary/10 text-3xl lg:flex" aria-hidden="true">⭐</div>
        <div className="absolute bottom-24 left-[47%] hidden h-14 w-14 animate-bob items-center justify-center rounded-full border border-secondary-light/35 bg-white/80 text-2xl lg:flex" aria-hidden="true">💬</div>
        <div className="absolute left-[44%] top-20 hidden animate-sparkle text-3xl text-secondary-light lg:block" aria-hidden="true">✦</div>
        <div className="absolute bottom-16 right-[4%] hidden animate-pulse-soft text-4xl text-secondary/30 lg:block" aria-hidden="true">●</div>

        <div className="relative mx-auto grid min-h-[720px] max-w-[1440px] items-center gap-10 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-secondary/20 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-secondary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary sm:text-xs">Curadoria neuropsicopedagógica</p>
            </div>

            <h1 className="mt-7 font-display text-5xl font-normal leading-[0.96] tracking-[-0.04em] text-primary sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Brinquedos que convidam a criança a <em className="font-normal text-secondary">explorar, criar e se conectar.</em>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-text-light sm:text-lg">
              Recursos sensoriais e pedagógicos escolhidos para transformar momentos simples da rotina em experiências de brincar mais intencionais, leves e significativas.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/colecoes"
                className="button-shimmer inline-flex min-h-14 items-center justify-center rounded-full bg-secondary px-8 text-sm font-black uppercase tracking-[0.13em] text-white shadow-[0_16px_35px_rgba(161,77,45,0.24)] transition hover:-translate-y-1 hover:bg-primary"
              >
                Explorar produtos
              </Link>
              <Link
                href="#como-escolher"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-primary/25 bg-white/65 px-8 text-sm font-black uppercase tracking-[0.13em] text-primary transition hover:-translate-y-1 hover:border-primary hover:bg-white"
              >
                Como escolher
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-text-light">
              <span>✓ Informação responsável</span>
              <span>✓ Compra segura</span>
              <span>✓ Apoio humanizado</span>
            </div>
          </div>

          <div className="relative mx-auto h-[470px] w-full max-w-[620px] lg:h-[600px]">
            <div className="playful-ring absolute inset-8 animate-orbit" />
            <div className="absolute inset-x-10 bottom-8 top-10 rounded-[46%_54%_48%_52%/42%_44%_56%_58%] bg-white/55 shadow-[0_30px_90px_rgba(9,38,71,0.10)]" />
            <ProductVisual
              product={hero}
              className="absolute inset-0 bg-transparent"
              emojiClassName="text-[13rem] sm:text-[17rem] lg:text-[21rem]"
              animated
            />

            <div className="toy-chip absolute right-2 top-20 h-16 w-16 animate-float text-3xl sm:right-8" aria-hidden="true">♡</div>
            <div className="toy-chip absolute bottom-20 left-0 h-14 w-14 animate-float-slow text-2xl sm:left-5" aria-hidden="true">✦</div>

            <Link
              href={`/produto/${hero.id}`}
              className="soft-glass absolute bottom-3 left-3 max-w-[280px] rounded-3xl p-5 transition hover:-translate-y-1 sm:left-10"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Destaque da curadoria</p>
              <p className="mt-2 font-display text-2xl leading-tight text-primary">{hero.name}</p>
              <div className="mt-3 flex items-center justify-between gap-5">
                <p className="font-display text-2xl text-primary">{formatPrice(hero.price)}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/12 px-5 py-6 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {trustPoints.map(([title, text], index) => (
            <div key={title} className="group px-6 py-5">
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-secondary-light transition group-hover:scale-110" aria-hidden="true">
                {index === 0 ? "✦" : index === 1 ? "◇" : "♡"}
              </span>
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
          text="Não existe brinquedo universal. Existe um recurso que conversa melhor com o interesse, o momento e o objetivo daquela criança."
          centered
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(([number, title, text], index) => (
            <article key={number} className="brand-card relative overflow-hidden rounded-[2rem] border border-border/55 bg-white p-7 sm:p-8">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-background-alt" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl text-secondary-light">{number}</span>
                  <span className={`category-emoji text-4xl ${index === 1 ? "animate-bob" : ""}`} aria-hidden="true">
                    {index === 0 ? "👀" : index === 1 ? "🎯" : "🌱"}
                  </span>
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
          <SectionHeading
            eyebrow="Navegação simples"
            title="Escolha pelo objetivo do brincar"
            text="As categorias são criadas automaticamente a partir dos produtos cadastrados na loja."
            centered
          />

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-7 md:grid-cols-4">
            {categoryNavigation.map((item) => (
              <Link
                key={item.label}
                href={`/colecoes?categoria=${encodeURIComponent(item.category)}`}
                className="category-play group text-center"
              >
                <div className="storybook-shadow relative mx-auto flex aspect-square w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-background transition duration-300 group-hover:-translate-y-2 group-hover:border-secondary-light/50">
                  <div className="absolute inset-2 z-10 rounded-full border border-secondary/15" />
                  <img src={item.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-primary transition group-hover:text-secondary">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Seleção em destaque"
            title="Recursos que convidam a participar"
            text="Produtos apresentados com objetivo, faixa etária, estoque e possibilidades reais de exploração."
          />
          <Link href="/colecoes" className="nav-link shrink-0 text-sm font-black uppercase tracking-[0.14em] text-secondary">Ver todos →</Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-secondary-light/20" />
        <div className="absolute -bottom-32 right-12 h-80 w-80 rounded-full bg-secondary/18 blur-2xl" />
        <div className="absolute right-[10%] top-12 animate-float text-5xl text-secondary-light/50" aria-hidden="true">✦</div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-secondary-light">Oferta clara e responsável</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] sm:text-5xl">Uma loja para reduzir a dúvida — não para criar pressão.</h2>
            <p className="mt-5 max-w-2xl leading-7 text-white/72">
              Você encontra informações para comparar, compreender o uso e decidir com mais segurança. Sem promessas milagrosas, sem urgência artificial e sem esconder o que importa.
            </p>
            <Link href="/sobre" className="button-shimmer mt-8 inline-flex min-h-12 items-center rounded-full bg-secondary px-7 text-xs font-black uppercase tracking-[0.15em] text-white hover:bg-secondary-light hover:text-primary">Conhecer a curadoria</Link>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-3xl border border-white/16 bg-white/7 backdrop-blur">
            {[
              [`${categoryList.length || 1}+`, "categorias"],
              ["100%", "preço validado"],
              ["1:1", "suporte humano"],
            ].map(([value, label]) => (
              <div key={label} className="border-l border-white/15 px-3 py-8 text-center first:border-l-0">
                <strong className="font-display text-3xl text-secondary-light sm:text-4xl">{value}</strong>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[570px] overflow-hidden rounded-[2rem] storybook-shadow">
            <img
              src="/home-images/curadoria-com-proposito.png"
              alt="Adulto e criança explorando uma atividade de brincar com mediação"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="lg:pl-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-secondary">Curadoria com propósito</p>
            <h2 className="mt-4 font-display text-5xl leading-[1.02] text-primary">Comece pelo interesse, não pela dificuldade.</h2>
            <p className="mt-6 text-lg leading-8 text-text-light">
              Quando a criança se envolve, a interação fica mais possível. Por isso, cada produto é apresentado como um convite à exploração e não como uma promessa de resultado.
            </p>
            <div className="mt-8 space-y-4">
              {["Descrição clara e linguagem acessível", "Possibilidades de uso sem promessas terapêuticas", "Informação sobre faixa etária e segurança", "Escolha respeitosa à singularidade da criança"].map((item) => (
                <div key={item} className="flex items-center gap-4 rounded-2xl border border-border/50 bg-white px-5 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-black text-secondary">✓</span>
                  <p className="font-bold text-primary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background-alt py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading
            eyebrow="Produto em destaque"
            title="Uma escolha para explorar de muitas maneiras"
            text="A vitrine principal é alimentada automaticamente pelo cadastro dos produtos."
            centered
          />

          <div className="storybook-shadow mt-12 grid overflow-hidden rounded-[2.2rem] bg-white lg:grid-cols-[1.05fr_0.95fr]">
            <ProductVisual product={campaign} index={3} className="min-h-[520px]" emojiClassName="text-[16rem]" animated />
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
              <span className="w-fit rounded-full bg-secondary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.17em] text-secondary">Destaque da semana</span>
              <h2 className="mt-6 font-display text-5xl leading-none text-primary">{campaign.name}</h2>
              <p className="mt-4 font-display text-4xl text-secondary">{formatPrice(campaign.price)}</p>
              <p className="mt-6 leading-7 text-text-light">{campaign.description}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {campaign.benefits.map((benefit) => (
                  <span key={benefit} className="rounded-full border border-border/65 bg-background px-4 py-2 text-xs font-bold text-primary">{benefit}</span>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <AddToCartButton productId={campaign.id} disabled={campaign.stock <= 0} />
                <Link href={`/produto/${campaign.id}`} className="inline-flex min-h-14 items-center justify-center rounded-full border border-primary/25 px-7 text-xs font-black uppercase tracking-[0.15em] text-primary transition hover:bg-primary hover:text-white">Ver detalhes</Link>
              </div>
              <p className="mt-4 text-xs font-bold text-muted">{campaign.stock > 0 ? `${campaign.stock} unidades disponíveis` : "Produto esgotado"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Coleções"
          title="Um universo de possibilidades para cada momento"
          text="As coleções também são montadas automaticamente conforme os produtos cadastrados."
          centered
        />

        <div className="mt-12 grid min-h-[660px] gap-4 lg:grid-cols-12 lg:grid-rows-2">
          {collectionCards.map((item, index) => {
            const spans = ["lg:col-span-5 lg:row-span-2", "lg:col-span-7", "lg:col-span-4", "lg:col-span-3"];
            return (
              <Link
                key={item.category}
                href={`/colecoes?categoria=${encodeURIComponent(item.category)}`}
                className={`group relative min-h-72 overflow-hidden rounded-[1.7rem] ${spans[index]}`}
              >
                <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/82 via-primary/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-7 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-secondary-light">{item.category}</p>
                  <h3 className="mt-2 max-w-md font-display text-4xl leading-none">{item.title}</h3>
                  <p className="mt-3 text-sm font-bold text-white/75">Ver coleção →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/45 bg-primary py-20 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <span className="inline-block animate-sparkle font-display text-6xl text-secondary-light" aria-hidden="true">“</span>
          <blockquote className="mx-auto mt-3 max-w-4xl font-display text-4xl italic leading-tight sm:text-5xl">
            Um bom recurso não faz o trabalho sozinho. Ele abre uma possibilidade — e a mediação transforma essa possibilidade em aprendizagem.
          </blockquote>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-white/55">Margareth Almeida · Neuropsicopedagoga</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-secondary">Precisa de ajuda?</p>
            <h2 className="mt-4 font-display text-5xl leading-none text-primary">Dúvidas antes da compra são bem-vindas.</h2>
            <p className="mt-5 leading-7 text-text-light">Nosso suporte ajuda com informações sobre produto, faixa etária, medidas, pagamento e entrega.</p>
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
                  {question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-xl font-light text-secondary transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-2xl leading-7 text-text-light">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background-alt py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {socialGallery.map((image, index) => (
              <div key={image} className="aspect-square overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition duration-500 hover:-translate-y-2">
                <img src={image} alt={`Família brincando com recurso educativo ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
          <div className="mt-7 text-center">
            <p className="font-display text-3xl text-primary">@neuromargarethapoio</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-muted">Conteúdo que ensina antes de vender</p>
          </div>
        </div>
      </section>
    </div>
  );
}
