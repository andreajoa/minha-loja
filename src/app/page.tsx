import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const destaque = products.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-creme pt-20 pb-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-menta/20 blur-3xl"></div>
          <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-amarelo/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <span className="inline-block rounded-full bg-teal/10 px-4 py-1.5 text-sm font-semibold text-teal-dark mb-6">
            Curadoria especializada para o desenvolvimento infantil
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-ardosia md:text-7xl">
            Brincar é <span className="text-teal">aprender a se regular</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-ardosia/70">
            Brinquedos sensoriais e pedagógicos cuidadosamente selecionados para promover foco, calma e autonomia.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/colecoes"
              className="rounded-full bg-teal px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-teal/20 transition hover:bg-teal-dark hover:scale-105"
            >
              Explorar Coleções
            </Link>
            <Link
              href="/sobre"
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-ardosia border border-ardosia/10 transition hover:border-teal/50"
            >
              Conhecer a Curadoria
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-ardosia">Destaques da semana</h2>
          <Link href="/colecoes" className="text-teal-dark font-semibold hover:underline">
            Ver tudo →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {destaque.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
