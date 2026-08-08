import managedCatalog from "@/data/store-manager-products.json";

type ManagedCatalogShape = {
  version?: unknown;
  products?: Array<{ id?: unknown }>;
};

const catalog = managedCatalog as ManagedCatalogShape;
const managedProductIds = new Set(
  Array.isArray(catalog.products)
    ? catalog.products.flatMap((product) =>
        typeof product?.id === "string" && product.id.trim() ? [product.id] : [],
      )
    : [],
);

export function isStoreManagerManagedProductId(productId: string | null | undefined) {
  return typeof productId === "string" && managedProductIds.has(productId);
}

export function storeManagerManagedProductIds() {
  return [...managedProductIds];
}
