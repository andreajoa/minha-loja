import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/api/", "/checkout", "/sucesso", "/dashboard"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      { userAgent: "Googlebot", allow: "/", disallow: privatePaths },
      { userAgent: "bingbot", allow: "/", disallow: privatePaths },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: privatePaths },
      { userAgent: "ChatGPT-User", allow: "/", disallow: privatePaths },
      { userAgent: "GPTBot", allow: "/", disallow: privatePaths },
      { userAgent: "Claude-SearchBot", allow: "/", disallow: privatePaths },
      { userAgent: "Claude-User", allow: "/", disallow: privatePaths },
      { userAgent: "ClaudeBot", allow: "/", disallow: privatePaths },
      { userAgent: "Applebot", allow: "/", disallow: privatePaths },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
