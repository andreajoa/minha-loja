import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import { categories, formatPrice, products, type Product } from "@/data/products";

const visualBackgrounds = [
  "linear-gradient(145deg, #dfe8df 0%, #f5eee7 55%, #e8d7d1 100%)",
  "linear-gradient(145deg, #eadfda 0%, #f7f2ed 52%, #d8e3df 100%)",
  "linear-gradient(145deg, #ece3cf 0%, #f7f2ec 52%, #d8dfe8 100%)",
  "linear-gradient(145deg, #d9e2e8 0%, #f5eee7 55%, #e5d7cf 100%)",
  "linear-gradient(145deg, #e4ddd5 0%, #f8f3ef 50%, #dce6d7 100%)",
  "linear-gradient(145deg, #e5d7dd 0%, #f8f3ef 50%, #d9e6e1 100%)",
] as const;

const categoryIcons: Record<string, string> = {
  Fidget: "🌀",
  Sensorial: "🖐️",
  Motor: "🧩",
  Comunicação: "💬",
  Cognitivo: "🧠",
  Rotina: "🗓️",
};

function ProductVisual({
  product,
  index = 0,
  className = "",
  emojiClassName = "text-8xl",
}: {
  product: Product;
  index?: number;
  className?: string;
  emojiClassName?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: visualBackgrounds[index % visualBackgrounds.length] }}
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          loading={index > 1 ? "lazy" : "eager"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${emojiClassName} drop-shadow-[0_18px_25px_rgba(61,42,32,0.12)]`} aria-hidden="true">
            {product.emoji}
          </span>
        </div>
      )}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center border-l border-white/35 px-5 text-center first:border-l-0">
      <strong className="font-display text-3xl font-normal text-white sm:text-4xl">{value}</strong>
      <span className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">{label}</span>
    </div>
  );
}

export default function StorefrontHome() {
  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">BrinqueTEAndo</p>
        <h1 className="mt-4 font-display text-5xl">Cadastre o primeiro produto para ativar a loja.</h1>
      </section>
    );
  }

  const hero = products[0];
  const story = products[1] ?? hero;
  const campaign = products[2] ?? hero;
  const featured = products[3] ?? hero;
  const categoryList = categories.filter((category) => category !== "Todos");
  const galleryProducts = Array.from({ length: 6 }, (_, index) => products[index % products.length]);
  const collectionProducts = Array.from({ length: 4 }, (_, index) => products[(index + 1) % products.length]);

  return (
    <div className="overflow-hidden bg-creme">
      <section className="relative min-h-[620px] overflow-hidden bg-oat lg:min-h-[690px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_42%)]" />
        <div className="relative mx-auto grid min-h-[620px] max-w-[1440px] items-center gap-8 px-5 py-16 lg:min-h-[690px] lg:grid-cols-[1.03fr_0.97fr] lg:px-10">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-ardosia/60">Curadoria neuropsicopedagógica</p>
            <h1 className="font-display text-5xl font-normal leading-[0.98] tracking-[-0.035em] text-ardosia sm:text-6xl lg:text-7xl">
              Brinquedos que transformam o brincar em <em className="font-normal text-coral">conexão.</em>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-ardosia/72 sm:text-lg">
              Recursos sensoriais e pedagógicos escolhidos para ajudar famílias e profissionais a criarem experiências de brincar mais intencionais, leves e possíveis na rotina real.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/colecoes" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-white px-8 text-sm font-bold uppercase tracking-[0.14em] text-ardosia shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">Comprar agora</Link>
              <Link href="#como-escolher" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-ardosia/50 px-8 text-sm font-bold uppercase tracking-[0.14em] text-ardosia transition hover:bg-white/55">Como escolher</Link>
            </div>
          </div>

          <div className="relative mx-auto h-[390px] w-full max-w-xl lg:h-[560px]">
            <div className="absolute inset-x-8 bottom-5 top-16 rounded-[44%_56%_48%_52%/40%_45%_55%_60%] bg-white/45 blur-[1px]" />
            <ProductVisual product={hero} className="absolute inset-0 bg-transparent" emojiClassName="text-[13rem] sm:text-[17rem] lg:text-[21rem]" />
            <div className="absolute bottom-2 left-3 rounded-sm bg-white/90 px-5 py-4 shadow-xl backdrop-blur sm:left-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-coral">Destaque da curadoria</p>
              <p className="mt-1 max-w-52 font-display text-2xl leading-tight">{hero.name}</p>
              <p className="mt-2 text-sm font-bold text-ardosia/70">{formatPrice(hero.price)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ardosia text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 px-5 py-7 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Curadoria profissional", "Escolhas orientadas por objetivo"],
            ["Informação antes da compra", "Para decidir com mais segurança"],
            ["Suporte humanizado", "Atendimento que escuta a família"],
          ].map(([title, text]) => (
            <div key={title} className="px-6 py-4">
              <p className="font-display text-2xl">{title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/65">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-escolher" className="relative mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative z-10 rounded-sm bg-white p-8 shadow-[0_24px_80px_rgba(61,42,32,0.10)] sm:p-12 lg:-mr-24">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Ensinar primeiro</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] sm:text-5xl">Não escolha pelo rótulo. Escolha pelo objetivo.</h2>
            <p className="mt-6 leading-7 text-ardosia/70">
              Antes de comprar, observe o que a criança busca: movimento, previsibilidade, comunicação, encaixe, textura ou interação. Um recurso funciona melhor quando parte de um interesse real e entra na rotina com mediação.
            </p>
            <Link href="/sobre" className="mt-8 inline-flex border border-ardosia px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-ardosia hover:text-white">Conheça a curadoria</Link>
          </div>
          <div className="grid min-h-[570px] grid-cols-2 gap-4">
            <ProductVisual product={story} index={1} className="col-span-2 min-h-64 rounded-sm sm:col-span-1 sm:row-span-2" />
            <ProductVisual product={campaign} index={2} className="min-h-64 rounded-sm" />
            <ProductVisual product={hero} index={3} className="min-h-64 rounded-sm" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ardosia">
        {campaign.image ? <img src={campaign.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" /> : <div className="absolute inset-0" style={{ background: visualBackgrounds[3] }} />}
        <div className="absolute inset-0 bg-ardosia/55" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-7 px-5 py-10 lg:grid-cols-[1.2fr_1fr] lg:py-14">
          <div className="text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Escolha com clareza</p>
            <h2 className="mt-2 font-display text-4xl">Uma loja pensada para reduzir a dúvida, não aumentar a pressão.</h2>
            <Link href="/colecoes" className="mt-6 inline-flex border border-white px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] hover:bg-white hover:text-ardosia">Ver produtos</Link>
          </div>
          <div className="grid grid-cols-3 border-y border-white/35 lg:border-y-0">
            <Metric value={`${categoryList.length || 1}+`} label="objetivos do brincar" />
            <Metric value="100%" label="preços validados no servidor" />
            <Metric value="1:1" label="suporte humanizado" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Valor antes da oferta</p>
            <h2 className="mt-4 font-display text-5xl leading-none">Brincar que cabe na rotina.</h2>
            <p className="mt-5 max-w-md leading-7 text-ardosia/68">Não é preciso montar uma sala perfeita. Um material bem escolhido, apresentado no momento certo e mediado com calma já pode abrir novas possibilidades de comunicação e participação.</p>
            <Link href="/colecoes" className="mt-8 inline-flex border border-ardosia px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] hover:bg-ardosia hover:text-white">Encontrar um recurso</Link>
          </div>
          <div className="relative grid min-h-[560px] grid-cols-12 grid-rows-12 gap-4">
            <ProductVisual product={products[1 % products.length]} index={1} className="col-span-7 row-span-7 rounded-sm" />
            <ProductVisual product={products[2 % products.length]} index={2} className="col-span-5 row-span-5 rounded-sm" />
            <ProductVisual product={products[3 % products.length]} index={3} className="col-span-5 row-span-7 rounded-sm" />
            <ProductVisual product={products[4 % products.length]} index={4} className="col-span-7 row-span-5 rounded-sm" />
          </div>
        </div>
      </section>

      <section className="border-y border-ardosia/10 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Navegação simples</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Compre pelo objetivo do brincar</h2>
          <div className="mt-10 flex snap-x gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {categoryList.slice(0, 6).map((category, index) => {
              const representative = products.find((product) => product.category === category) ?? hero;
              return (
                <Link key={category} href={`/colecoes?categoria=${encodeURIComponent(category)}`} className="group min-w-32 snap-start text-center">
                  <div className="mx-auto flex aspect-square w-28 items-center justify-center overflow-hidden rounded-full border border-ardosia/10 bg-oat transition group-hover:-translate-y-1 group-hover:shadow-xl">
                    {representative.image ? <img src={representative.image} alt="" className="h-full w-full object-cover" /> : <span className="text-5xl" aria-hidden="true">{categoryIcons[category] ?? representative.emoji}</span>}
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em]">{category}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="grid items-stretch lg:grid-cols-2">
          <ProductVisual product={story} index={4} className="min-h-[520px] rounded-t-sm lg:rounded-l-sm lg:rounded-tr-none" />
          <div className="flex flex-col justify-center rounded-b-sm bg-white p-9 shadow-[0_24px_70px_rgba(61,42,32,0.08)] sm:p-14 lg:rounded-r-sm lg:rounded-bl-none">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Oferta clara</p>
            <h2 className="mt-4 font-display text-5xl leading-none">Comece pelo interesse, não pela dificuldade.</h2>
            <p className="mt-6 leading-7 text-ardosia/70">Quando a criança se envolve, a interação fica mais possível. Por isso, nossa curadoria organiza os produtos por experiência de uso e objetivo do brincar — não por promessas milagrosas.</p>
            <Link href="/colecoes" className="mt-9 inline-flex w-fit border border-coral px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] text-coral transition hover:bg-coral hover:text-white">Explorar a seleção</Link>
          </div>
        </div>
      </section>

      <section className="bg-oat px-5 py-20 text-center sm:py-28">
        <div className="mx-auto flex min-h-[510px] max-w-4xl items-center justify-center rounded-full border border-sage/45 bg-[radial-gradient(circle,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.7)_47%,rgba(167,178,154,0.14)_48%,rgba(244,239,235,0)_68%)] px-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sage-dark">Presentes com propósito</p>
            <h2 className="mt-3 font-display text-5xl sm:text-6xl">Um presente que convida a criança a explorar.</h2>
            <p className="mt-6 leading-7 text-ardosia/68">Escolha pela idade, pelo interesse atual e pela forma como o material pode ser usado junto com alguém importante.</p>
            <Link href="/colecoes" className="mt-8 inline-flex border border-ardosia px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] hover:bg-ardosia hover:text-white">Ver ideias de presente</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <div className="grid overflow-hidden rounded-sm bg-white shadow-[0_24px_70px_rgba(61,42,32,0.08)] md:grid-cols-[0.48fr_1fr]">
          <div className="flex items-center justify-center p-10 text-center"><h2 className="font-display text-4xl leading-none">Nosso compromisso com escolhas responsáveis</h2></div>
          <div className="bg-clay p-9 text-white sm:p-12">
            <ul className="space-y-5 text-lg">
              {["Descrições claras, sem promessas terapêuticas", "Orientação por faixa etária, interesse e objetivo", "Pagamento protegido e preço validado no servidor", "Respeito à singularidade de cada criança"].map((item) => (
                <li key={item} className="flex items-start gap-4 border-b border-white/20 pb-5 last:border-b-0 last:pb-0"><span aria-hidden="true">›</span><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-ardosia/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-12 md:grid-cols-4">
          {[["▣", "Compra protegida", "Checkout seguro processado pela Stripe."], ["↺", "Trocas e devoluções", "Condições claras nas políticas da loja."], ["⇄", "Escolha orientada", "Informação para comparar antes de decidir."], ["☎", "Suporte humanizado", "Atendimento para dúvidas sobre a compra."]].map(([icon, title, text]) => (
            <div key={title} className="border-ardosia/10 px-5 py-6 text-center md:border-l md:first:border-l-0">
              <span className="font-display text-3xl" aria-hidden="true">{icon}</span><h3 className="mt-3 font-display text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-ardosia/62">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Veja em contexto</p>
          <h2 className="mt-3 font-display text-5xl">Explore possibilidades de uso</h2>
          <div className="relative mt-10 min-h-[620px] overflow-hidden rounded-sm bg-oat">
            <ProductVisual product={campaign} index={2} className="absolute inset-0" emojiClassName="text-[18rem]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ardosia/45 via-transparent to-transparent" />
            {[["20%", "62%"], ["46%", "35%"], ["72%", "60%"], ["83%", "28%"]].map(([left, top], index) => (
              <Link key={`${left}-${top}`} href={`/produto/${products[index % products.length].id}`} className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-clay/80 text-xl text-white shadow-xl backdrop-blur transition hover:scale-110" style={{ left, top }} aria-label={`Ver ${products[index % products.length].name}`}>+</Link>
            ))}
            <div className="absolute bottom-7 left-7 max-w-sm bg-white/92 p-6 text-left shadow-xl backdrop-blur"><p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">Dica de uso</p><p className="mt-2 font-display text-3xl">Apresente um recurso por vez e observe como a criança responde.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-oat py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-2">
          {[["Como saber se este produto faz sentido?", "Observe se ele conversa com um interesse atual, se a criança consegue explorá-lo com segurança e se você consegue imaginar uma forma simples de mediar a brincadeira."], ["Preciso comprar muitos materiais?", "Não. Um recurso versátil, usado de maneiras diferentes e conectado à rotina, costuma oferecer mais valor do que vários produtos apresentados sem intenção."]].map(([question, answer], index) => (
            <article key={question} className="grid overflow-hidden rounded-sm bg-white sm:grid-cols-[0.42fr_1fr]">
              <ProductVisual product={products[(index + 1) % products.length]} index={index + 1} className="min-h-56" />
              <div className="p-8"><div className="text-lg tracking-[0.15em] text-clay">★★★★★</div><h3 className="mt-4 font-display text-3xl">{question}</h3><p className="mt-4 text-sm leading-6 text-ardosia/68">{answer}</p><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-coral">Orientação da curadoria</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="flex snap-x gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
          {categoryList.slice(0, 6).map((category, index) => (
            <Link key={category} href={`/colecoes?categoria=${encodeURIComponent(category)}`} className="min-w-32 snap-start text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-clay text-5xl">{categoryIcons[category] ?? products[index % products.length].emoji}</div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em]">{category}</p>
            </Link>
          ))}
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[["Made for Learning", "Feito para explorar", "Recursos que convidam ao toque, à descoberta, ao movimento e à comunicação."], ["Easy to Use", "Fácil de integrar à rotina", "Possibilidades simples de uso em casa, na escola ou no atendimento."], ["Responsible Choice", "Curadoria sem promessas vazias", "Informação clara para que você saiba o que está comprando e por quê."]].map(([eyebrow, title, text], index) => (
            <article key={title} className="overflow-hidden rounded-sm bg-white shadow-sm"><ProductVisual product={products[(index + 2) % products.length]} index={index + 2} className="h-64" /><div className="p-7 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-coral">{eyebrow}</p><h3 className="mt-3 font-display text-3xl">{title}</h3><p className="mt-3 text-sm leading-6 text-ardosia/65">{text}</p></div></article>
          ))}
        </div>
      </section>

      <section className="bg-oat px-5 py-24 text-center sm:py-32">
        <blockquote className="mx-auto max-w-4xl"><span className="font-display text-5xl text-clay" aria-hidden="true">“</span><p className="mt-5 font-display text-4xl italic leading-tight text-ardosia/88 sm:text-5xl">Um bom recurso não faz o trabalho sozinho. Ele abre uma possibilidade — e a mediação transforma essa possibilidade em aprendizagem.</p><footer className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-ardosia/55">Margareth Almeida · Neuropsicopedagoga</footer></blockquote>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="grid overflow-hidden rounded-sm bg-white shadow-[0_30px_90px_rgba(61,42,32,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
          <ProductVisual product={featured} index={3} className="min-h-[560px]" emojiClassName="text-[16rem]" />
          <div className="flex flex-col justify-center p-9 sm:p-14">
            <div className="flex items-center justify-between gap-4"><span className="rounded-sm bg-coral px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">Destaque da semana</span><span className="text-sm tracking-[0.12em] text-clay">★★★★★</span></div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-ardosia/45">BrinqueTEAndo</p><h2 className="mt-2 font-display text-5xl leading-none">{featured.name}</h2><p className="mt-4 font-display text-4xl">{formatPrice(featured.price)}</p><p className="mt-6 leading-7 text-ardosia/68">{featured.description}</p>
            <div className="mt-7 flex flex-wrap gap-2">{featured.benefits.map((benefit) => <span key={benefit} className="rounded-full border border-ardosia/15 px-4 py-2 text-xs font-semibold">{benefit}</span>)}</div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2"><AddToCartButton productId={featured.id} disabled={featured.stock <= 0} /><Link href={`/produto/${featured.id}`} className="inline-flex min-h-14 items-center justify-center border border-ardosia px-7 text-xs font-bold uppercase tracking-[0.16em] hover:bg-ardosia hover:text-white">Ver detalhes</Link></div>
            <p className="mt-4 text-xs text-ardosia/55">{featured.stock > 0 ? `${featured.stock} unidades disponíveis` : "Produto esgotado"}</p>
          </div>
        </div>
      </section>

      <section className="bg-clay text-white"><div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 text-center sm:grid-cols-3"><div><p className="font-display text-3xl">Pagamento seguro</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/65">Processado pela Stripe</p></div><div><p className="font-display text-3xl">Curadoria profissional</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/65">Margareth Almeida</p></div><div><p className="font-display text-3xl">Suporte humanizado</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/65">Antes e depois da compra</p></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Coleções</p><h2 className="mt-3 font-display text-5xl">Encontre o que combina com o momento da criança</h2></div>
        <div className="mt-12 grid min-h-[650px] gap-4 lg:grid-cols-12 lg:grid-rows-2">
          {collectionProducts.map((product, index) => {
            const spans = ["lg:col-span-4 lg:row-span-2", "lg:col-span-8", "lg:col-span-5", "lg:col-span-3"];
            return <Link key={`${product.id}-${index}`} href={`/produto/${product.id}`} className={`group relative min-h-72 overflow-hidden rounded-sm ${spans[index]}`}><ProductVisual product={product} index={index + 1} className="absolute inset-0 transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-ardosia/70 via-ardosia/5 to-transparent" /><div className="absolute bottom-0 left-0 p-7 text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{product.category}</p><h3 className="mt-2 font-display text-4xl">{product.name}</h3></div></Link>;
          })}
        </div>
      </section>

      <section className="bg-oat py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5"><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{galleryProducts.slice(0, 4).map((product, index) => <ProductVisual key={`${product.id}-social-${index}`} product={product} index={index} className="aspect-square rounded-sm" />)}</div><div className="mt-5 text-center"><p className="font-display text-3xl">@neuromargarethapoio</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-ardosia/55">Conteúdo que ensina antes de vender</p></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{categoryList.slice(0, 4).map((category, index) => { const product = products.find((item) => item.category === category) ?? products[index % products.length]; return <Link key={category} href={`/colecoes?categoria=${encodeURIComponent(category)}`} className="group relative min-h-80 overflow-hidden rounded-sm bg-ardosia"><ProductVisual product={product} index={index + 1} className="absolute inset-x-0 top-0 h-3/5 transition duration-700 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 flex h-2/5 items-center justify-center bg-ardosia px-5 text-center text-white"><h3 className="font-display text-4xl">{category}</h3></div></Link>; })}</div></section>

      <section className="bg-oat py-20 sm:py-28">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 lg:grid-cols-[0.7fr_1fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Precisa de ajuda?</p><h2 className="mt-4 font-display text-5xl">Dúvidas antes da compra são bem-vindas.</h2><p className="mt-5 leading-7 text-ardosia/68">Nosso suporte ajuda com informações sobre produto, faixa etária, medidas, pagamento e entrega.</p><Link href="/contato" className="mt-8 inline-flex border border-ardosia px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] hover:bg-ardosia hover:text-white">Falar com a loja</Link></div>
          <div className="space-y-3">{[["Como escolher um produto para a minha criança?", "Comece pelo interesse atual, pela faixa etária e pelo tipo de experiência que você deseja criar."], ["Os brinquedos substituem terapia ou avaliação?", "Não. São recursos de brincar e aprendizagem e não substituem acompanhamento individualizado."], ["Como funciona o pagamento?", "O checkout é processado pela Stripe e os dados do cartão não ficam armazenados na loja."], ["Posso pedir ajuda antes de comprar?", "Sim. Envie a idade, o interesse atual e o que você busca para receber uma orientação mais objetiva."]].map(([question, answer]) => <details key={question} className="group rounded-sm bg-ardosia px-6 py-5 text-white open:bg-clay"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{question}<span className="text-2xl font-light transition group-open:rotate-45">+</span></summary><p className="mt-4 border-t border-white/20 pt-4 text-sm leading-6 text-white/75">{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Aprenda antes de comprar</p><h2 className="mt-3 font-display text-5xl">Conteúdo para fazer o produto funcionar na vida real</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-ardosia/65">A compra é apenas o começo. A forma de apresentar, mediar e observar a resposta da criança é o que transforma um objeto em experiência.</p></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">{[["Como escolher", "Observe interesse, idade, segurança e objetivo antes de comparar preços."], ["Como apresentar", "Comece sem cobrança, permita exploração livre e modele possibilidades simples."], ["Como observar", "Veja o que aumenta engajamento, comunicação, autonomia e participação."]].map(([title, text], index) => <article key={title} className="overflow-hidden rounded-sm bg-white shadow-sm"><ProductVisual product={galleryProducts[index]} index={index + 1} className="h-80" /><div className="p-7"><h3 className="font-display text-3xl">{title}</h3><p className="mt-3 text-sm leading-6 text-ardosia/65">{text}</p></div></article>)}</div>
        <div className="mt-8 text-center"><a href="https://www.instagram.com/neuromargarethapoio/" target="_blank" rel="noreferrer" className="inline-flex border border-ardosia px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] hover:bg-ardosia hover:text-white">Acompanhar conteúdos</a></div>
      </section>
    </div>
  );
}
