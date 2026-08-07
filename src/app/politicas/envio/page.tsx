import PolicyPage from "@/components/PolicyPage";

export default function Envio() {
  return (
    <PolicyPage
      eyebrow="Entrega transparente"
      title="Política de Envio e Entrega"
      intro="O valor e o prazo de entrega são calculados antes do pagamento para que você saiba exatamente o que esperar do pedido."
      sections={[
        {
          title: "Cálculo do frete",
          content: (
            <>
              <p>O frete é calculado a partir do CEP, dos produtos escolhidos e da modalidade de entrega disponível. O valor selecionado é exibido no carrinho e novamente no checkout.</p>
              <p>Condições de frete grátis, quando disponíveis, serão mostradas de forma clara na loja.</p>
            </>
          ),
        },
        {
          title: "Prazo de preparação",
          content: (
            <>
              <p>Após a confirmação do pagamento, o pedido entra em preparação. O prazo operacional de separação e postagem pode variar conforme disponibilidade, feriados e volume de pedidos, e será informado quando aplicável.</p>
            </>
          ),
        },
        {
          title: "Prazo de transporte",
          content: (
            <>
              <p>O prazo apresentado no cálculo de frete é uma estimativa da modalidade escolhida e começa a contar conforme as regras da transportadora após a postagem ou coleta.</p>
              <p>Eventos externos, restrições de entrega, greves, condições climáticas ou situações de força maior podem alterar o prazo inicialmente estimado.</p>
            </>
          ),
        },
        {
          title: "Endereço e tentativa de entrega",
          content: (
            <>
              <p>Confira CEP, rua, número, bairro, complemento e ponto de referência antes de pagar. Informações incorretas podem causar devolução, atraso ou necessidade de novo frete.</p>
            </>
          ),
        },
        {
          title: "Rastreamento",
          content: (
            <>
              <p>Quando houver código de rastreio ou acompanhamento da transportadora, ele será encaminhado pelos canais informados no pedido assim que estiver disponível.</p>
            </>
          ),
        },
        {
          title: "Atraso, extravio ou avaria",
          content: (
            <>
              <p>Se houver atraso relevante, extravio confirmado ou avaria no transporte, entre em contato com o número do pedido. A BrinqueTEAndo acompanhará a ocorrência e adotará a solução cabível.</p>
            </>
          ),
        },
      ]}
      note={<p>Guarde o e-mail de confirmação do pedido até a conclusão da entrega. Ele reúne as principais informações da compra.</p>}
    />
  );
}
