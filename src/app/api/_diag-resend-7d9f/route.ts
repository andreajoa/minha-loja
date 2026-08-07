import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeError(error: unknown) {
  if (!error) return null;
  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    return {
      name: typeof record.name === "string" ? record.name : undefined,
      message: typeof record.message === "string" ? record.message : String(error),
      statusCode:
        typeof record.statusCode === "number" || typeof record.statusCode === "string"
          ? record.statusCode
          : undefined,
    };
  }
  return { message: String(error) };
}

function senderDomain(from: string) {
  const match = from.match(/@([^>\s]+)/);
  return match?.[1] || "unknown";
}

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "BrinqueTEAndo <info@brinqueteando.online>";
  const ownerEmail =
    process.env.ORDER_NOTIFICATION_EMAIL ||
    process.env.RESEND_REPLY_TO_EMAIL ||
    "info@brinqueteando.online";

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      apiKeyPresent: false,
      senderDomain: senderDomain(from),
      ownerEmail,
    });
  }

  const resend = new Resend(apiKey.trim());
  const result: Record<string, unknown> = {
    apiKeyPresent: true,
    apiKeyLooksValid: apiKey.trim().startsWith("re_"),
    senderDomain: senderDomain(from),
    ownerEmail,
  };

  try {
    const contact = await resend.contacts.create({
      email: "diagnostico-resend@brinqueteando.online",
      unsubscribed: true,
    });
    result.contacts = {
      ok: !contact.error,
      error: safeError(contact.error),
    };
  } catch (error) {
    result.contacts = { ok: false, error: safeError(error) };
  }

  try {
    const email = await resend.emails.send({
      from,
      to: [ownerEmail],
      subject: "Diagnóstico técnico BrinqueTEAndo",
      html: "<p>Diagnóstico técnico automático do envio de e-mail da BrinqueTEAndo.</p>",
    });
    result.email = {
      ok: !email.error,
      id: email.data?.id || null,
      error: safeError(email.error),
    };
  } catch (error) {
    result.email = { ok: false, error: safeError(error) };
  }

  result.ok =
    Boolean((result.contacts as { ok?: boolean } | undefined)?.ok) ||
    Boolean((result.email as { ok?: boolean } | undefined)?.ok);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
