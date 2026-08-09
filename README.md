# BrinqueTEAndo

Loja de brinquedos sensoriais e pedagógicos construída com Next.js 16, Clerk, Stripe, Resend e Cloudflare R2.

## Identidade visual

O favicon da marca é definido por `src/app/icon.svg`. Não mantenha um `favicon.ico` adicional em `src/app`, pois os dois arquivos podem ser publicados simultaneamente pelo Next.js.

A aplicação foi configurada para funcionar no subcaminho:

```text
https://www.adhdautism.online/brinqueteando
```

## Executar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse:

```text
http://localhost:3000/brinqueteando
```

Use as chaves de **teste** do Clerk e da Stripe no ambiente local. As chaves `live` devem existir somente no ambiente de produção.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha os valores. O arquivo `.env.local` é ignorado pelo Git e nunca deve ser publicado.

Integrações configuradas:

- Clerk: autenticação e conta do cliente.
- Stripe: checkout por cartão, endereço de entrega e confirmação do pagamento.
- Resend: e-mail transacional após a aprovação do pagamento.
- Cloudflare R2: armazenamento de imagens de produtos.

## Stripe

Cadastre o webhook de produção apontando para:

```text
https://www.adhdautism.online/brinqueteando/api/webhook
```

Evento necessário:

```text
checkout.session.completed
```

Copie o segredo gerado para `STRIPE_WEBHOOK_SECRET`.

O frete padrão é definido por `SHIPPING_FEE_CENTS`. Exemplo: `1990` representa R$ 19,90.

## Resend

Verifique o domínio `adhdautism.online` no painel do Resend antes de usar:

```text
BrinqueTEAndo <pedidos@adhdautism.online>
```

## Cloudflare R2

Crie ou confirme o bucket indicado em `R2_BUCKET_NAME` e conecte um domínio público ao bucket. Informe esse endereço em `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`.

O endpoint administrativo de upload é:

```text
POST /brinqueteando/api/admin/upload
```

Ele exige login no Clerk e permite acesso somente aos IDs listados em `ADMIN_CLERK_USER_IDS`.

Campos `multipart/form-data`:

- `file`: JPG, PNG, WEBP ou AVIF, até 10 MB.
- `folder`: opcional; o padrão é `products`.

## Verificação da configuração

Depois do deploy, consulte:

```text
https://www.adhdautism.online/brinqueteando/api/health
```

A resposta informa quais integrações receberam variáveis de ambiente, sem revelar nenhum segredo.

## Publicação no subcaminho

O `basePath` já está definido como `/brinqueteando`. Caso `adhdautism.online` pertença a outro projeto, esse projeto principal precisa encaminhar `/brinqueteando/:path*` para a implantação desta loja. Um domínio não pode ser dividido entre dois projetos somente pela configuração de DNS.
