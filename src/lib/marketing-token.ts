import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  return (
    process.env.MARKETING_TOKEN_SECRET ||
    process.env.RESEND_API_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    ""
  );
}

export function createMarketingToken(email: string) {
  const key = secret();
  if (!key) return "";
  const normalized = email.trim().toLowerCase();
  const timestamp = Date.now().toString();
  const encodedEmail = encodeURIComponent(normalized);
  const payload = `${encodedEmail}.${timestamp}`;
  const signature = createHmac("sha256", key).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyMarketingToken(token: string, email: string) {
  const key = secret();
  if (!key || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [encodedEmail, timestamp, signature] = parts;
  const normalized = email.trim().toLowerCase();
  let tokenEmail = "";
  try {
    tokenEmail = decodeURIComponent(encodedEmail).toLowerCase();
  } catch {
    return false;
  }
  if (tokenEmail !== normalized) return false;
  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt)) return false;
  const maxAge = 365 * 24 * 60 * 60 * 1000;
  if (Date.now() - issuedAt > maxAge || issuedAt > Date.now() + 60_000) return false;
  const payload = `${encodedEmail}.${timestamp}`;
  const expected = createHmac("sha256", key).update(payload).digest("hex");
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
