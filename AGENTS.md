<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regras obrigatórias do projeto

## Imagens e arquivos binários

- É proibido usar Base64, arquivos `.b64`, `data:` URLs ou qualquer conteúdo binário codificado dentro do código, de workflows ou de arquivos de configuração.
- Imagens devem ser adicionadas ao repositório como arquivos reais `.webp`, `.png`, `.jpg` ou `.avif`.
- As imagens geradas para a homepage devem ficar em `public/home-images/` e ser referenciadas por caminhos normais, por exemplo: `/home-images/nome-do-arquivo.webp`.
- As fotografias dos produtos devem ficar dentro do próprio projeto, em `public/products/`, sem depender da Shopify ou de outro CDN externo.
- Não criar workflows temporários para decodificar, reconstruir ou materializar imagens.

## Homepage

- Não alterar a hero nem os banners do carrossel principal sem autorização expressa.
- Nas seções internas indicadas para conteúdo editorial, usar somente as imagens geradas para essas áreas; não substituir por fotografias de produtos.
- Antes de alterar caminhos de imagem, confirmar que o arquivo existe na branch `main`.

Estas regras devem ser respeitadas em qualquer alteração futura no projeto.
