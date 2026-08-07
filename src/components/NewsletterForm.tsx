"use client";

import { FormEvent, useState } from "react";
import { withBasePath } from "@/lib/paths";

type ApiResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
          source: "footer",
          consent: true,
          website: "",
        }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Não foi possível concluir sua inscrição.");
      }

      setStatus("success");
      setMessage(
        data.message ||
          "Sua inscrição foi confirmada. É uma honra ter você em nossa newsletter!",
      );
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir sua inscrição agora.",
      );
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="newsletter-email">
          Seu e-mail
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="SEU E-MAIL"
          className="min-h-12 flex-1 rounded-full border border-white/55 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-white/65 focus:border-white focus:bg-white/15"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="button-shimmer min-h-12 rounded-full bg-primary px-8 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:-translate-y-1 hover:bg-secondary-light hover:text-primary disabled:cursor-wait disabled:opacity-70"
        >
          {status === "loading" ? "Inscrevendo..." : "Quero receber"}
        </button>
      </form>

      <p className="mt-3 text-xs leading-5 text-white/70">
        Ao se inscrever, você aceita receber novidades, promoções e cupons da
        BrinqueTEAndo.
      </p>

      {message ? (
        <div
          className={`mt-5 rounded-2xl px-5 py-4 text-sm font-bold leading-6 ${
            status === "success"
              ? "bg-white text-primary"
              : "bg-primary/55 text-white"
          }`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
