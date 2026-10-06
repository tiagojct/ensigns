# Changelog

All notable changes to Ensigns are recorded here. The format follows Keep a Changelog and the project uses semantic versioning. Ensigns continues the version line of the Gam site, which was 0.1.0. Each family keeps its own changelog in `families/<id>/`, with the old values of every changed colour.

## [1.0.0] - 2026-10-04

The complete local Ensigns product.

- Site-wide family selector for all ten colour families and their typography, paired with System, Light and Dark appearance. Preferences restore before painting; samples and comparisons remain independent.
- Labelled header controls with 44px targets and narrow mobile layouts. Invalid saved preferences fall back to Pequod and System; controls remain usable when storage is blocked.
- Ten-family static catalogue, independent comparison panels, appearance persistence, native specimens for every family, measurement reports, downloads and the browser Carpenter.
- All 29 export formats ported to the common model, with target exclusions, complete authored chart ramps, opacity and non-colour cue metadata, binary Adobe swatches and source/output hashes.
- Local JavaScript, Python, R, Typst, VS Code, Zed, Obsidian, Tailwind, Firefox, Mastodon and Loomings bundles, family archives and a complete portable delivery.
- Self-hosted selected typefaces with original OFL texts and recorded hashes, the full CC BY 4.0 legal code, generated social image and search metadata.
- Node 24 container recipe, same-origin Content Security Policy, new family redirects, build and release instructions, and CI artifact validation without publication.
- Production-browser checks for mobile layouts, appearance, comparisons, every format and text, binary and ZIP downloads under the production CSP. Independent parsing and package installation checks supplement the existing environment suite.

## [0.2.0] - migration work

Gam becomes Ensigns. Five repositories become one.

- Phase 4 export foundation: shared pure writers for CSS, resolved JSON, Ghostty, kitty, Alacritty and Windows Terminal. The CLI reads the current tokens and writes a deterministic manifest with source and output hashes; unsupported terminal targets retain their reasons. Family and candidate preview pages offer the same downloads.
- Current-token VS Code, Zed and Neovim themes for the four authored editor families, with exact harness surfaces, syntax styles and status diagnostics. VS Code folders include local extension manifests; Zed output validates against its official schema and Neovim output is parsed as Lua. Obsidian interface snippets are available for all ten families.
- Rosebud 0.5.0: readable dark status accents and a current specimen that passes forced colours without the three legacy waivers. Regression tests cover its status contrast on every chrome surface and fill.

- One repository, `tiagojct/ensigns`, with the history of gam, pequod, glauca, try-works and ambergris imported and moved into the new layout without changing a file's content in the move.
- One token format for all families, described by `schema/family.schema.json`. A hex value appears only in a palette block. Every family defines fifteen core roles in both modes.
- Four families migrated and tested against the original: Pequod, Goney (Glauca), Jungfrau (Try-Works) and Rosebud (Ambergris). Every migrated value equals the original except the changes listed, with reasons, in `tests/shared/expected-changes/`.
- A test harness with every threshold and its reason in `tests/environments.json`: office-screen, editor, cvd and night profiles over tokens, and a forced-colors profile that renders a specimen in a browser.
- Pequod 0.3.0: the crew colours corrected for AA on the page, the editor, the current line and the selection.
- Goney 0.2.0: Imum in light mode gets its own value.
- Jungfrau 2.0.0: repositioned as the night family.
- Rosebud 0.4.0: an authored light terminal set, a README and a changelog.
- The gam adapters are deleted. The site under `site/` and the old generators under `legacy/` stay dormant until they are rebuilt.

## [0.1.0] - 2026-09-21

The Gam site, first release.

- Home, one page per family (Pequod, Glauca, Try-Works, Ambergris), Compare, Carpenter and About.
- One adapter per family mapping the canonical token files into a shared model; every colour carried its origin and a test audited it.
- Build-time WCAG 2.x contrast tables, colour-vision notes linked to the source, install sections quoted from each repository.
- The Carpenter: twenty-eight export formats generated in the browser (web, publishing, data, editors, terminals, palette files), official files offered verbatim where a family ships one, a colour-vision ordering for accents, a zip bundle, and a contrast checker with protan, deutan and tritan simulation.
- Site chrome restyles in any family and mode; the choice is remembered in localStorage and the pages render without it or without JavaScript.
- Open Graph image, favicons and the browser theme colour generated from the tokens.
- nginx image, GitHub Actions workflow with repository_dispatch and a weekly schedule, deployment notes for the VPS.
