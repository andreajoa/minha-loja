"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

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
      className={`inline-flex items-center justify-center rounded-sm bg-ardosia font-bold uppercase tracking-[0.12em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-coral focus:outline-none focus:ring-4 focus:ring-coral/20 disabled:cursor-not-allowed disabled:opacity-50 ${
        compact ? "min-h-11 px-5 text-[10px]" : "min-h-14 w-full px-8 text-xs md:w-auto"
      }`}
      aria-live="polite"
    >
      {disabled ? "Produto esgotado" : added ? "Adicionado" : "Adicionar ao carrinho"}
    </button>
  );
}
