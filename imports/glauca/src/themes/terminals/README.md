# Terminal presets

Generated from `glauca.json` (the `terminal` block) by `make generate`.

## Ghostty

`Glauca-Dark.ghostty` is the dark theme; `Glauca.ghostty` is the
light one. Install as named themes:

```
cp Glauca-Dark.ghostty ~/.config/ghostty/themes/Glauca
cp Glauca.ghostty ~/.config/ghostty/themes/Glauca
```

Then in `~/.config/ghostty/config`:

```
theme = Glauca
```

Or paste a file's contents straight into your config. Both share the same
16-colour identity palette; only the chrome (background, foreground, cursor,
selection) flips between modes.

## iTerm2

`Glauca-Dark.itermcolors` (dark) and `Glauca.itermcolors` (light).
Import via **Settings → Profiles → Colors → Color Presets… → Import…**,
then pick the preset from the same menu. Colours are sRGB; the same
identity-palette / flipped-chrome split as the Ghostty pair.

The ANSI red, yellow, and magenta are derived in the palette's low-saturation
register; the anchors supply the bright green (#62BA46) and bright blue
(#007AFF); the rest is the glaucous field.
