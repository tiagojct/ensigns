# Changelog

Dates are commit dates.

## 0.1.0 (2026-09-30)

First release of Bachelor, the family for slides, posters, signage and conference banners read at 5 to 20 metres. It is named after the ship of chapter 115, The Pequod Meets The Bachelor.

- Eight flags, `accents.<flag>`: red, orange, yellow, green, cyan, blue, violet and magenta. Each has an ink, `extra.ink-<flag>`. Four flags are deep fields with white ink and four are bright fields with a dark ink, and none lies between the two bands. The flags and inks are the same in both modes.
- Two modes: Brazen lamp (dark) for dark rooms and Holiday apparel (light) for lit ones. Each has a ground, three surfaces, three text colours, a rule, and one flag as the accent, blue on the light ground and yellow on the dark one.
- `data.categorical` holds the eight flags, most separable first, and `data.plot` holds the chart chrome, with an outline colour for the edge of a mark.
- The environments are projector, cvd and print-grey. All three pass, with the declared pairs also passing office-screen, and the token file has no exception.
- In print in grey, five flags stand on lightness, 12.4 L* or more apart. Green, cyan and magenta are declared patterned, and every flag has a pattern token in `design`.
- Type: Overpass for text and display, with sizes derived from the viewing distance in `design`.
- `scripts/design/bachelor.ts` records the derivation and stops if the token file differs from it. `scripts/design/bachelor-gamut.py` checks the flags against a CMYK profile. With the stand-in macOS profile all eight flags move by more than 0.02 in OKLab, and no `cmyk` value is set.
- A specimen with a title slide, a section slide on each field, a chart slide and a poster header, each drawn plain and with the flare of a lit room.
- A candidate in `candidates/ladder.tokens.json` trades body text on red and green to keep seven flags on lightness in print.
