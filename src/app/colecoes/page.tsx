import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/products";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Conheça os brinquedos sensoriais e pedagógicos da BrinqueTEAndo.",
};

export default function Colecoes() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">Catálogo BrinqueTEAndo</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Brinquedos e recursos para um brincar com propósito</h1>
        <p className="mt-5 text-lg leading-relaxed text-ardosia/70">
          Observe os interesses, a faixa etária e a forma como a criança utiliza cada material. A mediação de um adulto pode transformar um brinquedo simples em muitas oportunidades de interação.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" aria-label="Categorias disponíveis">
        {categories.map((category) => (
          <span
            key={category}
            className="rounded-full border border-teal/15 bg-white px-4 py-2 text-sm font-bold text-ardosia/75"
          >
            {category}
          </span>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
