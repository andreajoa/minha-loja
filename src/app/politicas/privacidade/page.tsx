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
              <p>Quando a medição de experiência é aceita, também podem ser registrados dados de jornada, como origem da visita, parâmetros de campanha, páginas visualizadas, interações com botões e links, produtos consultados, ações no carrinho e checkout, tempo ativo, profundidade de rolagem, dispositivo, navegador e localização geográfica aproximada fornecida pela infraestrutura de hospedagem.</p>
              <p>Nas comunicações de marketing, também podemos registrar eventos operacionais e de engajamento fornecidos pela plataforma de e-mail, como envio, entrega, abertura quando tecnicamente detectável, clique em links, devolução, falha de entrega, denúncia de spam e cancelamento. Esses sinais são utilizados para melhorar relevância, frequência, conteúdo e entregabilidade.</p>
              <p>Os dados completos do cartão não são armazenados pela BrinqueTEAndo. O pagamento é processado pela Stripe em ambiente seguro.</p>
            </>
          ),
        },
        {
          title: "Inteligência e melhoria da experiência",
          content: (
            <>
              <p>A BrinqueTEAndo utiliza analytics first-party para compreender como visitantes chegam à loja, quais conteúdos e produtos despertam interesse, onde existem dificuldades na navegação e em quais etapas do funil ocorrem desistências.</p>
              <p>As jornadas são relacionadas por identificadores aleatórios de visitante e sessão. As tabelas próprias de analytics não armazenam o endereço IP bruto e não utilizam fingerprint do dispositivo para identificar uma pessoa.</p>
              <p>Para medir o desempenho de campanhas de e-mail, podemos relacionar eventos de clique e compra com a finalidade de compreender quais mensagens contribuíram para uma conversão. Aberturas são tratadas como sinal aproximado, pois tecnologias de privacidade de provedores de e-mail podem afetar sua precisão.</p>
            </>
          ),
        },
        {
          title: "Por que utilizamos esses dados",
          content: (
            <>
              <p>Utilizamos os dados para preparar e entregar pedidos, confirmar pagamentos, prestar suporte, prevenir fraude, cumprir obrigações legais, manter a segurança do site e melhorar conteúdo, navegação, produtos e experiência de compra.</p>
              <p>Newsletter, promoções e cupons são enviados quando houver consentimento ou outra base legal aplicável, sempre com possibilidade de cancelamento.</p>
            </>
          ),
        },
        {
          title: "Serviços que apoiam a operação",
          content: (
            <>
              <p>Alguns dados podem ser tratados por fornecedores necessários à operação, como Stripe (pagamentos), Clerk (autenticação), Resend (e-mails), Vercel (hospedagem), infraestrutura de banco de dados e prestadores de logística ou cálculo de frete.</p>
              <p>Não vendemos dados pessoais. O acesso interno ao painel de inteligência é restrito à administração da loja.</p>
            </>
          ),
        },
        {
          title: "Armazenamento e segurança",
          content: (
            <>
              <p>Adotamos medidas técnicas e organizacionais compatíveis com a operação da loja. Os dados são mantidos pelo tempo necessário para cumprir a finalidade informada, obrigações legais, prevenção de fraude, análise operacional e exercício regular de direitos.</p>
            </>
          ),
        },
        {
          title: "Seus direitos",
          content: (
            <>
              <p>Você pode solicitar informações, acesso ou correção de dados relacionados ao atendimento e às operações da loja, além de exercer os demais direitos aplicáveis ao tratamento de dados pessoais.</p>
              <p>Para solicitações de privacidade, escreva para <a className="font-bold text-secondary underline underline-offset-4" href="mailto:info@brinqueteando.online">info@brinqueteando.online</a>.</p>
            </>
          ),
        },
        {
          title: "Comunicações por e-mail e WhatsApp",
          content: (
            <>
              <p>Ao se inscrever voluntariamente em nossa newsletter, você poderá receber conteúdos, novidades, promoções e cupons. O cancelamento pode ser solicitado a qualquer momento pelos canais disponíveis na mensagem ou pelo e-mail da loja.</p>
              <p>Para melhorar a qualidade dessas comunicações, podemos analisar métricas agregadas de entrega, abertura, clique e conversão. O objetivo é reduzir mensagens irrelevantes e aprimorar assuntos, conteúdo, ofertas e frequência.</p>
            </>
          ),
        },
      ]}
      note={<p>Esta política poderá ser atualizada para refletir mudanças operacionais ou tecnológicas. A versão vigente ficará sempre disponível nesta página.</p>}
    />
  );
}
