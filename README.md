# Ensigns

Colour families named after the Pequod and the nine ships she gams with in Moby-Dick. An ensign is the flag a ship flies to show who she is. Each family is one ship's colours, tuned for one place where colour has to work, and tested for it.

The site will be at https://ensigns.tiagojacinto.eu. The repository is private until the generators and the site are built.

## Status

The repository is assembled from five earlier projects: Gam (the site), Pequod, Glauca, Try-Works and Ambergris. Their history is kept, and `git log --follow` reaches it through every move. Four families are migrated into one token format and tested. Six more are planned. The generators, the packages and the site are not built yet; the old site and the old generators are kept under `site/` and `legacy/` until they are replaced.

## The families

| Family | Chapter | Version | For | Tested for |
|---|---|---|---|---|
| Pequod | host | 0.3.0 | Reading and code in editors, terminals and long documents on screen | office-screen, editor, cvd |
| Goney | 52, The Albatross | 0.2.0, formerly Glauca | Identity on the web, in documents and on slides | office-screen, editor, cvd |
| Jungfrau | 81, The Pequod Meets the Virgin | 2.0.0, formerly Try-Works | Reading, writing and code in a dark room at night | night, editor, cvd |
| Rosebud | 91 and 92, The Pequod Meets the Rose-Bud; Ambergris | 0.4.0, formerly Ambergris | Quiet application chrome for tools used for hours | office-screen, cvd, forced-colors |

Planned: Townho (chapter 54) for annotation colours that sit on top of text, Jeroboam (71) for clinical status, Enderby (100 and 101) for figures, Bachelor (115) for slides, posters and signage, Rachel (128) for patient-facing material, and Delight (131) for channels that destroy colour: greyscale print, photocopies, e-ink and forced colours.

Every family has exactly two modes, dark and light. A family may add a secondary name to a mode, such as Parchment for Pequod's light mode. Each family's folder has a README with its goal, rules and decisions, and a changelog with every value that changed.

## How it is organised

- `families/<id>/<id>.tokens.json` holds the only hand-edited colour data. A hex value appears only in a palette block. Everything else refers to a palette entry.
- `schema/family.schema.json` and `docs/model.md` describe the token file.
- `lib/` is pure TypeScript: the model, the colour maths (contrast, OKLab, colour vision deficiency, print and screen simulations) and the test harness.
- `tests/` holds the tests that cover every family, one test file per environment profile, and every threshold with its reason in `tests/environments.json`.
- `scripts/design/` records how each family's values were chosen, and `scripts/migrate/` records how the old repositories were converted.

```bash
npm ci
npm test
node scripts/report.ts
```

The last command writes one report per family under `reports/` and prints a summary.

## Licences

Code is under the MIT licence (`LICENSE-MIT`). Colour tokens and documentation are under CC BY 4.0 (`LICENSE-CC-BY-4.0`). Third-party files keep their own licences, each beside the file. `LICENSE` says which covers what.

## Citing

`CITATION.cff` has the details. Each family has its own version in its token file.
