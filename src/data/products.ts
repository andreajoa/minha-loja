export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  emoji: string;
  category: string;
  stock: number;
  ageRange: string;
  benefits: string[];
};

const r2BaseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");

function productImage(fileName: string) {
  return r2BaseUrl ? `${r2BaseUrl}/products/${fileName}` : "";
}

export const products: Product[] = [
  {
    id: "prod_001",
    name: "Cubo Sensorial Fidget",
    description:
      "Seis lados com estímulos táteis e movimentos discretos para ocupar as mãos durante momentos de espera, estudo ou autorregulação.",
    price: 4990,
    image: productImage("cubo-sensorial.webp"),
    emoji: "🎛️",
    category: "Fidget",
    stock: 30,
    ageRange: "A partir de 5 anos",
    benefits: ["Coordenação motora fina", "Apoio à concentração", "Exploração tátil"],
  },
  {
    id: "prod_002",
    name: "Colete de Compressão Infantil",
    description:
      "Colete ajustável de tecido macio. Pode oferecer pressão corporal uniforme quando seu uso é indicado e acompanhado por um profissional.",
    price: 15990,
    image: productImage("colete-compressao.webp"),
    emoji: "🦺",
    category: "Sensorial",
    stock: 15,
    ageRange: "Consulte as medidas",
    benefits: ["Ajuste confortável", "Tecido respirável", "Fechamento regulável"],
  },
  {
    id: "prod_003",
    name: "Blocos de Encaixe Coloridos",
    description:
      "Conjunto de peças grandes para construir, classificar cores, copiar modelos e criar sequências de forma lúdica.",
    price: 8990,
    image: productImage("blocos-encaixe.webp"),
    emoji: "🧱",
    category: "Motor",
    stock: 40,
    ageRange: "A partir de 3 anos",
    benefits: ["Planejamento motor", "Raciocínio espacial", "Criatividade"],
  },
  {
    id: "prod_004",
    name: "Almofada de Texturas",
    description:
      "Superfícies variadas para propostas de exploração tátil, pareamento, nomeação e brincadeiras mediadas.",
    price: 6990,
    image: productImage("almofada-texturas.webp"),
    emoji: "🧶",
    category: "Sensorial",
    stock: 22,
    ageRange: "A partir de 3 anos",
    benefits: ["Discriminação tátil", "Vocabulário descritivo", "Brincadeira compartilhada"],
  },
  {
    id: "prod_005",
    name: "Quebra-Cabeça de Rotinas",
    description:
      "Cartões visuais para organizar pequenas sequências do dia e conversar sobre começo, meio e fim das atividades.",
    price: 5490,
    image: productImage("quebra-cabeca-rotinas.webp"),
    emoji: "🗓️",
    category: "Comunicação",
    stock: 18,
    ageRange: "A partir de 4 anos",
    benefits: ["Previsibilidade", "Sequenciamento", "Comunicação visual"],
  },
  {
    id: "prod_006",
    name: "Pop It Arco-Íris",
    description:
      "Brinquedo de silicone lavável para apertar, contar, alternar turnos e criar jogos rápidos em casa ou no atendimento.",
    price: 2990,
    image: productImage("pop-it-arco-iris.webp"),
    emoji: "🌈",
    category: "Fidget",
    stock: 60,
    ageRange: "A partir de 3 anos",
    benefits: ["Coordenação bilateral", "Contagem", "Treino de turnos"],
  },
];

export const categories = ["Todos", ...Array.from(new Set(products.map((product) => product.category)))];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price / 100);
}
