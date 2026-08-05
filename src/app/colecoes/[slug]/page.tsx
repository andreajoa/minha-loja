import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";

export default async function ColecaoPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  // Lógica simples de filtro (idealmente viria de um DB ou API)
  const categoria = slug === "todos" ? null : slug.charAt(0).toUpperCase() + slug.slice(1);

  const produtosFiltrados = categoria
    ? products.filter(p => p.category.toLowerCase() === categoria.toLowerCase())
    : products;

  if (produtosFiltrados.length === 0 && slug !== "todos") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-4xl font-black mb-8 capitalize">
        {slug === "todos" ? "Todos os produtos" : `Coleção: ${slug}`}
      </h1>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {produtosFiltrados.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
