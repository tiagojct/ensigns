#!/usr/bin/env sh
# Copy hand-authored scaffolding from src/ into the generated dist/ surfaces so each
# dist/<surface> is a complete, vendorable unit. Run AFTER generate.py (which writes
# the generated tokens into dist/). Does not delete dist/ — generate.py owns those files.
set -e
REPO=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$REPO"

# tailwind preset: generated colors.generated.js + package.json already in dist/
cp src/tailwind/index.js src/tailwind/README.md dist/tailwind/

# vscode extension: generated theme + package.json already in dist/
cp src/vscode/README.md src/vscode/preview-python.svg src/vscode/preview-r.svg dist/vscode/

# zed theme: generated themes/Glauca.json already in dist/
cp src/zed/README.md dist/zed/

# vivaldi themes: zip each generated settings.json into an importable theme
cp src/vivaldi/README.md dist/vivaldi/
rm -f dist/vivaldi/Glauca-Dark.zip dist/vivaldi/Glauca.zip
( cd dist/vivaldi/dark && zip -q ../Glauca-Dark.zip settings.json )
( cd dist/vivaldi/light && zip -q ../Glauca.zip settings.json )

# obsidian theme: generated theme.css + manifest.json already in dist/
# (the `src/.../.` form is idempotent: plain `cp -r src/x dist/x` nests a second
# copy when dist/x already exists)
cp src/obsidian/README.md dist/obsidian/
mkdir -p dist/obsidian/img
cp -r src/obsidian/img/. dist/obsidian/img/

# typst: generated colors.typ + poster.typ already in dist/
cp src/typst/glauca.typ src/typst/demo.typ src/typst/README.md dist/typst/

# quarto: generated scss/theme/typst-brand already in dist/
cp src/quarto/README.md dist/quarto/
mkdir -p dist/quarto/example
cp -r src/quarto/example/. dist/quarto/example/

# terminal preset: generated .ghostty already in dist/
cp src/themes/terminals/README.md src/themes/terminals/preview.svg dist/themes/terminals/

# oh-my-zsh prompt: generated .zsh-theme files already in dist/
cp src/omz/README.md dist/omz/

# miniflux custom css: generated glauca.css already in dist/
cp src/miniflux/README.md dist/miniflux/

# markedit theme: colours generated into src/; the bundle (dist/markedit/glauca.js) is built
# by `make markedit`. Ship the README alongside it.
mkdir -p dist/markedit
cp src/markedit/README.md dist/markedit/

echo "assembled scaffolding into dist/ (tailwind, vscode, zed, vivaldi, obsidian, typst, quarto, themes/terminals, omz, miniflux, markedit)"
