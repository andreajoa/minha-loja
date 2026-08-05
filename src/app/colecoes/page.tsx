import Link from "next/link";
import { products } from "@/data/products";

export default function Colecoes() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">Nossas coleçoes</h1>
      <p className="mb-8 opacity-70">Explore todos os brinquedos disponiveis.</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/produto/${p.id}`}
            className="group rounded-2xl border border-teal/10 bg-white p-4 shadow-sm transition hover:shadow-lg"
          >
            <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-lavanda/20 text-5xl">
              🧩
            </div>
            <span className="text-xs font-medium text-coral">{p.category}</span>
            <h3 className="mt-1 font-bold group-hover:text-teal-dark">{p.name}</h3>
            <p className="mt-1 text-sm opacity-70 line-clamp-2">{p.description}</p>
            <p className="mt-2 text-lg font-bold text-teal-dark">
              R$ {(p.price / 100).toFixed(2).replace(".", ",")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
