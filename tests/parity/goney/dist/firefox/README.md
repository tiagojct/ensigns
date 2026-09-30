# Glauca for Firefox

A static Firefox theme in the Glauca palette: a frost-bloom field, one sky-blue
load-bearing mark.

`manifest.json` is generated from `src/glauca.json` — edit the json and run
`make generate`, never the manifest. `assemble.sh` copies the icon in and zips
the folder into `Glauca.xpi`.

## What it paints

Light-first, and both modes ship in one theme: `theme` carries **Pruina**,
`dark_theme` carries **Profundum**, each declaring its own `color_scheme`, so
Firefox picks by the browser appearance setting and the built-in pages follow
the chrome instead of guessing from the frame colour.

The window is three flat steps of the field — `frame` is the mode background,
the toolbars sit one surface above it, the address field one above that — so
depth reads without shadow. The blue is kept rare: it marks the selected tab's
line, the focused address field's border, the text selection inside that field,
and an icon in its attention state. Nothing else. Menu and dropdown highlights
take the sea, not the blue: a keyboard cursor moving down a list is not an
accent. The new-tab page takes the field, cards the surface above it.

## Install

Firefox requires add-ons to be signed, so there are two paths.

**Try it now (until you restart Firefox):**

1. Go to `about:debugging#/runtime/this-firefox`.
2. **Load Temporary Add-on…**, and pick `manifest.json` from this folder.
3. The theme applies immediately. It is removed when Firefox restarts.

**Keep it.** Release Firefox refuses an unsigned package outright — *"the add-on
could not be installed because it has not been verified"* — and, unlike Developer
Edition and Nightly, it ignores `xpinstall.signatures.required`. So a permanent
install needs a signed `.xpi`. Signing does not mean publishing: the *unlisted*
channel signs a package for your own use and never lists it on
addons.mozilla.org.

From the repository root:

```
export AMO_JWT_ISSUER=user:12345:67
export AMO_JWT_SECRET=...            # both from addons.mozilla.org/developers/addon/api/key/
make firefox-sign
```

The signed `.xpi` lands in `dist/firefox/`; install it from `about:addons` →
gear menu → **Install Add-on From File…**. `make firefox-lint` runs the same
validation on its own.

Requires Firefox 115 or later.
