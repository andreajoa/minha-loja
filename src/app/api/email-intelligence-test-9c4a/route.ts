import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return NextResponse.json({ ok: false, error: "RESEND_API_KEY ausente" }, { status: 503 });
  const resend = new Resend(key);
  const result = await resend.emails.send({
    from: "BrinqueTEAndo <newsletter@send.brinqueteando.online>",
    to: "andremuseu@gmail.com",
    replyTo: "info@brinqueteando.online",
    subject: "Teste do BrinqueTEAndo Intelligence",
    html: `<!doctype html><html><body style="margin:0;background:#FFF8F3;font-family:Arial,sans-serif;color:#09274B"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:620px;background:white;border-radius:24px;overflow:hidden"><tr><td style="background:#09274B;color:white;padding:28px"><div style="font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#DFA486">BrinqueTEAndo Intelligence</div><h1 style="margin:10px 0 0;font-size:30px;line-height:1.1">Tracking de e-mail em validação</h1></td></tr><tr><td style="padding:30px"><p style="font-size:16px;line-height:1.7;margin:0 0 20px">Este é um teste real do sistema de inteligência de e-mails da BrinqueTEAndo.</p><p style="font-size:16px;line-height:1.7;margin:0 0 24px">Abra esta mensagem e clique no botão abaixo para validarmos abertura, clique e atribuição no painel.</p><a href="https://www.brinqueteando.online/?utm_source=email&utm_medium=test&utm_campaign=email-intelligence" style="display:inline-block;background:#A64B2A;color:white;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700">Abrir a BrinqueTEAndo</a></td></tr></table></td></tr></table></body></html>`,
    tags: [
      { name: "flow", value: "email-intelligence-test" },
      { name: "source", value: "dashboard-validation" },
    ],
  });
  if (result.error) return NextResponse.json({ ok: false, error: result.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, emailId: result.data?.id || "" });
}
