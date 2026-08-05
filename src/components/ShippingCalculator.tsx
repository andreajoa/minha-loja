"use client";

import { useState } from "react";
import { formatMoney, type CartLine } from "@/lib/commerce";
import type { ShippingOption, ShippingQuote } from "@/lib/shipping-server";
import { withBasePath } from "@/lib/paths";

type Props = {
  cart: CartLine[];
  title?: string;
  compact?: boolean;
  selectedId?: string;
  onSelect?: (option: ShippingOption, quote: ShippingQuote) => void;
  onCepChange?: (cep: string) => void;
};

function formatCepInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function ShippingCalculator({
  cart,
  title = "Calcule o frete para sua casa",
  compact = false,
  selectedId,
  onSelect,
  onCepChange,
}: Props) {
  const [cep, setCep] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [activeId, setActiveId] = useState(selectedId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculate() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(withBasePath("/api/shipping/quote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, cart }),
      });
      const data = (await response.json()) as ShippingQuote & { error?: string };
      if (!response.ok || data.error) {
        throw new Error(data.error || "Não foi possível calcular o frete.");
      }

      setQuote(data);
      onCepChange?.(data.cep);
      const defaultOption =
        data.options.find((option) => option.id === selectedId) || data.options[0];
      if (defaultOption) {
        setActiveId(defaultOption.id);
        onSelect?.(defaultOption, data);
      }
    } catch (calculationError) {
      setQuote(null);
      setError(
        calculationError instanceof Error
          ? calculationError.message
          : "Não foi possível calcular o frete.",
      );
    } finally {
      setLoading(false);
    }
  }

  function choose(option: ShippingOption) {
    if (!quote) return;
    setActiveId(option.id);
    onSelect?.(option, quote);
  }

  return (
    <section
      className={`rounded-[1.7rem] border border-border/55 bg-white ${
        compact ? "p-5" : "p-6 sm:p-7"
      } shadow-[0_18px_45px_rgba(9,38,71,0.07)]`}
      aria-labelledby="shipping-calculator-title"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 animate-bob items-center justify-center rounded-2xl bg-background-alt text-2xl"
          aria-hidden="true"
        >
          📦
        </span>
        <div>
          <h2 id="shipping-calculator-title" className="font-display text-2xl text-primary">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-light">
            Entrega grátis em Santos, São Vicente e Praia Grande. Enviamos para todo o Brasil.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">CEP de entrega</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={cep}
            onChange={(event) => setCep(formatCepInput(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void calculate();
              }
            }}
            placeholder="00000-000"
            className="h-12 w-full rounded-full border border-border/70 bg-background px-5 font-bold text-primary outline-none transition placeholder:text-muted/70 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
            aria-describedby={error ? "shipping-error" : undefined}
          />
        </label>
        <button
          type="button"
          onClick={() => void calculate()}
          disabled={loading || cep.replace(/\D/g, "").length !== 8}
          className="button-shimmer h-12 rounded-full bg-primary px-6 text-xs font-black uppercase tracking-[0.13em] text-white transition hover:-translate-y-0.5 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? "Calculando..." : "Calcular frete"}
        </button>
      </div>

      {error ? (
        <p
          id="shipping-error"
          className="mt-4 rounded-2xl bg-secondary/10 p-4 text-sm font-bold text-secondary"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {quote ? (
        <div className="mt-5">
          <p className="rounded-2xl bg-background-alt px-4 py-3 text-sm font-bold text-text-light">
            <span className="text-primary">Destino:</span> {quote.addressLabel}
          </p>

          <div className="mt-3 space-y-3" role="radiogroup" aria-label="Opções de entrega">
            {quote.options.map((option) => {
              const selected = activeId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => choose(option)}
                  className={`group flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-secondary bg-secondary/5 shadow-[0_10px_28px_rgba(161,77,45,0.12)]"
                      : "border-border/55 hover:-translate-y-0.5 hover:border-secondary-light"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? "border-secondary" : "border-border"
                      }`}
                      aria-hidden="true"
                    >
                      {selected ? <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-black text-primary">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-text-light">
                        {option.description}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <strong className={option.amount === 0 ? "text-secondary" : "text-primary"}>
                      {option.amount === 0 ? "Grátis" : formatMoney(option.amount)}
                    </strong>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                      {option.minimumDays}–{option.maximumDays} dias úteis
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {!quote.correiosConfigured && !quote.localFreeDelivery ? (
            <p className="mt-3 text-xs leading-5 text-muted">
              O valor exibido é provisório até a ativação das credenciais contratuais dos Correios.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
