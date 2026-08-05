import Link from "next/link";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/produto/${product.id}`}
      className="group flex flex-col rounded-3xl border border-ardosia/5 bg-white p-2 shadow-sm transition hover:shadow-xl hover:border-teal/20"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-creme">
        {/* Futura implementação com next/image */}
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 group-hover:scale-110 transition duration-500">
          🧸
        </div>
      </div>
      <div className="p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-coral">
          {product.category}
        </span>
        <h3 className="mt-2 text-xl font-semibold text-ardosia group-hover:text-teal-dark transition">
          {product.name}
        </h3>
        <p className="mt-3 text-2xl font-bold text-teal-dark">
          R$ {(product.price / 100).toFixed(2).replace(".", ",")}
        </p>
      </div>
    </Link>
  );
}
