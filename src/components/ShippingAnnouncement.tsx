"use client";

const messages = [
  "Frete grátis para Santos, São Vicente e Praia Grande",
  "Entregamos para todo o Brasil",
  "Calcule o frete pelo CEP antes de pagar",
  "Pagamento seguro por cartão com Stripe",
];

export default function ShippingAnnouncement() {
  const repeated = [...messages, ...messages];

  return (
    <div className="shipping-announcement overflow-hidden bg-primary text-white" role="region" aria-label="Informações de entrega e pagamento">
      <div className="shipping-announcement-track flex min-w-max items-center py-2.5">
        {repeated.map((message, index) => (
          <div
            key={`${message}-${index}`}
            className="flex shrink-0 items-center gap-3 px-7 text-[10px] font-black uppercase tracking-[0.16em] sm:text-xs"
          >
            <span className="text-secondary-light" aria-hidden="true">✦</span>
            <span>{message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
