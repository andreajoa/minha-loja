"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { withBasePath } from "@/lib/paths";

const STARTED_KEY = "bt_cart_recovery_started";

export default function CartRecoveryTracker() {
  const pathname = usePathname();
  const { items } = useCart();

  useEffect(() => {
    if (!items.length) {
      window.localStorage.removeItem(STARTED_KEY);
      return;
    }
    if (pathname.startsWith("/checkout") || pathname.startsWith("/sucesso")) return;
    if (window.localStorage.getItem(STARTED_KEY) === "1") return;

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(withBasePath("/api/marketing/cart-recovery"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: items }),
        });
        const data = (await response.json()) as { tracked?: boolean };
        if (response.ok && data.tracked) {
          window.localStorage.setItem(STARTED_KEY, "1");
        }
      } catch {
        // Falha de marketing nunca deve interferir na compra.
      }
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [items, pathname]);

  return null;
}
