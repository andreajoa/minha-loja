"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  COUPON_STORAGE_KEY,
  NEWSLETTER_COUPON_CODE,
} from "@/lib/coupons";
import { withBasePath } from "@/lib/paths";

const DISMISSED_STORAGE_KEY = "brinqueteando_offer_dismissed_at";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

type ApiResponse = {
  ok?: boolean;
  couponCode?: string;
  message?: string;
  error?: string;
};

export default function NewsletterOfferPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [couponCode, setCouponCode] = useState(NEWSLETTER_COUPON_CODE);

  useEffect(() => {
    if (pathname.startsWith("/checkout") || pathname.startsWith("/sucesso")) {
      return;
    }

    const existingCoupon = window.localStorage.getItem(COUPON_STORAGE_KEY);
    if (existingCoupon) return;

    const dismissedAt = Number(
      window.localStorage.getItem(DISMISSED_STORAGE_KEY) || "0",
    );
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_MS) return;

    const timer = window.setTimeout(() => setOpen(true), 4500);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  function closePopup() {
    setOpen(false);
    if (status !== "success") {
      window.localStorage.setItem(DISMISSED_STORAGE_KEY, String(Date.now()));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(withBasePath("/api/newsletter"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          whatsapp,
          source: "popup",
          consent,
          website: "",
        }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok || !data.couponCode) {
        throw new Error(data.error || "Não foi possível liberar seu cupom.");
      }

      setCouponCode(data.couponCode);
      window.localStorage.setItem(COUPON_STORAGE_KEY, data.couponCode);
      window.localStorage.removeItem(DISMISSED_STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent("brinqueteando:coupon", {
          detail: { code: data.couponCode },
        }),
      );
      setStatus("success");
      setMessage(
        data.message ||
          "Sua inscrição foi confirmada. Seu cupom já está disponível!",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível liberar seu cupom agora.",
      );
    }
  }

  async function copyCoupon() {
    await navigator.clipboard.writeText(couponCode);
    setMessage("Cupom copiado! Use no carrinho para receber seu desconto.");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/65 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) closePopup();
      }}
    >
      <section
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/60 bg-background p-6 shadow-[0_30px_100px_rgba(9,38,71,0.4)] sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-offer-title"
      >
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black text-primary shadow-sm"
          aria-label="Fechar oferta"
        >
          ×
        </button>

        {status === "success" ? (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-4xl">
              🎁
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-secondary">
              Benefício liberado
            </p>
            <h2
              id="newsletter-offer-title"
              className="mt-2 font-display text-4xl leading-tight text-primary"
            >
              Seu cupom de 5% está pronto
            </h2>
            <p className="mt-4 leading-7 text-text-light">{message}</p>

            <button
              type="button"
              onClick={copyCoupon}
              className="mt-6 w-full rounded-2xl border-2 border-dashed border-secondary bg-white px-5 py-5 text-center"
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
                Clique para copiar
              </span>
              <strong className="mt-1 block text-3xl tracking-[0.12em] text-primary">
                {couponCode}
              </strong>
            </button>

            <p className="mt-4 text-xs leading-5 text-muted">
              O cupom não é cumulativo. Se o desconto progressivo do carrinho
              for maior, a loja mantém automaticamente a melhor condição.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/carrinho"
                onClick={() => setOpen(false)}
                className="button-shimmer flex-1 rounded-full bg-secondary px-6 py-4 text-center text-sm font-black text-white hover:bg-primary"
              >
                Usar no carrinho
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-border px-6 py-4 text-sm font-black text-primary"
              >
                Continuar navegando
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="pr-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">
                Presente de boas-vindas
              </p>
              <h2
                id="newsletter-offer-title"
                className="mt-2 font-display text-4xl leading-tight text-primary sm:text-5xl"
              >
                Ganhe 5% de desconto
              </h2>
              <p className="mt-4 leading-7 text-text-light">
                Deixe seu e-mail e WhatsApp para receber promoções, cupons,
                novidades e conteúdos da BrinqueTEAndo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="offer-email"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-primary"
                >
                  E-mail
                </label>
                <input
                  id="offer-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@email.com"
                  className="min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-primary outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label
                  htmlFor="offer-whatsapp"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-primary"
                >
                  WhatsApp com DDD
                </label>
                <input
                  id="offer-whatsapp"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="(13) 99999-9999"
                  className="min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-primary outline-none focus:border-secondary"
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-background-alt p-4 text-sm leading-6 text-text-light">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-secondary"
                />
                <span>
                  Aceito receber mensagens com novidades, promoções e cupons.
                  Posso cancelar quando desejar.
                </span>
              </label>

              {message ? (
                <p
                  className="rounded-2xl bg-secondary/10 p-4 text-sm font-bold text-secondary"
                  role="alert"
                >
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "loading" || !consent}
                className="button-shimmer w-full rounded-full bg-secondary px-6 py-4 font-black text-white shadow-lg shadow-secondary/20 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading"
                  ? "Liberando seu cupom..."
                  : "Quero meu desconto de 5%"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
