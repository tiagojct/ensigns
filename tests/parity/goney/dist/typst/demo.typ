#import "glauca.typ": *

#show: glauca
// #show: glauca.with(mode: "light")

#title-slide(title: "Glauca", subtitle: "An identity in two modes")

#slide(title: "The rule")[
  The tint is the large frost field. Sky-blue is the rare load-bearing mark.
  #v(1.2em)
  #text(fill: dies, size: 40pt, font: "IBM Plex Serif", weight: 600)[One accent per slide.]
]

#section-slide(kicker: "Part two", title: "Code on the slide")

#slide(title: "A block of R")[
  Inline `summarise()` and fenced blocks:
  ```r
  midas |>
    dplyr::summarise(mean_fev1 = mean(fev1, na.rm = TRUE))
  ```
]

#slide(title: "AI in healthcare")[
  #text(font: "IBM Plex Serif", size: 44pt, weight: 600)[
    What a model can and cannot be trusted to do.
  ]
]
