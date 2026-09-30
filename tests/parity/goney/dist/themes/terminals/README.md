# Terminal presets

Generated from `glauca.json` (the `terminal` block) by `make generate`.

## Ghostty

`Glauca-Dark.ghostty` is the dark theme; `Glauca.ghostty` is the
light one. Install as named themes:

```
cp Glauca.ghostty ~/.config/ghostty/themes/Glauca
cp Glauca-Dark.ghostty ~/.config/ghostty/themes/Glauca-Dark
```

Then in `~/.config/ghostty/config`:

```
theme = Glauca
```

Or, to follow the desktop appearance:

```
theme = light:Glauca,dark:Glauca-Dark
```

Or paste a file's contents straight into your config. The dark preset carries
the identity ANSI palette; the light preset derives its own light-tuned
palette (each colour darkened toward the ink until it clears the frost
background), and the chrome (background, foreground, cursor, selection)
follows the mode.

Beyond the sixteen ANSI slots and the chrome, each preset sets the colours
Ghostty would otherwise leave on its own defaults:

- **Search.** Ghostty's stock match colours are golden yellow and peach, which
  are off-system in both modes. Here the blue-rare rule does the work: candidate
  matches take the pale sea (`search-background`), so a screenful of hits stays
  calm, and only the focused match takes the accent (`search-selected-*`).
  Measured 8.5:1 and 6.4:1 dark, 9.8:1 and 5.3:1 light.
- **Splits.** `split-divider-color` follows the mode border,
  `unfocused-split-fill` the field.
- **Titlebar.** `window-titlebar-background` / `-foreground` are read only by
  the GTK app under `window-theme = ghostty`, and ignored elsewhere.

**Ghostty 1.3 or later** — the `search-*` keys arrived with terminal search, and
`split-divider-color` needs 1.1. On an older build, delete those lines from the
preset; the rest is valid back to 1.0.

### glauca.conf

`glauca.conf` is the optional companion: not a theme, just the two lines that
make the pair behave as one system — the `light:…,dark:…` theme pairing, and a
`minimum-contrast` floor of 1.1 so no program can paint text the same colour as
its background. It also carries a commented block that puts the macOS app icon
in the Glauca register (one blue mark on a frost screen), left off because
Ghostty documents `macos-icon = custom-style` as experimental.

Install it next to your config and pull it in:

```
cp glauca.conf ~/.config/ghostty/glauca.conf
```

```
# in ~/.config/ghostty/config
config-file = ?glauca.conf
```

The `?` makes the include optional, so the config still loads if the file is
missing. Note Ghostty's ordering rule: an included file is applied *after* the
file that includes it, so anything you want to win over `glauca.conf` belongs in
a further include, not above the `config-file` line.

## iTerm2

`Glauca-Dark.itermcolors` (dark) and `Glauca.itermcolors` (light).
Import via **Settings → Profiles → Colors → Color Presets… → Import…**,
then pick the preset from the same menu. Colours are sRGB; the same
identity-palette (dark) / light-tuned-palette (light) split as the Ghostty pair.

In the dark preset the ANSI red, yellow, and magenta are derived in the
palette's low-saturation register; the anchors supply the bright green
(#62BA46) and bright blue (#007AFF); the rest is the glaucous field.
