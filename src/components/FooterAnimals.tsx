"use client";

import { usePathname } from "next/navigation";

const cardBrands = [
  { name: "Visa", className: "bg-[#1434CB] text-white" },
  { name: "Mastercard", className: "bg-white text-[#1f2937]" },
  { name: "Amex", className: "bg-[#2A9FD6] text-white" },
  { name: "Elo", className: "bg-[#111827] text-white" },
  { name: "Hipercard", className: "bg-[#B3131B] text-white" },
];

export default function FooterAnimals() {
  const pathname = usePathname();
  const shouldShow =
    pathname === "/colecoes" || pathname.startsWith("/produto/");

  if (!shouldShow) return null;

  return (
    <section className="bg-background" aria-label="Rodapé de pagamentos">
      <div className="relative overflow-hidden border-b border-border/70 bg-background">
        <div className="mx-auto max-w-7xl px-5">
          <div className="relative h-[88px] sm:h-[104px] lg:h-[118px]">
            <div className="absolute inset-x-0 bottom-0 h-px bg-primary/55" aria-hidden="true" />
            <img
              src="/home-images/footer-animals.webp"
              alt=""
              width="1916"
              height="192"
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute bottom-px left-1/2 h-[88px] w-auto max-w-none -translate-x-1/2 select-none sm:h-[104px] lg:h-[118px]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-border/55 bg-white/45">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">
              Pagamento seguro
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="Bandeiras de cartão">
              {cardBrands.map((brand) => (
                <span
                  key={brand.name}
                  className={`inline-flex h-7 min-w-[46px] items-center justify-center rounded-[5px] border border-black/10 px-2 text-[9px] font-black tracking-[-0.02em] shadow-sm ${brand.className}`}
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted sm:text-right">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true">
              <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7v3H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V9a7 7 0 0 0-7-7Zm-5 7a5 5 0 1 1 10 0v3H7V9Zm5 6a2 2 0 0 1 1 3.73V20h-2v-1.27A2 2 0 0 1 12 15Z" />
            </svg>
            <span>Checkout protegido e processado pela Stripe.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
