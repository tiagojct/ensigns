# Typst slide theme

A minimal slide theme in plain Typst, no external package. Two modes:
dark (Profundum, the default) and light (Pruina). The title slide stays on the
deep navy field in both modes; content slides follow the chosen mode.

```
#import "glauca.typ": *
#show: glauca                    // or: glauca.with(mode: "light")

#title-slide(title: "Glauca", subtitle: "An identity in two modes")
#slide(title: "The rule")[The bloom is the field; the blue is the mark.]
#section-slide(kicker: "Part two", title: "A divider")
```

`slide()` sets a mono kicker, a hairline, a muted page number, and styles raw
code (inline chips and fenced blocks) on the raised surface. `section-slide()`
is the oversized serif divider.

Compile the demo:

```
typst compile demo.typ demo.pdf
```

IBM Plex Serif, Sans, and Mono must be installed on the system so Typst
can find them. See `src/fonts/README.md` in the repo.
