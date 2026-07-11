# Glauca for VS Code

Two code themes from the Glauca palette, tuned for R and Python: **Glauca**
(Profundum, dark) and **Glauca Cold (Pruina)** (light). Both work in VS Code
and in Positron (which reads VS Code themes and semantic tokens).

Keywords carry the blue mark (dies); strings are leaf green (folium); numbers
and constants the violet (viola); functions the working blue (lacus); types the
cyan (unda); decorators, namespaces and `pkg::` the red (bacca); comments the
ash grey (cinis). Semantic highlighting is on, so
Pylance and the R language server refine the colours further. The light theme is
a total remap of the dark one: same hues darkened toward the ink for WCAG-safe
contrast, a light-safe terminal palette, and hovers that darken instead of brighten.

## Install from source

Copy the `vscode/` folder to `~/.vscode/extensions/glauca-color-theme/`
(or build a vsix with `vsce package`). Restart, then pick **Glauca** or
**Glauca Cold (Pruina)** under Preferences: Color Theme. In Positron the
same path under its extensions folder works.

## File icons

**Glauca Icons** is a generated file-icon theme in the same palette:
monogram-on-chip file icons (Py, R, Nb, Qm, {}, ...) and hue-tinted outline
folders (src, data, docs, tests, ...). Typography is the icon. Select it under
Preferences: File Icon Theme after installing.

Generated from `glauca.json`; run `make generate` to rebuild.
