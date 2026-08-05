import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const hasRealDiscount =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-teal/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="relative flex h-60 items-center justify-center overflow-hidden bg-gradient-to-br from-menta/25 via-lavanda/20 to-amarelo/25">
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

          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-coral shadow-sm backdrop-blur">
            {product.badge || product.category}
          </span>

          {product.bestSeller ? (
            <span className="absolute right-4 top-4 rounded-full bg-ardosia px-3 py-1.5 text-xs font-black text-white shadow-sm">
              Mais procurado
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide">
          <span className="text-teal-dark">{product.goal}</span>
          <span className="text-ardosia/30">•</span>
          <span className="text-ardosia/55">{product.ageRange}</span>
        </div>

        <Link href={`/produto/${product.slug}`}>
          <h3 className="mt-3 text-2xl font-black leading-tight transition group-hover:text-teal-dark">
            {product.name}
          </h3>
        </Link>

        <p className="mt-3 text-sm font-bold leading-relaxed text-ardosia/80">
          {product.hook}
        </p>

        <ul className="mt-4 space-y-2 text-sm text-ardosia/68">
          {product.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit} className="flex gap-2">
              <span className="font-black text-teal-dark">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-ardosia/8 pt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              {hasRealDiscount ? (
                <p className="text-sm font-bold text-ardosia/45 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </p>
              ) : (
                <p className="text-xs font-bold text-ardosia/55">Compra segura</p>
              )}
              <p className="text-2xl font-black text-teal-dark">{formatPrice(product.price)}</p>
              <p className="mt-1 text-xs text-ardosia/55">Pagamento processado pela Stripe</p>
            </div>

            <AddToCartButton
              productId={product.id}
              disabled={product.stock <= 0}
              compact
            />
          </div>

          <Link
            href={`/produto/${product.slug}`}
            className="mt-4 flex w-full items-center justify-center rounded-full border-2 border-teal/15 px-4 py-3 text-sm font-black text-teal-dark transition hover:border-teal hover:bg-teal/5"
          >
            Ver como usar e para quem serve
          </Link>
        </div>
      </div>
    </article>
  );
}
