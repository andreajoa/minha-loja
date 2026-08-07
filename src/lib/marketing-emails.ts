const SITE = "https://www.brinqueteando.online";
const FROM = "BrinqueTEAndo <newsletter@send.brinqueteando.online>";
const REPLY_TO = "info@brinqueteando.online";

export type MarketingTemplate = {
  alias: string;
  name: string;
  subject: string;
  html: string;
  variables?: Array<{
    key: string;
    type: "string" | "number";
    fallbackValue?: string | number;
  }>;
};

type NewsletterSpec = {
  number: number;
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  image: string;
  productId?: string;
  cta: string;
  ctaUrl?: string;
  note?: string;
};

const palette = {
  navy: "#09274B",
  terracotta: "#A64B2A",
  cream: "#FFF8F3",
  rose: "#F3DED0",
  muted: "#5D6C80",
  border: "#E3D3C8",
};

function escape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell({
  preheader,
  eyebrow,
  title,
  paragraphs,
  bullets = [],
  image,
  cta,
  ctaUrl,
  note,
}: Omit<NewsletterSpec, "number" | "subject" | "productId">) {
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:${palette.cream};font-family:Arial,Helvetica,sans-serif;color:${palette.muted}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${palette.cream};padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid ${palette.border};border-radius:24px;overflow:hidden">
<tr><td style="background:${palette.navy};padding:26px 28px;text-align:center">
<div style="font-family:Georgia,serif;font-size:30px;letter-spacing:.06em;color:#fff">BRINQUE<span style="color:#C88664">TEA</span>NDO</div>
<div style="margin-top:7px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${palette.rose}">Brincar com propósito</div>
</td></tr>
${image ? `<tr><td><img src="${image}" alt="" width="640" style="display:block;width:100%;height:auto;max-height:360px;object-fit:cover"></td></tr>` : ""}
<tr><td style="padding:34px 30px 28px">
<div style="font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:${palette.terracotta}">${escape(eyebrow)}</div>
<h1 style="margin:10px 0 18px;font-family:Georgia,serif;font-weight:500;font-size:34px;line-height:1.08;color:${palette.navy}">${escape(title)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.72">${p}</p>`).join("")}
${bullets.length ? `<div style="margin:22px 0;padding:20px 22px;background:${palette.rose};border-radius:16px">${bullets.map((b) => `<div style="margin:8px 0;font-size:15px;line-height:1.55"><span style="color:${palette.terracotta};font-weight:900">✓</span> ${b}</div>`).join("")}</div>` : ""}
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px auto 10px"><tr><td style="border-radius:999px;background:${palette.terracotta}"><a href="${ctaUrl}" style="display:inline-block;padding:15px 25px;color:#fff;text-decoration:none;font-size:14px;font-weight:800">${escape(cta)}</a></td></tr></table>
${note ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#7A8797;text-align:center">${note}</p>` : ""}
</td></tr>
<tr><td style="background:${palette.navy};padding:24px 28px;text-align:center;color:#fff">
<div style="font-family:Georgia,serif;font-size:21px">BrinqueTEAndo</div>
<div style="margin-top:7px;font-size:12px;line-height:1.55;color:${palette.rose}">Curadoria de Margareth Almeida · Neuropsicopedagoga</div>
<div style="margin-top:10px;font-size:12px"><a href="mailto:${REPLY_TO}" style="color:#fff">${REPLY_TO}</a> · <a href="${SITE}" style="color:#fff">brinqueteando.online</a></div>
<div style="margin-top:14px;font-size:11px;line-height:1.5;color:#D8E0EA">Você recebeu este e-mail porque se inscreveu para receber conteúdos e ofertas da BrinqueTEAndo.<br><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#fff;text-decoration:underline">Cancelar inscrição</a> · <a href="${SITE}/politicas/privacidade" style="color:#fff;text-decoration:underline">Privacidade</a></div>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const newsletterSpecs: NewsletterSpec[] = [
  {
    number: 1,
    subject: "Brinquedo bom não é o que faz mais coisas",
    preheader: "Uma mudança simples de olhar pode evitar compras por impulso.",
    eyebrow: "Escolha com clareza",
    title: "Brinquedo bom é o que abre espaço para a criança fazer",
    paragraphs: [
      "É fácil se encantar com luzes, sons e dezenas de funções. Mas o recurso mais interessante nem sempre é o que entrega mais estímulos pronto.",
      "Antes de escolher, observe o que a criança consegue fazer com o brinquedo: explorar, combinar, repetir, criar, pedir ajuda, esperar, nomear, imaginar. Quanto mais participação real, maior a possibilidade de brincar com intenção.",
      "Na curadoria da BrinqueTEAndo, a pergunta não é só ‘é bonito?’. É: ‘que experiência isso pode abrir?’",
    ],
    bullets: ["A criança participa ativamente", "Há mais de uma forma possível de brincar", "O adulto consegue mediar sem transformar em tarefa"],
    image: `${SITE}/products/catalog/14944174637422/01.webp`,
    productId: "14944174637422",
    cta: "Ver um exemplo na loja",
  },
  {
    number: 2,
    subject: "Antes de comprar, observe isso por 2 minutos",
    preheader: "O interesse atual da criança costuma dizer mais do que a embalagem.",
    eyebrow: "Ensinar antes de vender",
    title: "Dois minutos de observação podem mudar a escolha",
    paragraphs: [
      "Veja o que prende a atenção da criança hoje. Ela procura apertar? Encaixar? Girar? Nomear? Abrir e fechar? Organizar? Inventar histórias?",
      "Esse padrão de interesse é uma pista. Em vez de comprar pelo que está em alta, você pode escolher um recurso que converse com algo que já existe no brincar e, a partir daí, ampliar possibilidades.",
      "A melhor compra não precisa começar no catálogo. Pode começar olhando a criança.",
    ],
    image: `${SITE}/products/catalog/14955388567918/01.webp`,
    productId: "14955388567918",
    cta: "Explorar por objetivo",
    ctaUrl: `${SITE}/colecoes`,
  },
  {
    number: 3,
    subject: "Sensorial não significa ‘quanto mais estímulo, melhor’",
    preheader: "Estimulação sensorial também precisa de intenção e observação.",
    eyebrow: "Sensorial com propósito",
    title: "O objetivo não é encher o ambiente de estímulos",
    paragraphs: [
      "Um recurso sensorial pode convidar ao toque, à pressão, ao movimento e à exploração. Mas quantidade não é sinônimo de qualidade.",
      "Observe a resposta. Se a criança se organiza e permanece na atividade, você encontrou uma pista útil. Se evita, se incomoda ou se desregula, diminuir intensidade e simplificar pode ser mais adequado.",
      "Brincar sensorialmente é experimentar com segurança, não cumprir uma lista de estímulos.",
    ],
    bullets: ["Apresente um recurso por vez", "Dê tempo para explorar sem pressa", "Siga a resposta da criança"],
    image: `${SITE}/products/catalog/14955519050094/01.webp`,
    productId: "14955519050094",
    cta: "Conhecer recursos sensoriais",
  },
  {
    number: 4,
    subject: "Comunicação começa muito antes de uma frase completa",
    preheader: "Olhar, gesto, escolha, apontar e turnos também são comunicação.",
    eyebrow: "Comunicação no brincar",
    title: "Nem toda comunicação chega em forma de frase",
    paragraphs: [
      "Durante a brincadeira, a criança pode comunicar ao olhar, aproximar um objeto, apontar, entregar algo, recusar, escolher ou esperar sua reação.",
      "Quando o adulto percebe esses sinais e responde, cria um ciclo valioso: a criança faz algo, o outro entende, algo acontece. Isso dá função à comunicação.",
      "Livros e recursos visuais podem ajudar, mas o ponto central continua sendo a troca entre pessoas.",
    ],
    image: `${SITE}/products/catalog/14943278334318/01.webp`,
    productId: "14943278334318",
    cta: "Ver recursos de comunicação",
  },
  {
    number: 5,
    subject: "Autonomia não nasce de ‘faz sozinho’",
    preheader: "Ela cresce quando a tarefa é pequena o suficiente para a criança participar.",
    eyebrow: "Pequenos passos",
    title: "Autonomia se constrói com participação, não com cobrança",
    paragraphs: [
      "Amarrar, guardar, vestir, lavar as mãos, organizar materiais. São ações grandes quando vistas de uma vez.",
      "Uma estratégia simples é dividir a rotina: você começa, a criança termina; depois ela faz duas etapas; aos poucos, a ajuda diminui. O foco é criar experiências de competência.",
      "Quando o brincar ensaia movimentos da vida cotidiana, aprender pode ficar mais leve.",
    ],
    image: `${SITE}/products/catalog/14943441977710/01.webp`,
    productId: "14943441977710",
    cta: "Explorar autonomia",
  },
  {
    number: 6,
    subject: "Coordenação fina sem transformar brincar em exercício",
    preheader: "Mãos aprendem quando há um motivo interessante para agir.",
    eyebrow: "Motor fino",
    title: "A mão trabalha melhor quando a brincadeira faz sentido",
    paragraphs: [
      "Pegar, encaixar, girar, alinhar, carimbar, puxar e montar são movimentos que aparecem naturalmente em boas brincadeiras.",
      "Não é necessário anunciar ‘agora vamos treinar coordenação’. Uma proposta interessante já cria repetição suficiente para as mãos praticarem enquanto a criança está envolvida com o objetivo do jogo.",
      "O desenvolvimento acontece dentro da experiência — não precisa parecer exercício.",
    ],
    image: `${SITE}/products/catalog/14943536578926/01.webp`,
    productId: "14943536578926",
    cta: "Ver ideias para mãos em ação",
  },
  {
    number: 7,
    subject: "Atenção não se pede o tempo todo. Ela também se constrói.",
    preheader: "Interesse, previsibilidade e desafio na medida certa ajudam a sustentar o foco.",
    eyebrow: "Atenção com intenção",
    title: "‘Presta atenção’ nem sempre ensina a prestar atenção",
    paragraphs: [
      "Para permanecer em uma atividade, a criança precisa conseguir entender o que está acontecendo, ter algum interesse e encontrar um desafio possível.",
      "Atividades curtas, com começo e fim claros, ajudam. Depois, o tempo pode aumentar. Quando a tarefa é difícil demais ou longa demais, insistir pode produzir fuga — não atenção.",
      "Atenção sustentada também pode ser construída em pequenas doses.",
    ],
    image: `${SITE}/products/catalog/14970002276718/01.webp`,
    productId: "14970002276718",
    cta: "Ver jogos de atenção e precisão",
  },
  {
    number: 8,
    subject: "Um brinquedo pode render cinco brincadeiras diferentes",
    preheader: "Antes de comprar outro, experimente mudar a proposta.",
    eyebrow: "Mais possibilidades, menos excesso",
    title: "O mesmo recurso pode ganhar uma função nova amanhã",
    paragraphs: [
      "Um pop-it pode virar jogo de turnos, contagem, imitação de sequências, escolha de cores ou desafio de velocidade. Um livro pode virar busca visual, nomeação, conversa e faz de conta.",
      "Variar a mediação costuma ampliar muito mais o uso do que simplesmente aumentar a quantidade de brinquedos disponíveis.",
      "Antes de pensar ‘ele já enjoou’, teste uma regra nova, um parceiro novo ou uma pergunta diferente.",
    ],
    image: `${SITE}/products/catalog/14943393120622/01.webp`,
    productId: "14943393120622",
    cta: "Descobrir recursos versáteis",
  },
  {
    number: 9,
    subject: "O erro de oferecer estímulo demais de uma vez",
    preheader: "Mais opções podem diminuir o brincar em vez de aumentar.",
    eyebrow: "Ambiente que favorece o brincar",
    title: "Às vezes, menos brinquedos disponíveis geram mais exploração",
    paragraphs: [
      "Quando muitos recursos ficam expostos ao mesmo tempo, algumas crianças pulam rapidamente de um para outro sem aprofundar nenhuma experiência.",
      "Experimente deixar poucas opções acessíveis e fazer rodízio. O brinquedo que ficou guardado por alguns dias pode voltar com interesse renovado.",
      "Organizar o ambiente também é uma forma de mediar o brincar.",
    ],
    image: `${SITE}/products/catalog/14944017875310/01.webp`,
    productId: "14944017875310",
    cta: "Ver a curadoria completa",
    ctaUrl: `${SITE}/colecoes`,
  },
  {
    number: 10,
    subject: "Escolha pela fase da criança, não pela moda",
    preheader: "O recurso certo é o que conversa com o momento atual.",
    eyebrow: "Compra mais consciente",
    title: "O brinquedo viral pode não ser o brinquedo certo agora",
    paragraphs: [
      "Tendências ajudam a descobrir novidades, mas não conhecem a criança que está na sua frente.",
      "Faixa etária, interesse, forma de brincar, tolerância a frustração, habilidades atuais e necessidade de ajuda são pistas mais úteis para escolher.",
      "Quando uma compra parte dessas perguntas, a chance de o recurso realmente entrar na rotina aumenta.",
    ],
    image: `${SITE}/products/catalog/14964411498862/01.webp`,
    productId: "14964411498862",
    cta: "Escolher com mais clareza",
    ctaUrl: `${SITE}/colecoes`,
  },
  {
    number: 11,
    subject: "Uma brincadeira possível para dias corridos",
    preheader: "Você não precisa preparar uma atividade elaborada para criar um bom momento.",
    eyebrow: "Vida real",
    title: "Cinco minutos de presença podem valer mais que uma atividade perfeita",
    paragraphs: [
      "Escolha um recurso simples, sente perto e acompanhe. Imite o que a criança faz. Nomeie uma ação. Espere sua vez. Crie uma pequena surpresa.",
      "A mediação não precisa ser longa nem sofisticada. O que faz diferença é a disponibilidade para entrar na brincadeira e responder ao que acontece.",
      "Brincar com propósito também precisa caber na rotina da família.",
    ],
    image: `${SITE}/products/catalog/14944577814894/01.webp`,
    productId: "14944577814894",
    cta: "Ver propostas simples",
  },
  {
    number: 12,
    subject: "Se a criança quer repetir, talvez exista aprendizagem ali",
    preheader: "Repetição pode ser prazer, previsibilidade e prática.",
    eyebrow: "Repetir também ensina",
    title: "Nem toda repetição precisa ser interrompida",
    paragraphs: [
      "Repetir uma ação permite antecipar o resultado, praticar um movimento e sentir domínio sobre o que acontece.",
      "Em vez de cortar imediatamente, você pode entrar na repetição e acrescentar uma pequena variação: uma cor nova, um turno, uma palavra, uma sequência diferente.",
      "A novidade não precisa substituir o interesse. Pode nascer dentro dele.",
    ],
    image: `${SITE}/products/catalog/14946291581294/01.webp`,
    productId: "14946291581294",
    cta: "Explorar causa e efeito",
  },
  {
    number: 13,
    subject: "Faz de conta também alimenta linguagem",
    preheader: "Histórias simples criam oportunidades para nomear, escolher e conversar.",
    eyebrow: "Imaginação e comunicação",
    title: "Quando o brinquedo vira personagem, a conversa ganha contexto",
    paragraphs: [
      "Um dinossauro pode estar com fome. Um polvo pode procurar um amigo. Um caminhão pode precisar carregar algo. Essas pequenas histórias criam motivos naturais para usar palavras, gestos e turnos.",
      "Não é necessário dirigir toda a brincadeira. Ofereça uma ideia e veja o que a criança faz com ela.",
      "O faz de conta funciona melhor quando existe espaço para a criança também conduzir a história.",
    ],
    image: `${SITE}/products/catalog/14964411007342/01.webp`,
    productId: "14964411007342",
    cta: "Ver recursos para faz de conta",
  },
  {
    number: 14,
    subject: "Brincar ao ar livre sem montar um grande planejamento",
    preheader: "Movimento, bolhas e perseguição visual já podem render uma boa experiência.",
    eyebrow: "Corpo em movimento",
    title: "O lado de fora também pode ser um espaço de aprendizagem leve",
    paragraphs: [
      "Correr atrás de bolhas, esperar o próximo disparo, acompanhar com os olhos, tentar estourar com uma mão ou com o pé. Uma brincadeira simples pode reunir atenção, movimento e interação.",
      "O mais importante é adaptar o ritmo: algumas crianças querem movimento intenso; outras preferem observar primeiro.",
      "A proposta boa é aquela que consegue incluir a criança como ela chega naquele dia.",
    ],
    image: `${SITE}/products/catalog/14964414087534/01.webp`,
    productId: "14964414087534",
    cta: "Ver brincadeiras com movimento",
  },
  {
    number: 15,
    subject: "O que precisa acontecer para um produto entrar na nossa curadoria",
    preheader: "A última mensagem desta sequência explica como pensamos a loja.",
    eyebrow: "Por trás da BrinqueTEAndo",
    title: "A loja não começa no produto. Começa na pergunta: para que isso pode servir no brincar?",
    paragraphs: [
      "A BrinqueTEAndo foi organizada para vender com contexto. Por isso, tentamos deixar claro o que um recurso pode apoiar, para qual faixa etária é indicado e como ele pode entrar em uma brincadeira mediada.",
      "Isso não transforma brinquedo em terapia — e nem deveria. O compromisso é outro: oferecer informação suficiente para que a família compre com mais consciência e menos impulso.",
      "Se você chegou até aqui, obrigada por permitir que esses conteúdos entrem na sua caixa de entrada. É uma honra construir essa conversa com você.",
    ],
    image: `${SITE}/instagram-strip/3.png`,
    cta: "Conhecer toda a BrinqueTEAndo",
    ctaUrl: `${SITE}/colecoes`,
    note: "Se quiser responder este e-mail e contar o que você procura, nossa equipe recebe sua mensagem.",
  },
];

function newsletterTemplate(spec: NewsletterSpec): MarketingTemplate {
  const ctaUrl = spec.ctaUrl || (spec.productId ? `${SITE}/produto/${spec.productId}` : `${SITE}/colecoes`);
  return {
    alias: `brinqueteando-newsletter-${String(spec.number).padStart(2, "0")}`,
    name: `BrinqueTEAndo Newsletter ${String(spec.number).padStart(2, "0")}`,
    subject: spec.subject,
    html: emailShell({ ...spec, ctaUrl }),
  };
}

const recoveryVariables = [
  { key: "PRODUCT_NAME", type: "string" as const, fallbackValue: "os produtos escolhidos" },
  { key: "PRODUCT_IMAGE", type: "string" as const, fallbackValue: `${SITE}/instagram-strip/1.png` },
  { key: "RECOVERY_URL", type: "string" as const, fallbackValue: `${SITE}/carrinho` },
  { key: "CART_TOTAL", type: "string" as const, fallbackValue: "seu carrinho" },
];

function recoveryShell(args: {
  preheader: string;
  eyebrow: string;
  title: string;
  body: string[];
  cta: string;
  soft?: string;
}) {
  return emailShell({
    preheader: args.preheader,
    eyebrow: args.eyebrow,
    title: args.title,
    paragraphs: args.body,
    image: "{{{PRODUCT_IMAGE}}}",
    cta: args.cta,
    ctaUrl: "{{{RECOVERY_URL}}}",
    note: args.soft || "Se você já concluiu a compra, desconsidere esta mensagem.",
  });
}

export const cartRecoveryTemplates: MarketingTemplate[] = [
  {
    alias: "brinqueteando-cart-01",
    name: "Carrinho 01 - Ficou aqui",
    subject: "Seu carrinho ficou aqui — sem pressa",
    html: recoveryShell({
      preheader: "Guardamos o caminho para você retomar quando fizer sentido.",
      eyebrow: "Seu carrinho",
      title: "Você não precisa começar a escolha de novo",
      body: [
        "Você colocou <strong>{{{PRODUCT_NAME}}}</strong> no carrinho e não concluiu a compra. Isso pode ter acontecido por falta de tempo, dúvida ou simplesmente porque o momento não era aquele.",
        "Se ainda fizer sentido, o botão abaixo reconstrói sua seleção. Antes de pagar, você poderá revisar produtos, frete, endereço e descontos.",
      ],
      cta: "Retomar meu carrinho",
    }),
    variables: recoveryVariables,
  },
  {
    alias: "brinqueteando-cart-02",
    name: "Carrinho 02 - Faz sentido?",
    subject: "Antes de voltar ao carrinho, faça esta pergunta",
    html: recoveryShell({
      preheader: "Uma compra consciente começa pelo objetivo do brincar.",
      eyebrow: "Uma pausa útil",
      title: "Esse recurso conversa com o momento da criança?",
      body: [
        "Antes de comprar, pense no interesse atual: a criança procura encaixar, nomear, apertar, imaginar, organizar ou repetir movimentos?",
        "Se <strong>{{{PRODUCT_NAME}}}</strong> conversa com esse interesse e cabe no objetivo que você tem hoje, retomar a compra pode fazer sentido. Se não, tudo bem deixar passar.",
      ],
      cta: "Rever minha escolha",
      soft: "Nosso objetivo é ajudar você a decidir, não pressionar a compra.",
    }),
    variables: recoveryVariables,
  },
  {
    alias: "brinqueteando-cart-03",
    name: "Carrinho 03 - Como usar",
    subject: "Um brinquedo vale mais quando você já imagina como usar",
    html: recoveryShell({
      preheader: "Pense primeiro na experiência, depois no produto.",
      eyebrow: "Brincar com intenção",
      title: "Imagine a primeira brincadeira antes de finalizar",
      body: [
        "Uma boa pergunta é: ‘o que vamos fazer com isso quando chegar?’. Escolha uma primeira proposta simples — explorar livremente, imitar, alternar turnos, nomear ou criar um pequeno desafio.",
        "Quando existe uma ideia de uso, <strong>{{{PRODUCT_NAME}}}</strong> deixa de ser apenas uma compra e passa a ter um lugar possível na rotina.",
      ],
      cta: "Voltar ao carrinho",
    }),
    variables: recoveryVariables,
  },
  {
    alias: "brinqueteando-cart-04",
    name: "Carrinho 04 - Revisar",
    subject: "Seu carrinho ainda pode ser recuperado",
    html: recoveryShell({
      preheader: "Produtos, quantidade e valores podem ser revistos antes de pagar.",
      eyebrow: "Tudo revisável",
      title: "Você continua no controle da compra",
      body: [
        "Ao retomar, você poderá remover itens, alterar quantidades, recalcular o frete e conferir a melhor condição de desconto disponível.",
        "O valor estimado quando o carrinho foi salvo era <strong>{{{CART_TOTAL}}}</strong>. Preços e disponibilidade são novamente validados pela loja antes do pagamento.",
      ],
      cta: "Reabrir meu carrinho",
    }),
    variables: recoveryVariables,
  },
  {
    alias: "brinqueteando-cart-05",
    name: "Carrinho 05 - Ultimo lembrete",
    subject: "Último lembrete sobre este carrinho",
    html: recoveryShell({
      preheader: "Depois desta mensagem, encerramos esta sequência de recuperação.",
      eyebrow: "Último lembrete",
      title: "Se ainda fizer sentido, seu caminho está aqui",
      body: [
        "Esta é a última mensagem desta sequência sobre <strong>{{{PRODUCT_NAME}}}</strong>. Não vamos continuar lembrando você deste carrinho.",
        "Se quiser retomar, use o botão abaixo. Se a compra deixou de fazer sentido, não precisa fazer nada.",
      ],
      cta: "Retomar uma última vez",
      soft: "Depois deste e-mail, a sequência de recuperação deste carrinho é encerrada.",
    }),
    variables: recoveryVariables,
  },
];

export const checkoutRecoveryTemplates: MarketingTemplate[] = [
  {
    alias: "brinqueteando-checkout-01",
    name: "Checkout 01 - Pagamento interrompido",
    subject: "Seu pagamento não foi concluído — está tudo bem",
    html: recoveryShell({
      preheader: "Você pode revisar tudo antes de tentar novamente.",
      eyebrow: "Checkout interrompido",
      title: "Algo interrompeu a finalização da compra?",
      body: [
        "Percebemos que a compra de <strong>{{{PRODUCT_NAME}}}</strong> não foi concluída. Pode ter sido uma pausa, uma dúvida no endereço, no frete ou no cartão.",
        "Use o botão abaixo para reconstruir o carrinho e revisar todas as informações antes de abrir um novo pagamento seguro pela Stripe.",
      ],
      cta: "Retomar minha compra",
    }),
    variables: recoveryVariables,
  },
  {
    alias: "brinqueteando-checkout-02",
    name: "Checkout 02 - Duvida",
    subject: "Faltou alguma informação para finalizar?",
    html: recoveryShell({
      preheader: "Se a dúvida é sobre produto, frete ou pagamento, fale com a loja.",
      eyebrow: "Podemos ajudar",
      title: "Uma dúvida pequena não precisa virar uma compra abandonada",
      body: [
        "Se você parou porque precisava confirmar faixa etária, uso, entrega ou pagamento, responda este e-mail. A equipe recebe sua mensagem em <strong>info@brinqueteando.online</strong>.",
        "Se já estiver tudo claro, seu carrinho pode ser retomado pelo botão abaixo.",
      ],
      cta: "Rever meu pedido",
    }),
    variables: recoveryVariables,
  },
  {
    alias: "brinqueteando-checkout-03",
    name: "Checkout 03 - Revisao",
    subject: "Antes de pagar, revise estes 3 pontos",
    html: recoveryShell({
      preheader: "Endereço, frete e desconto: três verificações rápidas.",
      eyebrow: "Compra sem surpresa",
      title: "Três coisas para conferir antes de tentar novamente",
      body: [
        "1. Endereço e CEP completos. 2. Modalidade e prazo estimado de entrega. 3. Cupom ou desconto progressivo aplicado.",
        "A loja recalcula valores e disponibilidade no servidor antes de criar o novo checkout, então você verá o resumo atualizado antes de informar o cartão.",
      ],
      cta: "Recalcular e continuar",
    }),
    variables: recoveryVariables,
  },
  {
    alias: "brinqueteando-checkout-04",
    name: "Checkout 04 - Retomar",
    subject: "Seu pedido ainda pode ser retomado",
    html: recoveryShell({
      preheader: "O checkout antigo expira, mas sua seleção pode ser reconstruída.",
      eyebrow: "Ainda dá para retomar",
      title: "O checkout pode expirar. A sua escolha não precisa se perder.",
      body: [
        "Por segurança, sessões de pagamento não ficam abertas indefinidamente. O link abaixo não reutiliza uma sessão antiga: ele reconstrói o carrinho para criar um checkout novo e atualizado.",
        "Assim, estoque, frete e descontos são verificados novamente antes do pagamento.",
      ],
      cta: "Criar um checkout novo",
    }),
    variables: recoveryVariables,
  },
  {
    alias: "brinqueteando-checkout-05",
    name: "Checkout 05 - Encerramento",
    subject: "Encerrando os lembretes desta compra",
    html: recoveryShell({
      preheader: "Este é o último e-mail de recuperação deste checkout.",
      eyebrow: "Última mensagem",
      title: "Depois deste e-mail, não vamos continuar lembrando você",
      body: [
        "Se <strong>{{{PRODUCT_NAME}}}</strong> ainda fizer sentido, você pode retomar a seleção uma última vez pelo botão abaixo.",
        "Se mudou de ideia, não precisa fazer nada. Preferimos encerrar a sequência a transformar um lembrete em incômodo.",
      ],
      cta: "Retomar minha seleção",
      soft: "Esta é a última mensagem desta sequência de checkout interrompido.",
    }),
    variables: recoveryVariables,
  },
];

export const newsletterTemplates = newsletterSpecs.map(newsletterTemplate);
export const allMarketingTemplates = [
  ...newsletterTemplates,
  ...cartRecoveryTemplates,
  ...checkoutRecoveryTemplates,
];

export const marketingSender = FROM;
export const marketingReplyTo = REPLY_TO;
