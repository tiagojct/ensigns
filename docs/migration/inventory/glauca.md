Detailed phase 1 report, written on 2026-09-29 as the evidence behind INVENTORY.md. Paths that start with S/ point into a temporary scratch folder that does not persist; they record what was run. Every other path is relative to the repository root at the commit named in the report.

# Glauca: phase 1 inventory

Read-only inventory of one repository, for the merge into the ensigns monorepo. Nothing was changed in the clone.

- Repository: tiagojct/glauca, clone at S/clones/glauca, pinned HEAD 1efbccee79dfd74ea7fde9da11b2680b98afbf09 (2026-09-11). S is the scratchpad root.
- Planned identity (from the brief): Glauca becomes Goney, same tokens, one alias decision.
- Inventory date: 2026-09-29.
- Paths are relative to the repository root, with line numbers where useful. "S/..." paths are scratchpad paths outside the repository. "Unverified" marks anything I did not check.
- Build and tool runs were done in a copy at S/work/glauca. Analysis scripts and a virtual environment are in S/work/glauca-analysis. The pinned clone still reports zero changes.
- Registry and GitHub checks were network reads only (curl, gh read calls, npm/npx read and local install). Nothing was published, pushed or signed.
- Proposals in section 6 are mine. They are not decisions.
- Quoted text from the repository's own docs has had markdown emphasis marks removed.

## 1. Repository facts

### 1.1 Git and GitHub

| Item | Value | Evidence |
| --- | --- | --- |
| Pinned HEAD | 1efbccee79dfd74ea7fde9da11b2680b98afbf09, 2026-09-11 11:17:23 +0100, "docs: point repository URLs at GitHub" | git log |
| Commit count | 15 on main, all by Tiago Jacinto (tiagojct@icloud.com). First commit 2026-07-10 00:28 +0100. The clone is not shallow. | git rev-list --count HEAD; git rev-parse --is-shallow-repository |
| Branches | main only (local, origin, and GitHub's branch list) | git branch -a; gh api repos/tiagojct/glauca/branches |
| Tags | None locally. None on origin (git ls-remote lists only refs/heads/main). GitHub tags API returns an empty list. | git tag -l; git ls-remote; gh api repos/tiagojct/glauca/tags |
| Default branch | main | gh repo view |
| GitHub releases | None. gh release list -R tiagojct/glauca prints nothing. | gh release list |
| GitHub repository | Public, created 2026-09-11T09:44:36Z. No description, homepage or topics. Pages off. Licence detected as "Other" (NOASSERTION). API size 6,500 KB. | gh api repos/tiagojct/glauca |
| GitHub push events | 2026-09-11 (two pushes) and 2026-09-21T22:07:30Z to main. Main is still 1efbccee, so the 09-21 push added no commit (cause unverified). | gh api repos/tiagojct/glauca/events |
| Size | 238 tracked files, 9,427,942 bytes. .git is 6,660 KiB. src/specimen holds 7,354,514 bytes of that. | git ls-files |
| Tracked files by area | dist 141, src 75, docs 8, .omo 5, root files and .vscode 9 | git ls-files |
| Lineage | The first commit (6df0b91, 265 files) is an adaptation of try-works. Evidence: 778b865 deletes `dist/vscode/icons/tw-*.svg`; f2937f3 says "purge try-works carryover"; generator variable names are Try-Works names (section 3.1). | git log --diff-filter=D |
| Host history | Moved to Forgejo (git.tiagojct.eu) on 2026-08-02 (8e58104) and back to GitHub on 2026-09-11 (1efbccee). | git log |

Commit list:

| Hash | Date | Files | Subject |
| --- | --- | --- | --- |
| 6df0b91 | 2026-07-10 | 265 | Glauca 0.1.0: a glaucous, light-first design system |
| 778b865 | 2026-07-10 | 104 | Refactor code structure and remove redundant sections for improved readability and maintainability |
| 99555e2 | 2026-07-11 | 8 | Enhance Glauca themes with improved prompts and color adjustments for better readability and user experience |
| 9e67bde | 2026-07-11 | 46 | Rename mode identifiers lit/cold to dark/light |
| d8647e2 | 2026-07-11 | 4 | Expand Zed theme with bracket, status, and dim-ANSI keys |
| 6f9564f | 2026-07-22 | 13 | upd |
| 64e4b7d | 2026-07-22 | 6 | Obsidian: sans headings, serif italic emphasis |
| f2937f3 | 2026-08-02 | 94 | Full review pass: fix generators, purge try-works carryover, harden checks |
| 05c9458 | 2026-08-02 | 18 | Rename theme display names to Glauca Light / Glauca Dark |
| 8e58104 | 2026-08-02 | 3 | Move CI to .forgejo/workflows, drop GitHub-only dependabot config |
| 9db4e9d | 2026-08-03 | 6 | VS Code tabs: one blue line, no boxed borders |
| f3ca475 | 2026-08-07 | 33 | upd |
| a0b5ffa | 2026-08-07 | 20 | upd |
| a899a09 | 2026-08-09 | 1 | Remove Forgejo Actions workflow (no runner on instance) |
| 1efbcce | 2026-09-11 | 9 | docs: point repository URLs at GitHub |

Three commits titled "upd" carry substantial changes (f3ca475 adds 2,346 lines and changes 777 lines of generate.py; a0b5ffa adds the Firefox, Thunderbird and Zotero outputs and the .omo files). The history is therefore a weak record if it is preserved in the monorepo.

### 1.2 CI configuration

State at HEAD: no CI configuration exists. There is no .github/, no .forgejo/ and no other workflow file. GitHub reports zero workflows (gh api repos/tiagojct/glauca/actions/workflows returns total_count 0).

History of CI files:

| Date | Commit | Change |
| --- | --- | --- |
| 2026-07-10 | 6df0b91 | Adds .github/workflows/ci.yml and .github/dependabot.yml |
| 2026-08-02 | f2937f3 | Modifies both |
| 2026-08-02 | 8e58104 | Moves ci.yml to .forgejo/workflows/ci.yml; deletes dependabot.yml. Message: "Dependabot never runs outside GitHub". |
| 2026-08-07 | f3ca475 | Adds 14 lines to .forgejo/workflows/ci.yml |
| 2026-08-09 | a899a09 | Deletes .forgejo/workflows/ci.yml. Message: "no runner on instance". |

The last workflow (git show a899a09^:.forgejo/workflows/ci.yml, 40 lines) ran on push and pull_request, on ubuntu-latest, with actions pinned to commit SHAs (checkout v4.2.2, setup-python v5.3.0, Python "3.x"). Its steps were:

1. pip install fonttools
2. python3 src/scripts/validate.py
3. python3 src/scripts/generate.py --check
4. python3 src/scripts/cvd_check.py
5. python3 src/scripts/check_fonts.py
6. node --check dist/tailwind/colors.generated.js, then node -e "require('./dist/tailwind')"
7. an inline Python step that json.loads every `dist/**/*.json`

The removed dependabot.yml covered github-actions, and npm in /src/web and /src/markedit, monthly.

I re-ran all seven steps locally in S/work/glauca. All pass (details in section 5.3).

Stale statements about CI that remain in the tree:

- CLAUDE.md:48 links to .forgejo/workflows/ci.yml and says it runs on every push.
- README.md:156-157: "CI runs validate, check, cvd, and the font-coverage check on every push".
- docs/CONTRIBUTING.md:23: "CI runs all of these."
- docs/CHANGELOG.md:68-69: "CI parses every generated .json under dist/".
- src/scripts/generate.py:8: "--check is what CI runs".
- gam (another repository, S/clones/gam/deploy/family-dispatch.yml) expects each family repository to hold a notify-gam job in its main workflow. Glauca has no workflow to hold it.

### 1.3 Licence files

| File | What it contains | What it covers |
| --- | --- | --- |
| LICENSE-MIT | Standard MIT text, "Copyright (c) 2026 Tiago Jacinto" (21 lines) | Code: generators, configs, scripts (README.md:167-168; CLAUDE.md:74) |
| LICENSE-CC-BY-4.0 | A 10-line notice, not the licence text. It says the palette tokens in glauca.json and the documentation are CC BY 4.0, gives the legalcode URL, and states the attribution line "Glauca palette by Tiago Jacinto, CC BY 4.0." | Design: palette, token values, docs (README.md:168-169) |
| Fonts | No OFL text file anywhere in the tree. The TTF name tables carry the OFL 1.1 notice and URL (name IDs 13 and 14). The subset woff2 files have those records stripped (section 7). | IBM Plex, OFL 1.1 (README.md:169-171; src/glauca.json:150,158,167) |

What the metadata says:

- README.md:165-171: "Code (generators, configs, CI, scripts) is MIT - see LICENSE-MIT. The design (palette, token values, docs) is CC-BY-4.0 - see LICENSE-CC-BY-4.0; attribute Glauca. IBM Plex is OFL; the TTFs and subset woff2 files ship in the repo under that licence - if you redistribute subsetted fonts, ship the OFL text and keep the reserved font names."
- CITATION.cff:9: license "MIT AND CC-BY-4.0". This value fails the CFF 1.2.0 schema (section 1.4).
- src/vscode/package.json:13, src/tailwind/package.json:18, src/markedit/package.json:7: "license": "MIT". The VS Code extension and the Tailwind preset consist of palette values, which README.md assigns to CC BY 4.0. The published metadata says MIT only.
- dist/vscode/ and dist/tailwind/ contain no licence file. vsce warns about it (section 5.3). npm would publish the Tailwind package without one.
- GitHub shows the licence as "Other" (NOASSERTION). The cause is unverified; the root has two licence files, and one of them is a short notice rather than the licence text.
- The CC notice names the file "glauca.json", which will not exist as such in the monorepo.
- Upstream IBM Plex declares Reserved Font Name "Plex" (checked at raw.githubusercontent.com/IBM/plex/master/LICENSE.txt). The committed TTFs do not carry that statement in name ID 0. Whether the subsetted woff2 files count as Modified Versions is a legal question I did not assess.

### 1.4 CITATION.cff (16 lines)

| Field | Value |
| --- | --- |
| cff-version | 1.2.0 |
| message | "If you use Glauca, please cite it." |
| title | "Glauca: a glaucous design system" |
| authors | one: family-names Jacinto, given-names Tiago. No ORCID, no affiliation, no email. |
| version | 0.1.0 |
| date-released | 2026-07-10 (the date of the first commit; nothing was tagged or released) |
| license | "MIT AND CC-BY-4.0" |
| repository-code | https://github.com/tiagojct/glauca |
| url | https://tiagojct.eu |
| keywords | design system, design tokens, colour, typography |
| DOI, identifiers, ORCID, abstract, type | absent |

Validation: cffconvert 2.0.0 --validate (in the venv) exits 1 with "'MIT AND CC-BY-4.0' is not one of [...SPDX identifiers...]". CFF 1.2.0 wants one SPDX identifier or a list of identifiers, so an expression with AND is rejected.

Zenodo: no record for glauca (search "glauca" returns botanical records only). The only record under the creator "Jacinto, Tiago" is an unrelated software record (10.5281/zenodo.20125560, quarto-study-flow).

### 1.5 CLAUDE.md and docs (one line each)

| File | Lines | Contents |
| --- | --- | --- |
| CLAUDE.md | 74 | Guidance for Claude Code: what Glauca is, repository layout, the single-source rule, two-step generation, commands, script architecture, key model concepts (modes, tiers, exception), versioning, licensing split |
| README.md | 179 | Public description: name, signature, three anchors, tiers, layout, surface list, data visualisation, print, accessibility, typography, motion, development, versioning, licensing, credits |
| docs/BRAND.md | 34 | Essence, positioning, family relation to try-works, personality, the two marks (wordmark and bloom emblem), usage rule |
| docs/CHANGELOG.md | 136 | "Unreleased" (Firefox, Thunderbird, Zotero added; VS Code 453 to 887 keys; Zed, Ghostty; guarantees 13 to 18 contrast rows; web-ext lint) and "0.1.0" (first cut plus the review-pass fixes). No dates. |
| docs/CODE_OF_CONDUCT.md | 11 | Pointer to Contributor Covenant 2.1. Reports go "to the maintainer at the address on the project homepage". No address is given in the repository, and the GitHub homepage field is empty. |
| docs/CONTRIBUTING.md | 36 | Single source of truth, the checks, how to add a token or surface, stance on changes that scatter the accent |
| docs/FOUNDATIONS.md | 83 | The name, the rule, the transparency ethic, the three anchors, the code exception, light first, provisionality of token names |
| docs/PRODUCT.md | 43 | Audience of one, inherited and added surfaces, the weekly-use test, scope line before 1.0 |
| docs/PUBLISHING.md | 29 | Routes for VS Code (vsce), Obsidian, Tailwind (npm publish) and CSS. Nothing for the other surfaces. |
| docs/RELEASING.md | 10 | Five-step release: bump version in the json, generate and test, update CHANGELOG and CITATION.cff, tag vX.Y.Z, publish |

Rules and decisions, quoted (line numbers refer to the source file).

CLAUDE.md

- Line 7: "Named for the glaucous bloom: a pale frost field is the ground, one vivid sky-blue (dies, #007AFF) is the rare load-bearing mark. Light-first - Pruina (light) is the default mode, Profundum (dark) the sibling. Anchors: #007AFF (dies), #62BA46 (folium), #8C8C8C (cinis). Light sibling of try-works; same machinery, poles reversed."
- Line 27: "src/glauca.json is the only file you edit. make generate rebuilds everything under dist/ from it (and re-emits the web app's CSS in place at src/web/src/css). Hand-editing a generated file is wrong and CI rejects it: generate.py --check regenerates in memory and diffs against the committed files, failing on any drift."
- Line 31: "These copies are NOT drift-gated, so after editing scaffolding in src/, re-run make generate."
- Line 57: validate.py locks "WCAG ratios for the locked body/UI pairs (18 rows). When a new surface leans on a token pair the rows do not already cover, add the row rather than eyeballing the result."
- Line 59: cvd_check.py "simulates the code hues under protan/deutan/tritan (Machado-2009) and reports worst-case deltaE; close pairs are reinforced with weight/italics, not colour alone."
- Line 64: "Two modes, light-first: dark (Profundum, scheme: dark) and light (Pruina, scheme: light). They must keep identical token keys - validate.py enforces parity. CSS emits light as :root / [data-mode="light"], dark as [data-mode="dark"]. Plain file names (Glauca.itermcolors) are the light variant; dark carries -Dark."
- Line 65: "Tiers: core hues (saxum, glaucum, caelum, pruina) are the identity and appear everywhere; extended hues (folium, bacca, viola, lacus, unda) exist only for code/terminal and must not appear on posters, slides, or web. Dataviz is brand-free by design (Okabe-Ito categorical, dies-blue sequential)."
- Line 66: "The deliberate exception: the system keeps the blue (dies) rare everywhere except the code tier, where colour-blind safety puts dies on keywords and admits folium on strings."
- Line 70: "Currently 0.x: the public surface may still move. From 1.0, semver applies to the public surface: CSS custom properties, Tailwind preset keys, the json schema, and the R/Python names. Renaming/removing any is breaking; adding a token is additive; changing a value that alters output is at least minor."
- Line 74: "Code (generators, configs, CI, scripts) is MIT; the design (palette, token values, docs) is CC-BY-4.0. Fonts are OFL."

docs/FOUNDATIONS.md

- Lines 18-23: "One vivid sky-blue - dies, #007AFF - is the only hot signal in the system, and it is kept rare. It marks what carries weight: the link you can follow, the focus you are on, the cursor, the button, the one callout whose job is "notice this". Everything else is field: pale neutrals, stone greys, desaturated bloom tints. Scarcity is not a layout preference; it is what makes the mark legible. A page full of blue says nothing."
- Lines 31-36 (transparency ethic): "one readable JSON file is the entire source of truth; every surface is generated from it by scripts you can read; the accessibility claims are tests that fail the build, not adjectives; and the palette's reasoning - including the places it bends - is written down here."
- Lines 43-47 (dies): "It measures 4.5:1 against the dark ground (so it may carry dark-mode keywords) but under 4.5:1 against the pale ground, so in light mode it serves as the large/UI mark (accent-bright) while text-level accents use its darker relatives. Light hovers darken; dark hovers brighten. Both rules are locked as contrast tests in validate.py."
- Lines 48-51 (folium): "It lives in the extended tier: everywhere code lives, never on a poster. (Dataviz stays brand-free: Okabe-Ito categorical, dies-blue sequential.)"
- Lines 52-54 (cinis): "The neutral pivot: exactly the dark mode's muted text (5.4:1 on the dark ground), the light mode's faint tier, the comment colour."
- Lines 58-67 (code exception): "keywords are dies and strings are folium, because a code palette must first serve colour-blind readers, and blue is the hue all three axes of colour-vision deficiency see most reliably. The measured close pairs (number/function under protan and deutan; function/type under tritan) are reinforced with weight and italics - bold keywords, italic types, italic numbers, italic comments - so no distinction rides on hue alone. The exception is stated, bounded, and measured (make cvd prints the simulation table; the contrast floors are the tests that gate the build)."
- Lines 71-75 (light first): "The light mode is the default at :root, the file named plainly (Glauca.itermcolors, glauca.zsh-theme) is the light one, and the dark variant carries the suffix. This is a deliberate inversion of the sibling system, not an afterthought."
- Lines 79-83 (provisionality): the token names "are Latin because the author already names things in Latin, and because a dead language does not drift under a living system. The public surface freezes at 1.0." The names listed are saxum, glaucum, caelum, pruina; pix, umbra, petra, ferrum; caligo, vadum, spuma, nebula; dies, aer, imum; charta, cinis; folium, bacca, viola, lacus, unda.

docs/BRAND.md

- Lines 4-5: "One sky-blue mark on a frost-bloom field. Everything follows: the pale bloom is the default ground, the blue is rare and load-bearing."
- Lines 8-10: "A glaucous design system for an academic-maker's whole output: websites, slides, posters, code, and plots. Clinical-clean and light-first; nothing hidden behind the surface."
- Lines 13-16: "Glauca is the light sibling of try-works - same machinery, same guarantees, same single-source discipline, poles reversed: try-works is a dark sea with one ember, Glauca a pale bloom with one clear blue. They share generators by lineage, not by dependency; each repo stands alone."
- Lines 19-20: "Crafted, plain-text, convivial in the sense Illich and Postman meant. Not corporate, not trend-chasing. Terse in voice, pre-AO90 in Portuguese, no emoji."
- Lines 23-26: the primary mark is the wordmark, Glauca set in IBM Plex Serif semibold. The secondary mark is the bloom emblem, "a single blue point on a pale disc" (src/assets/logo.svg light, logo-dark.svg dark).
- Lines 32-34: "Blue is rare: one mark per surface. The bloom field is the default ground. Lead with the wordmark; reach for the emblem only where a square mark is needed."

docs/PRODUCT.md

- Lines 4-10: "An audience of roughly one, honestly: an academic-maker who ships websites, slides, posters, code, and statistical plots, in R and Python and Quarto and Typst and 11ty - light-first, clinical-clean. Others may adopt it, but the design target is that workflow. Naming the user this plainly changes the scope rule: a surface earns its place only if it is used in that workflow, or clearly will be. Everything else is maintenance debt wearing a feature's clothes."
- Lines 30-35 (weekly-use test): "keep what is touched often and convivial; question what sits idle. ... which surfaces get used in Glauca rather than in try-works? Both systems ship the same machinery, so switching cost is near zero; usage will sort the two palettes by context (day work vs night work, clinical decks vs literary ones). Revisit after a season of real use."
- Lines 38-43 (scope line): "no further surfaces before 1.0. The token core is complete and tested (18 WCAG rows, CVD pass, drift gate), and the Plex fallback metrics are measured. Between now and 1.0: real-world use and a specimen pass. Then freeze the public surface and commit to the versioning policy."

docs/CONTRIBUTING.md:33-36: "The system has a point of view: the pale bloom is the field, the sky-blue is the rare load-bearing mark. Proposals that would scatter the accent or break the contrast floors will be asked to justify themselves against that." Line 29-30: "Keep builders pure: json in, string out."

### 1.6 Makefile targets (71 lines, 18 targets, default goal help)

| Target | Recipe | Notes |
| --- | --- | --- |
| help | grep of "## " comments | Default goal |
| generate | python3 src/scripts/generate.py; sh src/scripts/assemble.sh | Writes 115 generated files, then copies scaffolding and builds four archives |
| css, tailwind, dist, all | depend on generate | Aliases |
| demo | typst compile src/typst/demo.typ demo.pdf | Needs typst and the three fonts. Not run here (typst not installed, unverified). |
| clean | rm -rf src/web/_site demo.pdf | |
| cvd | python3 src/scripts/cvd_check.py | Report only |
| validate | python3 src/scripts/validate.py | |
| check | python3 src/scripts/generate.py --check | The drift gate |
| test | validate check | |
| fonts-check | python3 src/scripts/check_fonts.py | |
| fonts | sh src/scripts/subset_fonts.sh | Needs fontTools and brotli. Writes src/web/public/fonts |
| pptx | python3 src/pptx/build_pptx.py | Needs python-pptx. Writes dist/pptx |
| markedit | cd src/markedit && npm install && npm run build | Writes dist/markedit/glauca.js |
| firefox-lint | npx --yes web-ext@8 lint --source-dir dist/firefox --self-hosted | |
| firefox-sign | firefox-lint, then npx --yes web-ext@8 sign ... --channel unlisted | Needs AMO_JWT_ISSUER and AMO_JWT_SECRET from the environment (Makefile:58-70). Not run. |

### 1.7 Editor and ignore files

- .editorconfig: root; utf-8, lf, final newline, trim trailing whitespace, spaces, indent 2; Makefile uses tabs; `*.py` indent 4.
- .gitignore (5 lines): `node_modules/`, `_site/`, `*.pdf`, `.DS_Store`, `__pycache__/`.
- .vscode/settings.json: one setting, "makefile.configureOnOpen": false. A workspace editor setting, no project meaning.
- src/scripts/__pycache__/generate_obsidian.cpython-314.pyc (57,957 bytes) is tracked. It was committed in 9db4e9d (2026-08-03); the ignore rule was added later (f3ca475). It is Python 3.14 bytecode.

### 1.8 What .omo/run-continuation/ is

Five JSON files, 214 bytes each, one per session, for example ses_024c239baffecoOgpwS1tNAXuL.json. Each holds three fields: sessionID, updatedAt (2026-08-07, between 08:01 and 09:39 UTC), and sources.background-task with state "idle". They were committed in a0b5ffa ("upd"). They contain no colour, project or personal data and no secrets.

They are run-state files written by an AI coding-agent harness. The ses_ prefix and the directory name suggest an OpenCode-style tool (the "omo" tool name is my inference, unverified). They should be excluded from the import, and .omo/ should be added to the ignore list of the monorepo. Also exclude .vscode/settings.json and the tracked .pyc file.

## 2. Versions

All project version strings agree on 0.1.0. No place disagrees.

| Place | Value | Path and line | How it is set |
| --- | --- | --- | --- |
| Token file (source of truth) | "0.1.0" | src/glauca.json:3 | Hand-edited |
| VS Code manifest | "0.1.0" | src/vscode/package.json:5; dist/vscode/package.json:5 | dist copy stamped by stamp_version (generate.py:1877-1880, 1940) |
| Tailwind manifest | "0.1.0" | src/tailwind/package.json:3; dist/tailwind/package.json:3 | Stamped (generate.py:1941) |
| Obsidian manifest | "0.1.0" (minAppVersion "1.12.0") | src/obsidian/manifest.json:3-4; dist/obsidian/manifest.json:3-4 | Stamped (generate.py:1939) |
| Firefox manifest | "0.1.0" | dist/firefox/manifest.json:4, and inside the committed dist/firefox/Glauca.xpi | Generated from D["version"] (generate.py:533) |
| Thunderbird manifest | "0.1.0" | dist/thunderbird/manifest.json:4, and inside the committed xpi | Generated (generate.py:533) |
| MarkEdit package | "0.1.0" | src/markedit/package.json:3 | Typed by hand. Not stamped. Package is private and not copied to dist. |
| Web app package | none | src/web/package.json | No version field |
| PowerPoint title slide | "v0.1.0" | Text on slide 1 of both committed .pptx files | build_pptx.py:157 reads D["version"] |
| CITATION.cff | version 0.1.0; date-released 2026-07-10 | CITATION.cff:7-8 | Typed by hand (docs/RELEASING.md:5 lists it as a manual step) |
| CHANGELOG | Headings "## Unreleased" (line 3) and "## 0.1.0" (line 77). No dates. | docs/CHANGELOG.md | Hand-edited. Line 5 says "Still 0.1.0; nothing was published." |
| README and CLAUDE.md | "0.x" only | README.md:159-163; CLAUDE.md:70 | Prose |
| R DESCRIPTION | Does not exist | dist/r/ holds only glauca.R | |
| Python pyproject | Does not exist | dist/python/ holds glauca.py and glauca.mplstyle | |
| Git tags and GitHub releases | None | section 1.1 | |

Observations:

- The CHANGELOG "Unreleased" section lists large changes after the 0.1.0 date in CITATION.cff, yet no tag exists and the version did not move.
- Two hand-typed places are not covered by the generator: CITATION.cff and src/markedit/package.json.
- The stamped manifests are drift-gated only as text. The two xpi archives contain a manifest that is older than the text file (section 5.3).
- Other pinned numbers that a merge should carry: VS Code engines ^1.70.0 (src/vscode/package.json:8); Obsidian minAppVersion 1.12.0; Firefox and Thunderbird strict_min_version 115.0, manifest_version 2 (generate.py:531-545, 606, 626); Zed theme schema v0.2.0 (generate.py:1871); Ghostty 1.3 or later for the `search-*` keys (src/themes/terminals/README.md:46); zsh 5.7 or later (src/omz/README.md:25); esbuild ^0.24.2 (locked at 0.24.2) and markedit-theming v0.16.0 from GitHub (src/markedit/package.json:12-15; lockfile pins commit 149011e0db4341f2fdd447d2772e8095aff95bd8); Eleventy ^3.0.0 (src/web/package.json:10; no lockfile is committed, a fresh install resolved 3.1.6); CFF format 1.2.0.

## 3. Token file src/glauca.json

### 3.1 Shape

672 lines, 19,592 bytes, 24 top-level keys, nesting depth 6. Leaf values: 123 hex strings in the exact form #rrggbb, 233 other strings, 78 numbers, 21 arrays. There is no reference syntax (no $ref, no alias) and no declared schema. validate.py hard-codes 12 required top-level keys (validate.py:14).

Eight top-level keys are never read by any script: name, description, signature, tiers, accessibility, notes, colorspace and product. validate.py only checks that signature and accessibility exist (validate.py:14). The key brand is read only for brand.tagline (build_pptx.py:153). Generators hard-code the name "Glauca" instead of reading name.

Lineage evidence: the 24 top-level keys and their order are identical to S/clones/try-works/src/try-works.json. That file uses palette groups ground, sea, fire, whale and extended, mode keys lit and cold (labels "Try-Fire" and "True Lamp"), and role names sea-deep, sea, sea-bright, sea-pale, on-sea. Glauca renamed them saxum, glaucum, caelum, pruina, extended; dark, light; `tint-*`. Generator variable names still use the old vocabulary: ember, flame, oil for dies, aer, imum (generate.py:988, 1765) and fire, sea for caelum, glaucum (generate.py:100, 862).

### 3.2 Outline of every key path

| Key path | Type and count | Content |
| --- | --- | --- |
| name, version | string | "Glauca", "0.1.0" |
| description (4), signature (5), notes (253), colorspace (417) | string | Prose. description lists the surfaces but omits Quarto, Miniflux, MarkEdit, PowerPoint and print. |
| tiers (6-9) | object, 2 strings | core, extended: prose defining the two tiers |
| modes (10-49) | object, 2 entries | dark and light, each with label, scheme and 15 colour roles (section 3.3) |
| palette (50-80) | object, 5 groups, 19 hex | saxum (4), glaucum (4), caelum (3), pruina (3), extended (5) |
| code (81-119) | object, 11 roles | Each role has color (hex). style ("italic" or "bold") on 4 roles: comment italic, keyword bold, number italic, type italic. Dark-tuned only. |
| terminal (120-146) | object | note; background, foreground, cursor, cursor-text, selection-bg, selection-fg (6 hex); ansi (array of 16 hex). Dark only. |
| type (147-203) | object | serif, sans, mono: family, license "OFL", roles (2 strings), axes (string). scale: ratio 1.25, base 1rem, steps (10), leading (4), weight (4) |
| spacing (204-229) | object | unit 0.25rem; scale (13 steps, "0" to "24"); radius (5: none, sm, md, lg, pill); border "1px" |
| accessibility (230-252) | object | standard (string); dark (5 numbers); light (5 numbers); cvd (string); rules (3 strings) |
| typography (254-403) | object | note; fonts (serif, sans, mono, reading: family and axis ranges); fluid (min-vw 22, max-vw 80); measure (body 68ch, narrow 54ch, wide 74ch); features (text, tabular, display, code); roles (10: display, headline, title, subhead, body-lg, body, caption, eyebrow, data, code; keys font, size or fluid, weight, leading, tracking, features, measure, wrap, transform) |
| gamut (404-416) | object | note; p3 with dark and light, each accent and accent-bright as "color(display-p3 ...)" (4 strings) |
| i18n (418-422) | object | unicode-range "U+0000-00FF, U+0131, U+0152-0153, U+2000-206F, U+20AC, U+2122"; note; quotes |
| dataviz (423-516) | object | note; categorical (7 hex, Okabe-Ito); sequential (7 hex); diverging (9 hex); plot light and dark (6 hex each: bg, panel, text, grid, muted, accent); fonts (3); shapes (matplotlib 7, ggplot_pch 7, linetypes 7) |
| print (517-556) | object | note; profile; ink_limit; rich_black (recipe, note); cmyk (13 strings); gamut_risk (5 strings); spot; bleed_mm 3; safe_mm 5; sizes_mm (A3 to A0) |
| a11y (557-575) | object | note; focus (dark #6cb2ff, light #0b62cf, width 2px, offset 2px); contrast_more (dark and light: text-muted, border; 4 hex) |
| performance (576-608) | object | note; subset_range_ref "i18n.unicode-range"; payload_kb (49, 66, 14, total 129); fallbacks (three families with fallback, size_adjust, ascent, descent, line_gap) |
| motion (609-623) | object | durations (fast 120ms, base 200ms, slow 320ms, slower 480ms); easings (standard, out, in, emphasized) |
| brand (624-636) | object | essence; tagline "Clear glass, cold light."; family (try-works, glauca: prose); mark (primary, emblem); note |
| product (637-671) | object | audience; tiers (core 10 items, maintained 12 items, confirm empty); top_gap; scope; note |

Blocks that would be identical for any family that keeps IBM Plex (observation): type, typography, spacing, motion, performance, i18n, dataviz.categorical, dataviz.shapes, dataviz.fonts, print geometry, the structure of a11y and gamut. Family-specific blocks: name, description, signature, tiers text, modes, palette, code, terminal, accessibility, notes, dataviz.sequential, dataviz.diverging, dataviz.plot, print.cmyk, print.gamut_risk, print.spot, a11y colours, gamut.p3, brand, product.

### 3.3 Modes (17 keys each: label, scheme, 15 colour roles)

Mode keys are dark and light (renamed from lit and cold in 9e67bde). Labels: dark "Profundum", light "Pruina". Scheme values: "dark", "light". The labels match the plan.

| Role | dark | Equals palette entry | light | Equals palette entry |
| --- | --- | --- | --- | --- |
| bg | #10161c | saxum.pix | #f0f4f6 | pruina.charta |
| surface | #171f26 | saxum.umbra | #f7fafb | none |
| surface-raised | #1f2932 | saxum.petra | #ffffff | none |
| text | #e8eef2 | pruina.pruina | #16222a | none |
| text-muted | #8c8c8c | pruina.cinis | #55646d | none |
| border | #2a3540 | none | #cdd7dc | none |
| accent | #3d97ff | none | #0b62cf | none |
| accent-bright | #6cb2ff | caelum.aer | #007aff | caelum.dies |
| accent-deep | #007aff | caelum.dies | #084b96 | caelum.imum |
| on-accent | #0b1218 | saxum.ferrum | #f2f7fb | none |
| tint-deep | #142430 | glaucum.caligo | #16303f | none |
| tint | #2b4356 | glaucum.vadum | #35576b | none |
| tint-bright | #4d7391 | glaucum.spuma | #3e6d84 | none |
| tint-pale | #93b7c9 | glaucum.nebula | #b7cdd6 | none |
| on-tint | #0d1720 | none | #f2f7fb | none |

Twelve of the 15 dark values and three of the 15 light values equal a palette entry. The other twelve light values (eleven distinct, because on-accent and on-tint are equal) and three dark values (border, accent, on-tint) exist nowhere in the palette block. The values are copies, not references.

Role names bright and deep follow lightness within a mode (bright is lighter than accent, deep is darker). Because of that the same role name binds to different palette entries by mode: accent-bright is aer in dark and dies in light; accent-deep is dies in dark and imum in light. Hover uses accent-bright in dark and accent-deep in light (validate.py:85-89).

### 3.4 Palette (19 entries)

| Tier | Group | Name | Hex | Also used, inside the json, by |
| --- | --- | --- | --- | --- |
| core | saxum | pix | #10161c | modes.dark.bg; terminal.background; dataviz.plot.dark.bg and panel |
| core | saxum | umbra | #171f26 | modes.dark.surface; terminal.ansi[0] |
| core | saxum | petra | #1f2932 | modes.dark.surface-raised |
| core | saxum | ferrum | #0b1218 | modes.dark.on-accent; terminal.cursor-text |
| core | glaucum | caligo | #142430 | modes.dark.tint-deep |
| core | glaucum | vadum | #2b4356 | modes.dark.tint; terminal.selection-bg |
| core | glaucum | spuma | #4d7391 | modes.dark.tint-bright |
| core | glaucum | nebula | #93b7c9 | modes.dark.tint-pale |
| core | caelum | dies | #007aff | modes.dark.accent-deep; modes.light.accent-bright; code.keyword; terminal.cursor; terminal.ansi[12] |
| core | caelum | aer | #6cb2ff | modes.dark.accent-bright; a11y.focus.dark |
| core | caelum | imum | #084b96 | modes.light.accent-deep; dataviz.diverging.colors[0] |
| core | pruina | pruina | #e8eef2 | modes.dark.text; code.variable; terminal.foreground, selection-fg, ansi[15]; dataviz.plot.dark.text |
| core | pruina | charta | #f0f4f6 | modes.light.bg |
| core | pruina | cinis | #8c8c8c | modes.dark.text-muted; code.comment; dataviz.plot.dark.muted |
| extended | extended | folium | #62ba46 | code.string; terminal.ansi[10] |
| extended | extended | bacca | #c96a6a | code.decorator; terminal.ansi[9] |
| extended | extended | viola | #b184db | code.number; terminal.ansi[13] |
| extended | extended | lacus | #4a9edb | code.function |
| extended | extended | unda | #45a3ad | code.type |

The palette is in effect a dark-mode palette plus the blue trio. Of the 14 core entries, the light mode uses only charta, dies and imum. Three anchors: dies #007aff, folium #62ba46, cinis #8c8c8c (README.md:21-30).

Name collision to note for the unified schema: pruina is a palette group, a palette entry (pruina.pruina), the light mode's label ("Pruina"), and a flat Typst name that holds the dark text colour (src/typst/colors.typ:11).

### 3.5 Aer and Imum in the light mode

Short answer: the light mode has no role named aer or imum. The palette entries caelum.aer (#6cb2ff) and caelum.imum (#084b96) exist and are mode-independent. The light role accent-deep has the value of imum (#084b96). No light role has the value of aer. Details:

- No key named aer or imum exists in modes.light or in modes.dark (src/glauca.json:10-49).
- The two names exist as palette entries in palette.caelum (lines 63-67): aer = #6cb2ff and imum = #084b96. The palette is mode-independent. They also appear as row names in print.cmyk (lines 529-530) and aer in print.gamut_risk (line 542).
- Light mode blue roles: accent #0b62cf (no palette entry), accent-bright #007aff (the value of dies), accent-deep #084b96 (the value of imum). No light role has the value of aer.
- Dark mode blue roles: accent #3d97ff (no palette entry), accent-bright #6cb2ff (the value of aer), accent-deep #007aff (the value of dies). No dark role has the value of imum.
- Use of the two names in outputs that reach the light mode:

| Output | What happens | Evidence |
| --- | --- | --- |
| dist/css/glauca.css | No aer or imum names. Light has --gl-accent-bright #007aff and --gl-accent-deep #084b96. | dist/css/glauca.css |
| dist/tailwind/colors.generated.js | caelum.aer #6cb2ff and caelum.imum #084b96 exported with no mode | generate.py:106 |
| dist/typst/colors.typ | Flat name aer = #6cb2ff (the dark accent-bright). The light dictionary has accent_bright #007aff and accent_deep #084b96, and no aer or imum key. | generate.py:1729-1745 |
| dist/typst/poster.typ | imum = #084b96 (light accent-deep), used for the kicker text; dies = #007aff (light accent-bright), used for the safe-area guide | generate.py:2123-2125, 2153, 2161 |
| Typst slide theme, title slide | Kicker colour is the flat aer (#6cb2ff) in both deck modes, on the tint_deep field | src/typst/glauca.typ:23 |
| VS Code light theme | aer and imum both remap to light accent-deep (#084b96); dies remaps to light accent (#0b62cf) | generate.py:1499 |
| Zed light theme | link_text.hover, players[6] and accents[6] are #084b96 (aer remapped) | dist/zed/themes/Glauca.json |
| Obsidian light theme | --text-highlight-bg is rgba(108, 178, 255, 0.4): the raw aer, not remapped | generate_obsidian.py:474; dist/obsidian/theme.css |
| print.cmyk | aer "C58 M30 Y0 K0"; imum "C95 M50 Y0 K41"; no mode | src/glauca.json:529-530 |
| gam adapter (another repository) | Treats dies, aer, imum as the three core blues (coreIds) | S/clones/gam/src/model/adapters/glauca.js:17 |

### 3.6 Syntax (the code block)

Eleven roles, dark-tuned only (generate_obsidian.py:92-93 says so). There are no light values in the json.

| Role | Hex | Style | Palette entry | Light value in VS Code, Zed, Quarto, MarkEdit | Light value in Obsidian |
| --- | --- | --- | --- | --- | --- |
| comment | #8c8c8c | italic | pruina.cinis | #55646d | #55646d |
| keyword | #007aff | bold | caelum.dies | #0b62cf | #0a529f |
| string | #62ba46 | none | extended.folium | #3c6e38 | #407639 |
| number | #b184db | italic | extended.viola | #6b588b | #6b588b |
| function | #4a9edb | none | extended.lacus | #33668b | #33668b |
| type | #45a3ad | italic | extended.unda | #306972 | #306972 |
| decorator | #c96a6a | none | extended.bacca | #784a4d | #784a4d |
| variable | #e8eef2 | none | pruina.pruina | #16222a | #16222a |
| parameter | #c3cdd3 | none | none | #2c3941 | #2c3941 |
| operator | #a7b1b8 | none | none | #55646d | #55646d |
| punctuation | #86929a | none | none | #55646d | #55646d |

The light values are read from dist/vscode/themes/Glauca-color-theme.json, dist/zed/themes/Glauca.json, dist/quarto/glauca.theme, dist/markedit/glauca.js and the .theme-light block of dist/obsidian/theme.css. The two derivation rules disagree on two roles. The editors map dies to the light accent and mix folium 0.5 toward the ink (generate.py:1494-1508). Obsidian mixes every hue 0.45 toward the ink (generate_obsidian.py:77-86), so its keyword is #0a529f and its string #407639.

### 3.7 Terminal

Chrome (dark): background #10161c, foreground #e8eef2, cursor #007aff, cursor-text #0b1218, selection-bg #2b4356, selection-fg #e8eef2. The light terminal takes its chrome from modes.light.

| Slot | Name | Dark (json) | Palette entry | Light (derived by _light_ansi) |
| --- | --- | --- | --- | --- |
| 0 | black | #171f26 | saxum.umbra | #0b1218 (ferrum, pinned) |
| 1 | red | #b85f5f | none | #a55859 |
| 2 | green | #4f9e3f | none | #3f7b39 |
| 3 | yellow | #c79a3d | none | #846c36 |
| 4 | blue | #4981c4 | none | #4070a8 |
| 5 | magenta | #8e74ab | none | #786594 |
| 6 | cyan | #3f93a0 | none | #357884 |
| 7 | white | #c6ced4 | none | #3e4d55 (a11y.contrast_more.light.text-muted, pinned) |
| 8 | bright black | #3a4754 | none | #55646d (light text-muted, pinned) |
| 9 | bright red | #c96a6a | extended.bacca | #b06061 |
| 10 | bright green | #62ba46 | extended.folium | #47833c |
| 11 | bright yellow | #d9ae4a | none | #87733d |
| 12 | bright blue | #007aff | caelum.dies | #0273ee |
| 13 | bright magenta | #b184db | extended.viola | #8669a9 |
| 14 | bright cyan | #7fc4cf | none | #517d86 |
| 15 | bright white | #e8eef2 | pruina.pruina | #16222a (light text, pinned) |

Claims in terminal.note (line 121) checked by recomputation: normal red is 4.20:1 on the dark bg, blue 4.53:1, magenta 4.54:1. The light slots measure 4.54 to 4.64 (normal) and 4.04 to 4.17 (bright), against the rule of 4.5 and 4.0 in generate.py:185-211.

### 3.8 Status colours

The token file has no status or semantic block (grep for status, success, warning, error, info finds no key). Status roles are implicit in the generators, and they differ by target:

- Error: bacca everywhere (VS Code editorError.foreground #c96a6a dark, #784a4d light; Zed error; Miniflux alert border; Obsidian --text-error, light-safed).
- Success: folium (VS Code testing.iconPassed; Zed success; Miniflux success border).
- Info: lacus in VS Code and Zed (#4a9edb dark, #33668b light); the mode accent in Miniflux (generate.py:472).
- Warning: the blue mark in VS Code and Zed (editorWarning.foreground is the dark accent #3d97ff; problemsWarningIcon and Zed warning are dies #007aff; light #0b62cf). Warning is amber, the value of terminal.ansi[3] (#c79a3d, read by index), in Miniflux and Zotero (generate.py:432, 718).
- Amber has no palette entry. Obsidian types its own yellow, #d9ae4a (generate_obsidian.py:37), which equals terminal.ansi[11] but is a separate literal.

### 3.9 Extended and derived sets

Extended set in the json: palette.extended (five hues, code and terminal only by the tier rule). Derived sets that exist only as generator logic:

| Derived set | Where | Rule |
| --- | --- | --- |
| Light ANSI (16) | generate.py:185-211 | Twelve colour slots mixed toward the light text in steps of 0.02 (to 0.9) until contrast on the light bg is at least 4.5 (slots 0 to 7) or 4.0 (slots 8 to 15). Slots 0, 7, 8, 15 are pinned to ferrum, contrast_more.light.text-muted, light text-muted, light text. |
| Light syntax and light workbench for VS Code, Zed, Quarto, MarkEdit | _light_remap, generate.py:1480-1536 | A hex-keyed table from each dark value to a light value; hues mixed 0.45 toward light text (folium 0.5); aer and imum to light accent-deep; dies to light accent. An unmapped colour raises KeyError. |
| Light syntax for Obsidian | generate_obsidian.py:77-118 | Every hue mixed 0.45 toward the mode text |
| Obsidian ramp (12 steps per mode) and named hues (8) | generate_obsidian.py:28-55 | Mixes; orange is mix(bacca, yellow), pink is mix(bacca, viola) |
| Obsidian and Miniflux link and tag green | generate_obsidian.py:419-425; generate.py:443 | Folium mixed toward text (0.45, then 0.14 more) in light |
| Zed dim ANSI (8) | generate.py:1825 | mix(ansi, bg, 0.4) |
| Zotero fills, tags, composites | generate.py:726-834 | legible() loops to 4.5 (tags 3.0); min_alpha() solves fill alphas for 10:1 and 4.5:1 |
| oh-my-zsh path and error hues | generate.py:364-383 | Mixes toward bg or ink (0.5 and 0.3 dark and light; 0.45 for extended hues in light) |
| Firefox and Thunderbird hover and active | generate.py:564-565 | mix(surface, text, 0.08 and 0.14) |

### 3.10 Metadata and contrast claims

- version "0.1.0" (line 3). description, signature, notes, colorspace, tiers, brand and product are prose (section 3.2).
- accessibility.standard (line 231): "WCAG 2.1 (body 4.5:1, large/UI 3:1) plus a Machado-2009 CVD pass at full severity."
- accessibility.dark and accessibility.light hold ten hand-typed contrast numbers. I recomputed all ten. Every number matches, but only when computed with the mode accent (#3d97ff dark, #0b62cf light), not with the palette entry the key name suggests:

| Key | Claimed | Recomputed as | Palette-entry reading |
| --- | --- | --- | --- |
| dark: pruina on pix | 15.55 | dark text on dark bg: 15.55 | same |
| dark: cinis on pix | 5.41 | 5.41 | same |
| dark: caelum on pix | 6.13 | dark accent #3d97ff on bg: 6.13 | dies on pix: 4.53 |
| dark: ferrum on caelum | 6.35 | ferrum on dark accent: 6.35 | ferrum on dies: 4.69 |
| dark: nebula on pix | 8.55 | 8.55 | same |
| light: ink on charta | 14.64 | 14.64 | same |
| light: muted on charta | 5.53 | 5.53 | same |
| light: caelum on charta | 5.18 | light accent #0b62cf on charta: 5.18 | dies on charta: 3.63 |
| light: button on caelum | 5.32 | on-accent on light accent: 5.32 | same |
| light: tint-bright on charta | 5.09 | 5.09 | same |

- No script reads these numbers. They agree with validate.py output today because the same pairs are tested there (section 4).
- accessibility.cvd (line 246): close pairs "number/function (7.2 protan, 5.5 deutan) and function/type (5.5 tritan)". cvd_check.py prints exactly 7.2, 5.5 and 5.5 for those pairs. The values are typed in the json, not read from the run.
- generate_obsidian.py:416 says accent-bright measures 3.55:1 on the light bg. Recomputed, #007aff on #f0f4f6 is 3.63:1.
- performance.payload_kb (49, 66, 14, total 129) matches the woff2 sizes (50,408; 67,820; 14,668 bytes). performance.fallbacks metrics are not recomputed by any script in the repository. Only performance.note describes the recipe.

### 3.11 References between values

The json has one string-path reference and several name references. All colour reuse is by copying the hex.

- performance.subset_range_ref = "i18n.unicode-range" (line 578). No script reads it; subset_fonts.sh reads i18n.unicode-range directly.
- `typography.roles.*.font` names a key of typography.fonts; .features names a key of typography.features; .measure names a key of typography.measure. validate.py checks the font and measure references (validate.py:49, 52).
- print.cmyk row names mix palette names (pix, pruina, dies, aer, imum, folium), mode role names (tint-deep, tint, tint-bright, tint-pale) and free names (paper, ink, light-accent), with no mode qualifier. The four `tint-*` rows equal the light-mode tints, not the dark ones; the other nine rows equal a naive CMYK conversion of the corresponding hex (checked: all 13 rows equal a naive conversion, so they could be computed).
- `accessibility.*` keys are free text ("caelum on pix", "button on caelum").
- Generators reach into the json by position: terminal.ansi[3] (amber, generate.py:432, 718, 1519), terminal.ansi[12] (iTerm link, generate.py:287), dataviz.diverging.colors[7] (copper, generate.py:719).
- 104 hex leaf values sit outside the palette block. 41 of them repeat a palette value, and 63 occurrences (54 distinct values) do not. In total 26 hex values occur more than once, with 50 extra copies.

## 4. Design rules and roles that must be told apart

Enforcement column: Test means a script fails on violation. Report means a script prints a number but never fails. Construction means a generator computes the value to meet the rule but no script checks it. Prose means only text states it.

### 4.1 Rules

| ID | Rule (quoted) | Source | Enforcement |
| --- | --- | --- | --- |
| A1 | "One vivid sky-blue - dies, #007AFF - is the only hot signal in the system, and it is kept rare." | docs/FOUNDATIONS.md:18-19 | Prose. No script counts blue uses. Per-surface choices are in generator comments (see D-rules). |
| A2 | "Blue is rare: one mark per surface. The bloom field is the default ground." | docs/BRAND.md:32 | Prose |
| A3 | "One blue mark per slide: the mono kicker above the hairline." and demo text "One accent per slide." | src/typst/glauca.typ:42; src/typst/demo.typ:11 | Prose |
| A4 | Extended hues "exist only for code/terminal and must not appear on posters, slides, or web." | CLAUDE.md:65; src/glauca.json:8 | Construction for Tailwind (extended omitted, generate.py:101-102), poster and slide themes (core roles only). No test. In practice extended hues are also used in Obsidian (links, tags, callouts, named hues), Miniflux (alerts, categories), Zotero (tags), MarkEdit (links). |
| A5 | "Dataviz is brand-free by design (Okabe-Ito categorical, dies-blue sequential)." | CLAUDE.md:65 | Prose. The sequential scale is named "dies blue" and the diverging scale ends on imum, so the claim holds for the categorical scale only. |
| A6 | Code exception: dies on keywords, folium on strings, "stated, bounded, and measured" | CLAUDE.md:66; docs/FOUNDATIONS.md:56-67; src/glauca.json:249 | Prose. The measuring is cvd_check.py (Report). |
| A7 | Anchors dies #007AFF, folium #62BA46, cinis #8C8C8C are "placed, not decorated"; cinis is "exactly the dark mode's muted text" | README.md:23-31; src/glauca.json:253 | Prose. cinis equality holds today (modes.dark.text-muted, code.comment and palette.pruina.cinis are separate copies of #8c8c8c) with no check. |
| B1 | "Every body pair clears WCAG AA in both modes, locked as tests: 18 contrast rows" | README.md:107-108 | Test: validate.py:78-107 (18 rows; 4.5 for text pairs, 3.0 for two UI pairs) |
| B2 | "Light hovers darken; dark hovers brighten." | docs/FOUNDATIONS.md:46-47; validate.py:85-87 | Test for the two hover colours (rows "dark hover/bg" 8.19 and "light hover/bg" 7.72). That every surface uses those roles for hover is Prose. |
| B3 | In light mode dies "serves as the large/UI mark (accent-bright) while text-level accents use its darker relatives" | docs/FOUNDATIONS.md:44-46 | Prose. No row tests light accent-bright as a UI mark (3.63:1 on bg). |
| B4 | "Blue fills on the tint ramp use aer with dark ferrum text (dies on tint is below 3:1 in dark mode)." | src/glauca.json:248 | Partly Test: row "dark aer/tint (UI)" (4.63 against 3.0). The ferrum-on-aer text pair (8.48) has no row. Dies on tint is 2.56. |
| B5 | The sea as a selection fill (dark text on tint; light ink on tint-pale; on-tint on tint-pale); accent-deep as a fill | validate.py:95-106 | Test: rows 14 to 18 |
| B6 | Focus ring colours per mode, 2px width and offset | src/glauca.json:559-564; dist/css/a11y.css | Dark focus #6cb2ff and light focus #0b62cf equal roles that have rows ("dark hover/bg", "light accent/bg") |
| B7 | "Borders are deliberately faint; lift only if visible separators are wanted." | src/glauca.json:250 | Prose. Border against bg measures 1.32:1 light and 1.46:1 dark. |
| B8 | Derived colours must clear thresholds: light ANSI 4.5 and 4.0; Zotero tags 3.0; Zotero fills 10:1 and 4.5:1; light syntax at least 4.5:1 | generate.py:185-197, 734-766, 819-824, 1484-1485 | Construction. No test. |
| C1 | "The measured close pairs (number/function under protan and deutan; function/type under tritan) are reinforced with weight and italics - bold keywords, italic types, italic numbers, italic comments - so no distinction rides on hue alone." | docs/FOUNDATIONS.md:61-64 | Report only. cvd_check.py prints the table and never fails. The styles are typed in `code.*.style` and applied by VS Code, Zed, Quarto and Obsidian generators. The MarkEdit output carries colours only (whether MarkEdit-theming can take font styles is unverified). |
| C2 | "Data is never encoded by colour alone - the categorical scale pairs with marker shapes in both plotting libraries." | README.md:116-118 | Prose. Python use_glauca() sets a colour plus marker cycle; in R the marker scale is a separate function (scale_shape_glauca_d, R_TEMPLATE line 2042) that the user must add. |
| C3 | Terminal registers stay distinct: black, white, bright black and bright white are "four distinct inks"; normal red stays at 4.2:1 "because the minimal AA lift lands indistinguishably close to bright red (bacca), and the register pair matters more" | docs/CHANGELOG.md:117; generate.py:192-196; src/glauca.json:121 | Construction and prose. No test. |
| C4 | Search matches: candidates on the quiet sea, only the focused match on dies (Ghostty, Zed) | generate.py:138-146 | Test for the contrast pairs (rows 14 to 16). The split itself is Construction. |
| D1 | Firefox and Thunderbird: "Blue stays rare - it marks the selected tab's line, the focused field's border, the text selection inside that field, and the attention state of an icon; nothing else." "Popup highlight is the sea, not the blue" | generate.py:558-563 | Prose in a docstring |
| D2 | oh-my-zsh: the blue mark "lights in exactly one place - the git-dirty mark - and red (bacca) is the failure signal, never the brand blue" | generate.py:313-315 | Prose in a docstring |
| D3 | VS Code: "ONE blue line, on top of the active tab only"; activity bar: "the blue marks the active strip and the drop target, nothing else" | generate.py:973-976, 1193 | Construction (borders set transparent). No test. |
| D4 | Obsidian: the blue mark "appears on exactly two of the 12" callout types (summary, important); tags and wiki links are green so blue "stays even rarer" | generate_obsidian.py:58-62, 494-496 | Construction |
| D5 | Vivaldi: accentOnWindow false, "so the fire stays rare" | generate.py:399-400 | Construction |
| D6 | Internal links green, external links blue: "read distinct from the blue accent" | generate_obsidian.py:477-478 | Construction |
| E1 | dark and light "must keep identical token keys" | CLAUDE.md:64 | Test, for modes only (validate.py:23-28). Parity is not checked for a11y, gamut, dataviz.plot. |
| E2 | Light first: "The light mode is the default at :root ... the dark variant carries the suffix." | docs/FOUNDATIONS.md:71-75 | Prose. Followed by CSS, file names, package.json and Zed order. Broken by the Typst slide theme, which defaults to dark (src/typst/glauca.typ:2,6,9; src/typst/README.md:3-5). |
| F1 | "Hand-editing a generated file is wrong and CI rejects it" | CLAUDE.md:27 | Test through generate.py --check, for 115 text files only. No CI exists now. Not covered: 27 copied scaffolding files, 4 archives, 2 .pptx, the MarkEdit bundle, specimens. |
| F2 | "Keep builders pure: json in, string out." | docs/CONTRIBUTING.md:29-30 | Prose. stamp_version reads three src files; build_vscode_icons returns many files. |
| F3 | Add a contrast row when a surface leans on an uncovered pair | CLAUDE.md:57 | Prose |
| F4 | "the output is binary, so it sits outside the drift gate alongside make fonts and make demo" | src/pptx/README.md:35-37 | Declared exception |
| F5 | "The version is stamped into the Obsidian, VS Code, and Tailwind manifests by the generator, so they never drift from the json." | docs/RELEASING.md:9-10 | Construction. Firefox and Thunderbird manifests are stamped as well. CITATION.cff and src/markedit/package.json are not. |
| G1 | Type is roles, not sizes; figures oldstyle proportional in text and lining tabular in data; body measure 68ch; no opsz because Plex has none | README.md:120-131 | Partly Test: validate.py:42-54 checks font, size or fluid, numeric leading, measure and opsz range |
| G2 | Portuguese coverage of the fonts and subset range | src/glauca.json:419-421 | Test: check_fonts.py (38 test characters against the declared range; glyphs in the TTFs only if fontTools is installed, otherwise it prints "glyph check skipped" and exits 0) |
| G3 | "Marks a change, does not decorate: four durations (120-480 ms), four quiet eases, all collapsed under prefers-reduced-motion." | README.md:137-140 | Construction (motion.css) |
| H1 | Public surface freezes at 1.0; semver applies to CSS custom properties, Tailwind preset keys, the json schema and the R and Python names | CLAUDE.md:70; README.md:159-163 | Prose |
| H2 | "no further surfaces before 1.0"; the weekly-use test | docs/PRODUCT.md:30-43 | Prose |
| H3 | "Terse in voice, pre-AO90 in Portuguese, no emoji." | docs/BRAND.md:19-20 | Prose |

Observed use of blue that stretches rule A1 (facts, not judgement): in the Obsidian output every list bullet, checkbox, external link, table selection, tab outline and embed border takes the accent (generate_obsidian.py:219-235, 486, 503-505, 542, 551-552, 571). The comment at line 219-221 calls it "an explicit owner call to let the one warm mark walk the margin", wording that comes from Try-Works.

### 4.2 Roles that must be told apart

| Pair or set | Why | Where it is stated | How it is kept apart |
| --- | --- | --- | --- |
| number and function | Closest pair under protan (7.2) and deutan (5.5) | FOUNDATIONS.md:61-63; cvd_check.py output | Number italic, function upright |
| function and type | Closest pair under tritan (5.5) | same | Type italic |
| keyword, string | Anchors of the code exception | FOUNDATIONS.md:58-62 | Keyword bold and dies; string folium |
| Seven code roles in cvd_check.py | Only keyword, string, number, function, type, decorator, comment are simulated (cvd_check.py:22). Variable, parameter, operator, punctuation are outside the check. | cvd_check.py | Not checked |
| accent, accent-bright, accent-deep | Three blues per mode by job: text-level accent, bright (dark hover, light large mark), deep (light hover, fill) | FOUNDATIONS.md:43-47; validate.py:85-106 | Contrast rows |
| The mark (#007aff) and the mode's text blue | On dark chrome dies is 4.15:1 on the sidebar and 3.68:1 on the raised surface, so text takes the accent | generate.py:945-952; src/vscode/README.md:24-28 | Construction |
| Warning and info in VS Code and Zed | Both are blues (dies and lacus). This is my observation, not a documented rule. | dist/vscode and dist/zed themes | Not checked |
| ANSI black, white, bright black, bright white | Four distinct inks on the frost field | CHANGELOG.md:117; generate.py:192-196 | Pinned values |
| ANSI red and bright red | Kept apart deliberately at 4.2:1 versus 4.99:1 | src/glauca.json:121 | Typed values |
| Search candidate and focused match | Sea versus accent | generate.py:138-143 | Construction |
| Internal and external links in Obsidian | Green versus blue | generate_obsidian.py:477-478 | Construction |
| Focused and unfocused editor group | Tab line blue versus sea | generate.py:1216-1219 | Construction |
| Eleven Zotero tag names | Hues must stay distinct; held to 3:1, not 4.5:1, to keep hue identity | generate.py:819-824 | Construction |
| Categorical data scale | Okabe-Ito plus markers and line types | README.md:83-85, 116-118 | Choice of scale |

## 5. Build system

### 5.1 How dist/ is produced

`make generate` runs two steps.

1. `python3 src/scripts/generate.py` builds 115 files in memory (artifacts(), generate.py:1893-1949) and writes them: 107 under dist/ and 8 inside src/ (six web CSS files under src/web/src/css, src/markedit/colors.generated.js, src/typst/colors.typ). Every output path is a string literal relative to the repository root.
2. `sh src/scripts/assemble.sh` copies scaffolding from src/<surface> into dist/<surface> (27 files) and builds four archives with zip: dist/vivaldi/Glauca.zip, dist/vivaldi/Glauca-Dark.zip, dist/firefox/Glauca.xpi, dist/thunderbird/Glauca.xpi.

Three more outputs come from separate targets outside the drift gate: dist/pptx/Glauca.pptx and Glauca-Dark.pptx (make pptx), dist/markedit/glauca.js (make markedit), and the three woff2 files in src/web/public/fonts (make fonts).

Tracked files in dist/ by provenance (141):

| Provenance | Files | Drift-gated |
| --- | --- | --- |
| Generated by generate.py | 107 | Yes (text compare) |
| Copied scaffolding (hand-written in src/) | 27 | No |
| Archives built by assemble.sh | 4 | No |
| Built by pptx and markedit targets | 3 | No |

The generated files carry no hand edits (the drift check is clean). The 27 scaffolding files are hand-written in src/ and copied verbatim. So dist/ is generated and reproducible for 107 files, verbatim copies for 27, and derived but not byte-stable for the archives and .pptx files.

### 5.2 Scripts

| Script | Language | Inputs | Outputs | Dependencies |
| --- | --- | --- | --- | --- |
| src/scripts/generate.py (2,283 lines) | Python 3 | src/glauca.json; src/obsidian/manifest.json, src/vscode/package.json, src/tailwind/package.json (stamp_version) | 115 files, or a diff with --check (exit 1 on drift or a missing file) | Standard library only. Ran on Python 3.9.6. The tracked pyc is for 3.14. |
| src/scripts/generate_obsidian.py (796 lines) | Python 3 | The json (passed in by generate.py) | dist/obsidian/theme.css; also exports _mix and hsl | Standard library (colorsys, urllib) |
| src/scripts/validate.py (116 lines) | Python 3 | src/glauca.json | Exit code and 18 contrast rows | Standard library |
| src/scripts/cvd_check.py (28 lines) | Python 3 | code block | Printed deltaE table (never fails) | Standard library |
| src/scripts/check_fonts.py (41 lines) | Python 3 | i18n.unicode-range; `src/fonts/*.ttf` and `*.woff2` in that folder only | Exit code | Standard library; fontTools optional (skips silently without it) |
| src/scripts/assemble.sh (74 lines) | POSIX sh | src/<surface>/ files, src/assets/logo.svg, generated dist files | Copies and four zip archives | cp, zip (exits 1 if zip is missing) |
| src/scripts/subset_fonts.sh (15 lines) | sh and Python | `src/fonts/*.ttf`; i18n.unicode-range | `src/web/public/fonts/*.woff2` | fontTools, brotli |
| src/pptx/build_pptx.py (237 lines) | Python 3 | src/glauca.json | dist/pptx/Glauca.pptx and Glauca-Dark.pptx | python-pptx (1.0.2 used), lxml, Pillow |
| src/markedit/build.mjs (19 lines) and glauca.mjs | Node ESM | src/markedit/colors.generated.js | dist/markedit/glauca.js | esbuild ^0.24.2, markedit-theming from GitHub tag v0.16.0; lockfile committed |
| src/web (Eleventy config, njk, css) | Node ESM | src/web/src, public/fonts | src/web/_site (ignored) | @11ty/eleventy ^3.0.0; no lockfile committed |

Path assumptions that a monorepo must change: generate.py derives SRC as its own parent's parent and REPO as SRC's parent (generate.py:17-18); validate.py, cvd_check.py and check_fonts.py read ../glauca.json; assemble.sh uses ../.. from its location; build_pptx.py uses three parents; build.mjs writes to ../../dist/markedit; subset_fonts.sh must run from the repository root. The Makefile calls all of them by src/ paths. All I/O in generate.py uses the locale default encoding (read_text and write_text without encoding, generate.py:21, 1958, 1968); behaviour on Windows is unverified.

### 5.3 Build run in the temporary copy

Environment: macOS, Python 3.9.6 (system), Node v24.21.0, npm, Info-ZIP zip. typst not installed. A virtual environment at S/work/glauca-analysis/venv added python-pptx 1.0.2, fonttools 4.60.2, brotli and cffconvert 2.0.0.

| Step | Command | Result |
| --- | --- | --- |
| 1 | python3 src/scripts/validate.py | Exit 0; 18 rows pass; "validation passed" |
| 2 | python3 src/scripts/generate.py --check | Exit 0; "clean: 115 generated files match the json" |
| 3 | python3 src/scripts/generate.py | Exit 0; "generated 115 files from src/glauca.json" |
| 4 | sh src/scripts/assemble.sh | Exit 0 |
| 5 | git status --short after steps 3 and 4 | Four files modified, nothing else: dist/firefox/Glauca.xpi, dist/thunderbird/Glauca.xpi, dist/vivaldi/Glauca-Dark.zip, dist/vivaldi/Glauca.zip |
| 6 | Compare archive members | Vivaldi zips: same member and same CRC-32; only the zip timestamp differs (committed 08-07-2026 11:42). Firefox and Thunderbird xpi: the committed manifest.json inside differs from the rebuilt one on one line, homepage_url. The committed archives hold https://git.tiagojct.eu/tiagojct/glauca; the rebuilt ones hold https://github.com/tiagojct/glauca. icon.svg is identical. |
| 7 | python3 src/scripts/cvd_check.py | Exit 0; table printed |
| 8 | python3 src/scripts/check_fonts.py | Without fontTools: "fonttools not installed - glyph check skipped", exit 0. With fontTools: 38 codepoints inside the range and all three TTFs "ok". |
| 9 | node --check dist/tailwind/colors.generated.js; require('./dist/tailwind'); json.load on the 11 JSON files under dist/ | All pass |
| 10 | make pptx (python-pptx 1.0.2) | Two files written. Both differ from the committed ones. Each has 48 members; only ppt/slides/slide6.xml differs in content (closing-slide URL: committed git.tiagojct.eu/tiagojct/glauca, rebuilt github.com/tiagojct/glauca). Zip timestamps also differ, so the files are not byte-identical in any case. |
| 11 | make markedit (npm install, esbuild 0.24.2 from the lockfile, markedit-theming v0.16.0 from GitHub) | dist/markedit/glauca.js is byte-identical (cmp); package-lock.json unchanged |
| 12 | make fonts (fontTools 4.60.2, brotli) | The three woff2 files are byte-identical. One warning: "meta NOT subset; don't know how to subset; dropped" for Plex Mono. |
| 13 | src/web: npm install; npm run build | Eleventy 3.1.6 writes _site/index.html plus 7 CSS files and 3 fonts. Creates an untracked package-lock.json. |
| 14 | make firefox-lint (npx web-ext@8) | errors 0, notices 0, warnings 0 (matches docs/CHANGELOG.md:70-71) |
| 15 | make test | Exit 0 |
| 16 | cffconvert --validate | Exit 1, licence value rejected (section 1.4) |
| 17 | npx @vscode/vsce package in dist/vscode | Plain: "Packaged: ... (2 files, 1.14 KB)", a VSIX with no extension files, in this sandbox (cause unverified, probably the /private/tmp path). With --no-dependencies: 77 files, 49.45 KB. Warnings: no LICENSE file; no .vscodeignore and no files property. |
| 18 | make demo | Not run (typst missing): unverified |
| 19 | make firefox-sign | Not run (needs AMO credentials and would contact addons.mozilla.org) |

Result: after make generate, 137 of the 141 tracked dist files are byte-identical to the committed ones. After make pptx as well, 135 of 141. All 115 generated text files are identical. The six files that differ are the four archives and the two .pptx files. Four of them (both xpi files and both pptx files) are also stale in content: they were built before commit 1efbcce changed the repository URL and were not rebuilt, although that commit's message says it updated the manifests, their built copies in dist/ and the PPTX colophon. The two Vivaldi zips differ only in their zip timestamps. The drift gate cannot see this class of file.

## 6. Targets

### 6.1 Provenance and content

Counts are tracked files in dist/. Tier is from src/glauca.json:637-667 (product.tiers): core or maintained.

| Target | Files | Source and builder | Generated or hand-written | Token roles consumed |
| --- | --- | --- | --- | --- |
| CSS (core) | 6: glauca.css, typography.css, p3.css, a11y.css, fallbacks.css, motion.css | build_css, build_typography, build_p3, build_a11y, build_fallbacks, build_motion (generate.py:65, 31, 1882, 2170, 2188, 2203). Copies also land in src/web/src/css. | Generated | All 15 mode roles per mode; type.scale; spacing; typography fonts and roles; gamut.p3 accent and accent-bright; a11y focus and contrast_more; performance.fallbacks; motion |
| Tailwind (core) | 4: colors.generated.js, package.json, index.js, README.md | build_tailwind (generate.py:98); src/tailwind/ | colors.generated.js and package.json generated; index.js and README hand-written | Palette only: 14 core entries (saxum, glaucum, caelum, pruina groups); no extended; no mode roles; type.scale, typography fonts and role tracking, spacing, motion |
| VS Code (core) | 75 (section 6.3) | build_vscode, build_vscode_light, _light_remap, build_vscode_icons (generate.py:860, 1538, 1480, 1631); src/vscode/ | Two themes, package.json, 68 icons and the icon-theme json generated; README and two preview SVGs hand-written | Dark roles bg, surface, surface-raised, text, text-muted, border, accent, on-accent, tint, tint-bright; palette caelum 3, glaucum spuma and nebula, extended 5; code (11 roles); terminal.ansi. Light theme through the remap. Icons: extended 5, dies, aer, nebula, dark text-muted and tint-bright. |
| Zed (maintained) | 2: themes/Glauca.json, README.md | build_zed (generate.py:1748); src/zed/ | Theme generated; README hand-written | As VS Code plus players and accents rotations (8 hues); 154 style keys and 55 syntax keys per theme |
| Ghostty (core) and iTerm2 (maintained) | 7: Glauca and Glauca-Dark as .ghostty and .itermcolors, glauca.conf, README.md, preview.svg | build_ghostty, build_ghostty_light, build_ghostty_conf, build_iterm, build_iterm_light, _light_ansi (generate.py:163-302); src/themes/terminals/ | Five files generated (four theme files and glauca.conf); README and preview.svg hand-written | Dark: the terminal block plus modes.dark on-tint, tint-pale, on-accent, accent, border, surface, text. Light: modes.light accent, bg, border, on-accent, on-tint, surface, text, tint, tint-pale, tint-bright plus derived ANSI. conf: dies, nebula, light bg. |
| Obsidian (core) | 5: theme.css, manifest.json, README.md, img/dark.svg, img/light.svg | build_obsidian in generate_obsidian.py; src/obsidian/ | theme.css and manifest generated; README and two preview SVGs hand-written | 11 mode roles (accent, accent-bright, accent-deep, bg, border, on-accent, surface, surface-raised, text, text-muted, tint-bright); extended 5 as named hues; aer; code (11 roles) |
| Quarto (core) | 8: glauca.scss, glauca-dark.scss, glauca.theme, glauca-dark.theme, typst-brand.typ, README.md, example/_quarto.yml, example/index.qmd | build_quarto_scss, build_quarto_theme, build_typst_brand (generate.py:2219-2269); src/quarto/ | Five generated; three hand-written | scss: bg, text, accent, border, accent-deep, surface, fonts. theme: code roles (light remapped), surface, text-muted. typst-brand: light text and accent only. |
| Typst (core slides; maintained poster) | 5: colors.typ, poster.typ, glauca.typ, demo.typ, README.md. src/typst/colors.typ is a generated in-place copy. | build_typst, build_poster_typ (generate.py:1721, 2120); src/typst/ | colors.typ and poster.typ generated; glauca.typ, demo.typ, README hand-written | colors.typ: all 15 roles for both modes, plus flat dark names (pix, umbra, `tint-*`, dies, accent, aer, pruina, cinis). poster: dark bg and text; light accent-bright, accent-deep, tint-deep, tint, bg, text |
| R (core) | 1: glauca.R | build_r with R_TEMPLATE (generate.py:1974, 2011) | Generated | dataviz categorical, sequential, diverging, shapes.ggplot_pch, fonts, plot light and dark |
| Python (core) | 2: glauca.py, glauca.mplstyle | build_pyviz, build_mplstyle (generate.py:1999, 1987) | Generated | Same dataviz inputs as R, plus shapes.matplotlib |
| Firefox (maintained) | 4: manifest.json, Glauca.xpi, icon.svg, README.md | build_firefox, _chrome_colors, _webext_theme_manifest (generate.py:591, 552, 516); src/firefox/ | manifest generated; xpi zipped from manifest and icon; icon.svg is a copy of src/assets/logo.svg | Modes bg, surface, surface-raised, text, text-muted, border, accent, on-accent, tint, tint-pale (38 colour keys per mode) |
| Thunderbird (maintained) | 4: same set | build_thunderbird (generate.py:609) | As Firefox | Same table plus accent-deep for sidebar_highlight_border (35 keys per mode) |
| Vivaldi (maintained) | 5: dark/settings.json, light/settings.json, two zips, README.md | build_vivaldi (generate.py:385); src/vivaldi/ | Settings generated; zips built by assemble.sh | accent, bg, surface, text, tint, tint-bright |
| Zotero (maintained) | 2: userChrome.css, README.md | build_zotero (generate.py:692); src/zotero/ | CSS generated | accent, accent-bright, accent-deep, bg, border, on-accent, surface, surface-raised, text, text-muted; folium, bacca, unda, viola, cinis; terminal.ansi[3]; dataviz.diverging[7]; seven typed Okabe-Ito hexes |
| oh-my-zsh (maintained) | 3: glauca.zsh-theme, glauca-dark.zsh-theme, README.md | build_omz, build_omz_light (generate.py:360, 370) | Themes generated | Dark: bg, text-muted, tint-bright, nebula, dies, unda, bacca. Light: accent, bg, text, text-muted, tint, tint-bright, unda, bacca |
| Miniflux (maintained) | 2: glauca.css, README.md | build_miniflux (generate.py:422) | CSS generated | accent, accent-bright, accent-deep, bg, border, on-accent, surface, surface-raised, text, text-muted, tint; folium, bacca; terminal.ansi[3] |
| MarkEdit (maintained) | 2 in dist: glauca.js, README.md; src/markedit/ holds colors.generated.js, glauca.mjs, build.mjs, package.json, package-lock.json | build_markedit (generate.py:629) then esbuild | colors.generated.js generated; glauca.js is a bundle built by esbuild (byte-identical on rebuild) | accent, bg, border, surface, text, text-muted; code roles (light through the remap) |
| PowerPoint (maintained) | 3: Glauca.pptx, Glauca-Dark.pptx, README.md | src/pptx/build_pptx.py; separate make target | Two binaries built by python-pptx; not drift-gated | Modes accent, accent-bright, bg, border, on-accent, surface-raised, text, text-muted, tint, tint-bright; dataviz.categorical (drops #0072b2); brand.tagline; version; mode label; typed #62BA46 and #8C8C8C |
| CMYK print spec (maintained) | 1: print/SPEC.md | build_print_md (generate.py:2105) | Generated | The print block only. Typst poster.typ pairs with it. |
| Specimen | src/specimen only (10 files) | No builder | Hand-written | Own typed values (section 8) |
| Web starter | src/web only | Eleventy; embeds generated CSS | Hand-written page; CSS generated | Uses the CSS variables only |
| Brand assets | src/assets (3 SVG) | No builder | Hand-written | Own typed values |

Terminals: only two ship, Ghostty (light and dark themes plus a companion config) and iTerm2 (light and dark colour presets). There are no Alacritty, kitty, WezTerm, Windows Terminal or tmux outputs. The oh-my-zsh prompt is a shell theme, not a terminal preset.

### 6.2 Family-specific content, routes, publication and proposal

Route means the install or publish route documented in the repository. Published means what I found in registries on 2026-09-29. Proposal is mine, not a decision.

| Target | Family-specific values or artwork | Documented route | Published? | Proposal and reason |
| --- | --- | --- | --- | --- |
| CSS | Prefix `--gl-` and classes `.gl-*`; `[data-mode]`; a11y.css has a .hero rule; comment names Pruina and Profundum | docs/PUBLISHING.md:25-29: static assets, ship directly or through a bundler | No package of its own (CDN listings not checked) | All ten. The structure is family-independent; the prefix must become family-scoped or a shared prefix with a family selector. |
| Tailwind | Package name glauca-tailwind; colour names glaucum, caelum, pruina, saxum | docs/PUBLISHING.md:21-23: cd dist/tailwind && npm publish | No. npm glauca, glauca-tailwind, glauca-color-theme all return 404. | All ten. It exports palette names and shared scales. It carries no mode roles, so light-mode values such as #f7fafb and #16222a are absent, and no CSS @theme output exists. |
| VS Code colour themes | Names "Glauca Light" and "Glauca Dark"; package glauca-color-theme, publisher tiagojct | docs/PUBLISHING.md:6-13 (vsce package, then Marketplace or Open VSX for Positron); src/vscode/README.md:30-35 (copy folder or vsix) | No. Marketplace query for "glauca" returns 0 results and the item page is 404; Open VSX tiagojct/glauca-color-theme is 404. Publisher tiagojct has one extension on both: pequod-color-theme, "Pequod Palette" 0.2.0. | All ten. The builder is role-driven and one extension can list 20 themes. |
| VS Code icon theme | "Glauca Icons", id glauca-icons, prefix gl-; 46 monograms and 7 folder hue variants | Same package | No | Goney-only. Icon themes are independent of colour themes in VS Code; ten copies would add 680 SVGs. A single shared set is enough. |
| Zed | Family and author strings; theme names | src/zed/README.md:19-36: copy to ~/.config/zed/themes | No. No match in the Zed extensions registry (extensions.toml). | All ten. Same builder logic as VS Code; one family file can hold many themes. |
| Ghostty and iTerm2 | Theme names; glauca.conf pairing theme = light:Glauca,dark:Glauca-Dark; macOS icon block uses dies and the frost bg; preview.svg | src/themes/terminals/README.md: copy to ~/.config/ghostty/themes; import in iTerm2 | No. Not in the iTerm2-Color-Schemes tree that Ghostty bundles (24,627 entries searched). | All ten. Pure colour tables; the family goes into the file name. |
| Obsidian | Style Settings id and name "glauca"; body classes gl-focus, gl-embed-frames, gl-nav-plain, gl-explorer-truncate, gl-headings-serif, gl-body-serif, gl-headings-sans; `--gl-*` variables; manifest name; the reading voice (sans headings, serif italic emphasis) | docs/PUBLISHING.md:15-19 and src/obsidian/README.md:9-11: copy to .obsidian/themes/Glauca; for the community list "push it to a dedicated repo whose root holds manifest.json and theme.css" | No. Not in the 1,305-entry theme download feed (releases.obsidian.md/stats/theme). The new directory landing page (community.obsidian.md/themes) has no match either, but it is partly rendered in the browser, so that is weak evidence. | All ten, as one theme with a family switch through body classes. See 6.4 for the release constraint. |
| Quarto | File names only; example text; typst-brand is light-only | src/quarto/README.md: copy files next to _quarto.yml | No. No _extension.yml. | All ten. Two scss and two highlight files per family; only colours change. |
| Typst | Function glauca; default mode dark; poster demo text ("A GLAUCOUS DESIGN SYSTEM", "Glauca", "Clear glass, cold light."); title slide on tint_deep | src/typst/README.md: import glauca.typ; fonts must be installed | No. typst/packages has no preview/glauca (404). | All ten. Layout code is family-neutral; colours, default mode and demo text change. |
| R | Function names `scale_colour_glauca_*`, `theme_glauca`; sequential and diverging scales built on the blue | README.md:81-93: source dist/r/glauca.R | No. It is a script, not a package (no DESCRIPTION). CRAN glauca is 404. | All ten. Categorical scale and shapes are shared; sequential, diverging and plot colours are per family. |
| Python | use_glauca, glauca_seq, glauca_div, glauca.mplstyle | README.md:81-93: import dist/python/glauca.py | No. No pyproject. PyPI glauca is 404. | All ten. Same reasoning as R. |
| Firefox | Add-on id glauca-theme@tiagojct.eu; name; description "frost-bloom"; icon is the bloom emblem; homepage URL | src/firefox/README.md:25-54: temporary load from about:debugging, or make firefox-sign (unlisted signing) | No AMO match: lookup by GUID returns 404, and a search for "glauca" static themes returns unrelated themes only. The committed xpi is unsigned (no META-INF) and stale. Unlisted signing status is unverified. | Some. A static theme cannot hold a family switch, so each family is its own add-on and its own signing. Build all, sign the ones in use. |
| Thunderbird | Id glauca-theme@thunderbird.tiagojct.eu; name; description; emblem icon | src/thunderbird/README.md:24-40: temporary load, or submit the xpi unlisted to addons.thunderbird.net | No ATN listing (lookup by id 404; search "glauca" returns unrelated add-ons). Unlisted status unverified. | Some. Same constraint as Firefox. |
| Vivaldi | uuid5("glauca.vivaldi.<mode>") theme ids; names "Glauca Light" and "Glauca Dark" | src/vivaldi/README.md:19-28: Import Theme in the UI | Unverified (no API checked for the Vivaldi themes site) | Some. One zip per mode per family and a manual import; a family option inside one package is not possible. |
| Zotero | Comment header only; tag mapping uses Okabe-Ito hexes and extended names | src/zotero/README.md:52-73: copy userChrome.css into the profile and set one pref | No registry exists for Zotero themes (unverified) | Some. Zotero reads one userChrome.css, so one file per family; it is a personal-workflow surface (docs/PRODUCT.md:20-27). |
| oh-my-zsh | Files glauca and glauca-dark; function prefix `_glauca_`; the "one blue mark, the git-dirty asterisk" design | src/omz/README.md:17-27: copy to ZSH_CUSTOM/themes, set ZSH_THEME | No registry | All ten. Prompt logic is neutral; it needs four palette slots (mark, path, branch, error). |
| Miniflux | Nothing beyond colours and IBM Plex font names | src/miniflux/README.md:7-16: paste into Settings, Custom CSS | No registry | Some. Pure CSS-variable map on the maintained tier, tied to one person's Miniflux; one paste-in file per family. |
| MarkEdit | Package name glauca-markedit; file names; banner comment | src/markedit/README.md:21-42: make markedit, then copy glauca.js into the app's scripts folder | No | Some. macOS-only editor, and the script overrides MarkEdit's built-in light and dark themes, so one family is active at a time; the npm toolchain is heavy for one target. |
| PowerPoint | Theme names "Glauca"; slide text: title, tagline, bullets about the rule, closing URL; file names | src/pptx/README.md:29-37: make pptx, open the file | No | All ten, only if the slide copy moves into tokens; otherwise Goney-only. |
| CMYK print spec | "Pantone 2175 C region" spot note is specific to #007aff; rich-black recipe; profile | README.md:95-103 | No | All ten. Every CMYK row equals a naive conversion of a hex, so the table can be computed; the spot note is per family. |
| Specimen | All of it: Glauca copy, stale values, an Inter comparison | src/specimen/README.md: open in a browser | No | Goney-only. Do not import as is (hand-written, 7.35 MB, stale); regenerate per family from tokens. |
| Web starter | One page of Glauca copy, lang="pt" | README.md:75; CLAUDE.md:50: npm run serve or build in src/web | No | Goney-only. It is one hand-written page; the ensigns site presents the families. |
| Brand assets | The bloom emblem (light, dark), cover | docs/BRAND.md:22-29 | No | All ten, if the emblem is generated from five palette values; Goney-only if kept as hand-drawn files. |

Names of the planned families and the registries (extra check, beyond the brief): goney, ensigns and jungfrau return 404 on npm, PyPI and CRAN. rosebud returns 200 on npm and PyPI and 404 on CRAN. No theme in the Obsidian feed matches goney, rosebud, jungfrau or ensign.

### 6.3 Why dist/vscode has 75 files

| Group | Files |
| --- | --- |
| Manifest and docs | package.json (generated, version-stamped), README.md (copied) |
| Previews | preview-python.svg, preview-r.svg (copied, hand-written) |
| Colour themes | themes/Glauca-color-theme.json (light), themes/Glauca-Dark-color-theme.json (dark). Each has 887 workbench colour keys, 43 tokenColors and 37 semanticTokenColors. |
| File-icon theme | icons/glauca-icon-theme.json plus 68 SVGs: 6 outline glyphs (file, pdf, image, audio, video, archive), 46 two-letter monograms, and 16 folder icons (a default plus 7 hue variants, each closed and open). The json maps 106 extensions, 32 file names, 39 folder names and 37 language ids. |
| Total | 2 + 2 + 2 + 69 = 75 |

The 69 icon files are generated (build_vscode_icons), so their count grows with the tables _ICON_MONO and _ICON_FOLDERS (generate.py:1569-1629). A packaged VSIX from this folder holds 77 files (49.45 KB), which adds the two container files.

### 6.4 Packaging constraints that bear on the plan

- Firefox and Thunderbird themes are static: one add-on carries one theme pair (theme and dark_theme). Families cannot be options inside one package. The same holds for Vivaldi (one zip per theme), Zotero (one userChrome.css) and MarkEdit (the script overrides the built-in themes).
- Obsidian: docs/PUBLISHING.md:17-19 says a community theme needs a dedicated repository whose root holds manifest.json and theme.css. The current Obsidian docs (obsidianmd/obsidian-developer-docs, "Submit your theme", read on 2026-09-29) also ask for README.md, LICENSE, a 512 x 288 screenshot at the repository root, and a GitHub release whose tag equals the manifest version with manifest.json and theme.css attached. dist/obsidian has SVG previews but no screenshot and no LICENSE. The theme guidelines from the same docs advise against !important and network calls; generate_obsidian.py:764-765 uses !important.
- VS Code: one extension with every theme is possible; the icon theme decision is in the table above.

## 7. Fonts and assets

| File | Size (bytes) | Content | Licence evidence |
| --- | --- | --- | --- |
| src/fonts/IBMPlexSerif.ttf | 398,236 | IBM Plex Serif, Version 1.000, variable wght 100-700, 926 mapped codepoints | Name IDs 13 and 14: OFL 1.1 and http://scripts.sil.org/OFL; copyright "2020 IBM Corp." |
| src/fonts/IBMPlexSans.ttf | 537,244 | IBM Plex Sans, Version 3.201, variable wght 100-700 and wdth 75-100 (Glauca uses 85-100), 891 codepoints | Same; copyright 2019 |
| src/fonts/IBMPlexMono.ttf | 135,580 | IBM Plex Mono, Version 2.3, static Regular only, 930 codepoints | Same; copyright 2017 |
| src/web/public/fonts/IBMPlexSerif.woff2 | 50,408 | Subset of the Serif file: 236 codepoints, GSUB features kept | Name IDs 13 and 14 absent; copyright line kept |
| src/web/public/fonts/IBMPlexSans.woff2 | 67,820 | 235 codepoints | Same |
| src/web/public/fonts/IBMPlexMono.woff2 | 14,668 | 216 codepoints | Same |

- The subsets use i18n.unicode-range (U+0000-00FF, U+0131, U+0152-0153, U+2000-206F, U+20AC, U+2122). Every codepoint in each subset is inside the range, and all 38 European Portuguese test characters are present (checked with fontTools).
- Only upright faces are shipped: no italic files for Serif, Sans or Mono, and no bold or extra static Mono weights. src/fonts/README.md:43-47 names italic and extra Mono weights as things that exist upstream. The Obsidian theme asks for "IBM Plex Serif Italic" and relies on the system font.
- No OFL text file ships. README.md:170-171 says to ship the OFL text when redistributing subsets. The subset woff2 files lost the licence name records in subsetting. dist/ contains no font files at all.
- The specimens embed more fonts as base64 without any licence text: Inter in specimen.html, Source Serif 4 in reading-comparison.html, and Plex in the others. brand.svg and poster-proof.svg embed IBM Plex Serif as base64 TTF.
- src/fonts/README.md:9 says "These files are documented, not committed", which is wrong: the three TTFs are committed (CLAUDE.md:74 and README.md:124 say so). The README gives download commands and a rename step for the Serif variable font ("IBM Plex Serif Var" to "IBM Plex Serif").
- The fallback metrics (performance.fallbacks) were computed with fontTools against Georgia, Arial and Courier New. No script for that is in the repository.

Assets (src/assets): logo.svg (494 bytes, light bloom emblem), logo-dark.svg (494 bytes), cover.svg (1,005 bytes, 1200 x 630, uses Georgia and monospace fallbacks, not Plex). The emblem is a rounded square with a pale disc, a ring, one blue point and a baseline. All colours are typed hex values. assemble.sh copies logo.svg to dist/firefox/icon.svg and dist/thunderbird/icon.svg.

## 8. Specimens and web

### 8.1 src/specimen (10 files, 7.35 MB)

| File | Size (bytes) | What it is |
| --- | --- | --- |
| specimen.html | 1,363,854 | Type and colour specimen, dark and light toggle, tiers, code panel; Plex plus an Inter comparison, all base64 |
| type-specimen.html | 1,458,472 | Type roles |
| reading-comparison.html | 2,957,438 | Body-face comparison with Plex Sans and Source Serif 4 |
| pt-specimen.html | 184,116 | European Portuguese coverage |
| motion.html | 3,413 | Easing and duration demo; no embedded fonts, no script |
| brand.svg | 485,647 | Brand mark sheet with embedded Plex Serif |
| poster-proof.svg | 734,174 | Poster proof with embedded Plex Serif and Mono |
| glauca-dataviz.png, glauca-dataviz-cvd.png | 138,595 and 27,831 | Charts. PNG metadata says Matplotlib 3.9.4 and 3.10.8. No script in the repository makes them. |
| README.md | 974 | Description |

- It is one set of static pages for Glauca alone. It is not one page per family.
- Nothing builds it. generate.py writes nothing to src/specimen. The provenance of the HTML and SVG files is unknown.
- Hand-typed hex values: 100 occurrences in the five HTML files (specimen.html 74, motion.html 7, type-specimen.html 7, pt-specimen.html 6, reading-comparison.html 6) and 77 in the two SVG files (brand.svg 41, poster-proof.svg 36), plus six rgba() values in specimen.html.
- The values are stale. In specimen.html, 12 mode values differ from src/glauca.json: dark accent-deep #084b96 (json #007aff), dark on-accent #10161c (json #0b1218), dark tint-deep #171f26 (json #142430), dark on-tint #10161c (json #0d1720); light text #1f2932 (json #16222a), border #c6ced4 (json #cdd7dc), accent-bright #3d97ff (json #007aff), on-accent #ffffff, tint-deep #16222a, tint #2b4356, tint-bright #4d7391, tint-pale #93b7c9 and on-tint #ffffff (json #f2f7fb, #16303f, #35576b, #3e6d84, #b7cdd6, #f2f7fb). It also sets Fraunces-style axes (opsz, SOFT, WONK) on IBM Plex Serif, which has none, and it defaults to an Inter body.
- brand.svg still carries Try-Works-era wording: "The blue is the one cold mark", "emblem - lit", "emblem - cold", and an emblem that differs from src/assets/logo.svg.

### 8.2 src/web (14 files)

- package.json (name glauca-web, private, @11ty/eleventy ^3.0.0, scripts serve and build), eleventy.config.js (8 lines; passes src/css and public/fonts through; input src, output _site), src/_includes/base.njk (html lang="pt", data-mode="light", six stylesheets plus site.css, a toggleMode script), src/index.njk (one page: hero and one section, Glauca copy including "Clear glass, cold light."), src/css/site.css (44 lines: font-face rules, layout, no hex values), six generated CSS files, and three woff2 files.
- Build: npm install, then npm run build in src/web. I built it: Eleventy 3.1.6 wrote _site/index.html and copied the CSS and fonts. No lockfile is committed.
- Hand-typed hex values in files the author wrote: none. The generated CSS files hold 36 hex occurrences, all from the generator. site.css repeats the unicode-range string by hand instead of reading i18n.unicode-range.

## 9. References to other repositories, sites and DOIs

Outbound references from Glauca:

| Reference | Where | Note on a move |
| --- | --- | --- |
| https://github.com/tiagojct/glauca | CITATION.cff:10; src/vscode/package.json:16 and dist copy; src/tailwind/package.json:22 and dist copy; generate.py:536 and the two generated manifests dist/firefox/manifest.json:7, dist/thunderbird/manifest.json:7 (8 occurrences); github.com/tiagojct/glauca text at src/pptx/build_pptx.py:226 | Edit at the source (generate.py, build_pptx.py, package.json, CITATION.cff), then regenerate. The committed xpi and pptx still carry the old URL. |
| git.tiagojct.eu (old host) | docs/CHANGELOG.md:136 (history, kept on purpose per commit 1efbcce); inside dist/firefox/Glauca.xpi, dist/thunderbird/Glauca.xpi, dist/pptx/Glauca.pptx, dist/pptx/Glauca-Dark.pptx; all commits before 1efbcce | Stale copies to rebuild |
| https://tiagojct.eu | CITATION.cff:11 (url); src/obsidian/manifest.json:6 and dist copy (authorUrl) | Personal domain; no project page path is referenced |
| Domain in identifiers | Add-on ids glauca-theme@tiagojct.eu (generate.py:606) and glauca-theme@thunderbird.tiagojct.eu (generate.py:626); "author": "tiagojct" (generate.py:535, 1872); VS Code publisher tiagojct | Changing an id creates a new add-on if it was ever signed or listed |
| https://github.com/tiagojct/try-works | README.md:6 and 175 | Family link; text mentions of try-works in CLAUDE.md:7, docs/BRAND.md:13-14, docs/CHANGELOG.md, docs/FOUNDATIONS.md:25 and 71, docs/PRODUCT.md:13 and 32, src/glauca.json:253, 628, 668, generate.py:1500 |
| https://stephango.com/flexoki | README.md:176 | Credit |
| MarkEdit and MarkEdit-theming | README of src/markedit; package.json:12 (GitHub tag v0.16.0); package-lock.json:12 and 486 (commit 149011e0db4341f2fdd447d2772e8095aff95bd8) | Build dependency from GitHub |
| addons.mozilla.org API keys page | Makefile:61 | Signing instructions |
| addons.thunderbird.net/developers | READMEs | Signing instructions |
| raw.githubusercontent.com Google Fonts and IBM/plex | src/fonts/README.md:19, 30 | Font download commands |
| https://zed.dev/schema/themes/v0.2.0.json | Zed theme, generate.py:1871 | Schema |
| https://example.org | dist/quarto/example/index.qmd:10 | Placeholder |

Not referenced anywhere in the repository: gam, Zenodo, any DOI, any ORCID, the Pequod or Ambergris projects, tiagojct.eu project pages. The word "Moby-Dick" appears at src/glauca.json:628 and docs/CHANGELOG.md:130 only.

Inbound references, from the gam clone (S/clones/gam, not from Glauca): scripts/vendor.sh:24 clones tiagojct/glauca; src/model/adapters/glauca.js reads src/glauca.json, src/scripts/cvd_check.py, README.md and 28 fixed dist/ paths, and encodes glauca-specific knowledge (neutral groups saxum, glaucum, pruina; core group caelum with dies, aer, imum; extended hue names; the three non-palette code colours #c3cdd3, #a7b1b8 and #86929a with their light rules); .github/workflows/build-deploy.yml:53 lists glauca among vendored repositories; deploy/family-dispatch.yml expects a notify-gam job in Glauca's workflow. gam's README says Glauca's Tailwind, R and Python outputs are "not on npm/CRAN/PyPI", which agrees with my registry checks. The rename and the move change every path that adapter reads.

Scale of the rename to Goney: the word "glauca" in any case occurs 812 times in 125 tracked text files, and 34 tracked paths carry it in the file name. The gl- prefix (CSS variables, classes, icon file names, Obsidian body classes) and the package, add-on and Style Settings ids are extra.

## 10. Hex values typed outside src/glauca.json

The rule to test is: no colour value may be typed anywhere except a family's palette block. I counted every #rrggbb and #rrggbbaa token in tracked text files, after removing base64 data. Fonts, PNG files, .pptx, .xpi and .zip archives are not counted. The total is 4,841 occurrences in 136 files.

| Category | Files with hex | Occurrences | Could a generator produce it from tokens? |
| --- | --- | --- | --- |
| src/glauca.json itself (123 exact-hex leaves, 8 more in prose strings) | 1 | 131 | It is the source |
| Generated by generate.py (drift-gated); 100 of the 115 generated files contain hex | 100 | 3,814 | Already generated |
| dist/markedit/glauca.js, bundled by esbuild from generated colours | 1 | 76 | Already derived |
| Generator and build code: string literals in generate.py 119 (28 distinct), generate_obsidian.py 1, build_pptx.py 3; plus 7 mentions in comments and docstrings | 4 | 130 | These are the typed values in code, listed below |
| Hand-written preview artwork in src/ (terminals preview.svg 62; vscode preview-python.svg 56 and preview-r.svg 55; obsidian img light.svg 28 and dark.svg 27), copied to dist by assemble.sh (another 228) | 10 | 456 | Yes: they are palette-true drawings and could be generated |
| dist/firefox/icon.svg and dist/thunderbird/icon.svg (copies of src/assets/logo.svg) | 2 | 10 | Yes |
| src/assets: logo.svg 5, logo-dark.svg 5, cover.svg 12 | 3 | 22 | Yes |
| src/specimen: five HTML files 100, brand.svg 41, poster-proof.svg 36 | 7 | 177 | Yes; the HTML carries stale values |
| Documentation prose (README.md 7, CLAUDE.md 4, docs/CHANGELOG.md 4, docs/FOUNDATIONS.md 4, terminals README 2 in src and 2 in dist, vscode README 1 in src and 1 in dist) | 8 | 25 | No colour tables exist in the docs. All are inline mentions of the three anchors #007AFF, #62BA46 and #8C8C8C. |
| Total | 136 | 4,841 | |

Inside src/glauca.json (outside the palette block):

- 104 hex leaf values sit outside palette: modes 30 (15 values in the palette by copy, 15 not), code 11 (8 by copy), terminal 22 (12 by copy), dataviz 35 (5 by copy), a11y 6 (1 by copy).
- 54 distinct values are not palette entries: dark modes 3 (border, accent, on-tint); light modes 11; code 3 (parameter, operator, punctuation); terminal ANSI 10; a11y.contrast_more 4; dataviz 22 (7 categorical, 7 sequential, 8 diverging) and one plot grid (#dde6ea).
- gamut.p3 holds four typed color(display-p3 ...) strings that are colours as well.

Typed in generator code (colour literals, not comments):

- generate.py: 119 occurrences, 28 distinct. Ten are alpha overlays: #00000000, #0000000a, #00000010, #0000001a, #0000004d, #00000066, #0000007f, #ffffff0a, #ffffff14, #ffffff1f. Six six-digit values exist nowhere in the json: #132335, #1b242c, #1d262f, #2d251a, #2f1c1e, #5b656d (dark UI literals of VS Code and Zed, remapped for light in generate.py:1510-1521). Twelve six-digit values repeat json values: the seven Okabe-Ito colours for Zotero tags (#0072b2, #009e73, #56b4e9, #cc79a7, #d55e00, #e69f00, #f0e442, generate.py:677-689), #2a3540, #3a4754, #86929a, #a7b1b8, #c3cdd3.
- generate_obsidian.py:37: #d9ae4a (yellow, equals terminal.ansi[11]).
- src/pptx/build_pptx.py:30, 192: #0072b2 (filter), #62BA46, #8C8C8C (palette slide).
- The light-mode value tables in _light_remap key on these literals (generate.py:1510-1522). A dark colour with no entry stops generation with a KeyError.

Hand-written files that carry their own values, and are out of step with the json:

- specimen.html: 12 stale mode values (section 8.1) and five typed light-adjusted extended hues (#407639, #784a4d, #6b588b, #33668b, #306972). Four equal the derived values in both Obsidian and the editors. The folium value #407639 follows Obsidian; the editors derive #3c6e38.
- terminals preview.svg: #26565c, #3f7a2e, #4a5c66, #526672 are not in the json (the generated light ANSI green is #3f7b39, so #3f7a2e is a hand approximation).
- obsidian img/light.svg: #2f6690, #2f66901a, #33668b, #3f7a2e, #407639 are not in the json.

Files with no typed colour: src/web (own files), src/typst/glauca.typ, demo.typ, src/quarto/example, src/markedit/glauca.mjs and build.mjs, src/tailwind/index.js, the Makefile.

## 11. Cross-cutting findings that affect the migration plan

1. The palette-only rule cannot hold for Glauca as it stands. Fifty-four distinct hex values in the token file sit outside the palette block, including eleven of the light mode's 15 roles, and the light mode uses only three palette entries. Six more literals live in generate.py and further ones in three other code files and in hand-written artwork (section 10).
2. Light syntax and light terminal colours are not tokens. They are computed by generator rules, and two rules exist (editors versus Obsidian), so keyword and string differ between targets (section 3.6).
3. Aer and imum are not light-mode roles. Light accent-deep equals imum by value, and no light role equals aer. The role names accent-bright and accent-deep change palette entry by mode (section 3.5).
4. The palette is a renamed Try-Works schema. The generators still use Try-Works names (ember, flame, oil, fire, sea) and Try-Works wording in comments, the Quarto example page and brand.svg (sections 3.1, 8.1).
5. The drift gate covers 115 text files. Six committed binaries fall outside it and four of them are stale (two xpi, two pptx). No CI exists to run the gate (sections 1.2, 5.3).
6. Several outputs cannot carry a family option in one package: Firefox, Thunderbird, Vivaldi, Zotero, MarkEdit. Obsidian needs a release route with root-level files (section 6.4).
7. Light-first is broken in one place: the Typst slide theme defaults to dark (section 4.1, E2).
8. Metadata problems: CITATION.cff licence value fails the CFF schema; no OFL text ships; CC notice names glauca.json; no DOI or ORCID; package.json says MIT for palette content.
9. Exclude from an import: .omo/, src/scripts/__pycache__/generate_obsidian.cpython-314.pyc, .vscode/settings.json, the stale binaries, and src/specimen (78 percent of the repository's bytes).
10. Nothing from Glauca is published anywhere, and the names glauca, glauca-tailwind and glauca-color-theme are free on npm, PyPI, CRAN, Open VSX and the VS Code Marketplace.
