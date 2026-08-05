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
      className={`rounded-full bg-teal font-bold text-white shadow-sm transition hover:bg-teal-dark focus:outline-none focus:ring-4 focus:ring-teal/25 disabled:cursor-not-allowed disabled:opacity-50 ${
        compact ? "px-5 py-2.5 text-sm" : "w-full px-8 py-4 md:w-auto"
      }`}
      aria-live="polite"
    >
      {disabled ? "Produto esgotado" : added ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}
    </button>
  );
}
