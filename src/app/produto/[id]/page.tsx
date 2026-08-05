import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice, products } from "@/data/products";

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

  if (!product) return { title: "Produto não encontrado" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <Link href="/colecoes" className="text-sm font-bold text-teal-dark hover:underline">
        ← Voltar para os produtos
      </Link>

      <div className="mt-7 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="sticky top-36">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] border border-teal/10 bg-gradient-to-br from-menta/30 via-lavanda/20 to-amarelo/30 shadow-xl shadow-ardosia/5">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-9xl" aria-hidden="true">{product.emoji}</span>
            )}
          </div>
          <p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-relaxed text-ardosia/65 shadow-sm">
            As cores, medidas e pequenos detalhes podem variar conforme o lote. Confira sempre a faixa etária e use sob supervisão de um adulto.
          </p>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-coral/10 px-4 py-2 text-sm font-black text-coral">
            {product.category}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ardosia/75">{product.description}</p>

          <div className="mt-8 rounded-3xl border border-teal/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-ardosia/55">Valor do produto</p>
            <p className="mt-1 text-4xl font-black text-teal-dark">{formatPrice(product.price)}</p>
            <p className="mt-2 text-sm font-semibold text-ardosia/60">
              Pagamento seguro por cartão no ambiente da Stripe.
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
              <p className={`text-sm font-bold ${product.stock > 0 ? "text-teal-dark" : "text-coral"}`}>
                {product.stock > 0 ? `${product.stock} unidades disponíveis` : "Produto esgotado"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-menta/15 p-6">
              <p className="text-sm font-black uppercase tracking-wide text-teal-dark">Faixa etária</p>
              <p className="mt-2 text-lg font-black">{product.ageRange}</p>
            </div>
            <div className="rounded-3xl bg-lavanda/15 p-6">
              <p className="text-sm font-black uppercase tracking-wide text-teal-dark">Uso recomendado</p>
              <p className="mt-2 text-lg font-black">Brincadeira mediada e supervisionada</p>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-2xl font-black">Possibilidades de exploração</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 rounded-2xl border border-teal/10 bg-white p-4 font-bold">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal-dark">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 rounded-3xl border-l-4 border-amarelo bg-amarelo/15 p-6">
            <h2 className="font-black">Importante</h2>
            <p className="mt-2 leading-relaxed text-ardosia/75">
              Este produto é um recurso de brincar. Ele não trata, não diagnostica e não substitui avaliação clínica, terapêutica ou educacional individualizada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
