import PolicyPage from "@/components/PolicyPage";

export default function Privacidade() {
  return (
    <PolicyPage
      eyebrow="Privacidade e LGPD"
      title="Política de Privacidade"
      intro="Esta política explica, de forma clara, quais dados a BrinqueTEAndo utiliza, por que eles são necessários e como você pode exercer seus direitos."
      sections={[
        {
          title: "Quais dados podemos tratar",
          content: (
            <>
              <p>Podemos tratar dados como nome, e-mail, WhatsApp, endereço de entrega, CEP, informações do pedido, histórico de atendimento e dados técnicos necessários ao funcionamento da loja.</p>
              <p>Os dados completos do cartão não são armazenados pela BrinqueTEAndo. O pagamento é processado pela Stripe em ambiente seguro.</p>
            </>
          ),
        },
        {
          title: "Por que utilizamos esses dados",
          content: (
            <>
              <p>Utilizamos os dados para preparar e entregar pedidos, confirmar pagamentos, prestar suporte, prevenir fraude, cumprir obrigações legais e manter a segurança do site.</p>
              <p>Newsletter, promoções e cupons são enviados quando houver consentimento ou outra base legal aplicável, sempre com possibilidade de cancelamento.</p>
            </>
          ),
        },
        {
          title: "Serviços que apoiam a operação",
          content: (
            <>
              <p>Alguns dados podem ser tratados por fornecedores necessários à operação, como Stripe (pagamentos), Clerk (autenticação), Resend (e-mails), Vercel (hospedagem) e prestadores de logística ou cálculo de frete.</p>
              <p>Compartilhamos somente o necessário para cada finalidade e não vendemos dados pessoais.</p>
            </>
          ),
        },
        {
          title: "Armazenamento e segurança",
          content: (
            <>
              <p>Adotamos medidas técnicas e organizacionais compatíveis com a operação da loja. Os dados são mantidos pelo tempo necessário para cumprir a finalidade informada, obrigações legais, prevenção de fraude e exercício regular de direitos.</p>
            </>
          ),
        },
        {
          title: "Seus direitos",
          content: (
            <>
              <p>Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, informações sobre compartilhamento, revogação do consentimento e, quando cabível, eliminação, anonimização, bloqueio ou portabilidade.</p>
              <p>Para exercer esses direitos, escreva para <a className="font-bold text-secondary underline underline-offset-4" href="mailto:info@brinqueteando.online">info@brinqueteando.online</a>.</p>
            </>
          ),
        },
        {
          title: "Comunicações por e-mail e WhatsApp",
          content: (
            <>
              <p>Ao se inscrever voluntariamente em nossa newsletter, você poderá receber conteúdos, novidades, promoções e cupons. O cancelamento pode ser solicitado a qualquer momento pelos canais disponíveis na mensagem ou pelo e-mail da loja.</p>
            </>
          ),
        },
      ]}
      note={<p>Esta política poderá ser atualizada para refletir mudanças legais, operacionais ou tecnológicas. A versão vigente ficará sempre disponível nesta página.</p>}
    />
  );
}
