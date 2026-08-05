export type ProductFaq = {
  question: string;
  answer: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  hook: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  emoji: string;
  category: string;
  goal: string;
  stock: number;
  ageRange: string;
  benefits: string[];
  included: string[];
  howToUse: string[];
  audience: string[];
  notFor: string[];
  faq: ProductFaq[];
  featured?: boolean;
  bestSeller?: boolean;
  badge?: string;
  active?: boolean;
};

const r2BaseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

function productImage(fileName: string) {
  return r2BaseUrl ? `${r2BaseUrl}/products/${fileName}` : "";
}

const commonFaq: ProductFaq[] = [
  {
    question: "Este produto substitui acompanhamento profissional?",
    answer:
      "Não. Ele é um recurso de brincar e mediação. Não diagnostica, não trata e não substitui avaliação clínica, terapêutica ou educacional individualizada.",
  },
  {
    question: "Precisa da supervisão de um adulto?",
    answer:
      "Sim. A supervisão ajuda a respeitar a faixa etária, a segurança e a forma de uso mais adequada para cada criança.",
  },
];

export const products: Product[] = [
  {
    id: "prod_001",
    slug: "cubo-sensorial-fidget",
    name: "Cubo Sensorial Fidget",
    hook: "Uma alternativa discreta para ocupar as mãos em momentos de espera, estudo e transição.",
    description:
      "Seis lados com estímulos táteis e movimentos diferentes para propostas curtas de exploração, pausa e organização da rotina.",
    price: 4990,
    image: productImage("cubo-sensorial.webp"),
    emoji: "🎛️",
    category: "Fidget",
    goal: "Foco e autorregulação",
    stock: 30,
    ageRange: "A partir de 5 anos",
    benefits: [
      "Exploração tátil variada",
      "Coordenação motora fina",
      "Uso discreto em diferentes ambientes",
      "Pode integrar pausas planejadas",
    ],
    included: ["1 cubo sensorial com seis faces", "Orientação básica de uso na embalagem"],
    howToUse: [
      "Apresente o cubo em um momento tranquilo.",
      "Permita que a criança explore cada face sem exigir uma resposta específica.",
      "Use por períodos curtos em esperas, transições ou atividades sentadas.",
      "Observe quais movimentos despertam interesse e quais geram desconforto.",
    ],
    audience: ["Crianças que gostam de manipular objetos", "Famílias que buscam uma opção portátil", "Profissionais que utilizam recursos de pausa"],
    notFor: ["Crianças abaixo da faixa etária indicada", "Uso sem supervisão", "Substituir estratégias individualizadas"],
    faq: [
      {
        question: "Ele faz barulho?",
        answer: "Algumas faces produzem pequenos sons mecânicos. O nível pode variar conforme o lote.",
      },
      ...commonFaq,
    ],
    featured: true,
    bestSeller: true,
    badge: "Escolha prática",
  },
  {
    id: "prod_002",
    slug: "colete-de-compressao-infantil",
    name: "Colete de Compressão Infantil",
    hook: "Pressão corporal uniforme com ajuste regulável e uso responsável.",
    description:
      "Colete ajustável de tecido macio. Seu uso deve considerar medidas corretas, conforto, tempo de utilização e orientação profissional quando houver indicação sensorial.",
    price: 15990,
    image: productImage("colete-compressao.webp"),
    emoji: "🦺",
    category: "Sensorial",
    goal: "Consciência corporal",
    stock: 15,
    ageRange: "Consulte as medidas",
    benefits: ["Ajuste regulável", "Tecido respirável", "Vestir e retirar com facilidade", "Uso planejado e supervisionado"],
    included: ["1 colete de compressão", "Tabela de medidas", "Orientações de conservação"],
    howToUse: [
      "Confira as medidas antes da compra.",
      "Apresente a peça sem obrigar a criança a vestir.",
      "Ajuste sem limitar respiração ou movimento.",
      "Interrompa o uso diante de desconforto, irritação ou recusa.",
    ],
    audience: ["Famílias com orientação para uso de pressão corporal", "Profissionais que acompanham o uso", "Crianças que aceitam peças ajustadas"],
    notFor: ["Uso sem conferir medidas", "Uso prolongado sem acompanhamento", "Crianças que demonstram desconforto com pressão"],
    faq: [
      {
        question: "Como escolher o tamanho?",
        answer: "Use a tabela de medidas do produto. Não escolha apenas pela idade, pois a estrutura corporal varia entre crianças.",
      },
      ...commonFaq,
    ],
    featured: true,
    badge: "Uso orientado",
  },
  {
    id: "prod_003",
    slug: "blocos-de-encaixe-coloridos",
    name: "Blocos de Encaixe Coloridos",
    hook: "Um mesmo conjunto para construir, classificar, copiar modelos e criar histórias.",
    description:
      "Peças grandes e coloridas para propostas abertas de construção, sequenciamento, pareamento e brincadeira compartilhada.",
    price: 8990,
    image: productImage("blocos-encaixe.webp"),
    emoji: "🧱",
    category: "Motor",
    goal: "Coordenação e criatividade",
    stock: 40,
    ageRange: "A partir de 3 anos",
    benefits: ["Planejamento motor", "Raciocínio espacial", "Criatividade", "Brincadeira em turnos"],
    included: ["Conjunto de blocos coloridos", "Embalagem para guardar"],
    howToUse: [
      "Comece com construções simples de duas ou três peças.",
      "Convide a criança a copiar um modelo apenas quando houver interesse.",
      "Crie sequências por cor ou tamanho.",
      "Transforme as construções em cenários de faz de conta.",
    ],
    audience: ["Crianças que gostam de montar e desmontar", "Famílias que buscam brincadeira aberta", "Atividades de pareamento e sequência"],
    notFor: ["Uso fora da faixa etária", "Exigir reprodução perfeita", "Brincadeira sem espaço para criação livre"],
    faq: [
      {
        question: "É necessário seguir modelos?",
        answer: "Não. A construção livre é tão importante quanto copiar modelos e costuma ser um bom ponto de partida.",
      },
      ...commonFaq,
    ],
    featured: true,
    badge: "Muitas formas de brincar",
  },
  {
    id: "prod_004",
    slug: "almofada-de-texturas",
    name: "Almofada de Texturas",
    hook: "Texturas diferentes para explorar, comparar, nomear e compartilhar descobertas.",
    description:
      "Superfícies variadas para propostas graduais de exploração tátil, pareamento e ampliação de vocabulário descritivo.",
    price: 6990,
    image: productImage("almofada-texturas.webp"),
    emoji: "🧶",
    category: "Sensorial",
    goal: "Exploração tátil",
    stock: 22,
    ageRange: "A partir de 3 anos",
    benefits: ["Discriminação tátil", "Vocabulário descritivo", "Escolha e recusa", "Brincadeira compartilhada"],
    included: ["1 almofada com superfícies variadas", "Orientações de limpeza"],
    howToUse: [
      "Deixe a criança observar antes de tocar.",
      "Apresente uma textura por vez.",
      "Aceite afastamento, recusa ou preferência.",
      "Use palavras simples como macio, áspero, liso e rugoso.",
    ],
    audience: ["Crianças interessadas em texturas", "Atividades de nomeação", "Brincadeiras de escolha"],
    notFor: ["Forçar contato tátil", "Usar como dessensibilização sem plano profissional", "Ignorar sinais de desconforto"],
    faq: [
      {
        question: "E se a criança não quiser tocar?",
        answer: "A recusa deve ser respeitada. Ela pode primeiro observar, tocar com outro objeto ou apenas escolher entre duas opções.",
      },
      ...commonFaq,
    ],
    badge: "Exploração respeitosa",
  },
  {
    id: "prod_005",
    slug: "quebra-cabeca-de-rotinas",
    name: "Quebra-Cabeça de Rotinas",
    hook: "Ajude a criança a visualizar o que acontece primeiro, depois e no final.",
    description:
      "Cartões visuais para organizar pequenas sequências do dia, conversar sobre mudanças e apoiar a compreensão de começo, meio e fim.",
    price: 5490,
    image: productImage("quebra-cabeca-rotinas.webp"),
    emoji: "🗓️",
    category: "Comunicação",
    goal: "Rotina e previsibilidade",
    stock: 18,
    ageRange: "A partir de 4 anos",
    benefits: ["Previsibilidade", "Sequenciamento", "Comunicação visual", "Participação na rotina"],
    included: ["Cartões visuais de rotina", "Base para organizar sequências", "Sugestões de atividades"],
    howToUse: [
      "Escolha apenas duas ou três etapas no início.",
      "Monte a sequência junto com a criança.",
      "Retire ou vire cada cartão após a atividade.",
      "Avise mudanças com antecedência sempre que possível.",
    ],
    audience: ["Crianças que compreendem melhor por imagens", "Famílias que buscam previsibilidade", "Atividades de sequenciamento"],
    notFor: ["Transformar a rotina em cobrança rígida", "Usar imagens sem ensinar o significado", "Prometer eliminação de crises"],
    faq: [
      {
        question: "Funciona para crianças não oralizadas?",
        answer: "Pode ser útil como apoio visual, desde que as imagens sejam ensinadas e tenham significado para aquela criança.",
      },
      ...commonFaq,
    ],
    bestSeller: true,
    badge: "Apoio visual",
  },
  {
    id: "prod_006",
    slug: "pop-it-arco-iris",
    name: "Pop It Arco-Íris",
    hook: "Muito além de apertar bolhas: conte, imite sequências e alterne turnos.",
    description:
      "Brinquedo de silicone lavável para jogos rápidos de contagem, coordenação bilateral, imitação e brincadeira em turnos.",
    price: 2990,
    image: productImage("pop-it-arco-iris.webp"),
    emoji: "🌈",
    category: "Fidget",
    goal: "Turnos e coordenação",
    stock: 60,
    ageRange: "A partir de 3 anos",
    benefits: ["Coordenação bilateral", "Contagem", "Imitação", "Treino de turnos"],
    included: ["1 Pop It de silicone", "Sugestões simples de jogos"],
    howToUse: [
      "Comece permitindo exploração livre.",
      "Depois, proponha apertar uma fileira de cada vez.",
      "Crie sequências curtas para a criança imitar.",
      "Alterne uma jogada do adulto e uma da criança.",
    ],
    audience: ["Crianças que gostam de repetição", "Jogos rápidos em família", "Atividades de contagem"],
    notFor: ["Usar apenas como recompensa", "Retirar abruptamente durante autorregulação", "Uso sem supervisão"],
    faq: [
      {
        question: "Como transformar em atividade?",
        answer: "Use comandos simples, contagem, imitação de padrões e alternância de turnos, sempre mantendo espaço para exploração livre.",
      },
      ...commonFaq,
    ],
    badge: "Entrada acessível",
  },
];

export const activeProducts = products.filter((product) => product.active !== false);
export const categories = ["Todos", ...Array.from(new Set(activeProducts.map((product) => product.category)))];
export const goals = ["Todos", ...Array.from(new Set(activeProducts.map((product) => product.goal)))];

export function getProductByIdentifier(identifier: string) {
  return activeProducts.find(
    (product) => product.id === identifier || product.slug === identifier,
  );
}

export function getRelatedProducts(product: Product, limit = 3) {
  return activeProducts
    .filter((candidate) => candidate.id !== product.id)
    .sort((a, b) => {
      const aScore = Number(a.category === product.category) + Number(a.goal === product.goal);
      const bScore = Number(b.category === product.category) + Number(b.goal === product.goal);
      return bScore - aScore;
    })
    .slice(0, limit);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price / 100);
}
