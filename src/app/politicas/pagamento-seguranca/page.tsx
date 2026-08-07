import PolicyPage from "@/components/PolicyPage";

export default function PagamentoSeguranca() {
  return (
    <PolicyPage
      eyebrow="Checkout protegido"
      title="Pagamento e Segurança"
      intro="A BrinqueTEAndo utiliza um checkout incorporado da Stripe para processar pagamentos com segurança e manter os dados sensíveis do cartão fora dos servidores da loja."
      sections={[
        {
          title: "Processamento pela Stripe",
          content: (
            <>
              <p>Os dados do cartão são enviados diretamente ao ambiente seguro da Stripe. A BrinqueTEAndo recebe apenas as informações necessárias para identificar o pagamento e cumprir o pedido.</p>
            </>
          ),
        },
        {
          title: "Confirmação do pagamento",
          content: (
            <>
              <p>O pedido é considerado pago após a confirmação da transação. Autorizações, recusas e verificações adicionais podem depender do banco emissor ou da operadora do cartão.</p>
            </>
          ),
        },
        {
          title: "Valores e resumo da compra",
          content: (
            <>
              <p>Antes de concluir o pagamento, o checkout apresenta os produtos, descontos aplicados, modalidade de entrega e total. Revise essas informações antes de confirmar.</p>
            </>
          ),
        },
        {
          title: "Proteção contra fraude",
          content: (
            <>
              <p>Transações podem passar por mecanismos automáticos de segurança e prevenção de fraude. Em situações específicas, poderemos solicitar uma confirmação adicional de dados do pedido, sem pedir senha ou número completo do cartão.</p>
            </>
          ),
        },
        {
          title: "Nunca pedimos sua senha",
          content: (
            <>
              <p>A BrinqueTEAndo não solicita senha bancária, código de acesso ao aplicativo do banco ou envio do número completo do cartão por e-mail, WhatsApp ou redes sociais.</p>
            </>
          ),
        },
        {
          title: "Problemas no pagamento",
          content: (
            <>
              <p>Se houver cobrança aprovada sem confirmação do pedido, tentativa duplicada ou outra divergência, entre em contato pelo e-mail <a className="font-bold text-secondary underline underline-offset-4" href="mailto:info@brinqueteando.online">info@brinqueteando.online</a> com o e-mail usado na compra e os detalhes do ocorrido.</p>
            </>
          ),
        },
      ]}
      note={<p>Para sua segurança, nunca compartilhe códigos de autenticação recebidos por SMS, aplicativo bancário ou e-mail.</p>}
    />
  );
}
