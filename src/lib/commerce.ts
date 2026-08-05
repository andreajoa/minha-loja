import { products, type Product } from "@/data/products";

export type CartLine = {
  id: string;
  quantity: number;
};

export type DiscountTier = {
  minimum: number;
  percent: number;
  label: string;
};

export const DISCOUNT_TIERS: DiscountTier[] = [
  { minimum: 0, percent: 0, label: "Preço normal" },
  { minimum: 10_000, percent: 5, label: "5% de desconto" },
  { minimum: 15_000, percent: 10, label: "10% de desconto" },
  { minimum: 20_000, percent: 13, label: "13% de desconto" },
  { minimum: 30_000, percent: 15, label: "15% de desconto" },
  { minimum: 40_000, percent: 18, label: "18% de desconto" },
  { minimum: 50_000, percent: 20, label: "20% de desconto" },
];

export function normalizeCart(lines: CartLine[]) {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 20) {
    throw new Error("Carrinho inválido.");
  }

  const merged = new Map<string, number>();

  for (const line of lines) {
    if (!line || typeof line.id !== "string") throw new Error("Produto inválido.");
    const quantity = Number(line.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error("Quantidade inválida.");
    }
    merged.set(line.id, Math.min(10, (merged.get(line.id) || 0) + quantity));
  }

  return Array.from(merged.entries()).map(([id, quantity]) => {
    const product = products.find((candidate) => candidate.id === id);
    if (!product) throw new Error("Produto não encontrado.");
    if (product.stock <= 0 || quantity > product.stock) {
      throw new Error(`Estoque insuficiente para ${product.name}.`);
    }
    return { product, quantity };
  });
}

export function getCartSubtotal(lines: CartLine[]) {
  return normalizeCart(lines).reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );
}

export function getDiscountTier(subtotal: number) {
  return [...DISCOUNT_TIERS]
    .reverse()
    .find((tier) => subtotal >= tier.minimum) || DISCOUNT_TIERS[0];
}

export function getNextDiscountTier(subtotal: number) {
  return DISCOUNT_TIERS.find((tier) => tier.minimum > subtotal) || null;
}

export function calculateDiscount(subtotal: number) {
  const tier = getDiscountTier(subtotal);
  const amount = Math.round((subtotal * tier.percent) / 100);
  return {
    tier,
    amount,
    totalAfterDiscount: Math.max(0, subtotal - amount),
  };
}

export function getDiscountProgress(subtotal: number) {
  const current = getDiscountTier(subtotal);
  const next = getNextDiscountTier(subtotal);

  if (!next) {
    return {
      current,
      next: null,
      missing: 0,
      progress: 100,
      message: "Você alcançou o maior desconto disponível.",
    };
  }

  const previousMinimum = current.minimum;
  const range = Math.max(1, next.minimum - previousMinimum);
  const progress = Math.min(
    100,
    Math.max(0, ((subtotal - previousMinimum) / range) * 100),
  );
  const missing = Math.max(0, next.minimum - subtotal);

  return {
    current,
    next,
    missing,
    progress,
    message: `Faltam ${formatMoney(missing)} para liberar ${next.percent}% de desconto.`,
  };
}

export function applyPercentDiscount(amount: number, percent: number) {
  return Math.max(50, Math.round(amount * (1 - percent / 100)));
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100);
}

function notInCart(cartIds: Set<string>) {
  return products.filter((product) => product.stock > 0 && !cartIds.has(product.id));
}

export function getOrderBump(lines: CartLine[]) {
  const cartIds = new Set(lines.map((line) => line.id));
  return notInCart(cartIds)
    .filter((product) => product.price <= 7_000)
    .sort((a, b) => a.price - b.price)[0] || null;
}

export function getUpsell(lines: CartLine[]) {
  const normalized = normalizeCart(lines);
  const cartIds = new Set(normalized.map((line) => line.product.id));
  const highestPrice = Math.max(...normalized.map((line) => line.product.price));

  return notInCart(cartIds)
    .filter((product) => product.price > highestPrice)
    .sort((a, b) => a.price - b.price)[0] || null;
}

export function getDownsell(lines: CartLine[]) {
  const cartIds = new Set(lines.map((line) => line.id));
  return notInCart(cartIds).sort((a, b) => a.price - b.price)[0] || null;
}

export function getCrossSell(lines: CartLine[], limit = 3) {
  const normalized = normalizeCart(lines);
  const cartIds = new Set(normalized.map((line) => line.product.id));
  const cartCategories = new Set(normalized.map((line) => line.product.category));

  return notInCart(cartIds)
    .sort((a, b) => {
      const aComplement = cartCategories.has(a.category) ? 1 : 0;
      const bComplement = cartCategories.has(b.category) ? 1 : 0;
      if (aComplement !== bComplement) return aComplement - bComplement;
      return a.price - b.price;
    })
    .slice(0, limit);
}

export function getPostPurchaseRecommendations(purchasedIds: string[], limit = 4) {
  const purchased = new Set(purchasedIds);
  return products
    .filter((product) => product.stock > 0 && !purchased.has(product.id))
    .sort((a, b) => a.price - b.price)
    .slice(0, limit);
}

export function getPackageMetrics(lines: CartLine[]) {
  const normalized = normalizeCart(lines);
  const quantityExpanded = normalized.flatMap(({ product, quantity }) =>
    Array.from({ length: quantity }, () => product),
  );

  const weightGrams = quantityExpanded.reduce(
    (total, product) => total + product.shipping.weightGrams,
    0,
  );
  const lengthCm = Math.max(16, ...quantityExpanded.map((product) => product.shipping.lengthCm));
  const widthCm = Math.max(11, ...quantityExpanded.map((product) => product.shipping.widthCm));
  const heightCm = Math.min(
    100,
    Math.max(2, quantityExpanded.reduce((total, product) => total + product.shipping.heightCm, 0)),
  );

  return {
    weightGrams: Math.max(1, weightGrams),
    lengthCm,
    widthCm,
    heightCm,
  };
}

export function serializeCart(lines: CartLine[]) {
  return normalizeCart(lines)
    .map(({ product, quantity }) => `${product.id}:${quantity}`)
    .join(",")
    .slice(0, 500);
}

export function parseSerializedCart(value?: string | null): CartLine[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => {
      const [id, quantity] = entry.split(":");
      return { id, quantity: Number(quantity) };
    })
    .filter(
      (line) =>
        typeof line.id === "string" &&
        line.id.length > 0 &&
        Number.isInteger(line.quantity) &&
        line.quantity > 0,
    );
}

export function productPreview(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    emoji: product.emoji,
    category: product.category,
  };
}
