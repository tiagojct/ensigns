# Changelog

All notable changes to Pequod will be documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html),
with the understanding that versions below 1.0 are alpha and breaking
changes may still occur between 0.x releases.

## [0.3.0] - 2026-09-30

Pequod moves into the Ensigns repository as its host family. The token file is now `families/pequod/pequod.tokens.json`, in the Ensigns schema (`schema/family.schema.json`), and it replaces `pequod.json`. This release corrects the crew colours that failed WCAG AA as text, and it takes into the token file the colours that the shipped themes used. 42 values differ from 0.2.0; `tests/shared/expected-changes/pequod.json` lists each one with its address, mode, old value, new value and reason.

### Changed

- Crew accents corrected (decision D10 in `docs/migration/CHECKPOINT-1.md`). Five crew colours failed WCAG AA as text in 0.2.0: Starbuck, Stubb, Tashtego and Ishmael on Parchment, and Daggoo on Below deck. A crew colour is text on the page and a syntax colour in the editor, so each correction clears 4.5:1 on the page, the editor background and the current line, and 3:1 on the selection. The smallest OKLab distance within the crew may not fall below its 0.2.0 value in either mode: 0.1124 in Parchment and 0.0879 in Below deck, Ishmael and Tashtego in both. The search in `scripts/design/pequod-corrections.ts` moved lightness first and moved hue and chroma only where the distance rule needed it.

  | Crew | Mode | 0.2.0 | 0.3.0 | 0.2.0 on page, editor, current line, selection | 0.3.0 on the same |
  |---|---|---|---|---|---|
  | Daggoo | Below deck | #A17069 | #A7766F | 4.35, 4.35, 4.15, 3.35 | 4.72, 4.72, 4.51, 3.64 |
  | Ahab | Parchment | #A83732 | #931432 | 4.99, 5.84, 4.86, 4.31 | 6.81, 7.96, 6.64, 5.88 |
  | Starbuck | Parchment | #0082B1 | #006A98 | 3.37, 3.94, 3.28, 2.91 | 4.62, 5.41, 4.51, 3.99 |
  | Ishmael | Parchment | #76716B | #6A6164 | 3.74, 4.38, 3.65, 3.23 | 4.63, 5.42, 4.52, 4.00 |
  | Stubb | Parchment | #CA6435 | #AA430B | 3.02, 3.53, 2.94, 2.61 | 4.62, 5.41, 4.51, 3.99 |
  | Tashtego | Parchment | #177C55 | #06724B | 4.01, 4.69, 3.91, 3.46 | 4.62, 5.41, 4.51, 3.99 |

  Ahab passed every gate in 0.2.0 and moved anyway. Stubb has to lose about 0.1 of OKLab lightness to reach 4.5:1, and with Ahab held fixed the best result of the search left Ahab and Stubb 0.055 apart, about half the floor. Ahab darkens and turns about 11 degrees towards crimson (OKLCH hue 27 to 15). The smallest crew distance is now 0.1127 in Parchment (Ahab and Stubb) and 0.0880 in Below deck (Ishmael and Tashtego). Queequeg, Pip and Daggoo on Parchment and the other seven Below deck colours are unchanged. The six palette changes reach every role that uses these colours: 24 recorded addresses in accents, syntax, ANSI and chart colours, and the status colours with them.

- The themes' own colours become tokens (decision D16). The editor and terminal themes held 28 colours that `pequod.json` did not; they are now named palette entries in the groups `ansi-dark`, `ansi-light`, `chrome`, `zed-dim-light` and `iterm`. Where `pequod.json` and the themes disagreed, the themes' colour wins. People who used the themes see no change from these rows: the token file and the site now describe what the themes drew. The 0.2.0 values below are the ones the old Gam site showed.

  | Mode | Address | 0.2.0 | 0.3.0 | Reason |
  |---|---|---|---|---|
  | Below deck | roles.text-muted | #BD8C68 | #BFBBB6 | the dark theme draws muted text as Ishmael (descriptionForeground), pequod.json says Log 300 |
  | Below deck | roles.link | #BD8C68 | #9DC2C5 | the dark theme draws links in the hand-tuned cyan, pequod.json says Log 300 |
  | Below deck | roles.link-hover | #BD8C68 | #9DC2C5 | link hover keeps the link colour, which changed |
  | Below deck | syntax.variable | #A17069 | #EAE1D7 | the themes draw plain variables in the text colour, pequod.json says Daggoo |
  | Below deck | data.plot.muted | #BD8C68 | #BFBBB6 | chart muted text follows text-muted, which changed |
  | Parchment | roles.focus | #A16E50 | #163F54 | the light theme draws focus in Log 700 (focusBorder), pequod.json says Log 400 |
  | Parchment | syntax.variable | #552823 | #0D2F42 | the themes draw plain variables in the text colour, pequod.json says Daggoo |
  | Parchment | ansi.black | #0C222F | #0D2F42 | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | ansi.cyan | #0C7F83 | #163F54 | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | ansi.bright-red | #893535 | #C56860 | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | ansi.bright-green | #156D51 | #678B6A | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | ansi.bright-yellow | #57450D | #C49A3E | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | ansi.bright-blue | #03719B | #6893AE | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | ansi.bright-magenta | #203B75 | #6064A3 | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | ansi.bright-cyan | #0C6F76 | #6A8C8F | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | ansi.bright-white | #0D2F42 | #A89F8D | the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them |
  | Parchment | terminal.background | #EAE1D7 | #F7F3EE | the light theme draws the terminal on Log 50; the old site derived Log 100 |
  | Parchment | terminal.cursor-text | #EAE1D7 | #F7F3EE | cursor text follows the terminal background |

- The Log scale is documented as a warm-to-cool scale and not as a sequential colormap, because its hue turns between Log 500 and Log 600 (rule `warm-to-cool`, and the label of the chart scale in the token file).

### Added

- 19 declared contrast pairs, checked by the office-screen profile. The editor profile checks every syntax colour on the editor background, on the current line and on the selection.
- Distinct sets `crew-dark` and `crew-light`, which are gates with the 0.2.0 minimum as their floor under normal vision and 0.06 under simulation, and `syntax-hues` and `ansi-hues`, which are reported under simulation. Reinforced crew pairs: two in Below deck (Ishmael and Tashtego, Ahab and Tashtego) and six in Parchment (those two, Ahab and Pip, Pip and Stubb, Ahab and Daggoo, Starbuck and Tashtego). Code keeps them apart by token shape and position, and comments are italic.
- The rules `crew` and `warm-to-cool`.

### Changed (measurement)

- Colour vision is simulated with the matrices of Machado, Oliveira and Fernandes (2009) at severity 1.0 in linear light, and distances are measured in OKLab. The ΔE figures in the entries below come from `scripts/cvd_check.py` (Viénot, Brettel and Mollon, CIE76) and cannot be compared with the new ones. Measured the new way, the 0.2.0 Parchment crew had four pairs below 0.06 under some simulation and the corrected crew has six; Starbuck and Tashtego under tritan went from 0.066 to 0.028.

### Notes for upgraders

- Anything that copied a 0.2.0 crew value by hex needs the new values above. The published packages on CRAN, PyPI, npm, the VS Code Marketplace and Open VSX are still 0.2.0.
- The Log scale and all Below deck crew colours except Daggoo are unchanged.
- The installation notes left the family README. They will return with the packages, which a later phase generates from the token file; until then the old package sources are in `legacy/pequod`.

## [0.2.0-alpha] — 2026-04-30

A perceptual-correctness rewrite of the palette tokens. The Log
sequential scale now has monotonic, evenly-spaced luminance, and every
crew accent has been re-tuned in CIE-LCh to (a) clear AA-large contrast
on its target surface and (b) survive protanopia and tritanopia
simulation with worst-case ΔE ≥ 10 — fixing the catastrophic CVD
collapses documented under v0.1's "Known limitations".

### Changed (breaking — palette tokens)

- Log scale, all twelve stops repigmented. Step sizes are now
  evenly-spaced in CIE L\*: ΔL\* between successive stops ranges 5.0 to
  11.1 (was 1.2 to 25.7), and the scale is strictly monotonic — v0.1
  had a luminance reversal at step 8→9 (Log 600 was darker than Log
  700) that produced "stripey" contour rings on continuous fills. New
  hex codes:

  | Stop | v0.1 | v0.2 |
  |---|---|---|
  | Log 50  | `#FBFAF5` | `#F7F3EE` |
  | Log 100 | `#F8F4EB` | `#EAE1D7` |
  | Log 150 | `#ECE5D3` | `#DBC9B6` |
  | Log 200 | `#DFD3B8` | `#CFAD8E` |
  | Log 300 | `#C4A57B` | `#BD8C68` |
  | Log 400 | `#A8865E` | `#A16E50` |
  | Log 500 | `#8B7B6B` | `#835A49` |
  | Log 600 | `#6E5F52` | `#335260` |
  | Log 700 | `#527275` | `#163F54` |
  | Log 800 | `#2C3E50` | `#0D2F42` |
  | Log 900 | `#1C2936` | `#0C222F` |
  | Log 950 | `#13181F` | `#0B1720` |

- Crew accents (light variants) retuned. Each character keeps its
  hue role (red = Ahab, blue = Starbuck, …), but L\* is now laddered
  across the readable range [22, 54] so confusable hue pairs separate
  by lightness even under CVD. Ahab leans vermillion (h ≈ 32°) and
  Tashtego leans cyan-green (h ≈ 160°) for better deutan separation.
  Pip moves from a saturated mustard at L\* 24 to a deeper ochre at
  L\* 34 — keeps "warm yellow" character while gaining tritan distance
  from Stubb.

  | Crew | v0.1 light | v0.2 light |
  |---|---|---|
  | Ahab     | `#B5534A` | `#A83732` |
  | Starbuck | `#527C98` | `#0082B1` |
  | Queequeg | `#4A4E8C` | `#253E82` |
  | Pip      | `#A8812B` | `#6A4A00` |
  | Ishmael  | `#6E6E6B` | `#76716B` |
  | Stubb    | `#B5683A` | `#CA6435` |
  | Tashtego | `#507352` | `#177C55` |
  | Daggoo   | `#7A5440` | `#552823` |

- Crew accents (dark variants) repaired. v0.1's dark variants sat
  at clustered L\* ≈ 50 with several pairs collapsing to the same
  shade under deutan; v0.2 spreads them across L\* [58, 90] for
  deutan/protan separation and pulls the saturation down so they read
  as comfortable on Log 950 ink rather than glaring.

  | Crew | v0.1 dark | v0.2 dark |
  |---|---|---|
  | Ahab     | `#E07A72` | `#E3877C` |
  | Starbuck | `#7FA8C3` | `#A6DFFF` |
  | Queequeg | `#8A8ECE` | `#838CCF` |
  | Pip      | `#D9B461` | `#DEC577` |
  | Ishmael  | `#A5A5A0` | `#BFBBB6` |
  | Stubb    | `#E29B6E` | `#FFD9BB` |
  | Tashtego | `#8AB08C` | `#82C4A2` |
  | Daggoo   | `#AF8870` | `#A17069` |

- All theme files (VS Code light + dark, Zed, iTerm2, Alacritty,
  Ghostty, kitty, WezTerm, tmux, Windows Terminal), the Tailwind
  plugin, the Typst specimen, the project page, and all auto-
  generated R/Python data have been re-emitted from the new tokens.
  No hand-edited file should still reference a v0.1 hex.

### Improved

- Light-mode contrast. v0.1 had Pip (3.3 : 1), Stubb (3.8), and
  Starbuck (4.1) all failing AA-large on Log 100. In v0.2, every
  light-mode accent clears AA-large (3 : 1) and four of eight clear
  AA-body (4.5 : 1): Daggoo 9.5 : 1, Queequeg 7.8, Pip 6.3, Ahab 5.0.
- CVD safety, measured by `make cvd`:

  | Simulation | v0.1 worst pair | v0.2 worst pair |
  |---|---|---|
  | protanopia (light)   | Ahab ↔ Daggoo, ΔE 4.6     | Ishmael ↔ Tashtego, ΔE 15.1 |
  | protanopia (dark)    | Ahab ↔ Daggoo, ΔE 2.8     | Stubb ↔ Tashtego, ΔE 11.8   |
  | deuteranopia (light) | (close pairs documented)  | Ishmael ↔ Tashtego, ΔE 8.0  |
  | deuteranopia (dark)  | (close pairs documented)  | Ishmael ↔ Tashtego, ΔE 6.8  |
  | tritanopia (light)   | Pip ↔ Stubb, ΔE 1.0       | Pip ↔ Daggoo, ΔE 13.3       |
  | tritanopia (dark)    | Pip ↔ Stubb, ΔE 2.3       | Ahab ↔ Pip, ΔE 10.2         |

  The single residual "close" pair under deuteranopia is Ishmael ↔
  Tashtego (green-collapses-to-grey is mathematically unavoidable for
  any palette that includes both a saturated green and a low-chroma
  grey at similar L\*); the comment / string distinction it codifies is
  rarely encoded by colour alone in practice, and the default theme
  italicises comments anyway.

### Added

- `scripts/design_palette.py` — the LCh palette designer used to lay
  out v0.2 stops. Reports per-stop L\*/C/h, ΔL\* between successive
  log stops, and pairwise ΔE under all three CVD simulations so the
  next palette revision can iterate with the same constraints.

### Notes for upgraders

This is a token-level breaking change. Anything that referenced a v0.1
hex code by literal value (custom themes, screenshots, design mocks,
brand-style guides) needs to be re-pulled from `pequod.json`.
Downstream consumers that import the canonical token file (R, Python,
Tailwind, the editor themes) pick up the new values automatically on
upgrade.

## [0.1.0-alpha] — 2026-04-23

First public release.

### Added

- `pequod.json` — canonical palette tokens: twelve-step Log base scale,
  eight crew accents (each with light/dark variants and syntax role),
  light- and dark-mode role mappings, and default syntax assignments.
- `themes/Pequod.itermcolors` — iTerm2 dark colour scheme.
- `themes/Pequod-color-theme.json` — VS Code dark theme.
- `themes/Pequod-light-color-theme.json` — VS Code light theme.
- `themes/Pequod.zed.json` — Zed theme family with dark and light
  variants in a single file.
- `scripts/cvd_check.py` — Viénot–Brettel–Mollon CVD simulation with
  pairwise ΔE reporting for all eight accents across protanopia,
  deuteranopia, and tritanopia, for both light and dark variants.
- Licence files: CC-BY-4.0 for the palette tokens and documentation,
  MIT for the theme files and scripts.

### Added (follow-up)

- `specimen/specimen.typ` + rendered `specimen/specimen.pdf` — a
  one-page A4 reference showing the Log scale, the eight crew
  accents (light and dark variants), a body-text sample, and a dark
  code sample with every token coloured by its crew role. Rendered
  with Typst against system-installed Geist / Geist Mono.
- `r/` — an installable R package. Exposes `pequod_log`,
  `pequod_crew_light`, `pequod_crew_dark`, `pequod_crew`, a general
  `palette_pequod()` helper (discrete + continuous, six named
  palettes), ggplot2 scales `scale_color_pequod_d/c` and
  `scale_fill_pequod_d/c` (both UK and US spellings), and a
  `pequod_preview()` base-R visualiser. Install with
  `remotes::install_github("tiagojct/pequod", subdir = "r")`.
  Palette data is generated from `pequod.json` by
  `r/data-raw/generate_palettes.R`, so the R package cannot drift
  from the canonical tokens.
- `Makefile` — `specimen`, `cvd`, `r-data` (regenerate the R
  palette from the JSON), `r-check` (R CMD check), and `clean`
  targets.
- `cover.jpg` bundled in the repo root (README no longer depends on
  an external URL).

### Fixed (follow-up)

- `specimen/specimen.typ`: accent-chip text colour was inverted
  (cream on already-light chips, navy on already-dark chips) and
  hex labels were clipped by the column width. Flipped the colour
  logic and widened the chips to 5.2em.

### Added (2026-04-26, batch 2)

- `themes/terminals/` — six dark terminal presets that share the same
  ANSI palette mapping (Log 950 background, Log 100 foreground, crew
  dark variants on ANSI 1–6, brighter shades on 9–14):
  Ghostty (`Pequod.ghostty`), Alacritty (`Pequod.alacritty.toml`),
  kitty (`Pequod.kitty.conf`), WezTerm (`Pequod.wezterm.lua`),
  tmux (`Pequod.tmux.conf`), and Windows Terminal
  (`Pequod.windowsterminal.json`). Per-terminal install paths in
  `themes/terminals/README.md`.
- `tailwind/` — Tailwind CSS plugin published as `pequod-tailwind`
  on npm. Exposes `log`, `crew`, and a merged `colors` ready to
  spread into `theme.extend.colors`. Each crew accent has `DEFAULT`,
  `light`, and `dark` so `bg-ahab` resolves to the saturated value
  while `bg-ahab-dark` is available for dark-theme contexts.
  TypeScript types via `index.d.ts`. Six Node-runner tests for
  shape, hex format, freezing, and anchor values. Tarball is
  4.5 KB packed; tested against Tailwind v3 config.
- Makefile: new `tw-test`, `tw-pack`, `tw-publish` targets.

### Added (2026-04-26)

- `python/` — an installable Python package. Pure-Python data and
  helpers (`LOG`, `CREW_LIGHT`, `CREW_DARK`, `CREW`, `palette()`)
  with no required dependencies, plus optional matplotlib glue
  (`to_cmap()`, `register_cmaps()`) under the `[plot]` extra.
  Six named palettes (`log`, `log-warm`, `log-cool`, `crew`,
  `crew-dark`, `syntax`), discrete and continuous interpolation,
  reverse flag. Built with hatchling; published as `pequod` on PyPI.
  Data regenerated from `pequod.json` by
  `python/data-raw/generate_data.py`. 22 pytest tests covering the
  pure-Python API and the matplotlib integration; tests skip
  cleanly when matplotlib isn't installed.

### Added (2026-04-25)

- `vscode/` — the dark and light themes packaged as a Visual Studio
  Marketplace extension. Includes `package.json`, README,
  CHANGELOG, MIT LICENSE, a 128×128 icon (eight crew accents on a
  Log 950 background), and `.vscodeignore`. Build the .vsix with
  `make vsix`; publish with `make vsce-publish` (requires a
  publisher account and PAT). Theme files inside `vscode/themes/`
  are copies of the canonical files under `/themes/`. Marketplace
  extension ID: `tiagojct.pequod-color-theme` (the `pequod-theme`
  slug was already reserved on the VS Marketplace global
  namespace, so this one falls back to the more explicit
  VS-Code-convention name).

### Known limitations

- Theme files are hand-maintained; they do not yet regenerate
  automatically from `pequod.json`. Generators are the next
  priority — until they exist, tokens in `pequod.json` and colours
  in the theme files must be kept in sync by hand.
- No iTerm2 light preset yet.
- Light-mode contrast on Log 100 for Pip (3.3), Stubb (3.8), and
  Starbuck (4.1) falls below AA-body; these accents are tuned for
  bold, large text, or UI use. The dark-mode counterparts all clear
  AA-body on Log 950.
- Under tritanopia, Pip and Stubb collapse to near-identical values
  (ΔE 1.0 / 2.3). Under protanopia, Ahab and Daggoo collapse
  (ΔE 4.6 / 2.8). Do not rely on colour alone for these pairs —
  pair with icon, weight, or position.
