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
import { variantIdFor } from "@/lib/commerce";

export type CartItem = {
  id: string;
  quantity: number;
  variantId?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (id: string, quantity?: number, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  removeItem: (id: string, variantId?: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "brinqueteando-cart-v2";
const LEGACY_STORAGE_KEY = "brinqueteando-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function productFor(id: string) {
  return products.find((item) => item.id === id);
}

function itemKey(id: string, variantId?: string) {
  return `${id}::${variantId || "base"}`;
}

function resolveVariantId(id: string, requested?: string) {
  const product = productFor(id);
  if (!product?.variants?.length) return undefined;

  if (requested) {
    const match = product.variants.find(
      (variant) => variantIdFor(product, variant) === requested && variant.stock > 0,
    );
    if (match) return variantIdFor(product, match);
  }

  const firstAvailable = product.variants.find((variant) => variant.stock > 0);
  return firstAvailable ? variantIdFor(product, firstAvailable) : undefined;
}

function variantFor(id: string, variantId?: string) {
  const product = productFor(id);
  if (!product || !variantId || !product.variants?.length) return undefined;
  return product.variants.find(
    (variant) => variantIdFor(product, variant) === variantId,
  );
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(STORAGE_KEY) ||
        window.localStorage.getItem(LEGACY_STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(
            parsed
              .filter(
                (item) =>
                  typeof item?.id === "string" &&
                  Number.isInteger(item?.quantity) &&
                  item.quantity > 0 &&
                  (item.variantId === undefined || typeof item.variantId === "string"),
              )
              .map((item) => {
                const variantId = resolveVariantId(item.id, item.variantId);
                return {
                  id: item.id,
                  quantity: item.quantity,
                  ...(variantId ? { variantId } : {}),
                };
              }),
          );
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (id: string, quantity = 1, requestedVariantId?: string) => {
      const product = productFor(id);
      if (!product) return;

      const variantId = resolveVariantId(id, requestedVariantId);
      const variant = variantFor(id, variantId);
      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock <= 0) return;

      const safeQuantity = Math.max(
        1,
        Math.min(10, availableStock, Math.trunc(quantity)),
      );
      const unitPrice = variant ? variant.price : product.price;

      trackAnalytics("add_to_cart", {
        productId: id,
        productName: variant ? `${product.name} · ${variant.name}` : product.name,
        valueCents: unitPrice * safeQuantity,
        quantity: safeQuantity,
      });

      const key = itemKey(id, variantId);
      setItems((current) => {
        const existing = current.find(
          (item) => itemKey(item.id, item.variantId) === key,
        );

        if (!existing) {
          return [
            ...current,
            {
              id,
              quantity: safeQuantity,
              ...(variantId ? { variantId } : {}),
            },
          ];
        }

        return current.map((item) =>
          itemKey(item.id, item.variantId) === key
            ? {
                ...item,
                quantity: Math.min(
                  10,
                  availableStock,
                  item.quantity + safeQuantity,
                ),
              }
            : item,
        );
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number, variantId?: string) => {
      const product = productFor(id);
      if (!product) return;

      const resolvedVariantId = resolveVariantId(id, variantId);
      const variant = variantFor(id, resolvedVariantId);
      const key = itemKey(id, resolvedVariantId);

      if (quantity <= 0) {
        trackAnalytics("remove_from_cart", {
          productId: id,
          productName: variant ? `${product.name} · ${variant.name}` : product.name,
          properties: { reason: "quantity_zero" },
        });
        setItems((current) =>
          current.filter((item) => itemKey(item.id, item.variantId) !== key),
        );
        return;
      }

      const availableStock = variant ? variant.stock : product.stock;
      const safeQuantity = Math.max(
        1,
        Math.min(10, availableStock, Math.trunc(quantity)),
      );
      const unitPrice = variant ? variant.price : product.price;

      trackAnalytics("cart_quantity_changed", {
        productId: id,
        productName: variant ? `${product.name} · ${variant.name}` : product.name,
        quantity: safeQuantity,
        valueCents: unitPrice * safeQuantity,
      });

      setItems((current) =>
        current.map((item) =>
          itemKey(item.id, item.variantId) === key
            ? { ...item, quantity: safeQuantity }
            : item,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string, variantId?: string) => {
    const product = productFor(id);
    const resolvedVariantId = resolveVariantId(id, variantId);
    const variant = variantFor(id, resolvedVariantId);
    const key = itemKey(id, resolvedVariantId);

    trackAnalytics("remove_from_cart", {
      productId: id,
      productName: product
        ? variant
          ? `${product.name} · ${variant.name}`
          : product.name
        : "",
    });

    setItems((current) =>
      current.filter((item) => itemKey(item.id, item.variantId) !== key),
    );
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
