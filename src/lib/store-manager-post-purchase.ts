import managedCatalog from "@/data/store-manager-products.json";

type ManagedProduct = {
  id?: unknown;
  variants?: unknown;
};

type ManagedCatalog = {
  products?: ManagedProduct[];
};

const catalog = managedCatalog as ManagedCatalog;
const products = Array.isArray(catalog.products) ? catalog.products : [];
const managedVariantProductIds = new Set(
  products.flatMap((product) => {
    if (typeof product.id !== "string" || !product.id.trim()) return [];
    return Array.isArray(product.variants) && product.variants.length > 0 ? [product.id] : [];
  }),
);

export function isUnsafeAutomaticPostPurchaseProduct(productId: string | null | undefined) {
  return typeof productId === "string" && managedVariantProductIds.has(productId);
}
