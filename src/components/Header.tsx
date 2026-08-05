"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCart } from "@/components/CartProvider";
import ShippingAnnouncement from "@/components/ShippingAnnouncement";
import { categories } from "@/data/products";

function Icon({ children }: { children: ReactNode }) {
  return <span className="flex h-9 w-9 items-center justify-center text-lg" aria-hidden="true">{children}</span>;
}

export default function Header() {
  const { itemCount } = useCart();
  const menuCategories = categories.filter((category) => category !== "Todos").slice(0, 5);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <ShippingAnnouncement />

      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-7">
        <div className="flex items-center">
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-text-light transition hover:text-secondary"
          >
            <Icon>♡</Icon><span className="hidden lg:inline">Atendimento</span>
          </Link>
        </div>

        <Link href="/" className="group font-display text-2xl tracking-[0.08em] text-primary sm:text-3xl" aria-label="BrinqueTEAndo — página inicial">
          BRINQUE<span className="text-secondary transition group-hover:text-secondary-light">TEA</span>NDO
          <span className="mx-auto mt-1 block h-1 w-8 rounded-full bg-secondary transition-all group-hover:w-14" />
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Link href="/colecoes" className="hidden items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-text-light transition hover:text-secondary md:flex">
            <Icon>⌕</Icon><span>Buscar</span>
          </Link>
          <Link
            href="/carrinho"
            className="group relative ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-white shadow-[0_10px_24px_rgba(161,77,45,0.2)] transition hover:-translate-y-1 hover:bg-primary"
            aria-label={`Carrinho com ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <span className="transition group-hover:scale-110" aria-hidden="true">🛒</span>
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-[10px] font-black text-white">{itemCount}</span>
          </Link>
        </div>
      </div>

      <nav className="border-t border-border/45" aria-label="Menu principal">
        <div className="mx-auto flex max-w-[1440px] items-center gap-7 overflow-x-auto px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-text-light sm:justify-center sm:px-7">
          <Link href="/sobre" className="nav-link shrink-0 hover:text-secondary">Nossa curadoria</Link>
          {menuCategories.map((category) => (
            <Link key={category} href={`/colecoes?categoria=${encodeURIComponent(category)}`} className="nav-link shrink-0 hover:text-secondary">
              {category}
            </Link>
          ))}
          <Link href="/colecoes" className="nav-link shrink-0 hover:text-secondary">Todos os produtos</Link>
          <Link href="/contato" className="nav-link shrink-0 hover:text-secondary">Ajuda</Link>
        </div>
      </nav>
    </header>
  );
}
