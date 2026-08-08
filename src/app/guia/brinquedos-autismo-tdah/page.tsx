import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, breadcrumbJsonLd, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Como escolher brinquedos para crianças com Autismo e TDAH",
  description:
    "Guia prático para escolher brinquedos para crianças autistas, com TDAH e outras neurodivergências considerando interesse, perfil sensorial, idade, segurança e objetivo do brincar.",
  alternates: { canonical: "/guia/brinquedos-autismo-tdah" },
  openGraph: {
    title: "Como escolher brinquedos para crianças com Autismo e TDAH",
    description:
      "Um guia responsável da BrinqueTEAndo, com curadoria de Margareth Almeida, Neuropsicopedagoga.",
    url: "/guia/brinquedos-autismo-tdah",
    type: "article",
  },
};

const faqs = [
  {
    q: "Qual é o melhor brinquedo para uma criança autista?",
    a: "Não existe um único brinquedo que seja o melhor para todas as crianças autistas. A escolha deve partir do interesse da criança, faixa etária, segurança, perfil sensorial, habilidades atuais e do tipo de brincadeira que faz sentido naquele momento.",
  },
  {
    q: "Que tipo de brinquedo pode interessar uma criança com TDAH?",
    a: "Brinquedos com desafio claro, resposta rápida, possibilidade de manipulação e objetivos curtos podem ser interessantes para algumas crianças com TDAH. Ainda assim, o interesse individual e a forma de mediação costumam ser mais importantes do que o rótulo do produto.",
  },
  {
    q: "Brinquedo sensorial é só para autismo?",
    a: "Não. Recursos sensoriais podem ser usados por muitas crianças, com ou sem diagnóstico. O mais importante é observar se aquela experiência é agradável, segura e compatível com o perfil da criança.",
  },
  {
    q: "Brinquedos substituem terapia ou intervenção profissional?",
    a: "Não. Brinquedos são recursos de brincar e aprendizagem. Eles não tratam, não diagnosticam e não substituem avaliação clínica, terapêutica, educacional ou acompanhamento individualizado.",
  },
];

export default function GuiaBrinquedosAutismoTdah() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Guia de brinquedos para autismo e TDAH", path: "/guia/brinquedos-autismo-tdah" },
  ]);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/guia/brinquedos-autismo-tdah#article`,
    headline: "Como escolher brinquedos para crianças com Autismo e TDAH",
    description:
      "Guia prático para escolher brinquedos para crianças neurodivergentes com foco em interesse, perfil sensorial, idade, segurança e objetivo do brincar.",
    inLanguage: "pt-BR",
    mainEntityOfPage: `${SITE_URL}/guia/brinquedos-autismo-tdah`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    author: { "@id": `${SITE_URL}/sobre#margareth-almeida` },
    about: [
      { "@type": "Thing", name: "Autismo" },
      { "@type": "Thing", name: "TDAH" },
      { "@type": "Thing", name: "Brinquedos sensoriais" },
      { "@type": "Thing", name: "Brinquedos pedagógicos" },
      { "@type": "Thing", name: "Neurodivergência" },
    ],
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <article className="bg-background text-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faq) }} />

      <header className="hero-grid border-b border-border/45 px-4 py-14 sm:px-5 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Guia BrinqueTEAndo</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">Como escolher brinquedos para crianças com autismo e TDAH</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-light">
            A resposta curta é: <strong>não escolha pelo diagnóstico sozinho</strong>. Comece pela criança — seus interesses, idade, segurança, perfil sensorial, habilidades atuais e pelo tipo de experiência que você quer construir no brincar.
          </p>
          <p className="mt-4 text-sm font-bold text-secondary">Curadoria: Margareth Almeida · Neuropsicopedagoga</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-5 sm:py-18">
        <section>
          <h2 className="font-display text-4xl sm:text-5xl">1. Interesse vem antes do rótulo</h2>
          <p className="mt-5 text-lg leading-8 text-text-light">Uma criança pode gostar de movimento, outra de encaixes, outra de letras, água, luzes, histórias ou objetos que giram. O mesmo diagnóstico não cria o mesmo perfil de brincadeira. Um recurso tende a ser mais útil quando encontra algo que já desperta curiosidade e participação.</p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl sm:text-5xl">2. Observe o perfil sensorial</h2>
          <p className="mt-5 text-lg leading-8 text-text-light">Texturas, sons, luzes, movimento e pressão podem ser agradáveis para uma criança e desconfortáveis para outra. “Sensorial” não significa automaticamente adequado. Observe aproximação, recusa, busca ativa, desconforto e tempo de permanência na atividade.</p>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-[2rem] border border-border/50 bg-white p-7">
            <h2 className="font-display text-3xl">Para atenção e planejamento</h2>
            <p className="mt-4 leading-7 text-text-light">Quebra-cabeças, encaixes, sequências, jogos com começo e fim claros e desafios graduais podem ajudar a criar situações de foco compartilhado e resolução de problemas durante a brincadeira.</p>
          </div>
          <div className="rounded-[2rem] border border-border/50 bg-white p-7">
            <h2 className="font-display text-3xl">Para comunicação e linguagem</h2>
            <p className="mt-4 leading-7 text-text-light">Livros, figuras, objetos nomeáveis, pareamentos e brincadeiras de turnos podem abrir oportunidades de apontar, escolher, nomear, comentar e compartilhar atenção.</p>
          </div>
          <div className="rounded-[2rem] border border-border/50 bg-white p-7">
            <h2 className="font-display text-3xl">Para coordenação motora</h2>
            <p className="mt-4 leading-7 text-text-light">Alinhavos, pinças, peças de encaixe, rosquear, montar e manipular objetos podem compor brincadeiras que exigem diferentes movimentos das mãos.</p>
          </div>
          <div className="rounded-[2rem] border border-border/50 bg-white p-7">
            <h2 className="font-display text-3xl">Para autonomia</h2>
            <p className="mt-4 leading-7 text-text-light">Recursos ligados a rotina, vestir, organizar, sequenciar e brincar de faz de conta podem ser usados para aproximar situações do cotidiano de forma lúdica.</p>
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] bg-primary p-8 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary-light">Um critério que evita compras ruins</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Pergunte: “o que a criança poderá fazer com isso?”</h2>
          <p className="mt-5 text-lg leading-8 text-white/75">Em vez de procurar “o brinquedo do autismo” ou “o brinquedo do TDAH”, pense em ações concretas: apertar, encaixar, ordenar, nomear, esperar, escolher, imitar, criar, montar, compartilhar ou resolver. Isso torna a escolha mais específica e menos baseada em promessas genéricas.</p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl sm:text-5xl">3. Faixa etária e segurança continuam essenciais</h2>
          <p className="mt-5 text-lg leading-8 text-text-light">Neurodivergência não elimina critérios de segurança. Observe peças pequenas, resistência do material, supervisão necessária, recomendações do fabricante e compatibilidade com a forma como aquela criança costuma explorar objetos.</p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-4xl sm:text-5xl">4. A mediação do adulto pode mudar a brincadeira</h2>
          <p className="mt-5 text-lg leading-8 text-text-light">O mesmo brinquedo pode gerar experiências diferentes quando o adulto acompanha o interesse da criança, oferece escolhas, espera respostas, modela novas ações e respeita sinais de pausa. O objetivo não precisa ser “fazer certo”; pode ser simplesmente ampliar participação e vínculo.</p>
        </section>

        <section className="mt-12 rounded-[2rem] border-l-4 border-secondary bg-background-alt p-7">
          <h2 className="font-display text-3xl">Informação responsável</h2>
          <p className="mt-4 leading-7 text-text-light">Nenhum brinquedo trata ou diagnostica autismo, TDAH ou outra condição. Recursos de brincar podem fazer parte da rotina familiar e educacional, mas não substituem avaliação ou acompanhamento individualizado quando eles são necessários.</p>
        </section>

        <section className="mt-14 flex flex-col gap-4 rounded-[2rem] border border-border/50 bg-white p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl">Quer ver opções organizadas por objetivo?</h2>
            <p className="mt-2 text-text-light">Explore o catálogo completo e compare categoria, idade, benefícios, estoque e preço.</p>
          </div>
          <Link href="/colecoes" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-secondary px-7 text-sm font-black text-white">Ver catálogo</Link>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-4xl sm:text-5xl">Perguntas frequentes</h2>
          <div className="mt-7 space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-[1.6rem] border border-border/50 bg-white p-6">
                <h3 className="font-display text-2xl">{item.q}</h3>
                <p className="mt-3 leading-7 text-text-light">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-12 text-sm leading-6 text-text-light">Para famílias do Litoral de São Paulo, Baixada Santista e Grande São Paulo, veja também a página <Link className="font-bold text-secondary underline underline-offset-4" href="/brinquedos-autismo-tdah-sao-paulo">Brinquedos para autismo e TDAH em São Paulo</Link>.</p>
      </div>
    </article>
  );
}
