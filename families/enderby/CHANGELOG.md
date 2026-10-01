# Changelog

Dates are commit dates.

## 0.1.0 (2026-09-30)

First release. Enderby is new in Ensigns and has no earlier version.

- Token file: `enderby.tokens.json` follows `schema/family.schema.json`. Its palette has 93 entries in 14 groups, and both modes, Ivory (light) and Pilot-cloth (dark), define the same addresses. It has no syntax, ANSI, terminal or status blocks, and its `targets.exclude` lists the editor and terminal bundles.
- Environments: figure, cvd, print-grey and projector for a dark room. All four pass, and so does office-screen, which runs because the file declares 18 pairs.
- Categories: eight colours, c1 to c8, most separable first. They match Okabe-Ito's smallest pairwise OKLab distance under normal vision and under protan, deutan and tritan simulation, in both modes, and beat it on greyscale separation among the first four (13.5 L* against 0.8), on the spread of lightness and on the number of marks below 3:1 on the figure ground. The first four are 12 L* or more apart in both modes; categories five to eight are told apart in print by markers and dash patterns.
- Sequential ramps: `pilot` (one hue), `brass` (one hue) and `lagoon` (several hues), nine steps each, equal in OKLab distance, with lightness monotone. The dark mode reads each ramp in the opposite order, so the two modes share the colours.
- Diverging ramps: `blue-orange` and `teal-brass`, nine steps each, symmetric in lightness, with a neutral centre and extremes that keep 3:1 on both grounds. The two modes share the colours.
- Chart chrome: `data.plot` with background, panel, text, muted, axis, grid, outline, focus and context, and the focus-and-context pattern (focus is c1, context is a grey).
- Declarations: 18 pairs, three distinct sets (all eight categories for projector, the first four for print-grey, and the eight with the last four patterned for print-grey) and eight rules, of which five name a check.
- Design tokens: a marker and a dash pattern for each of the eight series, stroke widths, a type scale and the projector room.
- Typography: Inter, Inter Display and JetBrains Mono. The fonts are not included.
- Second design: `candidates/balanced.tokens.json` holds eight categories inside a band of 20 L* in each mode. It passes figure, cvd, office-screen, projector and print-grey, the last by declaring all eight categories patterned, and it loses on greyscale separation. `enderby.ts --write` generates it from the primary file.
- Specimen: six figures, a series key and the scales in `specimen/`, written by `scripts/design/enderby-specimen.ts` from invented data.
- Scripts: `scripts/design/enderby.ts` records the derivation and checks both token files against it, and `scripts/design/enderby-search.ts` holds the seeded search for the categorical colours.
- README and this changelog. `tests/families/enderby.test.ts` locks the structure.
