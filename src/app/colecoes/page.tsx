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
    <div className="bg-creme">
      <section className="border-b border-ardosia/10 bg-oat px-5 py-16 text-center sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-coral">Catálogo BrinqueTEAndo</p>
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl leading-none sm:text-6xl">Brinquedos e recursos para um brincar com propósito</h1>
        <p className="mx-auto mt-6 max-w-2xl leading-7 text-ardosia/68">
          Escolha pelo interesse, pela faixa etária e pelo tipo de experiência que deseja criar. Os filtros abaixo são gerados automaticamente pelas categorias dos produtos cadastrados.
        </p>
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
                className={`shrink-0 border px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] transition ${
                  active ? "border-ardosia bg-ardosia text-white" : "border-ardosia/15 bg-white text-ardosia/65 hover:border-coral hover:text-coral"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 flex items-end justify-between gap-4 border-b border-ardosia/10 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ardosia/45">Categoria</p>
            <h2 className="mt-1 font-display text-4xl">{selected}</h2>
          </div>
          <p className="text-sm text-ardosia/55">{visibleProducts.length} produto{visibleProducts.length === 1 ? "" : "s"}</p>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="mt-9 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h2 className="font-display text-4xl">Ainda não há produtos nesta categoria.</h2>
            <Link href="/colecoes" className="mt-7 inline-flex border border-ardosia px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] hover:bg-ardosia hover:text-white">Ver todos</Link>
          </div>
        )}
      </div>
    </div>
  );
}
