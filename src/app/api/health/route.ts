import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "brinqueteando",
    basePath: "/brinqueteando",
    integrations: {
      clerk: Boolean(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
      ),
      stripe: Boolean(
        process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
      ),
      resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
      cloudflareR2: Boolean(
        process.env.CLOUDFLARE_API_TOKEN &&
          process.env.R2_ACCOUNT_ID &&
          process.env.R2_BUCKET_NAME &&
          process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL,
      ),
    },
    timestamp: new Date().toISOString(),
  });
}
