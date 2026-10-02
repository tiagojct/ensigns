# Changelog

Dates are commit dates.

## 0.1.0 (2026-10-01)

First release of Delight, the family for channels that destroy colour: greyscale laser print, photocopies, e-ink readers and tablets, forced colours and high-contrast modes, and monochrome terminals. It is named after the ship of chapter 131, The Pequod Meets The Delight.

- Sixteen-level grey ramp, `palette.grey.g0` to `g15`, mapped onto sixteen-level e-paper.
- Two modes: White ribs (light) for paper and e-paper, and Sad burial (dark) for high-contrast viewing.
- Core roles keeping at least 7:1 contrast for all text pairs in both modes.
- Achromatic status policy with four levels (neutral, success, warning, critical) distinguished by border style, stroke weight, fill and icon.
- `data.categorical` with five greys separated by at least 18 L*, and `data.sequential` grey sweep.
- Non-colour tokens in `design` for stroke widths, pattern hatching, dash styles, marker shapes and typography.
- Ansi and terminal blocks for monochrome terminals.
- Environments print-grey, eink, photocopy, forced-colors and cvd, passing with zero errors and no waivers.
- A specimen with a notice, sixteen-level e-ink comparison, patterned chart and status chips.
