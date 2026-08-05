import Link from "next/link";
import { products } from "@/data/products";

export default function Home() {
  const destaque = products.slice(0, 3);

  return (
    <>
      <section className="bg-gradient-to-br from-teal/15 via-lavanda/10 to-amarelo/15">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold md:text-5xl">
            Brincar tambem é <span className="text-teal-dark">aprender a se regular</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-80">
            Brinquedos sensoriais e pedagogicos escolhidos com carinho para criancas
            com TDAH e autismo. Cada item pensado para foco, calma e desenvolvimento.
          </p>
          <Link
            href="/colecoes"
            className="mt-8 inline-block rounded-full bg-teal px-8 py-3 font-semibold text-white transition hover:bg-teal-dark"
          >
            Ver coleçoes
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">Destaques da semana</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destaque.map((p) => (
            <Link
              key={p.id}
              href={`/produto/${p.id}`}
              className="group rounded-2xl border border-teal/10 bg-white p-4 shadow-sm transition hover:shadow-lg"
            >
              <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-menta/20 text-5xl">
                🧸
              </div>
              <span className="text-xs font-medium text-coral">{p.category}</span>
              <h3 className="mt-1 font-bold group-hover:text-teal-dark">{p.name}</h3>
              <p className="mt-2 text-lg font-bold text-teal-dark">
                R$ {(p.price / 100).toFixed(2).replace(".", ",")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
