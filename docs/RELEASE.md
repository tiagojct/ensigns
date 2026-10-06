# Ensigns 1.0.0

The finished local product includes the static catalogue, Carpenter, ten family bundles, 29 export formats and installable packages. All colour values come from the canonical family tokens. Registry publication and changes to live servers are owner operations.

## Build and open

Use Node 24 or later. From the repository root:

```sh
npm ci
npm run typecheck
npx playwright install chromium
npm test
npm run build
npm run preview
```

Open http://127.0.0.1:4174/. The build writes the static site to site/dist/, loose exports to dist/exports/, package folders to dist/packages/ and downloadable archives to dist/releases/. dist/ensigns-1.0.0.zip is the complete portable delivery; its SHA-256 is beside it. Unzip it, serve site/ over HTTP and open the local address. Opening the HTML with file:// does not support the Carpenter's catalogue fetch.

npm run dev builds the local packages, prepares the catalogue and runs Vite on port 5173. The pages link to the archives that the package build writes, so dev builds them first. Token edits require rerunning packages and site:prepare, or restarting dev. npm run pages remains the detailed measurement and candidate review at preview/index.html. The public site keeps the primary designs; candidates remain available in the review pages.

Use Site family in the header to show the website in any family, including its typography. Appearance selects System, Light or Dark. Both choices persist across pages when local storage is available and are applied before painting. Samples, specimens and comparison panels retain their explicitly selected families and modes.

## Local packages

The family bundles include every available export, canonical tokens, family notes, installation text and licence files. The export manifest records source and output hashes. dist/releases/SHA256SUMS.txt covers all release archives.

| Package | Local installation |
|---|---|
| JavaScript | npm install /absolute/path/to/dist/releases/ensigns-npm-1.0.0.tgz |
| Python | Unzip ensigns-python-1.0.0.zip, then python -m pip install ./the-unzipped-folder. Use the [plot] extra for matplotlib. |
| R | R CMD INSTALL dist/releases/ensigns-r-1.0.0.tar.gz |
| Typst | Unzip ensigns-typst-1.0.0.zip, import lib.typ, and use document.with(family: "enderby", mode: "light"). example.typ is included. |
| VS Code | Unzip ensigns-vscode-1.0.0.zip into ~/.vscode/extensions/tiagojct.ensigns-1.0.0/. Keep package.json and themes/ together; restart and select an Ensigns theme. Windows uses %USERPROFILE%\\.vscode\\extensions. |
| Zed | Unzip ensigns-zed-1.0.0.zip and copy themes/*.json into ~/.config/zed/themes/. extension.toml is included for an owner-maintained extension submission. |
| Obsidian | Unzip ensigns-obsidian-1.0.0.zip and copy one family's folder into VAULT/.obsidian/themes/. Select that theme under Appearance. Each folder has its own manifest; do not enable several snippets at once. |
| Tailwind | The bundle contains a v3.cjs preset and v4.css. Merge the v3 preset into your configuration or import the v4 stylesheet after tailwindcss. Names include family and mode. |
| Firefox | Unzip ensigns-firefox-1.0.0.zip. In about:debugging choose This Firefox, Load Temporary Add-on, then a family-mode manifest.json. Persistent installation requires an owner-signed theme. |
| Mastodon | Unzip ensigns-mastodon-1.0.0.zip. Paste RosebudUI.css into the server's Appearance, Custom CSS setting. It includes the vendored Tangerine layout and its separate MIT notice. Review against the server's Mastodon version before applying. |
| Loomings | The bundle contains a palettes.js consumer module with ten families and the existing roles(), cssVars(), contrast() and export vocabulary. It accepts the old Glauca, Try-Works and Ambergris identifiers. Adoption in Loomings changes its default Pequod values and is a separate owner operation. |

The pure JavaScript API:

```js
import { resolveFamily, generateAll } from '@tiagojct/ensigns';
import tokens from '@tiagojct/ensigns/tokens/pequod' with { type: 'json' };
const exports = generateAll(resolveFamily(tokens));
```

The package includes TypeScript declarations. It excludes schema validation, file-system loading, the environment harness and APCA. Each result has files or an unavailable-format reason. Text exports are strings; Adobe ASE is a Uint8Array.

Python reads the resolved data and applies authored matplotlib styles:

```python
import ensigns
ensigns.colours('townho', 'dark')  # retains opacity and origins
ensigns.use('enderby', 'light')    # requires matplotlib
```

R exposes ensigns_tokens(), ensigns_colours(), theme_ensigns(), scale_colour_ensigns() and scale_fill_ensigns(). Discrete chart scales require an authored categorical palette. Loose chart exports also expose every authored sequential and diverging ramp. Keep the accompanying labels, marker and pattern cues in figures.

## Export choices

The Carpenter and CLI use the same 29 generators. scripts/export/README.md lists them. Missing or excluded editor, terminal and chart palettes produce explicit unavailable reasons. A derived declaration does not invent a tested palette. Opaque formats omit translucent swatches; CSS and token formats retain opacity. DTCG uses the 2025.10 colour-space object.

VS Code, Zed and Neovim are offered for the four authored editor families. Their editor surfaces and syntax styles are the same values measured by the harness. Existing family exceptions remain documented. Obsidian interface themes cover all ten; syntax is included only where authored. Font names appear in exports, but standalone theme files do not embed fonts. The public site bundles all selected faces and their OFL texts locally.

## Deploy the site

Any static HTTP host can serve site/dist/. Preserve trailing-slash routes and return 404/index.html for missing pages. Old family routes redirect to the new names. The nginx configuration includes the production Content Security Policy and allows only same-origin scripts, styles, fonts, requests and specimen frames.

The VPS runs the site as a container behind Caddy, with the same files and the same order as the other apps on it. site/deploy/README.md gives the steps, the check after each step and the undo for each step. DNS, the tunnel, Caddy, the Cloudflare redirect rule and the live rollout belong to the owner. The image is built from the repository root with Node 24:

```sh
docker build -f site/deploy/Dockerfile -t ensigns .
```

The build-deploy workflow builds the image and pushes it to ghcr.io/tiagojct/ensigns. Only the owner starts it, by hand, on main.

The container recipe was not built here, because Docker is not installed on the verification host. The build stage ran without Docker, on a copy of the tracked files with no .git folder and no legacy folder, and the production files were exercised under nginx's CSP.

## Owner publication

No build or CI command publishes. Run the checks, inspect the generated archives, review the licence notices and choose the release tag before publishing.

- JavaScript: publish the generated dist/packages/npm/ folder under @tiagojct/ensigns. The Tailwind folder has its own package manifest.
- Python: build a wheel and source archive from dist/packages/python/ with python -m build, inspect their metadata and upload through the owner's PyPI account.
- R: run R CMD build and R CMD check on dist/packages/r/ensigns/ with the intended CRAN toolchain, then submit through the owner's account.
- VS Code and Open VSX: package dist/packages/vscode/ with the current registry tooling and publish through the owner's publisher accounts.
- Zed: submit the generated extension folder according to the registry's current contribution rules.
- Typst: copy dist/packages/typst/ into the intended version folder in the Typst packages repository; review the manifest and licences before submitting.
- Obsidian and Firefox: review the generated theme folders and each registry's current submission or signing requirements.

Registry names, policies and credentials must be checked at publication time. The historical Pequod packages and third-party consumer repositories are unchanged. Retirement notices, registry deprecations, a Zenodo DOI and public repository settings require the owner's accounts; they are outside the local build.

## Design decisions retained

Current primary token files are the release designs. Jeroboam keeps its measured flags, Enderby keeps the separable primary design, and Bachelor keeps the primary eight-flag design. The three candidates remain review alternatives. Existing colour-vision floors and Goney's declared current-line exception are preserved with their reasons. Rosebud's unreadable dark status accents are corrected in 0.5.0. The historical checkpoint documents remain unchanged.

Code is MIT. Tokens, generated colour values and documentation are CC BY 4.0. Attribute Ensigns by Tiago Jacinto, link the licence and indicate modifications. The full legal code, original font licences and Tangerine's MIT notice are included with the relevant distributions.
