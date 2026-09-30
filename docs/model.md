# The token file

One file per family: families/<id>/<id>.tokens.json. The JSON Schema in schema/family.schema.json says what shape it has and describes every field. This page says what the fields mean and what the tests do with them.

## Palette and references

The palette holds every colour, in groups of named entries. An entry is a six-digit uppercase hex value, an object with a hex value and a note (or a P3 or CMYK encoding), or a translucent version of another entry (a reference and an alpha). Nothing else in the file holds a hex value. Everything else refers to an entry as {palette.group.name}.

Two roles that are meant to be the same colour refer to the same entry. That is how the model declares an alias, and the distinct sets below may list the pair as an alias.

## Modes

Exactly two: dark and light. A mode has an optional label, a secondary display name shown after Dark or Light. Code, file names, CSS attributes and theme identifiers use only dark and light. Both modes define the same addresses; a test checks it.

Each mode holds these blocks. Only roles is always required.

- roles: the fifteen core roles (bg, surface, surface-raised, text, text-muted, text-subtle, border, link, link-hover, accent, on-accent, button, on-button, focus, selection) and an extra group for roles only this family has.
- accents: the family's named hues in this mode. The crew of the Pequod, the blue trio of Goney, the fire and code hues of Jungfrau.
- surfaces: named surfaces that gates test text against. The editor background, the current line, the selection and panels. A surface may be an entry drawn at an opacity over another surface, which is how editors draw a current line; it is blended in gamma-encoded sRGB.
- syntax: twelve roles, each an entry or an entry with a style (italic, bold, underline, strikethrough).
- ansi and terminal: the sixteen terminal slots and the terminal chrome.
- status: chromatic (one colour per level) or achromatic (border weight, edge style, fill density, an icon and words).
- data: categorical, sequential and diverging scales and chart chrome, or a reference to another family's data.

## Addresses

Pairs, distinct sets, exceptions and the harness name a colour by its address inside a mode: roles.text, extra.tint, accents.ahab, surfaces.editor-line, syntax.keyword, ansi.red, terminal.background, status.danger, data.categorical.orange, data.sequential.teal.3, data.plot.grid. The steps of a scale are numbered from 1. extra.name is roles.extra.name.

## Declarations that the tests use

- pairs: foreground and background addresses with a kind (text 4.5:1, large 3:1, component 3:1) and optionally a mode and a reason. Every pair must meet its minimum. Every family that declares pairs is checked, whatever environments it lists.
- distinct: sets of roles that must be told apart. A set is a named set (syntax, syntax-hues, accents, ansi-hues, ansi, status, data.categorical) or a list of addresses. Two members may not share a hex value unless the pair is declared an alias. Every pair keeps a minimum OKLab distance under normal vision (the set's min, default 0.06) and under protan, deutan and tritan simulation (0.06), except pairs declared reinforced, which are told apart by something other than colour. A set may report CVD results instead of gating them (cvd: report); a set whose min is below 0.06 is a baseline, and the report lists what misses the target.
- rules: prose, each with an optional check that the model tests run (accent-only-in-roles, status-achromatic, accent-not-in-data, group-not-in-chrome, hover-direction).
- exceptions: a check the family may fail, with a reason of some length. The report shows it as waived, and a test fails when an exception stops matching a failing check.
- targets.exclude: bundles that make no sense for the family's goal.

## Environments

meta.environments lists the profiles a family must pass. Each profile, its simulation and every threshold are in tests/environments.json, and each threshold has a reason. scripts/report.ts runs the profiles and writes reports/<family>.json, which the site renders on the family page. Errors fail the build. Warnings, and the AAA and APCA numbers, are listed and never fail it.

## Changing a value

1. Edit the palette entry in the token file.
2. Record the change in tests/shared/expected-changes/<family>.json with the address, the old and new value and the reason. The equality test compares every value with the original that the old repositories held and fails on any difference that is not listed.
3. Bump meta.version and write the old value in the family's CHANGELOG.md. Changing an existing value is a minor change before 1.0.0 and a major change after it.
