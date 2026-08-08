import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/colecoes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/brinquedos-autismo-tdah-sao-paulo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/guia/brinquedos-autismo-tdah`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contato`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/politicas/envio`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/politicas/reembolso`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/politicas/pagamento-seguranca`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/politicas/privacidade`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/politicas/cookies`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/politicas/termos`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/produto/${product.id}`,
    changeFrequency: "weekly",
    priority: product.stock > 0 ? 0.8 : 0.5,
    images: product.gallery?.length
      ? product.gallery.map((image) => `${SITE_URL}${image}`)
      : product.image
        ? [`${SITE_URL}${product.image}`]
        : undefined,
  }));

  return [...staticPages, ...productPages];
}
