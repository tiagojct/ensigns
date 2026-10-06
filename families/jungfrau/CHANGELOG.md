# Changelog

Jungfrau was called Try-Works until 1.0.0.

## 2.0.0 (2026-09-30)

Try-Works becomes Jungfrau, after the ship of chapter 81, and moves into the Ensigns repository as its night family: reading, writing and code in a dark room. The token file is now `families/jungfrau/jungfrau.tokens.json`, in the Ensigns schema (`schema/family.schema.json`), and it replaces `src/try-works.json`. Most colours changed, so the major version goes up. The design is in `scripts/design/jungfrau.ts`, which derives each colour in OKLCH from a stated rule and checks the night gates as it goes. The changes answer glare, halation and dark adaptation; nothing here claims an effect on sleep or melatonin.

Changed, dark mode (Try-Fire):

- The ground moves from #12161B (relative luminance 0.0078) to #171B21 (0.0108), inside the target band of 0.010 to 0.012 (decision D11), and keeps the sea hue. The surfaces and the border step up with it.
- Body text moves from #F1EFE9 to #AFACA2, from 15.79:1 to 7.61:1 on the ground, inside the night band of 7:1 to 11:1. The old text colour had a luminance of 0.863, far over the new cap of 0.45. Muted text moves from #97A0A4 (6.82:1) to #878F93 (5.25:1).
- Ember moves from #C9651D to #D56F2B and rises from 4.15:1 to 4.59:1 on the current line, so the keyword no longer needs the editor waiver that the migrated Try-Works tokens carried. Flame moves from #E0832A to #E78D32 to stay at least 0.06 from ember. Oil keeps #9A4A16.
- No text is blue. The function colour, tide, was #5F93B0 at OKLCH hue 234 and chroma 0.071; it is now #4F9BA5 at hue 207. ANSI blue #46708A becomes a slate, #8FA5B5, at chroma 0.034. Blues remain only as dark fields.
- The code hues were retuned together inside the night limits: kelp #86A87F to #93AC65, brick #D06A52 to #BF7881, dusk #A487BA to #BF97D3, tide as above, shoal #5F97A0 to #7CBE9F. In 1.0.0 function and type were 0.030 apart. In 2.0.0 the smallest distance between two Try-Fire code hues is 0.074 under normal vision and 0.068 under any simulation, and the set is a gate in every view.
- No colour in the mode is brighter than a relative luminance of 0.45. The brightest is now 0.448, the last step of the sequential chart scale.

Changed, light mode (Lamp-feeder, formerly True Lamp):

- The light mode becomes lamplight: a dimmed warm paper for reading at night. True Lamp was a cool sea-salt paper, #DEE7E4 at luminance 0.783, with its raised surface #F2F7F4 at 0.919. Lamp-feeder is #B5A892 at 0.399, with its raised surface #BCB09C at 0.441. Ink moves from #18272B (12.21:1) to #16100A (8.07:1). Every light colour was derived again for this paper, and none is brighter than luminance 0.45.
- In True Lamp flame and oil were both #7A3A10. Lamp-feeder has ember #602500, flame #7E3B02 and oil #381509.
- True Lamp reused the dark ANSI colours, and on its paper 10 of the 16 were below 3:1 (problem P12 in `docs/migration/CHECKPOINT-1.md`). Lamp-feeder has a set of its own: every normal colour reaches 4.5:1 on the paper and every bright colour 3:1.
- The label changes from True Lamp to Lamp-feeder (decision D17). In chapter 96 the only true lamp is the sun, and a dimmed paper read by lamplight did not fit the name. The new label is the lamp-feeder the Jungfrau's captain carries in chapter 81.

Changed, charts:

- The chart scales were derived again under the brightness cap. In Try-Fire the Okabe-Ito yellow moves from #F0E442 to #C0B300 and the other six are unchanged. In Lamp-feeder all seven Okabe-Ito colours are darkened to about 3:1 on the paper (2.99 to 3.05). The sequential teal and the diverging teal-amber scales were derived again in both modes. In Try-Fire the sequential teal now runs from dark to light; in 1.0.0 it ran from light to dark in both modes.

Added:

- Five rules: `night-ground`, `no-blue-text`, `brightness-cap` and `lamplight`, checked by the night profile, and `no-health-claims`, which binds the prose. The 1.0.0 rules `one-hot-mark` and `cold-field` stay.
- The distinct set `fire-trio` (ember, flame and oil) in both modes, possible now that flame and oil no longer share a light value.
- Twelve contrast pairs for the terminal: the six ANSI hue colours at 4.5:1 and their bright forms at 3:1 on the terminal background. The token file now declares 21 pairs.
- Gates where the migrated Try-Works tokens only had baselines. The Try-Fire code hues had a floor of 0.030 and were reported under simulation; now they are a gate at 0.06 under normal vision and under every simulation. For the Lamp-feeder code hues the floor rises from 0.019 to 0.06, with eight pairs reinforced by style (keyword bold; number, constant and type italic) and the rest reported under simulation. ANSI hue colours go from a floor of 0.043 to 0.06.

Removed:

- The editor waiver for the Try-Fire keyword on the current line.
- Nine 1.0.0 colours that no role uses any more. `tests/shared/migration-dropped.json` lists them.

The Unreleased section below records work on Try-Works after 1.0.0 that was never tagged. Because the migration read the last commit of the Try-Works repository, dated 2026-08-09, the 1.0.0 values in the tables below include that work. Its targets (VS Code, Zed, iTerm2, oh-my-zsh, Obsidian, Vivaldi) are not generated in this release; their generators will be ported in a later phase. This folder's README was rewritten for Ensigns, and its installation notes will return with the packages.

### Old values

Every address whose colour changed, with its 1.0.0 and 2.0.0 value, from `docs/migration/phase2/jungfrau-before-after.json`. `tests/shared/expected-changes/jungfrau.json` gives a reason for each of the 157 addresses that the old Gam site's model covered.

#### Try-Fire (dark)

88 addresses changed.

| Address | 1.0.0 | 2.0.0 |
|---|---|---|
| roles.bg | #12161B | #171B21 |
| roles.surface | #1B2127 | #1D242A |
| roles.surface-raised | #232B32 | #242B32 |
| roles.text | #F1EFE9 | #AFACA2 |
| roles.text-muted | #97A0A4 | #878F93 |
| roles.text-subtle | #97A0A4 | #878F93 |
| roles.border | #2C3640 | #2E3741 |
| roles.link | #C9651D | #D56F2B |
| roles.link-hover | #E0832A | #E78D32 |
| roles.accent | #C9651D | #D56F2B |
| roles.on-accent | #11151A | #171B21 |
| roles.button | #C9651D | #D56F2B |
| roles.on-button | #11151A | #171B21 |
| roles.focus | #E0832A | #E78D32 |
| extra.accent-bright | #E0832A | #E78D32 |
| extra.contrast-more-text-muted | #9BA3A7 | #949DA1 |
| extra.contrast-more-border | #5F666C | #626970 |
| accents.ember | #C9651D | #D56F2B |
| accents.flame | #E0832A | #E78D32 |
| accents.kelp | #86A87F | #93AC65 |
| accents.brick | #D06A52 | #BF7881 |
| accents.dusk | #A487BA | #BF97D3 |
| accents.tide | #5F93B0 | #4F9BA5 |
| accents.shoal | #5F97A0 | #7CBE9F |
| surfaces.editor | #12161B | #171B21 |
| surfaces.editor-line | #1B2127 | #1D242A |
| surfaces.editor-selection | #1C2A31 | #1F2D35 |
| surfaces.sidebar | #1B2127 | #1D242A |
| syntax.keyword | #C9651D | #D56F2B |
| syntax.string | #86A87F | #93AC65 |
| syntax.number | #A487BA | #BF97D3 |
| syntax.comment | #97A0A4 | #878F93 |
| syntax.function | #5F93B0 | #4F9BA5 |
| syntax.type | #5F97A0 | #7CBE9F |
| syntax.constant | #A487BA | #BF97D3 |
| syntax.variable | #F1EFE9 | #AFACA2 |
| syntax.operator | #AEB6B8 | #8F9798 |
| syntax.punctuation | #8A9296 | #868D91 |
| syntax.decorator | #D06A52 | #BF7881 |
| syntax.parameter | #CDD2D3 | #999EA0 |
| ansi.black | #1B2127 | #1D242A |
| ansi.red | #C05A3A | #B56F78 |
| ansi.green | #6F8F6A | #8AA35C |
| ansi.yellow | #C9651D | #D56F2B |
| ansi.blue | #46708A | #8FA5B5 |
| ansi.magenta | #8A6F9E | #B58EC9 |
| ansi.cyan | #5F97A0 | #45929C |
| ansi.white | #C9CCCE | #A3A19E |
| ansi.bright-black | #3A4754 | #49535E |
| ansi.bright-red | #D06A52 | #BF7881 |
| ansi.bright-green | #86A87F | #93AC65 |
| ansi.bright-yellow | #E0832A | #E78D32 |
| ansi.bright-blue | #5F93B0 | #9AB2C3 |
| ansi.bright-magenta | #A487BA | #BF97D3 |
| ansi.bright-cyan | #8FB6BD | #5FABB5 |
| ansi.bright-white | #F1EFE9 | #AFACA2 |
| terminal.background | #12161B | #171B21 |
| terminal.foreground | #F1EFE9 | #AFACA2 |
| terminal.cursor | #C9651D | #E78D32 |
| terminal.cursor-text | #11151A | #171B21 |
| terminal.selection-foreground | #F1EFE9 | #AFACA2 |
| status.danger | #D06A52 | #BF7881 |
| status.warning | #C9651D | #D56F2B |
| status.success | #86A87F | #93AC65 |
| status.info | #5F93B0 | #4F9BA5 |
| status.hint | #5F97A0 | #7CBE9F |
| status.conflict | #A487BA | #BF97D3 |
| data.categorical.yellow | #F0E442 | #C0B300 |
| data.sequential.teal.1 | #E4F5FB | #053535 |
| data.sequential.teal.2 | #B3E0EE | #054C4C |
| data.sequential.teal.3 | #7EC4D7 | #136262 |
| data.sequential.teal.4 | #48A0B7 | #2B7979 |
| data.sequential.teal.5 | #0A7B93 | #48908F |
| data.sequential.teal.6 | #00576C | #6AA6A5 |
| data.sequential.teal.7 | #003542 | #8EBBBA |
| data.diverging.teal-amber.1 | #00576E | #117878 |
| data.diverging.teal-amber.2 | #287D93 | #438787 |
| data.diverging.teal-amber.3 | #72A9B4 | #659796 |
| data.diverging.teal-amber.4 | #BBD7D9 | #84A6A5 |
| data.diverging.teal-amber.5 | #F1EEE6 | #B4B1A9 |
| data.diverging.teal-amber.6 | #E7CCAE | #AE9B86 |
| data.diverging.teal-amber.7 | #DA9B6A | #A18769 |
| data.diverging.teal-amber.8 | #C26D32 | #95734C |
| data.diverging.teal-amber.9 | #984A1A | #88602D |
| data.plot.bg | #12161B | #171B21 |
| data.plot.grid | #2C3640 | #2E3741 |
| data.plot.text | #F1EFE9 | #AFACA2 |
| data.plot.muted | #97A0A4 | #878F93 |

Unchanged: roles.selection (#2C4953), extra.accent-deep (#9A4A16), extra.tint-deep (#14242C), extra.tint (#2C4953), extra.tint-bright (#4D7680), extra.tint-pale (#8FB6BD), extra.on-tint (#0F1C22), accents.oil (#9A4A16), terminal.selection-background (#2C4953), data.categorical.orange (#E69F00), data.categorical.blue (#0072B2), data.categorical.bluish-green (#009E73), data.categorical.reddish-purple (#CC79A7), data.categorical.vermillion (#D55E00), data.categorical.sky-blue (#56B4E9).

#### Lamp-feeder (light), True Lamp in 1.0.0

103 addresses changed.

| Address | 1.0.0 | 2.0.0 |
|---|---|---|
| roles.bg | #DEE7E4 | #B5A892 |
| roles.surface | #E7EFEB | #BAAD97 |
| roles.surface-raised | #F2F7F4 | #BCB09C |
| roles.text | #18272B | #16100A |
| roles.text-muted | #52646A | #3C342A |
| roles.text-subtle | #52646A | #3C342A |
| roles.border | #C4D2CD | #A59986 |
| roles.link | #9E5017 | #602500 |
| roles.link-hover | #7A3A10 | #381509 |
| roles.accent | #9E5017 | #602500 |
| roles.on-accent | #EEF3F0 | #B2A895 |
| roles.button | #9E5017 | #602500 |
| roles.on-button | #EEF3F0 | #B2A895 |
| roles.focus | #9E5017 | #602500 |
| roles.selection | #B4CCC9 | #678B8A |
| extra.accent-bright | #B85F1C | #7E3B02 |
| extra.accent-deep | #7A3A10 | #381509 |
| extra.tint-deep | #16242B | #132129 |
| extra.tint | #264852 | #1A3D46 |
| extra.tint-bright | #3D6B76 | #2E5963 |
| extra.tint-pale | #B4CCC9 | #678B8A |
| extra.on-tint | #EEF3F0 | #B2A895 |
| extra.contrast-more-text-muted | #3C4D52 | #2E261E |
| extra.contrast-more-border | #758382 | #595147 |
| accents.ember | #9E5017 | #602500 |
| accents.flame | #7A3A10 | #7E3B02 |
| accents.oil | #7A3A10 | #381509 |
| accents.kelp | #4F6855 | #32432C |
| accents.brick | #7D4C40 | #560E17 |
| accents.dusk | #655C7A | #3A2A57 |
| accents.tide | #3F6274 | #004552 |
| accents.shoal | #3F656B | #16342C |
| surfaces.editor | #DEE7E4 | #B5A892 |
| surfaces.editor-line | #E7EFEB | #BAAD97 |
| surfaces.editor-selection | #CDDCD9 | #969C8F |
| surfaces.sidebar | #E7EFEB | #BAAD97 |
| syntax.keyword | #9E5017 | #602500 |
| syntax.string | #4F6855 | #32432C |
| syntax.number | #655C7A | #3A2A57 |
| syntax.comment | #52646A | #3C342A |
| syntax.function | #3F6274 | #004552 |
| syntax.type | #3F656B | #16342C |
| syntax.constant | #655C7A | #3A2A57 |
| syntax.variable | #18272B | #16100A |
| syntax.operator | #52646A | #3C342A |
| syntax.punctuation | #52646A | #3C342A |
| syntax.decorator | #7D4C40 | #560E17 |
| syntax.parameter | #2C3C41 | #2C251F |
| ansi.black | #1B2127 | #16100A |
| ansi.red | #C05A3A | #560E17 |
| ansi.green | #6F8F6A | #32432C |
| ansi.yellow | #C9651D | #602500 |
| ansi.blue | #46708A | #142733 |
| ansi.magenta | #8A6F9E | #3A2A57 |
| ansi.cyan | #5F97A0 | #004552 |
| ansi.white | #C9CCCE | #3D3832 |
| ansi.bright-black | #3A4754 | #3E4749 |
| ansi.bright-red | #D06A52 | #671F25 |
| ansi.bright-green | #86A87F | #40523A |
| ansi.bright-yellow | #E0832A | #7E3B02 |
| ansi.bright-blue | #5F93B0 | #415969 |
| ansi.bright-magenta | #A487BA | #483867 |
| ansi.bright-cyan | #8FB6BD | #175461 |
| ansi.bright-white | #F1EFE9 | #56514C |
| terminal.background | #DEE7E4 | #B5A892 |
| terminal.foreground | #18272B | #16100A |
| terminal.cursor | #9E5017 | #602500 |
| terminal.cursor-text | #EEF3F0 | #B2A895 |
| terminal.selection-background | #264852 | #678B8A |
| terminal.selection-foreground | #EEF3F0 | #16100A |
| status.danger | #7D4C40 | #560E17 |
| status.warning | #9E5017 | #602500 |
| status.success | #4F6855 | #32432C |
| status.info | #3F6274 | #004552 |
| status.hint | #3F656B | #16342C |
| status.conflict | #655C7A | #3A2A57 |
| data.categorical.orange | #E69F00 | #7D4E00 |
| data.categorical.blue | #0072B2 | #005B9A |
| data.categorical.bluish-green | #009E73 | #006543 |
| data.categorical.reddish-purple | #CC79A7 | #8B3E6B |
| data.categorical.vermillion | #D55E00 | #9E3600 |
| data.categorical.sky-blue | #56B4E9 | #005E8E |
| data.categorical.yellow | #F0E442 | #625A00 |
| data.sequential.teal.1 | #E4F5FB | #81AFAE |
| data.sequential.teal.2 | #B3E0EE | #5E9A9A |
| data.sequential.teal.3 | #7EC4D7 | #3E8685 |
| data.sequential.teal.4 | #48A0B7 | #207070 |
| data.sequential.teal.5 | #0A7B93 | #035B5B |
| data.sequential.teal.6 | #00576C | #004545 |
| data.sequential.teal.7 | #003542 | #003030 |
| data.diverging.teal-amber.1 | #00576E | #003839 |
| data.diverging.teal-amber.2 | #287D93 | #185050 |
| data.diverging.teal-amber.3 | #72A9B4 | #426868 |
| data.diverging.teal-amber.4 | #BBD7D9 | #678281 |
| data.diverging.teal-amber.5 | #F1EEE6 | #9C9890 |
| data.diverging.teal-amber.6 | #E7CCAE | #887968 |
| data.diverging.teal-amber.7 | #DA9B6A | #715C45 |
| data.diverging.teal-amber.8 | #C26D32 | #5A4122 |
| data.diverging.teal-amber.9 | #984A1A | #442600 |
| data.plot.bg | #FFFFFF | #B5A892 |
| data.plot.grid | #DCE5E1 | #A59986 |
| data.plot.text | #18272B | #16100A |
| data.plot.muted | #52646A | #3C342A |

Unchanged: none.

## Unreleased

- Vivaldi: raised the minimum-contrast floor from 2 to 5 so Vivaldi-derived UI
  text (tab titles on the sea highlight, text on the fire accent) meets the AA-ish
  legibility the rest of the system guarantees, and added the `backgroundSource`
  field to match the current exported-theme schema. Verified against installed
  Vivaldi themes; colours and the deterministic ids are unchanged.
- Added the oh-my-zsh surface: try-works.zsh-theme (Try-Fire) and
  try-works-cold.zsh-theme (True Lamp), a truecolor two-line prompt. Cool-sea
  throughout; the ember fire marks only the git-dirty state, a failed command
  turns the caret and exit code red. Cold uses the shared light-safe hue remap.
- Zed: added Try-Works (True Lamp), a light appearance in the same theme family,
  derived from the dark style by the shared lit->cold remap now factored out of
  the VS Code light builder. Both editors' light themes stay identical in
  philosophy from one table.
- VS Code: added Try-Works Icons, a generated file-icon theme (Material-style
  JSON conventions; monogram-on-chip file icons and lucide-outline folders in
  palette hues, ~60 SVGs all drift-gated).
- VS Code: added Try-Works Cold (True Lamp), a light theme derived from the
  dark one by a total colour remap (same hues darkened toward the ink at the
  t=0.45 ratio the Obsidian/Quarto light surfaces use; identity terminal ANSI;
  hovers darken). Unmapped colours fail generation, so the two variants cannot
  drift apart silently.
- Added the iTerm2 surface: Try-Works.itermcolors (lit) and
  Try-Works-Cold.itermcolors (cold) alongside the Ghostty pair, same
  identity-palette / flipped-chrome split, generated from the json.
- Obsidian: fixed light-mode hover contrast (hovers now darken to accent-deep
  in cold; accent-bright measured 3.55:1 against the cold bg), with both hover
  pairs locked in validate.py. Added alternative task states ([/] [>] [<] [?]
  [!] [*] [-]), an opt-in focus mode, seamless transclusions (Style Settings
  toggle restores frames), image captions from pipe text, an img-grid
  cssclasses helper, quieter status bar / vault chrome, and phone-size
  Properties type. Body stays Archivo (sans), headings Fraunces (serif).

## 1.0.0

First stable release. The public surface is frozen: the CSS custom properties,
the Tailwind preset keys, the json schema, and the R and Python names. From here,
semantic versioning applies.

The system spans one source of truth (try-works.json) and 29 generated files
across CSS, Tailwind, Typst (slides and poster), 11ty, Obsidian, Ghostty, VS
Code, R (ggplot2), Python (matplotlib), Quarto (HTML and Typst), print, and the
metric-matched font fallbacks, with WCAG, CVD, typography, i18n, accessibility,
performance, and Portuguese-coverage checks enforced in CI.

## 0.19.0 — Quarto

- Added the Quarto surface, the gap the product review flagged: try-works.scss
  and try-works-dark.scss (HTML themes, Fraunces/Literata/fire), try-works.theme
  (highlight theme from the code map), and typst-brand.typ (PDF via Typst
  include-in-header). Example config and qmd included. All generated from the json.

## 0.18.1 — confirm surfaces

- Tailwind, Obsidian, and Ghostty confirmed in use; moved from the confirm tier
  to core. No surfaces pruned. Quarto theme remains the next build before 1.0.

## 0.18.0 — product focus

- Added PRODUCT.md and a product block: named the audience, tiered the surfaces
  by weekly use (core / maintained / confirm), and drew the scope line.
- Flagged the highest-value gap: a Quarto theme (SCSS for HTML, Typst for PDF),
  which sits in the weekly path and is missing. Recommended building it before
  any further surface, then pruning unconfirmed surfaces, then 1.0.

## 0.17.0 — brand

- Added BRAND.md: essence, positioning, the pequod family relationship, voice,
  and usage. Resolved the mark question type-forward: the wordmark is primary,
  with an ember emblem (assets/logo.svg, logo-cold.svg) as the square secondary.
- Added a brand block to the json and a brand sheet to the specimens.

## 0.16.0 — stewardship

- Added CONTRIBUTING, CODE_OF_CONDUCT, PUBLISHING, and CITATION.cff; documented
  licensing (MIT code, CC-BY-4.0 design, OFL fonts unbundled) and a pre-1.0
  versioning policy with a defined public surface.
- Hardened CI: actions pinned to commit SHAs, added the Portuguese coverage step,
  added Dependabot for the pinned actions.
- Added `make dist` to assemble publishable copies of each surface.

## 0.15.0 — motion

- Added motion tokens: four durations and four eases in css/motion.css and the
  Tailwind preset, with a prefers-reduced-motion reset. Motion specimen added.

## 0.14.0 — performance

- Measured and documented subsetting: woff2 to the declared range cuts the font
  payload ~50% (811K to 404K; above-fold 276K), keeping axes and diacritics.
  Added scripts/subset_fonts.sh and a `make fonts` target.
- Added css/fallbacks.css: metric-matched local() fallbacks (size-adjust,
  ascent/descent/line-gap overrides per face) to remove swap layout shift; font
  stacks updated to include the matched fallback.

## 0.13.0 — accessibility beyond contrast

- Added css/a11y.css: :focus-visible rings (3:1 in both modes), prefers-contrast
  more (muted to 7:1, borders to 3:1), forced-colors support for buttons and
  focus, and prefers-reduced-transparency.
- Audited the VS Code theme; raised line-number contrast from 2.40 to 3.36.
- Data not by colour alone: paired the categorical scale with markers
  (matplotlib) and pch shapes (ggplot2 scale_shape_tryworks_d).

## 0.12.0 — print production

- Added a print layer: print/SPEC.md (profile, ink limit, cool rich black, CMYK
  starting values) and a Typst poster preset with bleed, crop marks, and a
  safe-area guide, both generated from the json.
- Corrected the gamut framing: the amber prints well; the real CMYK casualties
  are the bright data-viz blue, green, and violet, now flagged with spot advice.
- Added an A2 poster proof showing bleed, trim, safe area, and the CMYK
  substitutions.

## 0.11.0 — data visualization

- Added categorical, sequential, and diverging scales, generated for R (ggplot2)
  and Python (matplotlib) from the json. Categorical is Okabe-Ito (CVD-safe),
  chosen over a brand-tinted set that failed the colour-blindness test (min
  OKLab separation 0.033 vs 0.075). Sequential is a perceptually even teal ramp;
  diverging is teal-amber, the built-in uniform scale deferred from colour work.
- R: scale_colour/fill_tryworks_d/_c/_div and theme_tryworks(mode).
- Python: tryworks_seq / tryworks_div colormaps, categorical cycle, use_tryworks().
- validate.py checks the scales; example spirometry plots and a CVD simulation
  added to the specimens.

## 0.10.0 — Literata for body

- Adopted Literata as the body face (body, body-lg) per preference; Fraunces
  keeps all headings (display down to subhead) for character.
- font-variation-settings are now driven by each font's declared axes, so
  Literata uses opsz and wght and does not inherit Fraunces' SOFT and WONK.
- Web loading: Literata @font-face and preload added; body base set to the
  reading face. Type specimen rebuilt to show the real Fraunces/Literata pairing.

## 0.9.0 — reading science

- Measured Fraunces against faces built for long-form screen reading. At the
  text optical size Fraunces shows stroke contrast ~2.60 and x-height/em 0.482,
  versus Literata 1.67 / 0.507 and Source Serif 4 1.82 / 0.475.
- Verdict: Fraunces stays for display, headlines, and the lede; for the long-form
  body role a lower-contrast workhorse reduces fatigue. Wired Literata as a
  first-class reading font (--tw-font-reading) with verified Portuguese coverage;
  the body role still ships on Fraunces by choice, switchable in one line.
- Added a reading-comparison specimen with the measured metrics.

## 0.8.0 — internationalisation (European Portuguese)

- Verified font and subset coverage for European Portuguese; caught the euro
  outside the declared range and added U+20AC. scripts/check_fonts.py makes the
  coverage a repeatable test (skips cleanly when fonts are not present).
- Type roles now use logical properties (max-inline-size), font-variant-numeric
  and font-variant-ligatures instead of raw feature flags, and text-wrap balance
  (display/headings) and pretty (body) for orphan control.
- Web starter set to lang="pt" with guillemet-first quotes; site.css moved to
  logical properties throughout.
- Added a Portuguese type specimen: accented uppercasing, travessão, guillemets,
  ordinals, euro, pre-AO90 spelling.

## 0.7.0 — colour science

- Audited the palette in OKLCH. Documented the colour space; the sea ramp is
  hue-consistent intent but lightness-uneven at the top (0.137/0.153/0.211).
- Evening the ramp was declined automatically because it dropped flame-on-sea to
  3.03, under the 3.05 guard. The identity sea stays; a uniform sequential scale
  is deferred to the data-viz work, built for purpose.
- Added a P3 wide-gamut fire (chroma boosted ~18% in OKLab, clamped to P3) via a
  generated p3.css behind @media (color-gamut: p3); sRGB remains the fallback.

## 0.6.0 — typography

- Replaced the bare modular scale with a typographic role system: display,
  headline, title, subhead, body-lg, body, caption, eyebrow, data, code, each
  with family, size, weight, leading, tracking, OpenType features, and measure.
- Fraunces optical size now tracks point size; WONK and SOFT are display-only;
  figures switch between oldstyle-proportional (text) and lining-tabular (data).
- Tuned fluid clamps (linear interpolation between 22rem and 80rem) replace the
  crude vw sizing on display and headline.
- Tailwind preset gained fontFamily, lineHeight, and letterSpacing.
- Web font loading rebuilt: font-display swap, preload, declared variable axes,
  Latin unicode-range.
- validate.py now checks the roles; a type specimen demonstrates the system.

## 0.5.1 — engineering pass

- Single-sourced the version: manifests are stamped from the json, fixing drift
  (vscode/tailwind were 0.1.0, obsidian 0.4.0).
- generate.py refactored into functions with a `--check` mode; drift in any
  generated file now fails the build.
- Added scripts/validate.py (structure, hex, mode parity, enforced WCAG contrast)
  which caught the cold accent sitting exactly on 4.50; darkened to clear 4.5 with
  margin (#9e5017, 4.61).
- Added GitHub Actions CI running validate, drift check, and the CVD report.
- Makefile targets: validate, check, test, all. Added .editorconfig.

## 0.5.0 — foundations

- Re-founded on a closer reading of Moby-Dick ch. 96. The signature was corrected:
  the steady light is what the system steers by; the fire is the rare, dangerous
  mark. Scarcity is now grounded as an ethic rather than a layout rule.
- Added FOUNDATIONS.md: the misreading and its correction, the sea as substance,
  the named maker's bias, the code-tier exception and its justification, Illich's
  conviviality threshold as a test for new surfaces, and the system's provisionality.
- No colour or surface changes from 0.4.0.

## 0.4.0 — a system

- Reframed as a design system. Signature stated as a principle: fire marks the
  load-bearing element, the cool field is everything else.
- Fire refined from terracotta to an oil-flame; cold reworked from a generic
  blue-grey to a sea-salt paper in the teal family.
- Modes named: Try-Fire (dark) and True Lamp (light).
- Token semantics cleaned (no more "rust" overload); core and extended tiers.
- Added a type scale and a spacing scale (CSS variables and Tailwind keys).
- Colour-vision pass added (scripts/cvd_check.py); code keywords carry the fire,
  the CVD-safe amber/blue axis, with bold and italic as secondary channels.
- Every generator brought in-repo: CSS, Tailwind, Ghostty, VS Code, Obsidian,
  and Typst colours all regenerate from try-works.json.

## 0.3.0
- Cold mode first moved to cool; Ghostty preset added.

## 0.2.0
- WCAG lock; cold accent darkened.

## 0.1.0
- First scaffold.
