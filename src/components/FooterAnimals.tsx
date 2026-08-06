"use client";

import { usePathname } from "next/navigation";

export default function FooterAnimals() {
  const pathname = usePathname();
  const shouldShow =
    pathname === "/colecoes" || pathname.startsWith("/produto/");

  if (!shouldShow) return null;

  return (
    <div
      className="pointer-events-none relative overflow-hidden bg-background"
      aria-hidden="true"
    >
      <img
        src="/home-images/footer-animals.webp"
        alt=""
        width="1916"
        height="192"
        loading="lazy"
        decoding="async"
        className="hidden h-auto w-full select-none md:block"
      />

      <div className="relative h-28 overflow-hidden sm:h-32 md:hidden">
        <img
          src="/home-images/footer-animals.webp"
          alt=""
          width="1916"
          height="192"
          loading="lazy"
          decoding="async"
          className="absolute bottom-0 left-1/2 h-28 w-auto max-w-none -translate-x-1/2 select-none sm:h-32"
        />
      </div>
    </div>
  );
}
