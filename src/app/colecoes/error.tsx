"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ColecoesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na página de coleções:", error);
  }, [error]);

  return (
    <div className="hero-grid min-h-[70vh] px-5 py-20">
      <div className="mx-auto max-w-2xl rounded-[2.2rem] border border-border/50 bg-white p-8 text-center shadow-[0_24px_70px_rgba(9,38,71,0.1)] sm:p-12">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-background-alt text-5xl" aria-hidden="true">🧩</div>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-secondary">O catálogo teve uma pausa</p>
        <h1 className="mt-3 font-display text-5xl text-primary">Vamos organizar os brinquedos novamente</h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-text-light">
          Nenhum item do carrinho foi perdido. Tente recarregar os filtros ou volte para a página inicial.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="button-shimmer rounded-full bg-secondary px-7 py-4 text-sm font-black text-white transition hover:bg-primary"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="rounded-full border border-border/70 px-7 py-4 text-sm font-black text-primary transition hover:border-secondary hover:text-secondary"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
