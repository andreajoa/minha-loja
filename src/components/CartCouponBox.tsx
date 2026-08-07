"use client";

import { FormEvent, useEffect, useState } from "react";
import { calculateDiscount } from "@/lib/commerce";
import {
  COUPON_STORAGE_KEY,
  isNewsletterCoupon,
  NEWSLETTER_COUPON_CODE,
  normalizeCouponCode,
} from "@/lib/coupons";

type Props = {
  subtotal: number;
  onCouponChange: (code: string) => void;
};

export default function CartCouponBox({ subtotal, onCouponChange }: Props) {
  const [input, setInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = normalizeCouponCode(
      window.localStorage.getItem(COUPON_STORAGE_KEY),
    );
    if (isNewsletterCoupon(stored)) {
      setInput(stored);
      setAppliedCode(stored);
      onCouponChange(stored);
    }

    function receiveCoupon(event: Event) {
      const customEvent = event as CustomEvent<{ code?: string }>;
      const code = normalizeCouponCode(customEvent.detail?.code);
      if (!isNewsletterCoupon(code)) return;
      setInput(code);
      setAppliedCode(code);
      onCouponChange(code);
      setMessage("Cupom recebido e aplicado ao carrinho.");
    }

    window.addEventListener("brinqueteando:coupon", receiveCoupon);
    return () =>
      window.removeEventListener("brinqueteando:coupon", receiveCoupon);
  }, [onCouponChange]);

  const discount = calculateDiscount(subtotal, appliedCode);

  function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeCouponCode(input);

    if (!isNewsletterCoupon(normalized)) {
      setAppliedCode("");
      onCouponChange("");
      setMessage("Cupom não encontrado. Confira o código e tente novamente.");
      return;
    }

    setInput(normalized);
    setAppliedCode(normalized);
    window.localStorage.setItem(COUPON_STORAGE_KEY, normalized);
    onCouponChange(normalized);

    if (discount.source === "progressive" && discount.tier.percent > 5) {
      setMessage(
        `Cupom válido. Mantivemos o desconto progressivo de ${discount.tier.percent}%, que é maior.`,
      );
    } else {
      setMessage("Cupom aplicado! Você recebeu 5% de desconto.");
    }
  }

  function removeCoupon() {
    setAppliedCode("");
    setInput("");
    setMessage("Cupom removido do carrinho.");
    window.localStorage.removeItem(COUPON_STORAGE_KEY);
    onCouponChange("");
  }

  return (
    <section className="mt-6 rounded-2xl border border-secondary/25 bg-background-alt p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-secondary">
        Cupom de desconto
      </p>
      <form onSubmit={applyCoupon} className="mt-3 flex gap-2">
        <label htmlFor="cart-coupon" className="sr-only">
          Código do cupom
        </label>
        <input
          id="cart-coupon"
          value={input}
          onChange={(event) => setInput(event.target.value.toUpperCase())}
          placeholder="DIGITE SEU CUPOM"
          className="min-h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-primary outline-none focus:border-secondary"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-5 text-xs font-black uppercase tracking-[0.1em] text-white hover:bg-secondary"
        >
          Aplicar
        </button>
      </form>

      {appliedCode ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white p-3 text-sm">
          <span className="font-bold text-primary">
            {NEWSLETTER_COUPON_CODE} · 5% de desconto
          </span>
          <button
            type="button"
            onClick={removeCoupon}
            className="text-xs font-black uppercase tracking-[0.08em] text-secondary hover:underline"
          >
            Remover
          </button>
        </div>
      ) : null}

      {message ? (
        <p
          className={`mt-3 text-xs font-bold leading-5 ${
            appliedCode ? "text-primary" : "text-secondary"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted">
          Recebeu o cupom de boas-vindas? Digite aqui. Os descontos não são
          cumulativos: sempre aplicamos o maior.
        </p>
      )}
    </section>
  );
}
