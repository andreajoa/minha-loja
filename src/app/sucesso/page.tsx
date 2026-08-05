import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  let paid = false;
  let email = "";
  let orderReference = sessionId ? sessionId.slice(-10).toUpperCase() : "";

  if (sessionId && stripeKey) {
    try {
      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid";
      email = session.customer_details?.email || session.customer_email || "";
      orderReference = (session.payment_intent?.toString() || session.id).slice(-10).toUpperCase();
    } catch {
      paid = false;
    }
  }

  if (!sessionId || !paid) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amarelo/25 text-5xl">⏳</div>
        <h1 className="mt-6 text-4xl font-black">Ainda estamos confirmando o pagamento</h1>
        <p className="mt-4 text-lg leading-relaxed text-ardosia/70">
          Caso o valor tenha sido cobrado, aguarde a confirmação por e-mail. Não refaça a compra antes de verificar sua caixa de entrada.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-full bg-teal px-8 py-4 font-black text-white hover:bg-teal-dark">
            Voltar ao início
          </Link>
          <Link href="/contato" className="rounded-full border-2 border-ardosia/15 px-8 py-4 font-black hover:border-teal">
            Falar com o suporte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <ClearCartOnSuccess />
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-menta/25 text-6xl">✓</div>
      <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-teal-dark">Pagamento aprovado</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Seu pedido foi confirmado</h1>
      <p className="mt-5 text-lg leading-relaxed text-ardosia/70">
        Obrigada por escolher a BrinqueTEAndo. Estamos preparando as próximas informações do seu pedido.
      </p>

      <div className="mt-8 rounded-3xl border border-teal/10 bg-white p-6 text-left shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-ardosia/50">Referência do pedido</p>
            <p className="mt-1 text-xl font-black">{orderReference}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-black uppercase tracking-wide text-ardosia/50">Confirmação enviada para</p>
            <p className="mt-1 font-black text-teal-dark">{email || "o e-mail informado no pagamento"}</p>
          </div>
        </div>
      </div>

      <p className="mt-7 text-sm leading-relaxed text-ardosia/60">
        Verifique também as pastas Promoções e Spam. O e-mail transacional é enviado depois que a Stripe comunica a aprovação ao sistema.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/colecoes" className="rounded-full bg-teal px-8 py-4 font-black text-white hover:bg-teal-dark">
          Continuar explorando
        </Link>
        <Link href="/contato" className="rounded-full border-2 border-ardosia/15 px-8 py-4 font-black hover:border-teal">
          Preciso de ajuda
        </Link>
      </div>
    </div>
  );
}
