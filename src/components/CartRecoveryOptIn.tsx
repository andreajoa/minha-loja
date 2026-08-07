"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { withBasePath } from "@/lib/paths";

const STARTED_KEY = "bt_cart_recovery_started";

type ResponseData = { ok?: boolean; eligible?: boolean; message?: string; error?: string };

export default function CartRecoveryOptIn() {
  const { items } = useCart();
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch(withBasePath("/api/marketing/recovery-status"), { cache: "no-store" })
      .then((response) => response.json())
      .then((data: ResponseData) => {
        if (active) setEligible(Boolean(data.eligible));
      })
      .catch(() => {
        if (active) setEligible(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch(withBasePath("/api/marketing/recovery-consent"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, cart: items }),
      });
      const data = (await response.json()) as ResponseData;
      if (!response.ok || !data.ok) throw new Error(data.error || "Não foi possível ativar os lembretes.");
      window.localStorage.setItem(STARTED_KEY, "1");
      setEligible(true);
      setStatus("success");
      setMessage(data.message || "Lembretes ativados.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível ativar os lembretes.");
    }
  }

  if (eligible === null) return null;

  if (eligible) {
    return (
      <div className="mt-5 rounded-2xl border border-primary/10 bg-background-alt p-4 text-xs leading-5 text-text-light">
        <strong className="text-primary">✓ Seu carrinho pode ser recuperado por e-mail.</strong>
        <p className="mt-1">Se você não concluir a compra, os lembretes param automaticamente quando o pagamento for confirmado.</p>
        {status === "success" && message ? <p className="mt-2 font-bold text-secondary">{message}</p> : null}
      </div>
    );
  }

  return (
    <section className="mt-5 rounded-[1.4rem] border border-secondary/20 bg-background-alt p-4 sm:p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-secondary">Quer que a gente guarde este carrinho?</p>
      <p className="mt-2 text-sm leading-6 text-text-light">Deixe seu e-mail e, se você não concluir a compra, podemos enviar até 5 lembretes desta seleção. Isso não inscreve você automaticamente na newsletter.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <label className="block">
          <span className="sr-only">E-mail para recuperar carrinho</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            className="min-h-12 w-full rounded-xl border border-border bg-white px-4 text-base text-primary outline-none focus:border-secondary"
          />
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-text-light">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-secondary"
          />
          <span>Aceito receber lembretes sobre este carrinho e checkout. Posso cancelar a qualquer momento.</span>
        </label>
        {message && status === "error" ? <p className="rounded-xl bg-secondary/10 p-3 text-xs font-bold text-secondary" role="alert">{message}</p> : null}
        <button
          type="submit"
          disabled={!consent || status === "loading"}
          className="min-h-11 w-full rounded-full border border-secondary bg-white px-5 text-xs font-black uppercase tracking-[0.1em] text-secondary transition hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Ativando..." : "Guardar meu carrinho"}
        </button>
      </form>
    </section>
  );
}
