// Glauca — a Typst slide theme. Colours are generated into colors.typ.
// Dark (Profundum) is the default deck; light (Pruina) is one argument away:
//   #show: glauca.with(mode: "light")
#import "colors.typ": *

#let _mode = state("glauca-mode", "dark")
#let _pal() = if _mode.get() == "light" { light } else { dark }

#let glauca(mode: "dark", body) = {
  _mode.update(mode)
  show heading: set text(font: "IBM Plex Serif")
  body
}

// The title slide is the deep field in both modes: the water the bloom
// floats on. Pale text, one blue kicker, nothing else.
#let title-slide(title: "", subtitle: "") = context {
  let m = _pal()
  page(fill: m.tint_deep, margin: 0pt)[
    #place(bottom + left, dx: 3cm, dy: -3cm)[
      #text(font: "IBM Plex Serif", size: 72pt, weight: 600, fill: pruina)[#title]
      #v(0.3em)
      #text(font: "IBM Plex Mono", size: 15pt, fill: aer, tracking: 3pt)[#upper(subtitle)]
    ]
  ]
}

// A section divider: oversized serif, small kicker, the mode's field.
#let section-slide(kicker: "", title: "") = context {
  let m = _pal()
  page(fill: m.bg, margin: (x: 3cm, y: 2.4cm))[
    #align(horizon)[
      #if kicker != "" {
        text(font: "IBM Plex Mono", size: 13pt, fill: m.accent, tracking: 2pt)[#upper(kicker)]
        v(0.6em)
      }
      #text(font: "IBM Plex Serif", size: 54pt, weight: 600, fill: m.text)[#title]
    ]
  ]
}

// One blue mark per slide: the mono kicker above the hairline. Code blocks sit
// on the raised surface; the page number stays muted in the footer.
#let slide(title: "", body) = context {
  let m = _pal()
  page(
    fill: m.bg,
    margin: (x: 3cm, y: 2.4cm),
    footer: context align(right, text(
      font: "IBM Plex Mono", size: 12pt, fill: m.muted, counter(page).display())),
  )[
    #set text(font: "IBM Plex Sans", fill: m.text, size: 24pt)
    #show raw.where(block: true): it => block(
      fill: m.raised, stroke: 0.5pt + m.border, inset: 12pt, radius: 4pt, width: 100%,
      text(font: "IBM Plex Mono", size: 15pt, fill: m.text, it))
    #show raw.where(block: false): box.with(
      fill: m.raised, outset: (x: 3pt, y: 2.5pt), radius: 3pt)
    #text(font: "IBM Plex Mono", size: 13pt, fill: m.accent, tracking: 2pt)[#upper(title)]
    #v(0.5em)
    #line(length: 100%, stroke: 0.5pt + m.border)
    #v(1em)
    #body
  ]
}
