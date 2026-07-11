#!/usr/bin/env python3
"""Build the Glauca PowerPoint templates from glauca.json.

Emits two .pptx files under dist/pptx/: Glauca.pptx (Pruina, light-first, the
default) and Glauca-Dark.pptx (Profundum, dark). Each carries a real Glauca
theme -- the clrScheme and fontScheme in ppt/theme/theme1.xml are rewritten so
any slide a user adds inherits Glauca's palette (dies blue leads accent1; the
colour-blind-safe dataviz set fills accent2-6) and fonts (IBM Plex Serif major,
IBM Plex Sans minor). The example slides double as layout demos.

Fonts must be installed on the opening machine (see src/fonts/README.md).
Run: python3 src/pptx/build_pptx.py   (needs python-pptx)
"""
import json, pathlib, zipfile, shutil, re, tempfile
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
D = json.loads((ROOT / "src" / "glauca.json").read_text())
OUT = ROOT / "dist" / "pptx"
OUT.mkdir(parents=True, exist_ok=True)

SERIF = "IBM Plex Serif"
SANS = "IBM Plex Sans"
# accent2-6: the colour-blind-safe dataviz categorical (drop its own blue; dies leads).
DATAVIZ = [c for c in D["dataviz"]["categorical"]["colors"] if c.lower() not in ("#0072b2",)]
EW, EH = Inches(13.333), Inches(7.5)


def rgb(hexv):
    return RGBColor.from_string(hexv.lstrip("#").upper())


def theme_variant(m):
    """clrScheme + fontScheme XML for one mode dict m."""
    acc = [m["accent"]] + DATAVIZ[:5]
    acc = (acc + DATAVIZ)[:6]
    hexes = {
        "dk1": m["text"] if m["scheme"] == "light" else m["text"],
        "lt1": m["bg"],
        "dk2": m["tint"], "lt2": m["surface-raised"],
        "accent1": acc[0], "accent2": acc[1], "accent3": acc[2],
        "accent4": acc[3], "accent5": acc[4], "accent6": acc[5],
        "hlink": m["accent"], "folHlink": m["tint-bright"],
    }
    # dark: swap so bg1(=lt1) is dark and tx1(=dk1) is light for user-added slides
    if m["scheme"] == "dark":
        hexes["dk1"], hexes["lt1"] = m["text"], m["bg"]
    order = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3",
             "accent4", "accent5", "accent6", "hlink", "folHlink"]
    clr = "".join(
        '<a:%s><a:srgbClr val="%s"/></a:%s>' % (k, hexes[k].lstrip("#").upper(), k)
        for k in order)
    clr = '<a:clrScheme name="Glauca">%s</a:clrScheme>' % clr
    font = (
        '<a:fontScheme name="Glauca">'
        '<a:majorFont><a:latin typeface="%s"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>'
        '<a:minorFont><a:latin typeface="%s"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>'
        '</a:fontScheme>' % (SERIF, SANS))
    return clr, font


def patch_theme(path, clr, font):
    """Rewrite clrScheme + fontScheme inside the saved pptx's theme1.xml."""
    tmp = pathlib.Path(tempfile.mkdtemp())
    with zipfile.ZipFile(path) as z:
        z.extractall(tmp)
    tp = tmp / "ppt" / "theme" / "theme1.xml"
    xml = tp.read_text(encoding="utf-8")
    xml = re.sub(r"<a:clrScheme.*?</a:clrScheme>", clr, xml, count=1, flags=re.S)
    xml = re.sub(r"<a:fontScheme.*?</a:fontScheme>", font, xml, count=1, flags=re.S)
    tp.write_text(xml, encoding="utf-8")
    path.unlink()
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(tmp.rglob("*")):
            if f.is_file():
                z.write(f, f.relative_to(tmp).as_posix())
    shutil.rmtree(tmp)


def text(slide, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
         space_after=6):
    """runs: list of (string, font, size, bold, italic, hexcolor)."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = 0
    tf.margin_top = tf.margin_bottom = 0
    first = True
    for line in runs:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = align
        p.space_after = Pt(space_after)
        for (s, font, size, bold, italic, col) in line:
            r = p.add_run(); r.text = s
            r.font.name = font; r.font.size = Pt(size)
            r.font.bold = bold; r.font.italic = italic
            r.font.color.rgb = rgb(col)
    return tb


def rect(slide, x, y, w, h, fill, line=None, lw=1.0, shape=MSO_SHAPE.RECTANGLE):
    sp = slide.shapes.add_shape(shape, x, y, w, h)
    sp.fill.solid(); sp.fill.fore_color.rgb = rgb(fill)
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = rgb(line); sp.line.width = Pt(lw)
    sp.shadow.inherit = False
    # Drop the inherited theme shape style: its effectRef pulls in an outer shadow,
    # which reads wrong for a flat system (and only rendered on the light deck).
    st = sp._element.find(qn("p:style"))
    if st is not None:
        sp._element.remove(st)
    return sp


def bg(slide, hexv):
    r = rect(slide, 0, 0, EW, EH, hexv)
    slide.shapes._spTree.remove(r._element)
    slide.shapes._spTree.insert(2, r._element)
    return r


def build(mode_key, filename):
    m = D["modes"][mode_key]
    C = {k: m[k] for k in m if isinstance(m[k], str)}
    accent = C["accent"]; accent_deep = C["accent-deep"]
    ink = C["text"]; muted = C["text-muted"]; field = C["bg"]
    surface = C["surface-raised"]; border = C["border"]; tint = C["tint"]
    on_accent = C["on-accent"]
    dark = m["scheme"] == "dark"
    marker_col = C["accent-bright"] if dark else accent
    tagline_col = muted if dark else tint
    swatch_border = muted            # a mid-grey reads against either mode's own ground
    link_col = D["modes"]["dark"]["accent-bright"]   # bright blue, legible on the dark closing panel

    prs = Presentation()
    prs.slide_width = EW; prs.slide_height = EH
    blank = prs.slide_layouts[6]

    # 1) Title -----------------------------------------------------------------
    s = prs.slides.add_slide(blank); bg(s, field)
    rect(s, Inches(0.9), Inches(2.35), Inches(0.42), Inches(0.42), accent)  # the one mark
    text(s, Inches(0.9), Inches(2.95), Inches(11), Inches(1.6),
         [[("Glauca", SERIF, 66, True, False, ink)]])
    text(s, Inches(0.92), Inches(4.35), Inches(10), Inches(0.7),
         [[(D["brand"]["tagline"], SANS, 22, False, True, tagline_col)]])
    text(s, Inches(0.92), Inches(6.75), Inches(11.5), Inches(0.5),
         [[("Design system", SANS, 12, False, False, muted),
           ("   ·   ", SANS, 12, False, False, border),
           ("v" + D["version"], SANS, 12, False, False, muted),
           ("   ·   ", SANS, 12, False, False, border),
           (m["label"], SANS, 12, False, False, muted)]])

    # 2) Section header --------------------------------------------------------
    s = prs.slides.add_slide(blank); bg(s, field)
    rect(s, 0, 0, Inches(0.35), EH, accent)  # side band = the mark, structural
    text(s, Inches(1.0), Inches(2.7), Inches(2), Inches(1.2),
         [[("01", SERIF, 40, True, False, accent)]])
    text(s, Inches(1.0), Inches(3.5), Inches(11), Inches(1.4),
         [[("Section title", SERIF, 40, True, False, ink)]])
    text(s, Inches(1.03), Inches(4.6), Inches(10), Inches(0.6),
         [[("A short standfirst in the sans voice.", SANS, 18, False, False, muted)]])

    # 3) Content: title + bullets ---------------------------------------------
    s = prs.slides.add_slide(blank); bg(s, field)
    text(s, Inches(0.9), Inches(0.6), Inches(11.5), Inches(1.0),
         [[("Content slide", SERIF, 34, True, False, ink)]])
    text(s, Inches(0.92), Inches(1.55), Inches(11), Inches(0.5),
         [[("Headings answer in IBM Plex Serif; the body reads in IBM Plex Sans.",
            SANS, 15, False, False, muted)]])
    bullets = ["One sky-blue mark on a frost-bloom field.",
               "The palette is generated from a single source of truth.",
               "Colour-blind-safe data colours carry every chart.",
               "Light-first: Pruina by day, Profundum by lamp."]
    lines = []
    for b in bullets:
        lines.append([("■  ", SANS, 15, False, False, marker_col),
                      (b, SANS, 17, False, False, ink)])
    text(s, Inches(0.95), Inches(2.5), Inches(11.2), Inches(4), lines, space_after=14)

    # 4) Palette showcase ------------------------------------------------------
    s = prs.slides.add_slide(blank); bg(s, field)
    text(s, Inches(0.9), Inches(0.6), Inches(11), Inches(1),
         [[("Palette", SERIF, 34, True, False, ink)]])
    sw = [("dies", accent), ("folium", "#62BA46"), ("cinis", "#8C8C8C"),
          ("ink", ink), ("field", field), ("tint", tint)]
    x0 = Inches(0.9); w = Inches(1.9); gap = Inches(0.1); top = Inches(2.0)
    for i, (name, hx) in enumerate(sw):
        x = Emu(int(x0) + i * (int(w) + int(gap)))
        rect(s, x, top, w, Inches(1.9), hx, line=swatch_border, lw=1.25)
        text(s, x, Emu(int(top) + int(Inches(2.05))), w, Inches(0.9),
             [[(name, SANS, 15, True, False, ink)],
              [(hx.upper(), SANS, 11, False, False, muted)]], space_after=2)

    # 5) Stat / callout --------------------------------------------------------
    s = prs.slides.add_slide(blank); bg(s, field)
    rect(s, Inches(0.9), Inches(1.4), Inches(5.6), Inches(4.6), surface, line=border, lw=1.0)
    text(s, Inches(1.25), Inches(1.4), Inches(4.9), Inches(4.6),
         [[("1", SERIF, 104, True, False, accent)],
          [("rare load-bearing mark", SANS, 20, False, False, ink)],
          [("Everything else is the cold field.", SANS, 14, False, True, muted)]],
         anchor=MSO_ANCHOR.MIDDLE, space_after=8)
    text(s, Inches(7.0), Inches(1.4), Inches(5.4), Inches(4.6),
         [[("The exception", SERIF, 26, True, False, ink)],
          [("", SANS, 8, False, False, muted)],
          [("Sky-blue stays rare on every surface: slides, posters, and web. "
            "Only the code tier spends it freely, where colour-blind safety "
            "puts the blue on keywords.", SANS, 16, False, False, muted)]],
         anchor=MSO_ANCHOR.MIDDLE, space_after=10)

    # 6) Closing ---------------------------------------------------------------
    s = prs.slides.add_slide(blank); bg(s, ink if m["scheme"] == "light" else field)
    close_ink = field if m["scheme"] == "light" else C["text"]
    rect(s, Inches(0.9), Inches(3.05), Inches(0.42), Inches(0.42), accent)
    text(s, Inches(0.9), Inches(3.7), Inches(11), Inches(1.3),
         [[("Clear glass, cold light.", SERIF, 40, True, False, close_ink)]],
         )
    text(s, Inches(0.92), Inches(5.0), Inches(11), Inches(0.6),
         [[("github.com/tiagojct/glauca", SANS, 15, False, False, link_col)]])

    path = OUT / filename
    prs.save(path)
    clr, font = theme_variant(m)
    patch_theme(path, clr, font)
    print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    build("light", "Glauca.pptx")
    build("dark", "Glauca-Dark.pptx")
