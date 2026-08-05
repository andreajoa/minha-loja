export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // centavos
  image: string;
  category: string;
  stock: number;
};

export const products: Product[] = [
  { id: "prod_001", name: "Cubo Sensorial Fidget", description: "Seis lados com texturas e botoes para foco e alivio de ansiedade.", price: 4990, image: "/products/cubo.jpg", category: "Fidget", stock: 30 },
  { id: "prod_002", name: "Colete de Compressao Infantil", description: "Pressao profunda que acalma e organiza o corpo. Tecido macio.", price: 15990, image: "/products/colete.jpg", category: "Sensorial", stock: 15 },
  { id: "prod_003", name: "Blocos de Encaixe Coloridos", description: "Estimula coordenacao motora e sequenciamento logico.", price: 8990, image: "/products/blocos.jpg", category: "Motor", stock: 40 },
  { id: "prod_004", name: "Almofada de Texturas", description: "Sete superficies diferentes para exploracao tatil segura.", price: 6990, image: "/products/almofada.jpg", category: "Sensorial", stock: 22 },
  { id: "prod_005", name: "Quebra-Cabeca de Rotinas", description: "Cartoes visuais para estruturar a rotina do dia com previsibilidade.", price: 5490, image: "/products/rotina.jpg", category: "Comunicacao", stock: 18 },
  { id: "prod_006", name: "Pop It Arco-Iris", description: "Estourar bolhas de silicone para regulacao e concentracao.", price: 2990, image: "/products/popit.jpg", category: "Fidget", stock: 60 },
];

export const categories = ["Todos", "Fidget", "Sensorial", "Motor", "Comunicacao"];
