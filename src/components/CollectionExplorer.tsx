"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

type FilterType = "goal" | "category";

export default function CollectionExplorer({
  products,
  categories,
  goals,
}: {
  products: Product[];
  categories: string[];
  goals: string[];
}) {
  const [filterType, setFilterType] = useState<FilterType>("goal");
  const [selected, setSelected] = useState("Todos");

  const options = filterType === "goal" ? goals : categories;
  const filtered = useMemo(() => {
    if (selected === "Todos") return products;
    return products.filter((product) =>
      filterType === "goal"
        ? product.goal === selected
        : product.category === selected,
    );
  }, [filterType, products, selected]);

  function changeType(type: FilterType) {
    setFilterType(type);
    setSelected("Todos");
  }

  return (
    <>
      <div className="mt-10 rounded-[2rem] border border-teal/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black text-ardosia">Como você prefere escolher?</p>
            <p className="mt-1 text-sm text-ardosia/60">
              Comece pelo objetivo do brincar ou pelo tipo de produto.
            </p>
          </div>

          <div className="inline-flex w-fit rounded-full bg-creme p-1">
            <button
              type="button"
              onClick={() => changeType("goal")}
              className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                filterType === "goal"
                  ? "bg-ardosia text-white shadow-sm"
                  : "text-ardosia/65"
              }`}
            >
              Por objetivo
            </button>
            <button
              type="button"
              onClick={() => changeType("category")}
              className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                filterType === "category"
                  ? "bg-ardosia text-white shadow-sm"
                  : "text-ardosia/65"
              }`}
            >
              Por categoria
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" aria-label="Filtros do catálogo">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setSelected(option)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                selected === option
                  ? "border-teal bg-teal text-white"
                  : "border-teal/15 bg-creme text-ardosia/75 hover:border-teal"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="font-black">
          {filtered.length} produto{filtered.length === 1 ? "" : "s"}
        </p>
        {selected !== "Todos" ? (
          <button
            type="button"
            onClick={() => setSelected("Todos")}
            className="text-sm font-black text-teal-dark hover:underline"
          >
            Limpar filtro
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
