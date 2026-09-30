# Rachel

Rachel is the family for patient-facing material: apps, leaflets, consent forms and health education for older adults, people with low vision and people with low health literacy. It has a warm paper ground, one blue for action and three gentle status levels that each carry an icon and words. This is version 0.1.0.

The colours are in `rachel.tokens.json` in this folder, which follows `schema/family.schema.json`. The palette in the token file is the only place a colour is defined. `specimen/` holds a phone screen, a leaflet page and a consent form, and `npm run pages` builds local pages that show both modes and the specimen. `CHANGELOG.md` has the release notes.

## Goal

Patient-facing apps, leaflets, consent forms and health education, for older adults, people with low vision and people with low health literacy.

Text is dark on a light ground, or light on a dark one, at a contrast that survives a yellowed lens, and there is no pale grey text. Status is never carried by colour alone: each level has an icon, words, a border width and its own lightness. Type is large, with a floor of 18 px and a body size of 20 px. Controls are at least 48 px high and wide.

## The ship

Chapter 128, The Pequod Meets the Rachel. A large ship bears down on the Pequod with her spars crowded with men. Her captain has lost a whale-boat with his son in it, and he asks Ahab to help him search. Ahab refuses, and the Rachel sails on looking. In the Epilogue she is the ship that picks up Ishmael: "It was the devious-cruising Rachel, that in her retracing search after her missing children, only found another orphan."

The colours come from one image in chapter 128. The Rachel searches through the night, "kindling a fire in her try-pots for a beacon", and goes on "till daylight". The dark mode is called Beacon and the light mode Daylight. Four hues are named after words of the chapter: sea for the blue of action, spray for the teal of Fine ("this ship that so wept with spray"), fire for the amber of Needs attention, and cherry for the brick or coral of Contact your clinician (the men in the rigging are compared to "three tall cherry trees"). The link between these words and these meanings is the design's own. The chapter does not make it.

## Environments

`meta.environments` in the token file lists four environments. Each threshold and its reason is in `tests/environments.json`, and the checks are in `lib/harness`. `node scripts/report.ts rachel` writes every check with its value to `reports/rachel.json`, and `npx vitest run tests/environments` runs the same checks as tests.

- aged-eye: a reader whose lens has yellowed. Both colours of a pair go through Machado tritanomaly at severity 0.5 and then a flare of 0.02. Every declared text pair keeps 7:1 after that, and each distinct set marked for the profile stays 0.06 apart in OKLab.
- sunlight: a phone or tablet in daylight. A glare of 0.06 is added to every luminance. Text keeps 4.5:1 after it, in both modes, and each marked set stays 0.06 apart.
- print-grey: greyscale laser print. Every colour becomes the grey of the same luminance. Text keeps 7:1 after that, and the members of a marked set are at least 12 L* apart.
- cvd: colour vision deficiency. Every distinct set keeps its pairs 0.06 apart in OKLab under normal vision and under protan, deutan and tritan simulation. Rachel sets no floor below 0.06 and declares no reinforced pair.

Office-screen also runs, because the token file declares pairs. Each pair must meet its own minimum. Rachel gives every text pair a minimum of 7:1 and leaves components at 3:1.

The aged-eye gate is the tightest text gate. With the flare, the ratio of an ink to its ground is (ground + 0.07) divided by (ink + 0.07), in relative luminance. On the Daylight paper, at a luminance of 0.869, the ink can be 0.064 at most. On the Beacon ground, at 0.0099, the ink must be 0.489 at least. The sunlight and print-grey text gates are weaker for the same pair. The design script, `scripts/design/rachel.ts`, prints these limits for every ground.

All five profiles pass in 0.1.0 with no errors and no warnings. The table under Checks gives each profile's tightest check.

## Modes

| Mode | Label | Ground | Body text | Body contrast | After the aged-eye simulation |
|---|---|---|---|---|---|
| dark | Beacon | `hearth.ground` #1F1813 | `hearth.ink` #F1E7D2 | 14.27:1 | 11.00:1 |
| light | Daylight | `paper.ground` #F7EFE0 | `paper.ink` #20160E | 15.54:1 | 11.95:1 |

Beacon is for dark surroundings: a warm brown-black with a cream ink instead of a white one. Daylight is for lit ones: a cream paper with a near-black brown ink. Each mode is a design of its own. The same meanings hold in both, and each meaning is lighter or darker as its ground needs. Amber is the lightest status colour in both modes and brick or coral the darkest.

## Structure

Each mode has fifteen colours, from six palette groups of the token file. Forty-three addresses name them.

| Colour | Daylight | Beacon | Used for |
|---|---|---|---|
| ground | `paper.ground` #F7EFE0 | `hearth.ground` #1F1813 | the page, and the text on button fills and on the solid icons |
| panel | `paper.panel` #F3E8D5 | `hearth.panel` #261F19 | `surface`, and the track of the range bar |
| sheet | `paper.sheet` #FDFAF1 | `hearth.sheet` #2E2620 | `surface-raised`, cards, leaflet and form sheets, input fields |
| ink | `paper.ink` #20160E | `hearth.ink` #F1E7D2 | `text`, control outlines, the words of status boxes, the range marker |
| soft ink | `paper.soft-ink` #4C3B30 | `hearth.soft-ink` #D7CBB7 | `text-muted` and `text-subtle`, which are one colour |
| edge | `paper.edge` #887865 | `hearth.edge` #897965 | `border` |
| sea | `sea.day` #034574 | `sea.night` #9DD1FF | `link`, `accent`, `button`, `focus` |
| sea, hover | `sea.day-deep` #15324D | `sea.night-bright` #CBE2F9 | `link-hover`, `extra.button-hover` |
| sea, tint | `sea.day-tint` #DAECFD | `sea.night-tint` #1F405E | `selection` |
| spray | `spray.day` #137070 | `spray.night` #6EBFBE | `status.success` |
| spray, tint | `spray.day-tint` #DDF2F1 | `spray.night-tint` #163333 | `extra.success-fill`, the target band of the range bar |
| fire | `fire.day` #A87D2C | `fire.night` #FFCD75 | `status.warning` |
| fire, tint | `fire.day-tint` #FDEACC | `fire.night-tint` #3A2B11 | `extra.warning-fill` |
| cherry | `cherry.day` #7A2F1E | `cherry.night` #D37762 | `status.danger`: brick in Daylight, coral in Beacon |
| cherry, tint | `cherry.day-tint` #FFE7E1 | `cherry.night-tint` #402620 | `extra.danger-fill` |

- roles: the fifteen core roles. `text-subtle` is `text-muted`, because there is no subtle grey. `on-button` and `on-accent` are the ground colour. Link, accent, button and focus are one colour, the action colour.
- extra roles: `control-edge`, `button-hover`, and for each level a `-fg` (ink), a `-fill` (the tint), a `-border` (the level's colour) and an `-on` (the mark inside the solid icon: the ground colour, except for amber in Daylight, where it is ink). Also the three parts of the range bar: `meter-track`, `meter-target` and `meter-marker`.
- accents: `sea`, `spray`, `fire` and `cherry`, the four hues. They are the action colour and the three status colours.
- surfaces: `page`, `panel`, `sheet` and `field`.
- status: chromatic, with `danger`, `warning` and `success` and no fourth level. Success is fine, warning is needs attention, and danger is contact your clinician. The words and icons are design tokens: `design.status.<level>.label` and `.icon`. The icons are `circle-tick`, `triangle-exclamation` and `square-phone`, three silhouettes.
- design: the type scale, touch targets, space, radius, borders, focus, print sizes and the status tokens. See below.
- pairs and distinct: 16 text pairs and 15 component pairs, and two distinct sets, `status` (the three status colours) and `hues` (the action colour and the three status colours).

There is no data block and there are no syntax, ANSI or terminal blocks. The targets exclude the editor and terminal bundles: vscode, zed, neovim and terminals.

## Rules

Nine rules are stated in the token file. Four of them name checks that `tests/shared/rules.test.ts` runs in both modes. The other five are prose that binds this README and the specimen, and the profiles or the test file hold most of them.

- `one-action-colour`: links, buttons, the focus ring and the accent share one colour, and no other role does. Checks `accent-only-in-roles:link,button,focus` and `hover-direction`: a link darkens on hover in Daylight and lightens in Beacon.
- `status-by-lightness`: the three status levels differ by at least 12 L* in both modes. Three `lightness-gap` checks.
- `no-blue-against-violet-or-green`: twelve checks, `not-blue-violet` and `not-blue-green`, on every pair of the action colour and the three status colours. The action colour is blue and the status colours are teal, amber and brick or coral, so no pair crosses the line.
- `no-red-against-green`: three `not-red-green` checks on the status pairs.
- `urgent-has-icon-and-words`: every level carries an icon and words, and the most urgent one is never shown by colour alone or by red alone. No automatic check. The test file `tests/families/rachel.test.ts` checks that each level has a distinct icon token and a label, and that the specimen shows each with an icon.
- `seven-to-one`: every text colour keeps 7:1 on its ground after the aged-eye simulation, muted text included. The aged-eye profile checks it for every declared text pair.
- `few-colours`: fifteen colours in each mode. The test file counts them.
- `large-type`: body text is 20 px or larger and no text is smaller than 18 px. The test file checks the tokens and every font size of the specimen.
- `big-targets`: every control is at least 48 px high and wide, with at least 8 px between controls, and a checkbox is the whole row of box and label. No automatic check on the size of the specimen's controls; the tokens are checked.

## Typography

Atkinson Hyperlegible Next, as `sans`. It is the typeface the brief names. The Braille Institute drew the Atkinson Hyperlegible family for readers with low vision, and it separates look-alike characters such as a capital I, a lower-case l and a figure 1. It is under the SIL Open Font License 1.1, as far as I know. Nobody has checked that against the font files, which are not fetched until phase 4, and the licence text will ship with them. No font is included in this folder, and the local pages show it only where it is installed, with the system sans as the fallback.

Rachel adds no serif and no mono. Patient material has no code. A reference number can be set in the same typeface, which already separates look-alike characters.

The sizes are in rem, so that a reader's own text size setting scales them. The pixel values below assume a root size of 16 px.

| Token | Size | Pixels | Use |
|---|---|---|---|
| `design.type.size.min` | 1.125 rem | 18 | the floor for any text: captions, hints, ticks |
| `design.type.size.body` | 1.25 rem | 20 | body text, buttons, form fields |
| `design.type.size.lead` | 1.375 rem | 22 | the first paragraph of a leaflet |
| `design.type.size.h3` | 1.5 rem | 24 | small headings |
| `design.type.size.h2` | 1.875 rem | 30 | headings |
| `design.type.size.h1` | 2.375 rem | 38 | titles |
| `design.type.size.reading` | 4.5 rem | 72 | a measured value, such as a glucose reading |

The body is 20 px because the readers are older adults and people with low vision. The brief gives 18 px as the usual floor for body text for older readers, and 20 px or more as kinder. The floor for any text is 18 px, which leaves captions 2 px under the body. The line height is 1.6 for body text, 1.25 for headings and 1 for a measured value. The measure is 60 characters. Paragraphs are 1.25 em apart, letters 0.01 em apart, and the weights are 400 and 700.

For print, the tokens under `design.print` give a floor of 12 pt, a body of 14 pt, a large-print size of 18 pt and a line height of 1.5. They are for the Typst, Quarto and Word leaflet bundles.

## Targets and space

| Token group | Values |
|---|---|
| `design.touch.target` | `min` 48 px, `comfortable` 56 px |
| `design.touch.gap` | `min` 8 px, `comfortable` 16 px |
| `design.space` | `xs` 4 px, `sm` 8 px, `md` 16 px, `lg` 24 px, `xl` 32 px, `2xl` 48 px, `3xl` 64 px |
| `design.radius` | `sm` 6 px, `md` 12 px, `lg` 20 px, `round` 999 px |
| `design.border.width` | `default` 2 px, `strong` 3 px |
| `design.focus` | 4 px solid, offset 3 px |
| `design.status.<level>.border-width` | success 2 px, warning 3 px, danger 4 px |

The brief asks for touch targets of at least 44 px and names 48 px as common guidance. Rachel takes 48 px and uses 56 px for buttons, tabs and form rows. The focus ring is an outline, so it is a line and survives a forced-colours mode. The status border grows with the level, which is a third cue after the icon and the words.

## Measured results

All values come from `lib/colour` and the harness. Run `node scripts/design/rachel.ts` to print them.

### Text contrast

Sixteen text pairs are declared in both modes. Each gives the plain contrast and the contrast after the aged-eye simulation.

| Text on ground | Daylight | Daylight, aged eye | Beacon | Beacon, aged eye |
|---|---|---|---|---|
| `roles.text` on `roles.bg` | 15.54 | 11.95 | 14.27 | 11.00 |
| `roles.text` on `roles.surface` | 14.64 | 11.27 | 13.23 | 10.39 |
| `roles.text` on `roles.surface-raised` | 17.02 | 13.04 | 12.09 | 9.61 |
| `roles.text-muted` on `roles.bg` | 9.30 | 7.92 | 10.94 | 8.48 |
| `roles.text-muted` on `roles.surface-raised` | 10.18 | 8.64 | 9.27 | 7.41 |
| `roles.link` on `roles.bg` | 8.72 | 7.43 | 10.85 | 8.47 |
| `roles.link` on `roles.surface-raised` | 9.55 | 8.10 | 9.19 | 7.40 |
| `roles.link-hover` on `roles.bg` | 11.52 | 9.38 | 13.17 | 10.19 |
| `roles.link-hover` on `roles.surface-raised` | 12.61 | 10.23 | 11.16 | 8.90 |
| `roles.on-button` on `roles.button` | 8.72 | 7.43 | 10.85 | 8.47 |
| `roles.on-button` on `extra.button-hover` | 11.52 | 9.38 | 13.17 | 10.19 |
| `roles.on-accent` on `roles.accent` | 8.72 | 7.43 | 10.85 | 8.47 |
| `roles.text` on `roles.selection` | 14.71 | 11.30 | 8.76 | 7.42 |
| `extra.success-fg` on `extra.success-fill` | 15.26 | 11.69 | 10.99 | 8.99 |
| `extra.warning-fg` on `extra.warning-fill` | 15.07 | 11.52 | 11.15 | 9.04 |
| `extra.danger-fg` on `extra.danger-fill` | 15.03 | 11.47 | 11.28 | 9.10 |

Plain contrast runs from 8.72:1 (Daylight, a link on the page) to 17.02:1 (Daylight, text on a sheet). After the aged-eye simulation it runs from 7.40:1 (Beacon, a link on a sheet) to 13.04:1. After a glare of 0.06 it runs from 5.40:1 (Beacon, a link on a sheet) to 8.75:1, against a gate of 4.5:1. In grey it runs from 8.68:1 to 17.01:1, against a gate of 7:1. The design script keeps the colours it searches for (soft ink, the action colour and the dark selection fill) 0.4 above the aged-eye gate of 7:1, so that one step of rounding in a hex value cannot cross it.

### Components

Fifteen component pairs are declared. Each is a colour against the ground it sits on, and the gate is 3:1 (4.5:1 for the control outline).

| Pair | Daylight | Beacon |
|---|---|---|
| `roles.border` on `roles.bg` | 3.73 | 4.16 |
| `roles.border` on `roles.surface-raised` | 4.09 | 3.53 |
| `extra.control-edge` on `surfaces.field` | 17.02 | 12.09 |
| `roles.focus` on `roles.bg` | 8.72 | 10.85 |
| `roles.focus` on `roles.surface-raised` | 9.55 | 9.19 |
| `roles.button` on `roles.bg` | 8.72 | 10.85 |
| `status.success` on `roles.bg` | 5.13 | 8.23 |
| `status.warning` on `roles.bg` | 3.26 | 11.88 |
| `status.danger` on `roles.bg` | 8.16 | 5.50 |
| `status.success` on `extra.success-fill` | 5.04 | 6.34 |
| `status.warning` on `extra.warning-fill` | 3.16 | 9.29 |
| `status.danger` on `extra.danger-fill` | 7.89 | 4.34 |
| `extra.success-on` on `status.success` | 5.13 | 8.23 |
| `extra.warning-on` on `status.warning` | 4.77 | 11.88 |
| `extra.danger-on` on `status.danger` | 8.16 | 5.50 |

The amber of Daylight is the weakest component colour, at 3.26:1 on the page and 3.16:1 on its own fill. It is the lightest of the three status colours, and each step down the ladder costs 12.6 L*. Darkening it would shrink its step to the teal, so the teal and the brick would have to move down too. The amber icon is a solid triangle with an ink mark, the level has a 3 px border, and the words are ink, so the colour is one cue of four.

### Status colours

| Level | Words | Icon | Daylight | L* | On the page | Beacon | L* | On the page |
|---|---|---|---|---|---|---|---|---|
| success | Fine | `circle-tick` | `spray.day` #137070 | 42.6 | 5.13 | `spray.night` #6EBFBE | 72.4 | 8.23 |
| warning | Needs attention | `triangle-exclamation` | `fire.day` #A87D2C | 55.3 | 3.26 | `fire.night` #FFCD75 | 85.1 | 11.88 |
| danger | Contact your clinician | `square-phone` | `cherry.day` #7A2F1E | 30.1 | 8.16 | `cherry.night` #D37762 | 59.8 | 5.50 |

The levels are 12.5 L* apart at the closest in Daylight and 12.6 L* in Beacon, against the print-grey gate of 12 L*. No pair is declared reinforced, so the status set takes no exemption from the icon and the words.

The lightest status colour of Daylight is the one held to 3.25:1 on the paper, and each step down is 12.6 L*. In Beacon the darkest is the coral, held to 5.5:1 on the ground, and each step up is 12.6 L*. The hues were chosen second. The design script searched 576 combinations of the three status hues inside narrow windows (spray 188 to 202 degrees, fire 72 to 88, cherry 28 to 42) and scored each by its worst pair, with the action colour included, over both modes and six views: normal vision, the three colour-vision simulations, the aged eye and sunlight. The score is flat. All 576 combinations fall within 0.005 of the best, 0.090, which is the distance between the blue and the teal in Beacon under tritan simulation, so the hues sit at the centres of their windows: spray 194, fire 80 and cherry 34.

The action colour was searched before the status hues. The deep blues of Pequod and Goney crowd the region where a link reaches 7:1 on paper. The design script searched blues from 244 to 258 degrees, with the chroma and the hover of each mode, for the largest distance from every accent, link and focus colour of Pequod, Goney, Jungfrau and Rosebud. The best score is 0.040: no base or hover of the chosen blue, at 248 degrees, is nearer than that to an accent of another family. Daylight chroma stays at 0.10 or more and Beacon chroma at 0.09 or more, so that the colour reads as a blue.

### Colour vision

The smallest OKLab distance between two members of each set, after simulation with the matrices of Machado, Oliveira and Fernandes (2009) at severity 1.0 in linear light (`lib/colour/cvd.ts`). The aged-eye and sunlight columns are the simulations of those profiles. Every gate is 0.06.

| Set | Mode | Normal | Protan | Deutan | Tritan | Aged eye | Sunlight |
|---|---|---|---|---|---|---|---|
| status | Daylight | 0.201 | 0.137 | 0.121 | 0.211 | 0.180 | 0.147 |
| status | Beacon | 0.208 | 0.143 | 0.125 | 0.204 | 0.188 | 0.185 |
| hues | Daylight | 0.141 | 0.137 | 0.121 | 0.114 | 0.116 | 0.103 |
| hues | Beacon | 0.113 | 0.098 | 0.100 | 0.090 | 0.099 | 0.098 |

In `status` the closest pair is usually warning and success. The exceptions are danger and success under deutan simulation in both modes and in Daylight sunlight, and danger and warning under tritan simulation in Beacon. In `hues` the closest pair is sea and spray, except under protan simulation in Daylight (spray and fire) and under deutan simulation in Daylight (spray and cherry).

The hues set is not held to a lightness gap, because print-grey gates only the status set. In Daylight the action blue (L* 28.2) and the brick (L* 30.1) are 1.9 L* apart, so on a grey print they would look alike. A link carries an underline and a button carries a shape and a label, and on a screen the four colours stay 0.090 or more apart in every simulation.

### Distance from the other families

The nearest accent of another family to each hue, by OKLab distance. The pool is `accents.*` and the accent, link, link-hover and focus roles of Pequod, Goney, Jungfrau and Rosebud, in the same mode.

| Colour | Nearest accent | Distance |
|---|---|---|
| `sea.day` | Pequod, Queequeg | 0.040 |
| `sea.day-deep` | Pequod, link | 0.043 |
| `sea.night` | Pequod, Starbuck | 0.040 |
| `sea.night-bright` | Pequod, Starbuck | 0.045 |
| `spray.day` | Rosebud, link hover | 0.027 |
| `spray.night` | Rosebud, link | 0.035 |
| `fire.day` | Pequod, Stubb | 0.135 |
| `fire.night` | Pequod, Pip | 0.055 |
| `cherry.day` | Jungfrau, flame | 0.041 |
| `cherry.night` | Goney, Bacca | 0.042 |

The action colour is held to 0.03 by the design script. The status colours are nearer, because the 12.6 L* ladder fixes their lightness and the existing accents fill most of the space around each. The design script scans every cyan hue and a range of chroma at the ladder lightness. In Daylight no teal gets further than 0.035 from an accent of another family, so the teal of Fine is 0.027 from the hover teal of Rosebud. In Beacon a teal at 220 degrees and 0.12 chroma would be 0.070 away, but it would sit nearer the blue, and Daylight has no such option, so both modes keep one hue.

### Checks

| Profile | Checks | Errors | Warnings | Tightest check |
|---|---|---|---|---|
| aged-eye | 36 | 0 | 0 | Beacon, `roles.link` on `roles.surface-raised`: 7.40 against 7 |
| sunlight | 36 | 0 | 0 | Beacon, `roles.link` on `roles.surface-raised`: 5.43 against 4.5 |
| print-grey | 34 | 0 | 0 | Daylight, status apart in grey: 12.54 L* against 12 |
| cvd | 20 | 0 | 0 | Beacon, hues under tritan simulation: 0.090 against 0.06 |
| office-screen | 156 | 0 | 0 | Daylight, `status.warning` on `extra.warning-fill`: 3.16 against 3 |

## Specimen

`specimen/specimen.html` and `specimen/specimen.css` show three things, in both modes: a phone screen with a glucose reading against a target range, a leaflet page, and a consent form. The phone shows a large number with its unit, a range bar with the target marked, the three status levels as icon and words, and a tab bar whose current tab is bold and underlined. The leaflet has headings, body text at the lead and body sizes, a short list and a box for when to contact a clinician. The form has four checkboxes with whole-row hit areas, a text field, a required marker that is an asterisk and the word Required, and two buttons. Keyboard focus is a 4 px outline, and the form includes an inert sample of it.

The readings, names and leaflet text are invented, and the specimen says it is not medical advice.

## What Rachel is not for

- Charts. Rachel has no data block and no chart palette. A chart in a leaflet needs its own colours, and the status colours must not double as series colours, because each of them already means something.
- Editors and terminals. The family has no syntax, ANSI or terminal colours.
- Dense professional screens. The type floor is 18 px and the controls are 48 px, which suits a phone in an older reader's hand and not a dashboard. Rosebud is the family for long hours at dense tools.
- A dark room at night. Beacon is a dark mode for dark surroundings, and it has not been tested against the night profile. Jungfrau is the family for night reading.
- Projection, e-ink and photocopy. Only the four listed profiles and office-screen have been run.
- Clinical triage. The status levels are a message to a patient. The clinical profile, which tests colours for professionals, was not run.
- Messages in colour alone. A level shown without its icon and words is outside the family.

## Licences

Code is MIT; colour tokens and documentation are CC BY 4.0. See the root `LICENSE`. Atkinson Hyperlegible Next is not part of this repository and has its own licence, the SIL Open Font License 1.1 as far as I know.
