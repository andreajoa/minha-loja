"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import ShippingCalculator from "@/components/ShippingCalculator";
import CartCouponBox from "@/components/CartCouponBox";
import { formatPrice, products, type Product } from "@/data/products";
import {
  calculateDiscount,
  formatMoney,
  getCrossSell,
  getDiscountProgress,
  getDownsell,
  getOrderBump,
  getUpsell,
  variantIdFor,
} from "@/lib/commerce";
import type { ShippingOption, ShippingQuote } from "@/lib/shipping-server";
import { withBasePath } from "@/lib/paths";

function ProductVisual({
  product,
  size = "large",
}: {
  product: Product;
  size?: "small" | "large";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-background-alt via-white to-secondary-light/15 ${
        size === "large"
          ? "aspect-square w-full rounded-2xl sm:w-32"
          : "h-16 w-16 rounded-2xl"
      }`}
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className={size === "large" ? "text-6xl" : "text-4xl"}
          aria-hidden="true"
        >
          {product.emoji}
        </span>
      )}
    </div>
  );
}

function QuickAddCard({
  product,
  label,
  description,
  onAdd,
  emphasis = false,
}: {
  product: Product;
  label: string;
  description: string;
  onAdd: () => void;
  emphasis?: boolean;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-[1.7rem] border p-5 transition hover:-translate-y-1 ${
        emphasis
          ? "border-secondary/45 bg-secondary/5 shadow-[0_18px_45px_rgba(161,77,45,0.12)]"
          : "border-border/50 bg-white shadow-[0_16px_38px_rgba(9,38,71,0.06)]"
      }`}
    >
      <div className="flex items-center gap-4">
        <ProductVisual product={product} size="small" />
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-secondary">
            {label}
          </p>
          <h3 className="mt-1 font-display text-2xl leading-none text-primary">
            {product.name}
          </h3>
          <p className="mt-2 font-black text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-text-light">{description}</p>
      <button
        type="button"
        onClick={onAdd}
        className={`button-shimmer mt-auto flex min-h-11 items-center justify-center rounded-full px-5 pt-0 text-xs font-black uppercase tracking-[0.12em] transition ${
          emphasis
            ? "bg-secondary text-white hover:bg-primary"
            : "border border-secondary text-secondary hover:bg-secondary hover:text-white"
        }`}
      >
        + Adicionar ao carrinho
      </button>
    </article>
  );
}

export default function CarrinhoPage() {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingOption | null>(null);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [cep, setCep] = useState("");
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const detailedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.id);
          if (!product) return null;

          const variant =
            item.variantId && product.variants?.length
              ? product.variants.find(
                  (candidate) =>
                    variantIdFor(product, candidate) === item.variantId,
                )
              : undefined;
          const unitPrice = variant ? variant.price : product.price;
          const availableStock = variant ? variant.stock : product.stock;

          return {
            ...item,
            product,
            variant,
            unitPrice,
            availableStock,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [items],
  );

  const subtotal = detailedItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const discount = calculateDiscount(subtotal, couponCode);
  const progress = getDiscountProgress(subtotal);
  const orderBump = items.length ? getOrderBump(items) : null;
  const upsell = items.length ? getUpsell(items) : null;
  const downsell = items.length && subtotal < 10_000 ? getDownsell(items) : null;
  const crossSell = items.length ? getCrossSell(items, 3) : [];
  const shippingAmount = selectedShipping?.amount || 0;
  const total = discount.totalAfterDiscount + shippingAmount;

  function goToCheckout() {
    setError("");
    if (!selectedShipping || !shippingQuote || !cep) {
      setError(
        "Calcule o frete e escolha uma opção de entrega antes de continuar.",
      );
      return;
    }

    const query = new URLSearchParams({
      cep,
      shipping: selectedShipping.id,
    });
    if (discount.coupon.valid) {
      query.set("coupon", discount.coupon.code);
    }
    window.location.assign(withBasePath(`/checkout?${query.toString()}`));
  }

  if (!detailedItems.length) {
    return (
      <div className="hero-grid min-h-[70vh] px-5 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 animate-bob items-center justify-center rounded-full bg-white text-5xl shadow-[0_18px_45px_rgba(9,38,71,0.1)]">
          🛒
        </div>
        <h1 className="mt-6 font-display text-5xl text-primary">
          Seu carrinho está esperando uma descoberta
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-text-light">
          Escolha recursos pelo interesse e pelo objetivo do brincar. As ofertas
          aparecem como apoio à decisão, não como pressão.
        </p>
        <Link
          href="/colecoes"
          className="button-shimmer mt-8 inline-flex rounded-full bg-secondary px-8 py-4 font-black text-white transition hover:bg-primary"
        >
          Explorar os produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="hero-grid border-b border-border/45 px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">
            Seu pedido, sem surpresas
          </p>
          <h1 className="mt-3 font-display text-5xl text-primary sm:text-6xl">
            Carrinho inteligente
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-text-light">
            Veja o desconto aplicado, calcule a entrega e acrescente recursos
            complementares sem sair desta página.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-secondary/25 bg-white p-6 shadow-[0_22px_55px_rgba(9,38,71,0.08)] sm:p-8">
          <div
            className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-secondary-light/15"
            aria-hidden="true"
          />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-secondary">
                Desconto automático por valor
              </p>
              <h2 className="mt-2 font-display text-3xl text-primary sm:text-4xl">
                {discount.source === "coupon"
                  ? `${discount.tier.percent}% aplicado com o cupom ${discount.coupon.code}`
                  : progress.current.percent > 0
                    ? `${progress.current.percent}% já aplicado ao seu carrinho`
                    : "Sua primeira meta começa em R$ 100"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-light">
                {discount.coupon.valid && discount.source === "progressive"
                  ? `Seu cupom é válido, mas o desconto progressivo de ${discount.tier.percent}% é maior e foi mantido.`
                  : progress.message}
              </p>
            </div>
            <div className="rounded-full bg-primary px-5 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white">
              Economia atual: {formatMoney(discount.amount)}
            </div>
          </div>
          <div className="relative mt-6 h-4 overflow-hidden rounded-full bg-background-alt">
            <div
              className="discount-progress-fill h-full rounded-full bg-gradient-to-r from-secondary-light to-secondary transition-all duration-700"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-muted">
            <span>{progress.current.percent}% liberado por valor</span>
            <span>
              {progress.next
                ? `Próxima meta: ${progress.next.percent}%`
                : "Meta máxima atingida"}
            </span>
          </div>
        </section>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-5">
            {detailedItems.map(
              ({ product, variant, variantId, quantity, unitPrice, availableStock }) => (
                <article
                  key={`${product.id}:${variantId || "base"}`}
                  className="grid gap-5 rounded-[2rem] border border-border/50 bg-white p-5 shadow-[0_16px_42px_rgba(9,38,71,0.06)] sm:grid-cols-[128px_1fr]"
                >
                  <ProductVisual product={product} />

                  <div className="flex min-w-0 flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-secondary">
                        {product.category}
                      </p>
                      <Link
                        href={`/produto/${product.id}`}
                        className="mt-1 block font-display text-3xl leading-none text-primary transition hover:text-secondary"
                      >
                        {product.name}
                      </Link>
                      {variant ? (
                        <p className="mt-2 text-sm font-black text-secondary">
                          Opção: {variant.name}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm text-text-light">
                        {formatPrice(unitPrice)} por unidade
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <div className="inline-flex items-center rounded-full border border-border/60 bg-background p-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1, variantId)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full font-black text-primary transition hover:bg-white"
                          aria-label={`Diminuir quantidade de ${product.name}`}
                        >
                          −
                        </button>
                        <span
                          className="min-w-10 text-center font-black text-primary"
                          aria-live="polite"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1, variantId)
                          }
                          disabled={quantity >= Math.min(10, availableStock)}
                          className="flex h-9 w-9 items-center justify-center rounded-full font-black text-primary transition hover:bg-white disabled:opacity-30"
                          aria-label={`Aumentar quantidade de ${product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <p className="min-w-24 text-right font-display text-2xl text-primary">
                        {formatPrice(unitPrice * quantity)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(product.id, variantId)}
                        className="text-sm font-bold text-secondary hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}

            {orderBump ? (
              <section className="rounded-[2rem] border-2 border-dashed border-secondary/45 bg-secondary/5 p-6 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <ProductVisual product={orderBump} size="small" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
                      Order bump · adição rápida
                    </p>
                    <h2 className="mt-1 font-display text-3xl text-primary">
                      Leve também {orderBump.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-text-light">
                      Uma opção de menor investimento para ampliar as
                      possibilidades de brincadeira e aproximar o carrinho da
                      próxima meta de desconto.
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-display text-3xl text-primary">
                      {formatPrice(orderBump.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => addItem(orderBump.id)}
                      className="button-shimmer mt-3 rounded-full bg-secondary px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-primary"
                    >
                      Adicionar com 1 toque
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            <ShippingCalculator
              cart={items}
              selectedId={selectedShipping?.id}
              onCepChange={setCep}
              onSelect={(option, quote) => {
                setSelectedShipping(option);
                setShippingQuote(quote);
                setError("");
              }}
            />
          </div>

          <aside className="rounded-[2rem] border border-border/50 bg-white p-6 shadow-[0_24px_65px_rgba(9,38,71,0.1)] lg:sticky lg:top-40">
            <h2 className="font-display text-3xl text-primary">
              Resumo do pedido
            </h2>
            <div className="mt-6 space-y-4 border-b border-border/50 pb-6 text-sm">
              <div className="flex justify-between gap-4 text-text-light">
                <span>Subtotal</span>
                <strong className="text-primary">{formatPrice(subtotal)}</strong>
              </div>
              {discount.tier.percent > 0 ? (
                <div className="flex justify-between gap-4 text-secondary">
                  <span>
                    {discount.source === "coupon"
                      ? `Cupom ${discount.coupon.code} (${discount.tier.percent}%)`
                      : `Desconto progressivo (${discount.tier.percent}%)`}
                  </span>
                  <strong>− {formatMoney(discount.amount)}</strong>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 text-text-light">
                <span>{selectedShipping?.label || "Frete"}</span>
                <strong className="text-primary">
                  {selectedShipping
                    ? selectedShipping.amount === 0
                      ? "Grátis"
                      : formatMoney(selectedShipping.amount)
                    : "Calcule pelo CEP"}
                </strong>
              </div>
            </div>

            <CartCouponBox subtotal={subtotal} onCouponChange={setCouponCode} />

            <div className="flex items-end justify-between gap-4 py-6">
              <span className="font-black text-primary">Total estimado</span>
              <strong className="font-display text-4xl text-primary">
                {formatMoney(total)}
              </strong>
            </div>

            {error ? (
              <p
                className="mb-4 rounded-2xl bg-secondary/10 p-4 text-sm font-bold text-secondary"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={goToCheckout}
              className="button-shimmer w-full rounded-full bg-secondary px-6 py-4 font-black text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5 hover:bg-primary"
            >
              Ir para o pagamento
            </button>

            <div className="mt-5 space-y-2 text-xs leading-relaxed text-muted">
              <p>🔒 Checkout incorporado e processado pela Stripe.</p>
              <p>📦 O frete será recalculado no servidor antes do pagamento.</p>
              <p>
                🏷️ Cupom e desconto progressivo não são cumulativos. A loja
                aplica automaticamente o maior desconto.
              </p>
            </div>
          </aside>
        </div>

        {upsell || downsell || crossSell.length > 0 ? (
          <section className="mt-14 border-t border-border/50 pt-12">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">
                Escolhas que fazem sentido juntas
              </p>
              <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">
                Complete a proposta sem perder o ritmo
              </h2>
              <p className="mt-4 leading-7 text-text-light">
                As sugestões abaixo consideram preço e variedade. Acrescente
                apenas o que realmente combinar com o objetivo do brincar.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {upsell ? (
                <QuickAddCard
                  product={upsell}
                  label="Upsell · experiência mais completa"
                  description="Uma alternativa de maior valor para ampliar as possibilidades de uso e aproveitar o desconto progressivo do carrinho."
                  onAdd={() => addItem(upsell.id)}
                  emphasis
                />
              ) : null}
              {downsell && downsell.id !== orderBump?.id ? (
                <QuickAddCard
                  product={downsell}
                  label="Downsell · opção mais acessível"
                  description="Uma escolha de entrada para quem prefere começar com um investimento menor."
                  onAdd={() => addItem(downsell.id)}
                />
              ) : null}
              {crossSell
                .filter(
                  (product) =>
                    product.id !== upsell?.id &&
                    product.id !== downsell?.id &&
                    product.id !== orderBump?.id,
                )
                .map((product) => (
                  <QuickAddCard
                    key={product.id}
                    product={product}
                    label="Cross-sell · recurso complementar"
                    description="Pode ser usado em outra proposta, trazendo variedade sem repetir a mesma experiência."
                    onAdd={() => addItem(product.id)}
                  />
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
