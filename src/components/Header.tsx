"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-teal/10 bg-creme/95 backdrop-blur-xl">
      <div className="bg-ardosia px-4 py-2 text-center text-xs font-semibold text-white">
        Curadoria neuropsicopedagógica para escolhas mais conscientes no brincar
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="shrink-0 text-2xl font-black tracking-tight text-ardosia">
          Brinque<span className="text-teal-dark">TEA</span>ndo
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold md:flex" aria-label="Menu principal">
          <Link href="/" className="transition hover:text-teal-dark">
            Início
          </Link>
          <Link href="/colecoes" className="transition hover:text-teal-dark">
            Produtos
          </Link>
          <Link href="/sobre" className="transition hover:text-teal-dark">
            Nossa curadoria
          </Link>
          <Link href="/contato" className="transition hover:text-teal-dark">
            Ajuda
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="hidden rounded-full px-4 py-2 text-sm font-bold transition hover:bg-teal/10 sm:inline-flex"
              >
                Entrar
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="hidden rounded-full bg-ardosia px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-dark sm:inline-flex"
              >
                Criar conta
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: { avatarBox: "h-9 w-9" },
              }}
            />
          </SignedIn>

          <Link
            href="/carrinho"
            className="relative inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-teal-dark"
            aria-label={`Carrinho com ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <span aria-hidden="true">🛒</span>
            <span className="hidden sm:inline">Carrinho</span>
            <span className="flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs text-teal-dark">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>

      <nav className="flex items-center justify-center gap-5 overflow-x-auto border-t border-teal/10 px-4 py-3 text-sm font-bold md:hidden">
        <Link href="/">Início</Link>
        <Link href="/colecoes">Produtos</Link>
        <Link href="/sobre">Curadoria</Link>
        <Link href="/contato">Ajuda</Link>
      </nav>
    </header>
  );
}
