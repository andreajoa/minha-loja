import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/products";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Conheça os brinquedos sensoriais e pedagógicos da BrinqueTEAndo.",
};

export default async function Colecoes({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const selected = categoria && categories.includes(categoria) ? categoria : "Todos";
  const visibleProducts = selected === "Todos" ? products : products.filter((product) => product.category === selected);

  return (
    <div className="bg-background">
      <section className="hero-grid relative overflow-hidden border-b border-border/45 px-5 py-16 text-center sm:py-22">
        <div className="absolute left-[8%] top-16 hidden animate-float text-4xl lg:block" aria-hidden="true">🧩</div>
        <div className="absolute right-[10%] top-20 hidden animate-float-slow text-3xl lg:block" aria-hidden="true">✦</div>
        <div className="relative mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-secondary">Catálogo BrinqueTEAndo</p>
          <h1 className="mt-4 font-display text-5xl leading-none text-primary sm:text-6xl">Brinquedos e recursos para um brincar com propósito</h1>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-text-light">
            Escolha pelo interesse, pela faixa etária e pelo tipo de experiência que deseja criar. Os filtros são gerados automaticamente pelas categorias dos produtos cadastrados.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
        <nav className="flex gap-2 overflow-x-auto pb-3" aria-label="Categorias de produtos">
          {categories.map((category) => {
            const active = category === selected;
            const href = category === "Todos" ? "/colecoes" : `/colecoes?categoria=${encodeURIComponent(category)}`;
            return (
              <Link
                key={category}
                href={href}
                className={`shrink-0 rounded-full border px-5 py-3 text-xs font-black uppercase tracking-[0.14em] transition ${
                  active
                    ? "border-primary bg-primary text-white shadow-[0_10px_24px_rgba(9,38,71,0.16)]"
                    : "border-border/65 bg-white text-text-light hover:-translate-y-0.5 hover:border-secondary hover:text-secondary"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 flex items-end justify-between gap-4 border-b border-border/55 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Categoria</p>
            <h2 className="mt-1 font-display text-4xl text-primary">{selected}</h2>
          </div>
          <p className="rounded-full bg-background-alt px-4 py-2 text-sm font-bold text-text-light">{visibleProducts.length} produto{visibleProducts.length === 1 ? "" : "s"}</p>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="reveal-section mt-9 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="mx-auto flex h-20 w-20 animate-bob items-center justify-center rounded-full bg-background-alt text-4xl" aria-hidden="true">🧸</div>
            <h2 className="mt-6 font-display text-4xl text-primary">Ainda não há produtos nesta categoria.</h2>
            <Link href="/colecoes" className="button-shimmer mt-7 inline-flex min-h-12 items-center rounded-full bg-secondary px-7 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-primary">Ver todos</Link>
          </div>
        )}
      </div>
    </div>
  );
}
