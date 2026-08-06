"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const slides = [
  {
    image: "/homepage-banners/banner-1.svg",
    href: "/colecoes",
    title: "Brincar com leveza e intenção",
    description: "Uma curadoria que começa pelo interesse da criança.",
  },
  {
    image: "/homepage-banners/banner-2.svg",
    href: "/colecoes?categoria=Sensorial",
    title: "Estimular pode ser leve e prazeroso",
    description: "Recursos sensoriais para apoiar exploração, atenção e coordenação de forma lúdica.",
  },
  {
    image: "/homepage-banners/banner-3.svg",
    href: "/sobre",
    title: "Observe a fase e o interesse da criança",
    description: "A escolha fica mais responsável quando considera idade, perfil e momento atual.",
  },
  {
    image: "/homepage-banners/banner-4.svg",
    href: "/contato",
    title: "Sua presença também faz parte da brincadeira",
    description: "Nomear ações, esperar turnos e ampliar a linguagem enriquece o brincar.",
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
      <div className="relative mx-auto aspect-[1916/821] min-h-[270px] w-full max-w-[1916px] bg-[#fbf7f3] sm:min-h-[390px] lg:min-h-[520px]">
        {slides.map((slide, index) => {
          const active = index === activeIndex;
          return (
            <Link
              key={slide.image}
              href={slide.href}
              className={`absolute inset-0 block transition-opacity duration-[1000ms] ease-in-out focus-visible:z-20 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-secondary ${active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              aria-label={`${slide.title}. ${slide.description}`}
            >
              <img
                src={slide.image}
                alt=""
                className="h-full w-full object-contain object-center"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <span className="sr-only"><strong>{slide.title}</strong> — {slide.description}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-background/88 text-xl text-primary shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white sm:left-6 sm:h-12 sm:w-12"
          aria-label="Mostrar banner anterior"
        >‹</button>
        <button
          type="button"
          onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
          className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-background/88 text-xl text-primary shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white sm:right-6 sm:h-12 sm:w-12"
          aria-label="Mostrar próximo banner"
        >›</button>

        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/65 bg-background/84 px-3 py-2 shadow-lg backdrop-blur sm:bottom-6">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === activeIndex ? "w-8 bg-secondary" : "w-2.5 bg-primary/28 hover:bg-primary/55"}`}
              aria-label={`Mostrar banner ${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
        <p className="sr-only" aria-live="polite">Banner {activeIndex + 1} de {slides.length}: {activeSlide.title}</p>
      </div>
    </section>
  );
}
