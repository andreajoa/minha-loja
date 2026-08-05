import { products } from "@/data/products";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = products.find((x) => x.id === id);
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <Link href="/colecoes" className="text-sm text-teal-dark hover:underline">← Voltar</Link>
      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex h-96 items-center justify-center rounded-3xl bg-menta/20 text-8xl">
          🧸
        </div>
        <div>
          <span className="text-sm font-medium text-coral">{p.category}</span>
          <h1 className="mt-1 text-3xl font-bold">{p.name}</h1>
          <p className="mt-4 leading-relaxed opacity-80">{p.description}</p>
          <p className="mt-6 text-3xl font-extrabold text-teal-dark">
            R$ {(p.price / 100).toFixed(2).replace(".", ",")}
          </p>
          <p className="mt-1 text-sm text-menta">
            {p.stock > 0 ? `${p.stock} em estoque` : "Esgotado"}
          </p>
          <button className="mt-8 w-full rounded-full bg-teal px-8 py-4 font-semibold text-white transition hover:bg-teal-dark md:w-auto">
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
