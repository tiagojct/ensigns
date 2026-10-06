# Townho

Townho provides annotation colours that sit behind or under text: PDF and Zotero highlights, track changes, code and manuscript diffs, review comments and student grading. It has six semantic highlight fills, each provided as both a translucent overlay and an opaque swatch, insert and delete inks with decoration rules, diff roles with lightness separation, and four reviewer colours for collaborative drafting. This is version 0.1.0.

The colours are in `townho.tokens.json` in this folder, following `schema/family.schema.json`. The palette in the token file is the only place a colour is defined. `scripts/design/townho.ts` records the derivation and stops if the token file differs from it. `specimen/` holds the annotated passage, track-changes section and unified diff that the family page displays. `CHANGELOG.md` holds the version history.

## Goal

Annotation colours that sit behind or under text: PDF and Zotero highlights, track changes, code and manuscript diffs, review comments and marking student work.

The overlay profile tests Townho on top of every other family in both modes. Translucent fills composite cleanly over every ground without reducing text contrast below readability thresholds or clashing with host tones. In exports and print, meaning is never conveyed by colour alone: semantic labels, line decorations and hatch patterns accompany colour cues.

## The ship

Chapter 54, The Town-Ho’s Story. Ishmael narrates the encounter at Lima: "Interweaving in its proper place this darker thread with the story as publicly narrated on the ship, the whole of this strange affair I now proceed to put on lasting record." The secret tragedy, hidden from Captain Ahab, forms the darker thread beneath the public tale.

The mode labels reflect the setting at the Golden Inn:
- Golden Inn daylight: the warm paper of the sunlit piazza.
- Golden Inn night: deep warm ink for low-light review.

## Environments

`meta.environments` lists three profiles. Each threshold and its reason is recorded in `tests/environments.json`, and the checks are in `lib/harness`. `node scripts/report.ts townho` writes the report to `reports/townho.json`, and `npx vitest run tests/environments` runs the checks as tests.

- overlay: six translucent highlight fills are composited over the ground of all ten families in both modes (twenty grounds in total). Host text on a fill reaches at least 8.55:1 on light grounds (needs at least 7.0:1) and at least 5.25:1 on dark grounds (needs at least 4.5:1). Every fill is at least 0.062 in OKLab from its ground (needs at least 0.05). Pairwise distance between fills under normal vision is at least 0.065 on light grounds and at least 0.067 on dark grounds (needs at least 0.06). Under colour-vision simulations, semantic labels accompany each highlight.
- cvd: distinct sets maintain at least 0.06 in OKLab under normal vision and protan, deutan and tritan simulations, using declared reinforced pairs where textual or decorative cues exist.
- print-grey: every declared text pair keeps at least 7:1 contrast after conversion to grey. Diff added and removed roles differ by 22.2 L* in light mode and 18.1 L* in dark mode, passing the 12 L* distinctness gate. Translucent fills carry non-colour hatch and dot patterns in `design.print`.

Declared text pairs also pass office-screen at WCAG AA. All profiles pass with zero errors, zero warnings and no waivers.

## Modes

| Mode | Label | Ground | Ground luminance | Text | Contrast | Accent |
|---|---|---|---|---|---|---|
| dark | Golden Inn night | `dark.bg` #161310 | 0.0125 | `dark.text` #F2ECE2 | 16.94:1 | #8FBEFF |
| light | Golden Inn daylight | `light.bg` #F6F2E9 | 0.9069 | `light.text` #151210 | 18.32:1 | #003A95 |

Golden Inn daylight provides a warm neutral paper suitable for long reading sessions. Golden Inn night provides a low-glare dark ground with amber warmth.

## Structure

The palette is organised into functional blocks:
- `neutral`: warm papers and dark inks for core chrome and page backgrounds.
- `highlight-light` and `highlight-dark`: translucent fills (`extra.fill-claim` through `limitation`) with declared alphas (0.58 in light, 0.72 in dark) over base tones.
- `accent-light` and `accent-dark`: opaque counterparts (`accents.claim` through `limitation`) for standalone legends and badges.
- `reviewer-light` and `reviewer-dark`: four reviewer inks (`accents.reviewer-1` through `reviewer-4`) for multi-author track changes.
- `diff-light` and `diff-dark`: insert and delete inks, plus added, removed and changed tint fills.

The six semantic highlight meanings are:
1. claim: key assertion or thesis.
2. result: empirical finding or observation.
3. method: analytical technique or procedural step.
4. definition: terminology or conceptual definition.
5. question: inquiry, point of doubt or critique.
6. limitation: scope restriction or known qualification.

`design` specifies non-colour rules:
- `design.decoration`: underline for insertions, line-through for deletions.
- `design.print`: hatch patterns (diagonal, crosshatch, horizontal, vertical, dots) for greyscale printing.

## Rules

The token file declares five rules:
- `diff-not-red-green`: added and removed diff roles avoid confusing red against green alone, checked by `not-red-green:extra.diff-added,extra.diff-removed`.
- `insert-delete-not-red-green`: insert and delete inks do not rely on red against green alone, checked by `not-red-green:extra.insert,extra.delete`.
- `diff-lightness-gap`: added and removed diff roles differ by at least 12 L* in greyscale, checked by `lightness-gap:extra.diff-added,extra.diff-removed,12`.
- `meaning-not-by-colour-alone`: meaning is never carried by colour alone; text labels and legends accompany highlights.
- `decoration-rules`: insertions are underlined and deletions are struck through.

## Measured results

Every figure comes from `lib/colour` and the harness.

| Profile | Gate | Measured light | Measured dark | Requirement |
|---|---|---|---|---|
| overlay | Text on fill | 8.55:1 | 5.25:1 | >= 7.0:1 (light), >= 4.5:1 (dark) |
| overlay | Fill from ground | 0.062 OKLab | 0.062 OKLab | >= 0.05 OKLab |
| overlay | Fills apart (normal) | 0.065 OKLab | 0.067 OKLab | >= 0.06 OKLab |
| print-grey | Text contrast | 18.32:1 | 16.94:1 | >= 7.0:1 |
| print-grey | Diff L* gap | 22.2 L* | 18.1 L* | >= 12.0 L* |
| office-screen | Text contrast | 18.32:1 | 16.94:1 | >= 4.5:1 |
