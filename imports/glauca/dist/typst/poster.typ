// Generated from glauca.json. Glauca poster preset (Typst).
// Colours below are screen sRGB; substitute the CMYK in print/SPEC.md at output.

#let gl = (
  pix: rgb("#10161c"), pruina: rgb("#e8eef2"),
  dies: rgb("#007aff"), imum: rgb("#084b96"),
  tintdeep: rgb("#16303f"), tint: rgb("#35576b"),
  paper: rgb("#f0f4f6"), ink: rgb("#16222a"),
)

// poster(trim, bleed, safe, fill, body): page = trim + 2*bleed, with crop marks
// (top-left and bottom-right shown) and a non-printing safe-area guide.
// Light-first: the default field is the paper, the ink writes on it, and the
// one blue mark carries the emphasis.
#let poster(trim: (420mm, 594mm), bleed: 3mm, safe: 5mm, fill: gl.paper, body) = {
  set page(width: trim.at(0) + 2*bleed, height: trim.at(1) + 2*bleed, margin: 0pt, fill: fill)
  let m = 4mm
  place(top + left, dx: bleed, dy: 0mm, line(end: (0mm, m), stroke: 0.25pt + gl.ink))
  place(top + left, dx: 0mm, dy: bleed, line(end: (m, 0mm), stroke: 0.25pt + gl.ink))
  place(bottom + right, dx: -bleed, dy: 0mm, line(end: (0mm, -m), stroke: 0.25pt + gl.ink))
  place(bottom + right, dx: 0mm, dy: -bleed, line(end: (-m, 0mm), stroke: 0.25pt + gl.ink))
  place(top + left, dx: bleed + safe, dy: bleed + safe,
    rect(width: trim.at(0) - 2*safe, height: trim.at(1) - 2*safe,
      stroke: (paint: gl.dies, thickness: 0.25pt, dash: "dotted")))
  place(top + left, dx: bleed, dy: bleed,
    block(width: trim.at(0), height: trim.at(1), inset: safe + 10mm, body))
}

// Demo: one sky-blue mark on a frost-bloom field.
#poster(fill: gl.paper)[
  #set text(fill: gl.ink, font: "IBM Plex Serif")
  #text(size: 13pt, fill: gl.imum, font: "IBM Plex Mono", tracking: 3pt)[A GLAUCOUS DESIGN SYSTEM]
  #v(1fr)
  #text(size: 110pt, weight: 600)[Glauca]
  #v(6mm)
  #text(size: 22pt)[Clear glass, cold light.]
]
