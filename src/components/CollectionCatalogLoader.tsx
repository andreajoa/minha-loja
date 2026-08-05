"use client";

import { useEffect, useState } from "react";
import CollectionCatalog from "@/components/CollectionCatalog";
import type { Product } from "@/data/products";

export default function CollectionCatalogLoader({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const [initialCategory, setInitialCategory] = useState("Todos");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const requestedCategory = new URLSearchParams(window.location.search).get("categoria");
      if (requestedCategory && categories.includes(requestedCategory)) {
        setInitialCategory(requestedCategory);
      }
    } catch {
      setInitialCategory("Todos");
    } finally {
      setReady(true);
    }
  }, [categories]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 py-14 lg:px-8" aria-live="polite">
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[2rem] border border-border/45 bg-white text-center shadow-[0_20px_55px_rgba(9,38,71,0.06)]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-background-alt border-t-secondary" />
          <p className="mt-5 font-bold text-text-light">Organizando os brinquedos para você...</p>
        </div>
      </div>
    );
  }

  return (
    <CollectionCatalog
      key={initialCategory}
      products={products}
      categories={categories}
      initialCategory={initialCategory}
    />
  );
}
