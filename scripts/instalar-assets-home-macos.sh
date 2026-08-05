#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BANNERS_SOURCE="${1:-$HOME/Downloads/banners}"
HOME_SOURCE="${2:-$HOME/Downloads/images}"
BANNERS_DEST="$PROJECT_ROOT/public/banners"
HOME_DEST="$PROJECT_ROOT/public/home-sections"

for directory in "$BANNERS_SOURCE" "$HOME_SOURCE"; do
  if [[ ! -d "$directory" ]]; then
    echo "Pasta não encontrada: $directory"
    exit 1
  fi
done

if [[ -n "$(git -C "$PROJECT_ROOT" status --porcelain)" ]]; then
  echo "O projeto possui alterações locais não salvas."
  echo "Execute primeiro: git stash push -u -m 'backup antes das imagens'"
  git -C "$PROJECT_ROOT" status --short
  exit 1
fi

mkdir -p "$BANNERS_DEST" "$HOME_DEST"

collect_latest_four() {
  local source_dir="$1"
  find "$source_dir" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) \
    -exec stat -f '%m|%N' {} \; | sort -n | tail -n 4 | cut -d'|' -f2-
}

banner_files=()
while IFS= read -r file; do
  [[ -n "$file" ]] && banner_files+=("$file")
done < <(collect_latest_four "$BANNERS_SOURCE")

home_files=()
while IFS= read -r file; do
  [[ -n "$file" ]] && home_files+=("$file")
done < <(collect_latest_four "$HOME_SOURCE")

if [[ ${#banner_files[@]} -ne 4 ]]; then
  echo "A pasta $BANNERS_SOURCE precisa conter pelo menos quatro imagens."
  exit 1
fi

if [[ ${#home_files[@]} -ne 4 ]]; then
  echo "A pasta $HOME_SOURCE precisa conter pelo menos quatro imagens."
  exit 1
fi

banner_names=(
  "banner-01-brincar-com-proposito.png"
  "banner-02-escolher-com-clareza.png"
  "banner-03-menos-excesso-mais-intencao.png"
  "banner-04-mediacao-transforma.png"
)

home_names=(
  "01-intencionalidade-no-brincar.png"
  "02-produto-em-destaque.png"
  "03-siga-no-instagram.png"
  "04-categorias-frame.png"
)

echo "Banners selecionados:"
for index in 0 1 2 3; do
  echo "  $((index + 1)). $(basename "${banner_files[$index]}")"
  sips -s format png "${banner_files[$index]}" --out "$BANNERS_DEST/${banner_names[$index]}" >/dev/null
  echo "     → ${banner_names[$index]}"
done

echo "Imagens de apoio selecionadas:"
for index in 0 1 2 3; do
  echo "  $((index + 1)). $(basename "${home_files[$index]}")"
  sips -s format png "${home_files[$index]}" --out "$HOME_DEST/${home_names[$index]}" >/dev/null
  echo "     → ${home_names[$index]}"
done

git -C "$PROJECT_ROOT" add public/banners public/home-sections

if git -C "$PROJECT_ROOT" diff --cached --quiet; then
  echo "Nenhuma imagem nova para enviar."
  exit 0
fi

git -C "$PROJECT_ROOT" commit -m "adiciona banners e imagens finais da homepage"
git -C "$PROJECT_ROOT" push

echo "✓ Imagens enviadas para o GitHub com sucesso."
