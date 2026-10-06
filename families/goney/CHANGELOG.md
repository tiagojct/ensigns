# Changelog

Goney was called Glauca until 0.1.0.

## 0.2.0 (2026-09-30)

Glauca becomes Goney, after the ship of chapter 52, and moves into the Ensigns repository. The token file is now `families/goney/goney.tokens.json`, in the Ensigns schema (`schema/family.schema.json`), and it replaces `src/glauca.json`. The mode labels stay: Pruina (light) and Profundum (dark).

Changed:

- Imum in Pruina (`accents.imum`, light mode) moves from #084B96 to #002E73. Glauca's generator mapped Aer and Imum to the same deep accent in light mode, so both were #084B96 and the blue trio could not be a distinct set. The other way out was to declare Imum an alias of Aer and take the pair out of the set. #002E73 sits at OKLab lightness 0.32, 0.099 from Aer under normal vision and at least 0.092 from it under every colour vision simulation, and it reaches 11.58:1 on the Pruina ground. The link hover, `extra.accent-deep` and the first step of the diverging scale keep #084B96. The change is recorded in `tests/shared/expected-changes/goney.json`.
- Every other colour equals Glauca 0.1.0 as the old Gam site read it, which `tests/shared/equality.test.ts` checks. The light syntax colours and the light terminal, which Glauca's generator computed, are now written out as palette entries.
- Colour vision is measured with the matrices of Machado, Oliveira and Fernandes (2009) at severity 1.0 in linear light, with distances in OKLab. Glauca's own check was a report that never failed. Now the normal-vision distance of each distinct set is a gate, and the syntax and ANSI sets are reported under simulation. The Pruina syntax hues hold a floor of 0.045 set by function and type, under the 0.06 target, and several syntax pairs fall below 0.06 under simulation; the README lists them. Retuning them is an open decision.

Added:

- The distinct set `blue-trio` (Dies, Aer and Imum), a gate in both modes under normal vision and under every simulation.
- 14 declared contrast pairs and the rule checks `one-mark` and `hover-direction`.
- One waiver: in Profundum the keyword colour #007AFF is 4.15:1 on the current line, below the 4.5:1 of the editor profile. The options recorded with it are to lighten the keyword, to soften the current-line highlight or to accept the shortfall.

The Unreleased section below records work on Glauca after 0.1.0 that was never tagged. Because the migration read the last commit of the Glauca repository, dated 2026-09-11, this release carries the colour values of that work. Its new targets (Firefox, Thunderbird, Zotero) and the older Glauca targets are not generated in this release; their generators will be ported in a later phase. This folder's README was rewritten for Ensigns, and its installation notes will return with the packages.

## Unreleased

Three surfaces added, two deepened. Still 0.1.0; nothing was published.

Added — the reading-and-reference set, the hours of the named workflow that
were still lit by someone else's palette:

- Firefox (`dist/firefox/`) — a static theme carrying both modes in one
  package (`theme` is Pruina, `dark_theme` is Profundum, each declaring its own
  `color_scheme`). The window is three flat steps of the field; the blue marks
  the selected tab's line, the focused address field, the selection inside it,
  and an icon in attention state, and nothing else. Menu highlights take the
  sea. Packaged as `Glauca.xpi`.
- Thunderbird (`dist/thunderbird/`) — the same chrome table against
  Thunderbird's own key set, plus `sidebar_highlight_border` for the folder
  tree and message list; the Firefox-only keys are dropped. One shared builder,
  so the two cannot drift apart.
- Zotero 7 (`dist/zotero/`) — a `userChrome.css` drop-in that re-declares
  Zotero's colour custom properties for both schemes. Two things this needs and
  most hand-written Zotero themes get wrong: every declaration carries
  `!important` (userChrome.css is a user sheet and loses the normal cascade to
  Zotero's own author sheet), and Zotero's six composite colours and eleven
  opaque tag swatches are baked rather than `var()`-based, so they are
  recomputed here instead of inherited. Selection is pinned to the mode blue —
  Zotero otherwise takes `--color-accent` from the OS on macOS and Linux, so a
  system accent of orange would paint the rows of a frost-bloom window. Tag
  hues come from the CVD-safe Okabe-Ito set, nudged to clear 3:1.

Improved:

- VS Code — workbench coverage from 453 to 887 keys, closing every
  documented surface that had been falling back to stock Dark+/Light+: the
  activity bar, the full tab matrix (selected, unfocused, modified, drag),
  editor groups, marker navigation, the merge editor, diff and multi-diff,
  rendered markdown and alerts, lists and trees, buttons/checkboxes/radios/
  gauges, status-bar hover pills, panels, the terminal and its suggest icons,
  testing and coverage, notebooks, settings, the SCM graph, extensions, chat
  and inline edits. Every value is palette-derived, so the light theme's total
  remap still covers the lot by construction. Token scopes added for LaTeX,
  BibTeX, and diffs.
- Zed — the twelve keys the theme was missing against Zed's own shipped
  theme: `editor.hover_line_number`, `search.active_match_background`, the four
  `version_control.*` word/conflict-marker keys, and the syntax keys
  `variable.parameter`, `punctuation.markup`, `selector`, `selector.pseudo`,
  `diff.plus`, `diff.minus`.
- Ghostty — the presets now set the colours Ghostty otherwise leaves on its
  own defaults. Search was the real find: the stock match colours are golden
  yellow and peach, so both presets now put candidate matches on the pale sea
  and only the focused match on the accent (8.5:1 / 6.4:1 dark, 9.8:1 / 5.3:1
  light). Split divider, unfocused-split fill, and the GTK titlebar pair follow
  the mode. A companion `glauca.conf` carries the light/dark theme pairing, a
  `minimum-contrast` floor, and a commented macOS app-icon block. Needs
  Ghostty 1.3 for the `search-*` keys; the README says so and says what to drop
  on older builds.

Guarantees:

- `validate.py` grows from 13 contrast rows to 18, locking the pairs the new
  surfaces depend on: the sea as a selection fill in both modes, and the deep
  blue used as a fill rather than a hover (the Zotero selected row, which
  carries both ink and white icon strokes).
- Zotero's light `fill-secondary` measured 3.7:1 when Zotero's own alpha ladder
  was applied to the Glauca ink, which is softer than the pure black that
  ladder was calibrated against. The two text-bearing rungs now solve for the
  ratio instead of copying the alpha.
- CI parses every generated `.json` under `dist/`, alongside the existing node
  parse of the Tailwind preset.
- The Firefox manifest passes `web-ext lint` with zero errors, warnings, and
  notices, including the `data_collection_permissions` declaration that
  addons.mozilla.org has required of new submissions since November 2025 (a
  static theme collects nothing, so `"none"` stands alone). `make firefox-lint`
  and `make firefox-sign` run the validation and the unlisted signing that a
  permanent install on release Firefox needs.

## 0.1.0

First cut of Glauca, the light-first sibling of try-works: same single-source
machinery and guarantees, new identity built around three anchors — dies
#007AFF (the one rare blue mark: light accent-bright, dark accent-deep, keyword,
cursor, ANSI bright blue), folium #62BA46 (strings, ANSI bright
green), cinis #8C8C8C (exactly the dark mode's muted text). Modes: Pruina
(light, the default at :root) and Profundum (dark). Type: IBM Plex Serif /
Sans / Mono. Vocabulary: saxum, glaucum, caelum, pruina core tiers; folium,
bacca, viola, lacus, unda extended; per-mode support tints are the neutral
tint-* keys.

Inherited complete from the try-works machinery: CSS + typography roles +
a11y/motion/P3 layers, Tailwind preset, Typst slides + poster, Obsidian theme
(with Style Settings, custom checkboxes, focus mode, file-explorer icons), VS
Code light + dark themes + monogram icon theme, Zed family, Ghostty + iTerm2
presets, oh-my-zsh prompts, Vivaldi themes, R/ggplot2 + Python/matplotlib
scales and themes, Quarto HTML/Typst themes, print CMYK spec, the Miniflux
reader stylesheet, the MarkEdit theme, the PowerPoint templates, and the 11ty
starter. All 13 WCAG rows pass; CVD close pairs are style-reinforced (italic
numbers join the existing bold keywords / italic types / italic comments);
drift gate covers 110 generated files.

Known 0.1.0 gaps: P3 values are deliberately chroma-boosted approximations
pending an OKLab audit.

Fixed relative to the inherited machinery: assemble.sh's non-idempotent
`cp -r` (double-nesting of obsidian/img and quarto/example).

Review pass before first release (still 0.1.0; nothing was published):
- Tailwind preset was invalid JavaScript (unquoted `2xl`/`3xl`/`4xl` keys);
  `_js()` now quotes non-identifier keys and CI parses the file with node.
- The spacing border width token collided with the mode border colour under one
  name; the width is now `--gl-border-width`.
- Extended-tier hues removed from the Tailwind preset (web surface; the tier
  rule keeps them to code and terminals).
- Typst `dies` token now carries the true anchor #007AFF; the working blue for
  dark slides is the new `accent` token (`sea` renamed to `tint`).
- Quarto ships a light highlight theme (`glauca.theme`) alongside the dark one
  (`glauca-dark.theme`); the example config pairs them.
- Light terminals: white and bright-black were the same colour; the grey
  registers are now four distinct inks. Dark ANSI blue/magenta lifted to 4.5:1
  on the dark bg; dark cursor-text is ferrum (the locked on-blue pair).
- Obsidian light mode: callout, graph-label, canvas-label, and error hues now
  go through the light-safe darkening (they were raw mid-tones at 1.8–3:1);
  the type-role italic lands on `.cm-tag` (the class Obsidian actually colours
  from `--code-tag`); dead `--color-mark` and `--text-highlight-bg-active`
  variables dropped; manifest requires Obsidian 1.12.
- Font fallback metrics computed with fontTools (real size-adjust and line
  metrics, no longer neutral placeholders); payload_kb filled in.
- omz light prompt dim-path segment lifted to the 3:1 UI floor; the R discrete
  scales stop passing the deprecated `scale_name` argument; R/Python plot
  helpers expose the mode accent.
- Brand assets were still the try-works fire set (flame logos, Moby-Dick
  cover, ember preview SVGs); replaced with the bloom emblem — a single blue
  point on a pale disc — a Glauca cover, and palette-true previews.
- VS Code picker: the plain "Glauca" label now points at the light theme
  (light-first), the dark one is "Glauca (Profundum)".
- Stale `lit`/`cold` mode names and try-works phrasing purged from docs,
  READMEs, and install snippets; repository URLs moved to git.tiagojct.eu.
