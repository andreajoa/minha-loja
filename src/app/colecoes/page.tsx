import type { Metadata } from "next";
import CollectionCatalogLoader from "@/components/CollectionCatalogLoader";
import { categories, products } from "@/data/products";
import { SITE_URL, breadcrumbJsonLd, jsonLd } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Coleções e brinquedos para Autismo e TDAH",
  description:
    "Encontre brinquedos sensoriais e pedagógicos por categoria, faixa etária, objetivo, disponibilidade e preço, com curadoria de Margareth Almeida, Neuropsicopedagoga.",
  alternates: { canonical: "/colecoes" },
  openGraph: {
    title: "Brinquedos sensoriais e pedagógicos | BrinqueTEAndo",
    description:
      "Catálogo de brinquedos e recursos de brincar para crianças autistas, com TDAH e outras neurodivergências.",
    url: "/colecoes",
    type: "website",
  },
};

export default function Colecoes() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Catálogo BrinqueTEAndo",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/produto/${product.id}`,
      name: product.name,
    })),
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Coleções e brinquedos", path: "/colecoes" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <section className="hero-grid relative overflow-hidden border-b border-border/45 px-5 py-14 sm:py-18 lg:py-22">
        <div className="absolute left-[6%] top-12 hidden h-16 w-16 animate-float items-center justify-center rounded-[35%] bg-white/80 text-3xl shadow-lg lg:flex" aria-hidden="true">🧩</div>
        <div className="absolute right-[8%] top-16 hidden h-14 w-14 animate-float-slow items-center justify-center rounded-full border border-secondary-light/30 bg-white/80 text-2xl lg:flex" aria-hidden="true">⭐</div>
        <div className="absolute bottom-10 left-[16%] hidden animate-sparkle text-3xl text-secondary-light lg:block" aria-hidden="true">✦</div>
        <div className="absolute bottom-12 right-[16%] hidden animate-bob text-3xl lg:block" aria-hidden="true">🧸</div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.65fr]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-secondary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary sm:text-xs">Catálogo BrinqueTEAndo</p>
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[0.98] tracking-[-0.035em] text-primary sm:text-6xl lg:text-7xl">
              Encontre o brinquedo que combina com <em className="font-normal text-secondary">este momento da criança.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-text-light sm:text-lg">
              Pesquise pelo nome ou filtre por categoria, idade, objetivo do brincar, disponibilidade e preço. Brinquedos sensoriais, pedagógicos e outros recursos organizados para apoiar escolhas mais conscientes para crianças autistas, com TDAH e outras neurodivergências.
            </p>
          </div>

          <div className="relative mx-auto hidden h-72 w-full max-w-md lg:block" aria-hidden="true">
            <div className="playful-ring absolute inset-5 animate-orbit" />
            <div className="absolute left-10 top-14 flex h-24 w-24 animate-float items-center justify-center rounded-[2rem] bg-white text-5xl shadow-[0_22px_50px_rgba(9,38,71,0.12)]">🧩</div>
            <div className="absolute right-8 top-7 flex h-20 w-20 animate-float-slow items-center justify-center rounded-full bg-background-alt text-4xl shadow-[0_18px_40px_rgba(161,77,45,0.12)]">🌀</div>
            <div className="absolute bottom-6 left-1/2 flex h-24 w-24 -translate-x-1/2 animate-bob items-center justify-center rounded-[2.4rem] bg-primary text-5xl shadow-[0_24px_55px_rgba(9,38,71,0.22)]">💬</div>
            <span className="absolute bottom-16 right-5 animate-sparkle text-4xl text-secondary" aria-hidden="true">✦</span>
          </div>
        </div>

        <div className="relative mx-auto mt-9 flex max-w-7xl flex-wrap gap-3 text-xs font-bold text-text-light">
          <span className="rounded-full border border-border/45 bg-white/75 px-4 py-2.5 backdrop-blur">⌕ Busca instantânea</span>
          <span className="rounded-full border border-border/45 bg-white/75 px-4 py-2.5 backdrop-blur">🧭 Filtros rápidos</span>
          <span className="rounded-full border border-border/45 bg-white/75 px-4 py-2.5 backdrop-blur">♡ Escolha orientada</span>
        </div>
      </section>

      <CollectionCatalogLoader products={products} categories={categories} />
    </div>
  );
}
