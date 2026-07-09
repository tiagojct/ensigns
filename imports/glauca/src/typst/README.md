# Typst slide theme

A minimal slide theme in plain Typst, no external package.

```
#import "glauca.typ": *
#show: glauca

#title-slide(title: "Glauca", subtitle: "An identity in two modes")
#slide(title: "The rule")[The bloom is the field; the blue is the mark.]
```

Compile the demo:

```
typst compile demo.typ demo.pdf
```

IBM Plex Serif, Sans, and Mono must be installed on the system so Typst
can find them. See `../fonts/README.md`.
