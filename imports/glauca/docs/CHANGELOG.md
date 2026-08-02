# Changelog

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
