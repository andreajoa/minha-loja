import { products, type Product } from "@/data/products";
import {
  isNewsletterCoupon,
  NEWSLETTER_COUPON_CODE,
  NEWSLETTER_COUPON_PERCENT,
  normalizeCouponCode,
} from "@/lib/coupons";

export type CartLine = {
  id: string;
  quantity: number;
  variantId?: string;
};

export type DiscountTier = {
  minimum: number;
  percent: number;
  label: string;
};

export type DiscountSource = "progressive" | "coupon" | "none";

export const DISCOUNT_TIERS: DiscountTier[] = [
  { minimum: 0, percent: 0, label: "Preço normal" },
  { minimum: 10_000, percent: 5, label: "5% de desconto" },
  { minimum: 15_000, percent: 10, label: "10% de desconto" },
  { minimum: 20_000, percent: 13, label: "13% de desconto" },
  { minimum: 30_000, percent: 15, label: "15% de desconto" },
  { minimum: 40_000, percent: 18, label: "18% de desconto" },
  { minimum: 50_000, percent: 20, label: "20% de desconto" },
];

export function variantIdFor(
  product: Product,
  variant: NonNullable<Product["variants"]>[number],
) {
  const sourceSkuId = variant.sourceSkuId?.trim();
  if (sourceSkuId) return `sku-${sourceSkuId}`;
  const index = product.variants?.indexOf(variant) ?? -1;
  return `variant-${Math.max(0, index)}`;
}

export function resolveCartLine(line: CartLine) {
  if (!line || typeof line.id !== "string") throw new Error("Produto inválido.");
  const quantity = Number(line.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error("Quantidade inválida.");
  }

  const product = products.find((candidate) => candidate.id === line.id);
  if (!product) throw new Error("Produto não encontrado.");

  const variants = product.variants || [];
  let variant: NonNullable<Product["variants"]>[number] | null = null;
  if (variants.length > 0) {
    variant =
      variants.find((candidate) => variantIdFor(product, candidate) === line.variantId) ||
      variants.find((candidate) => candidate.stock > 0) ||
      null;
    if (!variant) throw new Error(`Nenhuma variante disponível para ${product.name}.`);
  }

  const variantId = variant ? variantIdFor(product, variant) : undefined;
  const unitPrice = variant ? variant.price : product.price;
  const availableStock = variant ? variant.stock : product.stock;
  if (availableStock <= 0 || quantity > availableStock) {
    throw new Error(
      `Estoque insuficiente para ${product.name}${variant ? ` · ${variant.name}` : ""}.`,
    );
  }

  return { product, variant, variantId, unitPrice, availableStock, quantity };
}

export function normalizeCart(lines: CartLine[]) {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 20) {
    throw new Error("Carrinho inválido.");
  }

  const merged = new Map<string, CartLine>();
  for (const rawLine of lines) {
    const resolved = resolveCartLine(rawLine);
    const key = `${resolved.product.id}::${resolved.variantId || "base"}`;
    const current = merged.get(key);
    const quantity = Math.min(10, (current?.quantity || 0) + resolved.quantity);
    merged.set(key, {
      id: resolved.product.id,
      quantity,
      ...(resolved.variantId ? { variantId: resolved.variantId } : {}),
    });
  }
  return Array.from(merged.values()).map(resolveCartLine);
}

export function getCartSubtotal(lines: CartLine[]) {
  return normalizeCart(lines).reduce(
    (total, line) => total + line.unitPrice * line.quantity,
    0,
  );
}

export function getDiscountTier(subtotal: number) {
  return [...DISCOUNT_TIERS].reverse().find((tier) => subtotal >= tier.minimum) || DISCOUNT_TIERS[0];
}

export function getNextDiscountTier(subtotal: number) {
  return DISCOUNT_TIERS.find((tier) => tier.minimum > subtotal) || null;
}

export function calculateDiscount(subtotal: number, couponCode?: string | null) {
  const progressiveTier = getDiscountTier(subtotal);
  const normalizedCoupon = normalizeCouponCode(couponCode);
  const couponValid = isNewsletterCoupon(normalizedCoupon);
  const couponApplied = couponValid && NEWSLETTER_COUPON_PERCENT >= progressiveTier.percent;
  const tier: DiscountTier = couponApplied
    ? { minimum: 0, percent: NEWSLETTER_COUPON_PERCENT, label: `Cupom ${NEWSLETTER_COUPON_CODE}` }
    : progressiveTier;
  const amount = Math.round((subtotal * tier.percent) / 100);
  const source: DiscountSource = tier.percent === 0 ? "none" : couponApplied ? "coupon" : "progressive";
  return {
    tier,
    amount,
    totalAfterDiscount: Math.max(0, subtotal - amount),
    source,
    coupon: { code: normalizedCoupon, valid: couponValid, applied: couponApplied },
  };
}

export function getDiscountProgress(subtotal: number) {
  const current = getDiscountTier(subtotal);
  const next = getNextDiscountTier(subtotal);
  if (!next) {
    return { current, next: null, missing: 0, progress: 100, message: "Você alcançou o maior desconto disponível." };
  }
  const previousMinimum = current.minimum;
  const range = Math.max(1, next.minimum - previousMinimum);
  const progress = Math.min(100, Math.max(0, ((subtotal - previousMinimum) / range) * 100));
  const missing = Math.max(0, next.minimum - subtotal);
  return { current, next, missing, progress, message: `Faltam ${formatMoney(missing)} para liberar ${next.percent}% de desconto.` };
}

export function applyPercentDiscount(amount: number, percent: number) {
  return Math.max(50, Math.round(amount * (1 - percent / 100)));
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount / 100);
}

function notInCart(cartIds: Set<string>) {
  return products.filter((product) => product.stock > 0 && !cartIds.has(product.id));
}

export function getOrderBump(lines: CartLine[]) {
  const cartIds = new Set(lines.map((line) => line.id));
  return notInCart(cartIds).filter((product) => product.price <= 7_000).sort((a, b) => a.price - b.price)[0] || null;
}

export function getUpsell(lines: CartLine[]) {
  const normalized = normalizeCart(lines);
  const cartIds = new Set(normalized.map((line) => line.product.id));
  const highestPrice = Math.max(...normalized.map((line) => line.unitPrice));
  return notInCart(cartIds).filter((product) => product.price > highestPrice).sort((a, b) => a.price - b.price)[0] || null;
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
  const weightGrams = quantityExpanded.reduce((total, product) => total + product.shipping.weightGrams, 0);
  const lengthCm = Math.max(16, ...quantityExpanded.map((product) => product.shipping.lengthCm));
  const widthCm = Math.max(11, ...quantityExpanded.map((product) => product.shipping.widthCm));
  const heightCm = Math.min(
    100,
    Math.max(2, quantityExpanded.reduce((total, product) => total + product.shipping.heightCm, 0)),
  );
  return { weightGrams: Math.max(1, weightGrams), lengthCm, widthCm, heightCm };
}

export function serializeCart(lines: CartLine[]) {
  return normalizeCart(lines)
    .map(({ product, variantId, quantity }) => {
      const variantPart = variantId ? `~${encodeURIComponent(variantId)}` : "";
      return `${product.id}${variantPart}:${quantity}`;
    })
    .join(",")
    .slice(0, 500);
}

export function parseSerializedCart(value?: string | null): CartLine[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => {
      const colon = entry.lastIndexOf(":");
      if (colon <= 0) return null;
      const identity = entry.slice(0, colon);
      const quantity = Number(entry.slice(colon + 1));
      const tilde = identity.indexOf("~");
      const id = tilde >= 0 ? identity.slice(0, tilde) : identity;
      const variantId = tilde >= 0 ? decodeURIComponent(identity.slice(tilde + 1)) : undefined;
      return { id, quantity, ...(variantId ? { variantId } : {}) };
    })
    .filter(
      (line): line is CartLine =>
        Boolean(line && typeof line.id === "string" && line.id.length > 0 && Number.isInteger(line.quantity) && line.quantity > 0),
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
