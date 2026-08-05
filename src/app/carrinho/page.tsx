"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice, products } from "@/data/products";
import { withBasePath } from "@/lib/paths";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const detailedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.id);
          return product ? { ...item, product } : null;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [items],
  );

  const subtotal = detailedItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  async function checkout() {
    if (!detailedItems.length || loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(withBasePath("/api/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: detailedItems.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Não foi possível iniciar o pagamento.");
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Ocorreu um erro ao abrir o pagamento.",
      );
      setLoading(false);
    }
  }

  if (!detailedItems.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal/15 text-5xl">🛒</div>
        <h1 className="mt-6 text-4xl font-black">Seu carrinho está vazio</h1>
        <p className="mt-4 text-lg leading-relaxed text-ardosia/70">
          Explore os produtos e escolha os recursos que combinam com a rotina e os interesses da criança.
        </p>
        <Link
          href="/colecoes"
          className="mt-8 inline-flex rounded-full bg-teal px-8 py-4 font-black text-white transition hover:bg-teal-dark"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">Seu pedido</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">Carrinho de compras</h1>
        <p className="mt-4 text-ardosia/70">
          Confira os itens antes de seguir para o ambiente seguro de pagamento.
        </p>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {detailedItems.map(({ product, quantity }) => (
            <article
              key={product.id}
              className="grid gap-5 rounded-3xl border border-teal/10 bg-white p-5 shadow-sm sm:grid-cols-[128px_1fr]"
            >
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-menta/25 via-lavanda/20 to-amarelo/25 text-6xl">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden="true">{product.emoji}</span>
                )}
              </div>

              <div className="flex min-w-0 flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-coral">{product.category}</p>
                  <Link href={`/produto/${product.id}`} className="mt-1 block text-xl font-black hover:text-teal-dark">
                    {product.name}
                  </Link>
                  <p className="mt-2 text-sm text-ardosia/60">{formatPrice(product.price)} por unidade</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <div className="inline-flex items-center rounded-full border border-teal/15 bg-creme p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full font-black transition hover:bg-white"
                      aria-label={`Diminuir quantidade de ${product.name}`}
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center font-black" aria-live="polite">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= Math.min(10, product.stock)}
                      className="flex h-9 w-9 items-center justify-center rounded-full font-black transition hover:bg-white disabled:opacity-30"
                      aria-label={`Aumentar quantidade de ${product.name}`}
                    >
                      +
                    </button>
                  </div>

                  <p className="min-w-24 text-right text-lg font-black text-teal-dark">
                    {formatPrice(product.price * quantity)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="text-sm font-bold text-coral hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-[2rem] border border-teal/10 bg-white p-6 shadow-xl shadow-ardosia/5 lg:sticky lg:top-36">
          <h2 className="text-2xl font-black">Resumo</h2>
          <div className="mt-6 space-y-4 border-b border-ardosia/10 pb-6">
            <div className="flex justify-between gap-4 text-ardosia/70">
              <span>Subtotal</span>
              <strong className="text-ardosia">{formatPrice(subtotal)}</strong>
            </div>
            <div className="flex justify-between gap-4 text-ardosia/70">
              <span>Frete</span>
              <strong className="text-ardosia">Calculado no pagamento</strong>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 py-6">
            <span className="font-black">Total dos produtos</span>
            <strong className="text-3xl font-black text-teal-dark">{formatPrice(subtotal)}</strong>
          </div>

          {error ? (
            <p className="mb-4 rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={checkout}
            disabled={loading}
            className="w-full rounded-full bg-teal px-6 py-4 font-black text-white shadow-lg shadow-teal/20 transition hover:bg-teal-dark disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Abrindo pagamento..." : "Ir para o pagamento seguro"}
          </button>

          <div className="mt-5 space-y-2 text-xs leading-relaxed text-ardosia/60">
            <p>🔒 Pagamento processado pela Stripe.</p>
            <p>✉️ A confirmação será enviada ao e-mail informado no checkout.</p>
            <p>📦 Endereço e prazo de entrega serão confirmados antes do pagamento.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
