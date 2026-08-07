import PolicyPage from "@/components/PolicyPage";

export default function Reembolso() {
  return (
    <PolicyPage
      eyebrow="Compra protegida"
      title="Trocas, Devoluções e Reembolso"
      intro="Queremos que o pós-compra seja tão claro quanto o checkout. Aqui estão as regras para arrependimento, defeito, devolução e estorno."
      sections={[
        {
          title: "Direito de arrependimento",
          content: (
            <>
              <p>Nas compras realizadas pela internet, você pode exercer o direito de arrependimento no prazo legal contado do recebimento do produto, conforme o Código de Defesa do Consumidor.</p>
              <p>Para iniciar a solicitação, envie o número do pedido e o e-mail usado na compra para <a className="font-bold text-secondary underline underline-offset-4" href="mailto:info@brinqueteando.online">info@brinqueteando.online</a>.</p>
            </>
          ),
        },
        {
          title: "Produto com defeito ou avaria",
          content: (
            <>
              <p>Se o produto chegar danificado, incompleto ou apresentar defeito, entre em contato assim que identificar o problema. Poderemos solicitar fotos ou vídeo apenas para agilizar a análise e a solução.</p>
              <p>Serão respeitados os prazos e garantias legais aplicáveis ao produto.</p>
            </>
          ),
        },
        {
          title: "Condições para devolução",
          content: (
            <>
              <p>Sempre que possível, mantenha embalagem, acessórios, manuais e demais itens recebidos. No exercício regular do direito de arrependimento, a análise não poderá impor condição que elimine um direito assegurado por lei.</p>
            </>
          ),
        },
        {
          title: "Logística reversa",
          content: (
            <>
              <p>Quando a devolução for devida nos termos legais ou decorrer de erro da loja, orientaremos o procedimento de postagem ou coleta e os custos cabíveis serão tratados pela BrinqueTEAndo.</p>
            </>
          ),
        },
        {
          title: "Como funciona o reembolso",
          content: (
            <>
              <p>Após a confirmação da devolução ou do cancelamento aplicável, o estorno será solicitado pelo mesmo meio de pagamento utilizado na compra. O prazo de visualização do crédito pode variar conforme a operadora do cartão ou instituição financeira.</p>
            </>
          ),
        },
        {
          title: "Pedido incorreto ou item faltante",
          content: (
            <>
              <p>Se você receber um produto diferente do comprado ou faltar algum item, envie uma mensagem com o número do pedido. Vamos conferir o registro e providenciar a correção adequada.</p>
            </>
          ),
        },
      ]}
      note={<p>O exercício do direito de arrependimento em comércio eletrônico deve ser facilitado, e a manifestação do consumidor deve ser confirmada pelo fornecedor. citeturn513419search2</p>}
    />
  );
}
