# Family pages

The builder writes a static page for every family and candidate into preview/, which git ignores. The owner reviews new families on these pages. They are not the site, which comes in phase 4.

    npm run pages
    node scripts/pages/build.ts --out some/folder

Open preview/index.html in a browser. The pages need no server and no JavaScript, and nothing on them loads from outside preview/. Their links to the token files, READMEs and changelogs point into families/.

## What it builds

- index.html: a card per family in book order, with its version, chapter, goal, environments, the status of each profile and a swatch strip for both modes. A family that is not in the repository yet is left out.
- `<id>.html` for each family, and `<id>--<candidate>.html` for each file in families/`<id>`/candidates/. A candidate keeps its family's meta.id, and the harness tests it in place of the family's token file.
- specimen/`<id>--<mode>.html` and specimen/`<id>--<candidate>--<mode>.html`: the family's specimen alone, once, in one mode. The forced-colours test loads these pages.
- assets/tokens.css: a block `[data-scope="<id>"][data-mode="<mode>"]` for each family or candidate and mode, with one custom property per colour address (roles.bg is `--roles-bg`, data.sequential.teal.3 is `--data-sequential-teal-3`), one per scalar in design (`--design-<path>`) and one per typeface (`--font-<role>`). The page itself takes the Pequod values, light or dark after the reader's system setting. The file also holds one class per address: `.sw-<address>` sets the background, `.fg-<address>` the text colour and `.bc-<address>` the border colour.
- assets/pages.css and assets/standalone.css, copied from scripts/pages/assets/, and assets/specimen-`<id>`.css, copied from the family.

A family page shows the family's facts and quotation, then both modes side by side: every colour as a swatch with its value, the core roles with their contrast on the page ground, the data scales, a sample built from the roles, and the specimen. Below come the declarations (pairs with their contrast, distinct sets, rules, design) and the harness report for each profile.

The view selector above the panels applies an SVG filter to both panels with CSS alone: protan, deutan and tritan (Machado 2009), greyscale by relative luminance, sixteen grey levels, photocopy, projector flare in a dark and in a lit room, sunlight glare and the aged eye. Every number comes from lib/colour or tests/environments.json. tests/pages/filters.test.ts runs the filters' arithmetic and compares the result with the library.

## Specimens

A family's specimen is families/`<id>`/specimen/specimen.html, an HTML fragment without html, head or body, and specimen.css beside it. The builder puts the fragment in each mode panel inside `<div class="specimen specimen-<id>">`, links the stylesheet once per page, and uses the same fragment for the family's candidates.

- Colour comes only from the custom properties in tokens.css, through specimen.css. Name only properties that the family and each of its candidates define, or that specimen.css sets itself. The build stops on any other.
- No script element, style element, style attribute or event handler attribute, no external URL and no colour literal: no hex value and no colour function such as rgb(), hsl() or oklch(), in either file. The build refuses such a specimen and names the file. It does not detect named colours such as white, so do not use them either.
- An inline svg needs no xmlns attribute, and the build reads one as an external URL. An svg sets fill and stroke through classes in specimen.css, not through presentation attributes.
- Class names start with sp-. The forced-colours test looks for one p.prose paragraph, an element with aria-current and elements with data-status, so those keep their names.
- A family page holds the fragment twice, once per mode. Write {mode} inside an id or a name, and in any reference to one; the builder replaces it with dark or light.
- Headings in a fragment start at h5, because the fragment sits under the panel's h4. No h1.

## What it does not do

- It bundles no fonts. A typeface shows only where it is installed; otherwise the system fallback stands in.
- It deletes nothing. After renaming or removing a family or a candidate, remove preview/ by hand and build again.
- The forced-colors profile shows as external. It runs in tests/environments/forced-colors.test.ts, not on the tokens.
- Nothing here is published or deployed.
