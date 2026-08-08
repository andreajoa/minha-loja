"use client";

import { useMemo, useState } from "react";
import { products } from "@/data/products";

export default function ProductGallery({ productId }: { productId: string }) {
  const product = products.find((item) => item.id === productId);
  const images = useMemo(() => {
    if (!product) return [];
    const source = product.gallery?.length
      ? product.gallery
      : product.image
        ? [product.image]
        : [];
    return Array.from(new Set(source.filter(Boolean)));
  }, [product]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!product) return null;
  const active = images[Math.min(activeIndex, Math.max(0, images.length - 1))];

  return (
    <div>
      <div className="storybook-shadow hero-grid relative flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] border border-border/45 bg-white">
        <div className="playful-ring absolute inset-10 animate-orbit" aria-hidden="true" />
        {active ? (
          <img
            src={active}
            alt={product.name}
            className="relative z-10 h-full w-full object-contain"
          />
        ) : (
          <span
            className="relative z-10 animate-sway text-[10rem] drop-shadow-[0_24px_30px_rgba(9,38,71,0.16)] sm:text-[14rem]"
            aria-hidden="true"
          >
            {product.emoji}
          </span>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver fotografia ${index + 1} de ${product.name}`}
              className={`overflow-hidden rounded-2xl border bg-white transition ${
                activeIndex === index
                  ? "border-secondary ring-2 ring-secondary/20"
                  : "border-border/50 opacity-75 hover:opacity-100"
              }`}
            >
              <img src={image} alt="" className="aspect-square h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
