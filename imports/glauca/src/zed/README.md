# Glauca for Zed

A Zed theme family rooted in the glaucous bloom: a pale frost field carries the
one rare, load-bearing sky-blue mark. Ships both appearances, tuned for R and
Python (matching the VS Code themes): **Glauca (Profundum)** (dark) and
**Glauca (Pruina)** (light). The light variant is a total remap of the
dark one -- the same hues darkened toward the ink for WCAG-safe contrast, the
same light-safe terminal palette -- so both stay in lockstep from one source.

`themes/Glauca.json` is generated from `src/glauca.json`; edit the json and
run `make generate`, never the theme file.

## Install

Copy the theme into Zed's user themes directory:

    mkdir -p ~/.config/zed/themes
    cp themes/Glauca.json ~/.config/zed/themes/

Then open Zed and pick one: `cmd-k cmd-t` (Theme Selector) and choose
**Glauca (Profundum)** or **Glauca (Pruina)**, or set it in
`settings.json`:

    "theme": "Glauca (Profundum)"

Or follow the system appearance:

    "theme": { "mode": "system",
               "light": "Glauca (Pruina)",
               "dark": "Glauca (Profundum)" }
