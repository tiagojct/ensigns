# Bachelor

Bachelor is the family for slides, posters, signage and conference banners that are read from 5 to 20 metres. It has eight flag colours that work as full-bleed fields and as chart colours, an ink for text on each field, a calm light ground for lit rooms and a dark ground for dark ones. This is version 0.1.0.

The colours are in `bachelor.tokens.json` in this folder, which follows `schema/family.schema.json`. The palette in the token file is the only place a colour is defined. A second design is in `candidates/ladder.tokens.json`, and the section on the candidate says what the two trade. `scripts/design/bachelor.ts` records how the values were chosen and stops if the token file differs from them. `scripts/design/bachelor-gamut.py` checks the flags against a CMYK profile. `specimen/` holds the slides, the chart and the poster header that the family page shows, and `CHANGELOG.md` holds the history.

## Goal

Slides, posters, signage and conference banners, read at 5 to 20 metres.

At that distance light from the room lands on the screen or the sheet and adds the same luminance to every colour. Contrast falls, and a colour in the middle of the lightness range can no longer carry text. The family is built around that. Every field is deep or bright (see The two bands), and in print three flags rely on a pattern because lightness cannot tell eight of them apart (see Print in grey).

## The ship

Chapter 115, The Pequod Meets The Bachelor. The Bachelor is a Nantucket ship with her casks full. She sails round among the other ships before she points her prow for home, and the chapter says what she flies: "Signals, ensigns, and jacks of all colours were flying from her rigging, on every side." That sentence is the image the colours come from. Each flag is one of those signals, and the family holds eight of them.

The two mode labels come from the same chapter. The ship is "in glad holiday apparel", which names the light mode, Holiday apparel. The dark mode takes its name from the lamp on her mast: "nailed to her main truck was a brazen lamp". That lamp is also the dark mode's accent, the yellow flag.

## Environments

`meta.environments` in the token file lists three environments. Each threshold and its reason is in `tests/environments.json`, and the checks are in `lib/harness`. `node scripts/report.ts bachelor` writes every check with its measured value to `reports/bachelor.json`, and `npx vitest run tests/environments` runs the same checks as tests.

- projector: slides in a room with ambient light. The room adds 0.02 to the luminance of every colour in a dark room and 0.08 in a lit room. After that, body text keeps 4.5:1, titles keep 3:1, and the members of a distinct set marked for the profile stay 0.08 apart in OKLab. Bachelor does not set `design.projector.rooms`, so both rooms apply to both modes.
- cvd: each distinct set keeps its members at least 0.06 apart in OKLab under normal vision and under protan, deutan and tritan simulation (Machado, Oliveira and Fernandes 2009, severity 1.0), except pairs that something other than colour already tells apart. Bachelor declares no such pair, no exception and no set that only reports.
- print-grey: each colour becomes the grey of the same luminance. Text keeps 7:1 after the conversion, and the members of a distinct set marked for the profile differ by at least 12 L*, unless a member is declared patterned.

The 22 contrast pairs that the token file declares also run under office-screen, as they do for every family that declares pairs. All four profiles pass in 0.1.0, with no error, no warning and no exception: 80 checks for projector, 20 for cvd, 38 for print-grey and 124 for office-screen.

## Modes

| Mode | Label | Ground | Ground luminance | Text | Body contrast | Accent |
|---|---|---|---|---|---|---|
| dark | Brazen lamp | `dark.bg` #080E1C | 0.0045 | `dark.text` #F7F4EC | 17.53:1 | yellow |
| light | Holiday apparel | `light.bg` #F3F0E9 | 0.8726 | `light.text` #0B111F | 16.56:1 | blue |

Brazen lamp is for a dark room. Its ground is a blue-black a little darker than the darkest flag, and its text is ivory. Holiday apparel is for a lit room. Its ground is a warm off-white, calm enough to sit beside eight saturated fields, and its text is a blue-black.

Both modes are checked against both flare levels, because a hall can be lit or dark whichever file the slides use. Body text keeps 7.70:1 on the dark ground and 7.39:1 on the light ground after the lit-room flare.

The flags and their inks are the same in both modes. What changes is the ground, the three surfaces, the text colours, the rule colour, the selection, the accent (one flag in each mode, blue on the light ground and yellow on the dark one) and the chart chrome. The accent is also the link, the button and the focus colour.

## Structure

The palette groups are `flag` (the eight fields), `ink` (the text colours that sit on them), `light` and `dark` (the grounds, the text colours, a rule, a grid line and a hover colour for each mode) and `alpha` (two translucent selection fills).

The flags are `accents.<flag>`, in wheel order. Each field has an ink, `extra.ink-<flag>` in the roles. The chart colours, `data.categorical`, are the same eight flags, ordered with the most separable first: violet, yellow, red, cyan, blue, orange, magenta, green. `data.plot` holds the chart chrome, including an `outline` colour for the edge of a mark.

| Flag | Colour | Band | Ink | Luminance | L* | In print |
|---|---|---|---|---|---|---|
| red | `flag.red` #B20000 | deep | white | 0.0946 | 36.9 | lightness |
| orange | `flag.orange` #FFA800 | bright | `ink.orange` #160B01 | 0.4927 | 75.6 | lightness |
| yellow | `flag.yellow` #FFF000 | bright | `ink.yellow` #100D01 | 0.8358 | 93.3 | lightness |
| green | `flag.green` #00DA77 | bright | `ink.green` #021007 | 0.5147 | 77.0 | pattern |
| cyan | `flag.cyan` #00E6FF | bright | `ink.cyan` #000F14 | 0.6381 | 83.9 | pattern |
| blue | `flag.blue` #0000C9 | deep | white | 0.0422 | 24.4 | lightness |
| violet | `flag.violet` #22006B | deep | white | 0.0140 | 12.0 | lightness |
| magenta | `flag.magenta` #9C0097 | deep | white | 0.0930 | 36.6 | pattern |

White is `ink.white`, #FFFFFF. The four dark inks have a luminance of about 0.004 and an OKLCH chroma of about 0.03, near the hue of their field: a tint, so that the ink belongs to the field. Text on a field is set in that field's ink and in no other.

`design` holds the tokens that have no colour: the viewing distance and the type sizes derived from it (see Typography), the weights, the lettering per metre for signs, the outline width of a chart mark, the aspect ratios of the two kinds of frame, and a pattern for each flag. The patterns are bands on red, a diagonal on orange, a frame on yellow, a cross on green, checks on cyan, a saltire on blue, dots on violet and quarters on magenta. The specimen draws each one in the corner of its section slide, and as a swatch in the key of the poster header.

## The two bands

With ink of luminance Yi on a field of luminance Yf, a flare k and a minimum ratio m, light ink needs Yf of at most (Yi + k + 0.05) / m - (k + 0.05), and dark ink needs Yf of at least m (Yi + k + 0.05) - (k + 0.05). The design script evaluates both for every gate, with 3 per cent added to each contrast gate so that a rounding in the last hex digit cannot cost a pass.

| Gate | Minimum | White ink: field luminance at most | Dark ink: field luminance at least |
|---|---|---|---|
| dark room, body text | 4.5 | 0.1609 | 0.2730 |
| lit room, body text | 4.5 | 0.1138 | 0.4911 |
| print in grey | 7 | 0.0956 | 0.3393 |
| dark room, title | 3 | 0.2763 | 0.1587 |
| lit room, title | 3 | 0.2357 | 0.2841 |

White ink is held by the print gate, so the deep band ends at a luminance of 0.0956 (L* 37.0). Dark ink, at a luminance of 0.004, is held by the lit-room gate, so the bright band starts at 0.4911 (L* 75.5). A field between 0.0956 and 0.4911 carries body text in neither ink. It could carry a title, because the title gates leave room between the bands, but Bachelor keeps every flag in a band so that every field carries body text as well as titles. All eight flags sit in one band or the other, in both modes.

## Print in grey

In print, flags that do not carry a pattern differ by 12 L* or more. The deep band holds three such flags, at L* 12.0, 24.4 and 36.9, because white ink lets a field reach a luminance of 0.0956 and no higher, and the rungs are 12.4 L* apart (12 plus 0.4 for the same reason as the ink margin). The bright band holds two, orange at L* 75.6 and yellow at 93.3. Five flags is the most that can stand on lightness, so eight flags leave three to their pattern.

| Flag | L* | Nearest flag that stands on lightness |
|---|---|---|
| green | 77.0 | orange, 1.3 L* away |
| cyan | 83.9 | orange, 8.3 L* away |
| magenta | 36.6 | red, 0.3 L* away |

These three are declared `patterned` in the distinct set `fields-print`, with the pattern named in `by`: a cross on green, checks on cyan and quarters on magenta. The other five are told apart by lightness, 12.4 L* or more from their neighbours on the ladder (violet to blue 12.4, blue to red 12.5, red to orange 38.8, orange to yellow 17.7).

The token file declares the eight flags twice on purpose. The set `fields` is marked for projector and declares no pattern, so after a flare every pair of flags is held apart by colour. The set `fields-print` is marked for print-grey and declares the three patterned flags. A patterned member is exempt from every simulation gate that uses the set, so one set marked for both profiles would have excused the three flags from the projector gate. The cvd profile checks both sets, so its results appear twice.

## Rules

Six rules are stated in the token file.

- `two-bands`: a field that carries body text sits in a deep or a bright band, and nothing between them. The checks `lightness-gap:accents.red,accents.orange,35` and `lightness-gap:accents.magenta,accents.green,35`, run by `tests/shared/rules.test.ts`, hold the top of the deep band 35 L* or more from the bottom of the bright one. Red and orange are 38.8 L* apart, and magenta and green 40.4. `tests/families/bachelor.test.ts` holds each flag inside its band.
- `own-ink`: each field carries its own ink, and text on a field is set in it. No automatic check; the pairs in the token file test each ink on its field.
- `one-accent`: the accent is blue in Holiday apparel and yellow in Brazen lamp, and only link, button and focus take it among the roles. The check `accent-only-in-roles:link,button,focus` runs in `tests/shared/rules.test.ts`.
- `pattern-in-print`: every flag has a pattern token, and green, cyan and magenta rely on theirs in print. `tests/families/bachelor.test.ts` holds the list.
- `marks-outlined`: a chart mark is a flag with an outline in the text colour. No flag keeps 3:1 against both grounds (see What Bachelor is not for). No automatic check.
- `heavy-type`: text on a field is set at weight 500 or more, and titles at 800 or 900. No automatic check.

## Measured results

Every figure comes from `lib/colour` and the harness. The flags are the same in both modes, so one set of numbers covers both. Contrast is the WCAG ratio. After a flare it is (Yb + k + 0.05) / (Yt + k + 0.05), as the projector profile computes it.

Each ink on its field:

| Flag | Plain | After the dark-room flare | After the lit-room flare | In grey |
|---|---|---|---|---|
| red | 7.26 | 6.50 | 5.03 | 7.23 |
| orange | 10.03 | 7.59 | 4.64 | 10.01 |
| yellow | 16.40 | 12.24 | 7.21 | 16.45 |
| green | 10.46 | 7.90 | 4.81 | 10.46 |
| cyan | 12.76 | 9.58 | 5.74 | 12.73 |
| blue | 11.39 | 9.54 | 6.56 | 11.37 |
| violet | 16.40 | 12.74 | 7.85 | 16.48 |
| magenta | 7.34 | 6.56 | 5.07 | 7.34 |

The tightest ink is orange after the lit-room flare, at 4.64:1 against a gate of 4.5:1. The tightest in grey is red at 7.23:1 against 7:1. Both margins are the 3 per cent that the design script keeps.

The other declared pairs, which are text on the grounds and on the surfaces, the accent and the links:

| Condition | Text pairs | Subtle text, for large type only |
|---|---|---|
| After the dark-room flare | 6.82 to 14.13 | 4.08 to 5.80 |
| After the lit-room flare | 4.75 to 8.33 | 3.45 to 3.66 |
| In grey | 7.88 to 18.88 | not gated in grey |

Colour vision and flare. Each figure is the smallest OKLab distance between two of the eight flags, after the simulation in the first column. The design script asks every pair for 1.4 times every distance gate in every view; `fields` also sets its own normal-vision minimum of 0.1.

| View | Smallest distance | Pair | Gate |
|---|---|---|---|
| Normal vision | 0.170 | blue, violet | 0.1 |
| Protan | 0.085 | blue, magenta | 0.06 |
| Deutan | 0.095 | orange, green | 0.06 |
| Tritan | 0.084 | green, cyan | 0.06 |
| Dark-room flare | 0.151 | blue, violet | 0.08 |
| Lit-room flare | 0.131 | blue, violet | 0.08 |

No pair is reinforced, patterned or excused in any of these views. A deep flag and a bright flag are at least 0.270 apart in their worst view (red and orange), which is why the design script solves the two bands apart and then checks that claim.

Print in grey: the smallest gap between two flags that stand on lightness is 12.4 L* (violet and blue), against a gate of 12.

### CMYK gamut

`scripts/design/bachelor-gamut.py` converts each flag from sRGB to CMYK and back through an ICC profile with littleCMS, using relative colorimetric intent with black point compensation, and lists the flags whose round trip moves by more than 0.02 in OKLab. That threshold is the just noticeable difference that CSS Color Module Level 4 uses for gamut mapping, and `lib/colour/oklab.ts` uses the same value. On nine greys from 10 to 90 per cent the profile's own round trip error is at most 0.008, which is well under the threshold.

The only CMYK profile on the machine is the macOS Generic CMYK profile. It is a stand-in. It is not FOGRA39, SWOP or GRACoL, and no ICC file was downloaded. With it, all eight flags move by more than 0.02:

| Flag | Round trip distance | CMYK per cent |
|---|---|---|
| blue | 0.141 | 95, 78, 1, 2 |
| green | 0.101 | 51, 0, 54, 0 |
| cyan | 0.083 | 46, 0, 7, 0 |
| magenta | 0.078 | 46, 91, 0, 1 |
| violet | 0.065 | 97, 93, 7, 22 |
| yellow | 0.045 | 4, 3, 81, 0 |
| red | 0.041 | 6, 91, 98, 20 |
| orange | 0.036 | 0, 35, 86, 1 |

Five flags move by more than 0.06: blue, green, cyan, magenta and violet. Yellow, red and orange move by 0.036 to 0.045. No palette entry carries a `cmyk` value. A tuned print value needs a press profile and a proof, and the only profile here is a stand-in, so a value taken from it would only look like a tuned one. Run the script again with the profile that the printer names, for example `python scripts/design/bachelor-gamut.py --profile path/to/profile.icc`, and set `cmyk` on the flags it moves. The script prints `not tested` and the reason, and exits 0, when Pillow, littleCMS or the profile is missing.

## The candidate

A second design is in `candidates/ladder.tokens.json`. It trades body text on two fields for seven flags that stand on their own lightness in print. Red (#EC000F) and green (#00AF64) sit between the two luminance bands, at L* 49.3 and 63.0. In a lit room their inks reach 3.66:1 and 3.33:1, above the 3:1 gate for large text but below the 4.5:1 gate for body text, so both carry titles only. Body text on those two fields is not supported.

Seven flags stand on the print ladder, 12.4 L* or more apart: violet 12.0, blue 24.4, magenta 36.9, red 49.3, green 63.0, orange 78.4 and yellow 93.3. Cyan (L* 83.9) sits between orange and yellow and is the only flag declared patterned in print, carrying its check pattern. The primary design keeps body text on all eight flags at the price of three patterned flags in print (green, cyan, magenta). The candidate keeps seven on lightness at the price of titles only on red and green. `node scripts/design/bachelor.ts --candidate ladder` checks the candidate and generates its token file.

## Typography

Overpass, for both the text role (`sans`) and the display role (`display`). Overpass is an open source family from Red Hat, inspired by Highway Gothic, the alphabet of American road signs. Those letters were drawn to be read at a distance and at speed, with a tall lowercase and open apertures, so that c, e and s stay legible as the letters blur. The family runs from weight 100 to 900, which gives the heavy weights that Bachelor asks for: 500 for text on a field, 700 for emphasis, 800 for titles and 900 for display lines. A thin stroke blurs away at a distance sooner than a thick one.

Nothing about the typeface is measured here. The font files are not in the repository until phase 4, so the statements above come from its published design without inspection of the font binaries. Overpass is published under the SIL Open Font License 1.1, with the LGPL 2.1 offered as an alternative. The licence text is shipped with the font files when they are fetched in phase 4. Until then the pages use the system fonts.

The sizes are derived from the viewing distance in `design.viewing`, `design.slide` and `design.type`, and the design script checks them:

- The cap height subtends 20 arcminutes for body text, with 16 arcminutes as the floor for the smallest text. The farthest viewer sits six screen heights from the screen, and the cap height is 0.7 em. Six screen heights and a cap height of 0.7 em are assumptions, and phase 4 should check the second against the font files.
- That puts the cap height at 3.49 per cent of the slide height. On a slide 960 by 540 pt, which is 13.33 by 7.5 inches, body text is 26.9 pt, rounded up to 28 pt, and the floor is 21.5 pt, rounded up to 22 pt for captions. Titles are 1.5 times the body size, 42 pt, which is the ratio of the 18 pt that WCAG calls large text to a 12 pt body. Display lines are twice the title size, 84 pt.
- On a sign, body lettering needs 8.3 mm of type size for each metre of viewing distance and titles 12.5 mm. At 5 metres that is 42 mm and 62 mm. At 20 metres it is 166 mm and 249 mm.

Body text on a field is held to 4.5:1 and titles to 3:1, as the projector profile asks.

## What Bachelor is not for

- Flags as text colours. Yellow on the light ground is 1.04:1 and blue on the dark ground 1.69:1. A flag is a field or a chart mark. Text goes on a field in its ink, or on the ground in the text colour.
- Chart marks without an outline. Each flag falls below 3:1 against one of the two grounds: yellow (1.04:1), cyan (1.34:1), green (1.63:1) and orange (1.70:1) against the light ground, and violet (1.17:1), blue (1.69:1), magenta (2.62:1) and red (2.65:1) against the dark one. The outline in the text colour carries the mark.
- Ramps. The family has no sequential or diverging scale. A ramp needs steps in the middle of the lightness range, and the middle of the range holds no field.
- Status. There is no status block. On a slide or a sign a status is a field with its ink, an icon and a word.
- Print without a press profile. Five flags move by more than 0.06 through the stand-in profile (see CMYK gamut).
- Reading at a desk. The declared pairs pass WCAG AA, but the type sizes are for a hall.
- Telling all eight flags apart in greyscale by lightness. Green, cyan and magenta need their patterns.

## Licence

Code is MIT; colour tokens and documentation are CC BY 4.0. See the root `LICENSE`.
