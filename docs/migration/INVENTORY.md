# Ensigns inventory (phase 1)

Date: 2026-09-29. Prepared for checkpoint 1. Read-only: nothing in any repository was changed. Decisions and problems are in CHECKPOINT-1.md. Evidence with paths and line numbers is in the reports under inventory/.

Contents: 0 Scope and method; 1 The five repositories at a glance; 2 Token files and fields; 3 Targets each repository ships; 4 Generators and build systems; 5 Published packages and listings; 6 External consumers; 7 The current site; 8 Name checks; 9 Toolchain on this machine; 10 Where the brief and the repositories disagree.

## 0. Scope and method

The five repositories were cloned from GitHub on 2026-09-29 into a scratch folder and read at the commits below. Scripts, tests and builds ran only in copies. Registry, GitHub and website facts come from read-only queries on the same day.

| Repository | Commit read | Date | Commits | Tags |
|---|---|---|---|---|
| gam | f16228db99ff630fed8083a2d6ad9498bc008b0e | 2026-09-21 | 18 | none |
| pequod | 619982d518a66af65b19117652e9dba977e7bbbd | 2026-04-30 | 20 | v0.1.0, v0.2.0 |
| glauca | 1efbccee79dfd74ea7fde9da11b2680b98afbf09 | 2026-09-11 | 15 | none |
| try-works | 400dd91402459c124b24c7d0d6248b916639a7dc | 2026-08-09 | 5 | none |
| ambergris | c92c190d3509a3e2336b6d72c5470523d6f1c9e3 | 2026-09-11 | 3 on main, plus 1 on the unmerged branch application-themes (6139fbb, 2026-07-29) | none |

The local checkout at ~/Projects/glauca has a history that diverged from GitHub (15 commits each way; the GitHub history was rewritten, and gam commit 886425e records it). The local ~/Projects/gam and ~/Projects/loomings are in step with GitHub. Every import in phase 2 uses the GitHub state.

Detailed reports (each item cites file and line): inventory/pequod.md, inventory/glauca.md, inventory/try-works.md, inventory/gam.md (code, then site and deployment), inventory/consumers.md. Ambergris has 15 files and is complete in section 2.5 and section 3.4 of this file. The scripts behind the numbers in CHECKPOINT-1.md are in inventory/checks/.

## 1. The five repositories at a glance

| | gam | pequod | glauca | try-works | ambergris |
|---|---|---|---|---|---|
| Purpose | Site: Home, family pages, Compare, Carpenter (28 formats), About | Reading and code palette; five published packages | Light-first system: frost field, one blue mark; 22 target groups | Dark-first sibling: cold sea field, one fire mark; 17 target groups | Near-monochrome interface system; 7 generated files |
| Visibility | public | public (4 stars, 17 topics) | public, created 2026-09-11 | public, created 2026-09-11 | public |
| Version | 0.1.0 | 0.2.0-alpha in the token file; 0.2.0 in every package | 0.1.0 | 1.0.0 | 0.3.0 |
| Commits, tags, releases | 18, none, none | 20, v0.1.0 and v0.2.0, none | 15, none, none | 5, none, none | 3 (and 1 on an unmerged branch), none, none |
| Tracked files | 284 | 81 | 238 (78 per cent of the bytes are specimens) | 200 (12 of 12.5 MB are specimens) | 15 (two 500 KB Mastodon CSS files) |
| Licence files | LICENSE-MIT, LICENSE-CC-BY-4.0 | the same two (the CC file is a summary, not the legal code), plus a LICENSE in python/, r/, tailwind/ and vscode/ | the same two | the same two | none; the Mastodon port carries TANGERINE-LICENSE (MIT, Niléane Dorffer) |
| GitHub licence detection | none | other | other | other | none |
| CITATION.cff | yes (0.1.0) | no | yes (0.1.0) | yes (1.0.0) | no |
| DOI | none | CRAN package-level DOI only | none | none | none |
| README and changelog | README.md, CHANGELOG.md | README.md, CHANGELOG.md, vscode/CHANGELOG.md | README.md, docs/CHANGELOG.md (no dates) | README.md, docs/CHANGELOG.md | ports/README.md only |
| CLAUDE.md | no | no | yes, 74 lines | yes, 68 lines | yes, about 8 KB |
| CI | `.github/workflows/build-deploy.yml` | none, although `r/cran-comments.md` says Actions were green | none; a Forgejo workflow was removed on 2026-08-09 | none; a workflow was removed on 2026-08-09; `dependabot.yml` remains | none |
| Generator | Node (28 JavaScript modules) | data files only (Python, R) | Python, 3,353 script lines | Python, 2,214 script lines | Node, `build.mjs` |
| Author identity in history | tiagojct@icloud.com | same | same | same | same, and tiagojct@tiagojct.eu on one commit |

Before 2026-09-11 the family repositories were on a Forgejo instance (git.tiagojct.eu, no longer resolving), which explains the removed workflows and the `.forgejo` history in Glauca. Three repositories (glauca, try-works, ambergris) carry a CLAUDE.md. No commit message on any `main` branch carries a Co-Authored-By trailer. The only one is on the unmerged Ambergris branch.

## 2. Token files and fields

### 2.1 Comparison

| | Pequod | Glauca | Try-Works | Ambergris |
|---|---|---|---|---|
| File | `pequod.json` | `src/glauca.json` | `src/try-works.json` | `tokens.json` |
| Size | 82 lines, 2,988 bytes | 672 lines, 19,592 bytes | 707 lines, 19,197 bytes | 250 lines, 13,279 bytes |
| Version in the file | 0.2.0-alpha | 0.1.0 | 1.0.0 | 0.3.0 |
| Mode keys | `roles.light`, `roles.dark`; per crew member `light`, `dark` | `modes.dark`, `modes.light` (renamed from lit and cold on 2026-07-11) | `modes.lit`, `modes.cold` (`scheme` says dark or light); `dataviz.plot` uses dark and light | `theme.light`, `theme.dark` |
| Mode labels in the file | none | Profundum, Pruina | Try-Fire, True Lamp | none |
| References | bare paths (`log.100`); syntax uses crew names | none, literal hex | none, literal hex | `{color.grey.950}` |
| Colour encoding | uppercase `#RRGGBB` | lowercase hex | lowercase hex; `color(display-p3 ...)`; CMYK strings | hex and `oklch()` for every colour (hand-synced); `rgb(r g b / a)` alpha strings |
| Palette | `log` 12 steps; `accents` 8 crew (light and dark) | 19 entries in 5 groups (dark values) | 19 entries in 5 groups (dark values) | `color.grey` 13, `color.accent` 10, `color.alpha` 16 strings |
| Roles per mode | 12 | 15 | 15 | 32 |
| Syntax | `syntax`: 10 roles as crew names | `code`: 11 roles, dark only | `code`: 11 roles, dark only | none in the file |
| Terminal | none (hand-written presets) | `terminal`: 16 ANSI, dark only | `terminal`: 16 ANSI, dark only | `ansi`: 16 named slots, dark only |
| Status | none | none (implicit in generators) | none (implicit in generators) | `status`: 4 achromatic levels |
| Data scales | none | `dataviz`: Okabe-Ito 7, sequential 7, diverging 9 | same shape, teal and amber diverging | `data`: 5-step sequential sweeps for light and dark |
| Assertions | none | `validate.py`, 18 rows | `validate.py`, 13 rows | `contrast.assert`, 23 rows in the file |
| Non-colour sections | `license` | `type`, `spacing`, `accessibility`, `typography`, `gamut`, `i18n`, `print`, `a11y`, `performance`, `motion`, `brand`, `product` | the same 12 | `border`, `focus`, `shadow` |
| Read by | two data generators and `cvd_check.py` | `generate.py` and others | `generate.py` and others | `build.mjs` |

### 2.2 Pequod: pequod.json

82 lines, 2,988 bytes, uppercase `#RRGGBB` only. Top-level keys: `$schema` (the generic JSON Schema URL; no schema file exists), `name`, `version` (0.2.0-alpha), `description`, `author`, `homepage`, `license` ({palette: CC-BY-4.0, code: MIT}), `log`, `accents`, `roles`, `syntax`. There are 28 hex values (12 Log, 16 crew) and 34 reference strings.

- `log`: 12 steps (50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950), strictly monotone in lightness. Steps 50 to 500 are warm (hue 43 to 74 degrees in OKLCH), steps 600 to 950 are cool (228 to 242). The jump between 500 and 600 is 175 degrees.
- `accents`: 8 crew, each `{light, dark, role, note}`. `role` holds a hue word (red, blue, indigo, yellow, grey, orange, green, brown), not a syntax role.

| Crew | Light | Dark | Hue |
|---|---|---|---|
| ahab | #A83732 | #E3877C | red |
| starbuck | #0082B1 | #A6DFFF | blue |
| queequeg | #253E82 | #838CCF | indigo |
| pip | #6A4A00 | #DEC577 | yellow |
| ishmael | #76716B | #BFBBB6 | grey |
| stubb | #CA6435 | #FFD9BB | orange |
| tashtego | #177C55 | #82C4A2 | green |
| daggoo | #552823 | #A17069 | brown |

- `roles.light` and `roles.dark`: the same 12 keys (bg, bg-alt, surface, text, text-muted, text-subtle, border, accent-primary, accent-secondary, link, link-hover, focus-ring), each a bare reference such as `log.100`. Light: bg Log 100 (#EAE1D7), bg-alt Log 50, surface Log 150, text Log 800. Dark: bg Log 950 (#0B1720), bg-alt Log 900, surface Log 800, text Log 100.
- `syntax`: 10 roles mapped to crew names: keyword ahab, string tashtego, number pip, comment ishmael, function starbuck, type queequeg, constant stubb, variable daggoo, operator ishmael, punctuation ishmael. The mode comes from the consumer (the light or dark variant of the crew member).
- What is not in the file: mode labels ("Below deck" and "Parchment" appear nowhere in the repository; gam's adapter hard-codes them), ANSI colours, editor UI colours (143 keys per VS Code theme), alpha values, fonts, any rule or CVD claim.
- What reads the file: only `python/data-raw/generate_data.py`, `r/data-raw/generate_palettes.R` and `scripts/cvd_check.py`, and only the keys `version`, `log` and `accents`. Nothing reads `roles` or `syntax`. They disagree with the themes in five places: the light editor draws on Log 50 (the file says Log 100), dark text-muted, dark link, light focus-ring, and `syntax.variable` (the themes colour plain variables with the text colour).
- Hand-tuned values outside the file: 28 distinct colours (ANSI cyan and six brights, #E8DDC7 in the dark theme, the light-theme brights, six Zed dim values and iTerm2 variants) sit in the theme and terminal files. They descend from v0.1 and no script produces them.

### 2.3 Glauca: src/glauca.json

672 lines, 19,592 bytes, 24 top-level keys, 123 hex leaves, no reference syntax, no schema. The 24 top-level keys and their order are identical to Try-Works' file: Glauca began as an adaptation of Try-Works (first commit 6df0b91; the generators still use Try-Works names such as ember, flame, oil, fire and sea). Eight top-level keys are read by no script (`name`, `description`, `signature`, `tiers`, `accessibility`, `notes`, `colorspace`, `product`).

- `modes`: keys `dark` (label Profundum) and `light` (label Pruina), each with `scheme` and 15 literal colour roles: bg, surface, surface-raised, text, text-muted, border, accent, accent-bright, accent-deep, on-accent, tint-deep, tint, tint-bright, tint-pale, on-tint. Twelve of the 15 dark values equal a palette entry; three of the 15 light values do (bg = charta, accent-bright = dies, accent-deep = imum). The other light values (11 distinct) and three dark values (border, accent, on-tint) exist nowhere in the palette.
- `palette` (19 entries, 5 groups; the dark mode plus the blue trio): saxum (pix #10161c, umbra #171f26, petra #1f2932, ferrum #0b1218), glaucum (caligo #142430, vadum #2b4356, spuma #4d7391, nebula #93b7c9), caelum (dies #007aff, aer #6cb2ff, imum #084b96), pruina (pruina #e8eef2, charta #f0f4f6, cinis #8c8c8c), extended (folium #62ba46, bacca #c96a6a, viola #b184db, lacus #4a9edb, unda #45a3ad).
- Aer and Imum in the light mode: no key named aer or imum exists in `modes`. The role names bright and deep bind to different palette entries by mode (dark accent-bright = aer, dark accent-deep = dies; light accent-bright = dies, light accent-deep = imum). The collision sits in `generate.py:1499`, which remaps aer and imum to the light accent-deep (#084B96) and dies to the light accent (#0b62cf) for VS Code, Zed, Quarto and MarkEdit. Obsidian's light theme still uses raw aer for highlights.
- `code`: 11 roles, dark only; style on four (comment italic, keyword bold, number italic, type italic). The light values come from two different rules (editors: hue mixed 0.45 toward the ink, folium 0.5; Obsidian: every hue 0.45), so the light keyword is #0b62cf in editors and #0a529f in Obsidian.
- `terminal`: chrome plus 16 ANSI slots, dark only. The light terminal is derived by `_light_ansi` (`generate.py:185-211`), which mixes each slot toward the ink until it clears 4.5:1 (normal) or 4.0:1 (bright) on the light background, and pins four slots. Glauca's light terminal therefore passes; Try-Works' does not (P12).
- No status block. Status roles are implicit in the generators: error bacca, success folium, info lacus, warning the blue mark in editors and amber in Miniflux and Zotero. Amber has no palette entry.
- Other sections: `type` and `typography` (IBM Plex Serif, Sans, Mono; 10 type roles), `spacing`, `motion`, `performance`, `i18n`, `a11y`, `gamut.p3` (4 colour strings), `print` (13 CMYK rows, every one equal to a naive conversion of its hex), `dataviz` (Okabe-Ito categorical, dies-blue sequential, blue-and-copper diverging, plot colours per mode, marker and line-type lists), `brand`, `product`.
- Rules in prose: one blue mark per surface; extended hues only in code and terminal; the code exception (dies on keywords, folium on strings); light hovers darken and dark hovers brighten; both modes keep identical keys; light first. Enforced by script: 18 contrast rows, mode key parity, the generated-file drift check. CVD is a report that never fails. inventory/glauca.md section 4 lists all 38 rules with their enforcement.
- 54 distinct hex values outside the palette block (light modes 11, terminal 10, dataviz 22, code 3, contrast overrides 4, dark modes 3, one plot grid). `accessibility` holds ten hand-typed contrast numbers that match only when computed with the mode accent, not with the palette entry the key names.
- `CITATION.cff` gives the licence as "MIT AND CC-BY-4.0", which fails CFF 1.2.0 (one SPDX identifier, or a list meaning any of them). The same value is in gam's and Try-Works' files.

### 2.4 Try-Works: src/try-works.json

19,197 bytes, 707 lines, 456 leaf values, maximum depth 6, non-ASCII written as \uXXXX. Top-level keys: `name`, `version` (1.0.0), `description`, `signature`, `notes`, `colorspace`, `tiers`, `modes`, `palette`, `code`, `terminal`, `type`, `spacing`, `accessibility`, `typography`, `gamut`, `i18n`, `dataviz`, `print`, `a11y`, `performance`, `motion`, `brand`, `product`.

- `modes`: keys `lit` (label Try-Fire, scheme dark) and `cold` (label True Lamp, scheme light). 15 colour roles per mode: bg, surface, surface-raised, text, text-muted, border, accent, accent-bright, accent-deep, on-accent, sea-deep, sea, sea-bright, sea-pale, on-sea. All values are literal hex. Three mode vocabularies coexist: lit and cold (modes, a11y, gamut), light and dark (dataviz.plot, and the R and Python arguments), dark and light (the `scheme` values). "Try-Fire" appears 48 times in 31 files and "True Lamp" 58 times in 32 files, including theme names and file names.
- `palette` (19 entries): ground (pitch #12161b, hold #1b2127, deck #232b32, iron #11151a), sea (trough #14242c, swell #2c4953, spray #4d7680, foam #8fb6bd), fire (ember #c9651d, flame #e0832a, oil #9a4a16), whale (whale #f1efe9, bone #dee7e4, gull #97a0a4), extended (kelp #86a87f, brick #d06a52, dusk #a487ba, tide #5f93b0, shoal #5f97a0). The palette is the dark mode plus `bone`. Fourteen of the fifteen light-mode values exist nowhere in the palette.
- Dark mode: bg #12161b (luminance 0.0078), text #f1efe9 at 15.79:1, muted #97a0a4 at 6.82:1. Light mode (True Lamp): bg #dee7e4 (luminance 0.783), text #18272b at 12.21:1, muted #52646a at 4.91:1.
- Flame and Oil in the light mode: neither exists as an entry. `palette.fire` is not mode-scoped and holds the dark values. The light mode has three fire values under role names (accent #9e5017, accent-bright #b85f1c, accent-deep #7a3a10). `generate.py:576` maps ember to accent and both flame and oil to accent-deep, so Flame and Oil collapse to #7a3a10 in every light output.
- `code`: 11 roles `{color, style?}` (comment italic, keyword bold, type italic), dark only. `terminal`: 16 ANSI slots as a positional array plus background, foreground, cursor, cursor-text, selection-bg and selection-fg, dark only. The light Ghostty and iTerm2 presets reuse the dark ANSI set unchanged: 10 of 16 colours are below 3:1 on the True Lamp background (white 1.28:1, bright green 2.10:1).
- No status block. The generators assign status colours: error brick, warning ember, info tide, success kelp, hint shoal, conflict dusk.
- Non-colour sections the generators use: `type` (3 families, scale), `spacing`, `typography` (4 font families with axes, 10 roles), `motion`, `performance`, `a11y`, `gamut.p3` (4 colour(display-p3) strings), `print` (12 CMYK strings, PSO Coated v3, 300 per cent ink limit), `dataviz` (Okabe-Ito categorical, teal sequential, teal and amber diverging). Prose sections: `brand`, `product`, `notes`, `signature`.
- Fonts: Fraunces (serif), Archivo (sans; used in Obsidian, Typst, R and matplotlib, 26 files), JetBrains Mono, Literata (reading). The brief keeps Fraunces, Literata and JetBrains Mono and does not mention Archivo.
- Duplication: 126 hex occurrences, 19 in the palette and 107 outside it (44 copies of palette values, 63 values that are not in the palette). There is no reference syntax. `spacing.border` (1px) and `modes.*.border` (a colour) both become the CSS variable `--tw-border`.
- Design rules (prose, none enforced except contrast floors): fire is rare, one hot mark per surface; the cold sea is the field; the code tier is the one exception (fire on keywords, for colour-blind readers); extended hues only in code and terminal; both modes keep identical keys. docs/FOUNDATIONS.md defines True Lamp as Melville's sun (chapter 96: "the glorious, golden, glad sun, the only true lamp—all others but liars!"). See P11 in CHECKPOINT-1.md.
- Assertions: `validate.py` checks 13 contrast pairs. Nothing checks the code colours, the ANSI set or the data colours.

### 2.5 Ambergris: tokens.json

250 lines, 13,279 bytes, version 0.3.0. Every colour has both `hex` and `oklch`, kept in step by hand. Aliases use `{dot.path}` and resolve recursively (depth guard 12).

- `meta`: name, version, description, prefix `am`, greyHue 254, accentHue 190, and `rules`, the four rules, verbatim:
  1. Accent marks interaction only: links, current item, selection, accent rules. Never severity, never decoration.
  2. Status is achromatic. Severity is carried by border weight, edge style and fill density, plus an icon and explicit copy.
  3. The data sweep never appears in interface chrome, and the interface accent never appears in a chart.
  4. Functional hues exist for terminal and editor content only: ANSI slots, diffs, diagnostics. Never interface chrome.
- `color.grey`: 13 steps, 000 to 1000 (#FAFBFD to #0C1117). `color.accent`: 10 steps, 050 to 900, hue 190 (teal; 500 is #2F9F99). `color.alpha`: 16 `rgb(r g b / a)` strings in three groups (ink 7, paper 6, accent 3) that duplicate three ramp anchors by hand.
- `data`: `hue-path` (5 hues), `supplied` (5 hexes), `sequence-on-light` and `sequence-on-dark` (5 steps each). Sequential only.
- `ansi`: 16 slots, dark grounds only (10 literal colours, 6 aliases such as `cyan` = accent.400).
- `contrast.assert`: 23 rows (11 for text, links and rules, 12 for ANSI on the dark ground), each with `fg`, `bg`, `min`, `why`. `build.mjs` exits 1 before writing any file if one fails.
- `theme.light` and `theme.dark`: 32 roles each (ground, surface, surface-sunken, surface-raised, surface-hover, surface-active, surface-inverse, text-primary, text-secondary, text-tertiary, text-disabled, text-inverse, text-on-fill, rule-faint, rule, border, border-strong, fill-solid, fill-solid-hover, fill-muted, fill-muted-hover, link, link-hover, accent-line, accent-surface, accent-surface-hover, accent-on-surface, selection-fill, selection-text, scrim, focus-ring, focus-halo). The mode keys are already `dark` and `light`. The file holds no labels.
- `status`: neutral, success, warning, critical, each `{weight, edge, fill, accent, icon}`. Achromatic by rule 2.
- `border` (width hair, thin, thick; radius five steps), `focus` (width, offset), `shadow` (0 to 3 and inset).
- Not in the file: syntax colours (only the dark Zed port holds them), any light-mode terminal or editor, labels, fonts.
- Colour typed outside the file: none in the hand-written files (`build.mjs`, `specimen.src.html`, `refinements.css`); the generated files carry the values.

### 2.6 The normalised model the site uses today

Gam's adapters produce one model (`src/model/token.js`, no schema file). Roles (14): bg, surface, text, textMuted, textSubtle, border, link, linkHover, accent, onAccent, button, onButton, focus, selection. Syntax roles (12): keyword, string, number, comment, function, type, constant, variable, operator, punctuation, decorator, parameter. ANSI: 16 names. Modes: `dark` and `light` with a label and a scheme. Each colour is a token that records its origin (a file path or a derivation). The adapters fill what the sources lack: `linkHover`, `textSubtle`, `onAccent`, `button`, `onButton`, `selection` (Pequod, Glauca, Try-Works), `focus` (Pequod), light syntax colours (Glauca, Try-Works: a lookup keyed by hex that copies each family's `_light_remap`; Ambergris: a contrast mirror), and light terminals (Pequod and Ambergris: derived; Glauca and Try-Works: read from their Ghostty files). Hard-coded in the adapters: taglines, repository URLs, licence blocks, ship lists (12, 11, 11 and 3 outputs), CVD summaries and mode labels.

### 2.7 How the current fields map to the brief's schema

| Schema field | Pequod | Glauca and Try-Works | Ambergris |
|---|---|---|---|
| meta.id, name, version | name, version | name, version | meta.name, meta.version |
| meta.licence | license {palette, code} | LICENSE files, CITATION.cff | none |
| meta.chapter, quote, goal, environments | none | none | none |
| palette | log plus accents in both modes | palette holds the dark values; light values are literals inside modes | color.grey, color.accent; alpha as rgb strings |
| modes.<m>.label | none in the file | modes.<m>.label | none |
| modes.<m>.roles | roles.<m> (12, references) | modes.<m> (15, literal hex) | theme.<m> (32, references) |
| modes.<m>.syntax | syntax plus accent variants | code (dark only); light from generate.py | none in the file |
| modes.<m>.ansi | none; hand-tuned in theme files | terminal (dark only) | ansi (dark only) |
| modes.<m>.status | none | none | status (mode independent) |
| modes.<m>.data | none | dataviz (plot per mode) | data.sequence-on-light and -dark |
| typography | none in the JSON | type, typography | none |
| rules | README prose | CLAUDE.md, FOUNDATIONS.md prose | meta.rules |
| distinct | none | none | none |

Of the brief's nine core roles, `selection` has no role in Pequod, Glauca or Try-Works, `link` has none in Glauca or Try-Works, and `focus` sits under `a11y.focus` in those two. Gam derives or aliases them (selection from the tint or sea colour, link from the accent).

## 3. Targets each repository ships

### 3.1 Pequod

81 tracked files. Only the R and Python data files are generated from `pequod.json`. Everything else is hand-written or hand-typed.

| Target | Files | Origin | Modes | Published |
|---|---|---|---|---|
| VS Code themes | `themes/Pequod-color-theme.json`, `themes/Pequod-light-color-theme.json` (143 colour keys, 30 token rules, 17 semantic rules each); `vscode/themes/` holds byte-identical copies with no sync step | hand-written; the v0.2 hex swap used a script that was never committed | dark, light | extension `tiagojct.pequod-color-theme` (Marketplace, Open VSX) |
| Zed | `themes/Pequod.zed.json` (two themes, 136 style keys each) | hand-written | dark, light | no (copy the file) |
| iTerm2 | `themes/Pequod.itermcolors` (26 colours) | hand-written | dark only | no. The light preset is on the roadmap |
| Terminals | `themes/terminals/Pequod.ghostty`, `.alacritty.toml`, `.kitty.conf`, `.wezterm.lua`, `.tmux.conf`, `.windowsterminal.json` | hand-written | dark only | no |
| R package | `r/`: 12 exports (`palette_pequod`, `pequod_crew`, `pequod_log`, `scale_colour_pequod_c` and `_d`, and fill and color variants, `pequod_preview`); data in `r/R/palettes-data.R` | data generated by `r/data-raw/generate_palettes.R` (reruns identical) | both accents, one Log scale | CRAN `pequod` |
| Python package | `python/src/pequod/`: `LOG`, `CREW_LIGHT`, `CREW_DARK`, `palette()`, `to_cmap()`, `register_cmaps()` | `_data.py` generated by `python/data-raw/generate_data.py` (reruns identical) | same | PyPI `pequod` |
| Tailwind package | `tailwind/`: `log`, `crew`, `colors` (Tailwind 3 style; the v4 line in its README looks non-functional, unverified) | hand-typed; its header names a generator that was never committed | same | npm `pequod-tailwind` |
| Typst specimen | `specimen/specimen.typ`, `specimen.pdf` | hand-typed (does not read the JSON) | light page, dark code block | no |
| Examples | `examples/plots.py`, eight PNGs | `plots.py` reads the Python package | both | no |
| Assets | `cover.jpg` (an illustration), `vscode/icon.png` (v0.1 colours) | committed once | | listing images on both marketplaces |
| Design script | `scripts/design_palette.py`: an LCh table that regenerates all 28 colours; `scripts/cvd_check.py` (Viénot) | hand-written, need NumPy | | no |

`design_palette.py` is a second source for the 28 colours (two of its 28 entries clip out of gamut and cannot be recovered from the hex). In phase 2 it becomes a design note or is retired; the token file is the only source.

Hex typed outside `pequod.json`: 1,581 literals in 26 files (1,416 equal a token, 115 are hand-tuned, 50 are v0.1 values in the CHANGELOG history tables or black and transparent). Details in inventory/pequod.md section 9.

### 3.2 Glauca (Goney)

238 tracked files. `dist/` has 141: 107 generated by `generate.py`, 27 copies of hand-written scaffolding, 4 archives (two Firefox and Thunderbird `.xpi`, two Vivaldi zips), and 3 built by separate targets (two `.pptx`, one MarkEdit bundle). `generate.py` writes 115 files (107 in `dist/`, 8 in `src/`). After `make generate`, 137 of the 141 tracked `dist/` files are byte-identical; the four archives are not (timestamps), and four binaries are stale: both `.xpi` and both `.pptx` still carry the old Forgejo URL, and the drift gate cannot see them. Nothing is published. The proposals are mine, based on the inventory; they are not decisions.

| Target | Files | Origin | Family-specific content | Proposal |
|---|---|---|---|---|
| CSS layer | 6 (`glauca.css`, `typography.css`, `p3.css`, `a11y.css`, `fallbacks.css`, `motion.css`) | generated | prefix `--gl-`, classes `.gl-*`, `[data-mode]` | all ten; prefix becomes family-scoped or shared |
| Tailwind | 4 files | generated plus hand-written `index.js` | palette names only, no light values, no v4 `@theme` | all ten (v3 and v4 packages) |
| VS Code colour themes | 2 themes, 887 workbench keys each | generated; light through `_light_remap` | names, package `glauca-color-theme` | all ten in one extension |
| VS Code icon theme | 69 files (46 monograms, 6 glyphs, 16 folders) | generated | id `glauca-icons` | Goney-only, or one shared set; ten copies would add 680 SVGs |
| Zed | 1 theme file, 154 style keys per theme | generated | names, author | all ten |
| Ghostty and iTerm2 | 7 files, dark and light, plus `glauca.conf` pairing | generated | file names, macOS icon block | all ten |
| Obsidian | `theme.css`, manifest, 2 preview SVGs | generated (796-line generator) | Style Settings id `glauca`, `gl-*` body classes, reading voice; uses `!important` (`generate_obsidian.py:764-765`) | six families in the brief's row, one theme with a family switch |
| Quarto | 2 scss, 2 highlight themes, `typst-brand.typ`, example | generated | file names; brand file is light only | all ten |
| Typst | `colors.typ`, `poster.typ`, `glauca.typ` (slides, default mode dark, against the light-first rule), `demo.typ` | mixed | function name, poster copy | all ten |
| R | `glauca.R` (a script, not a package) | generated | function names | the `ensigns` R package |
| Python | `glauca.py`, `glauca.mplstyle` | generated | function names | the `ensigns` Python package |
| Firefox | `manifest.json`, `Glauca.xpi` (unsigned, stale), icon | generated | add-on id `glauca-theme@tiagojct.eu` | see 3.5 |
| Thunderbird | same set | generated | id `glauca-theme@thunderbird.tiagojct.eu` | see 3.5 |
| Vivaldi | 2 settings files, 2 zips | generated | theme ids from `uuid5("glauca.vivaldi.<mode>")` | see 3.5 |
| Zotero | `userChrome.css` | generated | tag hues typed from Okabe-Ito | see 3.5 |
| oh-my-zsh | 2 themes | generated | function prefix `_glauca_` | see 3.5 |
| Miniflux | `glauca.css` | generated | none beyond colours and font names | see 3.5 |
| MarkEdit | `glauca.js` (esbuild bundle, byte-identical on rebuild) | generated | package `glauca-markedit`; needs `markedit-theming` from GitHub | see 3.5 |
| PowerPoint | `Glauca.pptx`, `Glauca-Dark.pptx` (python-pptx decks) | built by a separate target | slide copy about the rule, closing URL | see 3.5. These are decks, not `.thmx` themes |
| CMYK print spec | `print/SPEC.md` | generated | the spot-colour note is specific to #007aff | all ten; the CMYK rows can be computed |
| Specimen | `src/specimen`, 10 files, 7.35 MB | hand-written, stale (12 mode values differ from the JSON; wording from Try-Works) | all of it | replace with generated family specimens |
| Web starter | `src/web`, one Eleventy page | hand-written | Glauca copy | drop |
| Brand assets | `src/assets`, 3 SVGs | hand-written | the bloom emblem | generate from palette values or keep Goney-only |

Packaging constraints (inventory/glauca.md section 6.4): Firefox, Thunderbird, Vivaldi, Zotero and MarkEdit cannot carry a family option in one package (one add-on, zip or file per theme). Obsidian needs root-level files and a GitHub release (section 8). Exclude from the import: `.omo/` (five run-state files from an AI coding harness), the tracked `__pycache__` file, `.vscode/settings.json`, the stale binaries, and `src/specimen`.

### 3.3 Try-Works (Jungfrau)

200 tracked files: `dist/` has 126 (101 generated by `generate.py`, 23 copies of hand-written scaffolding made by `assemble.sh`, 2 Vivaldi zips), `src/` 56, docs 8. Nothing is published. The last column is a proposal, not a decision.

| # | Target | Origin | Proposal |
|---|---|---|---|
| 1 | CSS layer: `try-works.css`, `typography.css`, `p3.css`, `a11y.css`, `fallbacks.css`, `motion.css` (prefix `--tw-`, selectors `data-mode="lit"` and `"cold"`) | generated | all ten. Fix the `--tw-border` clash once; selectors become `data-family` and `data-mode` |
| 2 | Tailwind preset (`colors.generated.js`, hand-written `index.js`) | mixed | all ten (Tailwind 3 and 4 packages) |
| 3 | VS Code colour themes, two (453 workbench keys each; the light theme is a total remap of the dark one) | generated | all ten in one extension; re-key the remap from hex values to roles |
| 4 | VS Code file-icon theme (69 files: 46 monogram icons, 6 glyphs, 16 folder icons, one definition file) | generated | some: one icon theme parametrised by family, or keep Jungfrau-only. Not in the brief's bundles |
| 5 | Zed (two themes, 131 style keys each) | generated | all ten in one extension |
| 6 | Ghostty and iTerm2, dark and light | generated | all ten; the light ANSI sets must be authored (P12) |
| 7 | oh-my-zsh (two themes: fire only on the git-dirty mark) | generated | some: small, not in the brief. Keep Jungfrau-only or generalise |
| 8 | Obsidian (`theme.css`, 47 KB; Style Settings id `try-works`; Archivo body; fire on links, tags, checkboxes) | mixed | all six families in the brief's Obsidian row, as one theme with a family switch; needs per-family parameters |
| 9 | Quarto (`try-works.scss`, `try-works-dark.scss`, `.theme`, `typst-brand.typ`, example) | mixed | all ten |
| 10 | Typst slides (`colors.typ`, `try-works.typ`, `demo.typ`; dark only) | mixed | all ten after re-keying colours to roles |
| 11 | Typst poster and print spec (12 typed CMYK strings, PSO Coated v3, 300 per cent ink) | generated | fold into Bachelor (posters); keep out of the general bundle |
| 12 | R: `dist/r/tryworks.R` (a script, not a package) | generated | the `ensigns` R package with per-family data |
| 13 | Python: `tryworks.py`, `tryworks.mplstyle` | generated | the `ensigns` Python package |
| 14 | Vivaldi (two zips; not byte-reproducible) | generated | some: five colours, not in the brief. Keep Jungfrau-only or drop |
| 15 | Web starter (11ty, 12 files, no fonts committed) | mixed | drop. The site presents every family, and the CSS layer is what a site consumes |
| 16 | Specimens and brand assets (10 files, 12 MB, six fonts embedded, out of step with the JSON) | hand-written | replaced by generated family specimens; archive the old files |
| 17 | Font tooling (`subset_fonts.sh`, `check_fonts.py`) | hand-written | shared tooling |

Not present in Try-Works but in Glauca: Firefox, Thunderbird, Zotero, Miniflux, MarkEdit, PowerPoint. Gam already generates 28 formats for Try-Works (section 4.2). Details, including why `dist/vscode` holds 75 files, are in inventory/try-works.md section 6.

### 3.4 Ambergris (Rosebud)

| File | Origin | Modes | Notes |
|---|---|---|---|
| ambergris.css | generated by `node build.mjs` | light and dark (`[data-theme]`, plus prefers-color-scheme) | hex fallback, OKLCH in `@supports`; prefix `am` |
| specimen.html | generated from specimen.src.html | both | self-contained, 44 KB |
| ports/ghostty/ambergris-dark | generated | dark | 16 ANSI slots, cursor and selection |
| ports/zed/ambergris.json | generated | dark | one theme, "Ambergris Dark"; syntax by lightness, weight and slant; functional hues only for diagnostics, version control and terminal |
| ports/firefox/manifest.json | generated | dark | static theme, gecko id ambergris@tiagojct.eu, unsigned |
| ports/mastodon/AmbergrisUI.css | generated | dark (light slots filled) | recolours a vendored Tangerine Neue template (MIT, Niléane Dorffer, 500 KB, TANGERINE-LICENSE) with refinements.css; targets Mastodon 4.6 or later |
| ports/README.md | hand-written | | install notes |

The build is deterministic: running `node build.mjs` in a copy left the tree clean. The unmerged branch application-themes adds Zed, VS Code, Obsidian, Logseq, Ghostty, Firefox and Thunderbird themes in both modes (see CHECKPOINT-1.md D3).

### 3.5 Extras: generalise or keep

The brief's last row of section 8 asks for a decision per extra target. My proposal, for you to mark:

| Extra | Exists in | Constraint | Proposal |
|---|---|---|---|
| CMYK print spec | Glauca, Try-Works | derived data: every row is a naive conversion of a hex | generalise. Compute the rows; keep a per-family spot note. Bachelor needs it most |
| PowerPoint | Glauca (two decks) | decks, not themes; slide copy is Glauca-specific | replace with the brief's `.thmx` themes (a new generator); drop the two decks, or keep one Goney example deck |
| oh-my-zsh | Glauca, Try-Works | four palette slots; small | generalise to the terminal families |
| Firefox and Thunderbird | Glauca (unsigned, stale), Ambergris (Firefox, dark) | a static theme is one add-on per theme, so no family switch; signing needs your AMO credentials | generalise the generator to the chrome families (Pequod, Goney, Jungfrau, Rosebud, Rachel, Delight) as loose unsigned files; sign only what you use |
| Vivaldi | Glauca, Try-Works | one zip per theme; manual import; zips not byte-reproducible | keep for Goney and Jungfrau |
| Zotero | Glauca | one `userChrome.css` per profile; personal workflow. Townho's legend covers the annotation colours | keep for Goney |
| Miniflux | Glauca | paste-in CSS for your instance | keep for Goney |
| MarkEdit | Glauca | macOS only; overrides the built-in themes; needs esbuild and `markedit-theming` from GitHub | keep for Goney, or drop |
| Mastodon | Ambergris | recolours a vendored third-party template (MIT, 500 KB) | keep for Rosebud only, with the template listed in the stray-hex exemption file |
| VS Code icon theme | Glauca, Try-Works | independent of the colour themes | one shared icon theme, parametrised, or Goney-only |
| Specimens, web starter, brand assets | all four | hand-written and stale | replaced by generated specimens; drop the web starter |

The scope rules in the old docs pull the other way. `docs/PRODUCT.md` in Glauca and Try-Works says a surface earns its place only if it is used in the weekly workflow, and both say "stop adding surfaces". The brief's ten-family plan overrides that for the general targets. The "keep" rows above follow the old rule for the personal-workflow targets.

## 4. Generators and build systems

Four separate systems produce the outputs today.

### 4.1 In the family repositories

| Repository | Generator | What it produces | Reproducible | Gate |
|---|---|---|---|---|
| Pequod | `python/data-raw/generate_data.py` and `r/data-raw/generate_palettes.R` (read `version`, `log`, `accents`) | `_data.py` and `palettes-data.R` only | yes, byte for byte | none. Themes, terminals, Tailwind and specimen have no generator (two scripts named in commit messages were never committed) |
| Glauca | `src/scripts/generate.py` (2,283 lines), `generate_obsidian.py` (796), `validate.py` (116, 18 pairs), `assemble.sh` (74), `cvd_check.py` (28), `check_fonts.py` (41), `subset_fonts.sh` (15), `src/pptx/build_pptx.py` (237, python-pptx), `src/markedit/build.mjs` (esbuild); `make generate`, `make test` | 115 files (107 in `dist/`, 8 in `src/`) plus 27 scaffold copies and 4 archives; two `.pptx` and the MarkEdit bundle from separate targets | 137 of 141 `dist/` files byte for byte; the four archives differ in timestamps. Both `.xpi` and both `.pptx` are stale (old Forgejo URL) | `generate.py --check` covers the 115 text files only; docs say CI enforces it, but no workflow exists |
| Try-Works | `src/scripts/generate.py` (1,275 lines, standard library), `generate_obsidian.py` (722), `assemble.sh` (41), `validate.py` (94, 13 pairs), `cvd_check.py` (28), `check_fonts.py`, `subset_fonts.sh`; `make generate`, `make test` | 107 files (101 in `dist/`, 6 CSS copies in the web starter) plus 23 scaffold copies and 2 zips | 105 of 107 byte for byte; the two Vivaldi zips differ only in timestamps. `assemble.sh` is not idempotent (nested duplicate folders are committed) | `generate.py --check` covers 107 of 132 output files; four documents say CI enforces it, but no workflow exists at HEAD |
| Ambergris | `build.mjs` (533 lines, Node, no dependencies): resolves aliases, checks 23 contrast rows, writes CSS, four ports and the specimen | 7 generated files | yes: a rebuild leaves the tree clean | the contrast gate exits 1 before any file is written |

The light modes are not stored anywhere in Glauca, Try-Works and Ambergris. Glauca and Try-Works derive them in their generators (a hue remap keyed by hex value, and blends in 8-bit gamma space at 0.35, 0.45 and 0.5). Ambergris has no light editor or terminal on `main`.

### 4.2 In gam: the 28 formats of the Carpenter

All 28 generators are pure functions of the model (`generate(family, options)` returns `{name, content, mime}` files). They contain no `fs`, `process`, `Date`, `fetch` or DOM references and run unchanged in Node and in the browser (the Glauca zip is 73,968 bytes with 51 entries from both). Each family yields 40 files in mode both.

| Group | Formats |
|---|---|
| web | css, scss, tailwind3, tailwind4, dtcg, tokens-studio |
| publishing | quarto-brand, quarto-scss, typst, latex, pandoc-css |
| data | ggplot2, matplotlib, observable |
| editors | vscode, zed, neovim, obsidian (a CSS snippet, not a theme) |
| terminals | ghostty, alacritty, kitty, wezterm, tmux, windows-terminal, iterm2 |
| palettes | gpl, ase (binary), hex |

Gaps and defects that matter for the port: the CVD method is Viénot 1999; there is no severity parameter; the accent picker in the Carpenter changes output only for Ambergris; eight official files are copied but never offered (the `quarto`, `r` and `python` ships match no generator id); zip file names collide across families (`theme.css`, `colors.typ`); for Ambergris the data generators (ggplot2, matplotlib, Observable) export the interaction teal plus the five sequential sweep colours as a categorical series, which breaks the family's rules 1 and 3 and is what the planned lint for Rosebud would catch; `orderForCvd` is factorial (0.9 s for eight accents on the main thread); the whole model (222 KB for four families) is inside the Carpenter chunk (225 KB).

### 4.3 What the brief's bundles need, against what exists

Already generated by gam (as loose files, not packages): CSS, SCSS, Tailwind 3 and 4, DTCG, Tokens Studio, Quarto brand and SCSS, Typst colours, LaTeX, Pandoc CSS, ggplot2, matplotlib, Observable, VS Code, Zed, Neovim, an Obsidian snippet, seven terminals, GPL, ASE and hex. Not generated by gam and present in the family repositories: the full VS Code theme keys and icon theme, the Obsidian theme, Firefox, Thunderbird, Vivaldi, Zotero, oh-my-zsh, Miniflux, MarkEdit, PowerPoint, print CMYK, the CSS layers (typography, P3, motion, a11y), Typst slides and posters. Not present anywhere and named in the brief: Vega-Lite config, Office `.thmx`, an R package and a Python package (Try-Works and Glauca ship an R script and a Python module, not packages), the Loomings palettes file in the new form, Typst package and templates, the Obsidian family switch.

The consequence for phase 4 is a port of the Python generators (2,283 lines in Glauca's `generate.py` alone, 3,353 script lines in all), checked against the old committed `dist/` files as golden fixtures, plus the packaging around gam's loose-file generators.

## 5. Published packages and listings

All five listings named in the brief exist. Queries on 2026-09-29.

| Registry | Name | Latest | Published | Usage | Metadata that points at the old repository |
|---|---|---|---|---|---|
| CRAN | pequod | 0.2.0 | 0.1.1 on 2026-04-29 (first release), 0.2.0 on 2026-05-01 | 435 downloads last month, 2,415 since 2026-05-01 | URL, BugReports, README links; DOI 10.32614/CRAN.package.pequod; checks OK on the flavours listed |
| PyPI | pequod | 0.2.0 | 0.1.0 on 2026-04-26, 0.2.0 on 2026-04-30 (wheel only) | 4 downloads last month | Homepage, Repository, Bug Tracker, Changelog |
| npm | pequod-tailwind | 0.2.0 | 0.1.0 on 2026-04-27, 0.2.0 on 2026-04-30 | 18 last month, 351 in total | homepage, repository (directory `tailwind`), bugs |
| VS Code Marketplace | tiagojct.pequod-color-theme ("Pequod Palette") | 0.2.0 | first 2026-04-25, updated 2026-04-30 | 75 installs | repository, homepage, README image URL |
| Open VSX | tiagojct/pequod-color-theme | 0.2.0 | 0.1.0 on 2026-04-25, 0.2.0 on 2026-04-30 | 870 downloads | same manifest; namespace tiagojct is not verified |

Other listings: CRAN's archive holds pequod 0.0-1 to 0.0-5 (2010 to 2016), an unrelated moderated-regression package that was archived before Tiago's package took the name. Nothing from glauca, try-works or ambergris is published on any registry. `glauca` and `try-works` are free on npm, PyPI, CRAN and Open VSX; `ambergris` is taken on PyPI by an unrelated Docker utility. There is no Zed, Obsidian or Typst listing for any of the five. The GitHub repositories have no releases. The related repository pequod-quarto has releases v0.2.0, v0.3.0 and v0.3.1 (2026-05-26).

Registry facts that matter for a move: the repository URL and `repository.directory` are fixed per published version, so each of the five listings needs a new release to change them. The package identities that cannot change: PyPI `pequod`, CRAN `pequod`, npm `pequod-tailwind`, extension `tiagojct.pequod-color-theme`.

## 6. External consumers

Sources: inventory/consumers.md (part 2: websites, citations, Loomings; part 1: local disk, GitHub search and related repositories).

### 6.1 Websites and project pages

- tiagojct.eu is now a Hugo blog with 9 pages and no project pages. The three URLs named in the brief (`/projects/pequod/`, `/projects/`, `/loomings`) return 404. The 2026-08-02 post says the professional pages moved to tiagojacinto.eu. The old Pequod page survives in `github.com/tiagojct/tiagojct-site` (`content/projects/pequod/index.md`, a Quartz site last changed 2026-05-24).
- tiagojacinto.eu (Quarto, private repository `tiagojct/tiagojacinto.eu`, deployed by its own workflow to the VPS) has project pages for Gam, Loomings and pequod-quarto only. There is no page for Pequod, Glauca, Try-Works or Ambergris. The pages hold hand-typed citation blocks; the Gam and Loomings pages both produce the BibTeX key `jacinto2026`. `projects/gam/gam.png` is a screenshot of the Compare page and will show the old names.
- The dead Pequod URL (`https://tiagojct.eu/projects/pequod/`) is in the metadata of all five published listings, in the GitHub About field of pequod, in `pequod.json`'s `homepage` (so it is the "Project page" link on gam's Pequod page), and in 22 files of the pequod repository. `https://tiagojct.eu/loomings` is dead in the same way (GitHub About of loomings and homebrew-loomings).
- Gam's live site: 110 of 116 external links return 200. The six failures are the dead Pequod page, four provenance links to `blob/unknown/...` (404), and npmjs.com (403 to curl). `/glauca/` shows two broken images (`img/light.svg`, `img/dark.svg`). The About page says the site rebuilds whenever a family repository changes; no family repository has a workflow, so only the weekly cron and pushes to gam rebuild it. There is no `sitemap.xml` or `robots.txt`.
- Family ids appear in Gam's routes, in `?family=`, in `/official/<id>/`, in the `gam-theme` localStorage key and in the `data-family` attribute.

### 6.2 Loomings (`tiagojct/loomings`, v2.0.8, a web-only Markdown editor)

- Stack: plain JavaScript, Vite 8, Vitest 5, CodeMirror 6, npm, nginx image; deployed by Watchtower from `ghcr.io/tiagojct/loomings:latest`, which moves only on `v*` tags. The desktop line stopped at 1.2.1 (branch `desktop-final`); the Homebrew cask installs that build from the release page, so the repository path must stay.
- Palettes: `src/palettes.js` (203 lines), a JavaScript module exporting `PALETTE_KEYS` (ten: bg, bgElev, bgDeep, fg, fgDim, fgGhost, accent, accentLight, accentDim, border), `PALETTES`, `FAMILY_ORDER`, `DEFAULT_FAMILY`, `roles()`, `cssVars()` (14 variables) and `contrast()`. Each family has a label, mode names, and dark and light objects of six-digit hex values. Keys are `pequod`, `glauca`, `tryworks`, `ambergris`.
- Provenance: hand-copied, one commit (bb9d23f, 2026-09-21), no generator. Glauca, Try-Works and Ambergris match their token files exactly (68 of 68 values). Pequod does not (20 of 23 values are not in `pequod.json`); Loomings' Pequod is its own palette and the default.
- Validation: `src/palettes.test.js` checks hex form and floors per family and mode (fg on bg 7, fgDim 4.5, fgGhost 2, heading 3, accent 3, fg on bgDeep 4.5). 49 tests pass. It would grow to 92 with ten families.
- Application: `applyThemeAttr` sets `data-theme` and `data-palette` on `<html>` and writes the 14 variables inline. The chrome and the editor read the same variables; there is no separate chrome palette.
- Drop-in: replace `src/palettes.js` with a module that keeps the exports. Ten families need a hand mapping into the ten-role vocabulary that passes the floors in both modes. The Theme menu has no `max-height` (about 450 px for ten families, estimated). Users' stored `loomings_themeFamily` values for the renamed families would fall back to Pequod silently unless an alias map is added.

### 6.3 The personal site source (`~/Websites/tiagojacinto.eu`)

It copies Glauca values; it does not import them. `theme/glauca-light.scss`, `glauca-dark.scss` and the two Pandoc highlight themes hold Glauca values; `theme/chrome.scss` uses the `--gl-` prefix on 247 lines; `_quarto.yml` points at the four `glauca-*` files; `.github/workflows/publish.yml` checks that the two mode files mirror each other by name and prefix. A Goney prefix change reaches all of them. `theme/head.html` fixes `theme-color` at `#f7fafb`. Two SVG figures in `writing/sw/figures/` carry Pequod hex values under comments that say "Ambergris dark".

### 6.4 Citations and DOIs

- CITATION.cff exists in gam, glauca and try-works (versions 0.1.0, 0.1.0, 1.0.0; one author, no ORCID, no DOI). The licence value "MIT AND CC-BY-4.0" fails the CFF 1.2.0 schema. The `url` in glauca's and try-works' files points at tiagojct.eu. Pequod and Ambergris have no citation file.
- DOIs: 10.32614/CRAN.package.pequod (package level, ORCID-authenticated; Crossref "issued" 2010-11-13, the first CRAN release under the name, by another author). Zenodo holds no record for pequod, glauca, try-works, ambergris, gam, pequod-quarto or loomings, and none under ORCID 0000-0002-7897-1101. The only Zenodo record by Tiago Jacinto is `quarto-study-flow` (concept 10.5281/zenodo.20125559, version 10.5281/zenodo.20125560); its `CITATION.cff` labels the version DOI as the concept DOI. Zenodo's GitHub integration acts on releases, and no repository here has a release.
- Software Heritage has archived `github.com/tiagojct/pequod` only. r-universe lists `pequod` 0.2.0 (`tiagojct.r-universe.dev`, `RemoteSubdir r`); the registry repository was not found.

### 6.5 Other repositories and local copies

Method: ripgrep over the home folder and the standard editor and terminal settings, plus a full-content scan of the default branch of the 103 other non-fork repositories under tiagojct (private ones included; nothing was written). Detail in inventory/consumers.md, part 1. Third-party use is not inventoried: code search needs an owner.

- 22 repositories use or copy family values, and 4 more only document them. Every one is a hand-made copy of values or generated files. The only script is `scripts/make-themes.py` in subsub, run by hand. All five repositories are public. Nothing takes a family as a submodule or a package dependency.
- A rename breaks nothing that already exists. It breaks future re-syncs, links, displayed names and stored settings.
- Published or deployed consumers, in the order I would update them:

| Consumer | What it holds | What a rename or move touches |
|---|---|---|
| Loomings (public, deployed) | `src/palettes.js`, eight palettes (section 6.2) | family keys `glauca`, `tryworks`, `ambergris` are stored in browser storage; changing them resets returning users to Pequod unless an alias map is added |
| pequod-quarto (public, v0.3.1, three releases) | Quarto extension: Pequod Log scale, eight crew accents, four formats, Atkinson fonts bundled; values equal `pequod.json` today; not in the Quarto community listing | values go stale when the Pequod corrections land; README and homepage links; overlaps the planned Ensigns Quarto extension (D21 in CHECKPOINT-1.md) |
| pequod-wallpapers (public, no release) | vendored `pequod.json` and a CSS copy | links to the dead project page; re-vendor after the corrections |
| subsub (public; npm `@tiagojct/subsub`) | four pi themes generated by `make-themes.py` from Glauca and Try-Works token files, site CSS copies | the script reads the old key names (`sea-*`, `tint-*`, `accent-bright`, `accent-deep`) and would break on the new schema if re-run; theme ids `subsub-glauca` and `subsub-try-works` ship in the npm package |
| tiagojacinto.eu (private, deployed) | Glauca theme files, `--gl-` prefix, three project pages | section 6.3 |
| diagcalc (public; npm `diagcalc` 4.4.1) | Glauca values in `--log-*` and `--crew-*` slots; Pequod dark crew in the TUI | nothing while frozen |

- Other copies, all frozen and harmless until re-synced: working-draft (private; vendored Glauca files, twelve TTFs, book chapters that call `theme_glauca` and `use_glauca`; its `CLAUDE.md` still says Glauca is private), atlas (Try-Works tokens, Pequod Shiki themes), promptfather and intro-computers (Try-Works decks), scrimshaw, cv, antedraft, tiagojct-site, tiagojct.github.io (old site, stale pages), blog (archived), rokovoko-feeds (a Miniflux stylesheet in Pequod colours), workshop-sw-2ed (hand-typed older alpha values), ers-learning-resources-director, ia-fmup, vellum, zettelkasten (archived). Documentation only: ia-saude, hermes-knowledge, claude-dotfiles, armilar. Name collisions only: moby-qr (its own `pequod` and `ambergris` palettes), liberceti and mobydick-game (the ship in the text).
- Local only: `~/Keynotes/2026-09-28_ia-enf-especialistas` (no remote) vendors Glauca 0.1.0 and cites commit 1e66632, which exists only in the stale local `glauca` clone; the GitHub twin is 1efbcce with the same tree. An iCloud backup dated 2026-08-09 holds older clones (both Ambergris branches, Glauca, Try-Works), Ghostty theme copies, Obsidian vaults with Pequod, Try-Works and Glauca themes, and agent skill files with Pequod tokens. A content search of the 13 backup clones that are not on GitHub found no family names (0 hits in 12, one regex false positive in the thirteenth). Restoring the backup would bring back the old names.
- Your own settings: `settings.json` in VS Code sets `workbench.colorTheme` to `"Glauca"`, which matches no installed theme (Glauca's labels are "Glauca Light" and "Glauca Dark"). Zed and Ghostty are not installed on this Mac. Obsidian uses the Minimal theme and iTerm2 has no family preset.
- Related systems with the same architecture, outside this migration: `armilar` (one token JSON, small generators; outputs CSS, Tailwind, Obsidian, Ghostty, VS Code) and `corposant` (one Python script producing `tokens.json`, Zed, VS Code, Ghostty). Both private; read only by name and README.
- Infrastructure outside all repositories: the Cloudflare CNAME `gam` in the zone tiagojacinto.eu, the tunnel ingress and Caddy route on the VPS, the compose service in `/opt/vps/apps/gam`, and the image `ghcr.io/tiagojct/gam:latest` pulled by Watchtower. The weekly Monday schedule in `build-deploy.yml` still runs (last run 2026-09-28). No repository has an Actions secret (0 on all five), so `GAM_VENDOR_TOKEN` and `GAM_DISPATCH_TOKEN` are not set and the dispatch job was never installed in the family repositories: the rebuild-on-change that the About page describes has never worked.
- The history of the local Glauca clone: its 15 commits carry Co-Authored-By and Claude-Session trailers that the GitHub history does not. Every pair has an identical tree and an identical message once the trailers are removed. The GitHub history is therefore the version with the attribution stripped, which matches the guardrail in the brief.

### 6.6 What breaks when the old repositories are archived, renamed or merged

GitHub's documented behaviour, not tested here.

| Action | Effect |
|---|---|
| Archive | Nothing breaks. Repositories stay public and cloneable. Deep links stay valid and frozen |
| Rename | Root links and deep links redirect while the old name is not reused; deep links stay valid only if paths inside do not change. Gam's `vendor.sh` clones by name |
| Merge into ensigns, then archive | About 89 deep links on Gam and 3 on the Quarto pages point at frozen copies. `remotes::install_github("tiagojct/pequod", subdir = "r")`, npm `repository.directory` and r-universe `RemoteSubdir` point at paths that will move |
| Delete or make private | Everything above breaks, including Gam's vendor clone and all package metadata links |
| Rename gam to ensigns | `api.github.com/repos/tiagojct/gam/dispatches`, the image `ghcr.io/tiagojct/gam` (the VPS pulls it; the workflow pushes `ghcr.io/${{ github.repository }}`, so after a rename the VPS would keep running the old image), the container name, the Caddy route, the tunnel hostname, `CITATION.cff`, the Quarto page links, the GitHub About homepage and the `/projects/gam/` URL on tiagojacinto.eu |

## 7. The current site

Sources: inventory/gam.md, part A (code) and part B (site, build, deployment, CI, provenance).

### 7.1 Stack and pipeline

Plain JavaScript (ES modules), no framework, no TypeScript, npm with a lockfile, Vite 8 in multi-page mode, Vitest 5, `fflate` as the only runtime dependency. `engines` is unset; CI and the image use Node 20, which reached end of life on 2026-04-30, and Vite 8 and Vitest 5 declare Node 22.12 or later for some ranges. `npm run build` runs `build-model.mjs` (adapters to `model.json`, 222 KB), `render-pages.mjs` (one static `index.html` per route), `build-og.mjs` (three PNGs, resvg) and `vite build`. After `npm ci` and `vendor.sh` the build needs no network, takes 2.7 s, and is byte-identical on the same day. `dist/` is 65 files, 1.29 MB. Tests: 4 files, 231 tests, 2.4 s. The live site is 9 routes (`/`, four family pages, `/compare/`, `/carpenter/`, `/about/`, `/404/`) plus 41 official family files under `/official/`.

### 7.2 Pages and restyling

- Restyling uses CSS custom properties keyed by `data-family` and `data-mode` on any element, so a container with both attributes is a scoped preview. `theme.css` (56 KB) holds 80 properties per family and mode and one class per swatch (`.sw-<family>-<token>`), so no inline style is needed. No colour literal exists in the site's own CSS or JavaScript, and a test checks that every hex in `theme.css` exists in the model.
- Only 53 to 75 per cent of the colours in the model come from a family's token file (Pequod 75, Glauca and Try-Works 64, Ambergris 53). The rest come from official files the families ship or from named derivations. The home page says every colour is read from the family's token file, which is true only in that sense.
- Header picker: `public/theme.js` (blocking, before first paint) and `src/site.js` store `{family, mode}` in `localStorage['gam-theme']`. Without JavaScript the picker is empty, nothing is remembered, and the pages show Pequod following the system scheme. Home, family pages, Compare, About and 404 render fully; the sample dark and light switch works with radios and `:has()`. `/carpenter/` needs JavaScript.
- Copy that will need rewriting (exact text in inventory/gam.md part B, section 1.5): "four" families and "its own repository" on the home and Compare pages; "contrast locked by tests" (true of three families' own suites); "Every colour ... is read from the family's own token file"; the About page's "rebuilds whenever a family repository changes" (never true, see 7.4); the BibTeX entry, whose year comes from the build date; the Carpenter's "every generated file carries ... the commit it came from" (false live).

### 7.3 The "unknown" commit

Live footer: "Gam 0.1.0, built 2026-09-28 from Pequod 0.2.0-alpha (unknown), Glauca 0.1.0 (unknown), Try-Works 1.0.0 (unknown), Ambergris 0.3.0 (unknown)." The four About links go to `blob/unknown/...` and return 404; the Carpenter bundle carries `"commit":"unknown"`, so every generated file header and zip README says it.

Cause: `commitOf` (`src/model/load.js:31-39`) runs `git rev-parse --short HEAD` in each vendored clone and returns the string `unknown` on any error. The `node:20-alpine` build stage has no git, so the call exits 127, the fallback returns `unknown`, and the build still exits 0. The `.dockerignore` is not the cause. A no-git build reproduced all nine live pages byte for byte after normalising the date. CI stays green because the test that requires a hex commit runs in the `build-check` job (with git), while the image is built in the separate `publish` job, which runs no test.

Two hazards for the rebuild: `commitOf` can return the outer repository's SHA when a directory has no `.git` of its own; and a naive `grep unknown` guard fails a good build, because the Carpenter chunk contains the legitimate text "unknown CVD type". In the monorepo the SHA must come from outside the image build (a build argument or a file written before `docker build`), because the Docker context excludes the root `.git`; the guard must throw where the stamp is made.

### 7.4 CI and deployment

- One workflow, `.github/workflows/build-deploy.yml` (98 lines). Triggers: push to `main`, tags `v*` (no tag exists), `repository_dispatch` type `family-updated`, a weekly schedule (Mondays 04:17 UTC) and `workflow_dispatch`. Jobs: `build-check` (Node 20, `npm ci`, `vendor.sh`, tests, build) and `publish` (a second, independent `vendor.sh`, multi-arch build with QEMU and Buildx, push to `ghcr.io/${{ github.repository }}` with tags semver, `latest` and `sha-<short>`, GitHub Actions cache `mode=max`). `publish` has no `if:` guard, so a dispatch on any branch would move `latest`. The `sha` tag is overwritten on every rebuild. Actions are pinned by major tag. GitHub's run annotations say Node 20 actions are forced onto Node 24 and `ubuntu-latest` moves to Ubuntu 26 on 2026-10-19.
- Run history: 10 runs. Runs 1 to 7 (launch day) failed or were cancelled, 8 and 9 (push) and 10 (schedule, 2026-09-28) succeeded. Zero `repository_dispatch` runs. No family repository has a workflow or the sender (`deploy/family-dispatch.yml`), and no repository has an Actions secret, so `GAM_VENDOR_TOKEN` and `GAM_DISPATCH_TOKEN` are not set. The rebuild on family change described on the About page has never fired; only the weekly cron and pushes to gam rebuild the site.
- Deployment: pushing `latest` is the deploy. Watchtower on the VPS pulls it (stated as within five minutes; the VPS side was not inspected). Chain: browser, Cloudflare edge (proxied CNAME to the tunnel, created by hand), Cloudflare Tunnel (`cloudflared`, `service: https://localhost:8443`), Caddy (TLS on 8443 with a self-signed certificate, `reverse_proxy gam:80`), nginx in container `gam` over the external Docker network `proxy`. Files: `deploy/Dockerfile` (17 lines, unpinned `node:20-alpine` and `nginx:alpine`, no `USER`), `docker-compose.yml`, `Caddyfile.snippet`, `cloudflared-ingress.yml`, `nginx.conf` (56 lines).
- Per-host parts for `ensigns.tiagojacinto.eu`: a new Cloudflare CNAME (the name does not resolve today), a new tunnel ingress entry, a new Caddy snippet and two site blocks with `reverse_proxy ensigns:80`, a new compose service and image name (the new GHCR package must be made public by hand), and the site constants listed in inventory/gam.md part B, section 7.2. `nginx.conf` uses `server_name _`, so it holds no host name.
- The redirect from `gam.tiagojacinto.eu` exists nowhere. Caddy `redir` sends 302 unless told otherwise, plain HTTP is not redirected at the edge (no HSTS, Always Use HTTPS is off), and Cloudflare caches `/assets/*`, `/fonts/*` and images at the old host for up to a year, so an origin-side redirect does not replace cached objects; a purge or an edge redirect rule is needed for "every path". Legacy inputs to map: `/carpenter/?family=glauca` (unknown ids fall back to Pequod silently), `/official/<old-id>/...`, and the anchors on each page.
- Headers: nginx does not inherit `add_header` into a location that has its own, so the CSP and `nosniff` appear on HTML only, `/assets/*` gets `default-src 'none'`, fonts and official files get cache headers only, and COOP appears on four image files and never on documents. The CSP string sits in two places in the file. `expires` plus `add_header Cache-Control` sends two `Cache-Control` headers for `/official/`.

### 7.5 What the live CSP allows (probed in Chromium 154; other browsers unverified)

| Allowed | Blocked |
|---|---|
| swatches through classes and custom properties in a linked stylesheet; `element.style.setProperty` and `.style.x`; constructable stylesheets | inline `style=""`, `<style>` blocks, `setAttribute('style', ...)` |
| SVG filters (`<filter><feColorMatrix>` referenced by `filter: url(#id)` from an external stylesheet); SVG presentation attributes | inline scripts and event-handler attributes; `eval`, `new Function`, WebAssembly compile |
| a Worker file served under `/`; downloads through `<a download href="blob:...">`; `<img src="data:...">` | a Worker file under `/assets/` cannot fetch, `importScripts` or `import()` (the response carries `default-src 'none'`); blob and data workers; `fetch` or `<img>` of `blob:`; `data:` fonts; iframes; `<base>`, `<object>`, audio, video |

Vite's dev server sends no CSP, so violations show only on the deployed image. This means the Environments page can apply its simulations with SVG filters and class toggles, and a simulation worker would have to be served from the site root.

### 7.6 Privacy and defects

The live site sets no cookies, makes no third-party requests (6 to 8 same-origin requests per page), uses `localStorage` only for `gam-theme`, and has no inline code. Defects to fix or carry over: two broken images on `/glauca/` (`img/light.svg`, `img/dark.svg`), the dead Pequod "Project page" link, two glyphs (U+2318, U+21E7) outside the font subset, an invalid `CITATION.cff`, `vendor.sh`'s usage comment (`pequod=619982d` fails; only `main` or a full 40-character SHA works), family pages that link to `blob/main` while saying "read at commit", no `sitemap.xml` or `robots.txt`. Strengths to keep: no colour literal outside the model, an offline deterministic build, static CSP checks in the tests, a Carpenter that works under the strict CSP, and no third-party requests.

## 8. Name checks

Section 8 of the brief. Queries on 2026-09-29.

| Venue | Name | Result |
|---|---|---|
| npm | `ensigns` | free (404). `ensign` exists and is unrelated |
| npm | `@tiagojct/ensigns` | free (404). The scope is the npm user tiagojct, maintainer of `pequod-tailwind` |
| PyPI | `ensigns` | free (404) |
| CRAN | `ensigns` | free: package page 404, archive 404, crandb not found |
| Typst Universe | `ensigns` | free: absent from the package index (1,635 packages) |
| VS Code Marketplace | `tiagojct.ensigns` | free; text search for `ensigns` returns no extension |
| Open VSX | `tiagojct/ensigns` | free. Namespace tiagojct exists and is not verified |
| Zed | `ensigns` | free: no entry in `extensions.toml`; the search API returns only an unrelated fuzzy match |
| Obsidian community directory | Ensigns | free: 833 themes and 8,218 plugins in the GitHub lists and 1,305 themes in the current download feed checked; no name contains "ensign", and only Delightful resembles any family name |
| GitHub | `tiagojct/ensigns` | free. Unrelated projects named Ensign exist (Rotational Labs publishes `pyensign` on PyPI) |
| DNS | `ensigns.tiagojacinto.eu` | no record. The zone is on Cloudflare (destiny.ns.cloudflare.com, konnor.ns.cloudflare.com) |

To re-run the checks before scaffolding (the brief asks for this), set `n=ensigns` and run:

```bash
n=ensigns
curl -s -o /dev/null -w 'npm %{http_code}\n'        https://registry.npmjs.org/$n                      # 404 means free
curl -s -o /dev/null -w 'npm scope %{http_code}\n'  https://registry.npmjs.org/@tiagojct%2F$n
curl -s -o /dev/null -w 'pypi %{http_code}\n'       https://pypi.org/pypi/$n/json
curl -s -o /dev/null -w 'cran %{http_code}\n'       https://cran.r-project.org/web/packages/$n/index.html
curl -s https://packages.typst.org/preview/index.json | jq -r '.[].name' | grep -x $n                 # no output means free
curl -s https://open-vsx.org/api/tiagojct/$n | jq -r '.error'                                         # "not found" means free
curl -s "https://api.zed.dev/extensions?filter=$n&max_schema_version=1" | jq -r '.data[].id'          # look for an exact match
curl -s https://releases.obsidian.md/stats/theme | jq -r 'keys[]' | grep -i ensign                    # no output means free
curl -s -X POST https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery \
  -H 'Content-Type: application/json' -H 'Accept: application/json;api-version=7.1-preview.1' \
  -d '{"filters":[{"criteria":[{"filterType":7,"value":"tiagojct.'$n'"}]}],"flags":914}' \
  | jq '.results[0].extensions | length'                                                              # 0 means free
gh api repos/tiagojct/$n --jq .name                                                                   # 404 means free
dig +short $n.tiagojacinto.eu                                                                         # empty means free
```

Publishing rules checked in the official documentation:

- Obsidian (obsidian-developer-docs, "Submit your theme"): README.md, LICENSE, a screenshot (512 by 288) and manifest.json in the repository root; a GitHub release whose tag equals the manifest version (x.y.z) with manifest.json and theme.css attached; submission through community.obsidian.md with a linked GitHub account. Theme guidelines: no network calls (fonts and images embedded), a unique name without "Theme" or "Obsidian", no `!important`. The brief is right.
- Zed (docs, "Publishing Guide" and "Extension License Requirements"): `extensions.toml` supports `path = "packages/zed"` for an extension in a subdirectory; the licence file must be inside that directory (MIT and CC BY 4.0 both accepted); the submodule must be an HTTPS URL to a public repository, the commit on a branch; one extension per pull request, at most three open.
- Typst Universe (typst/packages, "Licensing"): OSI licences, CC BY, CC BY-SA or CC0; a file named `LICENSE` in the package; SPDX AND expressions allowed with the README naming what each covers; template folders should be MIT-0 or 0BSD.
- Quarto 1.10.18 (installed): brand.yml supports light and dark either as `{light, dark}` colour objects in one file or as `brand: {light: file, dark: file}`. Formats: html, dashboard, revealjs, typst. Typst and revealjs render the light brand unless `brand-mode: dark` is set.
- VS Code: a deprecated extension can name an alternative and shows a Migrate button; deprecation is requested in the Deprecated extensions discussion thread (microsoft/vscode-discussions).

## 9. Toolchain on this machine

| Tool | State |
|---|---|
| git 2.55.0, gh 2.101.0 (signed in as tiagojct, ssh protocol; scopes repo, workflow, read:org, gist, admin:public_key) | present |
| Node v24.21.0, npm 11.19.0 | present. No pnpm, yarn, bun or deno |
| Python | system 3.9.6 without pytest, Pillow, NumPy or PyYAML. uv 0.12.19 with cpython 3.12.14 |
| R 4.6.1 | present with ggplot2 4.0.3, jsonlite, knitr, rmarkdown, scales, colorspace 2.1.3, farver. Missing: testthat, roxygen2, devtools, pkgdown, rcmdcheck |
| Quarto 1.10.18, pandoc 3.11, TinyTeX (pdflatex, xelatex, lualatex) | present |
| Homebrew 7.0.7 | present |
| git-filter-repo, typst, docker, nginx | missing |
| Playwright | browsers cached (chromium 1243, headless shell); the npm package and its version are not installed |
| ICC profiles | only Generic CMYK Profile.icc; no coated profile (FOGRA39 or PSO Coated v3) for the Bachelor gamut check |
| Fonts | Atkinson Hyperlegible Next, JetBrains Mono and SF Mono are not installed |

## 10. Where the brief and the repositories disagree

| The brief says | What the repositories show | Detail |
|---|---|---|
| Pequod is 0.2.0-alpha | pequod.json, the root CHANGELOG, the v0.2.0 tag message and generated headers say 0.2.0-alpha; every registry and package manifest says 0.2.0; Python `__version__` still says 0.1.0 | inventory/pequod.md section 2 |
| Keep the mode labels Below deck and Parchment | They appear nowhere in the pequod repository. Only gam's adapter (`pequod.js:117`) hard-codes them | inventory/pequod.md section 8 |
| Aer light and Imum light are both #084B96; Flame light and Oil light are both #7A3A10 | Not in the token files. The collapse is in `generate.py` (Glauca line 1499, Try-Works line 576) | CHECKPOINT-1.md P5 |
| Home page says contrast is locked by tests | True of Glauca (18 rows), Try-Works (13) and Ambergris (23) in their own suites. Pequod has none. Gam locks eight chrome pairs and focus. The five failing Pequod pairs are untested | inventory/gam.md section 6 |
| Every footer reports commit unknown | Confirmed on the live site. Cause: the Docker build stage has no git, so `commitOf` falls back to "unknown" | inventory/gam.md section 7 |
| Pequod uses Viénot, Brettel and Mollon and should switch | Pequod and gam use Viénot 1999. Glauca and Try-Works scripts use Machado 2009. Gam's CVD text quotes the Machado-based conclusions while the code runs Viénot | inventory/gam.md section 3 |
| Prefer continuity with what gam uses (culori, apca-w3 suggested) | Gam has no colour library. All colour maths is hand-written (WCAG 2, Viénot, CIE76). No APCA, OKLab, OKLCH or gamut mapping | inventory/gam.md section 1.5 |
| Tags such as `ensigns@0.2.0`, continuing from Gam 0.1.0 | Gam has no tag or release. Only pequod has tags (v0.1.0, v0.2.0) | section 0 |
| Ambergris: no README, licence, changelog or CVD notes; ports dark only | Correct, and there is no CITATION either. An unmerged branch holds light-mode themes for seven hosts | CHECKPOINT-1.md D3 |
| Gam reads each family through one adapter | Pequod and Ambergris have one each; Glauca and Try-Works share `system.js` with a 45-line SPEC each | inventory/gam.md section 2 |
| Quotation "furred over with hoarfrost" | The text has `hoar-frost` | CHECKPOINT-1.md P1 |
| True Lamp is a dimmed paper for night reading | The repository defines True Lamp as the natural sun (ch. 96: "the glorious, golden, glad sun, the only true lamp—all others but liars!") | CHECKPOINT-1.md P11 |
| Gam rebuilds on `repository_dispatch` and weekly | Only the weekly schedule and pushes to gam have ever run. `repository_dispatch` has never fired: no family repository has a workflow or the sender, and no repository has an Actions secret | inventory/gam.md part B, section 5 |
| tiagojct.eu project pages | Gone. tiagojct.eu is a blog, and its project URLs return 404. The Pequod URL is in every published listing | section 6.1 |
| The Loomings palettes file "in Loomings' current format"; Rosebud for Loomings' interface | The file is a hand-copied JavaScript module with four families. Loomings has no chrome palette, and its Pequod is not the token file's Pequod | CHECKPOINT-1.md D18 |
| The five listings exist (Pequod) | Correct on every registry; usage is small (section 5) | section 5 |
