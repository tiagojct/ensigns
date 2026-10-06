# Changelog

Rosebud was called Ambergris until 0.3.0. Dates are commit dates.

## 0.5.0 (unreleased)

- Dark status accents use brighter steps from the existing grey ramp (D30). Every accent clears 4.5:1 on the page, sunken and raised surfaces and on its fill over each surface; the smallest measured ratio is 6.23:1. Severity increases in prominence from neutral to critical.
- Declared contrast pairs for the four dark status accents, plus regression checks for all surfaces and fills. The migration audit now compares status accents with the frozen Ambergris tokens and records each correction.
- A current workspace specimen with local token styles, distinct icons and labels, visible keyboard outlines and an underlined current navigation item. It passes forced colours in both modes without the old focus, current-item and network waivers.

Changed dark status accents on the page ground (grey 950, #1A1F26). Fill colours, border weights, edge styles and icons are unchanged.

| Level | Old | New | Old contrast | New contrast |
|---|---|---|---|---|
| neutral | #8D9298 | #AEB2B7 | 5.28 | 7.77 |
| success | #5C6168 | #C8CBD0 | 2.65 | 10.18 |
| warning | #42484E | #DCDFE3 | 1.79 | 12.39 |
| critical | #0C1117 | #FAFBFD | 1.14 | 16.00 |

## 0.4.0 (2026-09-30)

Moved into the Ensigns repository as Rosebud, formerly Ambergris 0.3.0.

- Same tokens in one schema: `rosebud.tokens.json` follows `schema/family.schema.json`, and its palette is the only place a colour value appears. The Ambergris roles take the core role names; the README lists the renames. No dark value changed.
- Light ANSI set authored for light grounds (decision D3). Red, green, yellow, blue, magenta and their bright forms keep the dark hue and chroma at a lower lightness; they form the new palette group ansi-light. Cyan and bright cyan move to accent 700 and accent 600. White, bright black and bright white move to mid greys. Each light slot has a declared pair on the light terminal background: text for the normal slots, large for the bright ones.
- Light syntax checked against 4.5:1 on the light background, the dark order and the dark styles, and kept.
- Light terminal chrome checked and kept.
- The check of the functional-hues rule covers ansi-light as well as ansi-dark.
- README and this changelog. The README carries the colour vision measurements and a proposal for two mode labels, whose quotations are in `meta.quotes`.
- `scripts/design/rosebud-light.ts` records the method and writes the list of changed values.

Changed light values, with the contrast on the light terminal background (grey 000, #FAFBFD). The old values are the ones the old site derived; Ambergris itself shipped no light terminal. Black is unchanged.

| Slot | Old | New | Old contrast | New contrast |
|---|---|---|---|---|
| red | #CF7F79 | #AA5E59 | 2.91 | 4.55 |
| green | #7BB587 | #488055 | 2.30 | 4.51 |
| yellow | #D4BC79 | #88722F | 1.80 | 4.51 |
| blue | #72A5DE | #4577AD | 2.49 | 4.51 |
| magenta | #B893D4 | #8966A3 | 2.48 | 4.51 |
| cyan | #5BB6B1 | #1B6864 | 2.31 | 6.32 |
| white | #C8CBD0 | #5C6168 | 1.57 | 6.03 |
| bright-black | #5C6168 | #72777D | 6.03 | 4.36 |
| bright-red | #E7958E | #C2736D | 2.23 | 3.40 |
| bright-green | #91CB9C | #5D9569 | 1.81 | 3.40 |
| bright-yellow | #E8CF8C | #9B8341 | 1.48 | 3.55 |
| bright-blue | #88BCF6 | #5A8DC4 | 1.92 | 3.36 |
| bright-magenta | #CEA9EB | #9E7BB9 | 1.93 | 3.39 |
| bright-cyan | #86CDC8 | #1E807B | 1.75 | 4.58 |
| bright-white | #FAFBFD | #8D9298 | 1.00 | 3.03 |

## 0.3.0 (2026-09-11)

Released with dark-only ports.

- Ports for Ghostty, Zed, Firefox and Mastodon, dark only, generated from the same tokens as the CSS.
- An ansi group: functional hues for the 16 terminal slots, diffs and diagnostics, tuned for dark grounds, with chroma capped near the accent and cyan taken from the accent ramp.
- A fourth design rule: functional hues exist for terminal and editor content only.
- Twelve contrast assertions for the ANSI slots at 4.5:1 on grey 1000, 23 in all.
- `ports/README.md` with install instructions.
- The Mastodon port vendors the Tangerine Neue template (MIT, Niléane Dorffer) and appends a refinement stylesheet.

## 0.2.0 (2026-07-27)

The first commit of the repository already carries 0.2.0, so this is the earliest state on record.

- `tokens.json` with a 13-step cool grey ramp (hue 254), a 10-step teal accent ramp (hue 190), translucent ink, paper and accent overlays, and two five-step data sweeps, one for light and one for dark chart backgrounds, derived from five supplied colours.
- Light and dark themes of 32 roles each, achromatic status tokens, border widths and radii, focus metrics and shadows.
- Three design rules and 11 contrast assertions.
- `build.mjs`, which checks the assertions and writes `ambergris.css` and a specimen page.

## 0.1.0

The history is too thin to say what 0.1.0 contained: the repository begins at 0.2.0, and its only mention of 0.1.0 is a comment in the token file that the status tokens are unchanged from it.
