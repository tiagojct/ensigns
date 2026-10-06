Detailed phase 1 report, written on 2026-09-29 as the evidence behind INVENTORY.md. Paths that start with S/ point into a temporary scratch folder that does not persist; they record what was run. Every other path is relative to the repository root at the commit named in the report.

# Pequod inventory (phase 1)

Scope: repository tiagojct/pequod at the pinned HEAD 619982d518a66af65b19117652e9dba977e7bbbd (2026-04-30 10:58:42 +0100). Paths are relative to the repository root unless they start with S/ (S is the scratchpad root). The clone S/clones/pequod was not modified: `git status` is clean and HEAD is unchanged at the end of the work. Scripts and tests ran in copies under S/work (see "Method and unverified items" at the end). Registry and GitHub queries were made on 2026-09-29.

## 1. Repository facts

### 1.1 Git and GitHub

| Item | Value | Evidence |
|---|---|---|
| Commits | 20, all by one author (Tiago Jacinto), 2026-04-23 to 2026-04-30 | `git rev-list --count HEAD`, `git log` |
| Default branch | main (the only branch, local and on origin) | `git ls-remote --heads origin`, `gh repo view` |
| Tracked files | 81 (r 23, themes 11, python 11, examples 10, vscode 8, root 8, tailwind 6, specimen 2, scripts 2) | `git ls-files` |
| Object store | 7.52 MiB pack. Largest blobs are four versions of `examples/02_log_heatmap.png` (about 1 MB each) | `git count-objects -vH` |
| Tag v0.1.0 | Annotated, tag date 2026-04-26 22:38:20 +0100, points to 8a0ebbf (2026-04-26 16:34). Message: "First public release: VS Code (Marketplace + Open VSX), PyPI". At that commit `tailwind/` and `themes/terminals/` did not exist | `git show v0.1.0`, `git ls-tree` |
| Tag v0.2.0 | Annotated, tag date 2026-04-30 10:53:56 +0100, points to 232f286. Message: "v0.2.0-alpha" | `git show v0.2.0` |
| After v0.2.0 | One commit, 619982d, changing only `r/cran-comments.md` | `git diff --stat v0.2.0 HEAD` |
| Remote tags | Both tags exist on origin | `git ls-remote --tags origin` |
| GitHub releases | None (`gh release list -R tiagojct/pequod` prints nothing, `latestRelease` is null) | `gh` |
| GitHub state | Public, 4 stars, 0 forks, 0 issues (any state), 0 pull requests, 0 Actions workflows, no Actions secrets or variables, no environments, no webhooks, no Pages site, no rulesets, main unprotected, 17 topics, homepage https://tiagojct.eu/projects/pequod/. Licence detected as "Other" (NOASSERTION) | `gh api repos/tiagojct/pequod/...` |
| CI configuration | None. No `.github/` in HEAD or in any commit. `r/.Rbuildignore:4` lists `^\.github$`. `r/cran-comments.md:57-58` says GitHub Actions CI on R-release and R-devel across three operating systems was green at the v0.2.0 tag; the repository and the GitHub API (0 workflows) do not support that | `git log --all --name-only`, `gh api .../actions/workflows` |
| CITATION file | None (no CITATION.cff or CITATION). No project DOI in the repository | `find` |
| CLAUDE.md, contributor notes | None: no CLAUDE.md, AGENTS.md, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, CODEOWNERS or .editorconfig. `README.md:352` says contributions are welcome and `README.md:381-382` gives an email address and "open an issue here" | `find`, `README.md` |
| Secrets | None found by pattern scan. No `.npmrc`, `.pypirc` or `.env` tracked. `CHANGELOG.md:216` mentions "a publisher account and PAT" in prose only | `grep` |

### 1.2 Licence files and what each covers

| File | Content | Coverage stated in the file |
|---|---|---|
| `LICENSE-CC-BY-4.0` (2,079 bytes) | A summary of CC BY 4.0 with a link to the legal code and a suggested attribution line. It is not the full legal text | `pequod.json` and documentation (README.md, CHANGELOG.md, "any Markdown under `docs/`"; no `docs/` exists) |
| `LICENSE-MIT` (1,270 bytes) | Standard MIT text, "Copyright (c) 2026 Tiago Jacinto" | Header names `themes/` and `scripts/` only |
| `python/LICENSE`, `tailwind/LICENSE`, `vscode/LICENSE` | MIT, each with an added paragraph naming the package and saying the tokens are also CC-BY-4.0 at github.com/tiagojct/pequod | The package |
| `r/LICENSE` | CRAN two-line stub (YEAR, COPYRIGHT HOLDER), required by `License: MIT + file LICENSE` in `r/DESCRIPTION:17` | The R package |

What the README says (`README.md:369-376`): CC-BY-4.0 for `pequod.json` and documentation; MIT for `themes/*`, `scripts/*`, `tailwind/*`, `vscode/*`, `python/*`, `r/*`, `specimen/*`. `README.md:112-113` describes LICENSE-MIT as "theme files, scripts, R package". `README.md:12` carries a "MIT + CC-BY-4.0" badge. `pequod.json:8-11` declares `{"palette": "CC-BY-4.0", "code": "MIT"}`. `specimen/specimen.typ:226` prints "CC-BY-4.0 (palette) + MIT (code)" in the PDF footer.

Gaps and conflicts:

- The README MIT list omits `examples/*`, `Makefile` and `cover.jpg`. No file states a licence for `cover.jpg`, `examples/*.png` or `examples/plots.py`.
- `themes/Pequod.itermcolors:11` says "Licence: CC-BY-4.0 (palette)", while the README puts `themes/*` under MIT.
- The R, Python and Tailwind packages embed the CC-BY palette values under MIT. Each package LICENSE acknowledges this in one sentence.
- No root file is named LICENSE, so GitHub reports no licence.

### 1.3 .gitignore highlights (`.gitignore`)

- System and editor files: `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `*.swp`.
- Python: `__pycache__/`, `*.pyc`, `.venv/`, `*.egg-info/`, `python/dist/`, `python/build/`, `python/.pytest_cache/`.
- Generic `dist/` and `build/` are marked "reserved for future generator output".
- R: `r/pequod_*.tar.gz`, `r/pequod.Rcheck/`, `.Rproj.user/`, `.Rhistory`.
- Node and VS Code: `vscode/*.vsix`, `vscode/node_modules/`, `tailwind/*.tgz`, `tailwind/node_modules/`.
- `scratch/` for experiments.

### 1.4 Makefile targets (`Makefile`)

`.PHONY` lists 15 names including `help`; `make help` prints 14. The header comment (lines 3-5) lists three. `README.md:109` says "~13 targets".

| Target | Command | Purpose |
|---|---|---|
| `specimen` | `typst compile specimen/specimen.typ specimen/specimen.pdf` (file rule, lines 28-31) | Render the specimen PDF. Reads no JSON |
| `cvd` | `python3 scripts/cvd_check.py` | CVD simulation on `pequod.json` accents |
| `r-data` | `cd r && Rscript data-raw/generate_palettes.R` | Regenerate `r/R/palettes-data.R` |
| `r-check` | `cd r && R CMD build . && R CMD check pequod_*.tar.gz` | Build and check the R package |
| `vsix` | `cd vscode && npx --yes @vscode/vsce package --no-dependencies` | Build the extension |
| `vsce-publish` | `cd vscode && npx --yes @vscode/vsce publish --no-dependencies` | Publish to the VS Code Marketplace |
| `py-data` | `cd python && python3 data-raw/generate_data.py` | Regenerate `python/src/pequod/_data.py` |
| `py-build` | `cd python && rm -rf dist build *.egg-info && python3 -m build` | Build sdist and wheel |
| `py-test` | `cd python && python3 -m pytest` | Python tests (fails on a fresh clone, see section 7) |
| `py-publish` | `cd python && python3 -m twine upload dist/*` | Upload to PyPI |
| `tw-test` | `cd tailwind && node --test test.js` | Tailwind tests |
| `tw-pack` | `cd tailwind && npm pack` | Pack the npm tarball |
| `tw-publish` | `cd tailwind && npm publish` | Publish to npm |
| `clean` | removes the specimen PDF, R tarballs and Rcheck, `.vsix`, Python build output, `.tgz` | Cleanup |
| `help` | echo lines | List targets |

Absent from the Makefile: an Open VSX publish target, a CRAN submission step, a generator for the themes, the terminals, the Tailwind package or the specimen, a sync step for `vscode/themes/`, and any aggregate `test` or `all` target.

## 2. Versions

### 2.1 Every version string in the repository

| Location | String | Note |
|---|---|---|
| `pequod.json:4` | `0.2.0-alpha` | |
| `r/DESCRIPTION:4` | `0.2.0` | |
| `python/pyproject.toml:7` | `0.2.0` | static, not read from `__version__` |
| `python/pyproject.toml:21` | classifier `Development Status :: 3 - Alpha` | the only machine-readable "alpha" in a registry |
| `python/src/pequod/__init__.py:27` | `__version__ = "0.1.0"` | not updated for 0.2.0 (commit 232f286 changed only docstring examples in this file) |
| `python/src/pequod/_data.py:1` | "(v0.2.0-alpha)" | written by the generator from `pequod.json` |
| `r/R/palettes-data.R:1` | "(v0.2.0-alpha)" | written by the generator |
| `tailwind/package.json:3` | `0.2.0` | |
| `tailwind/index.js:30` | header "v0.2.0-alpha" | |
| `vscode/package.json:5` | `0.2.0` | |
| `CHANGELOG.md:9`, `:125` | `[0.2.0-alpha] 2026-04-30`, `[0.1.0-alpha] 2026-04-23` | |
| `vscode/CHANGELOG.md:3`, `:38` | `[0.2.0] 2026-04-30`, `[0.1.0] 2026-04-25` | |
| `README.md:35` | "Alpha (0.1.0)." | stale |
| `README.md:128` | `vscode/pequod-color-theme-0.1.0.vsix` | stale; `make vsix` now produces 0.2.0 |
| `README.md:275`, `:288` | "v0.2.0-alpha" | |
| `specimen/specimen.typ:118`, `:226`, and the rendered PDF | "v0.2.0-alpha" | |
| `r/cran-comments.md:1`, `:37` | 0.2.0 | `:6` dates CRAN 0.1.1 as 2026-04-24 |
| `themes/Pequod.zed.json:2` | `https://zed.dev/schema/themes/v0.2.0.json` | Zed's schema version, unrelated |
| Git tags | `v0.1.0`, `v0.2.0` | |
| README badges (`README.md:7-11`) | none | badges are dynamic |
| `python/README.md`, `r/README.md`, `tailwind/README.md`, `vscode/README.md` | none | |

### 2.2 Registry state

| Registry | Name | Version | Published (UTC) | Notes |
|---|---|---|---|---|
| PyPI | pequod | 0.2.0 | 2026-04-30 10:01:16 | 0.2.0 has a wheel only (no sdist). 0.1.0 has wheel and sdist (2026-04-26 19:10). Not yanked |
| npm | pequod-tailwind | 0.2.0 | 2026-04-30 12:03:22 | dist-tag latest. gitHead 619982d (HEAD). 0.1.0 published 2026-04-27 14:46 from gitHead 543b62a |
| CRAN | pequod | 0.2.0 | 2026-05-01 16:40:07 | 0.1.1 published 2026-04-29 17:40 was the first release of this package (no 0.1.0). CRAN versions 0.0-1 to 0.0-5 (2010 to 2016, "Moderated regression package") belong to an unrelated earlier package of the same name |
| VS Code Marketplace | tiagojct.pequod-color-theme | 0.2.0 | lastUpdated 2026-04-30 09:59:30 | First published 2026-04-25 17:40 |
| Open VSX | tiagojct/pequod-color-theme | 0.2.0 | 2026-04-30 11:58:23 | 0.1.0 published 2026-04-25 17:37 |

### 2.3 Explanation of the "0.2.0-alpha" versus "0.2.0" mismatch

- The numeric core agrees everywhere: 0.2.0. The suffix "-alpha" is a maturity label. It appears in `pequod.json`, the root CHANGELOG heading, the tag message, generated file headers and the specimen. No registry carries it.
- The same convention held at 0.1.0: `pequod.json` at tag v0.1.0 read "0.1.0-alpha" while the packages read 0.1.0.
- Likely reasons (registry rules, not tested here): CRAN requires a numeric version in DESCRIPTION; the VS Code Marketplace takes major.minor.patch; PyPI would normalise "0.2.0-alpha" to "0.2.0a0", which sorts before 0.2.0. The maintainer put the maturity in the PyPI classifier and in prose instead. npm would accept "0.2.0-alpha" but the package uses 0.2.0.
- Real disagreements inside the repository:
  - `python/src/pequod/__init__.py:27` says 0.1.0 while `pyproject.toml` says 0.2.0. The PyPI 0.2.0 wheel was uploaded after that commit, so it presumably reports `__version__` 0.1.0 (unverified; the wheel was not downloaded). Nothing keeps the two in step.
  - `README.md:35` and `:128` still say 0.1.0.
  - The message of 232f286 says `pequod.json` was bumped to "0.2.0", but the file says "0.2.0-alpha".
  - Tag v0.1.0 (8a0ebbf) predates `tailwind/`, yet npm 0.1.0 exists; it was built from 543b62a. R 0.1.1 has no tag.
  - `r/cran-comments.md:6` dates CRAN 0.1.1 as 2026-04-24; CRAN shows 2026-04-29 and the bump commit fce355d is dated 2026-04-28.
  - The root CHANGELOG dates 0.1.0-alpha 2026-04-23; the first registry publications are 2026-04-25 (VS Code, Open VSX), 2026-04-26 (PyPI) and 2026-04-27 (npm).

## 3. Token file `pequod.json`

### 3.1 Structural outline

The file has 82 lines and 2,988 bytes. It is valid JSON with no duplicate keys. All colour values are uppercase `#RRGGBB` without alpha.

```
$schema      string   "https://json-schema.org/draft/2020-12/schema"   (line 2, see 3.6)
name         string   "Pequod"
version      string   "0.2.0-alpha"
description  string
author       string   "Tiago Jacinto"
homepage     string   "https://tiagojct.eu/projects/pequod/"
license      object   { palette: "CC-BY-4.0", code: "MIT" }
log          object   12 keys: "50","100","150","200","300","400","500","600","700","800","900","950"
                      each value "#RRGGBB"
accents      object   8 keys: ahab, starbuck, queequeg, pip, ishmael, stubb, tashtego, daggoo
  accents.<name>      { light: "#RRGGBB", dark: "#RRGGBB", role: <hue word>, note: <string> }
roles        object   2 keys: light, dark
  roles.<mode>        12 keys, same in both modes: bg, bg-alt, surface, text, text-muted,
                      text-subtle, border, accent-primary, accent-secondary, link, link-hover,
                      focus-ring; each value a string reference "log.<step>"
syntax       object   10 keys: keyword, string, number, comment, function, type, constant,
                      variable, operator, punctuation; each value an accent name (bare string)
```

Counts: 28 hex values (12 Log, 16 accent), 34 reference strings (24 in `roles`, 10 in `syntax`), 8 hue words, 8 notes.

### 3.2 Log scale (`pequod.json:13-26`)

`L*` values come from `scripts/design_palette.py` output. The scale is monotonic; step sizes run from 5.0 to 11.1 `L*`.

| Step | Hex | L* |
|---|---|---|
| 50 | #F7F3EE | 96.0 |
| 100 | #EAE1D7 | 90.0 |
| 150 | #DBC9B6 | 82.0 |
| 200 | #CFAD8E | 73.0 |
| 300 | #BD8C68 | 62.1 |
| 400 | #A16E50 | 51.0 |
| 500 | #835A49 | 42.2 |
| 600 | #335260 | 33.1 |
| 700 | #163F54 | 24.8 |
| 800 | #0D2F42 | 18.0 |
| 900 | #0C222F | 12.1 |
| 950 | #0B1720 | 7.1 |

Step numbers are not uniform (150 is present, 250 and 350 are not). Hue design (`scripts/design_palette.py:155-169`): stops 50 to 500 are warm (hue 48 to 80 degrees), stops 600 to 950 are cool (hue 240 to 256 degrees).

### 3.3 Crew accents (`pequod.json:28-37`)

Contrast is WCAG 2 relative-luminance ratio, computed by me (`S/work/pequod-analysis/contrast.py`): light variant on Log 100, dark variant on Log 950.

| Name | Hue word | Light | Dark | L* light | L* dark | Contrast light | Contrast dark | Note in JSON |
|---|---|---|---|---|---|---|---|---|
| ahab | red | #A83732 | #E3877C | 40.1 | 65.8 | 4.99 | 6.93 | Obsession, fire, the wound. |
| starbuck | blue | #0082B1 | #A6DFFF | 50.8 | 86.1 | 3.37 | 12.63 | The steady mate; sea and storm. |
| queequeg | indigo | #253E82 | #838CCF | 28.0 | 60.0 | 7.77 | 5.72 | Tattoo ink; loyalty and strangeness. |
| pip | yellow | #6A4A00 | #DEC577 | 33.9 | 80.1 | 6.27 | 10.68 | Child of the sun; the lost soul. |
| ishmael | grey | #76716B | #BFBBB6 | 47.9 | 76.1 | 3.74 | 9.50 | The narrator; observer, transparent. |
| stubb | orange | #CA6435 | #FFD9BB | 54.0 | 89.1 | 3.02 | 13.73 | The pipe-smoking second mate; amber and flame. |
| tashtego | green | #177C55 | #82C4A2 | 46.0 | 74.1 | 4.01 | 8.96 | Gay Head harpooneer; woods and moss. |
| daggoo | brown | #552823 | #A17069 | 22.2 | 52.0 | 9.48 | 4.35 | African-born harpooneer; earth and mahogany. |

The `role` field holds a hue word, not a syntax role, although `README.md:249-251` and `python/src/pequod/_data.py:49` describe it as a syntax role.

### 3.4 Roles resolved to hex (`pequod.json:39-68`)

| Role | Light reference | Light hex | Dark reference | Dark hex |
|---|---|---|---|---|
| bg | log.100 | #EAE1D7 | log.950 | #0B1720 |
| bg-alt | log.50 | #F7F3EE | log.900 | #0C222F |
| surface | log.150 | #DBC9B6 | log.800 | #0D2F42 |
| text | log.800 | #0D2F42 | log.100 | #EAE1D7 |
| text-muted | log.600 | #335260 | log.300 | #BD8C68 |
| text-subtle | log.500 | #835A49 | log.400 | #A16E50 |
| border | log.200 | #CFAD8E | log.700 | #163F54 |
| accent-primary | log.700 | #163F54 | log.300 | #BD8C68 |
| accent-secondary | log.400 | #A16E50 | log.400 | #A16E50 |
| link | log.700 | #163F54 | log.300 | #BD8C68 |
| link-hover | log.400 | #A16E50 | log.400 | #A16E50 |
| focus-ring | log.400 | #A16E50 | log.300 | #BD8C68 |

Contrast facts computed from these roles: light text on bg 10.82; light text-muted on bg 6.46; light text-subtle on bg 4.61; light link on bg 8.68; dark text on bg 14.04; dark text-muted on bg 6.15; dark text-subtle on bg 4.20 (below 4.5); dark link on bg 6.15.

### 3.5 Syntax mapping (`pequod.json:70-81`)

keyword ahab; string tashtego; number pip; comment ishmael; function starbuck; type queequeg; constant stubb; variable daggoo; operator ishmael; punctuation ishmael. The mode is implied by the consumer (light or dark variant of the named accent).

### 3.6 Metadata, references, derived values, gaps

- Metadata present: `version`, `description`, `author`, `homepage`, `license`, `$schema`. No contrast claims, no CVD claims, no font names, no mode labels.
- `$schema` points at the JSON Schema meta-schema but the file is data, not a schema. No schema file exists in the repository or its history.
- References: `roles` use a dotted path into `log` ("log.100"); `syntax` uses a bare accent name. There are two reference syntaxes and no computed or derived values (no alpha, tints or state colours).
- Mode names: the keys `light` and `dark` (in `roles` and per accent). No display labels. "Below deck" and "Parchment" appear nowhere in the repository (grep of all tracked text).
- Not in the file at all: the 16 terminal ANSI colours (cyan and the six bright variants are hand-tuned in the themes), editor UI colours (143 keys per VS Code theme), cursor and selection colours, alpha values, dim variants.
- Roles compared with the themes (line numbers refer to `themes/Pequod-color-theme.json` "dark" and `themes/Pequod-light-color-theme.json` "light"):

| Item | JSON | Theme files |
|---|---|---|
| Light main surface | bg = log.100, bg-alt = log.50 | Light editor background is Log 50 (light `:8`), sidebar and activity bar Log 100 (`:51`). Specimen page fill is Log 50 (`specimen/specimen.typ:16`); `examples/plots.py:51-52` uses Log 50 and says to keep it "aligned with the website" |
| Dark text-muted | log.300 (#BD8C68) | Dark theme uses Ishmael dark #BFBBB6 (dark `:46`, `:70`, `:173`); Zed dark `text.muted` `:35` |
| Dark link | log.300 (#BD8C68) | #9DC2C5 in the dark theme (`:156`, `:301`) and Zed (`:115`, `:186`); iTerm2 Link Color is Starbuck dark |
| Light focus-ring | log.400 | Light `focusBorder` is #163f54 (log.700, light `:169`). Dark matches (log.300) |
| syntax.variable | daggoo | Both themes colour plain variables with the text colour (dark `:340` #EAE1D7, light `:340` #0D2F42); Daggoo colours parameters, properties, escapes and inline code |
| log.400 | used by accent-secondary, link-hover, focus-ring, dark text-subtle | No theme file uses #A16E50 (27 of 28 token values appear in text themes) |

### 3.7 What reads the file

Only three programs read `pequod.json`: `python/data-raw/generate_data.py` (`version`, `log`, `accents.*.light`, `.dark`, `.role`), `r/data-raw/generate_palettes.R` (same keys) and `scripts/cvd_check.py` (`accents.*.light`, `.dark`). No code reads `roles`, `syntax`, `note`, `license`, `description`, `author` or `homepage`.

## 4. Shipped targets and outputs

### 4.1 Overview

"Token" counts hex literals whose RGB part equals a value in `pequod.json` (alpha-suffixed literals included). "Hand-tuned" counts literals whose RGB part is not in `pequod.json` and is not black.

| Path | Format | Origin | Modes | Colour values |
|---|---|---|---|---|
| `themes/Pequod-color-theme.json` | VS Code colour theme; 143 `colors` keys, 30 `tokenColors` rules (65 scopes), 17 `semanticTokenColors` | Hand-written. The v0.1 to v0.2 hex swap was done by `scripts/propagate_palette.py` (per the message of 232f286); that script is not in the repository or its history | dark | 190 literals: 172 token (156 solid, 16 alpha-suffixed), 2 black or transparent, 16 hand-tuned (8 distinct values) |
| `themes/Pequod-light-color-theme.json` | same | same | light | 190 literals: 178 token (159 solid, 19 alpha-suffixed), 1 transparent, 11 hand-tuned (8 distinct values) |
| `vscode/themes/*.json` (2 files) | same | Manual copies, byte-identical to `themes/` (equal SHA-256). No sync target in the Makefile | dark, light | as above |
| `themes/Pequod.zed.json` | Zed theme family (`$schema` zed.dev v0.2.0); two themes, each with 136 style keys (39 syntax entries, 8 players, 28 terminal keys) | Hand-written | dark, light | 394 literals (197 per theme): 353 token (285 solid, 68 alpha-suffixed), 16 transparent, 25 hand-tuned (dark 10 uses of 7 values; light 15 uses of 14 values) |
| `themes/Pequod.itermcolors` | Apple plist, 26 colour entries as sRGB floats to 4 decimals, with alpha component | Hand-written; comments name the derivation | dark only | 18 of 26 equal token values after rounding; 8 hand-tuned (Cursor Guide #7A9B9C at alpha 0.25; ANSI 6 and 9 to 14). Header comment holds 2 hex literals |
| `themes/terminals/Pequod.ghostty` | `palette = N=RRGGBB`, bare hex | Hand-written | dark only | 24 literals: 17 token, 7 hand-tuned |
| `themes/terminals/Pequod.alacritty.toml` | TOML sections | Hand-written | dark only | 24: 17 token, 7 hand-tuned |
| `themes/terminals/Pequod.kitty.conf` | `color0` to `color15`, tab bar, `url_color` | Hand-written | dark only | 29: 21 token, 8 hand-tuned (`url_color` adds a second #9DC2C5) |
| `themes/terminals/Pequod.wezterm.lua` | Lua table with `ansi`, `brights`, `tab_bar` | Hand-written | dark only | 38: 31 token, 7 hand-tuned |
| `themes/terminals/Pequod.tmux.conf` | tmux `set -g` style strings; no ANSI table | Hand-written | dark only | 21: all token (8 distinct) |
| `themes/terminals/Pequod.windowsterminal.json` | scheme object (`purple` for magenta, `_comment_N` keys) | Hand-written | dark only | 20: 13 token, 7 hand-tuned |
| `themes/terminals/README.md` | install paths | Hand-written | | |
| `python/src/pequod/_data.py` | Python module | Generated by `python/data-raw/generate_data.py` (rerun gives identical bytes) | both accents, one Log scale | 28 literals, all token |
| `r/R/palettes-data.R` | R source | Generated by `r/data-raw/generate_palettes.R` (rerun gives identical bytes) | both accents, one Log scale | 28 literals, all token |
| `r/man/*.Rd` | Rd | Generated by roxygen2 7.3.3 from `r/R/*.R` | | none |
| `tailwind/index.js` | CommonJS module | Hand-typed. Header (`:30-31`) says "Generated from pequod.json ... node data-raw/generate.mjs"; that file is not in the repository or its history | both accents, one Log scale | 36 literals, all token |
| `tailwind/index.d.ts` | TypeScript declarations | Hand-typed; Log values are literal string types | | 12 literals, all token |
| `specimen/specimen.typ` | Typst source | Hand-typed arrays and inline `rgb("#...")` calls; does not read `pequod.json` | light page with dark code block; accents light and dark | 58 literals (28 distinct), all token |
| `specimen/specimen.pdf` | PDF, 1 page A4, 70,609 bytes, Typst 0.14.2, created 2026-04-30 10:44 local time | Rendered from `specimen.typ` | | 28 distinct hex labels, all token |
| `examples/plots.py` | Python, 461 lines, 8 plot functions | Hand-written; colours come from `pequod.LOG`, `pequod.CREW_LIGHT`, `pequod.CREW_DARK`; no hex literal | dark and light plots | 0 literals |
| `examples/01_*.png` to `08_*.png` | PNG, 1.6 to 2.0 thousand pixels wide | Rendered by `plots.py`, regenerated in 232f286 | | `04_swatches.png` contains all 28 v0.2 token colours as exact pixels and none of the v0.1 values |
| `cover.jpg` | JPEG 1200x800, 296,447 bytes | Illustration (ship silhouette against a moon over a teal sea, "PEQUOD" lettering). Committed once in 7be10e0; source not in the repository | | Not token values (dominant #050E17, #0B1925, cream #FCF9EA). README alt text calls it "Pequod swatches" |
| `vscode/icon.png` | PNG 128x128, 599 bytes | Committed once (1b23c2a), never regenerated | | Pixel histogram shows v0.1 colours: background #13181F and the eight v0.1 light accents (#B5534A, #527C98, #4A4E8C, #A8812B, #6E6E6B, #B5683A, #507352, #7A5440). Shipped as the icon of both marketplace listings |
| `scripts/cvd_check.py`, `scripts/design_palette.py` | Python | Hand-written | | see section 6 |

### 4.2 Terminal ANSI mapping shared by the terminal presets, the VS Code dark `terminal.*` block and Zed dark

| ANSI | Hex | Source |
|---|---|---|
| foreground, background | #EAE1D7, #0B1720 | log.100, log.950 |
| cursor, cursor text | #BD8C68, #0B1720 | log.300, log.950 |
| selection background | #0D2F42 | log.800 |
| 0 black | #0C222F | log.900 |
| 1 red | #E3877C | ahab dark |
| 2 green | #82C4A2 | tashtego dark |
| 3 yellow | #DEC577 | pip dark |
| 4 blue | #A6DFFF | starbuck dark |
| 5 magenta | #838CCF | queequeg dark |
| 6 cyan | #9DC2C5 | hand-tuned |
| 7 white | #EAE1D7 | log.100 |
| 8 bright black | #335260 | log.600 |
| 9 to 14 | #E99C93, #AFCCA6, #E8CB8C, #A0C2D4, #AAADDA, #BCD9DB | hand-tuned |
| 15 bright white | #F7F3EE | log.50 |

- iTerm2 differs for ANSI 9 to 13: #F0938B, #A8CFAA, #EBCC82, #A0C3D7, #AEB1DF. ANSI 14 is the same (#BCD9DB).
- Only five crew accents (Ahab, Tashtego, Pip, Starbuck, Queequeg) appear on ANSI 1 to 5. Ishmael, Stubb and Daggoo have no ANSI slot.
- The hand-tuned values descend from v0.1 and were not changed by the v0.2 rewrite. Evidence: `git diff 546b9bf 232f286 -- themes/terminals/Pequod.alacritty.toml` shows cyan and ANSI 9 to 14 untouched while everything else changed; the iTerm2 comments (`:173`, `:255`) derive cyan from "Softsage 3 (Log 700 brighter)", and v0.1 Log 700 (#527275) has hue 206.8 against 205.7 for #9DC2C5; the light theme's #7A9B9E has hue 206.5. In CIELAB, ANSI 12 (#A0C2D4, `L*` 76.6) is darker than ANSI 4 (#A6DFFF, `L*` 86.1).
- Light ANSI values exist only inside the VS Code light theme and Zed light theme: black log.800, red to magenta the light accents of Ahab, Tashtego, Pip, Starbuck, Queequeg, cyan log.700, white log.500, bright black log.600, bright colours hand-tuned (#C56860, #678B6A, #C49A3E, #6893AE, #6064A3, #6A8C8F, #A89F8D), and six hand-tuned Zed `dim_*` values. Zed dark `dim_*` values reuse the light accents (red to magenta) and Log steps.
- The other hand-tuned colour in the dark theme is #E8DDC7 (6 uses: `themes/Pequod-color-theme.json:55,56,79,84,95,143`).

### 4.3 Format details a generator would need

- Alpha is written by appending two hex digits to a token hex (VS Code and Zed; suffixes seen: 00, 20, 25, 30, 40, 50, 60, 80).
- Ghostty uses bare `RRGGBB`. iTerm2 uses float components to 4 decimals and an `Alpha Component`. Windows Terminal names magenta `purple`. tmux has styles, not an ANSI table. Mixed-case hex occurs in the themes (`#163f54`, `#177c55`, `#a17069`), consistent with a find-and-replace swap.
- The VS Code and Zed files are strict JSON without comments. The Windows Terminal file carries `_comment_1` to `_comment_4` keys.

### 4.4 Packages

vscode/ (extension `tiagojct.pequod-color-theme`):

- `vscode/package.json`: name `pequod-color-theme`, displayName "Pequod Palette" (renamed in e53dfe3 because bare "Pequod" clashed on the Marketplace; slug renamed in a4c5ca2), version 0.2.0, engines `vscode ^1.70.0`, category Themes, `galleryBanner` `#0B1720` dark, `repository.directory` "vscode".
- Contributes two themes: label "Pequod" (`uiTheme` vs-dark, `./themes/Pequod-color-theme.json`) and "Pequod Light" (`uiTheme` vs, `./themes/Pequod-light-color-theme.json`).
- Other files: README.md, CHANGELOG.md, LICENSE, `.vscodeignore`, `icon.png`, `themes/` copies.
- Build `make vsix`; publish `make vsce-publish`. No CI.

r/ (CRAN package `pequod`):

- Exports (12, `r/NAMESPACE:3-14`): `palette_pequod`, `pequod_crew`, `pequod_crew_dark`, `pequod_crew_light`, `pequod_log`, `pequod_preview`, `scale_color_pequod_c`, `scale_color_pequod_d`, `scale_colour_pequod_c`, `scale_colour_pequod_d`, `scale_fill_pequod_c`, `scale_fill_pequod_d`.
- Data objects (defined as R code in the generated `R/palettes-data.R`, documented as datasets): `pequod_log` (named character, 12, names "Log 50" to "Log 950"), `pequod_crew_light` and `pequod_crew_dark` (named character, 8), `pequod_crew` (list of light, dark, roles).
- Functions: `palette_pequod(name, n, type, reverse, direction)` (`r/R/palettes.R:34-70`); `pequod_preview(palette, labels)` in base graphics; discrete scales wrap `ggplot2::discrete_scale` and interpolate with `colorRampPalette` when more colours are requested than exist (`r/R/scales.R:91-101`); continuous scales wrap `scale_*_gradientn`.
- Hand-written lookup `.pequod_palette_map()` (`r/R/palettes.R:73-85`): `log-warm` is `pequod_log[1:6]`, `log-cool` is `[7:12]`, and `syntax` is the light crew accents in the fixed order Ahab, Tashtego, Pip, Ishmael, Starbuck, Queequeg, Stubb, Daggoo. The JSON `syntax` block is not read.
- Generation: `r/data-raw/generate_palettes.R` (needs jsonlite, run from `r/`, reads `../pequod.json`) writes `R/palettes-data.R` including the roxygen prose. `make r-data`. `data-raw` is excluded by `r/.Rbuildignore`.
- DESCRIPTION: Depends R (>= 4.0.0); Imports ggplot2 (>= 3.3.0), grDevices, graphics, stats; Suggests testthat (>= 3.0.0), jsonlite (jsonlite is used only by the generator); testthat edition 3; ORCID in `Authors@R` (`r/DESCRIPTION:8`).

python/ (PyPI package `pequod`):

- Layout `python/src/pequod/`: `__init__.py`, `_data.py` (generated), `_palettes.py`, `_mpl.py`. `__all__` has 10 names: `__version__`, `LOG`, `CREW_LIGHT`, `CREW_DARK`, `CREW`, `CREW_ROLES`, `PALETTES`, `palette`, `to_cmap`, `register_cmaps`. `to_cmap` and `register_cmaps` are loaded lazily so `import pequod` does not need matplotlib.
- `LOG` keys are "Log 50" to "Log 950"; crew keys are capitalised names. `PALETTES` holds tuples for `log`, `log-warm` (first 6), `log-cool` (last 6), `crew` (light), `crew-dark`, `syntax` (8 light accents in fixed order).
- `palette(name, n, kind, reverse)` interpolates in gamma-encoded sRGB with Python `round()` (`_palettes.py:76-94`), although the helper docstring says "Linear-RGB".
- Build: hatchling, `requires-python >=3.9`, extras `plot` (matplotlib>=3.5) and `test` (pytest>=7.0), sdist includes `src/pequod`, README, LICENSE and `tests`.
- Generation: `python/data-raw/generate_data.py` (standard library only) reads `../pequod.json` and writes `_data.py`. The `syntax` palette and the 6/6 warm-cool split are hard-coded in the generator template (`generate_data.py:75-93`), not read from the JSON.
- The package ships no copy of `pequod.json`.

tailwind/ (npm package `pequod-tailwind`):

- `index.js` exports `log` (frozen, keys 50 to 950), `crew` (8 members, each `{DEFAULT, light, dark}`, `DEFAULT` equal to light) and `colors` (`{log, ...crew}`), plus `module.exports.default`.
- `package.json`: exports `.`, `./colors`, `./package.json`; `files` index.js, index.d.ts, README.md, LICENSE; optional peer dependency tailwindcss >=3.0.0; engines node >=14; `repository.directory` "tailwind". npm shows 5 files, 10,553 bytes unpacked.
- No CSS output and no use of the Tailwind plugin API. `tailwind/README.md:60` suggests `@import "pequod-tailwind/index.js" layer(theme);` for v4, which looks non-functional (a CSS import of a JavaScript file); unverified.

### 4.5 Scripts

`scripts/cvd_check.py` and `scripts/design_palette.py` are described in section 6. `README.md:107-108` lists only `cvd_check.py`; `design_palette.py` is documented only in `CHANGELOG.md:111-114`.

## 5. Published packages and listings built from this repository

| Registry | Name | Version in repo | Build and publish | Metadata that names the repository |
|---|---|---|---|---|
| PyPI | pequod | 0.2.0 (`python/pyproject.toml:7`) | `make py-build` (`python3 -m build`, hatchling), `make py-publish` (twine upload). PyPI holds a wheel only for 0.2.0. Credentials are not in the repository | `python/pyproject.toml:41-44`: Homepage (tiagojct.eu), Repository, Bug Tracker, Changelog (`.../blob/main/CHANGELOG.md`); `python/README.md:7`, `:28`; `python/src/pequod/__init__.py:21-22`; `python/LICENSE:6-7` |
| npm | pequod-tailwind | 0.2.0 (`tailwind/package.json:3`) | `make tw-test`, `make tw-pack`, `make tw-publish` (`npm publish`, run inside `tailwind/`; npm records gitHead) | `tailwind/package.json:40` homepage, `:41-45` `repository.url` and `directory`, `:46-48` bugs; `tailwind/README.md:9`, `:123`, `:136`; `tailwind/LICENSE:6-7` |
| CRAN | pequod | 0.2.0 (`r/DESCRIPTION:4`) | `make r-check` builds and checks; submission is by CRAN's web form (no target). `r/cran-comments.md` holds the notes. Two review rounds preceded 0.1.1 (Ligges, 2026-04-24; Altmann, before 2026-04-28) | `r/DESCRIPTION:18-19` URL (project page and GitHub), `:20` BugReports; `r/R/pequod-package.R:10-13` and `r/man/pequod-package.Rd:20-27`; `r/README.md:8`, `:17`, `:20`; root `README.md:99`, `:231` |
| VS Code Marketplace | tiagojct.pequod-color-theme | 0.2.0 (`vscode/package.json:5`) | `make vsix`, `make vsce-publish` (needs a publisher personal access token) | `vscode/package.json:29` homepage, `:30-34` repository url and directory, `:35-37` bugs. The listing exposes `repository.url` as its Source and Get-started links |
| Open VSX | tiagojct/pequod-color-theme | 0.2.0 | Same package. No Makefile target and no documented procedure (unverified how it was published). The listing carries a signature | Same manifest fields, plus `vscode/README.md:8` (image URL `https://raw.githubusercontent.com/tiagojct/pequod/main/cover.jpg`), `:42`, `:62`; `vscode/CHANGELOG.md:6`, `:36`, `:54`, `:57`, `:59`; `vscode/LICENSE:6-7` |

Not published to any registry: the Zed theme and the terminal presets are installed by copying files. A GitHub code search found no pequod entry in `zed-industries/extensions` or in `mbadolato/iTerm2-Color-Schemes` (both searches returned 0; code search may be incomplete).

What would break or need editing if the source moved:

- Registry metadata is fixed per published version. PyPI, npm, CRAN, Marketplace and Open VSX keep showing the old repository, bug and changelog URLs until a new version is published from the new location. CRAN URL and BugReports changes need a new submission (CRAN practice, not tested here).
- `r/DESCRIPTION:18-20`, `python/pyproject.toml:41-44`, `tailwind/package.json:40-48` and `vscode/package.json:29-37` need the new repository URL. Tailwind and VS Code also need a new `repository.directory` value if the package sits at a different path.
- Install instructions that name the repository and subdirectory: `remotes::install_github("tiagojct/pequod", subdir = "r")` (`README.md:99`, `:231`, `r/README.md:17`, `:20`, `CHANGELOG.md:158`) and `pip install "git+https://github.com/tiagojct/pequod.git#subdirectory=python"` (`python/README.md:28`).
- `vscode/README.md:8` embeds `raw.githubusercontent.com/tiagojct/pequod/main/cover.jpg`. It breaks if the file or path changes, and it is the listing image on both marketplaces.
- The repository path appears on 39 lines in 19 files: `CHANGELOG.md`, `README.md`, `python/LICENSE`, `python/README.md`, `python/pyproject.toml`, `python/src/pequod/__init__.py`, `r/DESCRIPTION`, `r/R/pequod-package.R`, `r/README.md`, `r/cran-comments.md`, `r/man/pequod-package.Rd`, `specimen/specimen.typ`, `tailwind/LICENSE`, `tailwind/README.md`, `tailwind/package.json`, `vscode/CHANGELOG.md`, `vscode/LICENSE`, `vscode/README.md`, `vscode/package.json`. The project page https://tiagojct.eu/projects/pequod/ appears on 23 lines in 22 files, including every terminal preset header and the CRAN URL field.
- The identities that must not change: PyPI `pequod`, CRAN `pequod`, npm `pequod-tailwind`, extension ID `tiagojct.pequod-color-theme`, and the public API strings ("Log 50", crew names, palette names, function names).
- Generators locate the token file at the repository root: `python/data-raw/generate_data.py:16-18`, `r/data-raw/generate_palettes.R:14-21` (the error text asks whether the R package is "still nested inside the pequod repo"), `scripts/cvd_check.py:165-166`. The Makefile uses `cd r`, `cd python`, `cd tailwind`, `cd vscode`.
- CRAN flagged a relative link out of the package in 0.1.0 (`r/cran-comments.md:70-79`). `r/README.md` must keep only absolute links.
- Tags `v0.1.0` and `v0.2.0` carry no family prefix. The repository has no releases, issues, pull requests, webhooks, Actions secrets or Pages, so nothing else on GitHub is attached to it except stars (4), topics (17), the description and the homepage field.
- Author identity fields (name, email address, ORCID; not reproduced here) sit in `r/DESCRIPTION:5-8`, `python/pyproject.toml:13-15`, `tailwind/package.json:38` and `README.md:381`.
- Redirect behaviour of GitHub for `raw.githubusercontent.com` after a rename or transfer: unverified.

## 6. Contrast and CVD tooling

### 6.1 `scripts/cvd_check.py` (195 lines, needs NumPy)

- Reads `accents.<name>.light` and `.dark` from `pequod.json`. Simulates each accent at severity 1.0 for protanopia, deuteranopia and tritanopia.
- Method (`:58-131`): sRGB decode, RGB to LMS matrix (17.8824, 43.5161, 4.11935 ...), a per-condition dichromat projection matrix (`:69-91`), LMS back to linear RGB by matrix inverse, clip to [0,1], sRGB encode and round to 8-bit hex, then CIELAB (D65, white 0.95047, 1.0, 1.08883) and CIE76 delta E (Euclidean distance, `:129-130`). The docstring credits Vienot, Brettel and Mollon (1999). The tritanopia matrix is the one commonly copied in daltonisation code; whether the 1999 paper defines it is unverified.
- Pairs checked: the 28 pairs among the eight accents, separately for the light set and the dark set, under each of the three conditions (168 pair evaluations). Not checked: normal vision, accent against surface, the Log scale, alpha blends, roles, WCAG contrast.
- Thresholds (`:10-14`, `:154-161`): pairs below 15 are listed; below 10 is labelled "confusable", 10 to below 15 "close". The script always exits 0 when the file is readable, so it cannot gate CI as it stands.
- Run: the default `python3` (3.9.6) lacks NumPy (`ModuleNotFoundError: No module named 'numpy'`). It ran in a scratch venv (NumPy 2.5.3), exit 0, output saved at `S/work/pequod-analysis/cvd_check_output.txt`.

| Set | Simulation | Closest pair (delta E) | Other pairs below 15 |
|---|---|---|---|
| light | protanopia | Ishmael and Tashtego 15.1 | none |
| light | deuteranopia | Ishmael and Tashtego 8.0 (confusable) | Ahab and Pip 11.8 |
| light | tritanopia | Pip and Daggoo 13.3 | none |
| dark | protanopia | Stubb and Tashtego 11.8 | Ishmael and Tashtego 12.3; Ahab and Daggoo 12.6 |
| dark | deuteranopia | Ishmael and Tashtego 6.8 (confusable) | none |
| dark | tritanopia | Ahab and Pip 10.2 | Queequeg and Tashtego 12.0; Pip and Stubb 12.3 |

The six worst pairs and their values match the table at `README.md:288-294` exactly. The statement at `README.md:306` that every other pair clears 10 is true (the next lowest is 10.2).

### 6.2 `scripts/design_palette.py` (308 lines, needs NumPy)

- Holds the design specification: `LOG_DESIGN` (12 rows of `L*`, chroma, hue, `:155-169`) and `CREW_DESIGN` (8 crew, light and dark, `:177-211`). It converts LCh to hex through CIELAB, XYZ and linear sRGB, clips out-of-gamut values silently apart from a stderr warning, and prints per-stop `L*`, step sizes, monotonicity, per-accent `L*`, chroma and hue, and for each of normal vision and the three CVD conditions the worst pair with a verdict: OK at 10 or above, WARN from 6 to below 10, FAIL below 6 (`:276`). It ends by printing JSON fragments for `log` and `accents` (no `note`, no `roles`, no `syntax`). It does not write any file.
- Run: exit 0. Stderr: `starbuck.light` (L 50, C 38, h 245) and `stubb.dark` (L 90, C 24, h 60) are out of gamut and were clipped. Output saved at `S/work/pequod-analysis/design_palette_output.txt`.
- The printed fragments equal `pequod.json` exactly for all 12 Log stops and all 8 accents (light, dark, role). The LCh table is therefore a second source of all 28 colours, and two of its 28 entries cannot be recovered from the hex because of clipping.
- Verdicts: light normal Ahab and Stubb 22.5 OK; protan Tashtego and Ishmael 15.1 OK; deutan Tashtego and Ishmael 8.0 WARN; tritan Daggoo and Pip 13.3 OK. Dark normal Ishmael and Stubb 22.8 OK; protan Tashtego and Stubb 11.8 OK; deutan Tashtego and Ishmael 6.8 WARN; tritan Ahab and Pip 10.2 OK. Log: monotonic, steps 5.0 to 11.1.
- Internal inconsistencies in thresholds: docstring `:15` says every CVD pair at 12 or above; comment `:187` says 10 for deutan and protan; code `:276` uses 10 and 6; comment `:188-191` allows 7 for Pip and Stubb under tritan. Docstring `:14` and `:16` say light `L*` near 48 and dark near 72, while comments `:181-186` and the table give wider spans (actual: light 22.2 to 54.0, dark 52.0 to 89.1; `CHANGELOG.md:64` says 58 to 90 for dark).

### 6.3 Contrast ratios

No script in the repository computes WCAG contrast. I computed the ratios in `README.md:266-273` with `S/work/pequod-analysis/contrast.py`:

| README row | README | Computed |
|---|---|---|
| Log 800 on Log 100 | 10.8 | 10.82 |
| Log 700 on Log 50 | 8.5 | 10.15 (8.68 on Log 100) |
| Log 400 on Log 50 | 3.9 | 3.91 |
| Log 100 on Log 950 | 14.0 | 14.04 |
| Accent light on Log 100 | 3.0 to 9.5 | 3.02 to 9.48 |
| Accent dark on Log 950 | 3.6 to 13.6 | 4.35 to 13.73 |

`CHANGELOG.md:87-90` per-accent values (Daggoo 9.5, Queequeg 7.8, Pip 6.3, Ahab 5.0) match (9.48, 7.77, 6.27, 4.99). Light accents at or above 4.5 on Log 100: Ahab, Queequeg, Pip, Daggoo (four), as stated. Dark accents below 4.5 on Log 950: Daggoo only (4.35), so "every accent except Daggoo" is right but its quoted value 3.6 is not. `vscode/README.md:35-36` and `tailwind/README.md:114-115` quote 10.5 (Log 800 on Log 50) and 16.2 (Log 100 on Log 950); those are the v0.1 values (10.51, 16.24). The v0.2 values are 12.65 and 14.04.

## 7. Tests

| Suite | Files | Count | Run command | Result |
|---|---|---|---|---|
| Python | `python/tests/test_palettes.py` (15), `python/tests/test_mpl.py` (7) | 22 | `cd python && PYTHONPATH=src python -m pytest` | 22 passed in 2.11 s (Python 3.12.14, pytest 9.1.1, matplotlib 3.11.2, NumPy 2.5.3). Without matplotlib: 15 passed, 1 skipped (the `test_mpl.py` module skips through `importorskip`) |
| R | `r/tests/testthat.R`, `r/tests/testthat/test-palettes.R` | 10 test blocks, 22 expectations | `Rscript -e 'testthat::test_local("r")'` | 0 failures, 0 skips, 0 warnings, 0 errors (R 4.6.1, testthat 3.3.2, ggplot2 4.0.3). `R CMD check` skipped as instructed |
| Tailwind | `tailwind/test.js` | 6 | `cd tailwind && node --test test.js` (also `npm test`) | 6 passed (Node 24.21.0) |

Observations:

- `make py-test` (`cd python && python3 -m pytest`) fails on a fresh clone with `ModuleNotFoundError: No module named 'pequod'`. The tests import the installed package and `pyproject.toml` sets no `pythonpath`. An editable install or `PYTHONPATH=src` is needed.
- No suite reads `pequod.json`. Value assertions are literal strings (`python/tests/test_palettes.py:70`, `:77-78`; `tailwind/test.js:49-56`, whose title says "match the canonical pequod.json" but which compares to constants); the R tests check shapes only. Drift between the JSON and a package is prevented only by the Python and R generators.
- Generator reruns in a second copy (`S/work/pequod-gen`) reproduce `python/src/pequod/_data.py` and `r/R/palettes-data.R` byte for byte (empty `git diff`).
- Cross-language check of continuous ramps: Python `palette("log", n=100, kind="continuous")` and R `palette_pequod("log", n = 100, type = "continuous")` agree on only 27 of 100 entries; the largest channel difference is 1 (rounding). For `n = 1`, Python returns the middle stop (#835A49) and R the first stop (#F7F3EE).
- `examples/plots.py` ran without error in the copy (matplotlib 3.11.2). Atkinson Hyperlegible Next, JetBrains Mono and SF Mono are not installed on this machine, so matplotlib fell back and the PNGs were not compared with the committed ones.
- `typst` is not installed, so `make specimen` was not run.

## 8. Claims in README, CHANGELOG and roadmap that matter for the migration

### 8.1 Planned items and documented design rules

- Roadmap (`README.md:338-352`): generators for the editor and terminal themes; light presets for the terminals and for iTerm2 (`README.md:149`, `themes/terminals/README.md:21`; `CHANGELOG.md:229` "No iTerm2 light preset yet"); Vim and Neovim colourscheme with Lush; a first-class Tailwind v4 plugin; Sublime Text, Helix, Emacs at lower priority.
- Design rules: warm paper to deep ink, low saturation, warm backgrounds, accents in one pigment register, read-first rather than glance-first, "semantics, not decoration" (`README.md:20-27`). Log scale: strictly monotonic `L*`, even steps (`CHANGELOG.md:11-13`, `:20-25`). Accents laddered in `L*` (light 22 to 54) and hue-tuned (Ahab about 32 degrees, Tashtego about 160 degrees, Pip at `L*` 34) so that confusable pairs separate under CVD (`CHANGELOG.md:42-49`). Usage guidance: do not rely on colour alone for Ishmael against Tashtego under deuteranopia; comments are italic (`README.md:303-306`).
- Mode labels in use: `light` and `dark` keys in the JSON; theme names "Pequod" (VS Code dark, no "Dark" suffix), "Pequod Light" (VS Code), "Pequod Dark" and "Pequod Light" (Zed); "Pequod" for every terminal preset and the iTerm2 preset. "Below deck" and "Parchment" are not present. The word "parchment" occurs only as an informal name for Log 150 (`examples/plots.py:56`, `examples/README.md:39`), and "deck" once in a tmux comment (`themes/terminals/Pequod.tmux.conf:12`).
- Fonts: Atkinson Hyperlegible Next for titles and prose, JetBrains Mono for code and ticks (`README.md:61-62`, `:333-336`; `specimen/specimen.typ:4-6`, `:20`, `:78`, `:97`, `:157`, `:203`, `:225`; `examples/plots.py:64-71`). They replaced Geist and Geist Mono in 543b62a; `CHANGELOG.md:151` still says Geist. `specimen/specimen.typ:4-6` says "Google Fonts, OFL" and that the website uses the same fonts. Fonts are not bundled. `plots.py` fallbacks: Inter, Helvetica Neue, Arial, DejaVu Sans; SF Mono, DejaVu Sans Mono.
- Other repositories and sites: only https://tiagojct.eu/projects/pequod/ (23 lines in 22 files). The message of 232f286 refers to a "project page mirror" that was updated by the propagation script. `examples/plots.py:51` says its surface constants are kept "aligned with the website". `README.md:29-31` calls this repository the canonical source and the project page the narrative. glauca, try-works, ambergris, gam and ensigns are not mentioned anywhere. Inspirations named: Flexoki, Solarized, Tokyo Night, Nord (`README.md:354-367`).
- DOIs: the only DOI in the repository is the Vienot et al. reference (`scripts/cvd_check.py:24`). CRAN assigns 10.32614/CRAN.package.pequod (on the CRAN page, not in the repository). ORCID in `r/DESCRIPTION:8`. No Zenodo DOI.

### 8.2 Claims checked against the repository

| Claim | Location | Status |
|---|---|---|
| R package, Python package, Typst specimen and CVD script "all regenerate from pequod.json" | `README.md:256-260`, also `:340-343` | R and Python: true (reruns identical). CVD script: reads the JSON at run time. Specimen: false, hex is typed in `specimen.typ` and `make specimen` only compiles it |
| Terminal presets and editor themes are produced by hand | `README.md:258-260` | True |
| All theme files, Tailwind plugin, specimen and generated data "re-emitted from the new tokens"; "No hand-edited file should still reference a v0.1 hex" | `CHANGELOG.md:79-83` | Exact v0.1 hex values remain in `vscode/icon.png` (pixels), and in README badge colours `2C3E50` (lines 7, 8, 10) and `C4A57B` (line 12), which are v0.1 Log 800 and Log 300 typed without `#`. Hand-tuned cyan and ANSI brights derived from v0.1 were not touched (section 4.2). No other file carries a v0.1 hex literal outside the CHANGELOG tables |
| Tailwind file is generated by `node data-raw/generate.mjs` | `tailwind/index.js:30-31` | No such file in the repository or history |
| Palette files "updated by running scripts/propagate_palette.py" | message of 232f286 | Script not in the repository or history |
| GitHub Actions CI green at v0.2.0 | `r/cran-comments.md:57-58` | No CI exists (section 1.1) |
| "Alpha (0.1.0)" | `README.md:35` | Stale |
| "dark-mode accents clear 4.5 : 1 comfortably" | `README.md:24-25` | Contradicted at `:278-279` and by computation (Daggoo dark 4.35) |
| Contrast table | `README.md:266-273` | Two rows wrong (section 6.3) |
| CVD table and the "every other pair" sentence | `README.md:288-306` | Correct (section 6.1) |
| Accessibility numbers and CVD pairs in the VS Code and Tailwind READMEs (10.5, 16.2, "five of eight", Pip, Stubb, Starbuck, Pip and Stubb under tritanopia, Ahab and Daggoo under protanopia) | `vscode/README.md:35-45`, `tailwind/README.md:114-123` | v0.1 text, unchanged by 232f286 apart from hex tables. "All eight dark-mode accents clear WCAG-AA" is false for Daggoo |
| "R package - install from GitHub or CRAN (review pending)" | `tailwind/README.md:133` | Stale; CRAN 0.1.1 was published on 2026-04-29 |
| "All six files map the same ANSI palette", "eight crew accents on ANSI 1 to 6" | `themes/terminals/README.md:3-6` | tmux has no ANSI table; only five crew accents sit on ANSI 1 to 5; iTerm2 bright values differ |
| "Bright variants brightened by about 12-18% L*" | `themes/Pequod.itermcolors:9` | Terminal presets: red +5.9, green +5.0, yellow +2.7, blue -9.5, magenta +11.9, cyan +8.8 `L*` against the normal colour |
| `log-warm` is Log 50 to 400, `log-cool` Log 500 to 950 | `python/README.md:50-51`, `r/README.md:64-65` | The warm-cool hinge is between Log 500 (hue 48) and Log 600 (hue 240) (`scripts/design_palette.py:163-164`), so `log-cool` starts one stop early. `r/R/palettes-data.R:8-9`, the generator text (`r/data-raw/generate_palettes.R:67-68`) and `r/man/pequod_log.Rd:16-17` still say "Log 500 (warm taupe) and Log 700 (cool sage)", which is v0.1 wording |
| `role` is a "recommended syntax role" | `README.md:249-251`, `python/src/pequod/_data.py:49` | The values are hue words |
| "The script has no dependencies beyond NumPy" | `README.md:314` | True, but NumPy is absent on a default Python |
| "~13 targets" | `README.md:109` | 14 listed by `make help` |
| plots.py "under 350 lines" | `examples/README.md:12` | 461 lines |
| Cover shows swatches | `README.md:14`, `vscode/README.md:8` (alt text) | It is an illustration |
| CC-BY covers "any Markdown under docs/" | `LICENSE-CC-BY-4.0:5-6` | No `docs/` directory |
| Specimen and JSON notes | `specimen/specimen.typ:46-53` vs `pequod.json:29-36` | Two different one-line descriptions per accent (usage in the specimen, character in the JSON) |

## 9. Conflicts with the migration plan

### 9.1 "Pequod keeps its name, crew accents and identity. Only corrections."

- The 16 accent values and 12 Log values are unchanged since the v0.2.0 rewrite, and `scripts/design_palette.py` regenerates them exactly. No conflict for the accents themselves.
- Corrections that would change shipped colours: the 28 hand-tuned values (section 9.3) and the icon. Existing VS Code, Open VSX, Zed and terminal users would see changed colours if these become derived or are replaced. The plan must decide whether they are identity (add as tokens) or defects (derive).
- Corrections that change documentation or metadata only: `__version__` 0.1.0, the three stale READMEs, the contrast numbers, the "-alpha" label, the "cool sage" wording.
- Roles that disagree with the themes (section 3.6) are a correction to the token file or to the themes; it needs a decision on which is authoritative (light bg, dark text-muted, dark link, light focus-ring, syntax.variable).
- Names are fixed by registries (section 5). "Pequod" is shared with an unrelated CRAN package archived in 2016, which CRAN accepted (`r/cran-comments.md:90-103`); the Marketplace already forced "Pequod Palette".

### 9.2 "Every family has exactly two modes, dark and light, with an optional secondary label."

- The JSON has exactly two modes (`light`, `dark`) and no labels. The Log scale is one scale shared by both modes; `roles` map each mode onto it. In packages the accents are split by mode and the Log scale is not.
- Labels "Below deck" and "Parchment" do not exist in the repository, so they are additions, not renames. Current display names are asymmetric ("Pequod" for dark in VS Code, "Pequod Dark" in Zed).
- Terminals (6 files) and iTerm2 exist for dark only. A light output for them would be new. A light ANSI mapping already exists in the VS Code light and Zed light themes, with hand-tuned brights and dims.
- The light mode has no single agreed background (section 3.6: JSON Log 100; editor themes, specimen and examples Log 50; README contrast table Log 100).

### 9.3 "No colour value is typed anywhere except in a family's palette block; generators read tokens."

Hex literals typed outside `pequod.json` in tracked text files (`S/work/pequod-analysis/hexscan.py`, grouped by an inline script; 26 files, 1,581 literals):

| Category | Files | Literals | Token | Hand-tuned | Other |
|---|---|---|---|---|---|
| A. Produced by a committed generator (identical on rerun) | `python/src/pequod/_data.py` (28), `r/R/palettes-data.R` (28) | 56 | 56 | 0 | 0 |
| B. Hand-typed sources with no generator | `tailwind/index.js` (36), `tailwind/index.d.ts` (12), `specimen/specimen.typ` (58) | 106 | 106 | 0 | 0 |
| C1. VS Code themes | `themes/Pequod-color-theme.json` (190), `themes/Pequod-light-color-theme.json` (190) | 380 | 350 | 27 | 3 black or transparent |
| C2. VS Code copies | `vscode/themes/*.json` (2 x 190) | 380 | 350 | 27 | 3 |
| C3. Zed | `themes/Pequod.zed.json` | 394 | 353 | 25 | 16 |
| C4. iTerm2 header comment | `themes/Pequod.itermcolors` | 2 | 2 | 0 | 0 |
| C5. Terminal presets | six files in `themes/terminals/` (24, 24, 29, 21, 38, 20) | 156 | 120 | 36 | 0 |
| D. Documentation | `CHANGELOG.md` (56), `vscode/README.md` (16), `tailwind/README.md` (7), `vscode/CHANGELOG.md` (4) | 83 | 55 | 0 | 28 v0.1 values in CHANGELOG history tables |
| E. Docstrings and tests | `python/src/pequod/__init__.py` (6), `python/src/pequod/_palettes.py` (6), `python/tests/test_palettes.py` (5), `tailwind/test.js` (6) | 23 | 23 | 0 | 0 |
| F. Package metadata | `vscode/package.json` (`galleryBanner`) | 1 | 1 | 0 | 0 |
| Total | 26 files | 1,581 | 1,416 | 115 | 50 |

Other typed or baked-in colours not counted above:

- `themes/Pequod.itermcolors`: 26 colours as floats (18 token, 8 hand-tuned).
- README badge colours: `2C3E50` three times and `C4A57B` once (v0.1 values).
- `scripts/design_palette.py:155-211`: 28 LCh triples that generate all 28 tokens.
- Rasters and PDF: `cover.jpg`, `vscode/icon.png` (v0.1 colours), eight example PNGs (v0.2), `specimen/specimen.pdf` (v0.2).

The 28 distinct hand-tuned RGB values (22 in text themes, 6 more in iTerm2 only):

- Dark side: #9DC2C5, #E99C93, #AFCCA6, #E8CB8C, #A0C2D4, #AAADDA, #BCD9DB, #E8DDC7.
- Light side: #7A9B9E, #C56860, #678B6A, #C49A3E, #6893AE, #6064A3, #6A8C8F, #A89F8D.
- Zed light dim: #8A3F38, #3B5840, #7F6220, #3E5E74, #383B6B, #3F5759.
- iTerm2 only: #7A9B9C, #F0938B, #A8CFAA, #EBCC82, #A0C3D7, #AEB1DF.

Generators:

- Two exist (Python, R). Each reads only `version`, `log` and `accents`. The prose in the generated files (including the stale "cool sage" text), the palette names, the syntax palette order, the warm-cool split and the interpolation rule are typed inside the generator templates or the hand-written code.
- Missing or unrecoverable: the Tailwind generator (`generate.mjs`), `propagate_palette.py`, any generator for the specimen, the VS Code, Zed, iTerm2 and terminal files, and any sync for `vscode/themes/`.
- The JSON `roles` and `syntax` blocks are read by nothing. The themes carry their own scope-to-accent mapping (30 `tokenColors` rules covering 65 scopes, 17 semantic token entries, 39 Zed syntax entries) and their own UI mapping (143 keys); none of that is in the JSON.
- The Python and R packages and the Tailwind package each hold their own copy of the values, and the Python and R continuous-ramp code differs (section 7).

## Method and unverified items

Method:

- Read all tracked text files (the Zed theme and the iTerm2 file were read in part and inspected programmatically for the rest). Ran, in copies: `scripts/cvd_check.py`, `scripts/design_palette.py`, both generators, all three test suites, `examples/plots.py`, `make -n` for each target, and my own analysis scripts in `S/work/pequod-analysis/` (hex scan, contrast, comparisons).
- Environment (all under S/work, nothing installed system-wide): `pequod-venv` (uv, Python 3.12.14; NumPy 2.5.3, matplotlib 3.11.2 and dependencies installed offline from the local uv cache; pytest 9.1.1, pluggy 1.6.0, iniconfig 2.3.0, pygments 2.21.0 installed with online resolution from PyPI, the wheels possibly cached), `pequod-venv-nompl` (pytest only, offline), `pequod-rlib` (testthat 3.3.2 with pkgbuild, diffobj, brio, desc, pkgload, praise, waldo installed from CRAN). No registry writes, no publishing.
- Copies: `S/work/pequod` (scripts and tests; its example PNGs were overwritten by `plots.py`), `S/work/pequod-gen` (generator reruns, no differences).
- Reads: GitHub through `gh` read calls; PyPI JSON API; `npm view`; crandb and the CRAN package page; the public VS Code Marketplace extension query; the Open VSX API. No package artefact was downloaded.

Unverified:

- Contents of the PyPI 0.2.0 wheel (including `__version__`) and of the npm 0.1.0 tarball; why 0.2.0 has no sdist.
- How Open VSX and VS Code publishing were done (token type, tool), and whether PyPI uses trusted publishing.
- The content of `scripts/propagate_palette.py` and `tailwind/data-raw/generate.mjs` (never committed).
- The origin, generator and licence status of `cover.jpg`.
- Registry rules cited in section 2.3 (CRAN numeric versions, Marketplace major.minor.patch, PEP 440 normalisation), the CRAN practice on URL changes, GitHub redirect behaviour for raw URLs.
- Whether the tritanopia matrix is part of the 1999 paper; the claim that `@import "pequod-tailwind/index.js" layer(theme);` fails in Tailwind v4.
- How the website (project page mirror) consumes the palette.
- `make specimen`, `make vsix`, `make py-build`, `R CMD check` and image reproducibility were not run.
