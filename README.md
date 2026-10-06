# Ensigns

Colour families named after the Pequod and the nine ships she gams with in Moby-Dick. An ensign is the flag a ship flies to show who she is. Each family is one ship's colours, tuned for one place where colour has to work, and tested for it.

The public site is prepared for https://ensigns.tiagojacinto.eu. Run `npm run build` and `npm run preview` to open the finished product locally. Deployment and registry publication are owner operations.

## Status

Ensigns 1.0.0 is built from ten canonical families. The static catalogue has family pages, both-mode previews, native specimens, measurements, downloads, comparison panels and the Carpenter. Its 29 formats are generated locally in the browser and by the same command-line writers.

`npm run build` creates the complete portable delivery at `dist/ensigns-1.0.0.zip`, the deployable site in `site/dist/`, loose exports and installable packages. JavaScript, Python, R, Typst, editor, terminal, Tailwind and consumer bundles are included. [Build, installation, deployment and owner publication instructions](docs/RELEASE.md) describe the release.

The repository combines Gam, Pequod, Glauca, Try-Works and Ambergris. Their history and frozen migration fixtures are preserved. The old site source is archived under `legacy/gam/`; the active site reads the current model.

## The families

| Family | Chapter | Version | For | Tested for |
|---|---|---|---|---|
| Pequod | host | 0.3.0 | Reading and code in editors, terminals and long documents on screen | office-screen, editor, cvd |
| Goney | 52, The Albatross | 0.2.0, formerly Glauca | Identity on the web, in documents and on slides | office-screen, editor, cvd |
| Townho | 54, The Town-Ho's Story | 0.1.0 | Annotation colours that sit on top of text: highlights, track changes, diffs and review comments | overlay, cvd, print-grey |
| Jeroboam | 71, The Jeroboam's Story | 0.1.0 | Clinical status for professionals: alerts, lab flags, triage and alarm priorities | office-screen, clinical, cvd, print-grey |
| Jungfrau | 81, The Pequod Meets the Virgin | 2.0.0, formerly Try-Works | Reading, writing and code in a dark room at night | night, editor, cvd |
| Rosebud | 91 and 92, The Pequod Meets the Rose-Bud; Ambergris | 0.5.0, formerly Ambergris | Quiet application chrome for tools used for hours | office-screen, cvd, forced-colors |
| Enderby | 100 and 101, Leg and Arm; The Decanter | 0.1.0 | Figures for papers, reports and dashboards | figure, cvd, print-grey, projector |
| Bachelor | 115, The Pequod Meets the Bachelor | 0.1.0 | Slides, posters and signage read at 5 to 20 metres | projector, cvd, print-grey |
| Rachel | 128, The Pequod Meets the Rachel | 0.1.0 | Patient-facing apps, leaflets and consent forms for older adults, people with low vision and people with low health literacy | aged-eye, sunlight, print-grey, cvd |
| Delight | 131, The Pequod Meets the Delight | 0.1.0 | Channels that destroy colour: greyscale print, photocopies, e-ink, forced colours and monochrome terminals | print-grey, eink, photocopy, forced-colors, cvd |

Every family has exactly two modes, dark and light. A family may add a secondary name to a mode, such as Parchment for Pequod's light mode. Each family's folder has a README with its goal, rules and decisions, and a changelog with every value that changed.

## How it is organised

- `families/<id>/<id>.tokens.json` holds the only hand-edited colour data. A hex value appears only in a palette block. Everything else refers to a palette entry.
- `schema/family.schema.json` and `docs/model.md` describe the token file.
- `lib/` holds TypeScript model, colour maths, pure export writers and the build-time environment harness. Its public browser API excludes file-system loading, schema validation and APCA.
- `site/` holds the active static catalogue and browser workbench. All selected fonts and licences are bundled locally.
- `tests/` holds the tests that cover every family, one test file per environment profile, and every threshold with its reason in `tests/environments.json`.
- `families/<id>/specimen/` holds the content of a family's own specimen, and `families/<id>/candidates/` a second design of the family where a real trade-off exists.
- `scripts/design/` records how each family's values were chosen, `scripts/migrate/` records how the old repositories were converted, and `scripts/pages/` builds the local family pages.

```bash
npm ci
npm test
npm run typecheck
node scripts/report.ts
npm run export
npm run pages
npm run build
npm run preview
```

`node scripts/report.ts` writes one report per family under `reports/` and prints a summary. `npm run pages` writes the family pages into `preview/`; open `preview/index.html`.

`npm run export` writes files and a source-hash manifest into `dist/exports/`. Use `npm run export -- rosebud --format ghostty --mode dark` to select a family, format and mode. [scripts/export/README.md](scripts/export/README.md) lists the formats and install instructions. Terminal exports are offered only where the family defines a complete terminal palette and permits that target.

## Licences

Code is under the MIT licence (`LICENSE-MIT`). Colour tokens and documentation are under CC BY 4.0 (`LICENSE-CC-BY-4.0`). Third-party files keep their own licences, each beside the file. `LICENSE` says which covers what.

## Citing

`CITATION.cff` has the details. Each family has its own version in its token file.
