import PolicyPage from "@/components/PolicyPage";

export default function Cookies() {
  return (
    <PolicyPage
      eyebrow="Transparência digital"
      title="Política de Cookies"
      intro="Cookies, armazenamento local e identificadores first-party ajudam a manter funções da loja, lembrar preferências e, quando você aceita a medição, entender a experiência de navegação para melhorar a BrinqueTEAndo."
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
          title: "Recursos essenciais",
          content: (
            <>
              <p>Alguns recursos dependem de armazenamento local ou cookies necessários à operação, como autenticação, segurança, carrinho, preferências, recuperação de compra e prevenção de abuso. Ao apagar esses dados, algumas escolhas podem ser redefinidas.</p>
            </>
          ),
        },
        {
          title: "Analytics próprio da BrinqueTEAndo",
          content: (
            <>
              <p>Após a aceitação da medição no aviso de cookies, a loja pode criar identificadores aleatórios first-party de visitante e sessão para relacionar etapas da mesma jornada sem utilizar fingerprint do dispositivo.</p>
              <p>Podem ser registrados: página de entrada, referência de origem, parâmetros de campanha (UTM e identificadores publicitários presentes na URL), páginas visualizadas, cliques em links e botões, visualização de produtos, adição ou remoção no carrinho, início do checkout, compra concluída, profundidade de rolagem, tempo ativo, tipo de dispositivo, navegador, sistema operacional e métricas técnicas de carregamento.</p>
            </>
          ),
        },
        {
          title: "Cidade e estado aproximados",
          content: (
            <>
              <p>A infraestrutura de hospedagem pode fornecer ao servidor informações geográficas aproximadas, como país, estado e cidade associados à requisição. A BrinqueTEAndo utiliza esses campos para análises agregadas de audiência e não armazena o endereço IP bruto dentro das tabelas próprias de analytics.</p>
              <p>Esses dados representam localização aproximada de rede e não a localização residencial exata do visitante.</p>
            </>
          ),
        },
        {
          title: "Como controlar",
          content: (
            <>
              <p>Você pode apagar cookies e dados do site nas configurações do navegador. Isso remove preferências e identificadores armazenados naquele navegador e pode também redefinir carrinho, login ou outras funcionalidades.</p>
            </>
          ),
        },
        {
          title: "Serviços de terceiros",
          content: (
            <>
              <p>Serviços necessários à operação, como autenticação, pagamento, envio de e-mails e hospedagem, podem utilizar tecnologias próprias conforme a finalidade de cada serviço e suas respectivas políticas.</p>
            </>
          ),
        },
      ]}
      note={<p>O painel interno de inteligência utiliza dados agregados e jornadas identificadas por códigos aleatórios. O objetivo é compreender origem, navegação, experiência e conversão para melhorar a loja.</p>}
    />
  );
}
