# Miniflux

`glauca.css` is a Glauca theme for [Miniflux](https://miniflux.app), generated
from `glauca.json`. Miniflux themes are pure CSS-variable sets, so this file
overrides them.

## Install

Copy the contents of [`../../dist/miniflux/glauca.css`](../../dist/miniflux/glauca.css)
into **Settings → Settings → Custom CSS**, then save.

For automatic light/dark, set **Appearance** to a **System** variant (System
Sans Serif / System Serif): Glauca renders Pruina (light) under a light OS
appearance and Profundum (dark) under a dark one. An explicit Light or Dark
theme still works — Glauca then follows the OS appearance for its light/dark
choice.

## Fonts

The CSS asks for IBM Plex Sans (UI + body) and IBM Plex Mono (code). Install
them on the machine viewing Miniflux (see [../fonts/README.md](../fonts/README.md));
otherwise the system sans/mono fallbacks apply.

## What it maps

Blue (dies) is the one accent — links, the logo mark, primary buttons, the
selected entry's border. Alert borders use the semantic hues (folium green for
success, bacca red for error, amber for warning, blue for info) over a neutral
panel so the alert text stays the readable body colour. Everything else is the
cold field: bg, surface, border, and muted meta text from the mode's tokens.
