export const NEWSLETTER_COUPON_CODE = "BEMVINDO5";
export const NEWSLETTER_COUPON_PERCENT = 5;
export const COUPON_STORAGE_KEY = "brinqueteando_coupon";

export function normalizeCouponCode(value?: string | null) {
  return (value || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function isNewsletterCoupon(value?: string | null) {
  return normalizeCouponCode(value) === NEWSLETTER_COUPON_CODE;
}
