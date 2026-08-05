import { products } from "@/data/products";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-creme flex items-center justify-center text-9xl">
          🧸 {/* Placeholder para imagem */}
        </div>
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-coral">
            {product.category}
          </span>
          <h1 className="mt-2 text-4xl font-black text-ardosia">
            {product.name}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-ardosia/70">
            {product.description}
          </p>
          <div className="mt-8 text-4xl font-black text-teal-dark">
            R$ {(product.price / 100).toFixed(2).replace(".", ",")}
          </div>
          <button className="mt-8 w-full rounded-full bg-teal px-8 py-4 text-lg font-black text-white shadow-lg shadow-teal/20 transition hover:bg-teal-dark">
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
