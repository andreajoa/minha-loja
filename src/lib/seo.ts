export const SITE_URL = "https://www.brinqueteando.online";
export const SITE_NAME = "BrinqueTEAndo";
export const CONTACT_EMAIL = "info@brinqueteando.online";

export const BRAND_DESCRIPTION =
  "Loja online de brinquedos sensoriais, pedagógicos e recursos de brincar para crianças autistas, com TDAH e outras neurodivergências, com curadoria de Margareth Almeida, Neuropsicopedagoga.";

export const REGIONAL_AREAS = [
  "Baixada Santista",
  "Litoral de São Paulo",
  "Grande São Paulo",
  "Região Metropolitana de São Paulo",
  "Santos",
  "São Vicente",
  "Praia Grande",
  "Cubatão",
  "Guarujá",
  "São Paulo",
  "Guarulhos",
  "Osasco",
  "Santo André",
  "São Bernardo do Campo",
  "São Caetano do Sul",
] as const;

export const TOPIC_AREAS = [
  "autismo",
  "TEA",
  "TDAH",
  "neurodivergência",
  "brinquedos sensoriais",
  "brinquedos pedagógicos",
  "desenvolvimento infantil",
  "comunicação",
  "coordenação motora",
  "atenção",
  "autonomia",
  "brincar mediado",
] as const;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: BRAND_DESCRIPTION,
    email: CONTACT_EMAIL,
    slogan: "Brincar com propósito, respeito e informação responsável.",
    sameAs: [
      "https://www.instagram.com/neuromargarethapoio/",
      "https://www.tiktok.com/@neuromargarethapoio",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: CONTACT_EMAIL,
      availableLanguage: ["pt-BR"],
    },
    areaServed: REGIONAL_AREAS.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    knowsAbout: [...TOPIC_AREAS],
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/sobre#margareth-almeida`,
    name: "Margareth Almeida",
    jobTitle: "Neuropsicopedagoga",
    url: `${SITE_URL}/sobre`,
    description:
      "Neuropsicopedagoga responsável pela curadoria profissional da BrinqueTEAndo, com foco em escolhas de recursos de brincar para crianças e famílias.",
    sameAs: [
      "https://www.instagram.com/neuromargarethapoio/",
      "https://www.tiktok.com/@neuromargarethapoio",
    ],
    knowsAbout: [...TOPIC_AREAS],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    description: BRAND_DESCRIPTION,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
