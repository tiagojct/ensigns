Detailed phase 1 report, written on 2026-09-29 as the evidence behind INVENTORY.md. Paths that start with S/ point into a temporary scratch folder that does not persist; they record what was run. Every other path is relative to the repository root at the commit named in the report.

This file holds two reports on the gam repository. Part A covers the code (model adapters, colour maths, generators, the Carpenter, tests). Part B covers the site, the build pipeline, deployment, CI and provenance.

Part A: code

# Gam code inventory (phase 1, code area)

Repository: tiagojct/gam, pinned HEAD f16228db99ff630fed8083a2d6ad9498bc008b0e (2026-09-21, "nginx: one Cache-Control header on HTML, not two"). The clone at S/clones/gam was not touched (git status clean after my work).

Method. I read every file under src/, scripts/, test/ (except snapshot contents), the configs, the workflow and the Dockerfile. I ran npm ci, npm test and npm run build in S/work/gam-code, a copy of the clone. Its vendor/ holds copies of the four family clones in S/clones at pequod 619982d, glauca 1efbcce, try-works 400dd91 and ambergris c92c190. Those are the commits recorded in `test/fixtures/*/COMMIT`, and they are the current default-branch heads on GitHub (checked with anonymous git ls-remote on 2026-09-29). Measuring scripts are in S/work (accent-select.mjs, contrast-report.mjs, cvd-compare.mjs, gen-matrix.mjs, locked-pairs.mjs, token-counts.mjs, zip-counts.mjs).

Paths are relative to the repository root unless they begin with a family name (those are in the family clones). Line numbers refer to the pinned HEAD. "Unverified" marks anything I did not run or read at source.

## 1. Stack

### 1.1 Identity, language, runtime

| Item | Value | Evidence |
|---|---|---|
| name, version | gam, 0.1.0 | package.json:2-3 |
| type, private, licence | module, true, MIT (author Tiago Jacinto) | package.json:5-6, 20-21 |
| engines | none declared; no .nvmrc, .node-version or .tool-versions | directory listing |
| language | JavaScript only. No TypeScript, tsconfig, jsconfig, ts-check comments, ESLint, Prettier or Biome config | directory listing, grep |
| module system | ES modules throughout ("type": "module", .mjs scripts, import.meta.url). CommonJS appears only as generated text evaluated with new Function in tests | test/generators.test.js:63-67 |
| lockfile | package-lock.json, lockfileVersion 3, 98 entries (root plus 97). npm ci added 63 packages on darwin/arm64 and reported 0 vulnerabilities | package-lock.json |
| Node used by CI | Node "20" via actions/setup-node@v4, npm cache | .github/workflows/build-deploy.yml:38-43 |
| Node used by the image | node:20-alpine build stage | deploy/Dockerfile:5 |
| Node used in my runs | v24.21.0, npm 11.19.0 (a Homebrew Node v26.10.0 also exists on the machine) | shell |
| Node required by dependencies | vite 8.3.0: ^20.19.0 or >=22.12.0. vitest 5.0.1: ^22.12.0 or ^24.0.0 or >=26.0.0 | package-lock.json |

The vitest engine range excludes Node 20, yet the scheduled CI run of 2026-09-28 (run 10, head f16228d) passed its "Run npm test" step (GitHub Actions API, anonymous). The job log was not read, so the Node minor that setup-node resolved is unverified. Of the ten runs listed by the API, run 2 was cancelled, runs 1 and 3 to 7 (all on 2026-09-21) failed, and runs 8 to 10 passed.

### 1.2 npm scripts

| Script | Command | What it does |
|---|---|---|
| vendor | sh scripts/vendor.sh | Shallow-clones the four family repositories into vendor/ (gitignored). Optional name=ref pins |
| model | node scripts/build-model.mjs | Runs the adapters on vendor/; writes src/generated/model.json and meta.json; copies the families' official files to public/official/ |
| render | node scripts/render-pages.mjs | Renders each route to site/{route}/index.html; writes src/generated/theme.css and public/favicon.svg |
| og | node scripts/build-og.mjs | Renders public/og.png, favicon.png and apple-touch-icon.png with resvg |
| prebuild | npm run model && npm run render && npm run og | Runs before build |
| build | vite build | Bundles site/ into dist/ |
| predev | npm run model && npm run render | Runs before dev |
| dev | vite | Dev server on 127.0.0.1:5173, strict port |
| preview | vite preview | Serves dist/ on 127.0.0.1:4174, strict port |
| pretest | npm run model && npm run render | Tests need vendor/ and the rendered site/ |
| test | vitest run | Runs `test/**/*.test.js` |

There is no lint, format, typecheck or coverage script. scripts/subset-fonts.mjs has no npm script.

### 1.3 Dependencies

| Package | Range | Locked | Kind | Used in |
|---|---|---|---|---|
| fflate | ^0.8.3 | 0.8.3 | dependencies | src/generators/index.js:2 (zipSync, strToU8); test/generators.test.js:11 (unzipSync, strFromU8) |
| @resvg/resvg-js | ^2.6.2 | 2.6.2 | dev | scripts/build-og.mjs:5 |
| js-yaml | ^5.4.2 | 5.4.2 | dev | test/generators.test.js:6 |
| luaparse | ^0.3.1 | 0.3.1 | dev | test/generators.test.js:8 |
| markdown-it | ^15.0.2 | 15.0.2 | dev | scripts/build-model.mjs:6; src/pages/40-about.js:2 |
| plist | ^5.0.0 | 5.0.0 | dev | test/generators.test.js:9 |
| smol-toml | ^1.8.0 | 1.8.0 | dev | test/generators.test.js:7 |
| subset-font | ^2.9.0 | 2.9.0 | dev | scripts/subset-fonts.mjs:10 |
| vite | ^8.3.0 | 8.3.0 | dev | vite.config.js:3. The installed tree contains rolldown and lightningcss |
| vitest | ^5.0.1 | 5.0.1 | dev | all four test files |

### 1.4 Build and test configuration

- vite.config.js: root site (pre-rendered HTML), publicDir ../public, outDir ../dist, appType mpa, target es2020, no sourcemaps (lines 18-32). Every index.html under site/ becomes a build entry, found by a synchronous directory walk when the config loads (lines 9-16, 30), so npm run render must run before any vite command. Dev server 127.0.0.1:5173 with fs.allow on the repo root; preview 127.0.0.1:4174 (lines 23-24).
- vitest.config.js: include `test/**/*.test.js`, environment node (lines 3-8). No coverage provider, no setup file.
- .gitignore keeps node_modules, /dist, /site, /vendor, src/generated, public/official and the generated icon files out of git.

### 1.5 Which library does what

| Function | Library | Evidence |
|---|---|---|
| Colour maths (WCAG contrast, CVD simulation, CIELAB, delta E, hex handling, 8-bit blending) | Hand-written in src/colour/hex.js, wcag.js and cvd.js. No culori, chroma-js, colorjs.io, apca-w3 or d3-color in package.json, the lockfile or any import | grep of the tree and of package-lock.json |
| APCA | Not implemented | grep |
| OKLab, OKLCH | Not implemented. Ambergris tokens.json carries oklch() strings and the adapter ignores them | grep, src/model/adapters/ambergris.js |
| Gamut mapping | Not implemented. Glauca and Try-Works JSON carry color(display-p3 ...) hints and the adapters ignore them | test/fixtures/glauca/src/glauca.json:404-416 |
| Zip creation | fflate 0.8.3, zipSync at level 6 | src/generators/index.js:57 |
| UI framework | None. The Carpenter is plain DOM with a ten-line el() helper (src/workshop/carpenter.js:13-23). Pages are strings from a tagged template (src/site/html.js). Vite only bundles | source |
| Parsers | JSON.parse; a hand-written Ghostty parser (src/model/ghostty.js) and README section reader (src/model/readme.js). js-yaml, smol-toml, luaparse and plist are used in tests only | source |
| Markdown | markdown-it, build time only | scripts/build-model.mjs |

Consequence for the plan. Gam has no colour library. The premise "continuity with what gam already uses" holds only for fflate and the hand-written WCAG 2 formula. culori and apca-w3 would be new dependencies, and APCA, OKLab, OKLCH and gamut mapping would be new features.

## 2. Model layer (src/model)

### 2.1 Files

| File | Lines | What it does |
|---|---|---|
| src/model/token.js | 117 | Schema constants: FAMILY_IDS (exported, never imported), MODES, ROLES (14), SYNTAX_ROLES (12), ANSI_NAMES (16). Token constructors fromFile, fromOfficial, derived, alias, fallback (lines 31-57). Derivation helpers mixToken, contrastPick, byLuminanceDesc (63-76). Validators roles, syntax, terminal that throw on a missing key (79-96). walkTokens, a generator over every token of a family (99-117), used by tests, the swatch CSS and the Carpenter's token list |
| src/model/load.js | 64 | Node-only loader (fs, child_process). ADAPTERS registry with directory and token file per family (12-17), VENDOR path (19), readAll, commitOf (31-39), loadFamily (41-49), loadAll, readVendorFile, vendorFileExists |
| src/model/ghostty.js | 42 | parseGhostty (key = value lines, palette = N=hex) and terminalFromGhostty, which builds the model's terminal block with origin official |
| src/model/readme.js | 49 | section(text, heading), a fence-aware README section reader that throws if the heading is missing; firstParagraph(text) |
| src/model/adapters/pequod.js | 180 | Pequod adapter |
| src/model/adapters/system.js | 161 | Shared adapter (adaptSystem) for Glauca and Try-Works |
| src/model/adapters/glauca.js | 61 | Glauca SPEC (lines 8-53) and a call to adaptSystem |
| src/model/adapters/try-works.js | 60 | Try-Works SPEC (lines 9-52) and a call to adaptSystem |
| src/model/adapters/ambergris.js | 206 | Ambergris adapter |

There is no JSON Schema, TypeScript type or prose spec of the normalised model. The shape is enforced by the throwing helpers above and by test/model.test.js. The header of token.js and README.md "How it is built" are the only descriptions.

### 2.2 Inputs at build time and how each is parsed

The adapters read files through loadFamily (src/model/load.js:41-49): JSON.parse of the token file, then readAll of the family's NEEDS list (text). vendor/ is the default root, and tests pass test/fixtures/ instead.

| Family | Token file | Other files read by adapt() | NEEDS in source |
|---|---|---|---|
| pequod | vendor/pequod/pequod.json | README.md (first paragraph); themes/terminals/Pequod.ghostty (parseGhostty) | src/model/adapters/pequod.js:177-180 |
| glauca | vendor/glauca/src/glauca.json | README.md; dist/themes/terminals/Glauca-Dark.ghostty; dist/themes/terminals/Glauca.ghostty | glauca.js:61 |
| try-works | vendor/try-works/src/try-works.json | README.md; dist/themes/terminals/Try-Works.ghostty; dist/themes/terminals/Try-Works-Cold.ghostty | try-works.js:60 |
| ambergris | vendor/ambergris/tokens.json | ports/ghostty/ambergris-dark (parseGhostty); ports/zed/ambergris.json (JSON.parse, syntax colours). ports/README.md is in NEEDS but adapt() never reads it | ambergris.js:206 |

scripts/build-model.mjs reads more than the adapters: every path in ships[].files and the README section named in ships[].install (section 7). A missing file or heading throws.

Output of adapt(): one Family object (2.3). Every colour is a Token that records its origin.

### 2.3 The normalised model

Enumerations. ROLES (token.js:13-16): bg, surface, text, textMuted, textSubtle, border, link, linkHover, accent, onAccent, button, onButton, focus, selection. SYNTAX_ROLES (19-22): keyword, string, number, comment, function, type, constant, variable, operator, punctuation, decorator, parameter. ANSI_NAMES (24-28): black, red, green, yellow, blue, magenta, cyan, white, then bright-black to bright-white. MODES: dark, light.

Model file (src/generated/model.json, written by build-model.mjs:49-57; 221,926 bytes):

| Path | Type | Presence | Notes |
|---|---|---|---|
| site | { name, version, builtAt } | required | build-model only; builtAt is today's date, so the file is not byte-stable across days |
| order | string[] | required | family ids in ADAPTERS order: pequod, glauca, try-works, ambergris. order[0] is the default family of the site |
| families | Record of id to Family | required | |

Family:

| Field | Type | Presence | Notes |
|---|---|---|---|
| id, name, version | string | required | |
| description | string | required | markdown one-liner |
| descriptionSource | string | optional | Ambergris only |
| tagline | string | required | hard-coded in adapters |
| repo | string | required | URL, hard-coded |
| homepage | string or null | required | Pequod reads json.homepage; the others null |
| changelog | string or null | required | null for Ambergris |
| licence | { tokens, code, stated: boolean, files: string[] } | required | |
| tokenFile | string | required | repo-relative path |
| rules | string[] | optional | Ambergris only (meta.rules) |
| scale | { name, steps: Token[] } | required | steps carry group for Glauca and Try-Works |
| extraScales | { name, steps: Token[] }[] | required | empty except Ambergris (Accent, 10 steps) |
| accents | Accent[] | required | 8, 8, 8 and 6 |
| modes | { dark: Mode, light: Mode } | required | |
| cvd | { summary, href, script } or null | required | null for Ambergris |
| ships | Ship[] | required | 12, 11, 11, 3 |
| also | string[] | optional | Glauca 9, Try-Works 3, Ambergris 2 |
| source | { file, commit } | required | added by load.js:47 |

Token: id (string), label (string), hex ('#RRGGBB', upper-case; normaliseHex also accepts 8 digits, tests require 6), origin (either { file, path, official?: true } or { derived: string, from: string[] }), and optional alias (id of the token it points to), fallback (role it was filled from), style ('italic' or 'bold', syntax tokens only), group (scale steps of Glauca and Try-Works).

Accent: id, label, hue (string), tier ('core' or 'extended'), optional group and note, dark (Token), light (Token).

Mode: label, scheme ('dark' or 'light'), roles (Record of the 14 ROLES to Token, all required), syntax (Record of the 12 SYNTAX_ROLES to Token, all required), terminal, dataviz.

- terminal: { origin: 'official' or 'generated', bg, fg, cursor, cursorText, selectionBg, selectionFg (Tokens), ansi: Token[16] }, all required.
- dataviz: { categorical: Token[] (may be empty), categoricalNote? (string), sequential: Token[], diverging: Token[] or null, plot: { bg, grid, text, muted } }.

Ship: target, label, mode ('dark', 'light' or 'both'), path, optional install ([file, heading or null] or null), link, package, files ({ both?, dark?, light? } repo paths). build-model.mjs adds installHtml, installSource and official ({ mode: { path, url, name } }).

Sizes measured on the built model: pequod 172 tokens (73 unique ids in the checker list), glauca 177 (134), try-works 177 (134), ambergris 139 (90).

### 2.4 Mapping rules per family

Pequod, pequod.json to model (src/model/adapters/pequod.js):

| Model field | Source | Rule or quirk |
|---|---|---|
| name, version | name, version | verbatim (0.2.0-alpha) |
| description | README.md first paragraph | JSON description ignored |
| homepage; licence | homepage; license.palette, license.code | licence files hard-coded LICENSE-CC-BY-4.0, LICENSE-MIT; stated true |
| scale.steps (12) | log.{n} | id log.{n}, label "Log {n}", order numeric ascending (JS integer keys), scale name Log hard-coded (lines 15-16, 151) |
| accents (8) | accents.{name} | id = key; label capitalised; hue = role; note = note; tier core; dark = .dark; light = .light (23-31). Both variants are authored |
| roles.bg, surface, text, textMuted, textSubtle, border, link | roles.{mode}.bg, surface, text, text-muted, text-subtle, border, link | file values are step names such as "log.100" with no braces; token is an alias of that scale step (36-47) |
| roles.accent, focus | roles.{mode}.accent-primary, focus-ring | renamed |
| roles.linkHover | none | file has link-hover (log.400) but it is ignored; the token is link with a fallback flag (49-51). Log.400 measures 3.34 on the light bg and 4.20 on the dark bg (computed), so it would fail the chrome contrast test |
| roles.onAccent | none | derived: bg or text, whichever contrasts more with accent (contrastPick, line 40) |
| roles.button, onButton | none | aliases of accent and onAccent |
| roles.selection | none | alias of surface (57) |
| dropped | roles.{mode}.bg-alt, accent-secondary, link-hover; $schema, author, description | |
| syntax (10 file roles) | syntax.{role} = accent name | token = that accent's variant for the mode (60-74) |
| syntax.comment.style | none | italic hard-coded (65) |
| syntax.decorator, parameter | absent from file | fallback to the constant and variable accents (72-73) |
| terminal, dark | themes/terminals/Pequod.ghostty | official, parsed. The README says presets are made by hand (Pequod README.md:256-260); 7 of the file's 19 distinct hex values (cyan and six bright slots) are absent from pequod.json |
| terminal, light | none | generated (76-114): red, green, yellow, blue, magenta take the light accents ahab, tashtego, pip, starbuck, queequeg (line 86); cyan = 50% mix8 of starbuck and tashtego light; bright variants = 20% mix8 toward text; black = log.900; white = textSubtle; bright-black = textMuted; bright-white = text; cursor = accent; cursorText = bg; selection bg = surface, fg = text |
| dataviz | none | categorical = the 8 accents in the mode's variant; sequential = the whole Log scale; diverging null; plot bg, text aliases; grid = border; muted = textMuted (122-132) |
| mode labels | none | hard-coded, Below deck and Parchment (117) |
| tagline, repo, changelog, cvd, ships | none | hard-coded (141-173); 12 ships |

Glauca and Try-Works, glauca.json and try-works.json to model (src/model/adapters/system.js with SPEC in glauca.js and try-works.js):

| Model field | Source | Rule or quirk |
|---|---|---|
| name, version | name, version | |
| description | README.md first paragraph | JSON description ignored |
| scale.steps (11 each) | palette.{group}.{name} for the neutral groups (Glauca: saxum, glaucum, pruina; Try-Works: ground, sea, whale) | id {group}.{name}, label "{Name} ({group})", group kept; the groups are merged and sorted lightest first by contrast against #000000 (system.js:26-28). Scale name Frost or Sea hard-coded |
| accents, core (3) | palette.caelum (dies, aer, imum) or palette.fire (ember, flame, oil) | dark = palette token. Light is derived (37-42): the first id aliases modes.{light}.accent, the other two alias modes.{light}.accent-deep, so two accents share one hex in light mode (Glauca aer = imum = #084B96; Try-Works flame = oil = #7A3A10). hue hard-coded (glauca.js:18, try-works.js:19) |
| accents, extended (5) | palette.extended | dark = palette token; light = mix8 toward the light text, 50% for the string hue (folium, kelp), 45% for the others (system.js:40-41). Hue names hard-coded (glauca.js:19, try-works.js:20) |
| roles.bg, surface, text, textMuted, border, accent, onAccent | modes.{key}.bg, surface, text, text-muted, border, accent, on-accent | direct hex, no references. Key is dark and light for Glauca, lit and cold for Try-Works |
| roles.link, button, onButton | none | aliases of accent, accent, onAccent |
| roles.linkHover | modes.{key}.accent-bright in dark, accent-deep in light | mode-dependent source key (system.js:78) |
| roles.textSubtle | none | fallback to textMuted |
| roles.focus | a11y.focus.{key} | |
| roles.selection | modes.{key}.tint (Glauca) or .sea (Try-Works) in dark; the same with -pale in light | key from spec.tintKey (system.js:84) |
| syntax (11 file roles) | code.{role}.color and .style | dark verbatim. The file has no constant, so it is a fallback to number |
| syntax, light | none (the code map is dark only) | reverse lookup (system.js:93-105): dark hex equal to an accent's dark hex gives that accent's light token; equal to dark text or dark muted gives light text or muted; otherwise spec.literals; otherwise throw |
| terminal, both modes | `dist/themes/terminals/*.ghostty` | official. The JSON terminal block (dark only) is not read. The Ghostty files are generated by the family's generate.py |
| dataviz.categorical, sequential, diverging | dataviz.{k}.colors | same list in both modes (7, 7, 9 colours); ids dataviz.{k}.{i}; categoricalNote from dataviz.categorical.name |
| dataviz.plot | dataviz.plot.{dark or light} bg, grid, text, muted | keys are dark and light even for Try-Works; panel and accent dropped |
| mode labels | SPEC.labels | duplicates modes.{key}.label |
| tagline, repo, changelog, licence, cvd, ships, also | none | hard-coded in SPEC; changelog docs/CHANGELOG.md; licence CC-BY-4.0 and MIT, stated true (system.js:149-152) |
| not read | signature, tiers, type, spacing, accessibility, notes, typography, gamut, colorspace, i18n, print, performance, motion, brand, product, a11y.contrast_more, modes.{key}.surface-raised, tint-deep, tint-bright, on-tint (Try-Works: sea-deep, sea-bright, on-sea), scheme, label | |

Ambergris, tokens.json to model (src/model/adapters/ambergris.js):

| Model field | Source | Rule or quirk |
|---|---|---|
| name, version, description, rules | meta.name, version, description, rules | no README in the repo; descriptionSource records this |
| scale.steps (13) | color.grey.{n} | numeric sort (000 to 1000), comment key filtered (lines 35-38); id grey.{n} |
| extraScales Accent (10) | color.accent.{n} | |
| accents.accent | theme.dark.link, theme.light.link | aliases of accent.400 and accent.600; hue teal |
| accents sweep-1 to sweep-5 | data.sequence-on-dark.{n}, data.sequence-on-light.{n} | extended; hue teal, teal, blue, indigo, indigo by n (line 63); notes hard-coded |
| roles | theme.{mode}.{key}, aliases resolved by a copy of the family's resolver (17-25) | bg from surface (not ground; comment at 99-100), surface from surface-sunken, text from text-primary, textMuted from text-secondary, textSubtle from text-tertiary, border from rule, link from link, linkHover from link-hover, accent from accent-line, button from fill-solid, onButton from text-on-fill, focus from focus-ring, selection from accent-surface (101-120) |
| roles.onAccent | none | derived by contrastPick |
| alpha overlays | `theme.*.surface-hover` and similar | rgb() strings fail the "#" test and return null (line 48); no role uses them |
| syntax, dark | ports/zed/ambergris.json, themes[0].style.syntax | official. The key map sends decorator to attribute and parameter to variable (91-95); style italic from font_style, bold from font_weight of 700 or more. tokens.json holds no syntax data |
| syntax, light | none | derived by mirror (73-87): the grey step whose log contrast on the light ground is closest to the dark token's log contrast on the dark ground. The comment says the family does not audit it |
| terminal, dark | ports/ghostty/ambergris-dark | official (generated by the family's build.mjs) |
| terminal, light | none | generated (135-156): chrome from theme.light; cursor from surface-inverse; selection bg = 24% mix8 of accent.500 on bg (0.24 hard-coded at line 152); ANSI = the dark ANSI tokens reused |
| dataviz | data.sequence-on-{mode} | categorical empty with a note; sequential 5, mode-specific; diverging null; plot bg = bg, grid = rule-faint, text, muted (164-175) |
| licence, changelog, cvd | none | licence CC-BY-4.0 and MIT with stated false; changelog null; cvd null |
| not read | meta.prefix, greyHue, accentHue; `color.alpha.*`; data.hue-path, data.supplied; `ansi.*` (reached only through the Ghostty port); contrast.assert; status; border; focus; shadow; every oklch string; unused theme keys | |

### 2.5 Colour values and family-specific special cases inside adapters

- Six hex literals used as lookup keys for light code colours: glauca.js:24-28 ('#c3cdd3', '#a7b1b8', '#86929a') and try-works.js:23-27 ('#cdd2d3', '#aeb6b8', '#8a9296'). They copy the tables in the family generators (glauca/src/scripts/generate.py:1480 _light_remap, try-works/src/scripts/generate.py:557 _cold_remap). Any other unmapped code colour throws (system.js:88-92).
- Blend ratios written in code: 0.5 and 0.45 (system.js:40-41), 0.35 for the light parameter colour (glauca.js:25, try-works.js:24), 0.5 and 0.2 in the Pequod light terminal (pequod.js:88-89), 0.24 in the Ambergris light selection (ambergris.js:152).
- Pequod ANSI hue map (pequod.js:86) and the black slot log.900 (91).
- Pequod linkHover, selection and comment-style decisions (pequod.js:49-51, 57, 65).
- Ambergris bg taken from theme.surface (ambergris.js:101) and the sweep hue names (63).
- Hard-coded prose and links in every adapter: taglines, CVD summaries and script paths, ship lists (12, 11, 11, 3), also lists, repo and changelog URLs, licence blocks, mode labels. The SPEC object is 46 of the 61 lines of glauca.js and 44 of the 60 lines of try-works.js.
- Only Pequod and Ambergris carry `alias` links to scale steps; for Glauca and Try-Works, roles are literal hex with no recorded link to the palette.

### 2.6 Mode names and labels

| Family | Mode keys in the token file | Model keys | Labels | Where the label lives |
|---|---|---|---|---|
| Pequod | roles.light, roles.dark; accents.{n}.light and .dark | dark, light | Below deck, Parchment | pequod.js:117 |
| Glauca | modes.dark, modes.light; a11y.focus, dataviz.plot, gamut.p3 use dark and light | dark, light | Profundum, Pruina | glauca.js:14; the file also holds the same strings in modes.{m}.label |
| Try-Works | modes.lit, modes.cold (scheme field says dark, light); a11y.focus and gamut.p3 use lit and cold; dataviz.plot uses dark and light | dark, light | Try-Fire, True Lamp | try-works.js:14-15 |
| Ambergris | theme.dark, theme.light; data.sequence-on-dark and -light | dark, light | Dark, Light | ambergris.js:159 |

Labels leak into outputs: WezTerm scheme name, Windows Terminal scheme name, VS Code and Zed theme names, DTCG descriptions, header comments.

## 3. Colour maths (src/colour)

| Capability | Function | Location | Implementation | Library |
|---|---|---|---|---|
| Hex parsing | normaliseHex, isHex, hexToRgb | hex.js:5-24 | regex for 6 or 8 hex digits, optional #; upper-cases; throws on 3-digit, rgb(), oklch() or names; hexToRgb drops alpha | none |
| Hex output | rgbToHex, lower, withAlpha, rgbTriple | hex.js:26-69 | round and clamp to 0..255 | none |
| sRGB transfer | channelToLinear, linearToChannel | hex.js:49-58 | thresholds 0.04045 and 0.0031308 | none |
| 8-bit blend | mix8 | hex.js:42-46 | interpolates gamma-encoded 8-bit channels, Math.round; matches the Python _mix of the Glauca and Try-Works generators (tested at colour.test.js:13-18) | none |
| WCAG 2 contrast | relativeLuminance, contrast | wcag.js:4-15 | 0.2126, 0.7152, 0.0722; (hi + 0.05) / (lo + 0.05) | none |
| Grading | grade, AA 4.5, AA_LARGE 3, AAA 7, formatRatio | wcag.js:17-31 | returns AAA, AA, AA-large or fail. The Carpenter repeats the numbers inline (carpenter.js:304-306) | none |
| CVD simulation | simulate, RGB2LMS, SIM, LMS2RGB (invert3) | cvd.js:12-67 | Vienot, Brettel and Mollon 1999 dichromacy in LMS space at 100% severity. RGB2LMS [[17.8824, 43.5161, 4.11935], [3.45565, 27.1554, 3.86714], [0.0299566, 0.184309, 1.46709]]. protan [[0, 2.02344, -2.52581], [0, 1, 0], [0, 0, 1]]. deutan [[1, 0, 0], [0.494207, 0, 1.24827], [0, 0, 1]]. tritan [[1, 0, 0], [0, 1, 0], [-0.395913, 0.801109, 0]]. Copied from pequod/scripts/cvd_check.py. No severity parameter, no anomalous trichromacy, no achromatopsia. Not Machado 2009 | none |
| CIELAB | lab | cvd.js:69-83 | sRGB to XYZ (D65, 0.4124564 matrix), white [0.95047, 1, 1.08883] | none |
| Colour difference | deltaE, worstDeltaE, pairwise | cvd.js:85-115 | CIE76; worst case is the minimum over the three simulations | none |
| Ordering for CVD | orderForCvd | cvd.js:117-172 | exhaustive search: best n-subset by maximum minimum pairwise worst-case delta E, then best permutation by adjacent delta E | none |
| Luminance sort | byLuminanceDesc | token.js:74-76 | contrast against #000000, lightest first | none |
| Contrast pick | contrastPick | token.js:68-71 | candidate with the higher WCAG ratio | none |
| Contrast mirror | mirror (in the Ambergris adapter) | ambergris.js:73-87 | nearest grey step by difference of log contrast ratios | none |

Not present: APCA, OKLab, OKLCH, gamut mapping, greyscale or achromatopsia conversion, colour parsing beyond hex, P3 handling. The word greyscale appears once, in a comment (pequod.js:82).

Measured behaviour that matters for the plan:

- Method against the families. Glauca and Try-Works document and script a Machado 2009 pass (glauca/src/scripts/cvd_check.py:2 names the method and lines 6-8 hold the three Machado matrices; try-works/src/scripts/cvd_check.py:2 names it too). Pequod uses Vienot 1999. Ambergris has no CVD notes. Gam simulates all four families with Vienot, while the adapters' cvd.summary texts quote the Machado-based conclusions of Glauca and Try-Works (glauca.js:31, try-works.js:30).
- The two methods disagree. I applied the Machado matrices from glauca/src/scripts/cvd_check.py (severity 1) with gam's own lab and deltaE to the accents of all four families (S/work/cvd-compare.mjs). The worst pair differs in 8 of the 24 family, mode and type cells, and the worst delta E differs by up to 4.2 (Ambergris dark tritan: 0.7 under Vienot, 4.9 under Machado; Glauca dark tritan: 1.4 and 5.5; Pequod light tritan: Pip and Daggoo 13.3 under Vienot, Starbuck and Tashtego 10.8 under Machado).
- test/colour.test.js:50-61 asserts the Vienot numbers of Pequod's README (worst pairs and delta E), so a change of method fails that test by design.
- orderForCvd is factorial. In Node 24 it takes 872 ms for 8 of 8 (Pequod light) and 3.2 s for 10 of 10 (synthetic). The Carpenter calls it on the main thread (carpenter.js:98). The comment at cvd.js:119-121 assumes at most eight accents.
- Glauca and Try-Works light accents contain a duplicate colour each, so delta E is 0.0 for aer and imum (Glauca) and flame and oil (Try-Works).

## 4. Generators (src/generators)

### 4.1 Modules

| Module | Lines | Exports |
|---|---|---|
| index.js | 58 | GROUPS (6), GENERATORS (28, in Carpenter order), byId, officialFor, generateAll, bundle |
| common.js | 115 | SITE, kebab, camel, snake, SYNTAX_ROLES, ROLE_NAMES, ANSI_NAMES (duplicates of token.js), view, defaultPrefix, provenance, header, rgb01, rgb255, json, fileBase, modesOf |
| web.js | 173 | css, scss, tailwind3, tailwind4, dtcg, tokensStudio |
| publishing.js | 164 | quartoBrand, quartoScss, typst, latex, pandocCss |
| data.js | 141 | ggplot2, matplotlib, observable |
| editors.js | 246 | vscode, zed, neovim, obsidian |
| terminals.js | 119 | ghostty, alacritty, kitty, wezterm, tmux, windowsTerminal, iterm2 |
| palettes.js | 96 | gpl, ase (and encodeAse), hexList |

Every generator is an object { id, label, group, ext, mime, generate(fam, opts) }. generate returns an array of { name, content, mime }; content is a string, or a Uint8Array for .ase. opts is { mode: 'dark', 'light' or 'both', prefix?, accents? }. The shared view(fam, opts) (common.js:36-80) flattens a family and mode to hex strings.

### 4.2 The 28 formats

f is the kebab-case family name (pequod, glauca, try-works, ambergris) and m is dark or light. "Official" lists the families whose repository ships a file the Carpenter offers for that target (P Pequod, G Glauca, T Try-Works, A Ambergris; "dark" means dark only).

| # | id | Group | Module and line | Output files (mode both) | Target application | Official |
|---|---|---|---|---|---|---|
| 1 | css | web | web.js:27 | f.css (single mode: f-m.css) | CSS custom properties; light at :root, dark under prefers-color-scheme and [data-theme="dark"] | G, T, A |
| 2 | scss | web | web.js:49 | _f.scss | Sass variables and maps | none |
| 3 | tailwind3 | web | web.js:95 | tailwind.f.config.js | Tailwind CSS 3 theme.extend.colors | none |
| 4 | tailwind4 | web | web.js:105 | f.theme.css | Tailwind CSS 4 @theme | none |
| 5 | dtcg | web | web.js:159 | f.tokens.json | W3C Design Tokens (DTCG) | none |
| 6 | tokens-studio | web | web.js:167 | f.tokens-studio.json | Tokens Studio for Figma | none |
| 7 | quarto-brand | publishing | publishing.js:7 | _brand.yml (light mode only) | Quarto brand.yml | none |
| 8 | quarto-scss | publishing | publishing.js:34 | f-dark.scss, f-light.scss | Quarto HTML theme (Bootstrap SCSS) | none |
| 9 | typst | publishing | publishing.js:68 | f.typ | Typst | G, T (colors.typ) |
| 10 | latex | publishing | publishing.js:92 | f-colours.tex (declared ext is sty) | LaTeX xcolor | none |
| 11 | pandoc-css | publishing | publishing.js:115 | f-pandoc.css | Pandoc standalone HTML | none |
| 12 | ggplot2 | data | data.js:8 | f.R | R, ggplot2 scales and theme | none |
| 13 | matplotlib | data | data.js:75 | f-dark.mplstyle, f-light.mplstyle, f_colours.py (f in snake case) | Python, matplotlib style and colormaps | none |
| 14 | observable | data | data.js:122 | f-scheme.js | Observable Plot, D3 | none |
| 15 | vscode | editors | editors.js:8 | f-m-color-theme.json | VS Code | P, G, T |
| 16 | zed | editors | editors.js:98 | f-gam.json (one theme family, both modes) | Zed | P, G, T, A (dark) |
| 17 | neovim | editors | editors.js:146 | f-m.lua | Neovim colourscheme | none |
| 18 | obsidian | editors | editors.js:189 | f-obsidian.css | Obsidian CSS snippet | G, T (theme.css) |
| 19 | ghostty | terminals | terminals.js:7 | f-m (no extension) | Ghostty | P (dark), G, T, A (dark) |
| 20 | alacritty | terminals | terminals.js:19 | f-m.toml | Alacritty | P (dark) |
| 21 | kitty | terminals | terminals.js:35 | f-m.conf | kitty | P (dark) |
| 22 | wezterm | terminals | terminals.js:49 | f-m.lua | WezTerm | P (dark) |
| 23 | tmux | terminals | terminals.js:63 | f-m.conf | tmux | P (dark) |
| 24 | windows-terminal | terminals | terminals.js:81 | f-m.windowsterminal.json | Windows Terminal | P (dark) |
| 25 | iterm2 | terminals | terminals.js:93 | f-m.itermcolors | iTerm2 | P (dark), G, T |
| 26 | gpl | palettes | palettes.js:18 | f.gpl | GIMP, Inkscape | none |
| 27 | ase | palettes | palettes.js:80 | f.ase (binary) | Adobe swatch exchange | none |
| 28 | hex | palettes | palettes.js:88 | f-hex.txt | plain hex list | none |

Files per family in mode both: 17 generators give one file, 10 give two files (quarto-scss, vscode, neovim and the seven terminal generators) and matplotlib gives three, so 17 + 20 + 3 = 40 files. Mode dark gives 29 files. Measured: 40 generated files for each of the four families in mode both.

The generators' own ext, mime and hasPrefix fields are not read by any code (the Carpenter uses id, label and group; mime comes from each returned file). The latex entry declares ext sty but emits .tex.

### 4.3 Purity and portability

- Pure. Each generate is a function of (fam, opts) and module constants. The generator modules contain no fs, process, Date, random, fetch, document or window references (grep of src/generators, src/colour, token.js, ghostty.js, readme.js). Their only imports are each other, src/colour/hex.js and fflate.
- Method syntax. 22 references to this.mime in 21 generators (all except the seven terminal generators; for example web.js:37, editors.js:93, palettes.js:28), so generate must be called as a method or bound. Extracting it as a bare function breaks it.
- Node and browser. The same modules run in Vitest (Node 24) and in the Carpenter bundle. Check: the zip for Glauca in mode both is 73,968 bytes with 51 entries from bundle() in Node and from the Carpenter's zip button in a browser.
- Model source differs. Node tests build the model with the adapters (loadAll); the browser imports src/generated/model.json. officialFor tolerates both because it checks ships[].official (index.js:31-39).
- Extra data outside the model: defaultPrefix map of four family ids with a kebab fallback (common.js:82-84); author 'Tiago Jacinto' in the Zed theme (editors.js:141); a JetBrains Mono font stack in the Quarto SCSS (publishing.js:47); the SITE URL in headers. Everything else comes from the model.
- Only css and scss read the prefix option (web.js:33, 55).

### 4.4 Family and mode support

- All 28 generators run for all four families. The snapshot suite covers 28 x 4 (mode both) and 28 x 1 (Pequod, dark).
- Data-dependent differences: a diverging scale exists only for Glauca and Try-Works (ggplot2, matplotlib and observable print it only then); the exported series are dataviz.categorical when the family has one (Pequod's 8 accents, the 7 Okabe-Ito colours of Glauca and Try-Works). Ambergris has none, so view() builds series from accents, which for Ambergris means the interaction teal plus the five sequential sweep colours (common.js:73), although the family states the sweep is sequential only.
- Mode both per generator: one file per mode (quarto-scss, vscode, neovim, matplotlib styles, the seven terminals); one file holding both (css, scss, tailwind3, tailwind4, dtcg, tokens-studio, typst, latex, pandoc-css, ggplot2, observable, zed, obsidian, gpl, ase, hex); one file holding one mode when both are asked (quarto-brand, light).
- The Carpenter's accent choice does not change output for Pequod, Glauca or Try-Works. view() computes a chosen-accent list (common.js:39-41) that no generator reads (all use allAccents), and series come from the model's categorical list unless it is empty. Measured (S/work/accent-select.mjs): with two accents chosen, the series count stays 8, 7 and 7 for those families and drops to 2 for Ambergris. The Carpenter text promises that ticks and order drive series colours for CSS, ggplot2, matplotlib, Observable and Typst.

### 4.5 Official files and formats that need assets outside the model

- Official files come from ships[].files, hard-coded in the adapters. build-model.mjs copies each to public/official/{family}/{basename} and the Carpenter fetches them from its own origin. officialFor matches a ship to a generator only when ship.target equals the generator id (index.js:32).
- Eight copied files are never offered: Glauca and Try-Works each ship two Quarto SCSS files, an R file and a Python file whose targets (quarto, r, python) match no generator id. Tailwind ships carry no file. Measured on the built copy: dist/official holds 41 files (Pequod 10, Glauca 14, Try-Works 14, Ambergris 3); 33 are reachable and 8 are not.
- Basenames repeat across families (theme.css and colors.typ for both Glauca and Try-Works). The URL tree is per family, but the zip flattens to official/{name} (index.js:55).
- Formats the families ship that Gam cannot generate (from the also lists and unmatched ships): Firefox, Thunderbird, Vivaldi, Zotero, oh-my-zsh, Miniflux, MarkEdit, PowerPoint, print CMYK specification, family CSS layers (a11y, p3, motion, typography), Typst slides and posters.
- Not modelled, so not exportable: typography, spacing, motion, print CMYK, P3 values, high-contrast overrides.

## 5. The Carpenter

### 5.1 Loading

- The page is src/pages/30-carpenter.js (scripts: src/workshop/carpenter.js, stylesheet src/styles/carpenter.css). layout.js emits a module script tag for it and for src/site.js.
- carpenter.js imports the whole model as JSON (line 4), the generators (5), defaultPrefix (6), the colour modules (7-8), walkTokens (9) and announce and copyText from src/site.js (10). All static imports, no lazy chunks.
- Vite bundles them into dist/assets/carpenter-{hash}.js: 224.62 kB, 48.75 kB gzip in my build. The chunk holds the full model, including each ship's installHtml (unused by the Carpenter), the 28 generators and fflate. site-{hash}.js is 3.79 kB.
- Nothing is fetched except official files from the site's own /official/ tree (fetchOfficial, lines 128-134, reads them as text).

### 5.2 State and flow

- State (26-33): family, mode (default both), prefix, accents (ordered ids), enabled (Set), count. options() returns { mode, prefix, accents } (36-40); count is used only by the CVD ordering.
- Controls: family select, mode radios, CSS prefix, accent list with checkboxes and up and down buttons, Keep count, "Order for colour-vision distance", one preview card per generator, "Download all as zip", contrast checker.
- Each card is a details element. It shows the official file and the generated files as variants, a Copy button, a Download button, and notes such as "The dark terminal palette is derived by Gam" (154-211). update() (232-251) regenerates all 28 generators for the current family on every input event.
- ASE previews show "Binary file, N bytes" and only offer download.

### 5.3 Zip

- bundle() (generators/index.js:47-58) builds the tree group/id/file for all 28 generators, official/{name} for fetched official files, and README.txt (family, version, token file, commit, mode, licence lines), then calls fflate zipSync at level 6 on the main thread.
- downloadZip (carpenter.js:213-230) fetches official files one after another and skips a failed fetch silently (line 221), then triggers a Blob download named {family}-{mode}-gam.zip.
- Measured in Node (S/work/zip-counts.mjs): 5 to 40 ms per family; sizes 26,959 to 73,968 bytes; entries 31 to 51 (both modes: Pequod 51, Glauca 51, Try-Works 51, Ambergris 44).
- Nothing selects formats or families; the zip always holds all 28 generators of one family.

### 5.4 Contrast checker and CVD

- checker() (272-321) offers a family and a token select for text and surface, so a pair can mix families. tokenList (255-263) walks the family with walkTokens and de-duplicates by alias or id. Glauca and Try-Works give 134 options each, Ambergris 90, Pequod 73.
- Output: the WCAG 2 ratio, badges AA (4.5), AA large (3) and AAA (7) with thresholds written inline (304-306), the grade, the worst delta E across the three simulations, and four preview cards (as designed, protan, deutan, tritan) that show the simulated pair with its own ratio.
- The accent list has an "Order for colour-vision distance" button (92-117). It keeps the n accents with the best worst-case delta E and orders them so that neighbours are far apart, then shows strips for all three simulations.
- CVD method is Vienot 1999 (page text at src/pages/30-carpenter.js:66). No APCA, no achromatopsia.

### 5.5 Persistence and query string

- The Carpenter persists nothing. Its chunk has no localStorage, sessionStorage or IndexedDB call. src/site.js (loaded on every page) stores the site theme, family and mode, under the localStorage key gam-theme only when the visitor changes the switcher; the Carpenter ignores it. In a browser check after loading /carpenter/?family=glauca, localStorage and sessionStorage were both empty.
- Query string: on load it reads family (carpenter.js:45-47) and accepts it only if it is in model.order. On change it writes family with history.replaceState (334-336). Mode, prefix, accents and formats are not in the URL. Home cards and family pages link to /carpenter/?family={id}; the family pages also link /carpenter/#contrast.

### 5.6 Checked in a browser

I served the built copy with vite preview on 127.0.0.1:4174 and drove it in the Browser pane, then stopped the server. On /carpenter/?family=glauca: the family select showed Glauca, 28 output cards in six groups, official badges on css, typst, vscode, zed, obsidian, ghostty and iterm2, 8 accent rows, prefix gl, 134 checker options. The zip button produced glauca-both-gam.zip, 73,968 bytes, 51 entries (10 under official/), with only same-origin requests.

### 5.7 What would change for ten families, multi-select and a zip of the selection

| Area | Today | Change needed |
|---|---|---|
| Family choice | One select from model.order, rendered at build (30-carpenter.js:21-23); state.family is a string | Set of families; checkbox group; parse and write a list in the query string (carpenter.js:44-52, 334-336) |
| Format choice | None. renderOutputs draws all 28 (146-152); bundle always calls generateAll | Selected-format set with group toggles; bundle needs a generator list argument |
| Zip layout | group/id/file, official/{name}, one README.txt for one family | Family folder at the root; _brand.yml, theme.css and colors.typ collide across families; README per family or per bundle |
| Per-family options | Prefix default from a four-entry map (common.js:82-84). Accent selection is per family and only affects Ambergris | Prefix per family or global with a fallback; drop the accent picker or make it work for all families (4.4) |
| Model payload | Whole model.json is in the Carpenter chunk, 4 families give 224 kB | Extrapolated: about 2.5 times that for ten. Strip installHtml and ship fields, or import() one family file on demand |
| Recompute cost | update() runs 28 generators per input event (232-251) | Lazy render on open; memoise by family, mode, prefix |
| Official files | Sequential fetch, failures skipped silently; text only (r.text()) | Parallel fetch, report failures, handle binary files, per-family paths |
| CVD ordering | Exhaustive, 0.9 s for 8, 3.2 s for 10, factorial beyond | Heuristic or Worker if any family has more than about 9 accents |
| Contrast checker | Two token selects of 73 to 134 options each per family | Optgroup per family and search for ten families (extrapolated: about 1,000 options) |
| Zip time | zipSync, 5 to 40 ms per family in Node | Extrapolated: about 0.5 MB and 50 to 400 ms for ten families; acceptable, or use the async zip |
| Site chrome | NAV, theme stylesheet, favicon and Open Graph image assume four families | Other agent's area; layout.js:8-17 hard-codes the four |

## 6. Tests

### 6.1 Files and counts

Run in S/work/gam-code: npm ci exit 0 in 1.1 s (warm cache). npm test exit 0: pretest ran model and render, then vitest reported "Test Files 4 passed (4)" and "Tests 231 passed (231)", duration 2.84 s (tests 80%, import 11%, transform 8%), 4.8 s wall. A second run with the verbose reporter took 1.95 s. A run with CI=true passed 231 of 231 (7.93 s; slower than the first run, cause not checked). There was no failure text and nothing was skipped: python3 3.9.6 and Rscript are installed here, so the Python and R tests ran. npm run build also succeeded (1.9 s wall).

| File | Tests | Lines | What it covers |
|---|---|---|---|
| test/colour.test.js | 7 | 76 | hex round trip and mix8; WCAG ratios from Pequod's README (log.800 on log.100 about 10.8, log.100 on log.950 about 14.0) and grade thresholds; the Vienot port reproduces Pequod README worst pairs; greys unchanged and clamping; orderForCvd |
| test/model.test.js | 18 | 106 | origin audit (4); shape (4); Glauca and Try-Works derived light code colours equal the shipped light VS Code themes (2); chrome contrast (8) |
| test/generators.test.js | 191 | 242 | 140 snapshots; 48 parse tests (12 per family); hex audit; zip; official files |
| test/site.test.js | 15 | 103 | tracked files under src and test; no emoji; British spelling; 9 rendered pages plus route list; theme stylesheet |

generators.test.js detail. Snapshots: 28 generators x (4 families in mode both plus Pequod dark) = 140 tests, each asserting the output is non-empty, every file has name and mime, and content matches a file snapshot. Parse tests per family: JSON formats (dtcg, tokens-studio, vscode, zed, windows-terminal), YAML (quarto-brand with js-yaml), TOML (alacritty with smol-toml), Lua (wezterm and neovim with luaparse 5.3), plist (iterm2), JavaScript (tailwind3 and observable evaluated with new Function), CSS and SCSS (a hand-written brace and semicolon checker over six generators), Typst and LaTeX (parenthesis balance and definecolor line shape), terminals (Ghostty parsed back, kitty and tmux line shapes), palettes (GPL rows and a walk of the ASE blocks), Python (python3 ast.parse of the matplotlib module), R (Rscript parse of the ggplot2 file). The last three tests: every 6-digit hex in every export (except ASE) belongs to the family's model; the zip holds README.txt, official/, web/css/ and more than 30 entries; officialFor returns the expected official files (reads src/generated/model.json). Eight-digit hex values are not audited (the regex needs a word boundary after six digits).

Which tests read what. Only the 140 snapshots use frozen fixtures (loadAll on test/fixtures/, generators.test.js:19). The other 91 read live vendor/ and the built model.json and site/, so an upstream change can fail them. The origin audit (test/model.test.js:21-29) checks that each hex appears somewhere in the named file, not at the named path.

### 6.2 Snapshots (test/__snapshots__, 189 files, 1.0 MB)

- Path pattern: test/__snapshots__/generators/{family}/{mode}/{generator id}/{generated file name}, with .hex appended for binary content (generators.test.js:39).
- Mode is both for all four families (40 files each) and dark for Pequod only (29 files): 4 x 40 + 29 = 189.
- Content is the exact generated text. Example: the first line of pequod/both/css/pequod.css is "Pequod 0.2.0-alpha (pequod.json, commit 619982d). Generated by Gam, ..." so every snapshot carries the fixture commit. The ASE file is stored as hex text, 64 characters per line (pequod/both/ase/pequod.ase.hex).
- Update with npx vitest run -u (README.md:75-76).

### 6.3 Fixtures (test/fixtures, 19 files, 156 KB)

| Family | Files |
|---|---|
| pequod (4) | COMMIT (619982d), README.md, pequod.json, themes/terminals/Pequod.ghostty |
| glauca (5) | COMMIT (1efbcce), README.md, src/glauca.json, dist/themes/terminals/Glauca-Dark.ghostty, Glauca.ghostty |
| try-works (5) | COMMIT (400dd91), README.md, src/try-works.json, dist/themes/terminals/Try-Works.ghostty, Try-Works-Cold.ghostty |
| ambergris (5) | COMMIT (c92c190), tokens.json, ports/ghostty/ambergris-dark, ports/zed/ambergris.json, ports/README.md |

They are exactly the token file plus each adapter's NEEDS list. The 15 content files are byte-identical to the vendor copies at the same commits (cmp). They are not enough for npm run model, which also needs every official file and README install section.

### 6.4 scripts/update-fixtures.sh

Runs an embedded Node script (lines 8-23) that copies [tokens file, ...NEEDS] of each adapter from vendor/ to test/fixtures/{family}/ and writes COMMIT from git rev-parse --short HEAD. I ran it in the temp copy on Node 24: it exited 0 and left git status clean, so it reproduces the committed fixtures. It pipes ESM syntax to node on stdin, which relies on Node detecting ES modules (unverified on Node 20). Gam commit 886425e ("Refresh the Glauca fixture to its rewritten history") shows a family repository has rewritten history once, so a pinned SHA can disappear.

### 6.5 What the tests lock about contrast

Locked:

- test/model.test.js:84-106, for 4 families x 2 modes (8 tests): contrast at least 4.5 for text on bg, textMuted on bg, link on bg, linkHover on bg, text on surface, textMuted on surface, onButton on button, text on selection; and focus on bg at least 3. These use model roles only. Tightest pair in each combination (computed): pequod dark textMuted on surface 4.74; pequod light textMuted on surface 5.18; glauca dark textMuted on surface 4.95; glauca light link on bg 5.18; try-works dark link on bg 4.64; try-works light link on bg 4.61; ambergris dark link on bg 6.92; ambergris light link on bg 4.58. Focus on bg is lowest for Pequod light at 3.34.
- test/colour.test.js:24-34: two ratios from Pequod's README to one decimal, the grade thresholds (21 AAA, 4.5 AA, 3 AA-large, 2.9 fail), and black on white equals 21. These test the formula, not the palettes.

Not locked (verified by reading the tests and computing from the built model):

- Any accent or syntax colour on a background, any terminal ANSI colour on the terminal background, data-viz colours, textSubtle, border, AAA, APCA, and non-text contrast other than focus.
- The failing Pequod pairs. Computed from pequod.json at 619982d with gam's contrast(): on Parchment (bg Log 100, #EAE1D7) Starbuck #0082B1 3.37, Ishmael #76716B 3.74, Stubb #CA6435 3.02, Tashtego #177C55 4.01; on Below deck (bg Log 950, #0B1720) Daggoo #A17069 4.35. All five are at or above 3 (AA large) and below 4.5 (AA). No test asserts them. The rendered Pequod page lists exactly these five rows with an AA fail badge (src/pages/10-family.js:44-58, src/site/components.js:84-93; checked by parsing site/pequod/index.html). Pequod README.md:275-279 says dark Daggoo is 3.6, which does not match the token file.
- Other AA failures shown on family pages and not tested: Glauca dark Imum #084B96 2.13 (also below 3); Try-Works dark Oil #9A4A16 2.91; Ambergris light Sweep 1 #2EA094 3.09 and Sweep 2 #0587A4 4.05. Imum equals Glauca's light accent-deep (#084B96) and Oil equals Try-Works's dark accent-deep (#9A4A16); the two failing rows exist because the adapter uses each palette token as the dark variant of its core accent (2.4). textSubtle on bg is below 4.5 for Pequod dark (4.20) and Ambergris light (4.36); site.css:306 uses it for the "Public domain." line in samples.
- The Pequod adapter drops the file's link-hover because it fails AA (3.34 light, 4.20 dark), so the chrome test cannot see that failure.

The home page sentence (src/pages/00-home.js:20) reads "Each publishes its tokens as a single JSON file that the rest of its repository regenerates from, with contrast locked by tests." It describes the families' own tests, which Gam does not re-run:

| Family | Own contrast lock | Evidence |
|---|---|---|
| Glauca | 18 WCAG rows in validate.py (run in CI) | glauca/src/scripts/validate.py:78, CLAUDE.md:57 |
| Try-Works | 13 rows in validate.py | try-works/src/scripts/validate.py:68 |
| Ambergris | 23 rows in tokens.json contrast.assert; build.mjs exits 1 before writing any file | ambergris/tokens.json:114-139, build.mjs:29-41, CLAUDE.md:48 |
| Pequod | none found: no workflow file, no contrast code in scripts, python, r or tailwind tests, a README table only | grep of pequod at 619982d |

## 7. scripts/build-model.mjs and scripts/vendor.sh

### 7.1 How the token files reach the build

- npm run vendor runs scripts/vendor.sh. For each of pequod, glauca, try-works, ambergris it runs git clone --depth 1 of https://github.com/tiagojct/{family} into vendor/{family}; if the directory exists it fetches depth 1 and checks out FETCH_HEAD (lines 24-44).
- Ref: the default branch head (main for all four) unless an argument name=ref is given (line 6). CI passes none. Both CI jobs run the script separately (workflow lines 44-47 and 66-69), so the tested tree and the published tree can differ if a family pushes in between.
- Environment: GAM_VENDOR_TOKEN. When set, the remote becomes https://x-access-token:{token}@github.com/tiagojct/{family} (lines 16-22). Clone and set-url store that URL in vendor/{family}/.git/config. The README says Glauca, Try-Works and Ambergris were private; on 2026-09-29 anonymous git ls-remote succeeded for all four, at the pinned heads.
- Risk (reasoned from the files, not tested): .dockerignore excludes .git only at the context root, and deploy/Dockerfile:9 copies the whole context, so a token-bearing `vendor/*/.git/config` would enter the build stage layers, which the workflow also exports to the Actions cache (cache-to mode max). The final nginx image copies only dist/.
- Commit recording: src/model/load.js:31-39 reads vendor/{family}/COMMIT if present (fixtures use this), otherwise runs git rev-parse --short HEAD, otherwise returns 'unknown'.

### 7.2 Defect: commit is "unknown" in production

The live About page and footer (fetched 2026-09-29) read "Pequod 0.2.0-alpha (unknown), Glauca 0.1.0 (unknown), Try-Works 1.0.0 (unknown), Ambergris 0.3.0 (unknown)" and "at commit unknown" four times. Cause, inferred: the Docker build stage has no git, so commitOf falls back to 'unknown' (load.js:37). I reproduced the mechanism by running build-model.mjs with git off PATH in the temp copy: all four commits become unknown. Another agent's log S/work/docker-ctx-build.log shows "git: command not found" during npm run model (method not checked). Effects: every exported file's provenance header, the zip README.txt and the About page say "commit unknown", which contradicts the Carpenter text at src/pages/30-carpenter.js:60 ("Every generated file carries the family, version and commit it came from").

### 7.3 What build-model.mjs writes

- Loads all four families with loadAll (line 22).
- Deletes and recreates public/official/ (23-24). For each ship with files it copies each file to public/official/{family}/{basename} and records ship.official[mode] = { path, url: /official/{family}/{basename}, name } (35-45). A missing file throws.
- For each ship with install it renders the named README section with markdown-it, rewrites relative links to {repo}/blob/main/{path}, and stores installHtml and installSource (30-34). A missing heading throws, so an upstream heading rename breaks the build.
- Writes src/generated/model.json (indent 1; { site, order, families }) and src/generated/meta.json (site, order, and per family name and bg per mode; 418 bytes) (49-68).
- site.builtAt is today's date; site.version comes from package.json.

## 8. What a one-off migration script must read

### 8.1 Per format

| Format | Adapter files | Documentation of the format | Also needed to reproduce what gam shows |
|---|---|---|---|
| pequod.json | src/model/adapters/pequod.js; shared token.js, ghostty.js, readme.js, load.js | pequod/README.md:244-260 (keys log, accents, roles, syntax); no schema file (the $schema key is the generic JSON Schema URL) | themes/terminals/Pequod.ghostty (hand-made, 7 colours not in the JSON); README.md; licence and homepage keys; scripts/cvd_check.py (Vienot method); the shipped VS Code, Zed, iTerm2 and terminal files listed in ships |
| glauca.json | src/model/adapters/glauca.js, system.js; shared files | glauca/CLAUDE.md:52-66; glauca/src/scripts/validate.py:14 (required keys), :78 (contrast rows); glauca/docs/FOUNDATIONS.md; no schema file | `dist/themes/terminals/*.ghostty`; README.md; glauca/src/scripts/generate.py:1480 (_light_remap) and generate_obsidian.py:16, 86 (_mix and the 0.45 rule); cvd_check.py (Machado) |
| try-works.json | src/model/adapters/try-works.js, system.js; shared files | try-works/CLAUDE.md:48-64 (frozen public surface from 1.0, and the version is 1.0.0); try-works/src/scripts/validate.py:68; docs/FOUNDATIONS.md; no schema file | `dist/themes/terminals/*.ghostty`; README.md; try-works/src/scripts/generate.py:557 (_cold_remap); cvd_check.py (Machado) |
| ambergris tokens.json | src/model/adapters/ambergris.js; shared files | ambergris/CLAUDE.md:45-75 (alias resolution, contrast gate, gotchas); ambergris/build.mjs:16 (resolver), :29-41 (gate), :165 (ANSI16); no schema file | ports/ghostty/ambergris-dark; ports/zed/ambergris.json (the only syntax source); ports/README.md; the 4 rules in meta.rules |

The ship lists and install sections need the family READMEs and each ship's install README (for Glauca and Try-Works: dist/vscode/README.md, dist/zed/README.md, dist/themes/terminals/README.md, dist/obsidian/README.md, dist/tailwind/README.md, dist/quarto/README.md, dist/typst/README.md, README.md). The adapters hold the ship lists, taglines, CVD summaries, licences, labels and hue names, which are not in any token file.

### 8.2 Ten difficulties in unifying the four formats

1. Three reference styles. Pequod roles are bare step names ("log.100"). Ambergris uses "{color.grey.950}" with nested {hex, oklch} objects and alpha strings that contain rgb(). Glauca and Try-Works store literal hex per mode with no references at all, so the palette links (for example dark text equals whale) must be recovered by matching hex, as gam does in system.js:98-105.
2. Mode representation. Four key sets (roles.light and dark; modes.dark and light; modes.lit and cold; theme.dark and light). Try-Works mixes lit and cold in modes, a11y and gamut with dark and light in dataviz.plot. Labels sit in adapter constants for Pequod and Ambergris and in the file for the others. Light-first versus dark-first is recorded nowhere in gam.
3. Derived versus stored values. Glauca and Try-Works keep a dark-only code map and a dark-only terminal block and derive light colours in generate.py with gamma-space 8-bit blends (0.35, 0.45, 0.5) and a lookup table keyed by hex. Ambergris ships dark ports only; Pequod ships a dark terminal only. The schema must hold either the derived values or the rules, and the script must materialise them. Two accents per system family collapse to one light colour.
4. Syntax roles. Ten roles as accent names (Pequod), eleven as code.{role}.{color, style} (Glauca, Try-Works), none in Ambergris tokens.json (only Zed port keys such as attribute). Gam's twelve roles need six fallbacks (decorator, parameter, constant). Style exists only in two files and in the Zed port; Pequod's italic comment is hard-coded.
5. Accent semantics. Pequod: eight hues with authored light and dark variants. Glauca and Try-Works: a three-shade trio of one hue plus five code-only hues. Ambergris: one interaction accent plus a five-step sequential sweep that gam relabels as extended accents and exports as series. The schema needs separate concepts for hue families, shade steps and data scales.
6. Scale structure. Numbered ramps (Pequod 12; Ambergris 13 plus 10) against named groups without an order (Glauca saxum, glaucum, caelum, pruina, extended; Try-Works ground, sea, fire, whale, extended). Gam merges the three neutral groups into one 11-step scale sorted by luminance and keeps the group name only as a field.
7. ANSI and terminal data. Gam reads Ghostty output files for all four families, not tokens. Glauca and Try-Works JSON have a positional 16-item ansi array with keys cursor-text, selection-bg and selection-fg; Ambergris has a named object; Pequod has no terminal data in pequod.json. Slot names differ between gam (bright-black), Windows Terminal (purple, brightPurple) and the positional arrays.
8. Colour encoding. Hex only in gam (case differs: Pequod and Ambergris upper-case, Glauca and Try-Works lower-case with mixed case in their data-viz lists). Ambergris carries oklch() strings and rgb(r g b / a) overlays kept in step by hand (ambergris/CLAUDE.md:66-68). Glauca and Try-Works carry color(display-p3 ...) values. A canonical colour form and a rule for alpha and wide gamut are needed.
9. Metadata outside the token files. Description (README paragraph versus meta.description), tagline, licence (a licence object only in Pequod), changelog path (CHANGELOG.md, docs/CHANGELOG.md, none), repository URL, ship lists, install sections addressed by README heading text, CVD notes. All are adapter constants today.
10. Assertions and non-colour tokens. Ambergris keeps 23 contrast rows in the token file, Glauca 18 and Try-Works 13 in Python, Pequod none; gam asserts eight chrome pairs. The files also carry type, spacing, motion, print CMYK, gamut, status, shadow and accessibility tables that gam ignores. Try-Works 1.0.0 and Glauca (from 1.0) treat the JSON schema as public surface (CLAUDE.md), so their files cannot change without a version decision.

## 9. Findings that change the migration plan

- No colour library exists in gam, so "continuity" is limited to fflate and the WCAG formula (1.5).
- CVD changes numbers if Machado replaces Vienot, and a test locks the Vienot values (3).
- Light modes, light terminals and Ambergris syntax are derived by adapter rules that copy family generators; the schema must store values or rules (2.4, 8.2 item 3).
- Terminal and Ambergris syntax data come from generated or hand-made files, not from tokens (2.4, 8.2 item 7).
- Contrast: only eight chrome pairs and focus are locked; five Pequod accent pairs fail AA untested; the home page claim is true of three families' own tests and not of Pequod (6.5).
- Production provenance is broken: commit is "unknown" on the live site (7.2).
- Ninety-one of 231 tests depend on live upstream files; only 140 snapshots are frozen (6.1).
- Carpenter defects to fix or drop: accent selection is a no-op for three families; Ambergris sweep exported as series; eight unreachable official files; zip name collisions across families; silent skipped fetches (4.4, 4.5, 5.7).
- Node is unpinned; vitest 5 declares Node 22.12 or later while CI uses 20 (1.1).

## 10. Not verified

- The Node minor that setup-node resolved in CI run 10, and the CI job logs.
- The contents of the deployed Docker image; the git-less build stage is inferred from the live output, my git-off reproduction and another agent's log.
- Whether the GAM_VENDOR_TOKEN secret still exists; the cache-layer risk in 7.1.
- update-fixtures.sh on Node 20.
- culori or apca-w3 behaviour; I compared only gam's Vienot code with the Machado matrices published in the Glauca script, using my own implementation.
- Screen appearance of the Carpenter (I checked behaviour and DOM, not screenshots).


Part B: site, build, deployment, CI and provenance

# Gam site, build, deployment, CI and provenance: inventory (phase 1)

## Scope, method and limits

- Repository: `S/clones/gam` at f16228db99ff630fed8083a2d6ad9498bc008b0e (2026-09-21 23:14 +0100). 18 commits, all on 2026-09-21, one branch (main), no tags. S is the scratchpad root. Paths below are relative to the repository root unless they start with S, http or a tool name. The clone was not modified.
- Temporary copy for installs and builds: `S/work/gam-site` (npm ci, vendor.sh, build, tests, update-fixtures.sh). Simulated Docker build context: `S/work/docker-ctx`. Browser harness: `S/work/serve.mjs` (copies the nginx response headers), `S/work/cdp-run.mjs` (headless Brave 154.1.96.59, Chromium, over the DevTools protocol), `S/work/probe-root/` (CSP probes). Superseded leftovers, not deleted: `S/work/docker-sim`, `S/work/docker-context`, `S/work/dist-run1`, `S/work/di-test`, `S/work/shots`, `S/work/brave-profile*`.
- Local Node v24.21.0 and npm 11.19.0. CI and the Dockerfile use Node 20.
- Network reads made: github.com (git clones through vendor.sh, HEAD requests, public REST API for runs, jobs and annotations), registry.npmjs.org, Docker Hub and GHCR anonymous manifest and config reads (metadata only, no layers), public pages on gam.tiagojacinto.eu and tiagojacinto.eu. Live observations were made on 2026-09-29 between 21:37 and 22:10 UTC.
- No secrets were met. Secret names are given without values.
- Not run: Docker (not installed), nginx (not installed), Firefox and Safari. See section 10 for every item marked unverified or not done.

## 1. Pages and rendering

### 1.1 Files

| Path | Lines | Role |
|---|---|---|
| `src/pages/00-home.js` | 28 | route `/` |
| `src/pages/10-family.js` | 157 | `pages(model)` returns one page per family: `/pequod/`, `/glauca/`, `/try-works/`, `/ambergris/` |
| `src/pages/20-compare.js` | 74 | `/compare/`: sample blocks for every family, L* aligned scale table (21 bins), accents table |
| `src/pages/30-carpenter.js` | 85 | `/carpenter/`: form skeleton and empty containers; the outputs are built in the browser; `<noscript>` notice at line 14 |
| `src/pages/40-about.js` | 64 | `/about/`: reads `CHANGELOG.md` at render time (line 9); builds the BibTeX (lines 11-18) |
| `src/pages/90-not-found.js` | 13 | `/404/` |
| `src/site/html.js` | 33 | tagged template `html`, `raw`, `escape`, `swatchClass` (`sw-<family>-<token>`), `slug` |
| `src/site/layout.js` | 91 | page shell, `NAV` (lines 8-17), `SITE_URL` (line 6), head metadata, footer (lines 73-78) |
| `src/site/components.js` | 94 | family card, swatch strip and grid, mode pair, sample block, `sampleSet` (CSS-only dark/light switch), contrast row |
| `src/site/theme-css.js` | 65 | writes `src/generated/theme.css` from the model |
| `src/site/favicon.js`, `src/site/og.js` | 22, 32 | SVG mark and Open Graph SVG, both from the model |
| `src/site.js` | 131 | browser module loaded on every page: header picker, copy-hex, toast |
| `src/content/samples.js` | 62 | prose (Moby-Dick chapter 53), hand-tokenised code sample, chart SVG |
| `public/theme.js` | 13 | classic blocking script in `<head>` |
| `src/workshop/carpenter.js` | 350 | Carpenter (covered by the other agent) |

### 1.2 How pages are produced, and the routes in dist

- `scripts/render-pages.mjs` writes plain HTML strings, one `site/<route>/index.html` per page, from `src/generated/model.json`. It loads every `src/pages/*.js` in sorted order and calls `pages(model)` or `page(model)` (lines 19-31). No framework, no Vite plugin. Page objects have `path`, `title`, `description`, `body`, and optionally `scripts`, `stylesheets`, `head`.
- Vite then runs in multi-page mode (`vite.config.js:18-32`): root `site/`, `publicDir` `../public`, output `../dist`, one input per `site/**/index.html`. It rewrites the relative references (`../../src/site.js`, `../../src/generated/theme.css`) into hashed files in `dist/assets/` and copies `public/` to the root of dist. `vite.config.js` scans `site/` when it loads (lines 9-16), so any Vite command fails if `site/` does not exist.
- Built routes (local build; Vite reports gzip sizes):

| Route | dist file | Bytes | gzip kB | Scripts loaded |
|---|---|---|---|---|
| `/` | `dist/index.html` | 15,902 | 4.33 | `site` |
| `/pequod/` | `dist/pequod/index.html` | 55,519 | 8.98 | `site` |
| `/glauca/` | `dist/glauca/index.html` | 58,180 | 10.60 | `site` |
| `/try-works/` | `dist/try-works/index.html` | 54,965 | 9.37 | `site` |
| `/ambergris/` | `dist/ambergris/index.html` | 47,820 | 7.36 | `site` |
| `/compare/` | `dist/compare/index.html` | 87,101 | 7.29 | `site` |
| `/carpenter/` | `dist/carpenter/index.html` | 7,155 | 2.56 | `site`, `carpenter` (224,625 bytes, contains the whole `model.json`) |
| `/about/` | `dist/about/index.html` | 10,012 | 3.74 | `site` |
| `/404/` | `dist/404/index.html` | 3,020 | 1.18 | `site` |

- Live behaviour of the same routes: an unknown path returns status 404 with the 3,020-byte 404 page; `/404/` itself returns 200; `/about` returns 301 with `Location: /about/`; `/about/index.html` returns 200; `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` return 404 (none exist); `/assets/` returns 403.
- All nine live HTML pages are byte-identical to my simulated Docker build once the build date and the chunk file names are normalised (section 3).

### 1.3 Per-family and per-mode restyling

- Mechanism: CSS custom properties selected by `data-family` and `data-mode` attributes. `src/site/theme-css.js` writes `src/generated/theme.css` (56,272 bytes; 569 swatch classes). Each family and mode block declares 80 properties: `color-scheme`, 14 site roles, 12 syntax roles times three (colour, style, weight), 3 terminal, 16 ANSI, 8 series and 2 plot properties (lines 10-32).
- Default family is the first in `model.order` (Pequod). Its light block is `:root, [data-family="pequod"]`; its dark block is `[data-family="pequod"][data-mode="dark"]` and `:root[data-mode="dark"]`; a `prefers-color-scheme: dark` block applies dark when neither attribute forces light (lines 34-48). Other families have `[data-family="x"]` (light), `[data-family="x"][data-mode="dark"]` and a media block.
- The blocks match any element, so a container with both attributes is a scoped preview. `.sample` and `.mode-pair > div` use this (`src/site/components.js:22,59`).
- Swatches: one class per family and token, `.sw-<family>-<token> { --sw: #hex }`, consumed as `background: var(--sw)`. No inline style is needed.
- Colour literals: none in `src/styles/*.css`, `src/site/*.js`, `src/pages/*.js`, `src/workshop/carpenter.js`, `src/site.js` or `public/theme.js` (grep for hex, rgb, hsl and named colours; only `transparent`). A test (`test/site.test.js:99-102`) checks that every hex in `theme.css` exists in the model.
- Origin of colours in the model (distinct family, id, hex, origin tuples): Pequod 99 token file, 22 official file, 11 derived; Glauca 98, 44, 12; Try-Works 98, 44, 12; Ambergris 74, 50, 15. So "read from the family's own token file" is literally true for 53 to 75 per cent of colours (Pequod 75, Glauca and Try-Works 64, Ambergris 53); the rest, 25 to 47 per cent, come from official files the family ships or from named derivations.

### 1.4 Header picker, `public/theme.js`, and no JavaScript

- `public/theme.js` runs before first paint. It reads `localStorage['gam-theme']` (JSON `{family, mode}`), sets `data-family` if the value matches `/^[a-z-]+$/` and `data-mode` if it is `dark` or `light`, all inside try/catch (lines 4-13).
- `src/site.js` (module) builds the picker into the empty `<div id="theme-switch">` (lines 75-114): a select of the families in `meta.json`, and radios System, Dark, Light. On change it stores the choice in `gam-theme`, sets or removes the attributes (removed when the family is the first or the mode is System), updates the two `theme-color` metas from `meta.json`, and dispatches a `gam:theme` event (lines 28-39). It also handles click-to-copy on `[data-hex]` and the toast (lines 116-126).
- Verified in Chromium against the built site: no attributes at first; after choosing Glauca, `data-family="glauca"`, `--bg` changes, storage holds `{"family":"glauca","mode":"system"}`; choosing Light sets `data-mode="light"`; choosing Pequod and System removes both attributes.
- Without JavaScript (script execution disabled in Chromium): `#theme-switch` stays empty, nothing is remembered, and the chrome shows Pequod following the system scheme. Home, family pages, Compare, About and 404 render fully. The Compare and family sample dark/light switch still works (radios plus `:has()`, `src/styles/site.css:326-328`; verified: `.for-dark` and `.for-light` toggle between `contents` and `none`). Copy-hex buttons do nothing but the hex is visible as text. `/carpenter/` shows the notice and inert controls; the Family select is filled by the server, the other selects are empty. Browsers without `:has()` show both sample sets at once.

### 1.5 Copy that will need rewriting

Text is quoted as rendered, with markup removed. `${...}` marks a build-time value.

| Location | Text | Why it needs attention |
|---|---|---|
| `src/pages/00-home.js:20` | "Each publishes its tokens as a single JSON file that the rest of its repository regenerates from, with contrast locked by tests." | Describes four separate repositories. At the pinned commits: Glauca and Try-Works run WCAG contrast in `make validate` (`Makefile:28-29` in each); Ambergris asserts contrast in `build.mjs` from `tokens.json`; Pequod's tests (`python/tests`, `r/tests`, `tailwind/test.js`) do not mention contrast (grep only, validators not run) |
| `src/pages/00-home.js:13` | "Every colour on these pages is read from the family's own token file at build time; none is typed by hand." | See 1.3: 25 to 47 per cent of the colours in the model come from official files or derivations, not from the token file |
| `src/pages/00-home.js:12` | "... four colour families meet ... Each has a dark and a light variant, its own repository, and some combination of editor themes, terminal presets, and Tailwind, Python and R packages." | "four", "its own repository" |
| `src/pages/00-home.js:9`, `src/pages/20-compare.js:35`, `src/pages/30-carpenter.js:8`, `package.json:4` | descriptions naming "four" families and Gam | rename and count |
| `src/pages/00-home.js:23` | "They differ in temperament. Pequod is a reading and code palette with eight named crew accents. Try-Works and Glauca are full design systems, one dark-first and one light-first, ..." | family-specific copy |
| `src/pages/20-compare.js:38` | "The same prose, the same code and the same small chart in all four families at once. Switch every panel between dark and light; the switch works without JavaScript." | "four" |
| `src/site/layout.js:75` (live) | "Gam 0.1.0, built 2026-09-28 from Pequod 0.2.0-alpha (unknown), Glauca 0.1.0 (unknown), Try-Works 1.0.0 (unknown), Ambergris 0.3.0 (unknown)." | version, date and family commits; see section 3 |
| `src/site/layout.js:76` | "Tokens CC BY 4.0, code MIT, each family under its own licence. Licences and citation. Source." | link to `github.com/tiagojct/gam` |
| `src/site/layout.js:27,38,61` | title "Gam: where the four families meet", `og:site_name` "Gam", brand "Gam" with aria-label "Gam, home" | rename |
| `src/pages/40-about.js:51` (live) | "Gam 0.1.0, built 2026-09-28. Every colour on the site was read from these files at that moment:" | version and date |
| `src/pages/40-about.js:53` (live) | "Pequod 0.2.0-alpha: pequod.json at commit unknown" (link to `.../blob/unknown/pequod.json`), same for the other three | commit and links; section 3 |
| `src/pages/40-about.js:55` | "The site rebuilds whenever a family repository changes, and once a week regardless. Source: github.com/tiagojct/gam." | false today for dispatch (no sender installed) and to be removed for both triggers |
| `src/pages/40-about.js:36` | "Unless a repository says otherwise, palette tokens and documentation are Creative Commons Attribution 4.0 and code is MIT. The families:" | licence statement |
| `src/pages/40-about.js:40` (live) | Ambergris cell: "No licence file; the default above is assumed." Others: "Yes: LICENSE-CC-BY-4.0, LICENSE-MIT" with links to `blob/main/` | Ambergris still has no licence file at the pinned commit (`adapters/ambergris.js:189`) |
| `src/pages/40-about.js:43` | "This site: its code (adapters, generators, pages, build) is MIT; its text is CC BY 4.0. ... The fonts, Atkinson Hyperlegible Next and JetBrains Mono, are under the SIL Open Font License and are served as subsets from this site with their licence texts (Atkinson, JetBrains Mono)." | site licence; fonts |
| `src/pages/40-about.js:46,48` | "Cite the family you use, and Gam if the site itself helped. Glauca and Try-Works ship a CITATION.cff; Pequod is on CRAN and PyPI, so citation("pequod") in R gives its entry. For Gam:" and "A CITATION.cff with the same information is in the repository." | citation |
| `src/pages/40-about.js:11-18` | BibTeX: key `jacinto_gam_${year}`, `title = {Gam: where the four Moby-Dick colour families meet}`, `year = {${year}}`, `version = {${model.site.version}}`, `url = {https://gam.tiagojacinto.eu}` | `year` comes from the build date, so a rebuild in 2027 changes the key and year while the version stays 0.1.0 |
| `src/pages/40-about.js:33` | "... Loomings keeps its own copy of the values; Gam reads the repositories at build time, so the two may differ by a release." | build-time reading of separate repositories |
| `src/pages/40-about.js:58` | "Static files only. No analytics, no cookies, no third-party requests. The family and mode you choose are kept in your browser's localStorage and nowhere else; the Carpenter runs entirely on your machine." | true today (section 8) |
| `src/pages/10-family.js:93` | "Canonical tokens in pequod.json, read at commit unknown." with a link to `blob/main/`, not to the commit | text and link disagree |
| `src/pages/10-family.js:106`, `:152` | hard-coded branches on `fam.id === 'pequod'` and `'ambergris'`; "The repository states no licence. This site assumes tokens CC-BY-4.0 and code MIT, as for the other families." | per-family copy in code |
| `src/pages/30-carpenter.js:13,60` | "Everything runs in your browser: nothing is uploaded and no request leaves this site." and "Every generated file carries the family, version and commit it came from." | second claim is false on the live site (commit "unknown") |
| `CHANGELOG.md:26-27`, rendered on the live About page | "nginx image, GitHub Actions workflow with repository_dispatch and a weekly schedule, deployment notes for the VPS." | history entry; a new entry is needed for the removal |
| `src/pages/90-not-found.js:10` | "The ships in this gam are ..." | name |

Statements about versions: footer (`src/site/layout.js:75`), About (`:51`, BibTeX `:15`, `:17`), family cards and headings (`src/site/components.js:29`, `src/pages/10-family.js:91`), Carpenter option labels (`src/pages/30-carpenter.js:22`), OG image text (`src/site/og.js:23`), generated file headers (`src/generators/common.js:88`), `package.json:3` (0.1.0), `CITATION.cff:7,8`, `CHANGELOG.md:7`, `docs/quarto-page.qmd:56-58`.

## 2. Styles and fonts

- `src/styles/site.css` (406 lines): four `@font-face` rules with root-absolute `/fonts/...` URLs and `font-display: swap` (lines 4-31); layout and components; the `.seg` radio toggle and the `.sample-set` switches use `:has()`; `prefers-reduced-motion` (line 378); breakpoints at 48rem and 40rem. `src/styles/carpenter.css` (58 lines) loads only on `/carpenter/`. Built CSS: `dist/assets/site-DccJGk5_.css` 60,173 bytes (theme.css included), no `data:` URLs.
- Fonts in `public/fonts` (6 files):

| File | Bytes | Source and licence |
|---|---|---|
| `atkinson-hyperlegible-next.woff2` | 32,896 | Atkinson Hyperlegible Next, variable weight 200-800, OFL 1.1 |
| `atkinson-hyperlegible-next-italic.woff2` | 36,244 | same |
| `jetbrains-mono.woff2` | 40,604 | JetBrains Mono, variable weight 100-800, OFL 1.1 |
| `jetbrains-mono-italic.woff2` | 43,068 | same |
| `OFL-atkinson.txt` | 4,431 | header: "Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors" |
| `OFL-jetbrains-mono.txt` | 4,399 | header: "Copyright 2020 The JetBrains Mono Project Authors" |

- Licence texts are shipped (`dist/fonts/OFL-*.txt`) and linked from the About page (`src/pages/40-about.js:43`). Neither header declares a Reserved Font Name (the word appears only in the generic licence definition, line 33). Whether the woff2 name tables keep copyright metadata: not checked.
- `scripts/subset-fonts.mjs` (62 lines) is not wired into any npm script. It fetches the six upstream files from `raw.githubusercontent.com/google/fonts/main/ofl/...` (branch `main`, unpinned; the six URLs answer 200 to HEAD today) into the ignored `tools/fonts/src/`, subsets to fixed ranges (Latin, Latin-1, punctuation, euro, Delta, arrows, minus, comparison signs, two boxes, a tick; lines 30-36), and writes woff2 to `public/fonts/` and TTF (upright faces only) to `tools/fonts/`. Both outputs are committed (commit ef45f28), so the build never fetches. Not run here (see section 10).
- Two characters on `/pequod/` fall outside the subset ranges: U+2318 and U+21E7 (text from the vendored Pequod README section). They render in a fallback font.
- OG image: `scripts/build-og.mjs` (24 lines) renders `src/site/og.js` at 1200 px, and `src/site/favicon.js` at 64 px and 180 px, with resvg, `loadSystemFonts: false` and the two TTFs in `tools/fonts/`. Outputs `public/og.png` (42,337 bytes), `public/favicon.png`, `public/apple-touch-icon.png`; `public/favicon.svg` is written by `scripts/render-pages.mjs:17`. All four are git-ignored. The image text includes "Gam", "Where the four Moby-Dick colour families meet", "gam.tiagojacinto.eu" and each family's name and version.
- The live `og.png`, both favicon PNGs, `favicon.svg`, `apple-touch-icon.png`, `theme.js`, both CSS files, a font and an official file are byte-identical to the macOS build (SHA-256 compared), so the Linux musl image build and the local build agree.

## 3. Provenance: why every footer and the About page say "unknown"

### 3.1 Live output (2026-09-29)

- Footer, on every page (`https://gam.tiagojacinto.eu/`, `/about/`): "Gam 0.1.0, built 2026-09-28 from Pequod 0.2.0-alpha (unknown), Glauca 0.1.0 (unknown), Try-Works 1.0.0 (unknown), Ambergris 0.3.0 (unknown)."
- About, "This build": "Gam 0.1.0, built 2026-09-28. Every colour on the site was read from these files at that moment:" then four items of the form "Pequod 0.2.0-alpha: pequod.json at commit unknown". Link targets:
  - `https://github.com/tiagojct/pequod/blob/unknown/pequod.json`
  - `https://github.com/tiagojct/glauca/blob/unknown/src/glauca.json`
  - `https://github.com/tiagojct/try-works/blob/unknown/src/try-works.json`
  - `https://github.com/tiagojct/ambergris/blob/unknown/tokens.json`
- `curl -I https://github.com/tiagojct/pequod/blob/unknown/pequod.json` returns `HTTP/2 404`. The same path with `main`, with `619982d` or with the full SHA returns 200. All four repositories are public (200 without credentials). The Glauca link (`blob/unknown/src/glauca.json`) also returns 404; the try-works and ambergris links were not requested individually (same URL pattern).
- The family pages say "read at commit unknown" (`src/pages/10-family.js:93`); the Carpenter bundle on the live site (`/assets/carpenter-CF0s7EgL.js`) contains `"commit":"unknown"` four times, so every generated file header and zip `README.txt` says "commit unknown" (`src/generators/common.js:88`, `src/generators/index.js:56`).
- The stamps are the family commits. Gam's own commit is not stamped anywhere in the site. The published image carries it in the label `org.opencontainers.image.revision` (f16228db99ff630fed8083a2d6ad9498bc008b0e).

### 3.2 Code path

| Step | Evidence |
|---|---|
| 1. CI clones each family into `vendor/<family>` with a `.git` directory | `scripts/vendor.sh:24-38`; the `publish` job runs it at `.github/workflows/build-deploy.yml:66-69` |
| 2. Docker context is `.`; `.dockerignore` excludes only the root `.git` (Docker matches patterns from the context root) | `.dockerignore:1`; `.github/workflows/build-deploy.yml:91-92`. Checked with the `@balena/dockerignore` matcher: `.git/HEAD` ignored, `vendor/pequod/.git/HEAD` and `vendor/pequod/README.md` not ignored. So the family `.git` directories do reach the build stage |
| 3. Build stage is `node:20-alpine`, then `COPY . .` and `RUN npm run build` | `deploy/Dockerfile:5-10` |
| 4. `npm run build` runs `prebuild`, which runs `npm run model` | `package.json:9,11` |
| 5. `loadAll()` reads each family; `fam.source = { file, commit: commitOf(dir) }` | `scripts/build-model.mjs:22`, `src/model/load.js:41-55` (line 47) |
| 6. `commitOf`: use `vendor/<family>/COMMIT` if it exists; else run `git rev-parse --short HEAD` in that directory; on any error return the string `unknown`, silently | `src/model/load.js:31-39` (line 37) |
| 7. The `node:20-alpine` image has no git binary. Its public build history (amd64, created 2026-04-15, Node 20.20.2, Alpine 3.23.4) has `apk add` only for libstdc++, curl, build tools and gnupg/tar (the last three removed by `apk del`); the word git does not occur | Docker Hub anonymous config read |
| 8. So `sh -c "git rev-parse ..."` exits 127, `commitOf` returns `unknown`, and the build still exits 0 | reproduced below |

- Reproduction: `S/work/docker-ctx` is the tracked files minus the `.dockerignore` entries, plus `vendor/` with its `.git` directories. Building it with a PATH that has node, npm and sh but no git gives `"commit":"unknown"` for all four families and exit 0. All nine HTML pages are then byte-identical to the live pages after replacing the date and the chunk file names; the site chunk is identical after the date replacement; the Carpenter chunk differs only in the imported site chunk file name. A normal build in `S/work/gam-site` (git available) stamps 619982d, 1efbcce, 400dd91 and c92c190 and every link is valid. The Docker build itself was not run (not installed).
- Why CI stays green: `test/model.test.js:53` requires a hex commit, but it runs only in the `build-check` job (with git). The image is built in the separate `publish` job, which runs no test.
- Second hazard in `commitOf`: in a directory without its own `.git` inside another checkout, `git rev-parse --short HEAD` returns the outer repository's SHA. Tested: a copy of `pequod.json` in a folder inside the gam checkout returned `f16228d` (gam's own commit). A misplaced or stripped vendor directory would be stamped with the wrong repository's SHA, plausibly.
- A pin mechanism already exists: `COMMIT` files. `scripts/update-fixtures.sh:20-21` writes one per fixture and `test/generators.test.js:19` loads the fixtures, so snapshots carry fixed stamps. No script writes `COMMIT` into `vendor/`.
- Naive guard warning: a build with git contains exactly one legitimate `unknown` in dist (the Carpenter chunk error text "unknown CVD type", `src/colour/cvd.js:61`). A grep for the bare word would fail a good build.
- Build date: `builtAt` is the UTC date from `new Date()` (`scripts/build-model.mjs:53`). Two same-day builds from the same inputs are byte-identical (compared with `diff -r`, overall SHA-256 of the file hashes 0c8231c5...). The date changes the site chunk file name, and therefore the Carpenter chunk's import, every day.

## 4. Build pipeline

### 4.1 npm scripts (`package.json:7-19`)

| Script | Command |
|---|---|
| `vendor` | `sh scripts/vendor.sh` |
| `model` | `node scripts/build-model.mjs` |
| `render` | `node scripts/render-pages.mjs` |
| `og` | `node scripts/build-og.mjs` |
| `prebuild` | `npm run model && npm run render && npm run og` |
| `build` | `vite build` |
| `predev` / `dev` | `npm run model && npm run render` / `vite` (127.0.0.1:5173) |
| `preview` | `vite preview` (127.0.0.1:4174) |
| `pretest` / `test` | `npm run model && npm run render` / `vitest run` |

There is no script for fonts, fixtures, lint, type checks or clean. `engines` is not set and there is no `.nvmrc`.

### 4.2 Order of `npm run build`

1. `scripts/build-model.mjs` (69 lines): `loadAll()` from `vendor/`; empties and refills `public/official/` with the 41 official files (copied by basename, `:41-43`; no collisions today); renders README install sections with markdown-it (`html: false`) and rewrites relative `href` to `<repo>/blob/main/...` (`:14-20`); writes `src/generated/model.json` (221,926 bytes) and `meta.json` (418 bytes); `site.name` is the literal `'Gam'` and the version comes from `package.json` (`:53`).
2. `scripts/render-pages.mjs` (32 lines): writes `theme.css` and `public/favicon.svg`, empties `site/`, writes the nine pages.
3. `scripts/build-og.mjs`: three PNGs.
4. `vite build`: 31 modules, outputs in `dist/`.

`scripts/vendor.sh` (44 lines): for pequod, glauca, try-works, ambergris it runs `git clone --depth 1` of the default branch from `https://github.com/tiagojct/<family>` into `vendor/<family>`; with `GAM_VENDOR_TOKEN` set the URL is `https://x-access-token:<token>@github.com/tiagojct/<family>` (lines 16-22), and git stores that URL in `vendor/<family>/.git/config`. If the directory exists it resets the remote URL, fetches depth 1 and checks out `FETCH_HEAD`. Pins are `name=ref` arguments. The usage comment `pequod=619982d` (line 6) does not work: `sh scripts/vendor.sh pequod=619982d` fails with `fatal: couldn't find remote ref 619982d` and exit 128. The full 40-character SHA and `main` work. Nothing in the repository records which family SHAs a build used.

`scripts/update-fixtures.sh` (24 lines): copies the adapter input files from `vendor/` to `test/fixtures/` and writes `COMMIT` (short SHA). Run here on Node 24: exit 0, no diff, so the fixtures equal current upstream (fixture COMMIT values equal the vendored heads).

### 4.3 Results in the temporary copy

| Step | Result | Time |
|---|---|---|
| `npm ci` | 63 packages, 0 vulnerabilities reported | 1.6 s |
| `sh scripts/vendor.sh` | four anonymous clones, 5 + 13 + 17 + 1.4 MB | 5.3 s |
| `npm run build` | exit 0; vite step 455 ms | 2.7 s |
| `npm test` | 4 files, 231 tests, all pass | 2.4 s (vitest 1.27 s) |
| build with all network access denied (`sandbox-exec`, checked that curl then fails) | exit 0 | 2.3 s |
| second build the same day | byte-identical dist | n/a |

- Network needs: `npm ci` (npm registry) and `vendor.sh` (github.com). The build and the tests need neither once `node_modules/` and `vendor/` exist. `subset-fonts.mjs` is the only script that fetches, and it is manual.
- Installed versions: vite 8.3.0 (engines `^20.19.0 || >=22.12.0`), vitest 5.0.1, @resvg/resvg-js 2.6.2, subset-font 2.9.0, fflate 0.8.3 (the only runtime dependency, bundled), markdown-it 15.0.2, js-yaml 5.4.2, luaparse 0.3.1, plist 5.0.0, smol-toml 1.8.0. The lockfile includes the musl and arm64 binaries of resvg and rolldown that the Alpine multi-arch image needs.
- `dist` summary: 65 files, 1,291,257 bytes.

| Group | Files | Bytes |
|---|---|---|
| HTML pages | 9 | 339,674 |
| `assets/` (2 JS, 2 CSS) | 4 | 292,278 |
| `fonts/` (4 woff2, 2 OFL) | 6 | 161,642 |
| `official/` | 41 | 444,753 |
| icons and OG image | 4 | 52,244 |
| `theme.js` | 1 | 666 |

- Internal links: 248 checked in dist. The only broken ones are two images on `/glauca/` (`img/light.svg`, `img/dark.svg`, lines 474-475), copied from Glauca's `dist/obsidian/README.md`; `absolutise()` rewrites `href` only (`scripts/build-model.mjs:16`). Live: `/glauca/img/light.svg` and `/glauca/img/dark.svg` return 404. External: all 96 distinct github.com links in a real-commit build return 200; the live About page has four 404 links (section 3). Of nine other external links, `https://tiagojct.eu/projects/pequod/` (from `pequod.json:7`, shown as "Project page") ends in 404 after a 301, and `www.npmjs.com/package/pequod-tailwind` answered 403 to a script (bot block, not checked in a browser).

## 5. CI

`.github/workflows/build-deploy.yml` (98 lines) is the only workflow. No dependabot file.

| Trigger | Line | Note |
|---|---|---|
| `push` to `main` | 18-19 | |
| `push` of tags `v*` | 20 | no tag exists; semver tags never produced |
| `repository_dispatch` type `family-updated` | 21-22 | no sender installed (below) |
| `schedule` `17 4 * * 1` (Mondays 04:17 UTC) | 23-24 | fires; run 10 started 2026-09-28 10:52 UTC, about 6.5 h late |
| `workflow_dispatch` | 25 | |

- `concurrency: build-deploy`, `cancel-in-progress: false` (27-29). `env.IMAGE = ghcr.io/${{ github.repository }}` (31-32).
- Job `build-check` (ubuntu-latest, lines 35-56): checkout@v4; setup-node@v4 with Node 20 and npm cache; `npm ci`; `sh scripts/vendor.sh` with `GAM_VENDOR_TOKEN`; `npm test`; `npm run build`; a step summary listing the four vendored short SHAs and the dispatch payload (`client_payload.repository`, `sha`). Nothing is uploaded from this job.
- Job `publish` (needs `build-check`; permissions contents read, packages write; lines 58-98): checkout; `vendor.sh` again with the same secret (a second, independent fetch); setup-qemu@v3; setup-buildx@v3; login to ghcr.io with `github.actor` and `GITHUB_TOKEN`; metadata-action@v5 with tags `semver {{version}}`, `semver {{major}}.{{minor}}`, `raw latest`, `sha short`; build-push-action@v6 with context `.`, file `deploy/Dockerfile`, platforms `linux/amd64,linux/arm64`, `push: true`, GitHub Actions cache with `mode=max`.
- There is no `if:` on `publish`, and `latest` is unconditional. A `workflow_dispatch` on any branch would push `latest` from that branch (from the workflow text; not tried).
- Secrets, by name: `GITHUB_TOKEN` (line 77), `GAM_VENDOR_TOKEN` (lines 47, 69), `GAM_DISPATCH_TOKEN` (only in `deploy/family-dispatch.yml:15`, for the family repositories). All four families are public now, so `GAM_VENDOR_TOKEN` is not needed for reading; whether the secret is set: unverified. With a token set, the clone URL (token included) sits in `vendor/*/.git/config`, which `.dockerignore` does not exclude, so it reaches the build stage and its cached layers (`mode=max`). Not tested with a real token.
- Actions are pinned by major tag, not by SHA. The run annotations (2026-09-28) say: Node.js 20 actions are being forced onto Node 24 (checkout, setup-node, docker/* actions), and "The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026." Node 20 reached end of life on 2026-04-30 (nodejs/Release schedule); `node:20-alpine` was last built 2026-04-15.
- Deploy path: no SSH, webhook or cloudflared step. Pushing `ghcr.io/tiagojct/gam:latest` is the deployment; a watchtower already on the VPS pulls it (`README.md:80-84`, `deploy/docker-compose.yml:4-6,21`, stated "within five minutes"; the VPS side is unverified).
- Image (`ghcr.io/tiagojct/gam`, public: anonymous pull works): tags `latest`, `sha-d7b6399`, `sha-f16228d`; index with linux/amd64, linux/arm64 and two BuildKit attestation manifests; amd64 config created 2026-09-28T10:53:11Z; nginx 1.31.6; labels include `org.opencontainers.image.revision` f16228db..., `source` and `url` github.com/tiagojct/gam, `title` gam, `version` latest, `licenses` NOASSERTION. The sha tag is overwritten by every rebuild of the same commit, so the 2026-09-21 build of f16228d is no longer addressable by tag.
- Run history (public API): 10 runs. Runs 1 to 7 on launch day: failures and one cancellation (setup problems, per the commit messages). Run 8 (push, d7b6399) and run 9 (push, f16228d) succeeded. Run 10 (schedule, f16228d, 2026-09-28) succeeded: `build-check` 20 s (npm ci 1 s, vendor 3 s, tests 2 s, build 2 s), `publish` 74 s (image build and push 49 s). Zero `repository_dispatch` runs. The live `Last-Modified` (2026-09-28 10:53:11 GMT) matches run 10.
- `deploy/family-dispatch.yml` (17 lines): a GitHub Actions job `notify-gam` (`needs: [test]`, only on `refs/heads/main`) that POSTs `{"event_type":"family-updated","client_payload":{repository, sha}}` to `https://api.github.com/repos/tiagojct/gam/dispatches` with `secrets.GAM_DISPATCH_TOKEN`. It was meant to be pasted into the main workflow of pequod, glauca, try-works and ambergris. At the pinned commits none of the four has `.github/workflows` or any mention of it (grep for `notify-gam`, `GAM_DISPATCH`, `family-updated`).

## 6. Deployment files

### 6.1 Files

- `deploy/Dockerfile` (17 lines): `FROM node:20-alpine AS build` (workdir `/src`, `npm ci`, `COPY . .`, `npm run build`); `FROM nginx:alpine`; copies `/src/dist` to `/usr/share/nginx/html` and `deploy/nginx.conf` to `/etc/nginx/conf.d/default.conf`; `EXPOSE 80`; `HEALTHCHECK` with `wget -qO- http://127.0.0.1:80/` every 30 s. Both tags are unpinned. No `USER`. The comment says the build context must contain `vendor/` and that the image never fetches.
- `deploy/docker-compose.yml` (25 lines): service `gam`, image `ghcr.io/tiagojct/gam:latest`, `container_name: gam`, `restart: unless-stopped`, network `proxy` (external), same healthcheck, label `com.centurylinklabs.watchtower.enable: "true"`, no published ports, no volumes. Intended path `/opt/vps/apps/gam/` (`README.md:137-139`).
- `deploy/Caddyfile.snippet` (13 lines): snippet `(route_gam) { reverse_proxy gam:80 }`; site blocks `http://gam.tiagojacinto.eu` and `https://gam.tiagojacinto.eu` with `tls /data/certs/selfsigned.crt /data/certs/selfsigned.key`. Append with `cat >>` to `/opt/vps/caddy/Caddyfile` (inode stays) and reload with `docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`.
- `deploy/cloudflared-ingress.yml` (5 lines): `hostname: gam.tiagojacinto.eu`, `service: https://localhost:8443`, to be added above the final `http_status:404` rule of `/etc/cloudflared/config.yml` (write the file back whole).

### 6.2 `deploy/nginx.conf` (56 lines)

- Server: `listen 80; server_name _;` root `/usr/share/nginx/html`; `absolute_redirect off` (line 9). No redirects or rewrites except the implicit directory-slash 301 (`try_files $uri $uri/ =404`, line 52), `error_page 404 /404/index.html` (55), and `location = /favicon.ico { return 404; }` (42).
- Content-Security-Policy (line 13, repeated verbatim at line 47): `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`. Under `/assets/` (line 29): `default-src 'none'`.
- Other headers at server level (lines 14-18): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`.
- nginx does not inherit `add_header` into a location that has its own. Observed live:

| Response | Headers present |
|---|---|
| HTML (`location /`, lines 45-53) | CSP, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options, `Cache-Control: no-cache`; no COOP |
| `/assets/*` | `default-src 'none'`, nosniff, cache headers only |
| `/fonts/*`, `/official/*`, `/theme.js` | cache headers only (no nosniff, no CSP) |
| `/og.png`, `/favicon.svg`, `/favicon.png`, `/apple-touch-icon.png` (no `add_header`, so they inherit) | the full server-level set including COOP |

  So COOP is sent only on four image files and never on documents. The server-level CSP string must be edited in two places.
- Cache rules: `/assets/` `expires 1y` plus `Cache-Control: public, immutable` (26-31); `/fonts/` 30 d; `/official/` 1 h with `default_type text/plain`; `= /theme.js` `no-cache`; `= /og.png` 1 d; favicon.svg, favicon.png, apple-touch-icon 7 d; HTML `no-cache`. `expires` plus `add_header Cache-Control` sends two Cache-Control headers; live `/official/pequod/Pequod.ghostty` shows both lines (`max-age=3600` and `public`); the last commit fixed this for HTML only. Cloudflare rewrites the browser-facing value on cacheable objects: live `/theme.js` shows `max-age=14400` although nginx sends `no-cache`.
- gzip: `gzip on; gzip_vary on; gzip_min_length 1024;` types text/plain, text/css, application/javascript, application/json, image/svg+xml, application/xml, text/x-lua, text/x-r, text/x-python, text/yaml, application/toml (lines 20-23). MIME types are nginx defaults; live `.js` is `application/javascript`, `.woff2` `font/woff2`; unmapped extensions in `/official/` (`.ghostty`, `.py`, `.R`, `.scss`, `.itermcolors`) are `text/plain`. Cloudflare serves Brotli to clients that ask.
- Live extras seen at the edge: no `Strict-Transport-Security`; `http://gam.tiagojacinto.eu/about/` answers 200 with no redirect to https; `report-to` and `nel` headers from Cloudflare (Network Error Logging, `success_fraction` 0.0, endpoint on `a.nel.cloudflare.com`; the browser, not the page, would send failure reports); `Permissions-Policy` contains `interest-cohort`, which Chromium reports as an unrecognised feature in the console on every page.

### 6.3 Chain from browser to container

1. Browser to the Cloudflare edge (`server: cloudflare`, HTTP/2 and h3). Zone `tiagojacinto.eu` (Cloudflare name servers); `gam.tiagojacinto.eu` resolves to Cloudflare addresses (proxied). The DNS record is a CNAME to the tunnel (`README.md:117-120`; it is created by hand in another Cloudflare account than the tunnel's API token).
2. Cloudflare Tunnel: cloudflared on the VPS (`deploy/cloudflared-ingress.yml:4-5`).
3. Caddy on the VPS, TLS listener on 8443 with a self-signed certificate (`deploy/Caddyfile.snippet:10-13`, `README.md:128-130`); `via: 1.1 Caddy` in responses. Whether cloudflared skips certificate verification (`noTLSVerify`) is set in `/etc/cloudflared/config.yml`, which is not in the repository: unverified.
4. `reverse_proxy gam:80` over the Docker network `proxy`.
5. nginx in container `gam` serving `dist/`.

### 6.4 Per-host parts and the redirect

| Part | Holds the host name today | Needed for ensigns.tiagojacinto.eu | Needed for the gam redirect |
|---|---|---|---|
| Cloudflare DNS | CNAME `gam` (proxied) | new CNAME `ensigns`; the name does not resolve today | keep `gam` proxied |
| Tunnel ingress (`/etc/cloudflared/config.yml`) | `gam.tiagojacinto.eu` to `https://localhost:8443` | new entry | keep the entry |
| Caddyfile | `(route_gam)`, `http://gam...`, `https://gam...`, upstream `gam:80` | new snippet and two blocks (same certificate files), upstream `ensigns:80` | the only current place per host; `redir` sends 302 unless `permanent` or 301 is given (Caddy docs); the `http://` block must redirect too |
| Compose (`/opt/vps/apps/gam/`) | service and container `gam`, image `ghcr.io/tiagojct/gam:latest`, network `proxy` | new service and image name; package must be made public by hand (`README.md:137`) | remove the `gam` container after cutover |
| `deploy/nginx.conf` | none (`server_name _`) | none | none, unless the redirect goes in nginx, which then needs explicit `server_name` blocks |
| Site constants | see 7.4 | change | n/a |

- No redirect exists anywhere in the repository. Cloudflare caches `/assets/*`, `/fonts/*`, `/og.png` and favicons at the edge (`cf-cache-status: HIT`, up to a year for `/assets/`). An origin-side redirect does not replace objects already cached; a purge or an edge redirect rule is needed for "every path".
- Legacy inputs to preserve or map: `/carpenter/?family=glauca` (the Carpenter ignores unknown ids and silently falls back to Pequod, `src/workshop/carpenter.js:44-48`); `/official/glauca/...`, `/official/try-works/...`, `/official/ambergris/...`; anchors `#scale #accents #samples #contrast #cvd #install #links` (family), `#names #loomings #licences #cite #build #privacy #changelog` (About), `#samples #scales #accents` (Compare), `#contrast` (Carpenter); absolute `og:image` and canonical URLs.

### 6.5 What the CSP allows (probed)

Probe pages served with the nginx headers (`S/work/probe-root`, run in Chromium 154 through `S/work/cdp-run.mjs`). Other browsers: unverified.

| Need | Result |
|---|---|
| Per-family swatches through generated classes and custom properties in a linked stylesheet | works (current design) |
| Inline `style=""`, `<style>` blocks (HTML or injected), `setAttribute('style', ...)` | blocked |
| `element.style.setProperty()`, `element.style.x = ...`, `style.cssText`, constructable stylesheets | work (`src/workshop/carpenter.js:24,290-291` use the first) |
| SVG filters: inline `<svg><filter><feColorMatrix values="...">` referenced by `filter: url(#id)` from an external stylesheet | works; the filtered swatch renders in a different colour (screenshot) |
| SVG presentation attributes (`fill=""`) | work |
| Inline scripts and event-handler attributes | blocked |
| `eval`, `new Function`, `WebAssembly.compile` | blocked (needs `'unsafe-eval'` or `'wasm-unsafe-eval'`) |
| Worker from a same-origin file served under `/` | works, including same-origin fetch, `importScripts` and dynamic import |
| Worker file served under `/assets/` (where Vite puts it) | starts and static ES imports load, but inside it fetch, `importScripts`, dynamic `import()` and nested workers are blocked because that response carries `default-src 'none'` |
| Worker from a `blob:` or `data:` URL | blocked |
| Download by clicking `<a download href="blob:...">` | works with no violation (`src/workshop/carpenter.js:136-144`; zip, single-file download and previews exercised in the built Carpenter) |
| `fetch()` of a `blob:` URL, `<img src="blob:...">` | blocked |
| `<img src="data:...">` | works |
| `data:` fonts | blocked by `font-src 'self'`; Vite inlines small assets as `data:` by default (documented default, not exercised); no `data:` in the current CSS |
| iframes, including same-origin | blocked; `frame-ancestors 'none'` and `X-Frame-Options: DENY` also stop this site being embedded |
| `<base>`, `<object>`, `<embed>`, audio, video | blocked |

Vite's dev server and `vite preview` send no CSP headers, so violations show only on the deployed image. `test/site.test.js:66-72` checks statically for inline styles, inline scripts and `on*=` attributes in `site/`. The Carpenter (JS on) loaded 28 outputs, fetched 10 official files from `/official/`, and produced blobs with no console violation.

## 7. Documents

### 7.1 README, CHANGELOG, CITATION, licences

- `README.md` (156 lines): description (3-14); how it is built (16-44); commands (46-52); tests (57-76); deployment, file table, triggers, secrets (78-113); manual steps 1 to 7 for DNS, tunnel, Caddy, certificate, secrets, first deploy, check (115-142); local image build `npm run vendor && docker build -f deploy/Dockerfile -t gam .` (144); licence (146-152); citation (154-156). Line 65 says "the build fails otherwise" for the chrome contrast test, but the test runs in `npm test`, not in `npm run build` or the Docker build.
- `CHANGELOG.md` (27 lines): Keep a Changelog, semver, one entry `[0.1.0] - 2026-09-21`. Rendered on the About page.
- `CITATION.cff` (16 lines): title "Gam: where the four Moby-Dick colour families meet"; version 0.1.0; date-released 2026-09-21; author Jacinto, Tiago (no ORCID, no affiliation); no DOI, no identifiers; `repository-code` https://github.com/tiagojct/gam; `url` https://gam.tiagojacinto.eu; `license: "MIT AND CC-BY-4.0"`; four keywords. Validated against the official CFF 1.2.0 JSON schema: invalid, because `license` must be one SPDX identifier or an array. With `[MIT, CC-BY-4.0]` it validates.
- `LICENSE-MIT`: Copyright (c) 2026 Tiago Jacinto; covers adapters, generators, pages, build scripts, tests and deployment files. `LICENSE-CC-BY-4.0`: site prose and `README.md`, `CHANGELOG.md`, `docs/`; a summary with a link to the legal code, not the full legal text; suggested attribution "Gam by Tiago Jacinto, https://gam.tiagojacinto.eu" (line 49). Font licences: `public/fonts/OFL-*.txt`. `package.json:21` says only `"license": "MIT"`.
- `docs/quarto-page.qmd` (78 lines): the source text of the project page at https://tiagojacinto.eu/projects/gam/ on the personal Quarto site (title "Gam – Tiago Jacinto"; the live text matches, checked). Nothing in the build, CI or README reads it. It repeats claims to update: "Static files only: no analytics, no cookies, nothing sent anywhere." (17), the contrast claim (25), "Current: 0.1.0 (21 September 2026)" (56), "deployment on the VPS with rebuilds triggered from the family repositories" (58), "Served as static files by nginx behind Caddy and a Cloudflare Tunnel" (62). The page lives in another repository.
- `.dockerignore` (11 lines): `.git`, `.github`, `.claude`, `node_modules`, `dist`, `site`, `test`, `tools/fonts/src`, `*.md` except `CHANGELOG.md`, `.DS_Store`. All patterns are root-relative, so `vendor/*/.git` and `vendor/*/README.md` stay (the build needs the READMEs).
- `.gitignore` (13 lines): `node_modules/`, `/dist/`, `/site/`, `/vendor/`, `src/generated/`, `public/official/`, `public/og.png`, `public/favicon.svg`, `public/favicon.png`, `public/apple-touch-icon.png`, `.DS_Store`, `*.log`, `.claude/`. `tools/fonts/.gitignore`: `src/`.

### 7.2 Hard-coded names that need changing

| Name | Where |
|---|---|
| host `gam.tiagojacinto.eu` | `src/site/layout.js:6` (canonical, og:url, og:image); `src/generators/common.js:7` (header of every generated file, line 88); `src/generators/index.js:56`; `src/pages/40-about.js:16`; `src/site/og.js:29`; `README.md:4,140`; `CITATION.cff:11`; `LICENSE-CC-BY-4.0:49`; `docs/quarto-page.qmd:17,75`; `deploy/Caddyfile.snippet:3,7,10`; `deploy/cloudflared-ingress.yml:4`; `deploy/family-dispatch.yml:2`; 151 of the 189 files in `test/__snapshots__` (generated headers; snapshots must be regenerated) |
| repository `tiagojct/gam` | `src/site/layout.js:76`; `src/pages/40-about.js:48,55`; `CITATION.cff:10`; `README.md:82,109,135`; `.github/workflows/build-deploy.yml:4`; `deploy/docker-compose.yml:3,9`; `deploy/family-dispatch.yml:5,16`; `docs/quarto-page.qmd:64,65` |
| image `ghcr.io/tiagojct/gam` | `deploy/docker-compose.yml:9`; `README.md:82`; workflow line 32 is derived from `github.repository` |
| site name "Gam" and `gam` | `package.json:2,4`; `scripts/build-model.mjs:53`; `src/site/layout.js:27,38,61`; `src/pages/00-home.js`, `40-about.js`, `90-not-found.js:10`; `src/site/og.js:27`; `src/workshop/carpenter.js:201,205,225` (zip name `<id>-<mode>-gam.zip`); `src/generators/editors.js:142` (`<name>-gam.json`); `src/generators/common.js:88`; localStorage key `gam-theme` (`public/theme.js:6`, `src/site.js:7`); event `gam:theme` (`src/site.js:38`); `GAM_VENDOR_TOKEN` (`scripts/vendor.sh:10-11,17-18`, workflow 11-14,47,69); `GAM_DISPATCH_TOKEN`; compose service and container `gam`; Caddy `route_gam` and `gam:80` |
| family ids and repositories | `src/model/load.js:7-17`; `src/model/token.js:9`; `src/site/layout.js:10-13` (hard-coded `NAV`); `scripts/vendor.sh:6,18,20,24`; `.github/workflows/build-deploy.yml:53`; `src/generators/common.js:83` (prefixes pq, gl, tw, am); `test/site.test.js:63`; `src/pages/10-family.js:106`; adapters: `src/model/adapters/pequod.js:142,144`, `glauca.js:32`, `system.js:149,151`, `ambergris.js:186`; `README.md:5-8,21`; `docs/quarto-page.qmd:33-38`; `blob/main` is assumed in many links (`src/pages/10-family.js:71,93,125,140,151`, `src/pages/40-about.js:40`, `scripts/build-model.mjs:18,34`, `src/workshop/carpenter.js:197`) |
| other domains | `https://tiagojacinto.eu/projects/gam/` (`docs/quarto-page.qmd:12`); `https://loomings.tiagojacinto.eu/app` (`src/pages/40-about.js:33`); `https://tiagojct.eu/projects/pequod/` (in `pequod.json`) |
| paths | `CHANGELOG.md` read from the repository root (`src/pages/40-about.js:9`); `package.json` version (`scripts/build-model.mjs:51`) |

## 8. No JavaScript and privacy

| Check | Result |
|---|---|
| Pages render without JS | Verified for `/`, `/pequod/`, `/compare/`, `/about/` in Chromium with script execution disabled (DOM counts, screenshots of `/` and `/carpenter/`). The picker and the Carpenter need JS (1.4) |
| Requests per page, JS on (six pages) | 6 to 8 requests, all to the same origin: HTML, `theme.js`, `assets/*`, `fonts/*`, favicon. No CSP violation and no failed request (only the `interest-cohort` warning) |
| Third-party hosts in built HTML | none. Nine pages parsed for `script`, `link`, `img`, `iframe`, `form`, `object`, `embed`, `video`, `audio` and `source` references: all are relative and same-origin; only `link rel=canonical` and the OG `content` values carry the site host |
| External hosts in built JS and CSS | none that are requested; the URLs in the Carpenter chunk are data strings (family links, header comments, the Apple DTD URL in the iTerm2 plist) |
| Live HTML and assets | same result on all nine live routes and four live assets; no `Set-Cookie` on any of them; no `cloudflareinsights` or other injected script |
| Cookies | `document.cookie` not used in dist or `public/theme.js`; `document.cookie` empty after load |
| Storage | `localStorage` only, key `gam-theme` (`public/theme.js`, `src/site.js:7-18`); empty until the visitor changes the picker |
| Other browser APIs | no `sendBeacon`, `XMLHttpRequest`, `WebSocket`, `EventSource`, service worker, `new Worker`. `fetch` appears twice: Vite's modulepreload polyfill and `fetchOfficial` for same-origin `/official/` files |
| Analytics | none in code; the CSP would block a third-party script. Cloudflare adds `report-to` and `nel` headers (section 6.2) |
| Inline code | none in dist HTML (no `style=`, no `<style>`, no inline script, no `on*=`) |

## 9. Points that affect the migration plan

1. Provenance: the cause is a missing git binary in `node:20-alpine` plus a silent fallback, not the `.dockerignore`. Even with git installed, the Docker context has no repository for gam itself (root `.git` excluded), so a real SHA has to come from outside the image build (build argument, a file written before `docker build`) or be replaced by hashes of the token files. The guard must throw where the stamp is made and must not grep for the bare word "unknown" (one legitimate hit).
2. `commitOf` can return the wrong repository's SHA; keep an explicit override such as the existing `COMMIT` files for tests and fixtures.
3. Tests and image use different inputs: two separate `vendor.sh` fetches, and the Docker build runs no tests. With families inside the monorepo the fetch goes away, but the image build should still run, or reuse the output of, the checks.
4. `publish` has no ref guard and moves `latest` on any run; sha tags are overwritten; base images are unpinned; Node 20 is past end of life; `ubuntu-latest` changes to Ubuntu 26 on 2026-10-19; actions are unpinned.
5. Redirect for `gam.tiagojacinto.eu`: nothing holds it today; Caddy `redir` defaults to 302; plain http is not redirected at the edge; Cloudflare-cached static objects at the old host will not redirect until purged; legacy `?family=` and `/official/<old-id>/` paths; the ensigns DNS record does not exist and is created by hand in another Cloudflare account; the new GHCR package must be made public by hand; the personal-site page `https://tiagojacinto.eu/projects/gam/` lives in another repository.
6. CSP: workers emitted by Vite land under `/assets/` and get `default-src 'none'`, so they cannot fetch or `import()`; blob and data workers, inline styles and scripts, iframes and wasm are blocked; SVG filters, CSSOM styling and blob downloads work. COOP is missing on documents and the CSP string is duplicated in the nginx file.
7. Removing `repository_dispatch` and the weekly rebuild touches `.github/workflows/build-deploy.yml:7-25,50-56`, `README.md:93-113,131-134`, `deploy/docker-compose.yml:3-6`, `deploy/family-dispatch.yml`, `src/pages/40-about.js:55` and `docs/quarto-page.qmd:58`. The dispatch trigger has never fired and no family repository carries the sender.
8. Copy that becomes false in a monorepo: "its own repository", "four", "contrast locked by tests" (not true for Pequod at the pinned commit), "the build fails otherwise" (tests are not part of `npm run build`), "rebuilds whenever a family repository changes".
9. Defects to fix or carry over: two broken images on the Glauca page; dead Pequod "Project page" link; two glyphs outside the font subset; `CITATION.cff` invalid; `vendor.sh` usage comment wrong for short SHAs; a `builtAt`-derived BibTeX year; the family pages link to `blob/main` while saying "read at commit".
10. Strengths to keep: no colour literals outside the model; offline, deterministic build (byte-identical on the same day, and identical between macOS and the Linux image for static assets); static CSP checks in tests; the Carpenter works under the strict CSP; no third-party requests and no cookies on the live site.

## 10. Not done or unverified

- Docker build: not run (Docker not installed). The context and the no-git build were simulated in `S/work/docker-ctx`; the live output matched. Reason: no Docker on this machine.
- nginx: not run. Headers were taken from live responses; `S/work/serve.mjs` only copies them.
- VPS side (Caddy file, cloudflared config including certificate verification, watchtower behaviour and delay, `/opt/vps` layout): unverified; no SSH by brief.
- GitHub secrets (`GAM_VENDOR_TOKEN` set or not, `GAM_DISPATCH_TOKEN` anywhere): unverified; not readable.
- Cloudflare zone settings (Always Use HTTPS off, no HSTS, NEL on, 4 h browser cache TTL): inferred from response headers only.
- `publish` on a non-main branch pushing `latest`: read from the workflow, not tried.
- Firefox and Safari behaviour (CSP probes, `:has()`, SVG filters): unverified; Chromium only.
- `scripts/subset-fonts.mjs`: not run (would download about 1 MB of fonts); source URLs checked by HEAD only. Font name tables not inspected.
- Node 20 execution: not run locally (only Node 24 installed); CI ran Node 20 successfully.
- The Pequod, Compare and About no-JS screenshots were not viewed; those pages were checked by DOM counts and the Compare toggle test.
- Family validators (`make validate`, Ambergris `build.mjs`) and Pequod tests: not run; the contrast claim check is by grep only.
- Token-in-clone-URL storage in `.git/config` and layer caching: from git behaviour and the workflow; not tried with a real token.
