// Glauca — a Typst slide theme. Colours are generated into colors.typ.
#import "colors.typ": *

#let glauca(body) = {
  set page(paper: "presentation-16-9", margin: 0pt, fill: tint-deep)
  set text(font: "IBM Plex Sans", fill: pruina, size: 24pt)
  show heading: set text(font: "IBM Plex Serif")
  body
}
#let title-slide(title: "", subtitle: "") = {
  page(fill: tint-deep)[
    #place(bottom + left, dx: 3cm, dy: -3cm)[
      #text(font: "IBM Plex Serif", size: 72pt, weight: 600, fill: pruina)[#title]
      #v(0.3em)
      #text(font: "IBM Plex Mono", size: 15pt, fill: dies, tracking: 3pt)[#upper(subtitle)]
    ]
  ]
}
#let slide(title: "", body) = {
  page(fill: pix, margin: (x: 3cm, y: 2.4cm))[
    #text(font: "IBM Plex Mono", size: 13pt, fill: dies, tracking: 2pt)[#upper(title)]
    #v(0.5em); #line(length: 100%, stroke: 0.5pt + cinis); #v(1em)
    #set text(fill: pruina); #body
  ]
}
