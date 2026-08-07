"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { withBasePath } from "@/lib/paths";

const STARTED_KEY = "bt_cart_recovery_started";

async function stopRecovery() {
  try {
    await fetch(withBasePath("/api/marketing/cart-recovery"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stop" }),
    });
  } catch {
    // Falha de marketing nunca deve interferir na compra.
  }
}

export default function CartRecoveryTracker() {
  const pathname = usePathname();
  const { items } = useCart();

  useEffect(() => {
    const started = window.localStorage.getItem(STARTED_KEY) === "1";

    if (!items.length) {
      if (started) void stopRecovery();
      window.localStorage.removeItem(STARTED_KEY);
      return;
    }

    if (pathname.startsWith("/checkout") || pathname.startsWith("/sucesso")) {
      return;
    }
    if (started) return;

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(withBasePath("/api/marketing/cart-recovery"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start", cart: items }),
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
