# Fonts

Three families, all under the SIL Open Font License: **IBM Plex Serif**
(display), **IBM Plex Sans** (sans and the reading/body voice), **IBM Plex
Mono** (code). The sans *is* the reading voice in Glauca; the serif is the
display voice (headings). Families and axes are declared in
`glauca.json -> typography.fonts`.

These files are documented, not committed. Fetch them, then subset for the web
starter with `make fonts` (needs `fonttools` + `brotli`).

## Fetch the source TTFs

Sans is a variable font (wght, wdth) on the Google Fonts mirror; Mono is static
(no variable axis). Place all three in this directory as `IBMPlexSans.ttf`,
`IBMPlexSerif.ttf`, `IBMPlexMono.ttf` — the names `subset_fonts.sh` expects.

```
gf="https://raw.githubusercontent.com/google/fonts/main/ofl"
curl -L "$gf/ibmplexsans/IBMPlexSans%5Bwdth%2Cwght%5D.ttf" -o IBMPlexSans.ttf
curl -L "$gf/ibmplexmono/IBMPlexMono-Regular.ttf"          -o IBMPlexMono.ttf
```

Serif ships variable only in the upstream IBM/plex repo (Google's mirror has
static instances). Its internal family name is "IBM Plex Serif Var", so rename
the name table to "IBM Plex Serif" after downloading, or the CSS/theme hook
`--gl-font-serif: 'IBM Plex Serif'` will not match it:

```
ibm="https://raw.githubusercontent.com/IBM/plex/master/packages/plex-serif-variable/fonts/complete/ttf"
curl -L "$ibm/IBM%20Plex%20Serif%20Var-Roman.ttf" -o IBMPlexSerif.ttf
python3 - <<'PY'
from fontTools.ttLib import TTFont
t = TTFont("IBMPlexSerif.ttf")
for r in t["name"].names:
    r.string = r.toUnicode().replace("IBM Plex Serif Var", "IBM Plex Serif").replace("IBMPlexSerifVar", "IBMPlexSerif")
t.save("IBMPlexSerif.ttf")
PY
```

## Axes

- IBM Plex Sans: wght 100-700, wdth 75-100 (Glauca uses 85-100). Variable roman
  + a matching `IBMPlexSans-Italic[wdth,wght].ttf` for the italic voice.
- IBM Plex Serif: wght 100-700. Display/headings.
- IBM Plex Mono: static Regular; extra static weights (Medium, SemiBold, Bold +
  italics) exist on the mirror for code emphasis.

## Web subset

`make fonts` subsets each family to `glauca.json -> i18n.unicode-range`
(Latin-1 plus a few punctuation/symbol codepoints, enough for European
Portuguese) as woff2, keeping the variable axes and all layout features, and
writes them to `../web/public/fonts/`.

## Installing on the system

So Obsidian, VS Code, Typst, and the browser render Glauca in IBM Plex, copy
the TTFs into your user fonts directory (`~/Library/Fonts` on macOS) or use the
OS font manager. The variable Sans/Serif files carry their whole weight range in
one file.
