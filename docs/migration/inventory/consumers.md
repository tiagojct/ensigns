Detailed phase 1 report, written on 2026-09-29 as the evidence behind INVENTORY.md. Paths that start with S/ point into a temporary scratch folder that does not persist; they record what was run. Every other path is relative to the repository root at the commit named in the report.

This file holds two reports on consumers outside the five repositories. Part 2 (websites, citations and DOIs, Loomings) comes first; part 1 (local disk, GitHub search, related repositories) follows it.

# Consumers part 2: websites, citations and DOIs, Loomings

Phase 1 inventory. Read-only: nothing was changed outside S/parts. Inspection date 2026-09-29. S is the scratchpad root named in the brief (/private/tmp/claude-501/-Users-tiagojct-Projects-ensigns/bd5f7846-4d92-4133-b850-d9dce03332ed/scratchpad).

## 0. State inspected

| Item | State | Evidence |
|---|---|---|
| S/clones/gam, pequod, glauca, try-works, ambergris | Each HEAD equals GitHub HEAD: gam f16228d, pequod 619982d, glauca 1efbcce, try-works 400dd91, ambergris c92c190 | git ls-remote https://github.com/tiagojct/REPO.git HEAD |
| /Users/tiagojct/Projects/loomings | HEAD 9d8c036 (v2.0.8), clean, equals origin/main. The live app is v2.0.8 and serves the bundle name of dist/ (index-DPqee1y8.js) | git status; git ls-remote; https://loomings.tiagojacinto.eu/app/ |
| /Users/tiagojct/Websites/tiagojacinto.eu | HEAD 9b257af, clean, equals origin/main. The GitHub repo is private (anonymous request returns 404) | git ls-remote; curl https://github.com/tiagojct/tiagojacinto.eu |
| /Users/tiagojct/Projects/glauca | Incidental. HEAD 1e66632 differs from GitHub main 1efbcce. Both have 15 commits with identical subjects and an identical HEAD tree (2d0206d00963). git status -sb reports ahead 15, behind 15. Cause unverified | git log; git rev-parse HEAD^{tree} |
| Raw material | S/parts/consumers-2-raw/ (52 MB): fetched pages, registry and Zenodo JSON, link-status table (link_status_sites.json). The folder loomings-copy (44 MB, holds a copy of node_modules for the test run) is disposable | |

## 1. Findings that affect the plan

1. The three tiagojct.eu URLs in the brief return 404. tiagojct.eu is now a Hugo blog with 9 pages and no project pages. Project pages live on tiagojacinto.eu and exist only for Gam, Loomings and pequod-quarto. No page exists for Pequod, Glauca, Try-Works or Ambergris on either host. The old Pequod page is recoverable from github.com/tiagojct/tiagojct-site (content/projects/pequod/index.md).
2. The dead Pequod URL is written into the metadata of every published Pequod channel (CRAN, PyPI, npm, VS Code Marketplace, Open VSX), into the GitHub About field of pequod, and into 22 files of the pequod clone. Changing it needs a new release per channel. https://tiagojct.eu/loomings is dead in the same way (GitHub About of loomings and homebrew-loomings; social/ files).
3. The Loomings palettes file is src/palettes.js, a JavaScript module, not JSON. It was copied by hand and has one commit. Glauca, Try-Works and Ambergris match their current token files exactly (68 of 68 values). Pequod does not: 20 of 23 values are not in pequod.json. Loomings' Pequod is its own palette.
4. Loomings has no separate chrome palette. Toolbar, menus and status bar read the same 14 CSS variables as the editor text, fed by the selected family. The default is Loomings' own Pequod. Ambergris is one selectable family and is not used for chrome.
5. "Ten families" needs checking. Loomings' CLAUDE.md speaks of ten PALETTE_KEYS (colour roles per mode). The file holds four families. Six more families need hand mapping into the ten-role vocabulary and must pass the WCAG floors in the test. Gam has one adapter per family (src/model/adapters/) that could feed a generator. Loomings has no generator or import hook today.
6. No DOI exists for the five projects except the CRAN package-level DOI. Zenodo holds no record for any of them and none under the ORCID. None of the five repositories has a GitHub Release (Zenodo's GitHub integration acts on releases). Only pequod has git tags (v0.1.0, v0.2.0). CITATION.cff exists only in gam, glauca and try-works, with a licence value that is not valid CFF 1.2.0, no ORCID and no DOI.
7. The live Gam site has four provenance links to blob/unknown (404), two broken images on /glauca/, and no family repository sends the family-updated dispatch that the About page implies. Only pushes to gam, manual runs and the weekly cron rebuild it.
8. Renaming Gam to Ensigns touches the image name (ghcr.io/tiagojct/gam), container, Caddy route, tunnel hostname, DNS and the dispatch URL. deploy/docker-compose.yml, which the README calls the service as it runs in /opt/vps/apps/gam/, pulls ghcr.io/tiagojct/gam:latest (the live VPS file was not read). The workflow pushes ghcr.io/${{ github.repository }}, which follows the repository name. After a repository rename the VPS would keep running the old image.
9. At least 22 other repositories under tiagojct mention the family names or the dead URLs (section 5). This part did not inspect them.

## 2. Part A: websites

### 2.1 Hosts

| Host | What it is | Evidence |
|---|---|---|
| tiagojct.eu | Hugo personal blog. Sitemap has 9 URLs: /, /posts/, /tags/, /tags/meta/, /categories/, /about/, /now/, /uses/, /the-watery-part/. now and uses say "Under construction". No mention of Pequod, Glauca, Try-Works, Ambergris, Gam or Loomings (about mentions Moby-Dick only). The post of 2 Aug 2026 says the professional pages moved to tiagojacinto.eu | https://tiagojct.eu/sitemap.xml; https://tiagojct.eu/the-watery-part/ |
| tiagojacinto.eu | Quarto professional site. 54 URLs in the sitemap, all lastmod 2026-09-29. Built and deployed by .github/workflows/publish.yml to the VPS | https://tiagojacinto.eu/sitemap.xml |
| gam.tiagojacinto.eu | Gam site (Vite build, nginx, Caddy, Cloudflare Tunnel) | gam clone, deploy/ |
| loomings.tiagojacinto.eu | Loomings landing page at / and the app at /app/. loomings.tiagojct.eu no longer resolves | curl |
| Previous personal site | github.com/tiagojct/tiagojct-site, "Quartz + Obsidian + Pequod theme", last commit 2026-05-24. Holds content/projects/pequod/, pequod-quarto/, pequod-wallpapers/, and copies of pequod.json and the theme files. It explains the dead URLs. Date the pages were removed is unverified (Wayback API answered HTTP 429) | gh api repos/tiagojct/tiagojct-site |
| git.tiagojct.eu | Former Forgejo host. Does not resolve. One historical mention in glauca docs/CHANGELOG.md:136 | curl |

### 2.2 The URLs named in the brief

| URL | Result | Evidence |
|---|---|---|
| https://tiagojct.eu/projects/pequod/ | 301 to /projects/pequod, then 404 (Hugo "Not found - tiagojct.eu") | curl -sSIL |
| https://tiagojct.eu/projects/ | 301 to /projects, then 404 | curl -sSIL |
| https://tiagojct.eu/loomings | 404 | curl |
| https://tiagojct.eu/projects/pequod-quarto/, /projects/gam/, /projects/loomings/, /writing, /work | 404 | curl |
| https://tiagojacinto.eu/projects/pequod/, /glauca/, /try-works/, /ambergris/, /loomings | 404 | curl |
| https://gam.tiagojacinto.eu/ | 200 | curl |

The 301 only strips the trailing slash. No redirect map exists on tiagojct.eu. The dead Pequod URL is the "Project page" link on https://gam.tiagojacinto.eu/pequod/ (it comes from pequod.json:7, "homepage").

### 2.3 Pages that mention the projects (tiagojacinto.eu)

Found by fetching all 54 sitemap URLs and the site search index (search.json, 340 entries), then confirmed in the local source.

| Page | Mentions | Local source |
|---|---|---|
| /projects/ | Cards for Gam, Loomings, pequod-quarto; texts name Pequod (3), Glauca, Try-Works, Ambergris once each, "four colour families" | projects/index.qmd (listing of `*/index.qmd`) |
| /projects/gam/ | All four families and Loomings | projects/gam/index.qmd |
| /projects/loomings/ | All four families | projects/loomings/index.qmd |
| /projects/pequod-quarto/ | Pequod, 45 visible mentions | projects/pequod-quarto/index.qmd |
| /writing/dataviz/ | Pequod, 76 visible mentions: the pequod R and Python packages, crew accents, log-cool ramp. No repository link, no DOI | writing/dataviz/index.qmd |
| /writing/moby-rag/ | One mention of the ship. Not a palette reference | writing/moby-rag/index.qmd |
| No other page | Talks, teaching, CV, press, research and publications pages contain none of the names | grep of local source and search.json |

### 2.4 What each page says

Versions, install commands, links, DOIs and licences.

| Page | Versions | Install | Repository links | DOI | Licence |
|---|---|---|---|---|---|
| https://tiagojacinto.eu/projects/gam/ | Gam 0.1.0 (21 Sep 2026). Page date 21 Sep 2026 | none (web tool) | github.com/tiagojct/pequod, glauca, try-works, ambergris, gam, gam/blob/main/CHANGELOG.md | none | Code MIT, text CC BY 4.0, tokens under each family's licence |
| https://tiagojacinto.eu/projects/loomings/ | Loomings 2.0.8 (21 Sep 2026), full history 1.0.0 to 2.0.8 | Use at loomings.tiagojacinto.eu/app | the four family repos, loomings, loomings/blob/main/CHANGELOG.md, loomings/releases | none | MIT |
| https://tiagojacinto.eu/projects/pequod-quarto/ | No version shown. Published 12 May 2026 | quarto add tiagojct/pequod-quarto; quarto use template tiagojct/pequod-quarto | github.com/tiagojct/pequod (twice), github.com/tiagojct/pequod-quarto | none | MIT (code), CC BY 4.0 (palette), SIL OFL 1.1 (fonts) |
| https://gam.tiagojacinto.eu/ and family pages | Pequod 0.2.0-alpha, Glauca 0.1.0, Try-Works 1.0.0, Ambergris 0.3.0. Footer: Gam 0.1.0, built 2026-09-28 (a Monday, which fits the weekly cron at build-deploy.yml:24; inference) | Per family, see 2.4a | 96 unique github.com/tiagojct URLs (2.6) | none | About page table (2.4b) |

Citation blocks on the three Quarto pages are generated by `citation: type: software` (projects/_metadata.yml:10-11). All three produce the same BibTeX key, jacinto2026, with the page URL and a date and no version. Gam's own About page gives a different entry (key jacinto_gam_2026, version 0.1.0, url gam.tiagojacinto.eu), and gam/CITATION.cff a third. The gam repository keeps the source of the site page in docs/quarto-page.qmd, which has a "Citation" section (lines 67-78) that the live page lacks.

2.4a Install text on the Gam family pages (quoted from each family README)

| Family | Channels and commands |
|---|---|
| Pequod | VS Code Marketplace and Open VSX (tiagojct.pequod-color-theme); vsix from source; Zed and iTerm2 file copy; six terminal presets; npm install pequod-tailwind; pip install pequod and pip install "pequod[plot]"; install.packages("pequod"); remotes::install_github("tiagojct/pequod", subdir = "r") |
| Glauca | File copies only. Names embedded in the text: ~/.vscode/extensions/glauca-color-theme/, Glauca.ghostty, glauca.conf, require("glauca-tailwind") labelled "vendored: dist/tailwind (not on npm)" |
| Try-Works | File copies only. require("try-works-tailwind") labelled not on npm. R and Python source files labelled not on CRAN, not on PyPI |
| Ambergris | CSS, Ghostty and Zed ports (dark only). No README in the repository |

2.4b Licences on https://gam.tiagojacinto.eu/about/

Pequod, Glauca and Try-Works: tokens CC-BY-4.0, code MIT, stated by LICENSE-CC-BY-4.0 and LICENSE-MIT in each repository. Ambergris: "No licence file; the default above is assumed" (GitHub reports license null). GitHub reports NOASSERTION for pequod, glauca, try-works and gam (dual files are not detected) and MIT for loomings.

### 2.5 Gam routes

| Route | HTTP | Content |
|---|---|---|
| / | 200 | Four family cards with versions, links to repository, family page and Carpenter |
| /pequod/, /glauca/, /try-works/, /ambergris/ | 200 | Family pages: #scale #accents #samples #contrast #cvd #install #links |
| /compare/ | 200 | Same text, code and chart in all four. No GitHub link except the footer |
| /carpenter/ | 200 | Needs JavaScript (/assets/carpenter-CF0s7EgL.js, 225 KB). Deep links /carpenter/?family=ID and /carpenter/#contrast |
| /about/ | 200 | Anchors #licences and #loomings; provenance links; changelog |
| /official/FAMILY/FILE | 200 | 41 verbatim family files referenced by the Carpenter, for example /official/pequod/Pequod-color-theme.json. Served by nginx location /official/ (deploy/nginx.conf:36). Not linked as HTML anchors |
| `/assets/*`, `/fonts/OFL-*.txt`, /og.png, /favicon.svg, /favicon.png, /apple-touch-icon.png, /theme.js | 200 | Static files |
| /sitemap.xml, /robots.txt, /manifest.webmanifest | 404 | None published |
| /compare, /carpenter, /about, /pequod (no slash) | 200 after redirect | Slash added |
| Any other path | 404 | Page names the four families |

The family ids pequod, glauca, try-works and ambergris appear in routes, in ?family=, in /official/ID/, in the localStorage key gam-theme (value family, theme.js) and in the data-family attribute. Renaming a family changes all of them. The site CSS has blocks for [data-family=pequod], glauca, try-works and ambergris. An old id kept in localStorage passes the pattern check in theme.js (/^[a-z-]+$/), matches no block and so gets the default styles, which are Pequod (inference, not tested in a browser).

### 2.6 Gam outgoing links

Across the 8 pages there are 167 anchors to github.com, 96 unique URLs to tiagojct repositories and 2 to third-party font repositories.

| Repository | Root URL | Root with fragment | Deep blob or tree URLs | Total unique |
|---|---|---|---|---|
| pequod | 1 | 1 (#colour-vision-deficiency) | 24 | 26 |
| glauca | 1 | 0 | 30 | 31 |
| try-works | 1 | 1 (#accessibility) | 28 | 30 |
| ambergris | 1 | 0 | 6 | 7 |
| gam | 1 | 0 | 1 (CITATION.cff) | 2 |

Deep links by first path segment (85 use ref main, 4 use ref unknown): pequod: themes 12, r 2, pequod.json 2, CHANGELOG.md, README.md, LICENSE-CC-BY-4.0, LICENSE-MIT, python, scripts, tailwind, vscode. glauca: dist 22, src 3, docs 2, README.md, LICENSE-CC-BY-4.0, LICENSE-MIT. try-works: dist 21, src 3, docs 1, README.md, LICENSE-CC-BY-4.0, LICENSE-MIT. ambergris: ports 3, tokens.json 2, ambergris.css. gam: CITATION.cff. The complete list with the page each link sits on is in S/parts/consumers-2-raw/gam_github_links.txt (117 page and URL pairs, 98 unique URLs including the 2 font repositories).

Non-GitHub links: marketplace.visualstudio.com/items?itemName=tiagojct.pequod-color-theme, open-vsx.org/extension/tiagojct/pequod-color-theme, npmjs.com/package/pequod-tailwind, pypi.org/project/pequod/, CRAN.R-project.org/package=pequod, https://tiagojct.eu/projects/pequod/, https://loomings.tiagojacinto.eu/app.

Status check of 116 unique external URLs on the Gam site and the three Quarto project pages (S/parts/consumers-2-raw/link_status_sites.json): 110 return 200. The other six:

| URL | Result | Note |
|---|---|---|
| https://tiagojct.eu/projects/pequod/ | 404 | Pequod page link |
| https://github.com/tiagojct/pequod/blob/unknown/pequod.json | 404 | Gam About, "This build" |
| https://github.com/tiagojct/glauca/blob/unknown/src/glauca.json | 404 | same |
| https://github.com/tiagojct/try-works/blob/unknown/src/try-works.json | 404 | same |
| https://github.com/tiagojct/ambergris/blob/unknown/tokens.json | 404 | same |
| https://www.npmjs.com/package/pequod-tailwind | 403 to curl | registry.npmjs.org/pequod-tailwind returns 200; unverified in a browser |

Cause of "unknown": src/model/load.js:32-38 runs git rev-parse in the vendored clone and falls back to the string unknown. deploy/Dockerfile:5 builds in node:20-alpine. That image has no git (probable cause, not tested). The same commit string is stamped into generated Carpenter files ("Every generated file carries the family, version and commit").

Other live defects on the Gam site:

| Defect | Evidence |
|---|---|
| /glauca/ shows two images with relative URLs img/light.svg and img/dark.svg, copied from Glauca's Obsidian README. Both return 404 at gam.tiagojacinto.eu/glauca/img/. Both files exist at raw.githubusercontent.com/tiagojct/glauca/main/dist/obsidian/img/ (200) | curl |
| About says the site "rebuilds whenever a family repository changes". No family repository has a workflow: pequod, glauca, ambergris have no .github; try-works has only dependabot.yml. deploy/family-dispatch.yml (the job to add) is not installed anywhere | clones; gh api .../actions/workflows |
| About says Loomings and Gam "may differ by a release". For Pequod the difference is larger (section 4.5) | src/pages/40-about.js:33 |

### 2.7 Images that embed palettes

| Image | Where | Shows | After renames |
|---|---|---|---|
| https://gam.tiagojacinto.eu/og.png (1200x630) | og:image of Gam | Title "Gam", tagline, URL, four rows named Pequod 0.2.0-alpha, Glauca 0.1.0, Try-Works 1.0.0, Ambergris 0.3.0 with swatches | Generated at build (scripts/build-og.mjs). Regenerates on the next Gam build |
| /favicon.svg, /favicon.png, /apple-touch-icon.png | Gam | Four quadrants #BD8C68, #3D97FF, #C9651D, #2F9F99 on #0B1720 | Generated |
| tiagojacinto.eu/projects/gam/gam.png (local: projects/gam/gam.png) | Listing card on /projects/ and og:image of the Gam page | Screenshot of the Compare page: nav "Home Pequod Glauca Try-Works Ambergris Compare Carpenter About", three panels labelled PEQUOD BELOW DECK, GLAUCA PROFUNDUM, TRY-WORKS TRY-FIRE. Alt text names the same three | Static raster. Needs a new screenshot |
| projects/loomings/loomings.png | Listing card on /projects/ and og:image of the Loomings page | Loomings split view in dark Pequod (Loomings' own values), status bar "Theme: Dark" | Static. Depends on the default palette |
| projects/pequod-quarto/cover.png, dark.png | cover.png is inline on the pequod-quarto page; dark.png is its listing card and og:image | Slides in Pequod light and dark | Unaffected by names |
| /glauca/img/light.svg, dark.svg | Gam Glauca page | Broken (404) | Fix at source |
| Loomings repo docs/assets/screenshot.png (2800x1800), og.png, icon.png | Loomings landing page | Split view in dark Pequod; cloth-red card | Depends on the default palette |
| writing/dataviz/figures/ (22 files), writing/sw/figures/hourglass.svg, editorial-process.svg | tiagojacinto.eu | Charts drawn with the Pequod packages. The two SVGs hard-code Pequod hexes (#BD8C68, #DBC9B6, #0D2F42, #835A49, #A83732, #F7F3EE, #A16E50) although their comments say "Ambergris dark" (hourglass.svg:31, editorial-process.svg:56) | Pequod stays. Comments would be stale |

### 2.8 Local source of tiagojacinto.eu (/Users/tiagojct/Websites/tiagojacinto.eu)

| Path | Role | Family reference |
|---|---|---|
| projects/gam/index.qmd, gam.png | Gam page | Names all four (lines 6, 8, 11, 23, 31-36); links lines 31-34, 60-61 |
| projects/loomings/index.qmd, loomings.png | Loomings page | Heading "Four colours, two moods" line 32, table lines 38-41, sentence line 43; image-alt line 8; "four colour families" line 6; version list lines 49-60 |
| projects/pequod-quarto/index.qmd, cover.png, dark.png | Extension page | github.com/tiagojct/pequod lines 13, 20, 131; install lines 38-44; source line 123 |
| projects/index.qmd, projects/_metadata.yml | Listing, author, citation type | none |
| projects/quarto-study-flow/index.qmd:143 | Only software DOI citation on the site: https://doi.org/10.5281/zenodo.20125560 (version DOI) | precedent |
| writing/dataviz/index.qmd | Uses the pequod CRAN and PyPI packages (lines 17, 23, 45, 124 onward) | package names, not repo names |
| theme/glauca-light.scss, theme/glauca-dark.scss | The site theme: Bootstrap defaults plus token bridge. Header says values come from glauca/src/glauca.json (light lines 1-4, dark lines 1-2) | Glauca; 44 --gl- custom properties are defined in each mode file |
| theme/glauca-light.theme, theme/glauca-dark.theme | Pandoc highlight themes (JSON, values only, no family word inside) | Glauca values |
| theme/chrome.scss | Shared rules; 247 lines use --gl-* (255 occurrences); comments at lines 1, 858, 1261 name Glauca | Glauca prefix |
| _quarto.yml lines 106-107, 116-117 | Points format.html.theme and highlight-style at the four glauca-* files | Glauca file names |
| .github/workflows/publish.yml lines 80-93 | CI check that the two mode files mirror each other; names glauca-light.scss, glauca-dark.scss and the --gl- pattern | Glauca file names and prefix |
| README.md lines 3, 18, 25; CLAUDE.md line 7 | Say "themed with glauca design tokens" and "Theme: glauca tokens only" | Glauca text |
| assets/img/favicon.svg lines 2, 10-12 | Favicon; comment says Ambergris dark; fills #0C1117 and #EAEDEF are Ambergris values | Ambergris |
| theme/head.html | Fixed theme-color #f7fafb (Glauca navbar colour) | Glauca value |

The site copies values. It does not import from the Glauca repository or its dist files. Glauca's dist CSS also uses the --gl- prefix (dist/css/glauca.css), so a prefix change in Goney would propagate to chrome.scss, both mode files and the CI check.

### 2.9 Published metadata that names the dead page or a repository path

| Channel | Current | Metadata | Update route |
|---|---|---|---|
| CRAN pequod | 0.2.0, published 2026-05-01 16:40 UTC (0.1.1 on 2026-04-29). Earlier 0.0-1 to 0.0-5 (2010 to 2016) belong to an unrelated package of the same name by Alberto Mirisola | URL field: the dead page and github.com/tiagojct/pequod; BugReports github.com/tiagojct/pequod/issues (r/DESCRIPTION:16, 18-20) | New CRAN release |
| PyPI pequod | 0.2.0 (0.1.0 also) | Homepage the dead page; Repository, Bug Tracker, Changelog (blob/main/CHANGELOG.md) on GitHub | New release |
| npm pequod-tailwind | 0.2.0 (0.1.0 on 2026-04-27; 0.2.0 on 2026-04-30) | homepage the dead page; repository git+https://github.com/tiagojct/pequod.git with directory "tailwind"; bugs | New version |
| VS Code Marketplace tiagojct.pequod-color-theme, "Pequod Palette" | 0.2.0 (30 Apr 2026; 0.1.0 on 25 Apr) | Learn link the dead page; GitHub, Source, Support links to pequod | New extension version |
| Open VSX tiagojct/pequod-color-theme | 0.2.0 (2026-04-30), 870 downloads | homepage the dead page; repository; bugs | New version |
| r-universe tiagojct.r-universe.dev | pequod 0.2.0, created 2026-09-17, only package | RemoteUrl github.com/tiagojct/pequod, RemoteSubdir r. Registry repository not found under tiagojct/universe or tiagojct/tiagojct.r-universe.dev (location unverified) | Registry entry |
| GitHub About fields | Read 2026-09-29 (gh api repos/tiagojct/REPO) | pequod: homepage the dead page. pequod-quarto: https://tiagojct.eu/projects/pequod-quarto/ (404). loomings and homebrew-loomings: https://tiagojct.eu/loomings (404). gam: https://gam.tiagojacinto.eu (works). glauca, try-works, ambergris: no description, homepage or topics. loomings description and topics still say macOS, Windows, Linux, Tauri, Rust | Settings |
| Third-party mirrors | 0.2.0 (libraries.io page titles) | libraries.io (pypi, npm, cran and github pages exist), deps.dev (npm, pypi, github), ecosyste.ms (copies the dead homepage) | Follow the registries |

In the pequod clone the dead URL appears in 22 files: LICENSE-CC-BY-4.0:49, README.md:30, pequod.json:7, python/README.md:8, python/pyproject.toml:41, python/src/pequod/__init__.py:21, r/DESCRIPTION:16,18, r/R/pequod-package.R:10, r/README.md:9, r/man/pequod-package.Rd:17,25, specimen/specimen.typ:119, tailwind/README.md:10, tailwind/package.json:40, themes/Pequod.itermcolors:5, six files in themes/terminals/ (line 2 or 3), vscode/README.md:64, vscode/package.json:29. The gam clone copies three of these as test fixtures.

The other family repos reference tiagojct.eu only as the author URL: glauca and try-works CITATION.cff line 11 and obsidian manifests; glauca and ambergris Firefox add-on ids (glauca-theme@tiagojct.eu, ambergris@tiagojct.eu). Add-on ids are identifiers, not links.

### 2.10 What breaks on archive, rename or merge

GitHub redirect behaviour below is documented behaviour and was not tested here.

| Action on a repository | Effect on the links and consumers found |
|---|---|
| Archive | Nothing breaks. Archived repositories stay public and cloneable. Deep blob links stay valid but frozen |
| Rename (glauca to goney and so on) | Root links (5 on Gam, 7 on the Quarto pages) and deep links redirect while the old name is not reused. Deep links stay valid only if file paths inside the repository do not change. Gam's scripts/vendor.sh clones by name (lines 16-24, 33) and would follow the redirect |
| Merge into ensigns, then archive the old repos | Deep links (89 on Gam; none to family repositories on the Quarto pages) point to frozen copies: valid but stale. install_github("tiagojct/pequod", subdir = "r"), npm repository.directory and r-universe RemoteSubdir point at paths that would move |
| Delete or make private | All of the above break, including the Gam vendor clone and every package metadata link |
| Rename Gam | api.github.com/repos/tiagojct/gam/dispatches (deploy/family-dispatch.yml:16); image ghcr.io/tiagojct/gam (deploy/docker-compose.yml:9); container_name gam (line 10); Caddy route (deploy/Caddyfile.snippet:3-13); tunnel hostname (deploy/cloudflared-ingress.yml:4-5); CITATION.cff repository-code; Quarto page links (projects/gam/index.qmd:60-61); GitHub About homepage; the /projects/gam/ URL on tiagojacinto.eu (Quarto supports aliases: for redirects, used in talks/past/index.qmd:8) |

## 3. Part B: citations and DOIs

### 3.1 CITATION.cff

Present in gam, glauca and try-works. Absent in pequod and ambergris (clones; GitHub contents API returns 404 for both). No .zenodo.json or codemeta.json in any clone. No R inst/CITATION in pequod (r/ has no inst directory).

| Field | gam | glauca | try-works |
|---|---|---|---|
| title | Gam: where the four Moby-Dick colour families meet | Glauca: a glaucous design system | Try-Works: a Moby-Dick design system |
| version | 0.1.0 | 0.1.0 | 1.0.0 |
| date-released | 2026-09-21 | 2026-07-10 | 2026-06-27 |
| authors | Jacinto, Tiago | Jacinto, Tiago | Jacinto, Tiago |
| ORCID | none | none | none |
| doi, identifiers | none | none | none |
| repository-code | https://github.com/tiagojct/gam | https://github.com/tiagojct/glauca | https://github.com/tiagojct/try-works |
| url | https://gam.tiagojacinto.eu | https://tiagojct.eu | https://tiagojct.eu |
| license | "MIT AND CC-BY-4.0" | same | same |
| message | If you use Gam or the families it presents, please cite them | If you use Glauca, please cite it | If you use Try-Works, please cite it |
| keywords | colour palettes, design tokens, accessibility, Moby-Dick | design system, design tokens, colour, typography | same as glauca |
| lines | CITATION.cff:1-16 | 1-16 | 1-16 |

Observations:

1. The licence value fails CFF 1.2.0. The schema (citation-file-format 1.2.0, schema.json, definitions.license) accepts one SPDX identifier or an array meaning OR. "MIT AND CC-BY-4.0" is not in the 459-item enum. Checked by reading the schema; cffconvert is not installed, so not validated by tool.
2. The url of glauca and try-works points to tiagojct.eu, now the personal blog with no Glauca or Try-Works content.
3. No type, abstract, orcid, affiliation or preferred-citation in any of the three.
4. glauca and try-works docs/RELEASING.md step 3 says to update CHANGELOG.md and CITATION.cff at each release. Glauca's CHANGELOG has a large Unreleased block above 0.1.0 (docs/CHANGELOG.md:3-76) while CITATION says 0.1.0 released 2026-07-10.
5. Gam's README (line 154-156) points to CITATION.cff or the About page for citation.

Versions by source:

| Family | Token file | Gam live | CITATION.cff | Git tags | Packages |
|---|---|---|---|---|---|
| Pequod | pequod.json 0.2.0-alpha; CHANGELOG top entry 0.2.0-alpha, 2026-04-30 | 0.2.0-alpha | none | v0.1.0, v0.2.0 | 0.2.0 on CRAN, PyPI, npm, VS Code, Open VSX |
| Glauca | glauca.json 0.1.0 | 0.1.0 | 0.1.0 | none | none |
| Try-Works | try-works.json 1.0.0 | 1.0.0 | 1.0.0 | none | none |
| Ambergris | tokens.json meta.version 0.3.0 | 0.3.0 | none | none (commit c92c190 is titled "Release v0.3.0") | none |
| Gam | package.json 0.1.0 | 0.1.0 | 0.1.0 | none | ghcr.io image only |

GitHub Releases: 0 in each of pequod, glauca, try-works, ambergris and gam (gh api .../releases). The Pequod project page on the old site and vscode/README.md tell users to take the .vsix "from the GitHub releases page". No such release exists.

### 3.2 DOIs found

| DOI | Kind | Resolves to | Title | Version | Evidence |
|---|---|---|---|---|---|
| 10.32614/CRAN.package.pequod | Package-level DOI covering all versions (Crossref, member 17266, type dataset). ORCID-authenticated author 0000-0002-7897-1101 | https://CRAN.R-project.org/package=pequod | pequod: Colour Palette for Reading and Code, Inspired by Moby-Dick | none (CRAN page shows 0.2.0) | https://doi.org/api/handles/10.32614/CRAN.package.pequod; api.crossref.org/works/10.32614/cran.package.pequod; CRAN landing page lists it |
| 10.5281/zenodo.20125559 | Zenodo concept DOI | zenodo.org/records/20125559 | quarto-study-flow | all versions | zenodo.org/api/records/20125560 (conceptdoi) |
| 10.5281/zenodo.20125560 | Zenodo version DOI | zenodo.org/records/20125560 | quarto-study-flow | v1.1.0 (2026-05-11) | zenodo API. Not one of the five projects; the only Zenodo record by Jacinto, Tiago |

Notes on the CRAN DOI. The Crossref "issued" date is 2010-11-13, the first CRAN version under the name pequod, which belonged to another author (Moderated Regression Package, 0.0-1 to 0.0-5). OpenAlex indexes the DOI as W7160114214, publication_year 2010, type dataset. The DOI is not in the ORCID record.

Notes on the quarto-study-flow precedent. Its CITATION.cff has doi 10.5281/zenodo.20125560 (the version DOI) and an identifiers entry that labels the same value "Concept DOI (always resolves to the latest release)". That label is wrong: the concept DOI is ...559. The README badge and the site citation use the version DOI. Its Zenodo record has no creator ORCID, related identifier https://github.com/tiagojct/quarto-study-flow/tree/v1.1.0 (isSupplementTo), licence mit-license. GitHub Releases v1.0.0 (2026-05-10) and v1.1.0 (2026-05-11) exist; Zenodo holds only v1.1.0. Zenodo's integration was enabled after v1.0.0.

### 3.3 Zenodo searches (https://zenodo.org/api/records)

| Query | Result |
|---|---|
| q=pequod, size=10 | 3 total, all unrelated (Melville studies) |
| q=glauca | 1206 total, botanical and taxonomic records; none by Jacinto |
| q=try-works | 20471 total, unrelated; none by Jacinto |
| q=ambergris | 53 total, chemistry and ecology; none by Jacinto |
| q=gam | 1048 total, statistics (generalised additive models); none by Jacinto |
| creators.orcid:"0000-0002-7897-1101", size=50 | HTTP 400: page size above 25 not allowed anonymously |
| same, size=25, with and without all_versions | 0 hits. Also 0 for the ORCID as free text and in the legacy field |
| creators.name:"Jacinto, Tiago", all_versions | 1 hit: quarto-study-flow v1.1.0 |
| related identifiers containing tiagojct | 1 hit: the same record |
| targeted queries such as pequod AND palette, glauca AND tokens, "try-works" AND design, ambergris AND palette, "pequod-quarto", loomings AND jacinto | 0 hits each |

Conclusion: Zenodo has no record for pequod, glauca, try-works, ambergris, gam, pequod-quarto or loomings. Raw JSON is in S/parts/consumers-2-raw/zenodo/.

### 3.4 Other indexes (public GET, no authentication)

| Index | Result |
|---|---|
| Software Heritage | Origin https://github.com/tiagojct/pequod exists. One visit, 2026-09-29T07:55:50Z, status full, snapshot 8b9a9d984180f109fc04a726d1684a62bcc5a5c2. Origins for glauca, try-works, ambergris, gam, loomings and pequod-quarto return 404 (not archived). The visit was made at 07:55 UTC today, before this session; not by this part (this part only issued GET requests) |
| OpenAlex | Two author profiles carry the ORCID: A5060607540 (104 works) and A5135152586 (4 works, holds the CRAN DOI). Zenodo concept and version DOIs of quarto-study-flow are indexed as software (W7160828278, W7160865787). Nothing for gam, glauca, try-works or ambergris |
| ORCID public record | 154 works. None with 10.32614 or 10.5281. No software entry |
| Crossref | One dataset by the ORCID: the CRAN DOI |
| DataCite | 0 DOIs with the ORCID as name identifier |
| Libraries.io | Pages exist for pypi/pequod, npm/pequod-tailwind, cran/pequod, github/tiagojct/pequod (HTTP 200, titles show 0.2.0). API needs a key, not used |
| deps.dev | npm pequod-tailwind, pypi pequod and github.com/tiagojct/pequod known |
| r-universe | tiagojct.r-universe.dev lists pequod 0.2.0 only |
| ecosyste.ms | PyPI pequod and the GitHub repo record copy the dead homepage |
| Name collisions seen at check time | PyPI: ambergris exists (Sophie Paul, Docker utilities, 0.1.0.1, 2026-04-01) and rosebud exists (Ralph Puzon, 0.1, 2019). PyPI names glauca, try-works, goney, jungfrau, ensigns return 404. npm: glauca-tailwind, try-works-tailwind, goney-tailwind, jungfrau-tailwind, rosebud-tailwind, ensigns-tailwind return 404. github.com/tiagojct/ensigns returns 404 |

### 3.5 Badges and DOI references in the clones

Only pequod README.md has badges (lines 7-12): PyPI, npm, VS Code, Open VSX, CRAN, licence. No Zenodo or DOI badge. gam, glauca, try-works and ambergris have none. A search of every file in the five clones for doi.org, zenodo and 10.5281 or 10.32614 patterns finds only pequod scripts/cvd_check.py:24, a reference to the Vienot, Brettel and Mollon paper (10.1002/(SICI)...), not a project DOI. Gam About says to cite Pequod with citation("pequod") in R.

### 3.6 Points relevant to a monorepo

1. A Zenodo record needs a GitHub Release. If Zenodo is enabled for a new ensigns repository, its first release creates a new concept DOI. No existing DOI is lost, because none exists for the five.
2. If the quarto-study-flow pattern is repeated, use one DOI consistently: concept DOI in doi, or version DOI labelled as such.
3. The CRAN DOI belongs to the package name and stays valid while the package stays on CRAN. Its landing URL and DESCRIPTION URL change only with a new CRAN version.
4. The url values (tiagojct.eu, gam.tiagojacinto.eu), repository-code values and title strings in the three CITATION.cff files name the old projects and would change with the renames.

## 4. Part C: Loomings (/Users/tiagojct/Projects/loomings)

### 4.1 Stack

Plain JavaScript (ES modules, "type": "module"), no framework, no TypeScript. Vite 8.3.0, Vitest 5.0.1, CodeMirror 6 (@codemirror/view 6.43.0, state 6.6.0), markdown-it 14.2.0. Package manager npm (package-lock.json, lockfileVersion 3; CI uses npm ci on Node 20; no engines field). Build target safari14, base /app/ (vite.config.js:9,40). Static output served by nginx:alpine in Docker. Version 2.0.8 in package.json:3 (CLAUDE.md:92-93: version lives there only). The Tauri desktop line stopped at 1.2.1 (branch desktop-final).

### 4.2 Where palettes and themes live

| Path | Role |
|---|---|
| src/palettes.js (203 lines) | Data and helpers. The only place colours live (CLAUDE.md:23-25, 49-53). Exports at lines 12, 17, 163, 164, 167, 179, 192 |
| src/palettes.test.js (59 lines) | The only validation |
| src/editor.js | Import at line 13. makeHighlight 81-99, makeTheme 101-144, state 152-162, applyThemeAttr 166-173, buildState 440-455, applyTheme 551-562, setThemeMode 567-573, setThemeFamily 579-585, renderThemeMenu 596-614, menu wiring 636-642, exportHtml 1119-1159 |
| src/style.css | Reads the CSS variables. Pequod pre-script fallback lines 14-51 |
| src/index.html | Theme menu markup lines 65-73; meta theme-color line 8 |
| public/manifest.webmanifest | background_color and theme_color lines 9-10 |
| docs/index.html, docs/style.css | Landing page with its own cloth-red palette (not a family) |

### 4.3 Format

ES module exporting seven names. Shape, reformatted for width, with the Ambergris entry (src/palettes.js:125-160) as the example:

```js
export const PALETTE_KEYS = ['bg','bgElev','bgDeep','fg','fgDim','fgGhost',
                             'accent','accentLight','accentDim','border'];
export const PALETTES = {
  ambergris: {
    label: 'Ambergris',
    modes: { dark: 'Dark', light: 'Light' },
    dark: {
      bg: '#0C1117', bgElev: '#2B3037', bgDeep: '#1A1F26',
      fg: '#EAEDEF', fgDim: '#AEB2B7', fgGhost: '#8D9298',
      accent: '#5BB6B1', accentLight: '#86CDC8', accentDim: '#2F9F99',
      border: '#42484E',
      heading: '#EAEDEF', emphasis: '#EAEDEF', code: '#AEB2B7', marker: '#8D9298',
    },
    light: { /* the same 14 keys */ },
  },
  // pequod, glauca, tryworks: same shape
};
export const FAMILY_ORDER = ['pequod', 'glauca', 'tryworks', 'ambergris'];
export const DEFAULT_FAMILY = 'pequod';
export function roles(family, mode) {}  // adds heading, emphasis, code from accentLight and marker from accent when absent
export function cssVars(family, mode) {} // 14 custom properties: --bg --bg-elev --bg-deep --fg --fg-dim --fg-ghost --accent --accent-light --accent-dim --border --heading --emphasis --code --marker
export function contrast(hexA, hexB) {} // WCAG 2 ratio, used only by tests
```

Rules: six-digit #rrggbb hex only (the test regex and contrast() require it). Each family has label, modes (names shown as hints in the menu), dark and light. The four ink roles are optional. Family keys are lower case without hyphen: the key is tryworks while the label is Try-Works.

### 4.4 Contents

| Key | Label | Dark mode name | Light mode name | Source named in comments |
|---|---|---|---|---|
| pequod | Pequod | Below deck | Parchment | github.com/tiagojct/pequod (line 18). Also "the original Loomings palette and the default" (line 19) |
| glauca | Glauca | Profundum | Pruina | github.com/tiagojct/glauca (src/glauca.json) (line 54) |
| tryworks | Try-Works | Try-Fire | True Lamp | github.com/tiagojct/try-works (src/try-works.json) (line 86) |
| ambergris | Ambergris | Dark | Light | github.com/tiagojct/ambergris (tokens.json v0.3.0) (line 117), with the role mapping in lines 117-124 |

91 hex values in the file: pequod 23 (10 dark, 13 light including three light ink roles), glauca 20, tryworks 20, ambergris 28.

### 4.5 Provenance: copied by hand, and where it has drifted

Evidence that the file is hand-copied: the header (lines 3-4) says every value is "copied from the design system's own token source"; no script in scripts/ (build-icons.sh, pad-icon.swift, render-icon.py, render-og.swift) reads a family file; package.json has no family dependency or generator script; git log --follow src/palettes.js shows one commit, bb9d23f (2026-09-21 14:34 +0100, "v2.0.0 phase 1: palettes module, Ambergris, theme menu"), never edited since. Before that the palettes lived in src/editor.js (v1.1.0, c69fd45, 2026-07-13: "ports of the design systems ... all values come straight from their source token JSONs"). The mapping from family tokens to the ten Loomings roles is a manual choice; only Ambergris documents it.

Drift check (each Loomings hex looked up case-insensitively in the token file of the clone at HEAD):

| Family | Token file | Values in Loomings | Found verbatim | Not found |
|---|---|---|---|---|
| Pequod | pequod.json 0.2.0-alpha | 23 | 3 (dark fg #F7F3EE = Log 50, dark accent #BD8C68 = Log 300, light accentLight #BD8C68) | 20, including dark bg #061826, dark bgElev #0E2D44, dark bgDeep #02101B, light bg #F1E7D2, light fg #1A2D3C, light accent #8B6348 |
| Glauca | src/glauca.json 0.1.0 | 20 | 20 | 0 |
| Try-Works | src/try-works.json 1.0.0 | 20 | 20 | 0 |
| Ambergris | tokens.json 0.3.0 | 28 | 28 | 0 |

The Pequod values never appear in Pequod's git history (git log --all -S for 061826 and F1E7D2 returns nothing) and are not the v0.1.0 values either (v0.1.0 Log 950 was #13181F). Loomings' Pequod is a separate palette that shares the name. Adopting the current Pequod tokens would change the default look of Loomings, including the screenshots and the theme-color values.

### 4.6 How a palette is applied; modes

1. State: localStorage keys loomings_themeMode (system, light or dark; editor.js:152, 155) and loomings_themeFamily (editor.js:153; STORE prefix line 42-43). An unknown stored family silently resets to DEFAULT_FAMILY (lines 153-154).
2. applyThemeAttr (166-173) sets data-theme (dark or light) and data-palette (family key) on the html element and writes the 14 custom properties inline with style.setProperty. Nothing in style.css selects on data-palette (grep).
3. CodeMirror: makeHighlight and makeTheme take roles(family, mode) and are swapped through compartments (441-455, 551-562).
4. HTML export inlines roles() colours in a standalone page (editor.js:1119-1159). Print uses a black on white stylesheet (style.css:551-571).
5. No theme JSON, no per-family CSS file. The palettes are bundled into the single JS chunk (`dist/assets/index-*.js`).
6. Modes: each family has a dark object and a light object. The user setting has three values (system, light, dark); system follows prefers-color-scheme and updates on change (editor.js:159-162, 644-646). The mode names Below deck, Parchment and so on are labels only (menu hints, editor.js:605).
7. Share links carry the document only, not theme (share.js has no theme references).

### 4.7 Interface chrome and Ambergris

Chrome is coloured by the same variables as the editor: style.css uses var(--fg-ghost) 21 times, --accent 15, --fg 14, --border 13, --bg-deep 12, --accent-light 10, --fg-dim 5, --bg-elev 4, --bg 4 (grep count). There is no chrome layer and no per-family branch in the code. The default is Loomings' Pequod (navy #061826 with amber accent), as the screenshot docs/assets/screenshot.png shows. Ambergris is used only when the user selects it. Ambergris' own rules (accent marks interaction only) are honoured through its four ink roles (headings, emphasis and code in ink). The toolbar buttons use the accent for hover and open states (style.css:104,106), which suits Ambergris. Making Rosebud the quiet chrome would be a design change: it needs a second variable set, or a rule that chrome always reads one family, and the editor content would then read the chosen family.

### 4.8 Validation

src/palettes.test.js (lines 6-59), per family and per mode:

| Check | Floor |
|---|---|
| Family list equals FAMILY_ORDER once each; default exists | exact |
| label and both mode names present | truthy |
| Ten keys are six-digit hex; optional ink roles hex if present | regex ^#[0-9a-f]{6}$ |
| fg on bg | at least 7 |
| fgDim on bg | at least 4.5 |
| fgGhost on bg | at least 2 |
| heading on bg | at least 3 |
| accent on bg | at least 3 |
| fg on bgDeep | at least 4.5 |
| bg on the correct side of mid-grey for the mode | dark or light |
| cssVars covers the 14 properties | hex |

No JSON Schema file exists. Baseline: npx vitest run in a scratch copy (S/parts/consumers-2-raw/loomings-copy, not in the repository): 3 test files, 49 tests, all pass (Vitest 5.0.1). The palette tests scale with families: 9 per family plus 2, so 38 now and 92 with ten families. CI runs npm test before publishing (docker-publish.yml:16-26).

### 4.9 Dropping in a new palettes file, and a family switch

Drop-in: replace src/palettes.js with a module that keeps the exports. editor.js imports PALETTES, FAMILY_ORDER, DEFAULT_FAMILY, roles and cssVars (line 13). The test imports also PALETTE_KEYS and contrast. Vite bundles it; nothing else reads it. CLAUDE.md:49-53 describes adding a family as data only.

What changes, by need:

| Need | Change |
|---|---|
| Rename keys (tryworks, glauca, ambergris to new keys) | Edit the object keys and FAMILY_ORDER. Users who stored the old key in loomings_themeFamily fall back to Pequod without notice. An alias map at editor.js:153-154 would keep their choice |
| Add families (four to ten) | Add entries. Menu, CodeMirror themes, CSS variables and export follow. Each new family needs a hand mapping to the ten roles that passes the floors in 4.8 in both modes |
| Ten families in the Theme menu | .tb-menu has no max-height or overflow (style.css:109-122). About 13 rows plus two section labels, estimated 450 px (unverified by rendering). Short viewports may need a max-height with scroll |
| Change the default family | DEFAULT_FAMILY, and the Pequod fallback CSS (style.css:14-51), index.html:8 and manifest lines 9-10 which repeat the Pequod dark values |
| Generate the file | No hook exists. A generator would need a Loomings-specific role mapping per family. Gam's adapters (src/model/adapters/pequod.js, ambergris.js, glauca.js, try-works.js, system.js) already normalise the four token files |
| Documentation | README.md, CLAUDE.md, docs/index.html (4.11) |

### 4.10 Release process (what a palettes update needs)

1. Edit src/palettes.js; run npm test.
2. Raise version in package.json only. The service worker cache name loomings-VERSION and the About dialog read it (src/sw-template.js:8-9; vite.config.js:26-30).
3. Add a CHANGELOG.md entry (Keep a Changelog; latest 2.0.8, 2026-09-21). Update README.md themes table and docs/index.html. If docs/style.css or docs/assets change, bump their ?v= query strings (CLAUDE.md:80-91).
4. Commit to main, tag vX.Y.Z and push the tag. .github/workflows/docker-publish.yml runs npm ci, npm test and npm run build, then pushes a multi-arch image to ghcr.io/tiagojct/loomings with tags version, major.minor, sha and branch. latest moves only on v* tags (lines 47-60).
5. The VPS runs watchtower with --interval 300 and the label watchtower.enable on :latest (docker-compose.yml:20-32). A release goes live about five minutes after the image is pushed.
6. The project page tiagojacinto.eu/projects/loomings/ keeps its own version list (index.qmd:49-60) in the site repository, published by that repository's Publish workflow.

### 4.11 Hard-coded family names and colours to update after the renames

Names (the rename affects Glauca, Try-Works and Ambergris; Pequod keeps its name):

| Location | Content | Action |
|---|---|---|
| src/palettes.js:2-4 | Header says "Four families" | Update count |
| src/palettes.js:54-59 | Glauca comment with github.com/tiagojct/glauca (src/glauca.json); key glauca; label Glauca; mode names | Rename, new source path |
| src/palettes.js:86-90 | Try-Works comment with github.com/tiagojct/try-works (src/try-works.json); key tryworks; label Try-Works | Rename, new source path |
| src/palettes.js:117-127 | Ambergris comment with github.com/tiagojct/ambergris (tokens.json v0.3.0) and the mapping; key ambergris; label Ambergris | Rename, new source path |
| src/palettes.js:18 | Pequod comment with github.com/tiagojct/pequod | Update if the repository moves |
| src/palettes.js:163 | FAMILY_ORDER lists glauca, tryworks, ambergris | Rename |
| Stored browser state | loomings_themeFamily values glauca, tryworks, ambergris | Migration or silent reset |
| README.md:37-47 | "Four families" and a table with links to four repositories | Rewrite |
| README.md:105 | palettes.js described as the four colour families | Update |
| CLAUDE.md:23-25, 49-53 | "the four colour families"; ten PALETTE_KEYS | Update |
| docs/index.html:68-70 | Heading "Four colours, two moods" and a paragraph naming the four | Rewrite |
| CHANGELOG.md:154-157, 223, 227-228 | Historical mentions | Keep as history; add new entry |
| src/palettes.test.js | No family names | None |
| src/editor.js | No family names in logic; comment at line 164 names Pequod | None |
| Outside the repository | tiagojacinto.eu projects/loomings/index.qmd (lines 6, 8, 32-43), projects/gam/index.qmd, gam About paragraph "Relation to Loomings" (src/pages/40-about.js:32-33), gam docs/quarto-page.qmd | Update with the Loomings release |
| social/instagram/README.md:36,64,118,138,161; social/instagram/posts/04-pequod-palette.md; social/instagram/generate_images.py:311,341 | Pequod palette marketing text | Unaffected by the renames |

Colour values outside src/palettes.js:

| Location | Values | Note |
|---|---|---|
| src/style.css:19-28 and 36-45 | 20 Pequod fallback hexes (Loomings' own values) | Must follow the default family if it changes |
| src/index.html:8 | theme-color #061826 | same |
| public/manifest.webmanifest:9-10 | background_color and theme_color #061826 | same |
| docs/index.html:19-20; docs/style.css:13-19, 30-35 | #551713, #131A2B and the cloth-red landing palette | Not a family. Independent |
| scripts/render-icon.py:17-26 | 10 constants: Loomings' own values (#061826, #02101B, #010A12, #D4A882) and current Pequod values (#0D2F42, #F7F3EE, #EAE1D7, #DBC9B6, #BD8C68, #163F54) | Icon pipeline only |
| social/instagram/README.md:118, posts/04, generate_images.py | #0D2F42, #0B1F2D, #F1E7D2, #BD8C68, #D4A882, #F7F3EE, #1A2D3C | Marketing |
| src/style.css:551-571; editor.js export print rule | Generic black, white and greys | None |

### 4.12 homebrew-loomings

github.com/tiagojct/homebrew-loomings has Casks/loomings.rb and README.md. Neither mentions palettes or families. Both point to loomings.tiagojct.eu, which no longer resolves. The cask installs the archived desktop build v1.2.0 from github.com/tiagojct/loomings/releases (Casks/loomings.rb, url line), so it depends on that repository path and its release assets staying in place. Loomings is not part of the merge.

## 5. Other repositories that mention the names (leads, not inspected)

GitHub code search (authenticated, includes private repositories), capped at 100 hits per query, so the list is a lower bound. Counts are matching files.

| Repository | Visibility | Matches |
|---|---|---|
| working-draft | private | glauca 13 |
| subsub | public | glauca 8, try-works 9 |
| liberceti | private | ambergris 6, try-works 8, pequod 6 |
| tiagojct.github.io | private | ambergris 4, pequod 4, tiagojct.eu/projects 1, tiagojct.eu/loomings 1 |
| pequod-wallpapers | public | ambergris 1, pequod 3, tiagojct.eu/projects 4 |
| tiagojct-site (old Quartz site) | public | pequod 7, tiagojct.eu/projects 3 |
| claude-dotfiles | private | ambergris 3, tiagojct.eu/projects 1 |
| intro-computers | public | try-works 3 |
| promptfather | private | try-works 3 |
| ev2026-promptfather | private | tiagojct.eu/projects 3 |
| diagcalc | public | glauca 2, try-works 1 |
| scrimshaw | public | glauca 2, try-works 1 |
| cv | private | glauca 2 |
| atlas | private | try-works 2, pequod 1 |
| antedraft | private | glauca 1 |
| armilar | private | try-works 1 |
| moby-qr | public | ambergris 1 |
| rokovoko-feeds | private | pequod 1 |
| ers-learning-resources-director | private | tiagojct.eu/projects 1 |
| ia-fmup | private | tiagojct.eu/projects 1 |
| ia-saude | private | tiagojct.eu/projects 1 |
| vellum | private | link to tiagojct/pequod 1 |

The GitHub profile README (tiagojct/tiagojct) links tiagojct.eu/writing and tiagojct.eu/work, both 404. It does not name the families.

## 6. Unverified or not done

1. GitHub redirect behaviour after rename or archive is documented behaviour, not tested here.
2. Cause of the commit "unknown" in Gam (no git in node:20-alpine) is probable, not tested.
3. Date the tiagojct.eu project pages were removed. The Wayback Machine API returned HTTP 429.
4. The CFF licence finding rests on the 1.2.0 schema. cffconvert is not installed.
5. The output of citation("pequod") in R was not run.
6. The estimated Theme menu height for ten families was not rendered.
7. npmjs.com returns 403 to curl. The registry API confirms the package.
8. Cause of the Glauca local and GitHub history divergence.
9. Location of the r-universe registry.
10. The identity of the six extra families for Loomings is not in my inputs. "Ten families" may be a carry-over from "ten PALETTE_KEYS".
11. Code search is not exhaustive (100 hits per query).
12. Internals of the family repositories, and of Gam beyond the files cited, belong to other parts.


Part 1: local disk and GitHub

# Consumers inventory, part 1: local disk and GitHub

Phase 1, read-only. Date of run: 2026-09-29. Author: consumers-1 agent. S = /private/tmp/claude-501/-Users-tiagojct-Projects-ensigns/bd5f7846-4d92-4133-b850-d9dce03332ed/scratchpad

## 0. Summary and status

- 22 GitHub repositories use or copy family values and 4 more only document them (26 in total, plus 3 that only mention the names by chance). One local-only repository (~/Keynotes/2026-09-28_ia-enf-especialistas) and a pre-reformat iCloud backup also hold copies. Nothing outside the five repositories takes a family as a submodule. The only package-style use is library(pequod) in one R script of tiagojct-site (site not live) and unexecuted code samples in the dataviz notes. Every consumer holds a hand-made copy of values or generated files. Only subsub has a script (make-themes.py) that reads a family token file, and it is run by hand.
- Because all sync is manual, a rename breaks nothing that already exists. It breaks re-syncs, links, displayed names and stored settings (section C).
- All five repositories are PUBLIC today (verified with gh repo list). Text that says Glauca or Ambergris is private is stale (working-draft/CLAUDE.md line 41, gam README secrets table).
- Pre-existing dead links: tiagojct.eu/projects/pequod/, /projects/pequod-quarto/, /pequod-wallpapers/, /pequod-quarto/ and /loomings all return HTTP 404 today (checked with curl). See section E.
- Items not finished are marked "not done" with the reason (section F).
- Rule deviations by me are listed in section G.

## 1. Method (what was searched)

Search terms: pequod, glauca, try-works (also try works, try_works, tryworks), ambergris, gam.tiagojacinto; crew names only in files that also contain pequod or palette.

Local: ripgrep, case-insensitive, over /Users/tiagojct/Projects (every subfolder), Websites, dotfiles, Obsidian, Keynotes, FMUP (text files; Students and Submissões excluded), Downloads, Public, Nodus, Papers, plus a filename search over the whole home folder (fd) and the Library folder. Config: ~/.config, ~/Library/Application Support (Code, obsidian, quarto, quarto-writer, iTerm2), ~/Library/Preferences/com.googlecode.iterm2.plist, ~/.vscode/extensions, ~/.claude memory notes. Excluded: node_modules, .git, dist, build, _site, .quarto, caches, .env, key files. Not opened: ~/.claude/sessions/*.key, the ssh folder in the iCloud backup, dotfiles .ssh, anything that looked like a credential.

GitHub: (1) gh api search/code with user:tiagojct and NOT repo: for the five repositories (gh search code ignores those exclusions, so I used gh api). (2) A full-content scan of the default branch of all 103 non-fork repositories other than the five (files up to 1.5 MB, tarball streamed into memory, nothing written), which does not depend on the code-search index. The scan confirmed every code-search hit and added blog and zettelkasten. (3) Code search in the three organisations you belong to (Informatica-MEDCIDS, SauDInoB, medcids): 0 hits. Raw JSON is in S/parts/consumers-1.work/.

Limits: default branches only; files over 1.5 MB skipped; code search cannot search other people's repositories (owner qualifier is required), so third-party use is not inventoried.

Regex note: the pattern try[-_ ]?works also matches words such as "registry works", so matching lines were read. False positives found: the Kelly Kindle note in the vault, one cached reference list in feynman-research, and one .venv test file in a backup clone (F). A file the main session created later, Projects/ensigns/inventory/checks/verify_claims.py, also matches and is not a consumer (Projects/ensigns was empty when I searched).

## 2. Part A: local disk

### A1. Stale local copies (not reported as consumers)

gam (/Users/tiagojct/Projects/gam). HEAD f16228d equals GitHub HEAD f16228d. git status is clean: no modified and no untracked files. Nothing is missing from S/clones/gam. Gitignored local-only content exists but is regenerable: .claude/launch.json (a Claude preview config, port 4174), dist/, site/, node_modules/, src/generated/, public/official/, public/og.png, favicons, vendor/ (clones of ambergris c92c190, glauca 1efbcce, loomings 5f71136, pequod 619982d, try-works 400dd91), and tools/fonts/src/ (four TTF and two OFL texts, 624 KB, downloaded by scripts/subset-fonts.mjs from upstream).

glauca (/Users/tiagojct/Projects/glauca). Working tree clean, no untracked or ignored files, no stash. Local HEAD 1e66632 and GitHub HEAD 1efbcce have the identical tree (2d0206d). The 15 local-only commits are parallel copies of the 15 GitHub commits: for each pair the tree is identical and the message is identical after the Co-Authored-By and Claude-Session trailers are removed (these trailers exist locally only; the newest local commit also carries a Claude-Session URL). There is no merge base. The local history descends from the Forgejo-era history (the iCloud backup copy has c497f26 with remote git.tiagojct.eu). Nothing in the local copy is absent from GitHub. Local-only commits by subject, newest first:

1. 1e66632 docs: point repository URLs at GitHub
2. c497f26 Remove Forgejo Actions workflow (no runner on instance)
3. 7381d87 upd
4. 11a0672 upd
5. c3443c9 VS Code tabs: one blue line, no boxed borders
6. 160214e Move CI to .forgejo/workflows, drop GitHub-only dependabot config
7. 6faced0 Rename theme display names to Glauca Light / Glauca Dark
8. dd407c4 Full review pass: fix generators, purge try-works carryover, harden checks
9. d2dc1c3 Obsidian: sans headings, serif italic emphasis
10. eea8d31 upd
11. 4a501f7 Expand Zed theme with bracket, status, and dim-ANSI keys
12. 43c2a8e Rename mode identifiers lit/cold to dark/light
13. d683e63 Enhance Glauca themes with improved prompts and color adjustments for better readability and user experience
14. 05d4293 Refactor code structure and remove redundant sections for improved readability and maintainability
15. 9500920 Glauca 0.1.0: a glaucous, light-first design system

### A2. Local consumers found outside the two stale copies

| Path | Git remote | Family | Evidence (file:line) |
|---|---|---|---|
| ~/Projects/loomings | github tiagojct/loomings, HEAD 9d8c036 (= remote) | all four | src/palettes.js:18 "Pequod — github.com/tiagojct/pequod", :54 Glauca, :86 Try-Works, :117 "Ambergris ... tokens.json v0.3.0", :163 FAMILY_ORDER; src/editor.js:153 stored key themeFamily; README.md:42-45 table with four repo links |
| ~/Projects/subsub | github tiagojct/subsub, HEAD b41e5fd (= remote) | Glauca, Try-Works | scripts/make-themes.py:2 "from Gam design-system sources"; src/look.ts:28 MODE_THEMES; themes/subsub-{glauca,try-works}-{dark,light}.json; web/glauca.css:1 "Generated from glauca.json"; site/src/assets/css/{glauca,try-works,typography}.css; docs/Subsub.md:102 "after a change in Gam" |
| ~/Projects/working-draft | github tiagojct/working-draft (private), HEAD c95581c | Glauca | CLAUDE.md:41 vendored list; assets/glauca.scss, glauca-dark.scss, glauca.theme, glauca-typst.typ, glauca-fonts.css; fonts/glauca (12 TTF); figures/glauca.py:1 "Generated from glauca.json - do not edit by hand"; figures/glauca.R, glauca.mplstyle; chapters/14-colour.qmd:89-112 (theme_glauca, use_glauca) |
| ~/Projects/antedraft | github tiagojct/antedraft (private), HEAD 5c26754 | Glauca | style.css:2 "Glauca-informed"; README.md:92 |
| ~/Projects/promptfather | github tiagojct/promptfather (private), HEAD 4330436 | Try-Works | src/routes/+layout.svelte:12; static/decks/intro-computers/css/base.css:1 and terminal.css:4; INSTRUCOES.md:307-308 and :372 name ~/Downloads/try-works/ as source of truth (folder does not exist) |
| ~/Websites/tiagojacinto.eu | github tiagojct/tiagojacinto.eu (private), HEAD 9b257af (= remote), clean | Glauca; documents Gam, Loomings, Pequod, Ambergris | theme/glauca-light.scss:4 "Token values come from glauca/src/glauca.json (modes.light), not the dist SCSS"; _quarto.yml:106-117; .github/workflows/publish.yml:82-91 (light/dark parity check only); projects/gam/index.qmd:13 links https://gam.tiagojacinto.eu; assets/img/favicon.svg and writing/sw/figures/{hourglass,editorial-process}.svg comments "Ambergris dark" |
| ~/Keynotes/2026-09-28_ia-enf-especialistas | git, no remote (local only) | Glauca 0.1.0 | public/vendor/glauca/README.md:3 "Cópia de Projects/glauca 0.1.0 (commit 1e66632, 2026-09-11)"; scripts/validate.js:174-175 hex values from src/glauca.json palette.extended "copiados à mão ... Se o Glauca mudar, mudar aqui"; public/display.html:7-13 links /vendor/glauca/*.css; README.md:102 |
| ~/Keynotes/workshop-sw-2ed | github tiagojct/workshop-sw-2ed (private), HEAD 7050a42 | Pequod | styles.css:3-8 and styles-slides.css:3-9 hand-typed Pequod tokens; values are the older alpha set (log-50 #FBFAF5; canonical pequod.json is #F7F3EE); sessao1/slides.qmd uses var(--ishmael) |
| ~/dotfiles/claude (also ~/.claude/plans, skills, agents, rules symlinks) | github tiagojct/claude-dotfiles (private) | Ambergris, Glauca, Try-Works, Pequod | documentation only: plans/please-make-this-color-abundant-eich.md (Ambergris ports plan), plans/i-have-a-task-spicy-mist.md:87,92,106 (repo migration plan; ambergris second branch application-themes), plans/review-my-professional-website-fluffy-parrot.md:27-39 (dead /pequod/ links), skills/*/references (four one-line mentions) |
| ~/.claude/projects/-Users-tiagojct-Projects-{ensigns,gam,loomings}/memory and -Websites-tiagojacinto-eu/memory | none | all | ensigns-brief.md, ensigns-status.md, gam-project.md (decisions, GAM_DISPATCH_TOKEN), loomings-pivot-web-teaching.md, missing-links-check-github-first.md: documentation only |
| ~/Obsidian/Powerslave | none | Glauca, Pequod | Systems/Subsub.md:94 (subsub themes: try-works, Glauca) and :102 "after a change in Gam"; Ops/Seminário NEEMC 2026 - IA na Prestação de Cuidados.md:257 "Design Glauca vendorizado"; Ops/IIS 2026-27 - Health Research Informatics.md:295 names the pequod-quarto extension for MAIS slides (not found in mais-2627 or ~/FMUP/MAIS-2627). Other hits are not consumers: Workshop/esmagar-o-quadrante.md, Workshop/smashing-the-quadrant.md, Resources/Kindle/Why Read Moby-Dick - Philbrick.md and .claudian/sessions/*.meta.json name the ship Pequod in literary text; Resources/Kindle/Excellent Advice for Living - Kelly.md:31 matches only through the phrase "a second try works" (regex false positive). |

Files with crew names and palette but no family name (crew pass): Projects/loomings/social/instagram/posts/02-call-me-ishmael.md (Pequod hex values) and workshop-sw-2ed sessao1/slides.qmd. All other crew-name hits are literary. Full list in S/parts/consumers-1.crewpass.txt.

No hits: ~/dotfiles outside claude, ~/FMUP, ~/Downloads, ~/Public, ~/Papers, ~/Nodus (two false positives: a Pequod sentence in an abstract, Cyclobalanopsis glauca in a CSV), Projects/{cuidar, forking-paths, schoolmaster, vital-capacities, vital-capacities-research, writing-tropes, zotero-local-mcp, feynman-research (one false positive in a cached reference list)}. No pptx or potx under home has the family names or colours in its theme XML.

### A3. Editor and terminal settings

| App | State on this Mac | Theme name and path |
|---|---|---|
| Zed | not installed; no ~/.config/zed | none |
| Ghostty | not installed; no ~/.config/ghostty, no Application Support folder | none (old backup config used theme Corposant, see A4) |
| Positron | app installed; no ~/Library/Application Support/Positron, no ~/.positron | none |
| VS Code | installed | ~/Library/Application Support/Code/User/settings.json:70 workbench.colorTheme = "Glauca". No installed extension provides a theme with that label (searched ~/.vscode/extensions); the current Glauca labels are "Glauca Light" and "Glauca Dark" (glauca dist/vscode/package.json:21,26). Which theme renders is unverified. Installed: ~/.vscode/extensions/tiagojct.pequod-color-theme-0.2.0 (Marketplace, themes Pequod and Pequod Light, not active). Second profile ~/Library/Application Support/Code/User/profiles/-10960cb9/settings.json uses "Visual Studio Dark". |
| Obsidian | installed | ~/Obsidian/Powerslave/.obsidian/appearance.json cssTheme = "Minimal"; themes folder has Minimal, Nightfox, Primary Simplified, Retroma, Underwater, Velocity, macOS; no family theme or snippet |
| Quarto | installed | ~/Library/Application Support/quarto and quarto-writer: no hits; no user-level extension |
| iTerm2 | installed | ~/Library/Preferences/com.googlecode.iterm2.plist: only a Default profile, no family colour preset; DynamicProfiles and Scripts empty |

### A4. iCloud Drive backup of 2026-08-09 (outside the requested trees, found by filename search)

Path: ~/Library/Mobile Documents/com~apple~CloudDocs/Backup/2026-08-09/. It is a pre-reformat backup. Items with family content (names only; no secrets opened):

- projects/ambergris (branch application-themes 6139fbb and main 6c4a679, remote git.tiagojct.eu), projects/glauca (c497f26), projects/try-works (400dd91): older clones; all three have clean working trees; the same commits exist on GitHub (ambergris both branches; try-works identical hash; glauca as the rewritten pair).
- ghostty/themes/Glauca, Glauca-Dark, Try-Works, Try-Works-Cold (copies of the dist terminal themes); ghostty/config.ghostty:13 uses theme = Corposant.
- Obsidian vaults: Endovélico and melville (.obsidian/themes/Pequod and snippets/pequod-overlay.css), quartermaster (.obsidian/themes/Try-Works and Glauca), Try-works (.obsidian/themes/Try-Works).
- github/: older clones of pequod, pequod-quarto, tiagojct.github.io, loomings, scrimshaw, diagcalc, ia-saude, ers-learning-resources-director, zettelkasten, liberceti and others (same repositories as section B).
- hermes/skills/creative/pequod-design-system, hermes/skills/productivity/powerpoint/references/pequod-palette.md, tiago-knowledge/references/pequod-design.md (agent skill files that hold Pequod tokens).
- RESTORE.md:14,132 lists the Ghostty themes to restore.
Action: none for the migration except knowing that restoring this backup would bring back old family copies and old names. Content search of the 13 backup clones that are not on GitHub now: 0 hits in 12, one regex false positive in the thirteenth (see F).

## 3. Part B: GitHub

### B1. Repositories with references (default branch, full scan)

Legend: C = uses or copies values, D = documents only, N = not a consumer.

| Repository | Visibility | Files | Kind | Terms | Key paths and one-line description |
|---|---|---|---|---|---|
| loomings | public | 12 | C | all four | src/palettes.js holds eight palettes copied from the family token files |
| subsub | public | 18 | C | glauca, try-works | pi themes and CSS copies, see B2 |
| scrimshaw | public | 4 | C | glauca | internal/server/static/app.css styled with Glauca; CLAUDE.md:23 points to ~/github/glauca; gentokens/main.go mentions Try-Works and Armilar generator pattern |
| diagcalc | public | 3 | C | glauca, pequod, try-works | styles.css Glauca values in --log-* and --crew-* slots; tui/index.js Pequod dark crew hex; CHANGELOG.md 4.4.0 moved from Pequod to Glauca |
| intro-computers | public | 4 | C | try-works | css/base.css, css/terminal.css, js/deck.js, README.md "Design — Try-Works" |
| pequod-quarto | public | 38 | C | pequod | the Quarto extension, see B3 |
| pequod-wallpapers | public | 15 | C | pequod | vendored pequod.json and CSS Log copy, see B3 |
| tiagojct-site | public | 13 | C | pequod | quartz.config.ts colours; content/projects/pequod/* copies of Pequod theme files (Pequod-color-theme.json, Pequod-light-color-theme.json, Pequod.itermcolors, Pequod.zed.json, pequod.json, pequod.css); content/notes/dataviz/_generate.R uses library(pequod) |
| zettelkasten | public, archived | 1 | C | pequod | src/css/style.css:1 "Pequod Zettelkasten" header comment |
| working-draft | private | 20 | C | glauca | vendored Glauca files, see A2 |
| tiagojacinto.eu | private | 15 | C and D | glauca, pequod, try-works, ambergris, gam.tiagojacinto | theme SCSS pair, chrome.scss, CI check, three project pages, dataviz note (code samples for the pequod R and Python packages, not executed at build) |
| tiagojct.github.io | private | 15 | C and D | pequod, ambergris, try-works | old personal site (CNAME tiagojct.eu, no longer what tiagojct.eu serves): src/projects/{pequod,pequod-quarto,pequod-wallpapers,loomings}/ pages, pequod.css, dataviz note, changelog line about an Ambergris redesign, two SVG and one SCSS comment |
| atlas | private | 6 | C | pequod, try-works | src/assets/css/main.scss "Eleventy theme on the Try-Works design system" (True Lamp and Try-Fire tokens, fonts Fraunces, Literata, Archivo, JetBrains Mono); lib/shiki-pequod.js Pequod Shiki themes; eleventy.config.js imports them |
| blog | private, archived | 6 | C | pequod | lib/shiki-pequod.js and main.scss Pequod code themes |
| cv | private | 5 | C | glauca | templates/styles.typ, templates/quarto-cv.typ, assets/cv.css: local Glauca Pruina copies |
| antedraft | private | 2 | C | glauca | style.css and README: Glauca-informed hand-made CSS |
| promptfather | private | 4 | C | try-works | simplified Try-Works tokens (see A2) |
| rokovoko-feeds | private | 2 | C | pequod | miniflux-pequod.css (Miniflux custom CSS, Pequod palette and Atkinson); CLAUDE.md table row |
| workshop-sw-2ed | private | 3 | C | pequod | styles.css, styles-slides.css, sessao1/slides.qmd |
| ers-learning-resources-director | private | 3 | C | pequod | out/cv-ers-tailored.typ Pequod-style Typst CV; prompt.md names github.com/tiagojct/pequod |
| ia-fmup | private | 1 | C | pequod | ia-fmup/theme.scss "Pequod palette" header, hand copy |
| vellum | private | 1 | C | pequod | _extensions/vellum-core/resources/vellum-html.scss "canonical tokens from github.com/tiagojct/pequod", hand copy |
| ia-saude | private | 2 | D | pequod | CHANGELOG.md and CLAUDE.md record a move from Pequod to GitHub Primer; no current use |
| hermes-knowledge | private | 2 | D | pequod | tiago-projects.md and tiago-preferences.md list a Pequod-themed site and a design preference |
| claude-dotfiles | private | 7 | D | all | plans and skill references (see A2) |
| armilar | private | 1 | D | pequod, try-works | README.md:3 "structural sibling of Try-Works and Pequod" |
| liberceti | private | 98 | N | pequod, try-works, ambergris | Moby-Dick chapters, characters and glossary; own CSS (assets/css/main.css, Libre Caslon, Source Serif); no palette use |
| mobydick-game | private | 9 | N | pequod | the ship in game text and code comments |
| moby-qr | public | 7 | N | pequod, ambergris | src/palettes.js has its own palettes named pequod (gold on obsidian, bg #0c1014) and ambergris (amber on pitch, bg #100d06); name collision only |

Checked with no hits: doubloon (own src/tokens.css blueprint palette), decides3-2627 and mais-2627 (Quarto extension tiagojct/fmup, not Pequod), dotfiles, tiagojct.eu (Hugo with the Winston theme submodule), homebrew-loomings, tiagojct (profile), and 67 others (74 of the 103 scanned repositories have no hit). Organisations: 0 hits.

### B2. The fifteen named repositories

Public repositories (README and file list read).

| Repository | What it takes, from which family | How it is kept in sync |
|---|---|---|
| pequod-quarto | Pequod: Log scale, eight crew accents light and dark, syntax roles (README maps keyword to Ahab and so on), chart custom properties --pequod-chart-1..8 | manual copy: hex values inlined in _extensions/pequod/pequod-variables*.scss; CONTRIBUTING.md:98-99 says the Typst file is "kept in sync by hand"; values equal pequod.json today |
| pequod-wallpapers | Pequod: full pequod.json (Log, accents, roles) and CSS custom-property copy of the Log scale | manual copy: pequod.json (version 0.2.0-alpha) vendored at repository root; CLAUDE.md:23-25 says to copy from tiagojct/pequod and record the upstream commit in README.md; no commit is recorded (unverified) |
| tiagojct-site | Pequod: colour block in quartz.config.ts and downloadable theme files under content/projects/pequod | manual copy; site is not live (tiagojct.eu is now the Hugo site); no README (404) |
| loomings | all four families: 8 palettes in src/palettes.js plus Pequod constants in scripts/render-icon.py and social/instagram | manual copy; comments name the source (src/glauca.json, tokens.json v0.3.0); tests in src/palettes.test.js check contrast |
| homebrew-loomings | nothing (cask for Loomings v1.2.0; homepage loomings.tiagojct.eu) | not applicable |
| subsub | Glauca and Try-Works: 4 pi themes generated by scripts/make-themes.py, web/glauca.css, site CSS copies (glauca.css, try-works.css, typography.css), IBM Plex woff2 copies | script run by hand: python3 scripts/make-themes.py NAME SOURCE.json VSCODE-DARK.json VSCODE-LIGHT.json with paths given on the command line; CSS copied by hand from the generated dist files; themes ship in npm package @tiagojct/subsub (package.json lists themes) |

Private repositories (references and sync only).

| Repository | References | Sync |
|---|---|---|
| tiagojacinto.eu | Glauca: theme/glauca-light.scss, glauca-dark.scss, glauca-light.theme, glauca-dark.theme, chrome.scss (reads --gl-* about 250 times; "ported from glauca dist/css/a11y.css" at line 1261), _quarto.yml, publish.yml, README.md, CLAUDE.md. Gam, Loomings, Pequod: projects/gam/index.qmd (gam.tiagojacinto.eu, repo links to glauca, try-works, ambergris, gam), projects/loomings/index.qmd, projects/pequod-quarto/index.qmd. Ambergris colours in favicon.svg and two SVG figures | manual port from src/glauca.json; CI checks only that light and dark files match each other |
| tiagojct.github.io | Pequod project pages and CSS, Ambergris changelog line, comments | manual; stale |
| working-draft | Glauca vendored (A2) | manual vendoring of generated files |
| atlas | Try-Works tokens in main.scss; Pequod Shiki themes in lib/shiki-pequod.js | manual port |
| armilar | README mention only | none |
| doubloon, dotfiles, decides3-2627, tiagojct.eu | no references | none |

### B3. pequod-quarto and pequod-wallpapers

| Item | pequod-quarto | pequod-wallpapers |
|---|---|---|
| Version | extension version 0.3.1 (both manifests, quarto-required >=1.4.0) | none (no package.json, no release, no tag) |
| Latest release and tags | v0.3.1 (2026-05-26), v0.3.0 (2026-05-26), v0.2.0 (2026-05-12) | none |
| Last commit | c26c9d4, 2026-05-26, "Release v0.3.1: token files as theme entries, kill render warnings" | 6f5162e, 2026-05-12, "Add screenshot to README, update live URL to custom domain" |
| Licence | LICENSE-MIT (rules, themes, Lua, Typst), LICENSE-CC-BY-4.0 (colour values), fonts SIL OFL 1.1 stated in README; GitHub shows "Other"; no OFL text file in the tree | LICENSE-CODE (GitHub detects MIT), LICENSE-IMAGES (CC BY 4.0, mentions a motifs folder that no longer exists) |
| Fonts | Atkinson Hyperlegible Next (Regular, Bold, Italic, BoldItalic TTF and variable woff2 latin and latin-ext) and Atkinson Hyperlegible Mono (same set), bundled, no CDN | Atkinson Hyperlegible Next 400 and 600 and JetBrains Mono 400 and 500 loaded from Google Fonts in index.html; serif fallback Georgia, Crimson Pro |
| Colours | Pequod Log 50 to 950 (#F7F3EE to #0B1720) and eight crew accents (light: ahab #A83732, starbuck #0082B1, queequeg #253E82, pip #6A4A00, ishmael #76716B, stubb #CA6435, tashtego #177C55, daggoo #552823) plus danger; dark set in pequod-variables-dark.scss; Pandoc themes pequod.theme and pequod-dark.theme | full Log scale and accents read from pequod.json at run time (js/palette.js:8); css/style.css repeats the Log scale and starbuck |
| Listed elsewhere | not in the Quarto community listing (mcanouil/quarto-extensions extensions/quarto-extensions.csv has tiagojct/quarto-study-flow but not pequod-quarto); GitHub topic quarto-extension is set; homepage field https://tiagojct.eu/projects/pequod-quarto/ (404 today); own docs site tiagojct.eu/pequod-quarto/ (404 today); project pages in tiagojacinto.eu, tiagojct-site and tiagojct.github.io | live URL in README https://tiagojct.eu/pequod-wallpapers/ (404 today); project pages in tiagojct-site and tiagojct.github.io |
| Formats and notes | four formats: pequod-revealjs, pequod-dark-revealjs, pequod-html, pequod-typst; the tiagojacinto.eu page says three | GitHub Pages workflow deploys the repository root |

## 4. Part C: consolidated consumers table

Rename impact key. Old repositories are archived, not renamed, so their GitHub URLs keep working but point at frozen copies. Names that appear inside copies: CSS prefixes --gl- and --tw-, class .gl-role, files glauca.css, glauca.scss, glauca.theme, glauca-typst.typ, glauca-fonts.css, R and Python helpers theme_glauca, scale_colour_glauca_d, use_glauca, glauca_seq, glauca_div. Copies are frozen, so they keep working until re-synced.

| Consumer | Location | Family | What it uses | Sync | What breaks or needs editing on rename and move | Action at migration |
|---|---|---|---|---|---|---|
| Loomings | github tiagojct/loomings; ~/Projects/loomings | all four | src/palettes.js (8 palettes, labels, mode names Profundum, Pruina, Try-Fire, True Lamp, Below deck, Parchment); README table with 4 repo links; CHANGELOG, docs/index.html, CLAUDE.md prose | manual copy | family keys glauca, tryworks, ambergris are stored in browser storage (src/editor.js:153) and used by tests; a key change resets returning users to Pequod; labels and mode names shown in the Theme menu; repo links in README, docs and palettes comments | decide keys and labels; migrate stored key or keep keys; update links and README table; release |
| subsub | github tiagojct/subsub; ~/Projects/subsub | Glauca, Try-Works | 4 pi themes, web and site CSS copies, IBM Plex fonts | script by hand plus CSS copy | make-themes.py needs token keys sea-* or tint-*, accent, accent-bright, accent-deep, surface, surface-raised, text-muted, border, and VS Code theme scopes; theme ids subsub-glauca and subsub-try-works are used in src/look.ts:28, test/unit.test.ts:421-437 and shipped in the npm package; About page and docs name Glauca, Try-Works and Gam | keep ids or rename in code, tests, docs; re-run generator from monorepo tokens only if Goney or Jungfrau tokens change; update site/src/about.md, docs/Subsub.md, vault notes |
| Sub-Sub site subsub.tiagojacinto.eu | inside subsub repository | Glauca, Try-Works | site CSS and text credits | manual | credits text | same as subsub |
| scrimshaw | github tiagojct/scrimshaw | Glauca | app.css --gl-* properties, accent.json regenerated by go generate | manual port with own accent.json | CLAUDE.md:23 path ~/github/glauca no longer exists | edit wording; optional |
| diagcalc | github tiagojct/diagcalc; npm diagcalc 4.4.1 | Glauca, Pequod | styles.css Glauca values in --log-* and --crew-* slots; tui Pequod dark crew hex | manual copy | nothing (frozen); CHANGELOG link is historical | none |
| intro-computers | github tiagojct/intro-computers | Try-Works | css/base.css, terminal.css, js/deck.js modes cold and lit; local fonts | manual copy | nothing while frozen; if Jungfrau drops the light mode the deck's copy is unaffected | none; optional re-theme |
| promptfather | github (private); ~/Projects/promptfather | Try-Works | +layout.svelte tokens; deck CSS copied by cp -R from intro-computers | manual copy chain | INSTRUCOES.md:307,372 points to ~/Downloads/try-works/ (absent) and ~/github/intro-computers (absent) | edit the source-of-truth note |
| pequod-quarto | github tiagojct/pequod-quarto | Pequod | see B3 | manual | README and docs link github.com/tiagojct/pequod; homepage and docs URLs already 404 | update links to the monorepo path; fix homepage; consider Quarto listing |
| pequod-wallpapers | github tiagojct/pequod-wallpapers | Pequod | pequod.json, CSS Log copy | manual | README and pequod.json homepage link the dead tiagojct.eu page; Pages URL 404 | re-vendor pequod.json from the monorepo path and record the commit; fix links |
| tiagojct-site | github tiagojct/tiagojct-site | Pequod | quartz.config.ts, theme file copies, R script | manual | none functional; not live | none |
| workshop-sw-2ed | github (private); ~/Keynotes/workshop-sw-2ed | Pequod | hand-typed tokens (older alpha values) | manual | none | none; optional re-sync |
| working-draft | github (private); ~/Projects/working-draft | Glauca | see A2 | manual vendoring | CLAUDE.md:41 says Glauca is private (now public) and gives the old repo URL; book chapters 10, 11, 12, 14 and prediction-models name Glauca and use theme_glauca, use_glauca; LICENSE:39 | update note; re-vendor only if Goney changes helper names, then edit generate.py, glauca.py imports, chapter 14 code |
| tiagojacinto.eu | github (private); ~/Websites/tiagojacinto.eu | Glauca (theme); Gam, Loomings, Pequod (pages) | see B2 | manual port | projects/gam/index.qmd (title, URL gam.tiagojacinto.eu, family list, repo links, image gam.png), projects/loomings/index.qmd (table and links), projects/pequod-quarto/index.qmd (links); README.md:3,25 and CLAUDE.md:7 name glauca | rewrite the Gam page as Ensigns with the new URL; update links; theme files need no change |
| ~/Keynotes/2026-09-28_ia-enf-especialistas | local only (no remote) | Glauca 0.1.0 | public/vendor/glauca (8 CSS, 3 woff2, OFL), validate.js hex list | manual copy | provenance commit 1e66632 exists only in the stale local glauca; the GitHub equivalent is 1efbcce (same tree); event already held | none; edit README provenance if wanted; keep out of GitHub-based steps |
| antedraft | github (private); ~/Projects/antedraft | Glauca | Glauca-informed CSS (#007aff mark, IBM Plex) | informal | none | none |
| cv | github (private) | Glauca | Typst and CSS Pruina copies | manual | none | none |
| atlas | github (private) | Try-Works, Pequod | main.scss tokens, Shiki themes | manual | none | none |
| blog | github (private, archived) | Pequod | Shiki themes | manual | none | none |
| tiagojct.github.io | github (private) | Pequod, Ambergris | project pages, CSS, comments | manual | stale pages | none unless revived |
| rokovoko-feeds | github (private) | Pequod | miniflux-pequod.css, pasted into the Miniflux instance (deployment unverified) | manual | none | none |
| ers-learning-resources-director, ia-fmup, vellum | github (private) | Pequod | Typst CV, theme.scss, vellum-html.scss | manual | vellum and prompt.md cite github.com/tiagojct/pequod | update citation comments if desired |
| zettelkasten | github (public, archived) | Pequod | CSS header comment | none | none | none |
| VS Code user settings | ~/Library/Application Support/Code/User/settings.json:70 | Glauca | workbench.colorTheme "Glauca" | user setting | theme label does not match any installed theme | set the Goney theme name after publication, if a VS Code theme is published |
| Vault and memory notes | ~/Obsidian/Powerslave (Systems/Subsub.md, two Ops notes); ~/.claude memory; claude-dotfiles plans | Glauca, Gam, all | documentation | manual | wording | update when convenient |
| gam site infrastructure | outside all repositories (from gam README and deploy files; VPS not inspected) | Gam | Cloudflare DNS CNAME gam in zone tiagojacinto.eu (resolves through Cloudflare, HTTP 200), tunnel ingress and Caddy route on the VPS, compose service /opt/vps/apps/gam, image ghcr.io/tiagojct/gam:latest pulled by watchtower, weekly Monday schedule in build-deploy.yml (last run 2026-09-28, success) | manual and CI | new hostname ensigns.tiagojacinto.eu needs DNS, ingress, Caddy, compose and image name; gam hostname needs a redirect; Actions secrets are absent (0 on all five repositories), so GAM_VENDOR_TOKEN and GAM_DISPATCH_TOKEN are not set and the dispatch job is not installed in the family repositories | replicate the pattern for ensigns; keep gam redirect; stop the old weekly schedule when gam is archived |

### Related but out of scope

| Repository | What it is | Shares architecture that could be reused |
|---|---|---|
| armilar (private) | Portuguese design system, single source src/armilar.json, generators arsenal.mjs and andaime.mjs, outputs CSS, Tailwind preset, Obsidian, Ghostty, VS Code (README and file names only) | yes: one token JSON plus small generators, the same pattern as Glauca and Try-Works; README calls it a structural sibling |
| corposant (private) | design system written as one Python script src/corposant.py producing dist/tokens.json, Zed, VS Code, Ghostty, Claude webview CSS (file names and CLAUDE.md head) | yes: generator producing a tokens.json contract; also the base of the current tiagojct.github.io site |
| doubloon (private) | browser game; own src/tokens.css blueprint palette | no |
| moby-qr (public) | QR generator with its own palettes named pequod and ambergris | no; name collision only |
| quarto-fmup (public) and vellum (private) | Quarto themes and extensions for FMUP; vellum holds a Pequod copy | separate; only the Quarto extension packaging pattern |

## 5. E. Pre-existing problems found on the way

- 404 today: https://tiagojct.eu/projects/pequod/, /projects/pequod-quarto/, /pequod-quarto/, /pequod-wallpapers/, /loomings, /tiagojct-site/. tiagojct.eu now serves the Hugo site (title "Call me Tiago"). These URLs are cited in the pequod README (in scope), pequod.json homepage, pequod-quarto homepage field, pequod-wallpapers README, homebrew-loomings (loomings.tiagojct.eu, not checked).
- Working URLs: https://gam.tiagojacinto.eu/, https://loomings.tiagojacinto.eu/app/, https://tiagojacinto.eu/projects/gam/ (all 200).
- Dangling paths: ~/Downloads/try-works, ~/github/intro-computers, ~/github/glauca, ~/github/promptfather (none exist on this Mac).
- The vault line about MAIS slides using pequod-quarto has no support in mais-2627 or ~/FMUP/MAIS-2627.

## 6. F. Not done

- Content search of the iCloud backup: partly done. The 13 backup clones that are not on GitHub now (ai-in-healthcare, bildad, crows-nest, cuf-pfr-tamega-sousa, hospital-virtual, liber-rosae, micro, msc-mimed-leonor-costa, palestra-ia, quadrant, sera.depende, spiro-r, spirometry-ref-equations) finished after I handed back: 0 hits in 12; cuf-pfr-tamega-sousa has one hit, a regex false positive (.venv/lib/python3.11/site-packages/referencing/tests/test_core.py:238, "registry works"). The github/ clones in the backup were searched only in part (227 files, all in repositories already in section B: liberceti, pequod, working-draft, tiagojct.github.io, loomings, scrimshaw, promptfather, diagcalc, ia-saude, ers-learning-resources-director, zettelkasten). That search was stopped before it reached the rest, for example pequod-quarto and intro-computers. Backup hermes/, Bear notes, Portfolio and Obsidian vaults: names only. Backup ssh folder and hermes auth files: not opened.
- Registry metadata (CRAN, PyPI, npm, VS Code Marketplace, Open VSX URLs and repository fields): not done, outside this part.
- Browsers, Zotero, Vivaldi, Antigravity, Command Code, opencode settings, Miniflux and Mastodon instances, the VPS: not searched (outside the listed config locations or not reachable). Whether Ambergris CSS was pasted into Mastodon is unverified.
- Third-party use (other owners' repositories, package dependents): not done, code search requires an owner qualifier.
- Non-default branches and files over 1.5 MB in other repositories: not done.

## 7. G. Deviations from the read-only rules (please clean up)

- I wrote S/work/local_projects_files.txt (a match list) before I noticed that only S/parts was allowed. I did not touch it again.
- A typo in a redirect created /tmp/x_l (a sorted list of glauca commit hashes). I did not touch it again.
- Files I created inside S/parts: consumers-1.crewpass.txt and the folder consumers-1.work (search outputs and two scan scripts).
- The whole-repository scan streamed every file of each repository into memory, including two small files in the private dotfiles repository (.Renviron, .ssh/config). Nothing was printed or saved except lines matching the search terms (none in that repository).
- gh api calls were reads only. The background scan attempt that failed because the timeout command does not exist on macOS wrote empty result files inside consumers-1.work only.
