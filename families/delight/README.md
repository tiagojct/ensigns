# Delight

Delight is the family for channels that destroy colour: greyscale laser print, photocopies, e-ink readers and tablets, forced colours and high-contrast modes, and monochrome terminals. It has a sixteen-level grey ramp that maps onto sixteen-level e-paper, pattern and line-style tokens for marks and charts, an achromatic status policy, and high-contrast text that reaches at least 7:1 in both modes. This is version 0.1.0.

The colours are in `delight.tokens.json` in this folder, which follows `schema/family.schema.json`. The palette in the token file is the only place a colour is defined. `scripts/design/delight.ts` records the derivation and stops if the token file differs from it. `specimen/` holds the notice, the e-ink comparison, the patterned chart and the status chips that the family page shows, and `CHANGELOG.md` holds the history.

## Goal

Every channel that destroys colour: greyscale laser print, photocopies, e-ink readers and tablets, forced colours and high-contrast modes, and monochrome terminals.

In these environments hue cannot carry information. Every distinction is made by lightness, stroke weight, pattern, marker shape or line style. Text, muted text included, reaches 7:1 or more on its ground. Muted text is distinguished by size and weight rather than pale ink.

## The ship

Chapter 131, The Pequod Meets The Delight. As the Pequod sails on, she encounters the wreck: "another ship, most miserably misnamed the Delight, was descried." Upon her shears are "the shattered, white ribs, and some few splintered planks, of what had once been a whale-boat". Her crew prepares to bury one of five men killed by the White Whale.

The mode labels come from the chapter. The light mode is White ribs, black ink on white paper and e-paper. The dark mode is Sad burial, the dark high-contrast mode with white ink on black.

## Environments

`meta.environments` lists five profiles. Each threshold and its reason is in `tests/environments.json`, and the checks are in `lib/harness`. `node scripts/report.ts delight` writes the checks with their measured values to `reports/delight.json`, and `npx vitest run tests/environments` runs the checks as tests.

- print-grey: every declared text pair keeps at least 7:1 after conversion to grey. Distinct sets marked for the profile differ by at least 12 L* unless patterned.
- eink: the sixteen-level grey ramp maps directly onto the sixteen levels of e-paper displays. Members of distinct sets marked for the profile land at least two levels apart.
- photocopy: intermediate fills sit between L* 25 and 80 so that copier thresholding does not clip them into pure black or white. Fills outside the window carry pattern tokens.
- forced-colors: checked in Chromium with forced colours active. The specimen provides focus outlines, a selectable prose paragraph, an `aria-current` item differing in border, underline or weight, and status chips differing in border style, border width and icon.
- cvd: distinct sets maintain at least 0.06 in OKLab under normal vision and protan, deutan and tritan simulations.

The declared text pairs also pass office-screen at WCAG AA. All profiles pass with zero errors, zero warnings and no waivers.

## Modes

| Mode | Label | Ground | Ground luminance | Text | Contrast | Accent |
|---|---|---|---|---|---|---|
| dark | Sad burial | `dark.bg` #000000 | 0.0000 | `dark.text` #FFFFFF | 21.00:1 | #FFFFFF |
| light | White ribs | `light.bg` #FFFFFF | 1.0000 | `light.text` #000000 | 21.00:1 | #000000 |

White ribs is black ink on white paper for print and e-paper. Sad burial is high contrast, white on black.

In both modes body text, muted text, links, buttons and accents keep 21.00:1 contrast against their ground. Subtle text keeps at least 12.63:1.

## Structure

The palette holds sixteen evenly spaced grey levels, `g0` (#000000) to `g15` (#FFFFFF), each corresponding to one e-ink level.

The core roles assign these levels:
- In White ribs: background is `g15`, surface is `g14`, text and muted text are `g0`, subtle text is `g3`, border is `g7`, selection is `g12`.
- In Sad burial: background is `g0`, surface is `g1`, text and muted text are `g15`, subtle text is `g12`, border is `g8`, selection is `g3`.

`data.categorical` holds five greys spaced 18.2 to 23.8 L* apart. In White ribs they run from `g1` to `g13`; in Sad burial from `g14` to `g2`. `data.sequential` provides a monotonic five-step grey sweep. `data.plot` sets the chart chrome.

`status` follows the achromatic policy. Each of the four levels (neutral, success, warning, critical) carries an edge style, a stroke weight from `design.stroke`, a grey fill, an accent line and an icon name.

`design` holds non-colour tokens:
- `design.stroke`: line widths thin (1.5 px), medium (2.5 px), thick (4.0 px) and hairline-min-pt (1.0 pt), avoiding fine hairlines that break in photocopies.
- `design.patterns`: hatching angles, spacing and line widths.
- `design.lines`: dash patterns for solid, dashed, dotted and dash-dot series.
- `design.markers`: marker shapes circle, square, triangle, diamond and cross.
- `design.type`: sizes and weights for headings, body and muted text.

## Rules

Three rules are declared in the token file:
- `status-achromatic`: status colours have OKLCH chroma below 0.02, verified by the `status-achromatic:0.02` check.
- `text-high-contrast`: every text pair reaches at least 7:1 contrast in both modes.
- `photocopy-sturdy`: lines and borders avoid hairlines below 1 pt to survive photocopies and e-ink displays.

## Measured results

Every figure comes from `lib/colour` and the harness.

Declared text pairs on their ground:
- Text on background: 21.00:1 in both modes.
- Text on surface: 18.10:1 in light, 18.88:1 in dark.
- Text on selection: 7.46:1 in light, 7.37:1 in dark.
- Subtle text on background: 12.63:1 in light, 13.08:1 in dark.

E-ink levels:
- `eink-roles`: adjacent roles differ by 3 to 5 levels on the sixteen-level scale, clearing the two-level minimum.

Print in grey:
- `print-grey-categories`: the five categorical greys differ by 18.2 to 23.8 L*, clearing the 12 L* minimum.

Photocopy:
- Intermediate fills sit between L* 28.9 and 75.9, within the [25, 80] window. The extreme fills `c1` and `c5` carry pattern tokens.

Colour vision:
- Status accents and categorical greys differ in OKLab by at least 0.18 under normal vision, protan, deutan and tritan simulations, clearing the 0.06 target.

## Typography

Atkinson Hyperlegible Next for sans, Bitter for serif and JetBrains Mono for monospace. Bitter was designed for screen and print legibility under harsh conditions, with sturdy serifs and thick strokes that avoid delicate hairlines. Atkinson Hyperlegible Next provides distinct letterforms with open apertures. JetBrains Mono provides unambiguous tabular numbers and symbols.

The font files are not bundled in this phase. The declarations name the family roles and use system fallbacks until font files are added in phase 4.

## What Delight is not for

- Expressing meaning by hue. The palette is entirely greyscale.
- Delicate hairline typography. Thin strokes wash out in photocopies and on low-resolution e-paper.
- Subtle low-contrast text. Muted text is kept at high contrast and distinguished by size and weight.
- Full syntax highlighting for code editors. The family excludes editor bundles.

## Licence

Code is MIT; colour tokens and documentation are CC BY 4.0. See the root `LICENSE`.
