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
  emailSent?: boolean;
  error?: string;
};

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  const normalized = digits.startsWith("55") ? digits.slice(2) : digits;

  if (normalized.length <= 2) return normalized;
  if (normalized.length <= 6) {
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2)}`;
  }
  if (normalized.length <= 10) {
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6)}`;
  }
  return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7, 11)}`;
}

export default function NewsletterOfferPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
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

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closePopup();
    }

    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [open, status]);

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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-primary/70 p-3 backdrop-blur-md sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) closePopup();
      }}
    >
      <section
        className="relative my-auto grid max-h-[94svh] w-full max-w-[920px] overflow-y-auto overscroll-contain rounded-[1.7rem] border border-white/65 bg-background shadow-[0_32px_110px_rgba(9,38,71,0.45)] md:grid-cols-[0.9fr_1.1fr] md:overflow-hidden md:rounded-[2.4rem]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-offer-title"
      >
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/75 bg-white/95 text-xl font-black text-primary shadow-lg transition hover:scale-105 hover:bg-background-alt sm:right-5 sm:top-5"
          aria-label="Fechar oferta"
        >
          ×
        </button>

        <div className="relative min-h-44 overflow-hidden bg-background-alt md:min-h-[610px]">
          <img
            src="/instagram-strip/1.png"
            alt="Criança explorando materiais sensoriais em uma brincadeira acolhedora"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/5 to-transparent md:bg-gradient-to-r md:from-primary/5 md:via-transparent md:to-primary/18" />
          <div className="absolute bottom-4 left-4 right-4 text-white md:bottom-7 md:left-7 md:right-7">
            <span className="inline-flex rounded-full border border-white/40 bg-primary/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur">
              Brincar com propósito
            </span>
            <p className="mt-3 hidden max-w-xs font-display text-3xl leading-tight drop-shadow md:block">
              Um presente para tornar sua primeira escolha ainda mais especial.
            </p>
          </div>
          <span className="absolute left-5 top-5 hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-2xl shadow-lg md:flex" aria-hidden="true">
            ✦
          </span>
        </div>

        <div className="relative flex min-w-0 flex-col justify-center p-5 sm:p-8 md:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-secondary-light/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full border border-secondary/10" />

          {status === "success" ? (
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-secondary/10 text-3xl shadow-sm sm:h-20 sm:w-20 sm:text-4xl">
                🎁
              </div>
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary sm:text-xs">
                Benefício liberado
              </p>
              <h2
                id="newsletter-offer-title"
                className="mt-2 font-display text-4xl leading-[1.02] text-primary sm:text-5xl"
              >
                Seu cupom de 5% está pronto
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-text-light sm:text-base sm:leading-7">
                {message}
              </p>

              <button
                type="button"
                onClick={copyCoupon}
                className="group mt-6 w-full rounded-[1.4rem] border-2 border-dashed border-secondary bg-white px-4 py-5 text-center shadow-[0_14px_35px_rgba(161,77,45,0.10)] transition hover:-translate-y-0.5 hover:bg-background-alt"
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
                  Toque para copiar
                </span>
                <strong className="mt-1 block break-all text-2xl tracking-[0.1em] text-primary sm:text-3xl">
                  {couponCode}
                </strong>
              </button>

              <p className="mt-4 text-xs leading-5 text-muted">
                O cupom não é cumulativo. Se o desconto progressivo for maior,
                a loja aplica automaticamente a melhor condição.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/carrinho"
                  onClick={() => setOpen(false)}
                  className="button-shimmer flex min-h-12 items-center justify-center rounded-full bg-secondary px-5 text-center text-sm font-black text-white hover:bg-primary"
                >
                  Usar no carrinho
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-12 rounded-full border border-border bg-white px-5 text-sm font-black text-primary transition hover:border-secondary hover:text-secondary"
                >
                  Continuar navegando
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary sm:text-xs">
                Presente de boas-vindas
              </p>
              <h2
                id="newsletter-offer-title"
                className="mt-2 max-w-md font-display text-4xl leading-[0.98] text-primary sm:text-5xl lg:text-6xl"
              >
                Ganhe 5% de desconto
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-text-light sm:text-base sm:leading-7">
                Deixe seu e-mail e WhatsApp para receber promoções, cupons,
                novidades e conteúdos da BrinqueTEAndo.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-primary sm:mt-6">
                <span className="rounded-full bg-background-alt px-3 py-2">🎁 Cupom imediato</span>
                <span className="rounded-full bg-background-alt px-3 py-2">♡ Conteúdo com propósito</span>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="offer-email"
                    className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-primary sm:text-xs"
                  >
                    E-mail
                  </label>
                  <input
                    id="offer-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@email.com"
                    className="min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-base text-primary outline-none transition placeholder:text-muted focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="offer-whatsapp"
                    className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-primary sm:text-xs"
                  >
                    WhatsApp com DDD
                  </label>
                  <input
                    id="offer-whatsapp"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    value={whatsapp}
                    onChange={(event) =>
                      setWhatsapp(formatWhatsapp(event.target.value))
                    }
                    placeholder="(13) 99999-9999"
                    className="min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-base text-primary outline-none transition placeholder:text-muted focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-background-alt p-3.5 text-xs leading-5 text-text-light sm:p-4 sm:text-sm sm:leading-6">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-secondary"
                  />
                  <span>
                    Aceito receber novidades, promoções e cupons. Posso cancelar
                    quando desejar.
                  </span>
                </label>

                {message ? (
                  <p
                    className={`rounded-2xl p-4 text-sm font-bold ${
                      status === "error"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-background-alt text-primary"
                    }`}
                    role="alert"
                  >
                    {message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === "loading" || !consent}
                  className="button-shimmer min-h-13 w-full rounded-full bg-secondary px-6 py-4 font-black text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading"
                    ? "Liberando seu cupom..."
                    : "Quero meu desconto de 5%"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
