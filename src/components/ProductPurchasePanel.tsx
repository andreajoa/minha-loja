"use client";

import { useMemo, useState } from "react";
import ShippingCalculator from "@/components/ShippingCalculator";
import { useCart } from "@/components/CartProvider";
import { formatPrice, products } from "@/data/products";
import { variantIdFor } from "@/lib/commerce";

export default function ProductPurchasePanel({ productId }: { productId: string }) {
  const product = products.find((item) => item.id === productId);
  const variants = useMemo(() => product?.variants || [], [product]);
  const firstAvailable = variants.find((variant) => variant.stock > 0);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product && firstAvailable ? variantIdFor(product, firstAvailable) : "",
  );
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  if (!product) return null;

  const selectedVariant =
    variants.find((variant) => variantIdFor(product, variant) === selectedVariantId) ||
    firstAvailable ||
    null;
  const activeVariantId = selectedVariant
    ? variantIdFor(product, selectedVariant)
    : undefined;
  const unitPrice = selectedVariant ? selectedVariant.price : product.price;
  const stock = selectedVariant ? selectedVariant.stock : product.stock;

  function addSelected() {
    if (stock <= 0) return;
    addItem(product.id, 1, activeVariantId);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <>
      <div className="mt-8 rounded-[2rem] border border-border/50 bg-white p-6 shadow-[0_20px_55px_rgba(9,38,71,0.08)] sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">
          Valor do produto
        </p>
        <p className="mt-2 font-display text-5xl text-primary">
          {formatPrice(unitPrice)}
        </p>

        {variants.length > 0 ? (
          <div className="mt-7">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
              Escolha a opção
            </p>
            <div
              className="mt-3 grid gap-3 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Variantes do produto"
            >
              {variants.map((variant) => {
                const id = variantIdFor(product, variant);
                const active = activeVariantId === id;
                const unavailable = variant.stock <= 0;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={unavailable}
                    onClick={() => setSelectedVariantId(id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-secondary bg-secondary/5 shadow-[0_12px_30px_rgba(161,77,45,0.12)]"
                        : "border-border/60 bg-background hover:border-secondary-light"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <span className="block font-black text-primary">{variant.name}</span>
                    <span className="mt-1 block text-sm text-text-light">
                      {formatPrice(variant.price)} · {variant.stock} em estoque
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-sm font-bold text-text-light">
          Pagamento seguro por cartão no checkout incorporado da Stripe.
        </p>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={addSelected}
            disabled={stock <= 0}
            data-analytics-action="add_to_cart"
            data-analytics-product-id={product.id}
            data-analytics-product-name={
              selectedVariant ? `${product.name} · ${selectedVariant.name}` : product.name
            }
            className="button-shimmer inline-flex min-h-14 w-full items-center justify-center rounded-full bg-secondary px-8 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_30px_rgba(161,77,45,0.22)] transition hover:-translate-y-1 hover:bg-primary focus:outline-none focus:ring-4 focus:ring-secondary-light/30 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            aria-live="polite"
          >
            {stock <= 0 ? "Produto esgotado" : added ? "✓ Adicionado" : "Adicionar ao carrinho"}
          </button>
          <p className={`text-sm font-black ${stock > 0 ? "text-text-light" : "text-secondary"}`}>
            {stock > 0 ? `${stock} unidades disponíveis` : "Produto esgotado"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ShippingCalculator
          cart={[
            {
              id: product.id,
              quantity: 1,
              ...(activeVariantId ? { variantId: activeVariantId } : {}),
            },
          ]}
          compact
          title="Quanto custa entregar este produto?"
        />
      </div>
    </>
  );
}
