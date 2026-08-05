# Banners informativos da homepage

A homepage usa quatro banners em `public/banners`:

1. `banner-01-brincar-com-proposito.png`
2. `banner-02-escolher-com-clareza.png`
3. `banner-03-menos-excesso-mais-intencao.png`
4. `banner-04-mediacao-transforma.png`

O carrossel:

- troca automaticamente a cada 7,5 segundos;
- usa fade suave de 1,2 segundo;
- pausa quando o usuário passa o mouse ou navega pelo teclado;
- possui setas e indicadores;
- respeita `prefers-reduced-motion`;
- transforma cada banner em um link acessível para a seção correspondente.

Para copiar as quatro imagens mais recentes da pasta local `~/Downloads/images`, execute:

```bash
bash scripts/instalar-banners-locais.sh
```
