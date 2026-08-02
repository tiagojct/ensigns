#!/usr/bin/env sh
# Subset the fonts to the declared unicode-range as woff2, keeping variable axes
# and all layout features. Place source TTFs in src/fonts/ first (see src/fonts/README.md).
# Run from the repo root.
set -e
# Range single-sourced from glauca.json (i18n.unicode-range), not duplicated here.
RANGE=$(python3 -c "import json,pathlib;print(json.loads(pathlib.Path('src/glauca.json').read_text())['i18n']['unicode-range'].replace('U+','').replace(' ',''))")
OUT="src/web/public/fonts"; mkdir -p "$OUT"
for pair in "IBMPlexSerif:src/fonts/IBMPlexSerif.ttf" "IBMPlexSans:src/fonts/IBMPlexSans.ttf" "IBMPlexMono:src/fonts/IBMPlexMono.ttf"; do
  name=$(echo "$pair" | cut -d: -f1); src=$(echo "$pair" | cut -d: -f2)
  [ -f "$src" ] || { echo "skip $name (missing $src)"; continue; }
  python3 -m fontTools.subset "$src" --output-file="$OUT/$name.woff2" --flavor=woff2 \
    --unicodes="$RANGE" --layout-features='*'
  echo "wrote $OUT/$name.woff2"
done
