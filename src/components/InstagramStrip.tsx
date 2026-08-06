"use client";

import { usePathname } from "next/navigation";

const instagramImages = [
  {
    src: "/instagram-strip/1.png",
    alt: "Criança explorando materiais sensoriais",
    position: "object-center",
  },
  {
    src: "/instagram-strip/2.png",
    alt: "Atividade de comunicação com cartões ilustrados",
    position: "object-[52%_50%]",
  },
  {
    src: "/instagram-strip/3.png",
    alt: "Atividade de coordenação motora fina",
    position: "object-[54%_50%]",
  },
  {
    src: "/instagram-strip/4.png",
    alt: "Criança realizando atividade criativa com pintura",
    position: "object-center",
  },
] as const;

export default function InstagramStrip() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <>
      <style>{`
        div.overflow-hidden.bg-background > section:last-of-type {
          display: none !important;
        }
      `}</style>

      <section className="bg-background-alt py-8 sm:py-10">
        <div className="relative overflow-hidden bg-[#d8c9bd]">
          <div className="grid grid-cols-2 gap-px bg-white/35 md:grid-cols-4">
            {instagramImages.map((image) => (
              <div
                key={image.src}
                className="group relative aspect-[4/3] min-h-0 overflow-hidden bg-[#e9dfd7]"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width="1448"
                  height="1086"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover ${image.position} transition-transform duration-700 ease-out group-hover:scale-[1.025]`}
                />
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[rgba(9,39,75,0.20)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(9,39,75,0.30),transparent_58%)]" />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white">
            <p className="font-display text-3xl leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-5xl">
              @neuromargarethapoio
            </p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-xs sm:tracking-[0.24em]">
              Conteúdo que ensina antes de vender
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
