import PolicyPage from "@/components/PolicyPage";

export default function Cookies() {
  return (
    <PolicyPage
      eyebrow="Transparência digital"
      title="Política de Cookies"
      intro="Cookies e tecnologias semelhantes ajudam a manter funções da loja, lembrar preferências e proteger a navegação."
      sections={[
        {
          title: "O que são cookies",
          content: (
            <>
              <p>Cookies são pequenos arquivos ou identificadores armazenados pelo navegador. Eles podem ser usados para manter uma sessão, lembrar escolhas e permitir que determinados recursos funcionem corretamente.</p>
            </>
          ),
        },
        {
          title: "Cookies essenciais",
          content: (
            <>
              <p>Alguns recursos dependem de armazenamento local ou cookies essenciais, como autenticação, segurança, carrinho, preferências e prevenção de abuso. Sem eles, partes da loja podem não funcionar como esperado.</p>
            </>
          ),
        },
        {
          title: "Medição e desempenho",
          content: (
            <>
              <p>Quando ferramentas de medição forem utilizadas, elas poderão gerar dados técnicos sobre acesso, dispositivo e desempenho para ajudar a entender problemas e melhorar a experiência.</p>
            </>
          ),
        },
        {
          title: "Como controlar",
          content: (
            <>
              <p>Você pode apagar ou bloquear cookies e dados do site nas configurações do navegador. Ao fazer isso, carrinho, login, preferências ou outras funcionalidades podem ser redefinidos.</p>
            </>
          ),
        },
        {
          title: "Cookies de terceiros",
          content: (
            <>
              <p>Serviços necessários à operação, como autenticação, pagamento e hospedagem, podem utilizar cookies ou tecnologias próprias conforme suas políticas e a finalidade do serviço.</p>
            </>
          ),
        },
      ]}
      note={<p>Se ferramentas futuras exigirem consentimento específico para cookies não essenciais, a loja deverá apresentar controles adequados antes da ativação dessas tecnologias.</p>}
    />
  );
}
