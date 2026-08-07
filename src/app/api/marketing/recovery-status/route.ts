import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyMarketingToken } from "@/lib/marketing-token";

export const runtime = "nodejs";

export async function GET() {
  const store = await cookies();
  const email = store.get("bt_marketing_email")?.value || "";
  const token = store.get("bt_marketing_token")?.value || "";
  return NextResponse.json({ eligible: Boolean(email && verifyMarketingToken(token, email)) });
}
