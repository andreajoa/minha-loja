import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { SITE_URL, breadcrumbJsonLd, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Brinquedos para Autismo e TDAH em São Paulo",
  description:
    "Brinquedos sensoriais e pedagógicos para crianças autistas, com TDAH e outras neurodivergências, com curadoria de Margareth Almeida, Neuropsicopedagoga. Loja online com foco no Litoral, Baixada Santista e Grande São Paulo.",
  alternates: { canonical: "/brinquedos-autismo-tdah-sao-paulo" },
  openGraph: {
    title: "Brinquedos para Autismo e TDAH em São Paulo | BrinqueTEAndo",
    description:
      "Curadoria profissional de brinquedos sensoriais e pedagógicos para famílias do Litoral de São Paulo, Baixada Santista e Grande São Paulo.",
    url: "/brinquedos-autismo-tdah-sao-paulo",
    type: "website",
  },
};

const faqs = [
  {
    q: "A BrinqueTEAndo vende brinquedos específicos para autismo e TDAH?",
    a: "A loja reúne brinquedos sensoriais, pedagógicos e outros recursos de brincar que podem ser interessantes para crianças autistas, com TDAH e outras neurodivergências. A escolha não é feita apenas pelo diagnóstico: faixa etária, interesses, segurança, perfil sensorial e objetivo do brincar também importam.",
  },
  {
    q: "A curadoria é feita por uma profissional?",
    a: "Sim. A curadoria da BrinqueTEAndo é conduzida por Margareth Almeida, Neuropsicopedagoga, com foco em escolhas responsáveis e em possibilidades de uso no brincar, sem promessas terapêuticas universais.",
  },
  {
    q: "Vocês atendem o Litoral de São Paulo e a Grande São Paulo?",
    a: "A BrinqueTEAndo é uma loja online. Famílias da Baixada Santista, do Litoral de São Paulo, da capital e da Grande São Paulo podem consultar disponibilidade e condições de entrega informando o CEP no site.",
  },
  {
    q: "Um brinquedo pode tratar autismo ou TDAH?",
    a: "Não. Os produtos da loja são recursos de brincar. Eles não tratam, não diagnosticam e não substituem avaliação clínica, terapêutica ou educacional individualizada.",
  },
];

export default function BrinquedosAutismoTdahSaoPaulo() {
  const featured = products.filter((item) => item.stock > 0).slice(0, 6);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Brinquedos para autismo e TDAH em São Paulo", path: "/brinquedos-autismo-tdah-sao-paulo" },
  ]);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/brinquedos-autismo-tdah-sao-paulo#page`,
    url: `${SITE_URL}/brinquedos-autismo-tdah-sao-paulo`,
    name: "Brinquedos para Autismo e TDAH em São Paulo",
    description:
      "Seleção de brinquedos sensoriais e pedagógicos com curadoria profissional para famílias do Litoral de São Paulo, Baixada Santista e Grande São Paulo.",
    inLanguage: "pt-BR",
    about: [
      { "@type": "Thing", name: "Autismo" },
      { "@type": "Thing", name: "TDAH" },
      { "@type": "Thing", name: "Brinquedos sensoriais" },
      { "@type": "Thing", name: "Brinquedos pedagógicos" },
    ],
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <div className="bg-background text-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(pageJsonLd) }} />

      <section className="hero-grid border-b border-border/45 px-4 py-14 sm:px-5 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Litoral de São Paulo · Baixada Santista · Grande São Paulo</p>
          <h1 className="mt-4 max-w-5xl font-display text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Brinquedos para crianças autistas, com TDAH e outras neurodivergências em São Paulo
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-light">
            A BrinqueTEAndo reúne brinquedos sensoriais, pedagógicos e recursos de brincar com curadoria de <strong>Margareth Almeida, Neuropsicopedagoga</strong>. A proposta é ajudar famílias a escolher com mais clareza, sem transformar diagnóstico em rótulo de produto.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/colecoes" className="inline-flex min-h-12 items-center justify-center rounded-full bg-secondary px-7 text-sm font-black text-white">Ver brinquedos disponíveis</Link>
            <Link href="/guia/brinquedos-autismo-tdah" className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/15 bg-white px-7 text-sm font-black text-primary">Como escolher melhor</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-18">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-border/50 bg-white p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Sensorial</p>
            <h2 className="mt-3 font-display text-3xl">Explorar texturas, movimentos e causa e efeito</h2>
            <p className="mt-4 leading-7 text-text-light">Recursos sensoriais podem ampliar possibilidades de exploração durante a brincadeira. A preferência da própria criança deve orientar a escolha.</p>
          </article>
          <article className="rounded-[2rem] border border-border/50 bg-white p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Comunicação e cognição</p>
            <h2 className="mt-3 font-display text-3xl">Brincar com linguagem, atenção e resolução de problemas</h2>
            <p className="mt-4 leading-7 text-text-light">Livros, encaixes, pareamentos, quebra-cabeças e jogos simples podem ser usados de formas diferentes conforme idade, interesse e mediação do adulto.</p>
          </article>
          <article className="rounded-[2rem] border border-border/50 bg-white p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-secondary">Autonomia e motor</p>
            <h2 className="mt-3 font-display text-3xl">Recursos para mãos, rotina e participação ativa</h2>
            <p className="mt-4 leading-7 text-text-light">A escolha pode considerar coordenação motora, sequenciamento, independência em tarefas cotidianas e prazer em participar da brincadeira.</p>
          </article>
        </div>
      </section>

      <section className="bg-primary px-4 py-14 text-white sm:px-5 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary-light">Atendimento regional</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Litoral, Baixada Santista e Grande São Paulo</h2>
            <p className="mt-5 leading-7 text-white/75">A loja é online e foi estruturada para ser encontrada por famílias que buscam brinquedos para crianças neurodivergentes em São Paulo. A entrega é consultada pelo CEP no próprio site.</p>
          </div>
          <div className="rounded-[2rem] bg-white/8 p-7">
            <h3 className="font-display text-3xl">Regiões que fazem parte do nosso foco de descoberta</h3>
            <p className="mt-4 leading-7 text-white/75">Santos, São Vicente, Praia Grande, Cubatão, Guarujá, demais cidades do Litoral de São Paulo, capital, Guarulhos, Osasco, ABC Paulista e outras cidades da Região Metropolitana de São Paulo.</p>
            <p className="mt-4 text-sm leading-6 text-white/65">Isso não significa loja física em cada cidade. A BrinqueTEAndo opera online e as condições de envio variam conforme CEP, produto e disponibilidade.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-5 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">Curadoria profissional</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">O diagnóstico não escolhe o brinquedo. A criança vem primeiro.</h2>
          <p className="mt-5 text-lg leading-8 text-text-light">Na prática, duas crianças com o mesmo diagnóstico podem ter interesses, sensibilidades, habilidades e necessidades muito diferentes. Por isso, a curadoria organiza possibilidades de brincar sem prometer um produto universal para “autismo” ou “TDAH”.</p>
        </div>
        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-5 sm:pb-24">
        <h2 className="font-display text-4xl sm:text-5xl">Perguntas frequentes</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((item) => (
            <article key={item.q} className="rounded-[1.6rem] border border-border/50 bg-white p-6">
              <h3 className="font-display text-2xl">{item.q}</h3>
              <p className="mt-3 leading-7 text-text-light">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
