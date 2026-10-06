# Checkpoint 2: repository and model

Date: 2026-09-30. Phase 2 of the Ensigns migration. The swatches for every changed value, old beside new, are in phase2/swatches.html. Open it in a browser. The lists behind it are in phase2/ and in tests/shared/expected-changes/.

## 1. What changed

Repository. `tiagojct/ensigns` exists and is private. It holds the histories of gam, pequod, glauca, try-works and ambergris: 91 commits, 61 of them imported under their original author addresses. Each repository was imported into `imports/<name>` and then moved into the layout by commits that only rename, so `git log --follow` works across the move. No file is left in `imports/`, and a test keeps it that way. The work is on the branch `phase/2-repository-and-model`, in pull request [tiagojct/ensigns#1](https://github.com/tiagojct/ensigns/pull/1). Merge it with a merge commit. A squash merge would erase the imported history.

Model. One token format serves all families. `schema/family.schema.json` defines it and docs/model.md describes it. A hex value is written only in a family's `palette` block. Every family has two modes, dark and light, with the same fifteen core roles in both. The code is in `lib/`:

- `lib/model` loads a token file, validates it, resolves its references and runs its rule checks.
- `lib/colour` holds WCAG contrast, OKLab, colour-vision simulation and the simulations the later profiles need. The colour-vision module uses the Machado 2009 matrices in linear light and agrees with R's colorspace package in all 552 comparison cases. APCA is reported, never gated.
- `lib/harness` runs the environment profiles. `tests/environments.json` holds every threshold with its reason.

Families. Four families are migrated and tested against the old model.

| Family | Was | Now | Values compared | Values changed | Why |
|---|---|---|---|---|---|
| Pequod | Pequod 0.2.0 | 0.3.0 | 160 | 42 | 24 from the AA corrections, 18 where the shipped themes won over pequod.json (D16) |
| Goney | Glauca 0.1.0 | 0.2.0 | 166 | 1 | Imum in light mode gets its own value |
| Jungfrau | Try-Works 1.0.0 | 2.0.0 | 166 | 157 | repositioned as the night family |
| Rosebud | Ambergris 0.3.0 | 0.4.0 | 114 | 15 | an authored light terminal set |

For Jungfrau, phase2/jungfrau-before-after.json lists 191 changed addresses. The other 34 are surface, status and extra colours that the snapshot of the old model does not carry, so the equality test cannot see them. They move with the 157.

Other changes.

- The gam adapters are deleted. The token files replace what they read.
- The site under `site/` and the old generators under `legacy/` are dormant until phase 4. They do not build.
- Each family has a README and a changelog. The repository has a README, CLAUDE.md, CHANGELOG.md and CITATION.cff.
- `.github/workflows/ci.yml` runs the suite on Node 24 with every action pinned to a commit, and requires the browser test to run. Dependabot is configured.

## 2. Changed values, before and after

Pequod. Six crew colours move: five in Parchment and Daggoo in Below deck. Each figure is the contrast, old to new, of the colour as text on the page, on the editor background, on the current line (each needs 4.5:1) and on the selection (needs 3:1).

| Mode | Crew | Old | New | Page | Editor | Current line | Selection |
|---|---|---|---|---|---|---|---|
| Parchment | Ahab | #A83732 | #931432 | 4.99 to 6.81 | 5.84 to 7.96 | 4.86 to 6.64 | 4.31 to 5.88 |
| Parchment | Starbuck | #0082B1 | #006A98 | 3.37 to 4.62 | 3.94 to 5.41 | 3.28 to 4.51 | 2.91 to 3.99 |
| Parchment | Ishmael | #76716B | #6A6164 | 3.74 to 4.63 | 4.38 to 5.42 | 3.65 to 4.52 | 3.23 to 4.00 |
| Parchment | Stubb | #CA6435 | #AA430B | 3.02 to 4.62 | 3.53 to 5.41 | 2.94 to 4.51 | 2.61 to 3.99 |
| Parchment | Tashtego | #177C55 | #06724B | 4.01 to 4.62 | 4.69 to 5.41 | 3.91 to 4.51 | 3.46 to 3.99 |
| Below deck | Daggoo | #A17069 | #A7766F | 4.35 to 4.72 | 4.35 to 4.72 | 4.15 to 4.51 | 3.35 to 3.64 |

Ahab passed before and moves anyway. Stubb has to darken to reach AA, and then it sits too close to Ahab. The brief sets the floor at the old smallest distance between two crew colours, 0.1124 in Parchment. No set that leaves Ahab as he was holds it (routes B and C). Routes A and E hold it, and E is applied. The brief's own values miss the floor and leave four pairs of crew colour and surface below AA. Distances are in OKLab.

| Ahab set | Ahab | Lightness, chroma, hue | Stubb | Pairs below AA (of 32) | Smallest distance (floor 0.1124) |
|---|---|---|---|---|---|
| old (0.2.0) | #A83732 | 0.50, 0.149, 27 | #CA6435 | 13 | 0.1124 |
| route A | #B51549 | 0.50, 0.190, 11 | #A64600 | 0 | 0.1128 |
| route B | #A83732 | 0.50, 0.149, 27 | #A44805 | 0 | 0.0552 |
| route C | #A83732 | 0.50, 0.149, 27 | #8E5700 | 0 | 0.0883 |
| route D | #B61637 | 0.50, 0.189, 18 | #A44805 | 0 | 0.0973 |
| route E, applied | #931432 | 0.43, 0.159, 15 | #AA430B | 0 | 0.1127 |
| the brief's values | #932038 | 0.44, 0.150, 15 | #A74605 | 4 | 0.1084 |

Below deck keeps 0.0880 against a floor of 0.0879 in every route. The other 18 Pequod values are D16: where the shipped themes and pequod.json disagreed, the token file holds the theme's value. The sheet lists them with reasons.

Goney. One value changes. In Pruina, Imum and Aer both had #084B96, so the pair was 0.000 apart. Imum is now #002E73: 0.099 from Aer under normal vision, at least 0.092 under every simulation, and 11.58:1 on the ground.

Jungfrau. The night profile reproduces the old family's figures, and the new values pass every check.

| Check | Try-Works 1.0.0 | Jungfrau 2.0.0 | Limit |
|---|---|---|---|
| Dark ground luminance | 0.0078 | 0.0108 | 0.004 to 0.012, target 0.010 to 0.012 |
| Body text on the dark ground | 15.79:1 | 7.61:1 | 7:1 to 11:1 |
| Muted text on the dark ground | 6.82:1 | 5.25:1 | at least 4.5:1 |
| Colours above luminance 0.45, dark | 16 | 0 | none |
| Colours above luminance 0.45, light | 27 | 0 | none |
| Text roles in the blue range, dark | 3 | 0 | none |
| Text roles in the blue range, light | 3 | 0 | none |
| Light paper luminance | 0.783 | 0.399 | 0.35 to 0.45 |
| Body text on the light paper | 12.21:1 | 8.07:1 | at least 7:1 |

The light mode is now a dimmed warm paper, #B5A892, for reading by a lamp. It was a pale cool one, #DEE7E4. The dark ground moves from #12161B to #171B21. Every changed address, with swatches, is in the sheet. The design record is scripts/design/jungfrau.ts.

Rosebud. The old site drew the dark terminal values on the light ground, at 1.0:1 to 2.9:1 for 14 of the 15 slots. The new light terminal set has its own values. The normal slots reach 4.5:1 or better and the bright slots 3:1 or better, the minima Rosebud declares for those pairs. Bright black goes from 6.03:1 to 4.36:1, because the grey it used became white.

## 3. Test report

| Check | Result |
|---|---|
| `npm test` | 28 files, 276 tests, all pass in about 3 s. `npm run typecheck` is clean. |
| Equality with the old model | Every value compared equals the original, or is listed in tests/shared/expected-changes/ with a reason. A difference that is not listed fails the test, and so does a listed change that no longer happens. |
| Harness on the four families | No errors in any profile. Office-screen, editor and night pass. Colour vision passes its gates and lists warnings: Pequod 10, Goney 11, Jungfrau 8, Rosebud 6. Reports with every check and its measured value are in phase2/harness/. |
| Forced colours | 13 tests in Chromium with forced colours active. The old Rosebud specimen fails three (focus ring, current item, a font request). They are recorded as exceptions with reasons. |
| Waivers | Four in all: three forced-colours exceptions for Rosebud and one editor exception for Goney (D26). A test fails if a waiver outlives the failure it covers. |
| Quotations | Every quotation in a token file, and every quoted span of four words or more in a README or model document, is found in sources/moby-dick.txt or listed with a reason. The list is empty. |
| Stray hex | No colour value outside a palette block in `lib/`, `packages/`, `families/`, `site/src`, `site/public` or the documents. The exemptions, each with a reason, are in tests/shared/hex-exemptions.json: the migration reports, the changelogs, one vendored template and one dormant site file. |
| Colour library | 116 tests, including 552 comparisons with R colorspace::simulate_cvd. |
| Prose | The writing-tropes checks ran over the READMEs, the model documents, the new changelog entries and this file. There is no chatbot residue, no em dash, no bold or italics, no contrast construction and no excess vocabulary. The one structural finding, repeated paragraph openings in the family READMEs, is fixed. |
| Continuous integration | Runs on the pull request. The result was not in when I wrote this. |

## 4. What I could not do

- Licence texts. `LICENSE-CC-BY-4.0` is a notice that names the licence and gives the address of its legal code. You did not authorise the download (D22).
- Check that `tiagojacinto@med.up.pt` is verified on your GitHub account (D2). My commits do not link to your profile until it is.
- Regenerate any package. The old generators are in `legacy/` and do not run. The published `pequod` packages stay at 0.2.0. Phase 4 builds every package from the tokens, including the corrected Pequod values. R CMD check and the Python and Typst package tests run then.
- Build the site or the specimens. They are dormant until phase 4.
- Publish, archive, rename, deploy or push to any of the five old repositories. Nothing was done to them.

## 5. Decisions I need

None blocks phase 3. D23 and D24 change colours. D25 sets the rule for the six new families. Each has my recommendation first. D2 from checkpoint 1 is still open.

D22. Licence text. May I download the CC BY 4.0 legal code, `legalcode.txt` from creativecommons.org/licenses/by/4.0, about 20 KB of plain text, into `LICENSE-CC-BY-4.0`? The brief requires shipped licence texts. The fonts and their OFL texts come in phase 4, and I will ask again then with names and sizes. Recommendation: yes.

D23. Pequod, Ahab. Route E is applied. The alternative is route A (#B51549). E is the brief's Ahab made 0.01 darker, with 1 degree more hue and 0.009 more chroma, to hold the floor. A keeps his lightness, raises his chroma by 0.041 and turns him 16 degrees. Recommendation: E.

D24. Goney, Imum. An own value (#002E73) is applied. The alternative is to keep the shared #084B96 and declare Imum an alias of Aer, which removes the pair from the distinct set. Nothing from Glauca was published, so no published theme changes either way. Recommendation: the own value.

D25. Colour vision. The brief's target is 0.06 in OKLab under each simulation. The old repositories reported colour vision and never gated it, and the migrated families do not reach the target everywhere. I gated what could be gated. The rest is held at today's values by floors that cannot fall, by reinforced pairs where type or position already tells two colours apart, and by warnings. Goney is the weakest: in Pruina its function and type colours are 0.045 apart under normal vision, and its worst unreinforced pair under simulation is string and type at 0.030 (tritan). Nothing changes in any shipped colour because of this. Recommendation: accept the floors for this migration, require the six new families to pass the target with no floors, and retune the Goney and Jungfrau syntax hues once, at their next release, with before and after at a checkpoint. Tell me if you want the retuning before phase 3.

D26. Goney, keyword on the current line. In Profundum the keyword is the blue mark #007AFF. It has 4.53:1 on the editor background and 4.15:1 on the current line, which needs 4.5:1. The waiver is in the token file. Lightening the keyword by 0.03 of OKLab lightness (to about #1784FF, 4.59:1 on the line) clears it. Softening the line highlight enough would remove most of the highlight, because the editor background itself gives only 4.53:1. Recommendation: accept now and fix it in the retuning pass of D25.

D27. APCA. `lib/colour/apca.ts` reports APCA Lc values and gates nothing. It uses `apca-w3`, which is under the Limited W3 licence, and that package depends on `colorparsley`, which is AGPL-3.0. Both are development dependencies and nothing ships them. Recommendation: keep them and never ship them. The alternative is to drop APCA from the reports.

D28. Rosebud, mode labels. Every other family labels its modes. Rosebud has none. The two further quotations in its token file give labels: Light "Mid-day sea" (chapter 91) and Dark "Grey amber" (chapter 92). The primary quotation, "the romantic name of this aromatic ship" (chapter 91), is my choice. Recommendation: use both labels and keep the quotation.

D29. Goney, warning colour. The token file gives warnings the amber of the ANSI yellow, as the old Gam model did. The old Glauca VS Code theme drew warnings in the blue mark, so a theme generated from the tokens in phase 4 would change them from blue to amber. Recommendation: amber. The one-mark rule reserves the blue mark for links, buttons and focus, and the status colours are hues.

## 6. Smaller points

- D16 in practice. The hand-written editor themes do not change in the 18 places where the token file now follows them. The R and Python data files are generated from pequod.json, and they will change there when phase 4 regenerates them. The dark link, for example, becomes #9DC2C5 where pequod.json had #BD8C68.
- Colour-vision figures in the old Pequod README used the Viénot 1999 model with CIE76 differences. The new figures use Machado 2009 with OKLab and cannot be compared with them. The Pequod README says so.
- Jungfrau's data scales were re-derived under the brightness cap and are Jungfrau's own for now. Enderby is the data family and will exist in phase 3. Jungfrau can refer to its scales then if they fit the cap.
- Jungfrau's light mode is labelled Lamp-feeder. The old label was True Lamp (D17).
- The three Rosebud exceptions are defects in the old generated specimens: the focus ring is a box-shadow, the current item is marked on a transparent border, and a stylesheet comes from Google Fonts. Phase 4 fixes them, and the exceptions then fail the stale-waiver test and go.

## Files

- phase2/swatches.html: every changed value with old and new swatches and the contrast that matters. It is made by scripts/design/swatch-sheet.ts.
- phase2/pequod-routes.json: the Ahab routes and the brief's set, with the contrast of every crew colour on every surface.
- phase2/jungfrau-before-after.json: the 191 changed Jungfrau addresses.
- phase2/harness/: the harness report for each family.
- tests/shared/expected-changes/: each change with its reason, one file per family.
