# Pequod

Pequod is the host family of Ensigns. Its ground runs from warm paper to deep ink, and its eight accent colours are named after the crew of the Pequod. This is version 0.3.0.

The colours are in `pequod.tokens.json` in this folder, which follows `schema/family.schema.json`. The palette in the token file is the only place a colour is defined, and the rest of the repository reads it from there. Themes and packages will be generated from it in a later phase of the migration, and their installation notes will sit with them in `packages/`.

The packages already published under the Pequod name (`pequod` on CRAN and PyPI, `pequod-tailwind` on npm, and the Pequod Palette theme `tiagojct.pequod-color-theme` on the VS Code Marketplace and Open VSX) are version 0.2.0. They do not have the corrections described below.

## Goal

Reading and code in editors, terminals and long documents on screen.

## Environments

`meta.environments` in the token file lists three environments. Each threshold and its reason is in `tests/environments.json`, and the checks are in `lib/harness`. `node scripts/report.ts pequod` writes every check with its measured value to `reports/pequod.json`, and `npx vitest run tests/environments` runs the same checks as tests.

- office-screen: a reader at a desk on an ordinary monitor, where every text pair the token file declares must meet WCAG 2.x AA (4.5:1 for text, 3:1 for large text and interface components), and AAA and APCA are reported without being gated.
- editor: code as the themes draw it, where every syntax colour must reach 4.5:1 on the editor background and on the current-line highlight, and 3:1 on the selection.
- cvd: colour vision deficiency, where each declared distinct set keeps its members at least 0.06 apart in OKLab under normal vision and under protan, deutan and tritan simulation, except pairs that something other than colour already tells apart.

All three pass in 0.3.0. The cvd profile also lists warnings for the sets it reports rather than gates; see Colour vision below.

Pequod draws code on Log 50 in Parchment and on Log 950 in Below deck. The current line is Log 150 or Log 900 at 50 per cent over that background, and the selection is Log 200 at 50 per cent (Parchment) or Log 800 (Below deck).

## Modes

| Mode | Label | Ground | Body text | Body contrast |
|---|---|---|---|---|
| dark | Below deck | Log 950 | Log 100 | 14.04:1 |
| light | Parchment | Log 100 | Log 800 | 10.82:1 |

The Log scale has twelve steps, from Log 50 (paper) to Log 950 (the darkest ink). Each crew member has a light and a dark value and a fixed job:

| Crew | Colour | Syntax | ANSI | Status |
|---|---|---|---|---|
| Ahab | red | keyword | red | danger |
| Starbuck | blue | function | blue | info |
| Queequeg | indigo | type | magenta | |
| Pip | yellow | number | yellow | warning |
| Ishmael | grey | comment (italic), operator, punctuation | | hint |
| Stubb | orange | constant, decorator | | conflict |
| Tashtego | green | string | green | success |
| Daggoo | brown | parameter | | |

The same eight are the categorical chart colours. The palette also holds 28 colours that the Pequod editor and terminal themes used but `pequod.json` never listed: the terminal cyan and bright colours, the Zed dim variants, the iTerm2 variants and two chrome colours (groups `ansi-dark`, `ansi-light`, `zed-dim-light`, `iterm` and `chrome`).

## Rules

Two rules are stated in the token file.

- `crew`: The accents are the crew of the Pequod. Each keeps its name and has a light and a dark value. The equality test (`tests/shared/equality.test.ts`) looks up every crew member by its 0.2.0 name in both modes, so a renamed or missing member fails it. The distinct sets `crew-dark` and `crew-light` keep the crew apart (see Colour vision).
- `warm-to-cool`: The Log scale runs from warm paper to cool ink. The hue turns between Log 500 and Log 600, so it is a warm-to-cool scale and not a sequential colormap. No test enforces this rule. It tells users what the scale is for, and the label of the chart scale in the token file says the same.

## Changes in 0.3.0

42 values differ from Pequod 0.2.0, for two reasons. `tests/shared/expected-changes/pequod.json` lists each one with its address, mode, old value, new value and reason, and the equality test fails on any change missing from that list. `CHANGELOG.md` gives the old hex values.

### Crew corrections (decision D10)

In 0.2.0 five crew colours failed WCAG AA as text: Starbuck, Stubb, Tashtego and Ishmael on Parchment, and Daggoo on Below deck. A crew colour is text on the page and a syntax colour in the editor, so a correction has to reach 4.5:1 on the page, the editor background and the current line, and 3:1 on the selection. A second rule holds the crew apart: in each mode the smallest OKLab distance between two crew colours may not fall below its 0.2.0 value, which is 0.1124 in Parchment and 0.0879 in Below deck (Ishmael and Tashtego in both).

`scripts/design/pequod-corrections.ts` searched the eight colours together. It changed lightness first and allowed small hue and chroma moves only where the distance rule needed them.

| Crew | Mode | 0.2.0 on the page | 0.3.0 value | 0.3.0 on page, editor, current line, selection |
|---|---|---|---|---|
| Starbuck | Parchment | 3.37:1 | `starbuck.light` #006A98 | 4.62, 5.41, 4.51, 3.99 |
| Stubb | Parchment | 3.02:1 | `stubb.light` #AA430B | 4.62, 5.41, 4.51, 3.99 |
| Tashtego | Parchment | 4.01:1 | `tashtego.light` #06724B | 4.62, 5.41, 4.51, 3.99 |
| Ishmael | Parchment | 3.74:1 | `ishmael.light` #6A6164 | 4.63, 5.42, 4.52, 4.00 |
| Ahab | Parchment | 4.99:1 | `ahab.light` #931432 | 6.81, 7.96, 6.64, 5.88 |
| Daggoo | Below deck | 4.35:1 | `daggoo.dark` #A7766F | 4.72, 4.72, 4.51, 3.64 |

Ahab passed every gate in 0.2.0 and still moved. Stubb has to lose about 0.1 of OKLab lightness to reach 4.5:1, which brings it close to Ahab: with Ahab held in place, the best result of the search left the two 0.055 apart, about half the floor. Ahab therefore darkens and turns about 11 degrees towards crimson (OKLCH hue 27 to 15), with a little more chroma (0.149 to 0.159). The corrected Parchment crew has a smallest distance of 0.1127 (Ahab and Stubb), and Below deck keeps 0.0880 (Ishmael and Tashtego). The values first proposed for these corrections left the Parchment minimum at 0.108; `docs/migration/CHECKPOINT-1.md`, problem P2, has the detail.

Queequeg, Pip and Daggoo in Parchment and the other seven Below deck colours are unchanged. A crew colour is one palette entry, so every role that uses it (accent, syntax, ANSI, status and chart colour) changes with it. These account for 24 of the 42 rows.

### The themes' own colours (decision D16)

The Pequod themes held 28 colours that `pequod.json` did not, and in a few roles they drew a different colour from the one `pequod.json` named. The migration treats the themes' colours as part of Pequod's identity: they are palette entries now, and where the two disagreed the themes' colour wins. For people who used the themes nothing changes; the token file and the site now describe what the themes drew. These are the other 18 rows.

- Muted text in Below deck: Log 300 became Ishmael, which the dark theme uses for description text. Muted chart text follows it.
- Links and link hover in Below deck: Log 300 became the themes' cyan, `ansi-dark.cyan` #9DC2C5, at 9.46:1 on the ground.
- Plain variables in code: Daggoo became the body text colour in both modes.
- Focus in Parchment: Log 400 (3.34:1 on the ground) became Log 700 (8.68:1), the light theme's focus border.
- The Parchment terminal: the background moved from Log 100 to Log 50 (cursor text follows it), black from Log 900 to Log 800, cyan to Log 700, and seven bright colours to the light theme's hand-tuned values (group `ansi-light`). The old Gam site had derived these, because `pequod.json` had no light terminal.

### Measurement

Colour vision is now simulated with the matrices of Machado, Oliveira and Fernandes (2009) at severity 1.0 in linear light, and distances are measured in OKLab. The CVD figures in earlier Pequod releases used the Viénot, Brettel and Mollon (1999) model with CIE76 colour differences. They cannot be compared with the numbers below.

## Colour vision

The token file declares four distinct sets. Each figure is the smallest OKLab distance between two members of a set after simulation with `lib/colour/cvd.ts`, leaving out declared aliases (constant and decorator are both Stubb). (r) marks a pair declared as reinforced.

| Set | Mode | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|---|
| crew-dark | Below deck | 0.088 Ishmael, Tashtego | 0.031 Ishmael, Tashtego (r) | 0.032 Ishmael, Tashtego (r) | 0.063 Pip, Ishmael |
| crew-light | Parchment | 0.113 Ahab, Stubb | 0.037 Pip, Stubb (r) | 0.032 Ishmael, Tashtego (r) | 0.028 Starbuck, Tashtego (r) |
| syntax-hues | Below deck | 0.102 number, constant | 0.069 string, number | 0.056 keyword, string | 0.070 number, constant |
| syntax-hues | Parchment | 0.113 keyword, constant | 0.037 number, constant | 0.034 keyword, number | 0.028 string, function |
| ansi-hues | Below deck | 0.064 green, cyan | 0.049 green, cyan | 0.044 green, cyan | 0.034 green, cyan |
| ansi-hues | Parchment | 0.083 magenta, cyan | 0.058 red, cyan | 0.034 red, yellow | 0.028 green, blue |

The two crew sets are gates. Under normal vision each must stay at or above its 0.2.0 minimum; under simulation the limit is 0.06 and reinforced pairs are left out, because code tells them apart by token shape and position: strings are quoted, numbers are digits, keywords are fixed words, parameters sit in signatures and calls, and comments are italic. Without those pairs the smallest distances in Below deck are 0.069 (protan, Pip and Tashtego), 0.086 (deutan, Ahab and Ishmael) and 0.063 (tritan, Pip and Ishmael), and in Parchment 0.083 (protan, Stubb and Tashtego), 0.079 (deutan, Pip and Tashtego) and 0.071 (tritan, Ahab and Stubb). Both sets pass.

Below deck has two reinforced pairs, Ishmael and Tashtego and Ahab and Tashtego; the 0.2.0 values needed the same two. Parchment has six. With the 0.2.0 values four Parchment pairs fell below 0.06 under some simulation. The darker corrected colours add Pip and Stubb, Ahab and Daggoo, and Starbuck and Tashtego to that list, and take Stubb and Tashtego off it. Starbuck and Tashtego under tritan drop from 0.066 to 0.028; in code the string is quoted and the function name is not.

The syntax-hues and ansi-hues sets are gates under normal vision (0.06) and reports under simulation, so a shortfall there is a warning. The syntax set shows the crew colours a second time, through the syntax roles; the crew sets carry the gate for them. A terminal cannot add italic or bold to a colour, so nothing reinforces the ANSI pairs. Under tritan simulation green and cyan in Below deck are 0.034 apart, and green and blue in Parchment 0.028.

## Typography

Atkinson Hyperlegible Next for text (`sans`) and JetBrains Mono for code (`mono`). Both are under the SIL Open Font License. Neither is included in this folder.

## What Pequod is not for

- Sequential data. The Log scale turns from brown to slate between Log 500 and Log 600 (OKLCH hue 43 to 228), so its steps do not read as one ordered scale.
- Charts that separate series by colour alone. The crew is the chart palette, and six Parchment pairs fall below 0.06 under simulation. Code keeps those pairs apart by token shape; a chart needs markers, labels or line styles for the same job.
- A dark room at night. Below deck body text is 14.04:1 on a ground of luminance 0.008, and most of its text colours are brighter than a relative luminance of 0.45. Jungfrau is the family for night work.
- Projection and print. Pequod has not been tested for either.

## Licence

Code is MIT; colour tokens and documentation are CC BY 4.0. See the root `LICENSE`.
