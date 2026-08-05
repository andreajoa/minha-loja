import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";
import PostPurchaseOffer from "@/components/PostPurchaseOffer";
import { formatMoney } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; extra?: string }>;
}) {
  const { session_id: sessionId, extra } = await searchParams;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  let paid = false;
  let email = "";
  let customerName = "";
  let orderReference = sessionId ? sessionId.slice(-10).toUpperCase() : "";
  let amountTotal = 0;
  let shippingLabel = "";
  let discountPercent = 0;
  let isPostPurchase = extra === "1";

  if (sessionId && stripeKey) {
    try {
      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid";
      email = session.customer_details?.email || session.customer_email || "";
      customerName = session.customer_details?.name || "";
      amountTotal = session.amount_total || 0;
      shippingLabel = session.metadata?.shippingLabel || "";
      discountPercent = Number.parseInt(session.metadata?.discountPercent || "0", 10) || 0;
      isPostPurchase = isPostPurchase || session.metadata?.source === "post_purchase_offer";
      orderReference = (session.payment_intent?.toString() || session.id).slice(-10).toUpperCase();
    } catch {
      paid = false;
    }
  }

  if (!sessionId || !paid) {
    return (
      <div className="hero-grid min-h-[70vh] px-5 py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-[0_18px_45px_rgba(9,38,71,0.1)]">⏳</div>
        <h1 className="mt-6 font-display text-5xl text-primary">Ainda estamos confirmando o pagamento</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-text-light">
          Caso o valor tenha sido cobrado, aguarde a confirmação por e-mail. Não refaça a compra antes de verificar sua caixa de entrada.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-full bg-secondary px-8 py-4 font-black text-white hover:bg-primary">
            Voltar ao início
          </Link>
          <Link href="/contato" className="rounded-full border-2 border-border px-8 py-4 font-black text-primary hover:border-secondary">
            Falar com o suporte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <ClearCartOnSuccess />
      <section className="hero-grid border-b border-border/45 px-5 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto flex h-28 w-28 animate-bob items-center justify-center rounded-full bg-white text-6xl text-secondary shadow-[0_22px_55px_rgba(9,38,71,0.12)]">✓</div>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-secondary">Pagamento aprovado</p>
          <h1 className="mt-3 font-display text-5xl text-primary sm:text-6xl">
            {isPostPurchase ? "Compra adicional confirmada" : `Obrigada${customerName ? `, ${customerName.split(" ")[0]}` : ""}!`}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-text-light">
            {isPostPurchase
              ? "O novo produto será identificado para seguir junto ao pedido original sempre que a preparação ainda permitir."
              : "Seu pedido entrou na nossa sequência de preparação. Você receberá as próximas informações por e-mail."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <div className="grid gap-5 rounded-[2rem] border border-border/50 bg-white p-6 shadow-[0_20px_55px_rgba(9,38,71,0.08)] sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Referência</p>
            <p className="mt-2 font-display text-2xl text-primary">{orderReference}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Total pago</p>
            <p className="mt-2 font-display text-2xl text-primary">{formatMoney(amountTotal)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Entrega</p>
            <p className="mt-2 font-bold text-primary">{shippingLabel || (isPostPurchase ? "Junto ao pedido original" : "Conforme informado no checkout")}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Confirmação enviada para</p>
            <p className="mt-2 break-words font-bold text-secondary">{email || "o e-mail do pagamento"}</p>
          </div>
        </div>

        {discountPercent > 0 ? (
          <p className="mx-auto mt-5 max-w-2xl rounded-full bg-secondary/10 px-5 py-3 text-center text-sm font-black text-secondary">
            Seu pedido recebeu {discountPercent}% de desconto automático.
          </p>
        ) : null}

        {!isPostPurchase ? <PostPurchaseOffer sessionId={sessionId} /> : null}

        <div className="mt-10 rounded-[2rem] bg-primary p-7 text-center text-white sm:p-9">
          <h2 className="font-display text-3xl">O que acontece agora?</h2>
          <div className="mx-auto mt-6 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
            <div className="rounded-2xl bg-white/8 p-5">
              <span className="text-3xl" aria-hidden="true">✉️</span>
              <p className="mt-3 font-black">Confirmação</p>
              <p className="mt-2 text-sm leading-6 text-white/75">Confira também Promoções e Spam para localizar o e-mail.</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-5">
              <span className="text-3xl" aria-hidden="true">📦</span>
              <p className="mt-3 font-black">Preparação</p>
              <p className="mt-2 text-sm leading-6 text-white/75">Os itens serão conferidos antes da atualização de envio.</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-5">
              <span className="text-3xl" aria-hidden="true">🤝</span>
              <p className="mt-3 font-black">Suporte</p>
              <p className="mt-2 text-sm leading-6 text-white/75">Use a referência acima ao falar com a equipe.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/colecoes" className="rounded-full bg-secondary px-8 py-4 text-center font-black text-white hover:bg-primary">
            Continuar explorando
          </Link>
          <Link href="/contato" className="rounded-full border-2 border-border px-8 py-4 text-center font-black text-primary hover:border-secondary">
            Preciso de ajuda
          </Link>
        </div>
      </div>
    </div>
  );
}
