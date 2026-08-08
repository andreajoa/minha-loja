import { isStoreManagerManagedProductId } from "@/lib/store-manager-managed";

export function isUnsafeAutomaticPostPurchaseProduct(productId: string | null | undefined) {
  return isStoreManagerManagedProductId(productId);
}
