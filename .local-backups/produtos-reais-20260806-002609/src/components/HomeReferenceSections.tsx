"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice, products, type Product } from "@/data/products";

const basePath = "";

const categoryFrames = [
  {
    label: "Sensorial",
    category: "Sensorial",
    image: `${basePath}/home-images/categoria-sensorial.png`,
  },
  {
    label: "Comunicação",
    category: "Comunicação",
    image: `${basePath}/home-images/categoria-comunicacao.png`,
  },
  {
    label: "Motor",
    category: "Motor",
    image: `${basePath}/home-images/categoria-motor.png`,
  },
  {
    label: "Rotina",
    category: "Comunicação",
    image: `${basePath}/home-images/categoria-rotina.png`,
  },
] as const;

function ProductArtwork({ product, className = "" }: { product: Product; className?: string }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className={`h-full w-full object-contain drop-shadow-[0_22px_28px_rgba(9,38,71,0.18)] ${className}`}
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`} aria-label={product.name}>
      <span className="text-[7rem] drop-shadow-[0_22px_28px_rgba(9,38,71,0.16)] sm:text-[9rem]" aria-hidden="true">
        {product.emoji}
      </span>
    </div>
  );
}

function QuoteBrushSection() {
  return (
    <section className="relative overflow-hidden bg-background px-5 py-20 sm:py-28">
      <div className="relative mx-auto flex min-h-[310px] max-w-6xl items-center justify-center text-center">
        <div className="absolute inset-x-[5%] top-[12%] h-[28%] -rotate-2 rounded-[45%_55%_42%_58%] bg-[#b7aaa2]/52 blur-[0.2px]" />
        <div className="absolute inset-x-[13%] top-[38%] h-[23%] rotate-1 rounded-[50%_45%_58%_42%] bg-[#b7aaa2]/48" />
        <div className="absolute inset-x-[9%] bottom-[11%] h-[28%] -rotate-1 rounded-[42%_58%_48%_52%] bg-[#b7aaa2]/46" />
        <div className="absolute left-[22%] top-[5%] h-[90%] w-[58%] bg-[radial-gradient(ellipse_at_center,rgba(183,170,162,0.28),transparent_70%)]" />

        <blockquote className="relative z-10 max-w-4xl font-display text-3xl italic leading-[1.35] text-primary sm:text-4xl lg:text-5xl">
          Cada brinquedo é escolhido com foco no desenvolvimento, na funcionalidade e no brincar com intenção.
        </blockquote>
      </div>
    </section>
  );
}

function FeaturedPurchaseSection() {
  const router = useRouter();
  const { addItem } = useCart();
  const featured = products.find((product) => product.category === "Comunicação") ?? products[0];
  const gallery = useMemo(() => [featured, ...products.filter((product) => product.id !== featured.id).slice(0, 2)], [featured]);
  const [preview, setPreview] = useState(featured);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function addToCart(goToCart = false) {
    addItem(featured.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
    if (goToCart) router.push("/carrinho");
  }

  return (
    <section className="bg-background-alt px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[2rem] border border-border/45 bg-white shadow-[0_30px_90px_rgba(9,38,71,0.10)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-h-[520px] border-b border-border/35 bg-[#eee6df] p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="absolute bottom-7 right-6 top-7 z-10 flex w-20 flex-col gap-3 sm:w-24">
            {gallery.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreview(item)}
                className={`aspect-square overflow-hidden rounded-xl border-2 bg-white p-1.5 shadow-md transition hover:-translate-y-0.5 ${
                  preview.id === item.id ? "border-secondary" : "border-white"
                }`}
                aria-label={`Visualizar ${item.name}`}
              >
                <ProductArtwork product={item} />
              </button>
            ))}
          </div>

          <div className="absolute inset-4 right-28 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.88),transparent_44%),linear-gradient(145deg,#e8ddd4,#f8f4f0_58%,#e5d6cb)] sm:inset-6 sm:right-36">
            <ProductArtwork product={preview} className="p-10 sm:p-16" />
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-14">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white">
              <span aria-hidden="true">★</span> Destaque
            </span>
            <div className="text-right text-primary">
              <div className="tracking-[0.16em]" aria-label="Produto selecionado pela curadoria">★★★★★</div>
              <p className="mt-1 text-xs text-text-light">Seleção da curadoria</p>
            </div>
          </div>

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-muted">{featured.category}</p>
          <h2 className="mt-2 font-display text-4xl leading-none text-primary sm:text-5xl">{featured.name}</h2>
          <p className="mt-5 font-display text-4xl text-secondary">{formatPrice(featured.price)}</p>
          <p className="mt-5 leading-7 text-text-light">{featured.description}</p>

          <div className="mt-7">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-text-light">O que este recurso pode apoiar</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {featured.benefits.slice(0, 3).map((benefit, index) => (
                <span key={benefit} className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background-alt text-center text-[9px] font-black uppercase leading-tight text-primary shadow-sm" title={benefit}>
                  {index === 0 ? "01" : index === 1 ? "02" : "03"}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-md bg-primary px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">● Em estoque</span>
            <span className="rounded-md bg-background-alt px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-secondary">Escolha orientada</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[170px_1fr]">
            <div className="grid min-h-14 grid-cols-3 overflow-hidden rounded-md border border-secondary/55 bg-white">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="text-xl text-secondary hover:bg-background-alt" aria-label="Diminuir quantidade">−</button>
              <span className="flex items-center justify-center border-x border-border/55 text-lg text-primary">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(10, value + 1))} className="text-xl text-secondary hover:bg-background-alt" aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" onClick={() => addToCart(false)} disabled={featured.stock <= 0} className="button-shimmer min-h-14 rounded-md bg-secondary px-6 text-sm font-black uppercase tracking-[0.11em] text-white transition hover:bg-primary disabled:opacity-50">
              {featured.stock <= 0 ? "Produto esgotado" : added ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}
            </button>
          </div>

          <button type="button" onClick={() => addToCart(true)} disabled={featured.stock <= 0} className="mt-3 min-h-14 rounded-md bg-primary px-6 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-secondary disabled:opacity-50">
            Comprar agora
          </button>
          <Link href={`/produto/${featured.id}`} className="mt-3 inline-flex min-h-14 items-center justify-center rounded-md border border-secondary/55 text-sm font-black uppercase tracking-[0.12em] text-primary transition hover:bg-background-alt">
            Ver detalhes
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryFramesSection() {
  return (
    <section className="overflow-hidden bg-background px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-secondary">Encontre pelo objetivo</p>
          <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">Explore as categorias</h2>
        </div>

        <div className="mt-14 grid gap-x-5 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {categoryFrames.map((item) => (
            <Link
              key={item.label}
              href={`/colecoes?categoria=${encodeURIComponent(item.category)}`}
              className="group relative block pt-20"
              aria-label={`Ver produtos da categoria ${item.label}`}
            >
              <div className="relative min-h-[270px] overflow-visible rounded-2xl bg-[#3a2a22] px-5 pb-8 pt-36 text-center shadow-[0_24px_55px_rgba(9,38,71,0.12)] transition duration-300 group-hover:-translate-y-2 group-hover:bg-secondary">
                <div className="absolute -top-20 left-1/2 h-52 w-[88%] -translate-x-1/2 overflow-hidden rounded-[1.5rem] border-4 border-background shadow-[0_20px_45px_rgba(9,38,71,0.16)] transition duration-500 group-hover:-translate-y-3 group-hover:scale-[1.03]">
                  <img
                    src={item.image}
                    alt={`Brincadeira relacionada à categoria ${item.label}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-display text-4xl text-white">{item.label}</h3>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-white/65">Ver produtos</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeReferenceSections() {
  return (
    <>
      <QuoteBrushSection />
      <FeaturedPurchaseSection />
      <CategoryFramesSection />
    </>
  );
}

export function InstagramFollowStrip() {
  return (
    <section className="bg-background py-6 sm:py-10">
      <a
        href="https://www.instagram.com/neuromargarethapoio/"
        target="_blank"
        rel="noreferrer"
        className="group relative mx-auto block w-full max-w-[2172px] overflow-hidden bg-primary"
        aria-label="Seguir @neuromargarethapoio no Instagram"
      >
        <img
          src={`${basePath}/home-sections/03-siga-no-instagram.png`}
          alt="Cenas de infância, brinquedos e aprendizagem. Siga @neuromargarethapoio no Instagram."
          className="aspect-[3/1] w-full object-cover transition duration-700 group-hover:scale-[1.015]"
          loading="lazy"
        />
        <span className="absolute inset-0 bg-primary/5 transition group-hover:bg-primary/0" />
      </a>
    </section>
  );
}
