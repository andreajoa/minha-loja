export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // em centavos
  image: string;
  stock: number;
};

export const products: Product[] = [
  {
    id: "prod_001",
    name: "Camiseta Preta",
    description: "Algodão premium, corte reto.",
    price: 7990,
    image: "/products/camiseta.jpg",
    stock: 25,
  },
  {
    id: "prod_002",
    name: "Boné Bordado",
    description: "Ajuste snapback, aba curva.",
    price: 4990,
    image: "/products/bone.jpg",
    stock: 40,
  },
];
