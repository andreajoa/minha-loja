import { NextResponse } from "next/server";
import { Resend } from "resend";
import { NEWSLETTER_COUPON_CODE } from "@/lib/coupons";
import { createMarketingToken } from "@/lib/marketing-token";

export const runtime = "nodejs";

type NewsletterPayload = {
  email?: unknown;
  whatsapp?: unknown;
  source?: unknown;
  consent?: unknown;
  website?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORE_EMAIL = "info@brinqueteando.online";
const SENDER = "BrinqueTEAndo <newsletter@send.brinqueteando.online>";

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as NewsletterPayload;
    const email = clean(payload.email, 160).toLowerCase();
    const whatsapp = clean(payload.whatsapp, 24);
    const source = payload.source === "popup" ? "popup" : "footer";
    const consent = payload.consent === true;
    const honeypot = clean(payload.website, 120);

    if (honeypot) return NextResponse.json({ ok: true });

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Confirme que deseja receber nossas novidades." },
        { status: 400 },
      );
    }

    if (source === "popup") {
      const digits = whatsapp.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13) {
        return NextResponse.json(
          { error: "Informe um WhatsApp válido com DDD." },
          { status: 400 },
        );
      }
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "O serviço de inscrição está temporariamente indisponível." },
        { status: 503 },
      );
    }

    const resend = new Resend(apiKey);
    let contactSaved = false;
    let confirmationSent = false;
    let storeNotificationSent = false;
    let automationTriggered = false;

    try {
      const created = await resend.contacts.create({ email, unsubscribed: false });
      if (!created.error) {
        contactSaved = true;
      } else {
        const updated = await resend.contacts.update({ email, unsubscribed: false });
        contactSaved = !updated.error;
        if (updated.error) console.error("Resend Contacts:", updated.error);
      }
    } catch (error) {
      console.error("Resend Contacts exception:", error);
    }

    const couponBlock = source === "popup"
      ? `<div style="margin:24px 0;padding:20px;border-radius:16px;background:#F2E6DE;text-align:center"><p style="margin:0 0 8px;font-size:13px;color:#A64B2A;font-weight:700;text-transform:uppercase;letter-spacing:.12em">Seu cupom de boas-vindas</p><p style="margin:0;font-size:30px;color:#09274B;font-weight:900;letter-spacing:.08em">${NEWSLETTER_COUPON_CODE}</p><p style="margin:10px 0 0;font-size:14px;color:#435367">Use no carrinho para receber 5% de desconto. Se houver desconto progressivo maior, aplicamos automaticamente a melhor condição.</p></div>`
      : "";

    try {
      const result = await resend.emails.send({
        from: SENDER,
        to: [email],
        replyTo: STORE_EMAIL,
        subject: source === "popup"
          ? "Seu cupom de 5% chegou | BrinqueTEAndo"
          : "Que alegria ter você por aqui | BrinqueTEAndo",
        html: `<div style="background:#FFF8F3;padding:32px 16px;font-family:Arial,sans-serif;color:#435367"><div style="max-width:620px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #D9CBC1"><div style="background:#09274B;padding:28px;text-align:center;color:#fff"><div style="font-size:30px;font-weight:800">BrinqueTEAndo</div></div><div style="padding:32px"><h1 style="margin:0 0 16px;color:#09274B;font-size:27px">Sua inscrição foi confirmada!</h1><p style="font-size:16px;line-height:1.75">É uma honra saber que você quer receber nossas promoções, cupons de desconto, novidades e conteúdos preparados com propósito.</p>${couponBlock}<p style="margin-top:24px;font-size:14px;line-height:1.7">A sequência de conteúdos começa em 3 dias. Se precisar falar conosco, responda este e-mail.</p></div></div></div>`,
      });
      confirmationSent = !result.error;
      if (result.error) console.error("Resend confirmation:", result.error);
    } catch (error) {
      console.error("Resend confirmation exception:", error);
    }

    try {
      const result = await resend.emails.send({
        from: SENDER,
        to: [STORE_EMAIL],
        replyTo: email,
        subject: `Nova inscrição na newsletter | ${source === "popup" ? "Cupom 5%" : "Rodapé"}`,
        html: `<div style="font-family:Arial,sans-serif;color:#24364A;padding:24px"><h1 style="color:#09274B">Nova inscrição BrinqueTEAndo</h1><p><strong>E-mail:</strong> ${escapeHtml(email)}</p><p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp || "Não informado")}</p><p><strong>Origem:</strong> ${source === "popup" ? "Pop-up do cupom de 5%" : "Formulário do rodapé"}</p><p><strong>Consentimento:</strong> confirmado</p></div>`,
      });
      storeNotificationSent = !result.error;
      if (result.error) console.error("Resend store notification:", result.error);
    } catch (error) {
      console.error("Resend store notification exception:", error);
    }

    try {
      const result = await resend.events.send({
        event: "newsletter.subscribed",
        email,
        payload: {
          source,
          couponCode: source === "popup" ? NEWSLETTER_COUPON_CODE : "",
          whatsapp: whatsapp || "",
        },
      });
      automationTriggered = !result.error;
      if (result.error) console.error("Resend newsletter event:", result.error);
    } catch (error) {
      console.error("Resend newsletter event exception:", error);
    }

    const captured = contactSaved || confirmationSent || storeNotificationSent;
    if (!captured) {
      return NextResponse.json(
        {
          error:
            "O serviço de e-mail ainda está recusando o envio. Verifique no Resend se send.brinqueteando.online aparece como Verified.",
        },
        { status: 502 },
      );
    }

    const marketingToken = createMarketingToken(email);
    const response = NextResponse.json({
      ok: true,
      couponCode: source === "popup" ? NEWSLETTER_COUPON_CODE : undefined,
      emailSent: confirmationSent,
      contactSaved,
      ownerNotificationSent: storeNotificationSent,
      automationTriggered,
      message: confirmationSent
        ? "Sua inscrição foi confirmada. É uma honra saber que você quer receber promoções, cupons de desconto e muito mais em nossa newsletter!"
        : "Seu cadastro foi recebido e seu benefício está liberado. Anote o cupom exibido nesta tela.",
    });

    if (marketingToken) {
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
      };
      response.cookies.set("bt_marketing_email", email, cookieOptions);
      response.cookies.set("bt_marketing_token", marketingToken, cookieOptions);
    }

    return response;
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir sua inscrição agora." },
      { status: 500 },
    );
  }
}
