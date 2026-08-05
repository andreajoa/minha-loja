#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="${1:-$HOME/Downloads/images}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST_DIR="$PROJECT_ROOT/public/banners"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Pasta não encontrada: $SOURCE_DIR"
  exit 1
fi

mkdir -p "$DEST_DIR"

files=()
while IFS= read -r line; do
  files+=("${line#* }")
done < <(
  find "$SOURCE_DIR" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) \
    -exec stat -f '%m %N' {} \; | sort -n | tail -n 4
)

if [[ ${#files[@]} -ne 4 ]]; then
  echo "Foram encontradas ${#files[@]} imagens. A pasta precisa conter pelo menos quatro imagens PNG ou JPG."
  exit 1
fi

names=(
  "banner-01-brincar-com-proposito.png"
  "banner-02-escolher-com-clareza.png"
  "banner-03-menos-excesso-mais-intencao.png"
  "banner-04-mediacao-transforma.png"
)

for index in 0 1 2 3; do
  source_file="${files[$index]}"
  destination="$DEST_DIR/${names[$index]}"
  sips -s format png "$source_file" --out "$destination" >/dev/null
  echo "✓ $(basename "$source_file") → ${names[$index]}"
done

git -C "$PROJECT_ROOT" add public/banners

if git -C "$PROJECT_ROOT" diff --cached --quiet; then
  echo "Nenhuma alteração nova para enviar."
  exit 0
fi

git -C "$PROJECT_ROOT" commit -m "adiciona quatro banners informativos da homepage"
git -C "$PROJECT_ROOT" push

echo "Banners enviados para o GitHub com sucesso."
