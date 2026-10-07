# Bundled fonts

The site serves these files from its own origin. Every face keeps its SIL Open Font Licence beside it. sources.json records the source URL and SHA-256 for the added font files and licence texts, downloaded on 2026-10-04. Atkinson Hyperlegible Next and JetBrains Mono WOFF2 files and OFL texts were retained from the original Gam site.

The additional original TTF files come from [Google Fonts](https://github.com/google/fonts/tree/main/ofl). They are unchanged. Inter Display uses the Inter variable face with the display role selected by the family.

Each TTF file has a WOFF2 file beside it, and fonts.css offers the WOFF2 file first. The TTF file stays as the fallback. The WOFF2 files are 3.0 MB where the TTF files are 9.4 MB. Run `python3 scripts/fonts/optimise.py` from the repository root, after `python3 -m pip install fonttools brotli`, to make the files that are missing. The script writes the source, both SHA-256 hashes and the method of every file into sources.json. Two rules from the licences apply. IBM Plex (Reserved Font Name "Plex") and Bitter (Reserved Font Name "Bitter Pro") are only converted: every glyph and every table is kept, except DSIG, a digital signature that WOFF2 never carries. The other families are subset to Basic Latin, Latin Extended, combining marks, punctuation, symbols and arrows, with all layout features, variation axes and name records kept. tests/site/fonts.test.ts checks the hashes and the two rules. The address of fonts.css carries a short hash of its content, because nginx and Cloudflare keep everything under /fonts/ for 30 days.

literata-latin.woff and literata-latin-italic.woff are the one change: they are subsets of the Literata variable fonts, for the headings of this site under the family name Literata Display. The full files are 955 KB and 903 KB, and the subsets are 77 KB and 79 KB. Each keeps the optical size axis from 18 to 72 and the weight axis from 400 to 700, and only Basic Latin, the Latin-1 Supplement and common punctuation. The Literata licence names no Reserved Font Name, so the subsets are allowed, and literata-OFL.txt stays beside them. sources.json gives the hash of each original and of each subset. Run these commands in this folder to make them again:

```sh
python3 -m fontTools.varLib.instancer "literata-Literata[opsz,wght].ttf" "opsz=18:72" "wght=400:700" --output=limited.ttf
python3 -m fontTools.subset limited.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2010-2015,U+2018-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122,U+2190-2193,U+2212" --layout-features="kern,liga,calt,ccmp,locl,mark,mkmk,onum,lnum,pnum,tnum,case" --flavor=woff --output-file=literata-latin.woff
```

Do the same with the italic file for literata-latin-italic.woff.
