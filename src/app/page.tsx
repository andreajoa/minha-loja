import type { Metadata } from "next";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import HomeReferenceSections, { InstagramFollowStrip } from "@/components/HomeReferenceSections";
import StorefrontHome from "@/components/StorefrontHome";

export const metadata: Metadata = {
  title: "Brinquedos para Autismo e TDAH",
  description:
    "Brinquedos sensoriais, pedagógicos e recursos de brincar para crianças autistas, com TDAH e outras neurodivergências. Curadoria de Margareth Almeida, Neuropsicopedagoga.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <HomeReferenceSections />
      <div className="storefront-after-carousel">
        <StorefrontHome />
      </div>

      <section className="border-y border-border/45 bg-background-alt px-4 py-12 sm:px-5 sm:py-18">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">Curadoria para famílias</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-primary sm:text-5xl">Brinquedos para crianças autistas, com TDAH e outras neurodivergências</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-text-light sm:text-lg">
              Na BrinqueTEAndo, o diagnóstico não é usado como atalho para escolher um produto. A curadoria de <strong className="text-primary">Margareth Almeida, Neuropsicopedagoga</strong>, organiza brinquedos sensoriais, pedagógicos, cognitivos, motores, de comunicação e autonomia considerando possibilidades reais de brincar.
            </p>
            <p className="mt-4 max-w-3xl leading-7 text-text-light">
              A loja é online e tem foco de descoberta para famílias do <strong>Litoral de São Paulo, Baixada Santista e Grande São Paulo</strong>, além de atender pedidos conforme disponibilidade e condições de entrega para outros CEPs do Brasil.
            </p>
          </div>
          <div className="rounded-[2rem] border border-border/50 bg-white p-7 shadow-[0_20px_55px_rgba(9,38,71,.06)]">
            <h3 className="font-display text-3xl text-primary">Escolher melhor antes de comprar</h3>
            <p className="mt-4 leading-7 text-text-light">Veja como considerar interesse, perfil sensorial, faixa etária, segurança e objetivo do brincar antes de decidir.</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/guia/brinquedos-autismo-tdah" className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-black text-white">Ler o guia de escolha</Link>
              <Link href="/brinquedos-autismo-tdah-sao-paulo" className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/15 px-6 text-sm font-black text-primary">Atendimento em São Paulo</Link>
            </div>
          </div>
        </div>
      </section>

      <InstagramFollowStrip />
      <style>{`
        .storefront-after-carousel > div > section:first-child {
          display: none;
        }
      `}</style>
    </>
  );
}
