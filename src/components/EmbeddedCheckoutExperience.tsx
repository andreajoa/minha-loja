"use client";

import Link from "next/link";
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { calculateDiscount, formatMoney } from "@/lib/commerce";
import { products } from "@/data/products";
import { withBasePath } from "@/lib/paths";

type Props = {
  cep: string;
  shippingId: string;
};

type CheckoutSummary = {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  shippingAmount: number;
  shippingLabel: string;
};

export default function EmbeddedCheckoutExperience({ cep, shippingId }: Props) {
  const { items } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<StripeEmbeddedCheckout | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);

  const detailedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.id);
          return product ? { ...item, product } : null;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [items],
  );

  const subtotal = detailedItems.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );
  const localDiscount = calculateDiscount(subtotal);
  const cartKey = JSON.stringify(items);

  useEffect(() => {
    let cancelled = false;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    async function mountCheckout() {
      if (!publishableKey) {
        setError("A chave pública da Stripe não está configurada.");
        setLoading(false);
        return;
      }
      if (!items.length || !cep || !shippingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        checkoutRef.current?.destroy();
        checkoutRef.current = null;
        if (containerRef.current) containerRef.current.innerHTML = "";

        const stripe = await loadStripe(publishableKey);
        if (!stripe) throw new Error("Não foi possível carregar o pagamento seguro.");

        const checkout = await stripe.initEmbeddedCheckout({
          fetchClientSecret: async () => {
            const response = await fetch(withBasePath("/api/checkout/embedded"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cart: items, cep, shippingId }),
            });
            const data = (await response.json()) as {
              clientSecret?: string;
              error?: string;
              summary?: CheckoutSummary;
            };
            if (!response.ok || !data.clientSecret) {
              throw new Error(data.error || "Não foi possível preparar o pagamento.");
            }
            if (!cancelled && data.summary) setSummary(data.summary);
            return data.clientSecret;
          },
        });

        if (cancelled) {
          checkout.destroy();
          return;
        }

        checkoutRef.current = checkout;
        if (!containerRef.current) throw new Error("Área de pagamento indisponível.");
        checkout.mount(containerRef.current);
        setLoading(false);
      } catch (checkoutError) {
        if (!cancelled) {
          setError(
            checkoutError instanceof Error
              ? checkoutError.message
              : "Não foi possível abrir o pagamento.",
          );
          setLoading(false);
        }
      }
    }

    void mountCheckout();

    return () => {
      cancelled = true;
      checkoutRef.current?.destroy();
      checkoutRef.current = null;
    };
  }, [cartKey, cep, shippingId]);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-background-alt text-5xl">🛒</div>
        <h1 className="mt-6 font-display text-5xl text-primary">Seu carrinho está vazio</h1>
        <Link href="/colecoes" className="button-shimmer mt-8 inline-flex rounded-full bg-secondary px-8 py-4 font-black text-white">
          Escolher produtos
        </Link>
      </div>
    );
  }

  if (!cep || !shippingId) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-background-alt text-5xl">📦</div>
        <h1 className="mt-6 font-display text-5xl text-primary">Calcule o frete primeiro</h1>
        <p className="mt-4 text-text-light">Escolha a entrega no carrinho para que o valor correto seja incluído no pagamento.</p>
        <Link href="/carrinho" className="mt-8 inline-flex rounded-full bg-secondary px-8 py-4 font-black text-white">
          Voltar ao carrinho
        </Link>
      </div>
    );
  }

  const displaySummary = summary || {
    subtotal,
    discountPercent: localDiscount.tier.percent,
    discountAmount: localDiscount.amount,
    shippingAmount: 0,
    shippingLabel: "Frete selecionado",
  };
  const total =
    displaySummary.subtotal -
    displaySummary.discountAmount +
    displaySummary.shippingAmount;

  return (
    <div className="hero-grid min-h-screen border-t border-border/40">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">Pagamento protegido</p>
            <h1 className="mt-2 font-display text-5xl text-primary sm:text-6xl">Finalize sem sair da loja</h1>
            <p className="mt-4 max-w-2xl leading-7 text-text-light">
              Revise seus dados, o endereço e o cartão no formulário seguro da Stripe.
            </p>
          </div>
          <Link href="/carrinho" className="nav-link text-xs font-black uppercase tracking-[0.14em] text-secondary">
            ← Voltar ao carrinho
          </Link>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-[2rem] border border-border/50 bg-white p-6 shadow-[0_22px_55px_rgba(9,38,71,0.09)] lg:sticky lg:top-40">
            <h2 className="font-display text-3xl text-primary">Resumo transparente</h2>
            <div className="mt-5 space-y-3 text-sm">
              {detailedItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between gap-3 border-b border-border/35 pb-3">
                  <span className="text-text-light">{quantity}× {product.name}</span>
                  <strong className="text-primary">{formatMoney(product.price * quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3 text-text-light">
                <span>Subtotal</span><strong className="text-primary">{formatMoney(displaySummary.subtotal)}</strong>
              </div>
              {displaySummary.discountPercent > 0 ? (
                <div className="flex justify-between gap-3 text-secondary">
                  <span>Desconto progressivo ({displaySummary.discountPercent}%)</span>
                  <strong>− {formatMoney(displaySummary.discountAmount)}</strong>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 text-text-light">
                <span>{displaySummary.shippingLabel}</span>
                <strong className="text-primary">
                  {displaySummary.shippingAmount === 0 ? "Grátis" : formatMoney(displaySummary.shippingAmount)}
                </strong>
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-border/50 pt-5">
              <span className="font-black text-primary">Total</span>
              <strong className="font-display text-4xl text-primary">{formatMoney(total)}</strong>
            </div>
            <div className="mt-5 rounded-2xl bg-background-alt p-4 text-xs leading-5 text-text-light">
              <p>🔒 Dados do cartão são enviados diretamente à Stripe.</p>
              <p className="mt-2">💳 Você poderá autorizar o salvamento seguro do cartão para uma compra futura mais rápida.</p>
            </div>
          </aside>

          <section className="min-h-[680px] rounded-[2rem] border border-border/50 bg-white p-3 shadow-[0_24px_70px_rgba(9,38,71,0.1)] sm:p-6">
            {loading ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-background-alt border-t-secondary" />
                <p className="mt-5 font-bold text-text-light">Preparando seu pagamento seguro...</p>
              </div>
            ) : null}
            {error ? (
              <div className="m-4 rounded-3xl bg-secondary/10 p-6 text-center" role="alert">
                <p className="font-black text-secondary">{error}</p>
                <Link href="/carrinho" className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-black text-white">
                  Revisar o carrinho
                </Link>
              </div>
            ) : null}
            <div ref={containerRef} className={loading || error ? "hidden" : "block"} />
          </section>
        </div>
      </div>
    </div>
  );
}
