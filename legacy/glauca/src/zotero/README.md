# Glauca for Zotero 7

A full Glauca theme for Zotero 7, light and dark, as a `userChrome.css`
drop-in. No plugin, no build step.

`userChrome.css` is generated from `src/glauca.json` — edit the json and run
`make generate`, never the CSS.

## How it works

Zotero 7 is Gecko-based and paints its entire interface from a flat set of CSS
custom properties (`--accent-*`, `--fill-*`, `--color-*`, `--tag-*`), declared
on `:root` inside a `prefers-color-scheme` query. Re-declaring that set *is* the
theme, and Zotero's own **Appearance** preference (Automatic / Light / Dark)
keeps working, because Zotero forces the colour scheme rather than reading the
OS directly.

Two details make the difference between this working and doing nothing:

- Every declaration carries `!important`. `userChrome.css` loads as a *user*
  stylesheet, and in the CSS cascade a normal user declaration loses to a normal
  author declaration — which is what Zotero's own values are. Without
  `!important`, nothing changes.
- Zotero derives six composite colours and eleven opaque tag swatches from the
  base set *at build time*, so they are plain hex, not `var()` references.
  Overriding only the base set would leave those composites on Zotero's grey.
  They are recomputed here from the Glauca values instead. (The `--material-*`
  family *is* `var()`-based, so it follows for free.)

## What it paints

The panes are three flat steps of the field, in Zotero's own order: the item
pane is the top surface, the toolbar sits below it, the sidepane below that. In
light that runs paper → surface → field; in dark it inverts, which is how the
mode tokens already stack. The `--fill-*` ladder is the mode's ink at Zotero's
own six alpha steps, so text, icons, and dividers keep their intended weights.

Selection is pinned to the Glauca blue. Zotero takes `--color-accent` from the
operating system on macOS and Linux, so a system accent of orange or pink would
paint the selected rows of a frost-bloom window; this sets it to the mode accent
with the audited on-accent ink. Focus rings are deliberately left to Zotero,
which tunes them per platform.

Tag colours are categorical marks, so they come from the same place every other
categorical encoding in this system does: the colour-blind-safe Okabe-Ito set,
with the extended tier filling the names it has no hue for. Zotero's eleven tag
names are fixed and unchanged — only the hue behind each one moves, nudged
toward the mode's ink until it clears 3:1 on the content background. That is the
non-text floor, not the body one: a tag is a swatch first and a short label
second, and holding it to 4.5:1 would drag the yellow to olive.

## Install

1. Find your Zotero **profile** folder:
   - macOS: `~/Library/Application Support/Zotero/Profiles/<random>.default/`
   - Linux: `~/.zotero/zotero/<random>.default/`
   - Windows: `%APPDATA%\Zotero\Zotero\Profiles\<random>.default\`

   (This is the *profile* folder, not the data directory that holds `zotero.sqlite`.)
2. Create a `chrome` folder inside it if there isn't one, and copy
   `userChrome.css` in — so you end up with `…/<profile>/chrome/userChrome.css`.
3. In Zotero, **Edit → Settings → Advanced → Config Editor**, and set
   `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`. Zotero, like
   Firefox, ignores `userChrome.css` unless this is on.
4. Restart Zotero.

To switch modes, use **Edit → Settings → General → Appearance**. To remove the
theme, delete `userChrome.css` and restart.

Fonts stay on the platform default: Zotero sizes its rows from the system font,
so replacing it can shift the layout. The file ends with a commented rule that
puts the interface on IBM Plex Sans if you want to try it, and an active rule
that puts code on IBM Plex Mono.
