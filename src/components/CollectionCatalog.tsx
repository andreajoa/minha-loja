"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { formatPrice, type Product } from "@/data/products";

type Availability = "todos" | "disponivel" | "esgotado";
type SortOption = "recomendados" | "menor-preco" | "maior-preco" | "nome";

const categoryIcons: Record<string, string> = {
  Todos: "✦",
  Fidget: "🌀",
  Sensorial: "🖐️",
  Motor: "🧩",
  Comunicação: "💬",
  Cognitivo: "🧠",
  Rotina: "🗓️",
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function countLabel(count: number) {
  return `${count} produto${count === 1 ? "" : "s"}`;
}

export default function CollectionCatalog({
  products,
  categories,
  initialCategory,
}: {
  products: Product[];
  categories: string[];
  initialCategory: string;
}) {
  const catalogPriceCeiling = useMemo(
    () => Math.max(500, Math.ceil(Math.max(...products.map((product) => product.price), 500) / 500) * 500),
    [products],
  );

  const ageRanges = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.ageRange)))],
    [products],
  );

  const objectives = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.benefits))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products],
  );

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedAge, setSelectedAge] = useState("Todos");
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability>("todos");
  const [maxPrice, setMaxPrice] = useState(catalogPriceCeiling);
  const [sortBy, setSortBy] = useState<SortOption>("recomendados");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [filtersOpen]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedCategory === "Todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", selectedCategory);
    window.history.replaceState({}, "", url);
  }, [selectedCategory]);

  const categoryCounts = useMemo(() => {
    return categories.reduce<Record<string, number>>((counts, category) => {
      counts[category] = category === "Todos" ? products.length : products.filter((product) => product.category === category).length;
      return counts;
    }, {});
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const query = normalizeText(search);
    const filtered = products.filter((product) => {
      const searchable = normalizeText(
        [product.name, product.description, product.category, product.ageRange, ...product.benefits].join(" "),
      );
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesAge = selectedAge === "Todos" || product.ageRange === selectedAge;
      const matchesObjectives =
        selectedObjectives.length === 0 ||
        selectedObjectives.some((objective) => product.benefits.includes(objective));
      const matchesAvailability =
        availability === "todos" ||
        (availability === "disponivel" ? product.stock > 0 : product.stock <= 0);
      const matchesPrice = product.price <= maxPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAge &&
        matchesObjectives &&
        matchesAvailability &&
        matchesPrice
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "menor-preco") return a.price - b.price;
      if (sortBy === "maior-preco") return b.price - a.price;
      if (sortBy === "nome") return a.name.localeCompare(b.name, "pt-BR");
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [availability, maxPrice, products, search, selectedAge, selectedCategory, selectedObjectives, sortBy]);

  const activeFilterCount =
    (selectedCategory !== "Todos" ? 1 : 0) +
    (selectedAge !== "Todos" ? 1 : 0) +
    selectedObjectives.length +
    (availability !== "todos" ? 1 : 0) +
    (maxPrice < catalogPriceCeiling ? 1 : 0) +
    (search.trim() ? 1 : 0);

  function toggleObjective(objective: string) {
    setSelectedObjectives((current) =>
      current.includes(objective)
        ? current.filter((item) => item !== objective)
        : [...current, objective],
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory("Todos");
    setSelectedAge("Todos");
    setSelectedObjectives([]);
    setAvailability("todos");
    setMaxPrice(catalogPriceCeiling);
    setSortBy("recomendados");
  }

  function renderFilters(prefix: string) {
    return (
      <div className="space-y-1">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-border/45 pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-secondary">Encontre rapidinho</p>
            <h2 className="mt-1 font-display text-3xl text-primary">Filtros</h2>
          </div>
          <div className="flex h-12 w-12 animate-bob items-center justify-center rounded-2xl bg-background-alt text-2xl" aria-hidden="true">🧸</div>
        </div>

        <details open className="group border-b border-border/40 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black uppercase tracking-[0.13em] text-primary">
            Categoria
            <span className="text-xl font-normal text-secondary transition group-open:rotate-45">+</span>
          </summary>
          <div className="mt-4 grid gap-2">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={`${prefix}-${category}`}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`group/category flex min-h-12 items-center justify-between rounded-2xl border px-3.5 text-left transition ${
                    active
                      ? "border-primary bg-primary text-white shadow-[0_10px_25px_rgba(9,38,71,0.14)]"
                      : "border-transparent bg-background-alt/65 text-text-light hover:-translate-y-0.5 hover:border-secondary/25 hover:bg-white hover:text-secondary"
                  }`}
                  aria-pressed={active}
                >
                  <span className="flex items-center gap-3">
                    <span className={`text-xl transition group-hover/category:scale-110 ${active ? "animate-bob" : ""}`} aria-hidden="true">
                      {categoryIcons[category] ?? "🧸"}
                    </span>
                    <span className="text-sm font-bold">{category}</span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${active ? "bg-white/15 text-white" : "bg-white text-muted"}`}>
                    {categoryCounts[category] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </details>

        <details open className="group border-b border-border/40 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black uppercase tracking-[0.13em] text-primary">
            Faixa etária
            <span className="text-xl font-normal text-secondary transition group-open:rotate-45">+</span>
          </summary>
          <div className="mt-4 flex flex-wrap gap-2">
            {ageRanges.map((age) => {
              const active = selectedAge === age;
              return (
                <button
                  key={`${prefix}-${age}`}
                  type="button"
                  onClick={() => setSelectedAge(age)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                    active
                      ? "border-secondary bg-secondary text-white"
                      : "border-border/55 bg-white text-text-light hover:border-secondary hover:text-secondary"
                  }`}
                  aria-pressed={active}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </details>

        <details className="group border-b border-border/40 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black uppercase tracking-[0.13em] text-primary">
            Objetivo do brincar
            <span className="text-xl font-normal text-secondary transition group-open:rotate-45">+</span>
          </summary>
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
            {objectives.map((objective) => {
              const checked = selectedObjectives.includes(objective);
              const id = `${prefix}-objective-${normalizeText(objective).replace(/\s+/g, "-")}`;
              return (
                <label
                  key={objective}
                  htmlFor={id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                    checked
                      ? "border-secondary/35 bg-secondary/8 text-secondary"
                      : "border-transparent text-text-light hover:bg-background-alt"
                  }`}
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleObjective(objective)}
                    className="h-4 w-4 accent-secondary"
                  />
                  <span>{objective}</span>
                </label>
              );
            })}
          </div>
        </details>

        <details open className="group border-b border-border/40 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black uppercase tracking-[0.13em] text-primary">
            Disponibilidade
            <span className="text-xl font-normal text-secondary transition group-open:rotate-45">+</span>
          </summary>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {([
              ["todos", "Todos"],
              ["disponivel", "Em estoque"],
              ["esgotado", "Esgotados"],
            ] as const).map(([value, label]) => {
              const active = availability === value;
              return (
                <button
                  key={`${prefix}-${value}`}
                  type="button"
                  onClick={() => setAvailability(value)}
                  className={`min-h-12 rounded-2xl border px-2 text-[11px] font-black uppercase tracking-[0.08em] transition ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border/55 bg-white text-text-light hover:border-secondary hover:text-secondary"
                  }`}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </details>

        <details open className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black uppercase tracking-[0.13em] text-primary">
            Preço máximo
            <span className="text-xl font-normal text-secondary transition group-open:rotate-45">+</span>
          </summary>
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs text-muted">Até</span>
              <span className="rounded-full bg-background-alt px-3 py-1.5 font-display text-xl text-primary">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={catalogPriceCeiling}
              step={500}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="w-full accent-secondary"
              aria-label="Preço máximo"
            />
            <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
              <span>{formatPrice(500)}</span>
              <span>{formatPrice(catalogPriceCeiling)}</span>
            </div>
          </div>
        </details>

        <button
          type="button"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full border border-primary/20 bg-white px-5 text-xs font-black uppercase tracking-[0.13em] text-primary transition hover:border-secondary hover:text-secondary disabled:opacity-35"
        >
          Limpar todos os filtros
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 sm:py-14 lg:px-8">
      <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <label className="group relative block">
          <span className="sr-only">Buscar produtos</span>
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl transition group-focus-within:scale-110" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busque por brinquedo, objetivo, categoria..."
            className="min-h-16 w-full rounded-[1.4rem] border border-border/55 bg-white px-14 pr-12 text-base text-primary shadow-[0_12px_35px_rgba(9,38,71,0.06)] outline-none transition placeholder:text-muted focus:border-secondary focus:shadow-[0_15px_40px_rgba(161,77,45,0.10)]"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background-alt text-primary transition hover:bg-secondary hover:text-white"
              aria-label="Limpar busca"
            >
              ×
            </button>
          ) : null}
        </label>

        <label className="relative">
          <span className="sr-only">Ordenar produtos</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="min-h-16 w-full appearance-none rounded-[1.4rem] border border-border/55 bg-white px-5 pr-12 text-sm font-bold text-primary shadow-[0_12px_35px_rgba(9,38,71,0.06)] outline-none transition focus:border-secondary"
          >
            <option value="recomendados">Mais recomendados</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
            <option value="nome">Nome de A a Z</option>
          </select>
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-secondary" aria-hidden="true">⌄</span>
        </label>
      </div>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-border/45 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(9,38,71,0.15)] lg:hidden"
          >
            <span aria-hidden="true">☰</span>
            Filtrar
            {activeFilterCount > 0 ? <span className="rounded-full bg-secondary px-2 py-0.5">{activeFilterCount}</span> : null}
          </button>
          <div aria-live="polite">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Resultados encontrados</p>
            <p className="mt-0.5 font-display text-3xl text-primary">{countLabel(filteredProducts.length)}</p>
          </div>
        </div>
        <p className="hidden max-w-md text-right text-sm leading-6 text-text-light sm:block">
          Escolha com calma. Os filtros ajudam a encontrar recursos mais próximos do interesse e do momento da criança.
        </p>
      </div>

      {activeFilterCount > 0 ? (
        <div className="mb-7 flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
          <span className="mr-1 text-[10px] font-black uppercase tracking-[0.15em] text-muted">Filtros ativos</span>
          {search ? (
            <button type="button" onClick={() => setSearch("")} className="rounded-full bg-background-alt px-3 py-2 text-xs font-bold text-primary transition hover:bg-secondary hover:text-white">
              Busca: “{search}” ×
            </button>
          ) : null}
          {selectedCategory !== "Todos" ? (
            <button type="button" onClick={() => setSelectedCategory("Todos")} className="rounded-full bg-background-alt px-3 py-2 text-xs font-bold text-primary transition hover:bg-secondary hover:text-white">
              {selectedCategory} ×
            </button>
          ) : null}
          {selectedAge !== "Todos" ? (
            <button type="button" onClick={() => setSelectedAge("Todos")} className="rounded-full bg-background-alt px-3 py-2 text-xs font-bold text-primary transition hover:bg-secondary hover:text-white">
              {selectedAge} ×
            </button>
          ) : null}
          {selectedObjectives.map((objective) => (
            <button key={objective} type="button" onClick={() => toggleObjective(objective)} className="rounded-full bg-background-alt px-3 py-2 text-xs font-bold text-primary transition hover:bg-secondary hover:text-white">
              {objective} ×
            </button>
          ))}
          {availability !== "todos" ? (
            <button type="button" onClick={() => setAvailability("todos")} className="rounded-full bg-background-alt px-3 py-2 text-xs font-bold text-primary transition hover:bg-secondary hover:text-white">
              {availability === "disponivel" ? "Em estoque" : "Esgotados"} ×
            </button>
          ) : null}
          {maxPrice < catalogPriceCeiling ? (
            <button type="button" onClick={() => setMaxPrice(catalogPriceCeiling)} className="rounded-full bg-background-alt px-3 py-2 text-xs font-bold text-primary transition hover:bg-secondary hover:text-white">
              Até {formatPrice(maxPrice)} ×
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid items-start gap-9 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="sticky top-28 hidden rounded-[2rem] border border-border/50 bg-white p-5 shadow-[0_20px_55px_rgba(9,38,71,0.07)] lg:block xl:p-6" aria-label="Filtros do catálogo">
          {renderFilters("desktop")}
        </aside>

        <main>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <section className="relative overflow-hidden rounded-[2.5rem] border border-border/45 bg-background-alt px-6 py-20 text-center sm:px-12">
              <span className="absolute left-[12%] top-12 animate-float text-4xl" aria-hidden="true">🧩</span>
              <span className="absolute right-[12%] top-16 animate-float-slow text-3xl" aria-hidden="true">✦</span>
              <div className="mx-auto flex h-24 w-24 animate-bob items-center justify-center rounded-full bg-white text-5xl shadow-[0_18px_40px_rgba(9,38,71,0.10)]" aria-hidden="true">🧸</div>
              <h2 className="mt-7 font-display text-4xl text-primary sm:text-5xl">Nenhum brinquedo apareceu por aqui.</h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-text-light">
                Tente retirar um filtro ou buscar por outro interesse. Às vezes, uma escolha mais simples abre novas possibilidades de brincar.
              </p>
              <button type="button" onClick={clearFilters} className="button-shimmer mt-8 inline-flex min-h-13 items-center rounded-full bg-secondary px-7 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-primary">
                Mostrar todos os produtos
              </button>
            </section>
          )}

          <section className="mt-12 rounded-[2rem] border border-secondary-light/25 bg-[linear-gradient(135deg,#F2E6DE,#FDF9F6)] p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 animate-sway items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">💡</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-secondary">Dica da curadoria</p>
                  <h2 className="mt-1 font-display text-3xl text-primary">Não sabe qual recurso escolher?</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-text-light">
                    Comece observando o que a criança procura espontaneamente: movimento, textura, encaixe, previsibilidade, comunicação ou interação.
                  </p>
                </div>
              </div>
              <Link href="/contato" className="inline-flex min-h-12 shrink-0 items-center rounded-full border border-primary/20 bg-white px-5 text-xs font-black uppercase tracking-[0.12em] text-primary transition hover:border-secondary hover:text-secondary">
                Falar com a curadoria
              </Link>
            </div>
          </section>
        </main>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros do catálogo">
          <button type="button" onClick={() => setFiltersOpen(false)} className="absolute inset-0 bg-primary/45 backdrop-blur-sm" aria-label="Fechar filtros" />
          <aside className="absolute inset-y-0 left-0 w-[min(92vw,390px)] overflow-y-auto bg-background p-5 shadow-2xl">
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setFiltersOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xl text-white" aria-label="Fechar filtros">
                ×
              </button>
            </div>
            {renderFilters("mobile")}
            <button type="button" onClick={() => setFiltersOpen(false)} className="button-shimmer sticky bottom-3 mt-6 flex min-h-14 w-full items-center justify-center rounded-full bg-secondary px-6 text-xs font-black uppercase tracking-[0.13em] text-white shadow-[0_16px_35px_rgba(161,77,45,0.28)]">
              Ver {countLabel(filteredProducts.length)}
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
