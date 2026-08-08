import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getResendWebhookSecret, storeResendEmailEvent } from "@/lib/email-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return NextResponse.json({ received: false }, { status: 503 });

  const secret = await getResendWebhookSecret();
  if (!secret) return NextResponse.json({ received: false }, { status: 503 });

  const payload = await req.text();
  const svixId = req.headers.get("svix-id") || "";
  const timestamp = req.headers.get("svix-timestamp") || "";
  const signature = req.headers.get("svix-signature") || "";
  if (!svixId || !timestamp || !signature) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    const resend = new Resend(key) as unknown as {
      webhooks: {
        verify: (input: {
          payload: string;
          headers: { id: string; timestamp: string; signature: string };
          webhookSecret: string;
        }) => Promise<any> | any;
      };
    };
    const event = await resend.webhooks.verify({
      payload,
      headers: { id: svixId, timestamp, signature },
      webhookSecret: secret,
    });
    await storeResendEmailEvent(svixId, event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Resend webhook rejected:", error);
    return NextResponse.json({ received: false }, { status: 400 });
  }
}
