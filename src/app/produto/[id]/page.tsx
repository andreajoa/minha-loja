import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import managedCatalogJson from "@/data/store-manager-products.json";
import { products } from "@/data/products";
import { SITE_URL, breadcrumbJsonLd, jsonLd } from "@/lib/seo";

type ManagedSeoProduct = {
  id: string;
  seo?: {
    title?: string;
    description?: string;
  };
};

function managedSeoFor(productId: string) {
  const catalog = managedCatalogJson as unknown as {
    products?: ManagedSeoProduct[];
  };
  return catalog.products?.find((item) => item.id === productId)?.seo;
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return {
      title: "Produto não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const managedSeo = managedSeoFor(product.id);
  const seoTitle = managedSeo?.title?.trim() || product.name;
  const seoDescription =
    managedSeo?.description?.trim() ||
    `${product.description} ${product.ageRange}. Curadoria BrinqueTEAndo por Margareth Almeida, Neuropsicopedagoga.`;
  const canonical = `/produto/${encodeURIComponent(product.id)}`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${seoTitle} | BrinqueTEAndo`,
      description: seoDescription,
      url: canonical,
      siteName: "BrinqueTEAndo",
      locale: "pt_BR",
      type: "website",
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
    twitter: {
      card: product.image ? "summary_large_image" : "summary",
      title: `${seoTitle} | BrinqueTEAndo`,
      description: seoDescription,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) notFound();

  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 3);
  const relatedProducts =
    related.length > 0
      ? related
      : products.filter((item) => item.id !== product.id).slice(0, 3);
  const productUrl = `${SITE_URL}/produto/${encodeURIComponent(product.id)}`;
  const images = product.gallery?.length
    ? product.gallery
    : product.image
      ? [product.image]
      : [];
  const absoluteImages = images.map((image) =>
    /^https?:\/\//i.test(image) ? image : `${SITE_URL}${image}`,
  );
  const variants = product.variants || [];
  const offers = variants.length > 0
    ? variants.map((variant) => ({
        "@type": "Offer",
        sku: variant.sourceSkuId || `${product.id}-${variant.name}`,
        name: `${product.name} · ${variant.name}`,
        url: productUrl,
        priceCurrency: "BRL",
        price: (variant.price / 100).toFixed(2),
        availability:
          variant.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": `${SITE_URL}/#organization` },
      }))
    : {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "BRL",
        price: (product.price / 100).toFixed(2),
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": `${SITE_URL}/#organization` },
      };
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description,
    sku: product.id,
    category: product.category,
    image: absoluteImages,
    brand: { "@type": "Brand", name: "BrinqueTEAndo" },
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Crianças e famílias",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Faixa etária",
        value: product.ageRange,
      },
      ...product.benefits.map((benefit) => ({
        "@type": "PropertyValue",
        name: "Possibilidade de exploração",
        value: benefit,
      })),
    ],
    offers,
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Coleções", path: "/colecoes" },
    { name: product.name, path: `/produto/${product.id}` },
  ]);

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }}
      />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:py-16">
        <Link
          href="/colecoes"
          className="nav-link inline-flex text-xs font-black uppercase tracking-[0.15em] text-secondary"
        >
          ← Voltar para os produtos
        </Link>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative lg:sticky lg:top-40">
            <ProductGallery productId={product.id} />
            <p className="mt-4 rounded-2xl border border-border/45 bg-white p-4 text-sm leading-6 text-text-light">
              As cores, medidas e pequenos detalhes podem variar conforme o lote. Confira sempre a faixa etária e use sob supervisão de um adulto.
            </p>
          </div>

          <div>
            <span className="inline-flex rounded-full bg-secondary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.17em] text-secondary">
              {product.category}
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[0.98] text-primary sm:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-light">
              {product.description}
            </p>
            <p className="mt-4 text-sm leading-6 text-text-light">
              Selecionado para a curadoria BrinqueTEAndo por{" "}
              <Link
                href="/sobre"
                className="font-bold text-secondary underline underline-offset-4"
              >
                Margareth Almeida, Neuropsicopedagoga
              </Link>
              .
            </p>

            <ProductPurchasePanel productId={product.id} />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.6rem] bg-background-alt p-6">
                <span className="text-3xl" aria-hidden="true">
                  🎈
                </span>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
                  Faixa etária
                </p>
                <p className="mt-2 font-display text-2xl text-primary">
                  {product.ageRange}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-border/45 bg-white p-6">
                <span className="text-3xl" aria-hidden="true">
                  🤝
                </span>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
                  Uso recomendado
                </p>
                <p className="mt-2 font-display text-2xl text-primary">
                  Brincadeira mediada e supervisionada
                </p>
              </div>
            </div>

            <section className="mt-10">
              <h2 className="font-display text-3xl text-primary">
                Possibilidades de exploração
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-3 rounded-2xl border border-border/50 bg-white p-4 font-bold text-primary"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                      ✓
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-10 rounded-[1.6rem] border-l-4 border-secondary bg-background-alt p-6">
              <h2 className="font-black text-primary">Informação responsável</h2>
              <p className="mt-2 leading-7 text-text-light">
                Este produto é um recurso de brincar. Ele não trata, não diagnostica e não substitui avaliação clínica, terapêutica ou educacional individualizada.
              </p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="reveal-section mt-20 border-t border-border/50 pt-16 sm:pt-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">
                  Você também pode gostar
                </p>
                <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">
                  Outras possibilidades para explorar
                </h2>
              </div>
              <Link
                href="/colecoes"
                className="nav-link text-xs font-black uppercase tracking-[0.15em] text-secondary"
              >
                Ver todos →
              </Link>
            </div>
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
