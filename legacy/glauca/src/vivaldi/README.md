# Glauca for Vivaldi

Two Vivaldi browser themes in the Glauca palette: a frost-bloom field,
one sky-blue load-bearing mark.

- `Glauca-Dark.zip` — **Profundum** (dark)
- `Glauca.zip` — **Pruina** (light)

A Vivaldi theme is five base colours -- Vivaldi derives the rest -- plus
behaviour flags (`colorBg`, `colorFg`, `colorAccentBg` = the blue mark,
`colorHighlightBg` = the sea, `colorWindowBg`). The minimum-contrast floor is set
to 5 so the text Vivaldi generates for tabs and the address field holds the same
AA-ish legibility the rest of the system guarantees; the window stays opaque and
the blue is kept off the whole chrome (`accentOnWindow` off) so it marks only the
accent elements. The `settings.json` is generated from `src/glauca.json`; edit
the json and run `make generate`, never the theme. `assemble.sh` zips each mode
into an importable `.zip`.

## Install

Vivaldi has no theme-folder drop-in; import through the UI:

1. Settings → Themes → **Import Theme** (the folder-with-arrow button at the
   bottom of the theme gallery).
2. Pick `Glauca-Dark.zip` (or `Glauca.zip`).
3. The theme appears in the gallery; click to apply.

Or drag the `.zip` onto the Themes settings page.
