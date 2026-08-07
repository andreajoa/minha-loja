"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

export default function CartRecoveryRestorer() {
  const pathname = usePathname();
  const { addItem, clearCart } = useCart();

  useEffect(() => {
    if (pathname !== "/carrinho") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("restore");
    if (!raw) return;

    const items = raw
      .split(",")
      .map((entry) => {
        const [id, quantity] = entry.split(":");
        return { id, quantity: Number(quantity) };
      })
      .filter(
        (item) =>
          /^\d+$/.test(item.id || "") &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          item.quantity <= 10,
      );

    if (!items.length) return;

    clearCart();
    for (const item of items) addItem(item.id, item.quantity);

    params.delete("restore");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [pathname, addItem, clearCart]);

  return null;
}
