import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "brq-admin-session";
const TOKEN_TTL = 60 * 60 * 24 * 7; // 7 dias

function getSecret(): string {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) throw new Error("DASHBOARD_PASSWORD não configurado.");
  return password;
}

export function generateToken(): string {
  const secret = getSecret();
  const expiry = Math.floor(Date.now() / 1000) + TOKEN_TTL;
  const payload = `admin:${expiry}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

export function verifyToken(token: string): boolean {
  try {
    const secret = getSecret();
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    const [role, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;
    const expected = createHmac("sha256", secret).update(`${role}:${expiryStr}`).digest("hex");
    return signature === expected;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export { COOKIE_NAME, TOKEN_TTL };
