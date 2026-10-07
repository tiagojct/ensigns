# Changelog

All notable changes to Ensigns are recorded here. The format follows Keep a Changelog and the project uses semantic versioning. Ensigns continues the version line of the Gam site, which was 0.1.0. Each family keeps its own changelog in `families/<id>/`, with the old values of every changed colour.

## [Unreleased]

### Added

- A footer on every page that names the collection version, each family's version and, in the deployed image, the commit and its date.
- favicon.ico and an iOS touch icon, both drawn from the site's mark.
- The Carpenter accepts the old family ids glauca, try-works and ambergris in a link, and the site redirects the old pages to the new names.
- Deployment files for the VPS, and the build-deploy workflow that builds the site image. Only the repository owner can start it, by hand, on main.
- CI jobs that run R CMD check --as-cran on the R package and pytest on the Python package.
- Tests that read the heading outline, the accessible names and the sample-label contrast of every page.

### Changed

- The site is redesigned around the ensigns: a signal flag drawn from each family's own colours, the crew of the host ship, family pages that open in the family's own ground, headings in a subset of Literata, and sample cards that print the measured contrast of their text, link, button label and focus ring. The copy is rewritten, and a test reads every page for the markers of generated prose.
- The R package has the title Ten Colour Families Named After Ships in Moby-Dick, an examples section in its help page, and its licence texts under inst/, so that R CMD check --as-cran passes.

### Fixed

- The small text of a sample label had an opacity of .8, which took its contrast below 4.5 to 1 in several families. The label keeps its declared colour.
- Sample cards no longer use a heading element, so no page skips a heading level. The link to the home page has the visible text as its name.
- The Carpenter no longer pushes the checker down by up to 759 px when its catalogue arrives.

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
