type EmailButton = {
  label: string;
  href: string;
};

type EmailFrameInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  button?: EmailButton;
  note?: string;
};

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatAmount(amount: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((amount || 0) / 100);
}

function emailFrame({
  preheader,
  eyebrow,
  title,
  intro,
  content,
  button,
  note,
}: EmailFrameInput) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#FDF9F6;font-family:Arial,Helvetica,sans-serif;color:#435367">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FDF9F6">
      <tr>
        <td align="center" style="padding:32px 14px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#FFFFFF;border:1px solid #E4D7D5;border-radius:26px;overflow:hidden;box-shadow:0 18px 50px rgba(9,38,71,.08)">
            <tr>
              <td align="center" style="background:#092647;padding:30px 24px;color:#FFFFFF">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1;font-weight:700;letter-spacing:.2px">BrinqueTEAndo</div>
                <div style="margin-top:10px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F2E6DE">${escapeHtml(eyebrow)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 30px 30px">
                <h1 style="margin:0;color:#092647;font-family:Georgia,'Times New Roman',serif;font-size:31px;line-height:1.15;font-weight:700">${escapeHtml(title)}</h1>
                <p style="margin:18px 0 0;font-size:16px;line-height:1.75;color:#435367">${intro}</p>
                ${content}
                ${
                  button
                    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 4px"><tr><td bgcolor="#A14D2D" style="border-radius:999px"><a href="${escapeHtml(button.href)}" style="display:inline-block;padding:15px 26px;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase">${escapeHtml(button.label)}</a></td></tr></table>`
                    : ""
                }
                ${
                  note
                    ? `<p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #E4D7D5;font-size:13px;line-height:1.65;color:#7A849C">${note}</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td align="center" style="background:#F2E6DE;padding:22px 26px;color:#435367;font-size:12px;line-height:1.6">
                <strong style="color:#092647">BrinqueTEAndo</strong><br />
                Brinquedos e recursos pedagógicos com curadoria de Margareth Almeida, Neuropsicopedagoga.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

type ApprovedEmailInput = {
  customerName?: string;
  reference: string;
  total: string;
  shippingLabel: string;
  discountPercent: number;
  isPostPurchase: boolean;
};

export function approvedPaymentEmail({
  customerName,
  reference,
  total,
  shippingLabel,
  discountPercent,
  isPostPurchase,
}: ApprovedEmailInput) {
  const safeName = customerName ? `, ${escapeHtml(customerName)}` : "";
  const title = isPostPurchase
    ? `Compra adicional confirmada${safeName}`
    : `Pagamento aprovado${safeName}`;

  return emailFrame({
    preheader: isPostPurchase
      ? "Sua compra adicional foi aprovada e será vinculada ao pedido principal."
      : "Recebemos seu pagamento e seu pedido entrou em preparação.",
    eyebrow: isPostPurchase ? "Compra adicional aprovada" : "Pedido confirmado",
    title,
    intro: isPostPurchase
      ? "Recebemos a confirmação da compra adicional. Sempre que a preparação do pedido principal ainda permitir, o novo item seguirá junto no mesmo envio."
      : "Obrigada por escolher a BrinqueTEAndo. Recebemos a confirmação do pagamento e seu pedido entrou na nossa fila de preparação.",
    content: `
      <div style="margin:25px 0;background:#F2E6DE;border-radius:18px;padding:21px 22px">
        <p style="margin:0 0 9px;font-size:14px;line-height:1.6"><strong style="color:#092647">Referência:</strong> ${escapeHtml(reference)}</p>
        <p style="margin:0 0 9px;font-size:14px;line-height:1.6"><strong style="color:#092647">Total pago:</strong> ${escapeHtml(total)}</p>
        <p style="margin:0 0 9px;font-size:14px;line-height:1.6"><strong style="color:#092647">Entrega:</strong> ${escapeHtml(shippingLabel)}</p>
        ${discountPercent > 0 ? `<p style="margin:0;font-size:14px;line-height:1.6;color:#A14D2D"><strong>Desconto aplicado:</strong> ${discountPercent}%</p>` : ""}
      </div>
      <p style="margin:0;font-size:15px;line-height:1.75;color:#435367">
        ${
          isPostPurchase
            ? "Você receberá as próximas informações no e-mail do pedido original."
            : "Em aproximadamente 24 horas, enviaremos uma nova atualização sobre a preparação para postagem. Depois da postagem, o código de rastreamento será encaminhado por e-mail."
        }
      </p>
    `,
    note: "Guarde esta mensagem para consultar a referência do pedido. Em caso de dúvida, responda diretamente a este e-mail.",
  });
}

type FailedPaymentEmailInput = {
  customerName?: string;
  reference: string;
  total: string;
  reason: string;
  retryUrl: string;
};

export function failedPaymentEmail({
  customerName,
  reference,
  total,
  reason,
  retryUrl,
}: FailedPaymentEmailInput) {
  const safeName = customerName ? `, ${escapeHtml(customerName)}` : "";

  return emailFrame({
    preheader: "O pagamento não foi concluído. Veja como tentar novamente com segurança.",
    eyebrow: "Pagamento não concluído",
    title: `Vamos tentar novamente${safeName}?`,
    intro:
      "A tentativa de pagamento não foi aprovada, mas isso costuma ser resolvido rapidamente. Nenhuma compra foi confirmada nesta tentativa.",
    content: `
      <div style="margin:25px 0;background:#FFF3EE;border:1px solid #F0D2C5;border-radius:18px;padding:21px 22px">
        <p style="margin:0 0 9px;font-size:14px;line-height:1.6"><strong style="color:#092647">Referência:</strong> ${escapeHtml(reference)}</p>
        <p style="margin:0 0 9px;font-size:14px;line-height:1.6"><strong style="color:#092647">Valor da tentativa:</strong> ${escapeHtml(total)}</p>
        <p style="margin:0;font-size:14px;line-height:1.6"><strong style="color:#092647">O que aconteceu:</strong> ${escapeHtml(reason)}</p>
      </div>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.75;color:#435367"><strong style="color:#092647">Para concluir sua compra:</strong></p>
      <ol style="margin:0;padding-left:22px;color:#435367;font-size:15px;line-height:1.8">
        <li>Confira número do cartão, validade e código de segurança.</li>
        <li>Verifique se há limite disponível para a compra.</li>
        <li>Tente novamente ou utilize outro cartão.</li>
        <li>Caso a recusa continue, fale com o banco emissor do cartão.</li>
      </ol>
    `,
    button: { label: "Voltar e tentar novamente", href: retryUrl },
    note:
      "Por segurança, a BrinqueTEAndo não recebe nem armazena os dados completos do seu cartão. O pagamento é processado pela Stripe.",
  });
}

type PreparationEmailInput = {
  customerName?: string;
  reference: string;
  shippingLabel: string;
};

export function orderPreparationEmail({
  customerName,
  reference,
  shippingLabel,
}: PreparationEmailInput) {
  const safeName = customerName ? `, ${escapeHtml(customerName)}` : "";

  return emailFrame({
    preheader: "Seu pedido entrou na etapa de separação e preparação para postagem.",
    eyebrow: "Atualização do pedido",
    title: `Seu pedido está sendo preparado${safeName}`,
    intro:
      "Passando para contar que seu pedido já entrou na etapa de separação, conferência e preparação da embalagem.",
    content: `
      <div style="margin:25px 0;background:#F2E6DE;border-radius:18px;padding:21px 22px">
        <p style="margin:0 0 9px;font-size:14px;line-height:1.6"><strong style="color:#092647">Referência:</strong> ${escapeHtml(reference)}</p>
        <p style="margin:0;font-size:14px;line-height:1.6"><strong style="color:#092647">Modalidade de entrega:</strong> ${escapeHtml(shippingLabel)}</p>
      </div>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.75;color:#435367">
        A postagem será realizada no próximo dia útil disponível, respeitando o prazo de processamento informado na loja.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:#435367">
        Assim que o envio for registrado pela transportadora ou pelos Correios, o código de rastreamento será encaminhado para este e-mail.
      </p>
    `,
    note:
      "Esta mensagem confirma o início da preparação. Ela não substitui o aviso de postagem e rastreamento, que será enviado após o registro do envio.",
  });
}

export function friendlyPaymentFailureReason(intent: { last_payment_error?: { code?: string | null; decline_code?: string | null; message?: string | null } | null }) {
  const code = intent.last_payment_error?.decline_code || intent.last_payment_error?.code || "";

  const reasons: Record<string, string> = {
    insufficient_funds: "O cartão pode estar sem limite disponível para esta compra.",
    expired_card: "A validade informada para o cartão está vencida.",
    incorrect_cvc: "O código de segurança do cartão pode ter sido informado incorretamente.",
    incorrect_number: "O número do cartão pode ter sido informado incorretamente.",
    card_declined: "O banco emissor não autorizou esta tentativa de pagamento.",
    processing_error: "Houve uma falha temporária no processamento do cartão.",
    authentication_required: "O banco solicitou uma etapa adicional de autenticação.",
  };

  return reasons[code] || "O banco emissor não autorizou a tentativa. Tente novamente ou utilize outro cartão.";
}
