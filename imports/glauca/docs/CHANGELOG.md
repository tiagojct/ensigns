# Changelog

## 0.1.0

First cut of Glauca, the light-first sibling of try-works: same single-source
machinery and guarantees, new identity built around three anchors — dies
#007AFF (the one rare blue mark: cold accent-bright, lit accent-deep, keyword,
cursor, ANSI bright blue), folium #62BA46 (strings, ANSI bright green, dataviz
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
scales and themes, Quarto HTML/Typst themes, print CMYK spec, and the 11ty
starter. All 13 WCAG rows pass; CVD close pairs are style-reinforced (italic
numbers join the existing bold keywords / italic types / italic comments);
drift gate covers 107 generated files.

Known 0.1.0 gaps: font fallback metrics are neutral placeholders until the
Plex TTFs are measured; P3 values are approximations pending an OKLab audit;
the specimen pages still show try-works content.

Fixed relative to the inherited machinery: assemble.sh's non-idempotent
`cp -r` (double-nesting of obsidian/img and quarto/example).
