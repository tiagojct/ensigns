# Glauca for VS Code

Two code themes from the Glauca palette, tuned for R and Python: **Glauca Light**
(Pruina, the flagship) and **Glauca Dark** (Profundum). Both work in
VS Code and in Positron (which reads VS Code themes and semantic tokens).

Keywords carry the blue mark (dies); strings are leaf green (folium); numbers
and constants the violet (viola); functions the working blue (lacus); types the
cyan (unda); decorators, namespaces and `pkg::` the red (bacca); comments the
ash grey (cinis). Semantic highlighting is on, so
Pylance and the R language server refine the colours further. The light theme is
a total remap of the dark one: same hues darkened toward the ink for WCAG-safe
contrast, a light-safe terminal palette, and hovers that darken instead of brighten.

Workbench coverage is exhaustive rather than sampled — every documented colour
key that would otherwise fall back to stock Dark+/Light+ is set from the
palette, so nothing in the window is a colour this system did not choose: tabs
in all their states, the activity bar, editor groups, marker navigation, the
merge editor, diff and multi-diff, rendered markdown, lists and trees, form
controls, panels, the terminal and its suggest icons, testing and coverage,
notebooks, settings, the SCM graph, extensions, chat and inline edits. Token
scopes cover LaTeX, BibTeX, and diffs alongside the R/Python core.

The blue splits by job on the dark side. The anchor #007AFF is the *mark* —
cursor, focus ring, button fill, the active tab's line — and is audited against
the editor field. As *text* on the chrome surfaces it measures 4.15:1 on the
sidebar and 3.68:1 on the raised surface, so blue text there takes the mode
accent instead (6.1:1). Both collapse to the same blue in the light theme.

## Install from source

Copy the `vscode/` folder to `~/.vscode/extensions/glauca-color-theme/`
(or build a vsix with `vsce package`). Restart, then pick **Glauca Light** or
**Glauca Dark** under Preferences: Color Theme. In Positron the
same path under its extensions folder works.

## File icons

**Glauca Icons** is a generated file-icon theme in the same palette:
monogram-on-chip file icons (Py, R, Nb, Qm, {}, ...) and hue-tinted outline
folders (src, data, docs, tests, ...). Typography is the icon. Select it under
Preferences: File Icon Theme after installing.

Generated from `glauca.json`; run `make generate` to rebuild.
