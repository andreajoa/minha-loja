"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products } from "@/data/products";
import { trackAnalytics } from "@/lib/analytics-client";

export type CartItem = {
  id: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (id: string, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "brinqueteando-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function productFor(id: string) {
  return products.find((item) => item.id === id);
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (item) =>
                typeof item?.id === "string" &&
                Number.isInteger(item?.quantity) &&
                item.quantity > 0,
            ),
          );
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((id: string, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.min(10, Math.trunc(quantity)));
    const product = productFor(id);
    trackAnalytics("add_to_cart", {
      productId: id,
      productName: product?.name || "",
      valueCents: (product?.price || 0) * safeQuantity,
      quantity: safeQuantity,
    });

    setItems((current) => {
      const existing = current.find((item) => item.id === id);
      if (!existing) return [...current, { id, quantity: safeQuantity }];
      return current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(10, item.quantity + safeQuantity) }
          : item,
      );
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const product = productFor(id);
    if (quantity <= 0) {
      trackAnalytics("remove_from_cart", {
        productId: id,
        productName: product?.name || "",
        properties: { reason: "quantity_zero" },
      });
      setItems((current) => current.filter((item) => item.id !== id));
      return;
    }

    const safeQuantity = Math.max(1, Math.min(10, Math.trunc(quantity)));
    trackAnalytics("cart_quantity_changed", {
      productId: id,
      productName: product?.name || "",
      quantity: safeQuantity,
      valueCents: (product?.price || 0) * safeQuantity,
    });
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    const product = productFor(id);
    trackAnalytics("remove_from_cart", {
      productId: id,
      productName: product?.name || "",
    });
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    trackAnalytics("cart_cleared");
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
