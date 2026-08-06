"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const basePath = "";

const slides = [
  {
    image: `${basePath}/banners/banner-01-brincar-com-proposito.png`,
    href: "/colecoes",
    title: "Brincar com propósito",
    description:
      "Cada recurso pode apoiar foco, autorregulação, comunicação e interação.",
    cta: "Explorar produtos",
  },
  {
    image: `${basePath}/banners/banner-02-escolher-com-clareza.png`,
    href: "/colecoes",
    title: "Como escolher com mais clareza",
    description:
      "Antes de comprar, observe o interesse atual, a forma de uso e o objetivo do brincar.",
    cta: "Ver coleções",
  },
  {
    image: `${basePath}/banners/banner-03-menos-excesso-mais-intencao.png`,
    href: "/sobre",
    title: "Menos excesso, mais intenção",
    description:
      "Um brinquedo bem escolhido e mediado pode oferecer mais valor do que muitos recursos sem intenção.",
    cta: "Aprender a escolher",
  },
  {
    image: `${basePath}/banners/banner-04-mediacao-transforma.png`,
    href: "/contato",
    title: "O brinquedo ajuda. A mediação transforma.",
    description:
      "Explorar junto, nomear ações e criar turnos torna a brincadeira mais rica e significativa.",
    cta: "Falar com a curadoria",
  },
] as const;

const ROTATION_INTERVAL = 7500;

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section
      className="relative overflow-hidden border-b border-border/45 bg-background"
      aria-roledescription="carrossel"
      aria-label="Orientações para escolher brinquedos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative mx-auto aspect-[1916/821] min-h-[310px] w-full max-w-[1916px] bg-background sm:min-h-[390px] lg:min-h-[520px]">
        {slides.map((slide, index) => {
          const active = index === activeIndex;
          return (
            <Link
              key={slide.image}
              href={slide.href}
              className={`absolute inset-0 block transition-opacity duration-[1200ms] ease-in-out focus-visible:z-20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-secondary ${
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              }`}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              aria-label={`${slide.title}. ${slide.description} ${slide.cta}.`}
            >
              <img
                src={slide.image}
                alt=""
                className="h-full w-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <span className="sr-only">
                <strong>{slide.title}</strong> — {slide.description} {slide.cta}.
              </span>
            </Link>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-primary/10 to-transparent" />

        <button
          type="button"
          onClick={showPrevious}
          className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-background/82 text-xl text-primary shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-secondary sm:left-6 sm:h-12 sm:w-12"
          aria-label="Mostrar banner anterior"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={showNext}
          className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-background/82 text-xl text-primary shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-secondary sm:right-6 sm:h-12 sm:w-12"
          aria-label="Mostrar próximo banner"
        >
          ›
        </button>

        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/65 bg-background/78 px-3 py-2 shadow-lg backdrop-blur sm:bottom-6">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-8 bg-secondary" : "w-2.5 bg-primary/28 hover:bg-primary/55"
              }`}
              aria-label={`Mostrar banner ${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          Banner {activeIndex + 1} de {slides.length}: {activeSlide.title}
        </p>
      </div>
    </section>
  );
}
