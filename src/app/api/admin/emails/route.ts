import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: "Resend não configurado." }, { status: 503 });
  }

  const resend = new Resend(resendApiKey);
  const { data, error } = await resend.emails.list();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  const emails = (data?.data || []).map((email: Record<string, unknown>) => ({
    id: String(email.id || ""),
    to: email.to as string[],
    subject: String(email.subject || ""),
    status: String(email.last_event || ""),
    createdAt: String(email.created_at || ""),
  }));

  const totalSent = emails.length;
  const delivered = emails.filter((e) => e.status === "delivered").length;
  const opened = emails.filter((e) => e.status === "opened").length;
  const clicked = emails.filter((e) => e.status === "clicked").length;
  const bounced = emails.filter((e) => e.status === "bounced").length;

  return NextResponse.json({
    summary: { totalSent, delivered, opened, clicked, bounced },
    emails: emails.slice(0, 50),
  });
}
