import { isStoreManagerManagedProductId } from "@/lib/store-manager-managed";

// Managed products must stay inside the reservation + order.paid pipeline.
// The legacy post-purchase PaymentIntent flow is intentionally excluded.
export function isUnsafeAutomaticPostPurchaseProduct(productId: string | null | undefined) {
  return isStoreManagerManagedProductId(productId);
}
