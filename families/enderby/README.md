# Enderby

Enderby is the charting family of Ensigns. It holds eight categorical colours, three sequential ramps, two diverging ramps and the neutrals of a figure, in a light mode and a dark mode. This is version 0.1.0.

The colours are in `enderby.tokens.json` in this folder, which follows `schema/family.schema.json`. The palette in the token file is the only place a colour is defined. A second design of the categorical colours is in `candidates/balanced.tokens.json`, and the section on the two designs says what the two trade. The history is in `CHANGELOG.md`.

Three scripts in `scripts/design/` record the work. `enderby.ts` derives every value and stops when a token file differs from the derivation or a check fails. `enderby-search.ts` holds the search for the categorical colours. `enderby-specimen.ts` writes the specimen in `specimen/`.

## Goal

Figures for papers, reports and dashboards. The chart is the product, so the chrome stays plain: an ivory ground and a blue-black ink in the light mode, pilot cloth and an ivory text in the dark mode, and one brass accent for links, buttons and the focus ring. Hue belongs to the data.

The family has no syntax, ANSI or status colours, and its token file excludes the editor and terminal bundles.

## The ship

Chapters 100 and 101, Leg and Arm and The Decanter. The Pequod meets the Samuel Enderby of London. Her captain, Boomer, has lost an arm to the White Whale and carries "a white arm of sperm whale bone" in its place. Ahab crosses his ivory leg with it and they shake bones together. Boomer wears a jacket that hangs in "festoons of blue pilot-cloth", and Dr Bunger is the ship's surgeon. Chapter 101 gives the history of the house of Enderby and Sons and copies out a tally of the provisions of 180 Dutch whalers: beef, biscuit, butter, cheese and 10,800 barrels of beer. The narrator remarks that "Most statistical tables are parchingly dry in the reading".

The ivory of the arm is the light ground and the pilot cloth of the jacket is the dark ground. Brass is not in the two chapters. It is the accent because a ship's fittings are brass, and it is the one warm colour against the blue-black.

## Modes

| Mode | Label | Ground | Ground luminance | Text | Text on the ground |
|---|---|---|---|---|---|
| light | Ivory | `paper.bg` #FAF7EE | 0.930 | `ink.text` #1E2736 | 14.02:1 |
| dark | Pilot-cloth | `night.bg` #0E1824 | 0.0087 | `chalk.text` #ECE8D9 | 14.57:1 |

Both labels are words of chapter 100. The figure background (`data.plot.background`) is the ground role (`roles.bg`) in both modes. The panel of a plot (`data.plot.panel`) lies further from the marks than the ground does, lighter in the light mode and darker in the dark mode, so a mark keeps at least its contrast on the panel.

Every declared text pair reaches 7:1 on its ground, because print-grey holds text to 7:1 after conversion to grey. Muted text is 8.6:1 and subtle text is 7.6:1 in both modes.

## Environments

The token file lists four profiles in `meta.environments`. Each threshold and its reason is in `tests/environments.json`, and `node scripts/report.ts enderby` writes every check with its measured value to `reports/enderby.json`. The office-screen profile also runs, because the token file declares pairs.

- figure: the data block of each mode, measured against Okabe-Ito, viridis and cividis. The eight categorical colours match Okabe-Ito's smallest pairwise OKLab distance under normal vision and under protan, deutan and tritan simulation, and beat it on one more measure: the L* gap among the first four, the spread of L*, or the number of marks below 3:1 on the figure ground. Each sequential ramp has monotone lightness and a largest step of at most 1.35 times the smallest. Each diverging ramp has an odd number of steps, lightness symmetric within 0.03 at matched steps, a neutral centre that is the lightest step, and two sides at least 0.08 apart in the outer half under every view. The plot text and muted text keep 4.5:1, the focus colour 3:1 and the outline 3:1, and the context grey has chroma of 0.02 or less and lies 0.12 or more from the focus colour. A mark below 3:1 on the figure ground needs the outline token.
- cvd: the set `data.categorical` keeps every pair 0.15 apart under normal vision and 0.06 apart under each simulation. The first four colours and the set of all eight are gated again under their own names.
- print-grey: every declared text pair keeps 7:1 after conversion to grey, and the first four categories keep 12 L* apart.
- projector, dark room only (`design.projector.rooms` is `["dark"]`): text pairs keep 4.5:1 after a flare of 0.02, and the eight categories keep 0.08 apart in OKLab after the same flare.
- office-screen: the 18 declared pairs keep WCAG AA: 4.5:1 for the 13 text pairs and 3:1 for the five component pairs.

| Profile | Separable design | Balanced design | Tightest number of the separable design |
|---|---|---|---|
| figure | pass | pass | worst view 1.084 times Okabe-Ito (light, normal vision, 0.169 against 0.156) |
| cvd | pass | pass | 0.084 under deutan in the dark mode |
| print-grey | pass | pass, by declaration | first four 13.5 L* apart, gate 12 |
| projector | pass | pass | 0.139 between categories after flare, gate 0.08 |
| office-screen | pass | pass | outline 3.40:1 and accent 3.43:1 on ivory, gate 3 |

In a lit room the flare is 0.08, and the dark mode's muted and subtle text then fall to 4.22:1 and 3.80:1. That is why the profile is gated for a dark room only. The categories still keep 0.097 or more apart in a lit room.

## Structure

| Palette group | For | Values |
|---|---|---|
| `paper` | light grounds | bg #FAF7EE, sunk #F3F0E7, raised #FEFCF8, rule #D7D4CA, grid #E2E0D8, select #CAE3FD |
| `ink` | text and chart furniture on ivory | text #1E2736 14.02:1, muted #3F4857 8.61:1, subtle #47505E 7.61:1, axis #6D6A63 5.04:1, outline #88867F 3.40:1, context #B2B1AC 2.00:1 |
| `night` | dark grounds | bg #0E1824, sunk #17212F, raised #202B39, rule #333E4D, grid #252F3B, deep #0A121D (the plot panel), select #233F5B |
| `chalk` | text and chart furniture on pilot cloth | text #ECE8D9 14.57:1, muted #B8B4A6 8.61:1, subtle #ADA99C 7.60:1, axis #83888E 5.00:1, outline #686D72 3.42:1, context #52565B 2.42:1 |
| `pilot-light`, `pilot-dark` | links and buttons | light link #0C4694 8.45:1, hover #00347A 11.06:1, button #0C366F; dark link #7FBEF4 9.00:1, hover #A7DAFF 12.02:1 |
| `brass` | accent and focus ring | #A38122 (3.43:1 on ivory), #D8B456 (9.01:1 on pilot cloth) |
| `cat-light`, `cat-dark` | the eight categories | see below |
| `seq-pilot`, `seq-brass`, `seq-lagoon` | sequential ramps | nine steps each |
| `div-blue-orange`, `div-teal-brass` | diverging ramps | nine steps each |

The fifteen core roles take these values. Accent and focus are brass. The button is the pilot blue in the light mode and the ivory text colour in the dark mode. There are no extra roles, accents, surfaces, status, syntax, ANSI or terminal blocks.

### Categories

Eight colours in the order c1 to c8. The order is by separability. c1 is the pilot blue. The next three are chosen first, each the farthest from the ones before it, and they differ by 13.5 L* or more in each mode. The last four follow in the same way.

| Name | Family | Light | L* | Dark | L* |
|---|---|---|---|---|---|
| c1 | blue | #014897 | 31.5 | #668CE4 | 59.1 |
| c2 | rust | #B4491E | 45.0 | #AE5124 | 45.6 |
| c3 | brown | #452400 | 18.0 | #EDA345 | 72.6 |
| c4 | azure | #2298C9 | 59.0 | #8CE4FF | 86.1 |
| c5 | violet | #805BBC | 46.6 | #D3A5FD | 74.7 |
| c6 | wine | #7C2259 | 29.8 | #C166A5 | 55.6 |
| c7 | brass | #A28C01 | 58.5 | #8F8F05 | 57.6 |
| c8 | green | #03815B | 47.6 | #2AC39E | 70.9 |

The same name keeps its hue family in both modes, and its lightness moves to suit the ground. The dark mode needs marks of 3.4:1 or more on pilot cloth and the light mode marks of 3.05:1 or more on ivory, which is why c3 is near black on ivory and amber on pilot cloth.

### Sequential ramps

Nine steps each. Step 1 is the colour nearest the ground in both modes, so the dark mode reads each ramp in the opposite order and the two modes share their colours. The steps are equal in OKLab distance along the path.

| Ramp | Path | Step 1 | Step 5 | Step 9 |
|---|---|---|---|---|
| `pilot` | one hue, blue | #F2F3F4 | #448CEC | #072460 |
| `brass` | one hue, yellow to brown | #F7F6F1 | #B1852F | #41270D |
| `lagoon` | several hues: yellow, green, teal, indigo | #F7F7E8 | #339F8E | #101781 |

### Diverging ramps

Nine steps each, with a neutral centre at OKLab lightness 0.962 and extremes at 0.52. An extreme keeps 3.1:1 or more on both grounds, so the two modes share the colours.

| Ramp | Step 1 | Centre | Step 9 |
|---|---|---|---|
| `blue-orange` | #1464CD | #F4F2EE | #A34C14 |
| `teal-brass` | #1E7778 | #F4F2EE | #905C16 |

Blue against orange is the safest axis of the two. The family never runs a ramp from red to green.

### Plot tokens

`data.plot` holds background, panel, text, muted, axis, grid, outline, focus and context. The focus colour is c1, and the context is a neutral grey. When one series matters, draw it in the focus colour at `design.stroke.focus` and draw the others in the context grey at `design.stroke.context`. A mark below 3:1 on the figure ground, which includes the nearest steps of every sequential ramp and the middle steps of a diverging ramp, is drawn with `data.plot.outline`.

### Markers and lines

`design.markers` and `design.lines` give the marker and the dash pattern of each series number. Series five to eight are told apart in print by these, and by direct labels.

| Series | Marker | Dash pattern |
|---|---|---|
| 1 | solid circle | solid |
| 2 | solid square | dash, 8 4 |
| 3 | solid triangle | dot, 2 3 |
| 4 | solid diamond | dash-dot, 8 3 2 3 |
| 5 | open circle | long dash, 14 4 |
| 6 | open square | short dash, 4 3 |
| 7 | open triangle | dash-dot-dot, 8 3 2 3 2 3 |
| 8 | open diamond | sparse dot, 1 5 |

Type and stroke sizes are tokens too: tick labels 11px, labels 12px, body 14px, titles 16px, figure titles 22px, line height 1.25, series lines 2px, the context 1.5px, the focus 3px, marker size 7px.

### Specimen

`specimen/` holds six figures (bar, line, scatter, heatmap, diverging heatmap and small multiples), a key to the markers and dash patterns, and the scales as strips, all from invented data. `node scripts/design/enderby-specimen.ts` writes it. `npm run pages` builds the local pages that show it in both modes, for both designs, with the simulation views. The greyscale strip uses a filter that the fragment carries itself, with the luminance weights of `lib/colour`.

## The two designs

The charting specification evaluates two real candidates that trade against each other: eight categories of similar lightness, so that none shouts, against a lightness spread that lets the first four survive a greyscale copy. Enderby offers both and shares every other colour between them. The separable design is `enderby.tokens.json`. The balanced design is `candidates/balanced.tokens.json`, which `enderby.ts --write` generates from the first file, so the two cannot drift apart.

| | Separable | Balanced |
|---|---|---|
| L* range of the eight, light and dark | 40.9 and 40.5 | 19.9 and 20.0 |
| L* standard deviation (Okabe-Ito 24.4) | 13.5 and 12.2 | 8.7 and 8.5 |
| Smallest L* gap among the first four (Okabe-Ito 0.8) | 13.5 and 13.5 | 0.1 and 0.1 |
| Smallest distance under normal vision (Okabe-Ito 0.156) | 0.169 | 0.165 |
| Smallest distance under protan, deutan, tritan (Okabe-Ito 0.095, 0.075, 0.084) | 0.103, 0.084, 0.101 | 0.101, 0.079, 0.090 |
| Highest chroma | 0.150 | 0.180 |
| Marks below 3:1 on the figure ground (Okabe-Ito 4 on ivory, 1 on pilot cloth) | 0 | 0 |
| Figure measures beaten besides the four views | all three | lightness balance and marks below 3:1; it loses on greyscale separation |
| How print-grey is met | first four 13.5 L* apart, last four patterned | all eight declared patterned, so the gate measures nothing |

The separable design is the primary. It meets print-grey by measurement, its margin over Okabe-Ito is larger, and its colours are less saturated. The first four colours keep 0.20 or more apart under every view.

The balanced design buys a narrow band of lightness with chroma and margin. To match Okabe-Ito in every view inside a band of 20 L*, eight colours need chroma up to 0.18, where the separable design stays at or below 0.15, and the tightest view falls from 8 per cent to 5 per cent above Okabe-Ito. `node scripts/design/enderby-search.ts frontier` runs the search at other bands. With the balanced chroma caps it finds worst-view ratios to Okabe-Ito of 0.94 at 16 L*, 1.06 at 20 L*, 1.11 at 24 L*, 1.11 at 28 L* and 1.20 at 32 L*. A ratio below 1 means the set does not match Okabe-Ito, so 20 L* is about as narrow as the band can be made. The search does not prove that a narrower band is impossible.

In print the balanced design cannot be read by colour: its eight colours fall within about 20 L* of grey, so every series needs its marker, its dash pattern and a direct label. Its dark-mode focus colour is c3, because c1 is only 10 L* from the dark context grey. The generator picks the first category that keeps 20 L* and 0.12 from the context grey in each mode. In every other respect it passes the same profiles as the primary.

Choose the balanced design for figures that are seen on a screen and in which no series should draw the eye. Choose the separable design for anything that may be printed in greyscale.

## Rules

Eight rules are stated in the token file.

- `hue-belongs-to-data`: no role, extra role or surface uses a data colour. Checked by `group-not-in-chrome` over the seven data palette groups.
- `brass-marks-the-interface`: brass is the accent and the focus ring and no other role takes its colour. Checked by `accent-only-in-roles:focus`.
- `no-red-green-axis`: a diverging ramp never runs from red to green. Checked by `not-red-green` on the ends of both ramps.
- `focus-survives-grey`: the focus colour differs from the context grey by at least 20 L*. Checked by `lightness-gap`. The primary keeps 40.6 L* in the light mode and 22.8 L* in the dark mode.
- `links-hover-toward-the-page`: a link is darker on hover in the light mode and lighter in the dark mode. Checked by `hover-direction`.
- `pale-marks-get-an-outline`: a mark below 3:1 on the figure ground is drawn with `data.plot.outline`. The figure profile checks that the token exists and keeps 3:1, and `tests/families/enderby.test.ts` checks that the specimen outlines every step below 3:1.
- `series-carry-markers`: every series carries the marker and dash pattern of its number. No automatic check.
- `categories-in-order`: categories are used in the order given. `tests/families/enderby.test.ts` checks that each colour is the farthest, among those left in its group, from the ones before it.

## Measured results

### Categories against Okabe-Ito

Smallest pairwise OKLab distance among the eight colours after simulation with the matrices of Machado, Oliveira and Fernandes (2009) at severity 1.0 in linear light (`lib/colour/cvd.ts`). Okabe-Ito is measured with black in its set, with the same code. Its closest pairs are orange and vermillion (normal), blue and reddish purple (protan), bluish green and reddish purple (deutan) and bluish green and blue (tritan).

| View | Okabe-Ito | Separable, light | Separable, dark | Balanced, light | Balanced, dark |
|---|---|---|---|---|---|
| Normal | 0.156 | 0.169 | 0.170 | 0.165 | 0.165 |
| Protan | 0.095 | 0.103 | 0.103 | 0.101 | 0.101 |
| Deutan | 0.075 | 0.086 | 0.084 | 0.079 | 0.080 |
| Tritan | 0.084 | 0.113 | 0.101 | 0.090 | 0.090 |

The first four colours of the separable design keep 0.234 or more under normal vision and 0.200 or more under every simulation. After a flare of 0.02 the categories keep 0.139 (light) and 0.157 (dark) apart in the separable design, and 0.152 and 0.153 in the balanced one.

### Sequential ramps against viridis and cividis

The figure profile samples viridis and cividis at nine steps. The pilot and brass ramps have the largest step at 1.003 and 1.006 times the smallest. The lagoon ramp passes through green, where the path bends, and has 1.223.

| Ramp | Lightness, step 1 to 9 | Largest step over smallest | Total length |
|---|---|---|---|
| `pilot` | 0.964 to 0.284 | 1.003 | 0.737 |
| `brass` | 0.973 to 0.300 | 1.006 | 0.703 |
| `lagoon` | 0.972 to 0.301 | 1.223 | 0.815 |
| viridis | 0.29 to 0.92 | 1.263 | 0.810 |
| cividis | 0.25 to 0.93 | 1.202 | 0.744 |

The contrast of the steps with the ivory ground runs from 1.0:1 at step 1 to 13.7:1 (pilot), 12.9:1 (brass) and 13.4:1 (lagoon) at step 9. Steps 1 to 4 fall below 3:1 in the light mode, and steps 1 to 3 in the dark mode, where the order is reversed.

### Diverging ramps

| Ramp | Matched steps differ by at most | Centre chroma | Outer halves apart: normal, protan, deutan, tritan |
|---|---|---|---|
| `blue-orange` | 0.015 | 0.006 | 0.250, 0.217, 0.239, 0.253 |
| `teal-brass` | 0.004 | 0.006 | 0.150, 0.110, 0.117, 0.194 |

The limits are 0.03, 0.02 and 0.08.

### Text and chart furniture

The contrast of every token with its ground is in the structure table above. The focus colour, c1, is 8.25:1 on ivory and 5.48:1 on pilot cloth. After conversion to grey every declared text pair keeps 7.6:1 or more. After a flare of 0.02 the tightest text pair is the subtle text on the dark ground at 5.93:1.

## Typography

Inter for text (`sans`), Inter Display for titles (`display`) and JetBrains Mono for values and code (`mono`). All three are under the SIL Open Font License 1.1, as far as is known, and the licence texts will ship with the font files when they are fetched in phase 4. The fonts are not in this folder, and the pages use them only where they are installed.

The charting requirements call for tabular figures and a compact setting. Inter documents a tabular-figures feature (`tnum`). In the Inter files installed on the review machine the feature is in the font's substitution table and the default digits are proportional, so the specimen sets `font-variant-numeric: tabular-nums`. Inter Display is the tighter optical size of the same family, so the titles need no second family. Inter is an ordinary-width face. Its large x-height keeps labels of 11px legible, and the type scale of the token file is small and close: line height 1.25. A condensed face fits more text into a small multiple. IBM Plex Sans Condensed is under the same licence, but the documentation that could be read does not say whether its figures are tabular, so it was not chosen. `typography.sans` can change without touching a colour.

## What Enderby is not for

- Interface themes, editors and terminals. The token file has no syntax, ANSI, terminal or status blocks.
- More than eight categories. Beyond eight, group the categories, split the chart or use the focus-and-context pattern.
- A lit-room projector. The gate is for a dark room, and in a lit room the dark mode's muted text falls below 4.5:1.
- A greyscale print of the balanced design without markers, dash patterns and direct labels. In the separable design the same applies to series five to eight.
- Photocopy, e-ink, sunlight and the aged eye. The token file does not list them, so nothing gates them.
- Status or severity. No colour here means good or bad.

## Licence

Code is MIT; colour tokens and documentation are CC BY 4.0. See the root `LICENSE`.
