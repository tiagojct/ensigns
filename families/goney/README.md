# Goney

Goney is the identity family of Tiago Jacinto: a pale frost field with one sky-blue mark. This is version 0.2.0. Until this release the family was called Glauca, and its last version under that name was 0.1.0.

The colours are in `goney.tokens.json` in this folder, which follows `schema/family.schema.json`. The palette in the token file is the only place a colour is defined, and the rest of the repository reads it from there. Themes and packages will be generated from it in a later phase of the migration, and their installation notes will sit with them in `packages/`. Nothing from Glauca was ever published to a package registry.

## Goal

Tiago's identity on the web, in documents and on slides.

## The ship

Chapter 52, The Albatross. South-east of the Cape the Pequod passes a whaler that has been at sea for nearly four years, "the Goney (Albatross) by name". The ship is "bleached like the skeleton of a stranded walrus", and her spars and rigging look like the branches of trees "furred over with hoar-frost". The family keeps Glauca's frost field and takes the ship's name.

## Environments

`meta.environments` in the token file lists three environments. Each threshold and its reason is in `tests/environments.json`, and the checks are in `lib/harness`. `node scripts/report.ts goney` writes every check with its measured value to `reports/goney.json`, and `npx vitest run tests/environments` runs the same checks as tests.

- office-screen: a reader at a desk on an ordinary monitor, where every text pair the token file declares must meet WCAG 2.x AA (4.5:1 for text, 3:1 for large text and interface components), and AAA and APCA are reported without being gated.
- editor: code as the themes draw it, where every syntax colour must reach 4.5:1 on the editor background and on the current-line highlight, and 3:1 on the selection.
- cvd: colour vision deficiency, where each declared distinct set keeps its members at least 0.06 apart in OKLab under normal vision and under protan, deutan and tritan simulation, except pairs that something other than colour already tells apart.

The office-screen profile passes, and so do the gates of the cvd profile, which also lists warnings (see Colour vision). The editor profile passes with one waived failure. In Profundum the keyword colour is the blue mark #007AFF. It reaches 4.53:1 on the editor background but only 4.15:1 on the current line, which Goney draws in its surface colour `saxum.umbra`. The token file records the waiver under `exceptions`, with the options still open: lighten the keyword, soften the current-line highlight, or accept the shortfall. `tests/environments/exceptions.test.ts` fails if a waiver outlives the failure it covers.

## Modes

| Mode | Label | Ground | Body text | Body contrast | Link |
|---|---|---|---|---|---|
| light | Pruina | `pruina.charta` | `light.text` | 14.64:1 | `light.accent` #0B62CF, 5.18:1 |
| dark | Profundum | `saxum.pix` | `pruina.pruina` | 15.55:1 | `dark.accent` #3D97FF, 6.13:1 |

Pruina is Latin for hoarfrost, and Profundum for the deep.

The blue mark is a ramp of three accents, Dies, Aer and Imum:

| Accent | Profundum | Pruina |
|---|---|---|
| Dies | `caelum.dies` #007AFF | `light.accent` #0B62CF |
| Aer | `caelum.aer` #6CB2FF | `caelum.imum` #084B96 |
| Imum | `caelum.imum` #084B96 | `caelum-light.imum` #002E73 |

In Pruina the ramp is darker so that it reads on the pale ground: Aer takes the value that is Imum in Profundum, and Imum has a value of its own, new in 0.2.0. #007AFF itself is the bright accent in Pruina (`extra.accent-bright`), at 3.63:1 on the ground.

The field is made of the dark neutrals in `saxum`, the pale neutrals in `pruina` and the blue-grey tints in `glaucum`. Code and terminals add five extended hues, each with a darker value for Pruina: folium (green) for strings, bacca (red) for decorators, viola (violet) for numbers and constants, lacus (blue) for functions and unda (cyan) for types. Keywords take the mark, set in bold. Charts use Okabe-Ito for categories, a seven-step Dies blue ramp for sequential data and a nine-step blue to copper scale with a pale centre for diverging data.

## Rules

Three rules are stated in the token file.

- `one-mark`: The bloom is the field; the blue is the mark. The check `accent-only-in-roles:link,button,focus`, run by `tests/shared/rules.test.ts`, allows only link, button and focus to share the accent colour among the core and extra roles.
- `extended-hues`: The extended hues (folium, bacca, viola, lacus, unda) appear in code and terminals only. No test checks this rule yet. Three of these hues are also status colours: danger is bacca, success is folium and info is lacus.
- `hover-direction`: Hovers darken in light mode and brighten in dark mode. The check `hover-direction`, run by the same test, requires the link hover to be lighter than the link in Profundum and darker in Pruina, in OKLab lightness.

## Changes in 0.2.0

The family is renamed from Glauca to Goney, and its token file moves from `src/glauca.json` in the old repository to `goney.tokens.json` in the Ensigns schema. One colour changes.

| Address | Mode | 0.1.0 | 0.2.0 | Reason |
|---|---|---|---|---|
| `accents.imum` | Pruina | #084B96 | #002E73 | Imum had no value of its own |

In Glauca the light values of Aer and Imum were both #084B96, because the generator mapped both to the deep accent. Two members of a distinct set may not share a value, which left two ways out: give Imum its own value, or declare Imum an alias of Aer and take the pair out of the set. This release gives Imum its own value. #002E73 sits at OKLab lightness 0.32, 0.099 from Aer under normal vision and at least 0.092 from it under every simulation, and reaches 11.58:1 on the Pruina ground. The link hover, `extra.accent-deep` and the first step of the diverging scale keep #084B96.

Every other colour equals Glauca 0.1.0 as the old Gam site read it; `tests/shared/equality.test.ts` checks this against `tests/fixtures/legacy/model/glauca.json`. Colours that Glauca's generator computed for the light mode, among them the light syntax colours and the light terminal, are now written out as palette entries. For the harness, the token file also declares 14 contrast pairs, the four distinct sets below, two rule checks and one waiver. The change record is `tests/shared/expected-changes/goney.json`.

## Colour vision

The token file declares four distinct sets. Each figure is the smallest OKLab distance between two members of a set after simulation with the matrices of Machado, Oliveira and Fernandes (2009) at severity 1.0 in linear light (`lib/colour/cvd.ts`), leaving out declared aliases (number and constant share viola). (r) marks a pair declared as reinforced.

| Set | Mode | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|---|
| blue-trio | Profundum | 0.170 Dies, Aer | 0.169 Dies, Aer | 0.169 Dies, Aer | 0.117 Dies, Aer |
| blue-trio | Pruina | 0.099 Aer, Imum | 0.101 Aer, Imum | 0.092 Aer, Imum | 0.098 Aer, Imum |
| syntax-hues-dark | Profundum | 0.076 function, type | 0.037 number, function (r) | 0.026 number, function (r) | 0.020 function, type (r) |
| syntax-hues-light | Pruina | 0.045 function, type | 0.021 number, function (r) | 0.012 number, function (r) | 0.012 function, type (r) |
| ansi-hues | Profundum | 0.087 blue, cyan | 0.032 green, yellow | 0.025 magenta, cyan | 0.029 blue, cyan |
| ansi-hues | Pruina | 0.070 blue, cyan | 0.021 green, yellow | 0.023 magenta, cyan | 0.013 blue, cyan |

The blue trio is a gate under normal vision and under all three simulations, in both modes, and it passes. The set is new in this release: while Aer and Imum shared a value in Pruina, the three could not be a distinct set.

The syntax sets are gates under normal vision and reports under simulation, so a shortfall under simulation is a warning. In Profundum the gate is 0.06. In Pruina function and type are 0.045 apart, under the 0.06 target, so that set carries a floor of 0.045 that stops them coming closer, and the report lists the shortfall. Number, constant and type are set in italic and function is upright, so three pairs are reinforced: number and function, function and constant, function and type. Leaving those out, the smallest distance under simulation is 0.050 in Profundum (tritan, keyword and type) and 0.030 in Pruina (tritan, string and type). The pairs below 0.06 that nothing reinforces:

- Profundum, tritan: keyword and function 0.053, keyword and type 0.050, string and function 0.054, string and type 0.057.
- Pruina, protan: number and type 0.055, type and constant 0.055.
- Pruina, deutan: string and decorator 0.040, number and type 0.038, type and constant 0.038, type and decorator 0.058.
- Pruina, tritan: keyword and function 0.054, string and function 0.035, string and type 0.030.

These colours come unchanged from Glauca, whose colour vision check was a report that never failed. Retuning the syntax hues is an open decision. Until it is made, a reader with a colour vision deficiency cannot rely on colour alone to tell these roles apart.

The ansi-hues set is a gate under normal vision and a report under simulation. A terminal cannot add italic or bold to a colour, so nothing reinforces the ANSI pairs, and in Pruina blue and cyan are 0.013 apart under tritan simulation.

## Typography

IBM Plex Serif (`serif`), IBM Plex Sans (`sans`) and IBM Plex Mono (`mono`), under the SIL Open Font License. The licence reserves the name Plex, which limits what a subset or converted copy of the fonts may be called. The fonts are not included in this folder.

## What Goney is not for

- A dark room at night. Profundum body text is 15.55:1, and nothing caps how bright a colour may be. Jungfrau is built for night work.
- Projection. Slides are part of the goal, but the projector profile, which adds room light to both colours of a pair, is not implemented yet. No Goney colour pair has been measured for a projector.
- Code in which colour alone must separate the syntax roles for readers with a colour vision deficiency; see the list above.

## Licence

Code is MIT; colour tokens and documentation are CC BY 4.0. See the root `LICENSE`.
