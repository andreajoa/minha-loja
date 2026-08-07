import { NextResponse } from "next/server";
import { Resend } from "resend";
import { NEWSLETTER_COUPON_CODE } from "@/lib/coupons";

export const runtime = "nodejs";

type NewsletterPayload = {
  email?: unknown;
  whatsapp?: unknown;
  source?: unknown;
  consent?: unknown;
  website?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      return NextResponse.json(
        { error: "Informe um e-mail válido." },
        { status: 400 },
      );
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

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "A inscrição está temporariamente indisponível." },
        { status: 503 },
      );
    }

    const from =
      process.env.RESEND_FROM_EMAIL ||
      "BrinqueTEAndo <info@brinqueteando.online>";
    const ownerEmail =
      process.env.ORDER_NOTIFICATION_EMAIL ||
      process.env.RESEND_REPLY_TO_EMAIL ||
      "info@brinqueteando.online";
    const resend = new Resend(resendApiKey);

    let contactSaved = false;
    let ownerNotificationSent = false;
    let confirmationEmailSent = false;

    try {
      const { error: createContactError } = await resend.contacts.create({
        email,
        unsubscribed: false,
      });

      if (!createContactError) {
        contactSaved = true;
      } else {
        const { error: updateContactError } = await resend.contacts.update({
          email,
          unsubscribed: false,
        });

        if (!updateContactError) {
          contactSaved = true;
        } else {
          console.error("Contato não salvo no Resend:", {
            createContactError,
            updateContactError,
          });
        }
      }
    } catch (contactError) {
      console.error("Exceção ao salvar contato no Resend:", contactError);
    }

    const couponBlock =
      source === "popup"
        ? `
          <div style="margin:24px 0;padding:20px;border-radius:16px;background:#F2E6DE;text-align:center">
            <p style="margin:0 0 8px;font-size:13px;color:#A14D2D;font-weight:700;text-transform:uppercase;letter-spacing:.12em">Seu cupom de boas-vindas</p>
            <p style="margin:0;font-size:30px;color:#092647;font-weight:900;letter-spacing:.08em">${NEWSLETTER_COUPON_CODE}</p>
            <p style="margin:10px 0 0;font-size:14px;color:#435367">Use no carrinho para receber 5% de desconto. Quando houver um desconto progressivo maior, a loja mantém automaticamente a melhor condição.</p>
          </div>
        `
        : "";

    try {
      const { error: confirmationError } = await resend.emails.send({
        from,
        to: [email],
        replyTo: ownerEmail,
        subject:
          source === "popup"
            ? "Seu cupom de 5% chegou | BrinqueTEAndo"
            : "Que alegria ter você por aqui | BrinqueTEAndo",
        html: `
          <div style="background:#FDF9F6;padding:32px 16px;font-family:Arial,sans-serif;color:#435367">
            <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #D9CBC1">
              <div style="background:#092647;padding:28px;text-align:center;color:#ffffff">
                <div style="font-size:30px;font-weight:800">BrinqueTEAndo</div>
                <div style="margin-top:8px;color:#F2E6DE">Conteúdo, novidades e benefícios especiais</div>
              </div>
              <div style="padding:32px">
                <h1 style="margin:0 0 16px;color:#092647;font-size:27px">Sua inscrição foi confirmada!</h1>
                <p style="margin:0;font-size:16px;line-height:1.75">É uma honra saber que você quer receber nossas promoções, cupons de desconto, novidades e conteúdos preparados com propósito.</p>
                ${couponBlock}
                <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#68778A">Você poderá deixar de receber nossas mensagens quando desejar. Em caso de dúvida, basta responder este e-mail.</p>
              </div>
              <div style="padding:20px 28px;background:#A14D2D;color:#ffffff;text-align:center;font-size:13px">BrinqueTEAndo · Brincar com propósito</div>
            </div>
          </div>
        `,
      });

      if (!confirmationError) {
        confirmationEmailSent = true;
      } else {
        console.error("Falha no e-mail de confirmação:", confirmationError);
      }
    } catch (confirmationError) {
      console.error("Exceção no e-mail de confirmação:", confirmationError);
    }

    try {
      const { error: ownerNotificationError } = await resend.emails.send({
        from,
        to: [ownerEmail],
        replyTo: email,
        subject: `Nova inscrição na newsletter | ${
          source === "popup" ? "Cupom 5%" : "Rodapé"
        }`,
        html: `
          <div style="font-family:Arial,sans-serif;color:#24364A;padding:24px">
            <h1 style="color:#092647">Nova inscrição BrinqueTEAndo</h1>
            <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
            <p><strong>WhatsApp:</strong> ${escapeHtml(
              whatsapp || "Não informado",
            )}</p>
            <p><strong>Origem:</strong> ${
              source === "popup"
                ? "Pop-up do cupom de 5%"
                : "Formulário do rodapé"
            }</p>
          </div>
        `,
      });

      if (!ownerNotificationError) {
        ownerNotificationSent = true;
      } else {
        console.error("Falha no aviso para a loja:", ownerNotificationError);
      }
    } catch (ownerNotificationError) {
      console.error("Exceção no aviso para a loja:", ownerNotificationError);
    }

    const leadCaptured = contactSaved || ownerNotificationSent;

    if (!leadCaptured) {
      return NextResponse.json(
        {
          error:
            "Não conseguimos registrar seus dados agora. Aguarde alguns instantes e tente novamente.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      couponCode: source === "popup" ? NEWSLETTER_COUPON_CODE : undefined,
      emailSent: confirmationEmailSent,
      contactSaved,
      ownerNotificationSent,
      message: confirmationEmailSent
        ? "Sua inscrição foi confirmada. É uma honra saber que você quer receber promoções, cupons de desconto e muito mais em nossa newsletter!"
        : "Seu cadastro foi recebido e seu benefício está liberado. Anote o cupom exibido nesta tela.",
    });
  } catch (error) {
    console.error("Erro na inscrição da newsletter:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir sua inscrição agora." },
      { status: 500 },
    );
  }
}
