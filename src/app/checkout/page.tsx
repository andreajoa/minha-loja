import type { Metadata } from "next";
import EmbeddedCheckoutExperience from "@/components/EmbeddedCheckoutExperience";

export const metadata: Metadata = {
  title: "Pagamento seguro",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    cep?: string;
    shipping?: string;
    coupon?: string;
  }>;
}) {
  const { cep = "", shipping = "", coupon = "" } = await searchParams;
  return (
    <EmbeddedCheckoutExperience
      cep={cep}
      shippingId={shipping}
      couponCode={coupon}
    />
  );
}
