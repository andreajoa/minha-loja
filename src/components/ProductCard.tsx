import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-teal/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/produto/${product.id}`} className="block">
        <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-menta/25 via-lavanda/20 to-amarelo/25">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <span className="text-7xl" aria-hidden="true">
              {product.emoji}
            </span>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-coral shadow-sm backdrop-blur">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-dark">
          {product.ageRange}
        </p>
        <Link href={`/produto/${product.id}`}>
          <h3 className="mt-2 text-xl font-extrabold leading-tight transition group-hover:text-teal-dark">
            {product.name}
          </h3>
        </Link>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ardosia/70">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div>
            <p className="text-xs text-ardosia/55">Pagamento seguro</p>
            <p className="text-2xl font-black text-teal-dark">{formatPrice(product.price)}</p>
          </div>
          <AddToCartButton
            productId={product.id}
            disabled={product.stock <= 0}
            compact
          />
        </div>
      </div>
    </article>
  );
}
