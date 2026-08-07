# Glauca for Thunderbird

A static Thunderbird theme in the Glauca palette, the mail-side sibling of the
Firefox theme: the same chrome table, against Thunderbird's own colour keys.

`manifest.json` is generated from `src/glauca.json` — edit the json and run
`make generate`, never the manifest. `assemble.sh` copies the icon in and zips
the folder into `Glauca.xpi`.

## What it paints

`theme` carries **Pruina**, `dark_theme` carries **Profundum**, each declaring
its own `color_scheme`. The header area takes the field, toolbars the surface
above it, the search field the surface above that.

The folder tree and the message list are Thunderbird's `sidebar_*` keys —
`sidebar_text` is what enables tree theming at all, so it is set first. A
selected row takes the mode accent with the audited on-accent ink and a deeper
`sidebar_highlight_border` edge. Everywhere else the blue stays rare: the
selected tab's line, the focused search field, an icon in attention state (new
mail on the chat button). The Firefox-only keys (`bookmark_text`, `ntp_*`) are
left out — Thunderbird documents them as unused.

## Install

**Try it now (until you restart Thunderbird):**

1. **Tools → Add-ons and Themes**, then the gear menu → **Debug Add-ons**.
2. **Load Temporary Add-on…**, and pick `manifest.json` from this folder.
3. The theme applies immediately, and is removed on restart.

**Keep it:** like Firefox, release Thunderbird checks add-on signatures, so a
permanent install needs a signed package. Submit `Glauca.xpi` to
[addons.thunderbird.net](https://addons.thunderbird.net/developers/) — it can be
submitted unlisted, which signs it for your own use without publishing — then
install the signed file through the gear menu → **Install Add-on From File…**.
A Daily build can instead set `xpinstall.signatures.required` to `false` in the
Config Editor and install the unsigned `.xpi` directly.

Requires Thunderbird 115 or later.
