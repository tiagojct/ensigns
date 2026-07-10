# MarkEdit

A Glauca theme for [MarkEdit](https://github.com/MarkEdit-app/MarkEdit), built
on [MarkEdit-theming](https://github.com/MarkEdit-app/MarkEdit-theming).

MarkEdit is an editor, so it sits in Glauca's **code tier**: syntax uses the
same `glauca.json -> code` palette as the VS Code and Zed themes (light darkened
through the shared remap), the chrome reads the mode tokens (blue caret and
selection, muted gutter, seamless background), and Markdown links take the
folium green shared with the Obsidian/Miniflux tags.

## Files

- `colors.generated.js` — the Glauca `light`/`dark` colour sets, generated from
  `glauca.json` by `make generate` (drift-gated; do not edit by hand).
- `glauca.mjs` — the entry: feeds those colours to `overrideThemes`.
- `build.mjs` / `package.json` — bundle config (esbuild). MarkEdit-theming is
  bundled in; MarkEdit provides CodeMirror/Lezer and `markedit-api` at runtime,
  so those stay external.

## Build

```
make markedit        # from repo root: npm install (first run) + bundle
```

or, in this directory: `npm install && npm run build`. Output:
`dist/markedit/glauca.js` (a self-contained ES module).

## Install

Copy the bundle into MarkEdit's scripts folder and restart MarkEdit:

```
cp dist/markedit/glauca.js \
  "$HOME/Library/Containers/app.cyan.markedit/Data/Documents/scripts/"
```

The theme overrides MarkEdit's built-in light and dark themes, so it follows the
app's light/dark mode automatically — no theme to pick. Install IBM Plex (see
[../fonts/README.md](../fonts/README.md)) for the intended type; set the editor
font to IBM Plex Mono in MarkEdit's settings.
