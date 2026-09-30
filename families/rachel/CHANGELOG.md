# Changelog

## 0.1.0 (2026-09-30)

First release of Rachel, after the ship of chapter 128, in the Ensigns repository. The token file is `families/rachel/rachel.tokens.json`, in the schema `schema/family.schema.json`.

- Two modes, Beacon (dark) and Daylight (light), of fifteen colours each: three grounds, ink and soft ink, an edge, one blue with a hover and a selection tint, and three status colours with a tint each. Forty-three addresses name them. The palette has six groups: paper, hearth, sea, spray, fire and cherry.
- Status is chromatic with three levels, success (Fine), warning (Needs attention) and danger (Contact your clinician). Each has an icon and a label as design tokens, a border width of 2, 3 and 4 px, and its own fg, fill, border and on roles. The levels are at least 12 L* apart in both modes.
- One action blue, chosen for its distance from the accents of Pequod, Goney, Jungfrau and Rosebud: no base or hover is nearer than 0.040 in OKLab. The status colours are nearer to other families (the teal of Fine is 0.027 from a Rosebud teal in Daylight); the README has the table.
- 16 text pairs at 7:1, 15 component pairs, and two distinct sets, `status` and `hues`, marked for aged-eye, sunlight and print-grey (status) and aged-eye and sunlight (hues). No pair is reinforced and no set reports instead of gating.
- Nine rules, four of them with checks: one action colour, the status levels by lightness, no blue against violet or green, no red against green.
- Design tokens: a type scale from 18 px to 72 px with a 20 px body, line heights, a measure, touch targets of 48 and 56 px, a scale of space, radii, border widths, a 4 px focus ring and print sizes.
- Typography names Atkinson Hyperlegible Next. No font is included.
- Targets exclude vscode, zed, neovim and terminals.
- A specimen of a phone screen, a leaflet page and a consent form, `scripts/design/rachel.ts` for the derivation, and `tests/families/rachel.test.ts`.
- Every profile the family lists passes with no errors and no warnings: aged-eye, sunlight, print-grey and cvd, and office-screen, which runs because the file declares pairs.
