#!/usr/bin/env python3
"""Make WOFF2 files for the TrueType fonts that the site bundles.

Run it from the repository root with fontTools and brotli installed:

    python3 -m pip install fonttools brotli
    python3 scripts/fonts/optimise.py

For every TrueType entry in site/public/fonts/sources.json that has no WOFF2 file yet, the script
writes <name>.woff2 beside it, adds an entry to sources.json that records the source file and both
SHA-256 hashes, and puts the WOFF2 file first in the @font-face rule of fonts.css. The TrueType file
stays as the fallback. Running it again changes nothing.

Two rules come from the SIL Open Font Licence. A font that declares a Reserved Font Name may not be
changed under that name, and removing glyphs is a change, so IBM Plex and Bitter are only converted
to WOFF2, with every glyph and every table kept except DSIG, a digital signature that WOFF2 never
carries. The other families are subset to Latin and the symbols
that the site's pages and specimens use, and keep all their layout features, variation axes and name
records (the copyright and licence notices).
"""
import hashlib
import json
import re
import sys
from pathlib import Path

import fontTools
from fontTools import subset
from fontTools.ttLib import TTFont

FONTS = Path("site/public/fonts")
# The families whose licence declares a Reserved Font Name: IBM Plex ("Plex") and Bitter ("Bitter Pro").
CONVERT_ONLY = {"IBM Plex Mono", "IBM Plex Sans", "IBM Plex Serif", "Bitter"}
# Latin, Latin Extended, combining marks, general punctuation, super- and subscripts, currency, letterlike
# symbols, arrows, mathematical operators, block elements, geometric shapes and dingbats. A font that has
# no glyph in a range is not affected. The pages use ° µ · × á ã ç é ê ó õ ú ’ ⁹ ▌ ▲ ◆ ◇ ○ ● ✓ ✕.
UNICODES = (
    "U+0000-024F,U+0259,U+02B0-02FF,U+0300-036F,U+1E00-1EFF,U+2000-209F,U+20A0-20CF,"
    "U+2100-214F,U+2190-21FF,U+2200-22FF,U+2580-25FF,U+2700-27BF,U+FEFF,U+FFFD"
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def convert(src: Path, dst: Path) -> None:
    # recalcTimestamp=False keeps fontTools from writing the time of the run into the head table,
    # so that the same source gives the same bytes and the recorded hashes can be checked again.
    font = TTFont(src, recalcTimestamp=False)
    font.flavor = "woff2"
    font.save(dst)


def subset_font(src: Path, dst: Path) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.glyph_names = False
    options.hinting = True
    options.legacy_kern = True
    font = TTFont(src, recalcTimestamp=False)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)
    subset.save_font(font, dst, options)


def main() -> int:
    sources_path = FONTS / "sources.json"
    sources = json.loads(sources_path.read_text())
    position = {entry["file"]: i for i, entry in enumerate(sources)}
    added = []
    for entry in list(sources):
        name = entry["file"]
        if not name.endswith(".ttf") or "derivedFrom" in entry:
            continue
        out_name = name[: -len(".ttf")] + ".woff2"
        src, dst = FONTS / name, FONTS / out_name
        # A file that is recorded and present is left alone. One that is recorded and missing is made again,
        # and its entry is replaced, so that the hashes stay true and the list holds no duplicate.
        if out_name in position and dst.exists():
            continue
        if entry["family"] in CONVERT_ONLY:
            convert(src, dst)
            how = (
                "Converted to WOFF2 with fontTools " + fontTools.version + ", with every glyph and every table kept, "
                "except DSIG, a digital signature that WOFF2 never carries. "
                "The licence declares a Reserved Font Name, so the font is not subset."
            )
        else:
            subset_font(src, dst)
            how = (
                "Subset with fontTools " + fontTools.version + " to Basic Latin, Latin Extended, combining marks, general "
                "punctuation, symbols and arrows (" + UNICODES + "), keeping all layout features, variation axes and "
                "name records, and written as WOFF2."
            )
        derived = {
            "family": entry["family"],
            "file": out_name,
            "source": entry["source"],
            "sha256": sha256(dst),
            "italic": entry.get("italic", False),
            "variable": entry.get("variable", False),
            "weight": entry.get("weight", 400),
            "derivedFrom": name,
            "derivedFromSha256": sha256(src),
            "derivation": how,
        }
        if out_name in position:
            sources[position[out_name]] = derived
        else:
            position[out_name] = len(sources)
            sources.append(derived)
        added.append((name, src.stat().st_size, dst.stat().st_size))
    if added:
        sources_path.write_text(json.dumps(sources, indent=2, ensure_ascii=False) + "\n")

    css_path = FONTS / "fonts.css"
    css = css_path.read_text()
    pattern = re.compile(r'src:url\("([^"]+)\.ttf"\) format\("truetype"\)')
    new_css = pattern.sub(lambda m: f'src:url("{m.group(1)}.woff2") format("woff2"),url("{m.group(1)}.ttf") format("truetype")', css)
    if new_css != css:
        css_path.write_text(new_css)

    for name, before, after in added:
        print(f"{name:55s} {before:9d} -> {after:9d} bytes")
    print(f"{len(added)} WOFF2 files made, {sum(a for _, _, a in added):,} bytes from {sum(b for _, b, _ in added):,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
