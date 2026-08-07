import PolicyPage from "@/components/PolicyPage";

export default function Termos() {
  return (
    <PolicyPage
      eyebrow="Regras claras de compra"
      title="Termos de Uso e Compra"
      intro="Estes termos organizam a relação entre a BrinqueTEAndo e quem navega, cria conta ou realiza compras em nossa loja."
      sections={[
        {
          title: "Uso da loja",
          content: (
            <>
              <p>Ao utilizar o site, você concorda em fornecer informações verdadeiras e atualizadas e em utilizar os recursos da loja de forma lícita e compatível com estes termos.</p>
            </>
          ),
        },
        {
          title: "Produtos e informações",
          content: (
            <>
              <p>Buscamos apresentar fotos, descrições, medidas, faixa etária, benefícios esperados, preço e disponibilidade de forma clara. Pequenas variações de cor, acabamento ou embalagem podem ocorrer conforme o lote.</p>
              <p>Os brinquedos e recursos vendidos são produtos de brincar e aprendizagem. Eles não realizam diagnóstico, não substituem terapia, avaliação clínica, educacional ou orientação profissional individualizada.</p>
            </>
          ),
        },
        {
          title: "Preços, ofertas e cupons",
          content: (
            <>
              <p>Os preços são exibidos em reais (BRL). Promoções, descontos progressivos e cupons podem ter regras próprias e prazo de validade. Quando a loja informar que benefícios não são cumulativos, será aplicada a melhor condição elegível.</p>
              <p>Erros manifestamente evidentes de preço, disponibilidade ou descrição poderão ser corrigidos antes da conclusão do pedido, com comunicação ao consumidor quando necessário.</p>
            </>
          ),
        },
        {
          title: "Pagamento",
          content: (
            <>
              <p>O pagamento é processado pela Stripe. A confirmação do pedido depende da aprovação da transação pelo meio de pagamento escolhido.</p>
              <p>A BrinqueTEAndo não armazena o número completo do cartão.</p>
            </>
          ),
        },
        {
          title: "Entrega e endereço",
          content: (
            <>
              <p>O comprador é responsável por informar endereço, CEP, número, complemento e referência corretos. Prazos e valores de frete são apresentados antes da conclusão do pagamento.</p>
              <p>Detalhes adicionais estão disponíveis na Política de Envio e Entrega.</p>
            </>
          ),
        },
        {
          title: "Uso seguro dos produtos",
          content: (
            <>
              <p>Respeite a faixa etária, as orientações do fabricante e a necessidade de supervisão adulta. Interrompa o uso se o produto apresentar dano que possa comprometer a segurança.</p>
            </>
          ),
        },
        {
          title: "Atendimento e solução de problemas",
          content: (
            <>
              <p>Em caso de dúvida sobre compra, pagamento, entrega, troca ou reembolso, entre em contato pelo e-mail <a className="font-bold text-secondary underline underline-offset-4" href="mailto:info@brinqueteando.online">info@brinqueteando.online</a>.</p>
            </>
          ),
        },
      ]}
      note={<p>Os direitos assegurados pelo Código de Defesa do Consumidor permanecem aplicáveis independentemente destes termos.</p>}
    />
  );
}
