"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { products } from "@/data/products";

export default function AddToCartButton({
  productId,
  disabled = false,
  compact = false,
}: {
  productId: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const product = products.find((item) => item.id === productId);

  function handleAdd() {
    addItem(productId);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      data-analytics-action="add_to_cart"
      data-analytics-product-id={productId}
      data-analytics-product-name={product?.name || ""}
      className={`button-shimmer inline-flex items-center justify-center rounded-full bg-secondary font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_30px_rgba(161,77,45,0.22)] transition hover:-translate-y-1 hover:bg-primary focus:outline-none focus:ring-4 focus:ring-secondary-light/30 disabled:cursor-not-allowed disabled:opacity-50 ${
        compact ? "min-h-11 px-5 text-[10px]" : "min-h-14 w-full px-8 text-xs md:w-auto"
      }`}
      aria-live="polite"
    >
      {disabled ? "Produto esgotado" : added ? "✓ Adicionado" : "Adicionar ao carrinho"}
    </button>
  );
}
