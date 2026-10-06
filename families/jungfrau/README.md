# Jungfrau

Jungfrau is the night family of Ensigns. A cold sea is the field, and the fire is the one hot mark. This is version 2.0.0. Until this release the family was called Try-Works, and its last version under that name was 1.0.0. Version 2.0.0 repositions it for use at night, and most colours changed.

The colours are in `jungfrau.tokens.json` in this folder, which follows `schema/family.schema.json`. The palette in the token file is the only place a colour is defined, and the rest of the repository reads it from there. Themes and packages will be generated from it in a later phase of the migration, and their installation notes will sit with them in `packages/`.

## Goal

Reading, writing and code in a dark room at night.

In a dark room the eye adapts to low light. A bright page or bright text then causes glare, and light letters on a dark ground seem to bleed into it (halation). Jungfrau keeps every colour under a brightness cap, holds body text at 7:1 to about 8.6:1 where Try-Works had 15.79:1, and keeps blue and violet out of text. The case for the family rests on glare, halation and dark adaptation. Nothing here claims an effect on sleep or melatonin.

## The ship

Chapter 81, The Pequod Meets the Virgin. The Jungfrau of Bremen has run out of oil. Her captain comes over to the Pequod by boat with a lamp-feeder and an oil-can to beg for some, because his ship is what the fishery calls "a clean one (that is, an empty one)". Jungfrau is German for the Virgin of the chapter title.

The fire comes from Try-Works, the family's former name: the try-works are the brick furnace on the Pequod's deck where blubber is boiled down to oil, in chapter 96. That chapter also gives the family its warning: "Look not too long in the face of the fire".

## Modes

| Mode | Label | Ground | Ground luminance | Body text | Body contrast |
|---|---|---|---|---|---|
| dark | Try-Fire | `ground.pitch` #171B21 | 0.0108 | `whale.whale` | 7.61:1 |
| light | Lamp-feeder | `lamp.paper` #B5A892 | 0.399 | `lamp.ink` | 8.07:1 |

Light does not mean daytime here. Lamp-feeder is a dimmed warm paper for reading by a lamp at night, at about half the luminance of Pequod's Parchment (0.762). The mode was called True Lamp until this release. In chapter 96 the sun is "the only true lamp" and every other lamp a liar, so the name did not fit a dim paper read by lamplight. The new label comes from chapter 81, from the lamp-feeder the Jungfrau's captain carries.

The main palette groups are `ground` (dark fields), `whale` (text), `fire` (ember, flame and oil), `sea` (the tints behind selections and fields) and `extended`, the five code hues kelp, brick, dusk, tide and shoal. Lamp-feeder draws on groups of its own (`lamp`, `fire-lamp`, `sea-lamp`, `extended-lamp`, `ansi-lamp`, `code-lamp`).

Ember #D56F2B is the link, accent, button and keyword colour in Try-Fire; its Lamp-feeder value is `fire-lamp.ember` #602500. Flame is the link hover and the focus colour in Try-Fire. In Lamp-feeder the hover darkens to oil and focus stays on ember. Code uses ember in bold for keywords, kelp for strings, dusk in italic for numbers and constants, tide for functions, shoal in italic for types, brick for decorators, and the muted text colour in italic for comments.

## Environments

The token file lists three environments in `meta.environments`. Each threshold and its reason is in `tests/environments.json`, and the checks are in `lib/harness`. `node scripts/report.ts jungfrau` writes every check with its measured value to `reports/jungfrau.json`, and `npx vitest run tests/environments` runs the same checks as tests.

- night: a dark room, where the dark ground has a relative luminance of 0.004 to 0.012 (target 0.010 to 0.012), body text sits at 7:1 to 11:1 and muted text at 4.5:1 or more, no colour in either mode is brighter than luminance 0.45, no text colour is blue or violet at visible chroma, and the light mode is a paper of luminance 0.35 to 0.45 with body text at 7:1 or more.
- editor: code as the themes draw it, where every syntax colour must reach 4.5:1 on the editor background and on the current-line highlight, and 3:1 on the selection.
- cvd: colour vision deficiency, where each declared distinct set keeps its members at least 0.06 apart in OKLab under normal vision and under protan, deutan and tritan simulation, except pairs that something other than colour already tells apart.

The 21 contrast pairs the token file declares (text, buttons, the sea fields and twelve terminal colours) also run under office-screen, as they do for every family that declares pairs: each must meet WCAG 2.x AA. All four profiles pass in 2.0.0, and cvd lists warnings for the sets it reports rather than gates (see Colour vision).

The night profile measures:

| Check | Limit | Try-Fire | Lamp-feeder |
|---|---|---|---|
| Ground luminance | 0.004 to 0.012 dark, 0.35 to 0.45 light | 0.0108 | 0.399 |
| Body text | 7:1 to 11:1 dark, 7:1 or more light | 7.61:1 | 8.07:1 |
| Muted text | 4.5:1 or more | 5.25:1 | 5.23:1 |
| Brightest colour, relative luminance | 0.45 or less | 0.448 | 0.441 |
| Text colours in the blue to violet range | none | none | none |

With nothing brighter than 0.45, body text on a ground this dark cannot pass about 8.6:1, so the 11:1 upper limit is out of reach by design. The Lamp-feeder muted text is checked by the office-screen pair, not by the night profile.

## Rules

Seven rules are stated in the token file.

- `one-hot-mark`: Fire is rare: one hot mark per surface. The check `accent-only-in-roles:link,button,focus`, run by `tests/shared/rules.test.ts`, allows only link, button and focus to share the ember accent among the core and extra roles.
- `cold-field`: The cold sea is the field; fire is the mark. A statement of the design, with no automatic check.
- `night-ground`: The dark ground sits at a relative luminance of 0.010 to 0.012 and keeps the sea hue. Body text is 7:1 to about 8.6:1 on it. The night profile checks the luminance (an error outside 0.004 to 0.012, a warning outside 0.010 to 0.012) and the body contrast. Nothing checks the hue.
- `no-blue-text`: No text role is blue. Blues appear only as dark fields. The night profile checks every text role, syntax colour, ANSI colour except black, and the terminal foreground in both modes.
- `brightness-cap`: No colour in either mode is brighter than a relative luminance of 0.45. The night profile checks every colour of both modes.
- `lamplight`: Light is lamplight, not daylight: a dimmed warm paper for reading at night, relative luminance 0.35 to 0.45. The night profile checks the paper's luminance and body text at 7:1 or more. Nothing checks that the paper is warm.
- `no-health-claims`: Nothing here claims an effect on sleep or melatonin. The case is glare, halation and dark adaptation. No automatic check: the rule binds the prose in this folder and on the site.

## Changes in 2.0.0

Every colour in Lamp-feeder changed, and most in Try-Fire. `docs/migration/phase2/jungfrau-before-after.json` lists all 191 addresses whose colour changed. `tests/shared/expected-changes/jungfrau.json` gives the old value, new value and reason for the 157 of them that the old Gam site's model covers, and the equality test holds the token file to that list. `CHANGELOG.md` has every old value in tables. The design is recorded in `scripts/design/jungfrau.ts`, which derives each colour in OKLCH from a stated rule and checks the night gates as it goes.

Dark ground and text (decision D11):

- The ground moves from luminance 0.0078 to 0.0108 (`ground.pitch`), inside the target band, and keeps the sea hue. The surfaces and the border step up with it.
- Body text drops from 15.79:1 to 7.61:1 (`whale.whale` #AFACA2). The Try-Works text colour had a luminance of 0.863, far over the cap.
- Muted text goes from 6.82:1 to 5.25:1.

Fire:

- Ember rises from 4.15:1 to 4.59:1 on the current line. At 4.15:1 the keyword failed the editor profile, and the migrated Try-Works tokens carried a waiver for it; 2.0.0 needs none.
- Flame moves up in luminance so that it stays at least 0.06 from ember. Oil keeps its Try-Fire value.
- In Lamp-feeder, ember, flame and oil each have a value of their own. In True Lamp flame and oil shared one.

Code hues:

- The five code hues were retuned together, inside the night limits. The function colour left the blue range: its OKLCH hue was 234, and tide is now at 207. Function and type were 0.030 apart in Try-Works. In Try-Fire the smallest distance between two code hues is now 0.074 under normal vision and 0.068 under any simulation, with no pair reinforced.

Terminal:

- ANSI blue is a slate, `ansi-dark.blue` #8FA5B5, at chroma 0.034, under the 0.04 limit of the blue rule.
- Try-Works' light terminal reused the dark ANSI colours, and on the True Lamp paper 10 of the 16 were below 3:1. Lamp-feeder has its own set: every normal colour reaches 4.5:1 on the paper and every bright colour 3:1.

Lamp-feeder:

- The paper goes from a cool sea-salt paper at luminance 0.783 to a warm paper at 0.399. The raised surface goes from 0.919 to 0.441. Ink sits at 8.07:1, where it was 12.21:1.
- Every other light colour is derived again for the dimmed paper. To reach 4.5:1 on it, a text colour can be no brighter than luminance 0.05, which leaves the code hues little room to differ (see Colour vision).
- The label changes from True Lamp to Lamp-feeder (decision D17).

Charts:

- The scales are derived again under the brightness cap. In Try-Fire only the Okabe-Ito yellow is lowered, to #C0B300. In Lamp-feeder all seven Okabe-Ito colours are darkened to about 3:1 on the paper (2.99 to 3.05). The sequential teal scale in Try-Fire now runs from dark to light; in 1.0.0 it ran from light to dark in both modes.

## Colour vision

The token file declares four distinct sets. Each figure is the smallest OKLab distance between two members of a set after simulation with the matrices of Machado, Oliveira and Fernandes (2009) at severity 1.0 in linear light (`lib/colour/cvd.ts`), leaving out declared aliases (number and constant share dusk). (r) marks a pair declared as reinforced.

| Set | Mode | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|---|
| fire-trio | Try-Fire | 0.080 Ember, Flame | 0.086 Ember, Flame | 0.073 Ember, Flame | 0.076 Ember, Flame |
| fire-trio | Lamp-feeder | 0.088 Ember, Flame | 0.084 Ember, Flame | 0.090 Ember, Flame | 0.089 Ember, Flame |
| syntax-hues-dark | Try-Fire | 0.074 string, type | 0.068 function, decorator | 0.068 keyword, string | 0.068 keyword, decorator |
| syntax-hues-light | Lamp-feeder | 0.066 keyword, decorator | 0.055 keyword, type (r) | 0.044 number, function (r) | 0.042 keyword, decorator (r) |
| ansi-hues | Try-Fire | 0.091 blue, magenta | 0.059 blue, magenta | 0.033 blue, magenta | 0.039 green, blue |
| ansi-hues | Lamp-feeder | 0.066 red, yellow | 0.051 red, blue | 0.044 magenta, cyan | 0.042 red, yellow |

Two sets are gates under normal vision and under every simulation: the fire trio, in both modes, and the Try-Fire code hues, which need no reinforced pair. Both pass.

The Lamp-feeder code hues are a gate under normal vision and a report under simulation, so a shortfall there is a warning. On the dimmed paper a text colour must stay at or below luminance 0.05 to reach 4.5:1, which leaves the hues little room. Pairs whose styles differ are reinforced: keyword is bold, number, constant and type are italic, and the rest are upright. That covers eight pairs. Leaving them out, the smallest distances are 0.061 (protan, string and type), 0.057 (deutan, string and decorator) and 0.044 (tritan, string and function). The pairs below 0.06 that nothing reinforces:

- Lamp-feeder, deutan: string and decorator 0.057.
- Lamp-feeder, tritan: string and function 0.044, number and type 0.059, type and constant 0.059.

The ansi-hues set is a gate under normal vision and a report under simulation. A terminal cannot add italic or bold to a colour, so nothing reinforces the ANSI pairs. In Try-Fire blue and magenta fall to 0.033 under deutan simulation.

## Typography

Fraunces (`serif`), Archivo (`sans`), JetBrains Mono (`mono`) and Literata (`reading`), all under the SIL Open Font License and kept from Try-Works. The fonts are not included in this folder.

## What Jungfrau is not for

- Daylight or a lit room. Lamp-feeder's paper has a luminance of 0.399, about half that of Pequod's Parchment; Parchment and Goney's Pruina are the light grounds for a lit room.
- Charts that need full-strength colour. The chart colours sit under the brightness cap, and in Lamp-feeder they reach only about 3:1. No figure profile has been run on them.
- Sleep. The family is not designed or tested as a sleep aid.

## Licence

Code is MIT; colour tokens and documentation are CC BY 4.0. See the root `LICENSE`.
