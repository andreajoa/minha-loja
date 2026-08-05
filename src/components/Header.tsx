"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useCart } from "@/components/CartProvider";
import { categories } from "@/data/products";

function Icon({ children }: { children: ReactNode }) {
  return <span className="flex h-9 w-9 items-center justify-center text-lg" aria-hidden="true">{children}</span>;
}

export default function Header() {
  const { itemCount } = useCart();
  const menuCategories = categories.filter((category) => category !== "Todos").slice(0, 5);

  return (
    <header className="sticky top-0 z-50 border-b border-ardosia/10 bg-creme/95 backdrop-blur-xl">
      <div className="bg-ardosia px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 sm:text-xs">
        Curadoria neuropsicopedagógica para escolhas mais conscientes no brincar
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-7">
        <div className="flex items-center">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ardosia/70 hover:text-ardosia">
                <Icon>♙</Icon><span className="hidden lg:inline">Entrar</span>
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
          </Show>
        </div>

        <Link href="/" className="font-display text-2xl tracking-[0.08em] text-ardosia sm:text-3xl" aria-label="BrinqueTEAndo — página inicial">
          BRINQUE<span className="text-coral">TEA</span>NDO
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Link href="/colecoes" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-ardosia/70 hover:text-ardosia md:flex">
            <Icon>⌕</Icon><span>Buscar</span>
          </Link>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button type="button" className="hidden border-l border-ardosia/15 pl-4 text-xs font-bold uppercase tracking-[0.12em] text-coral hover:text-ardosia lg:inline-flex">
                Criar conta
              </button>
            </SignUpButton>
          </Show>
          <Link href="/carrinho" className="relative flex items-center" aria-label={`Carrinho com ${itemCount} item${itemCount === 1 ? "" : "s"}`}>
            <Icon>🛒</Icon>
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{itemCount}</span>
          </Link>
        </div>
      </div>

      <nav className="border-t border-ardosia/10" aria-label="Menu principal">
        <div className="mx-auto flex max-w-[1440px] items-center gap-7 overflow-x-auto px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ardosia/72 sm:justify-center sm:px-7">
          <Link href="/sobre" className="shrink-0 hover:text-coral">Nossa curadoria</Link>
          {menuCategories.map((category) => (
            <Link key={category} href={`/colecoes?categoria=${encodeURIComponent(category)}`} className="shrink-0 hover:text-coral">
              {category}
            </Link>
          ))}
          <Link href="/colecoes" className="shrink-0 hover:text-coral">Todos os produtos</Link>
          <Link href="/contato" className="shrink-0 hover:text-coral">Ajuda</Link>
        </div>
      </nav>
    </header>
  );
}
