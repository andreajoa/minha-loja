"use client";

import Link from "next/link";
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatMoney } from "@/lib/commerce";
import { withBasePath } from "@/lib/paths";

type ProductPreview = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  emoji: string;
  category: string;
};

type Offer = {
  product: ProductPreview;
  originalPrice: number;
  offerPrice: number;
  percent: number;
};

type StatusResponse = {
  visible?: boolean;
  expiresAt?: number;
  offer?: Offer;
  recommendations?: ProductPreview[];
  error?: string;
};

export default function PostPurchaseOffer({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [recommendations, setRecommendations] = useState<ProductPreview[]>([]);
  const [expiresAt, setExpiresAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const embeddedContainerRef = useRef<HTMLDivElement>(null);
  const embeddedCheckoutRef = useRef<StripeEmbeddedCheckout | null>(null);
  const requestedRef = useRef(false);
  const storageKey = useMemo(() => `brinqueteando-post-offer-${sessionId}`, [sessionId]);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    if (window.localStorage.getItem(storageKey) === "viewed") {
      setLoading(false);
      return;
    }

    async function loadOffer() {
      try {
        const response = await fetch(withBasePath("/api/post-purchase"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", sessionId }),
        });
        const data = (await response.json()) as StatusResponse;
        if (!response.ok) throw new Error(data.error || "Não foi possível carregar a oferta.");
        if (data.visible && data.offer && data.expiresAt) {
          setOffer(data.offer);
          setRecommendations(data.recommendations || []);
          setExpiresAt(data.expiresAt);
          setSecondsLeft(Math.max(0, data.expiresAt - Math.floor(Date.now() / 1000)));
          window.localStorage.setItem(storageKey, "viewed");
        }
      } catch (loadError) {
        console.warn(loadError);
      } finally {
        setLoading(false);
      }
    }

    void loadOffer();
  }, [sessionId, storageKey]);

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => {
      setSecondsLeft(Math.max(0, expiresAt - Math.floor(Date.now() / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    return () => {
      embeddedCheckoutRef.current?.destroy();
      embeddedCheckoutRef.current = null;
    };
  }, []);

  async function finalizePayment(paymentIntentId: string) {
    const response = await fetch(withBasePath("/api/post-purchase"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "finalize",
        sessionId,
        paymentIntentId,
      }),
    });
    const data = (await response.json()) as { success?: boolean; error?: string };
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Não foi possível confirmar a compra adicional.");
    }
  }

  async function mountFallbackCheckout(clientSecret: string) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) throw new Error("Stripe não configurada para a compra rápida.");
    const stripe = await loadStripe(publishableKey);
    if (!stripe) throw new Error("Não foi possível carregar o pagamento seguro.");

    embeddedCheckoutRef.current?.destroy();
    if (embeddedContainerRef.current) embeddedContainerRef.current.innerHTML = "";
    const checkout = await stripe.createEmbeddedCheckoutPage({
      fetchClientSecret: async () => clientSecret,
    });
    embeddedCheckoutRef.current = checkout;
    if (!embeddedContainerRef.current) throw new Error("Área de pagamento indisponível.");
    checkout.mount(embeddedContainerRef.current);
  }

  async function claimOffer() {
    if (!offer || claiming || secondsLeft <= 0) return;
    setClaiming(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(withBasePath("/api/post-purchase"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "claim",
          sessionId,
          productId: offer.product.id,
        }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        requiresAction?: boolean;
        requiresCheckout?: boolean;
        clientSecret?: string;
        embeddedClientSecret?: string;
        paymentIntentId?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Não foi possível aproveitar a oferta.");

      if (data.success) {
        setMessage("Produto adicionado ao mesmo envio com 30% de desconto.");
        return;
      }

      if (data.requiresAction && data.clientSecret && data.paymentIntentId) {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) throw new Error("Stripe não configurada.");
        const stripe = await loadStripe(publishableKey);
        if (!stripe) throw new Error("Não foi possível carregar a autenticação do cartão.");
        const result = await stripe.confirmCardPayment(data.clientSecret);
        if (result.error) throw new Error(result.error.message || "O cartão não confirmou a compra adicional.");
        if (result.paymentIntent?.status === "succeeded") {
          await finalizePayment(result.paymentIntent.id);
          setMessage("Compra adicional confirmada com 30% de desconto.");
          return;
        }
      }

      if (data.requiresCheckout && data.embeddedClientSecret) {
        await mountFallbackCheckout(data.embeddedClientSecret);
        setMessage("Confirme abaixo. Os dados salvos pela Stripe poderão tornar esta etapa mais rápida.");
        return;
      }

      throw new Error("A Stripe não retornou uma forma de concluir a oferta.");
    } catch (claimError) {
      setError(
        claimError instanceof Error
          ? claimError.message
          : "Não foi possível aproveitar a oferta.",
      );
    } finally {
      setClaiming(false);
    }
  }

  if (loading || !offer) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft <= 0;

  return (
    <section className="mt-10 text-left" aria-labelledby="post-purchase-title">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-secondary/35 bg-[linear-gradient(135deg,#fff,#F2E6DE)] p-6 shadow-[0_25px_70px_rgba(9,38,71,0.12)] sm:p-8">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-secondary-light/20" aria-hidden="true" />
        <div className="relative grid items-center gap-7 md:grid-cols-[220px_1fr]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_45px_rgba(9,38,71,0.1)]">
            {offer.product.image ? (
              <img src={offer.product.image} alt={offer.product.name} className="h-full w-full object-cover" />
            ) : (
              <span className="animate-bob text-8xl" aria-hidden="true">{offer.product.emoji}</span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-secondary px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                Oferta única desta compra
              </span>
              <span className="rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                {expired ? "Encerrada" : `${minutes}:${seconds}`}
              </span>
            </div>
            <h2 id="post-purchase-title" className="mt-5 font-display text-4xl leading-none text-primary sm:text-5xl">
              Acrescente {offer.product.name} ao mesmo envio
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-text-light">
              Esta sugestão aparece uma única vez porque complementa o pedido que acabou de ser aprovado. O desconto não será exibido novamente ao atualizar a página.
            </p>

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <span className="text-lg text-muted line-through">{formatMoney(offer.originalPrice)}</span>
              <strong className="font-display text-5xl text-secondary">{formatMoney(offer.offerPrice)}</strong>
              <span className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-black text-secondary">{offer.percent}% OFF</span>
            </div>

            <button
              type="button"
              onClick={() => void claimOffer()}
              disabled={claiming || expired || Boolean(message && !embeddedCheckoutRef.current)}
              className="button-shimmer mt-6 rounded-full bg-secondary px-8 py-4 font-black text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {claiming ? "Processando..." : expired ? "Oferta encerrada" : "Adicionar com 30% de desconto"}
            </button>

            {message ? <p className="mt-4 rounded-2xl bg-primary/8 p-4 text-sm font-bold text-primary">{message}</p> : null}
            {error ? <p className="mt-4 rounded-2xl bg-secondary/10 p-4 text-sm font-bold text-secondary" role="alert">{error}</p> : null}
          </div>
        </div>

        <div ref={embeddedContainerRef} className="relative mt-7 overflow-hidden rounded-[1.7rem] bg-white" />
      </div>

      {recommendations.length > 0 ? (
        <div className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.17em] text-secondary">Outras ideias para uma próxima escolha</p>
          <h2 className="mt-2 font-display text-3xl text-primary">Continue aprendendo sobre os recursos</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {recommendations.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.id}`}
                className="group rounded-[1.6rem] border border-border/50 bg-white p-4 shadow-[0_14px_36px_rgba(9,38,71,0.06)] transition hover:-translate-y-1 hover:border-secondary"
              >
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-background-alt">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <span className="text-5xl" aria-hidden="true">{product.emoji}</span>
                  )}
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-secondary">{product.category}</p>
                <h3 className="mt-1 font-display text-2xl leading-none text-primary">{product.name}</h3>
                <p className="mt-3 font-black text-primary">{formatMoney(product.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
