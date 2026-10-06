# PowerPoint templates

Two Glauca templates for PowerPoint, Keynote, and Google Slides (all open
`.pptx`), built from `src/glauca.json`:

- `dist/pptx/Glauca.pptx` — Pruina, light-first (the default)
- `dist/pptx/Glauca-Dark.pptx` — Profundum, dark

Each carries a real Glauca **theme**, not just pre-coloured slides: the
`clrScheme` and `fontScheme` in the deck's `theme1.xml` are rewritten so any
slide you add inherits the palette and fonts.

## What's in the theme

- **Fonts** — major (headings) is IBM Plex Serif, minor (body) is IBM Plex Sans.
  They must be installed on the machine that opens the file; see
  [../fonts/README.md](../fonts/README.md).
- **Colours** — `accent1` is dies (the one blue mark); `accent2`–`accent6` are
  the colour-blind-safe Okabe-Ito dataviz set, so charts stay legible under
  every colour-vision type. `dk1`/`lt1` are ink and the frost field (swapped for
  the dark deck so user-added slides render dark-on-light correctly).

## Example slides

The six slides double as layout demos: title, section header, content with
bullets, a palette reference, a stat callout, and a closing panel. Duplicate the
one closest to what you need, or start a blank slide and let the theme dress it.

## Build

```
make pptx        # or: python3 src/pptx/build_pptx.py
```

Needs `python-pptx` (`pip install python-pptx`). Not part of `make generate`:
the output is binary, so it sits outside the drift gate alongside `make fonts`
and `make demo`.
