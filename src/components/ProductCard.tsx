import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice, type Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-ardosia/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(61,42,32,0.12)]">
      <Link href={`/produto/${product.id}`} className="relative block aspect-square overflow-hidden bg-oat">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.9),transparent_42%),linear-gradient(145deg,#dfe8df,#f5eee7_55%,#e8d7d1)]">
            <span className="text-8xl drop-shadow-[0_18px_25px_rgba(61,42,32,0.12)]" aria-hidden="true">{product.emoji}</span>
          </div>
        )}
        <span className="absolute left-4 top-4 bg-white/92 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-coral backdrop-blur">
          {product.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ardosia/45">{product.ageRange}</p>
        <Link href={`/produto/${product.id}`}>
          <h3 className="mt-2 font-display text-3xl leading-none transition group-hover:text-coral">{product.name}</h3>
        </Link>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-ardosia/65">{product.description}</p>
        <div className="mt-auto pt-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ardosia/40">Valor</p>
              <p className="font-display text-3xl">{formatPrice(product.price)}</p>
            </div>
            <span className={`text-xs font-bold ${product.stock > 0 ? "text-sage-dark" : "text-coral"}`}>
              {product.stock > 0 ? "Em estoque" : "Esgotado"}
            </span>
          </div>
          <AddToCartButton productId={product.id} disabled={product.stock <= 0} compact />
        </div>
      </div>
    </article>
  );
}
