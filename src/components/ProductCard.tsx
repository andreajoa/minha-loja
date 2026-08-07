import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice, type Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const analyticsProps = {
    "data-analytics-action": "product_open",
    "data-analytics-product-id": product.id,
    "data-analytics-product-name": product.name,
  } as const;

  return (
    <article className="brand-card group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-border/50 bg-white sm:rounded-[2rem]">
      <Link
        href={`/produto/${product.id}`}
        {...analyticsProps}
        className="relative block aspect-square overflow-hidden bg-background-alt"
      >
        <div className="absolute -right-10 -top-10 z-10 h-28 w-28 rounded-full border border-secondary-light/30" />
        {product.image ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain object-center transition duration-700 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.94),transparent_40%),linear-gradient(145deg,#FDF9F6,#F2E6DE_58%,#E5D0C3)]">
            <span className="category-emoji text-7xl drop-shadow-[0_20px_26px_rgba(9,38,71,0.16)] sm:text-8xl" aria-hidden="true">{product.emoji}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 z-20 max-w-[calc(100%-1.5rem)] rounded-full bg-background/92 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-secondary shadow-sm backdrop-blur sm:left-4 sm:top-4 sm:text-[10px] sm:tracking-[0.16em]">
          {product.category}
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{product.ageRange}</p>
        <Link href={`/produto/${product.id}`} {...analyticsProps}>
          <h3 className="mt-2 font-display text-2xl leading-[1.02] text-primary transition group-hover:text-secondary sm:text-3xl">{product.name}</h3>
        </Link>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-light sm:mt-4">{product.description}</p>
        <div className="mt-auto pt-5 sm:pt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Valor</p>
              <p className="font-display text-3xl text-primary">{formatPrice(product.price)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${product.stock > 0 ? "bg-background-alt text-text-light" : "bg-secondary/10 text-secondary"}`}>
              {product.stock > 0 ? "Em estoque" : "Esgotado"}
            </span>
          </div>
          <AddToCartButton productId={product.id} disabled={product.stock <= 0} compact />
        </div>
      </div>
    </article>
  );
}
