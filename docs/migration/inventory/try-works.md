Detailed phase 1 report, written on 2026-09-29 as the evidence behind INVENTORY.md. Paths that start with S/ point into a temporary scratch folder that does not persist; they record what was run. Every other path is relative to the repository root at the commit named in the report.

# try-works: phase 1 inventory

Scope: read-only inventory of tiagojct/try-works at the pinned commit 400dd91402459c124b24c7d0d6248b916639a7dc (2026-08-09). Paths are relative to the repository root. Line numbers refer to that commit. "Unverified" marks anything I did not check.

Method: I read the documents, scripts, token file, hand-written scaffolding and the small generated outputs in full. I inspected the large generated files (VS Code and Zed themes, Obsidian theme.css, the 68 icon SVGs) and the base64 font blobs programmatically, not line by line. I ran the build and the checks only in copies under the scratchpad (work/try-works, and work/try-works-fresh for a build from an empty dist/). The clone at clones/try-works is unchanged (git status is empty). Environment: macOS, Python 3.9.6, Node 24.21.0, quarto and Rscript present, typst and fontTools absent.

Other files I wrote under work/ (the directory is shared with other inventory runs; I touched only these): try-works/, try-works-fresh/, zipcmp/, hexscan.py, hexscan.json, vsce-ls.txt, community-css-themes.json, obs-theme-doc.html.

## 1. Repository facts

### 1.1 Git and GitHub

| Item | Value | Evidence |
| --- | --- | --- |
| Remote | https://github.com/tiagojct/try-works.git | .git/config |
| Default branch | main (the only branch) | git branch -a; gh api repos/tiagojct/try-works/branches |
| Pinned HEAD | 400dd91402459c124b24c7d0d6248b916639a7dc, 2026-08-09 11:39:14 +0100 | git log |
| Commit count | 5 (GitHub API also returns 5) | git rev-list --count HEAD |
| Tracked files | 200: dist 126, src 56, docs 8, root and dot files 10 | git ls-files |
| Authors | one (Tiago Jacinto) | git log |
| Tags | none, locally and on GitHub | git tag -l; gh api repos/tiagojct/try-works/tags returns [] |
| GitHub releases | none | gh release list -R tiagojct/try-works prints nothing; gh api repos/tiagojct/try-works/releases returns [] |
| Visibility | public; created 2026-09-11T09:45:47Z; last push 2026-09-11T09:51:04Z | gh repo view |
| Description, homepage, topics | all empty | gh repo view |
| Licence as detected by GitHub | "Other" (NOASSERTION); GitHub picked LICENSE-CC-BY-4.0 | gh api repos/tiagojct/try-works/license |
| Pages, issues, PRs | Pages not enabled (404); no issues; no PRs | gh api .../pages; gh issue list; gh pr list |
| Submodules, LFS | none | no .gitmodules |
| Executable files | one: src/scripts/subset_fonts.sh (mode 100755) | git ls-files -s |
| Size | 12.55 MB tracked; 12.06 MB of it is src/specimen | wc -c |

The GitHub repository was created on 2026-09-11, after all five commits (2026-06-27 to 2026-08-09). The message of the last commit mentions Forgejo, so the repository was probably hosted elsewhere first. That is an inference; nothing in the tree mentions Forgejo.

### 1.2 Commit history

| Commit | Date | Message | Effect |
| --- | --- | --- | --- |
| e8ee51d | 2026-06-27 | first commit | 90 files, flat layout (BRAND.md, css/, scripts/ at the root). docs/CHANGELOG.md already reaches 1.0.0. |
| 9f33bd4 | 2026-07-05 | Add Try-Works design system styles and typography | Restructure: `docs/` and `src/` created by renames. The generated outputs committed at the root (obsidian/theme.css, print/SPEC.md, python/, quarto/, r/, tailwind/colors.generated.js, the Ghostty theme, typst/colors.typ and poster.typ, the VS Code theme, web/src/css) are deleted; they reappear under dist/ in 1111281. Also deleted: a committed .pyc file and scripts/dist.sh. |
| 1111281 | 2026-07-08 | Add scripts for assembling and generating themes for various platforms | Adds dist/ (committed build output), assemble.sh, generate_obsidian.py, CLAUDE.md. Fixes the CI paths to src/scripts. |
| 97c5438 | 2026-07-09 | Add new icons and a light color theme for Try-Works | 98 files: VS Code Cold theme and icon theme, Zed light, iTerm2, oh-my-zsh, Vivaldi contrast, CHANGELOG "Unreleased". |
| 400dd91 | 2026-08-09 | Remove GitHub Actions workflow (no runner on Forgejo) | Deletes .github/workflows/ci.yml. |

### 1.3 CI

- No workflow file exists at HEAD. .github/ holds only dependabot.yml.
- History of .github/workflows/ci.yml: present in e8ee51d, 9f33bd4, 1111281 and 97c5438; deleted in 400dd91. It ran on push and pull_request, on ubuntu-latest, with actions/checkout v4.2.2 and actions/setup-python v5.3.0 pinned by commit SHA, and four steps: validate.py, generate.py --check, cvd_check.py, check_fonts.py. At 9f33bd4 the paths still said scripts/ although the scripts had moved to src/scripts/; 1111281 fixed them (so CI would have failed for one commit).
- GitHub Actions today: one workflow, "Dependabot Updates" (dynamic), and one run in total (2026-09-11, conclusion failure; cause unverified). No repository workflow has ever run on GitHub.
- The prose still claims CI: CLAUDE.md:25 ("CI rejects it"), CLAUDE.md:44 (links to the deleted file), README.md:217-218, docs/CONTRIBUTING.md:23. At HEAD nothing runs the drift gate or validation automatically; they run only when someone calls make.
- .github/dependabot.yml:1-6: version 2; one ecosystem, github-actions, directory "/", monthly. With no workflows it has nothing to update. There is no npm entry although src/web and dist/tailwind have package.json files.

### 1.4 Licence files

| File | Content | Coverage |
| --- | --- | --- |
| LICENSE-MIT (21 lines) | Full MIT text, "Copyright (c) 2026 Tiago Jacinto" | The file states no scope. README.md:141-142 and CLAUDE.md:68: code (generators, configs, CI, scripts). README.md:222-223 adds "CSS, Tailwind, Typst, web, Obsidian, VS Code". |
| LICENSE-CC-BY-4.0 (10 lines) | A notice, not the legal code: says the palette tokens in try-works.json and the documentation are CC BY 4.0, links the legal code and the human-readable summary, and gives the attribution line "Try-Works palette by Tiago Jacinto, CC BY 4.0." | Palette tokens and documentation. It names try-works.json, which is now src/try-works.json. |
| OFL text | Not shipped anywhere | See section 7. |

- README.md:139-146: "Code (the generators, configs, CI, scripts) is MIT, see LICENSE-MIT. The design itself, the palette, the token values, and the documentation, is CC-BY-4.0, see LICENSE-CC-BY-4.0; attribute Try-Works. The fonts (Fraunces, Literata, Archivo, JetBrains Mono) are not bundled: they are SIL Open Font License and are fetched separately (src/fonts/README.md). If you redistribute subsetted fonts, ship the OFL text alongside them and keep the reserved font names."
- README.md:220-223 ("Licence"): "Tokens and docs CC BY 4.0; code (generator, CSS, Tailwind, Typst, web, Obsidian, VS Code) MIT."
- CITATION.cff:9: "MIT AND CC-BY-4.0".
- src/vscode/package.json:13 and src/tailwind/package.json:18: "license": "MIT" only. Neither dist/vscode nor dist/tailwind contains a LICENSE file (vsce ls lists 75 files and none is a licence; npm pack --dry-run lists 4 files).
- Overlap: the generated theme files are MIT by package.json but contain the palette values, which README calls CC BY. The text does not resolve this. I did not attempt a legal reading.
- README.md:143 says fonts are not bundled. The specimens embed six full fonts (section 7).

### 1.5 CITATION.cff

| Field | Value |
| --- | --- |
| cff-version | 1.2.0 |
| message | "If you use Try-Works, please cite it." |
| title | "Try-Works: a Moby-Dick design system" |
| version | 1.0.0 |
| date-released | 2026-06-27 (the date of the first commit) |
| authors | one: Jacinto, Tiago. No ORCID, no affiliation, no email. |
| DOI | none (no identifiers field) |
| license | "MIT AND CC-BY-4.0" |
| repository-code | https://github.com/tiagojct/try-works |
| url | https://tiagojct.eu |
| keywords | design system, design tokens, colour, typography |

I did not validate the file against the CFF schema (no cffconvert available).

### 1.6 CLAUDE.md and docs

One line each:

| File | Lines | Contents |
| --- | --- | --- |
| CLAUDE.md | 68 | Guidance for Claude Code: what the repo is, layout, the one rule (edit only src/try-works.json), make commands, architecture of the scripts, two-mode and two-tier model, versioning, licensing split. |
| docs/BRAND.md | 34 | Essence, positioning, the Pequod family, personality, the mark (wordmark primary, ember emblem secondary), usage. |
| docs/CHANGELOG.md | 230 | Versions 0.1.0 to 1.0.0, plus an "Unreleased" section of 7 items at lines 5-35 (Vivaldi contrast, oh-my-zsh, Zed light, VS Code icons, VS Code Cold, iTerm2, Obsidian fixes). |
| docs/CODE_OF_CONDUCT.md | 11 | Contributor Covenant 2.1 summary; "report concerns to the maintainer at the address on the project homepage" (no address in the repository). |
| docs/CONTRIBUTING.md | 36 | Single source of truth, checks, how to add a token or surface, style of change. |
| docs/FOUNDATIONS.md | 90 | The philosophical basis: the misreading of chapter 96, the correction, the sea as substance, the maker's bias, the code-tier exception, conviviality threshold, limit of fixing meaning. |
| docs/PRODUCT.md | 42 | Audience of one, weekly-use test, the Quarto gap, scope line. |
| docs/PUBLISHING.md | 29 | Routes for VS Code/Positron, Obsidian, Tailwind, CSS. |
| docs/RELEASING.md | 10 | Five-step release: bump, generate and test, update CHANGELOG and CITATION.cff, tag, publish. |

Quotations follow (markup stripped; omissions marked [...]).

CLAUDE.md:

> (7) Try-Works is a single-source design system (palette, type, spacing, motion, data-viz, print) that compiles to many platform surfaces: CSS, Tailwind, Typst slides/posters, an 11ty starter, Obsidian, a Ghostty terminal preset, a VS Code theme, Quarto themes, and R/Python plot styles. Rooted in Moby-Dick ch. 96: a cold sea is the field, the fire is the one rare load-bearing mark.
>
> (25) src/try-works.json is the only file you edit. make generate rebuilds everything under dist/ from it (and re-emits the web app's CSS in place at src/web/src/css). Hand-editing a generated file is wrong and CI rejects it: generate.py --check regenerates in memory and diffs against the committed files, failing on any drift.
>
> (29) [assemble.sh copies] These copies are NOT drift-gated, so after editing scaffolding in src/, re-run make generate.
>
> (58) Two modes: lit (Try-Fire, dark, scheme: dark) and cold (True Lamp, light, scheme: light). They must keep identical token keys; validate.py enforces parity. CSS emits lit as :root / [data-mode="lit"], cold as [data-mode="cold"].
>
> (59) Tiers: core hues (ground, sea, fire, whale) are the identity and appear everywhere; extended hues (kelp, brick, dusk, tide, shoal) exist only for code/terminal and must not appear on posters, slides, or web.
>
> (60) The deliberate exception: the system keeps fire rare everywhere except the code tier, where colour-blind safety puts fire on keywords.
>
> (62-64) Semver applies to the public surface: CSS custom properties, Tailwind preset keys, the json schema, and the R/Python names. Renaming/removing any is breaking; adding a token is additive; changing a value that alters output is at least minor. To release: bump version in src/try-works.json, run make generate and make test, update docs/CHANGELOG.md, tag.
>
> (66-68) Code (generators, configs, CI, scripts) is MIT; the design (palette, token values, docs) is CC-BY-4.0. Fonts are OFL and are not bundled.

docs/FOUNDATIONS.md:

> (11-19) Chapter 96 of Moby-Dick is a warning against the fire, not a tribute to it. Ishmael steers the Pequod at night while the try-works render blubber. He is held by the glare of the pots and the faces lit in it, loses himself, turns his back to the compass, and almost capsizes the ship before he catches the hitching tiller. Melville's verdict is plain: "Look not too long in the face of the fire, O man." The guide is elsewhere, in "the glorious, golden, glad sun, the only true lamp." The load-bearing thing in the chapter is the steady light you steer by. A system that made the fire its hero had taken the seduction for the substance.
>
> (23-29) Steer by the steady light. The cool field carries the work: the sea, the whale white, the daylight of True Lamp. The fire stays rare, and rare for the reason the chapter gives rather than a reason of taste. To fix on the fire is to be inverted by it. Scarcity here is a discipline rather than a preference, the refusal to steer by what deadens you. The one rule the system already had now has a foundation under it: spend little attention on the amber, because attention spent there is taken from the compass.
>
> (33-38) [...] The cool field is the depth, the part that holds weight and darkness both, never a backdrop waiting for an accent. This is why the sea, and not the fire, is the signature of the system. [...] the quiet, cold, four-step sea is the part that is actually yours and the part that does the carrying.
>
> (42-46) The system makes the fire-night its primary mode and leaves the sun as the alternate. The chapter prefers the sun. The dark-first default is evidence that its author likes the night, as Ishmael did, and that is worth admitting rather than dressing as neutrality. Try-Fire is first here because of a preference, not because the night is truer.
>
> (50-56) The code theme puts the fire on every keyword, which makes it frequent, which the ethic of scarcity forbids. The system does it anyway, and the reason belongs in the open. Amber against blue is the one pairing that protan, deutan, and tritan vision all separate; putting keywords in amber serves colour-blind readers, and keeping the metaphor pure would not. An obligation to persons outranks fidelity to an image. So the rule yields there, once, on purpose. Naming the exception is what keeps the system principled instead of merely rigid.
>
> (60-71) By Illich's measure the good in this project is that it can be owned. One plain-text source, open formats, no service to depend on, a build a single person can read and change. [...] Past a threshold a tool asks for more tending than it returns, and the person starts to serve the apparatus. Seven surfaces, a generator, a drift check, a colour-vision pass. The question for the eighth surface is whether it will be reached for in an ordinary week, not whether it can be built. [...] Completeness is not a virtue a tool is owed.
>
> (75-82) [...] To pin whale white to a single value is to attempt the thing the book says cannot be done, and it is worth doing only while the doing stays honest: the alpha, the version number, the hexes that may still move. A token is a convenience, not a capture, and the system should wear its incompleteness where the reader can see it.
>
> (86-90) [...] The error state, the empty screen, the True Lamp paper that still shows the cold sea under it, deserve the same care as the bright headline. The test is whether the system can go dark without going false.

docs/BRAND.md:

> (4-5) The fire is the one hot mark on a cold field. Everything follows: the cold sea is the default ground, the amber is rare and load-bearing.
>
> (8-9) A Moby-Dick design system for an academic-maker's whole output: websites, slides, posters, code, and plots. Literate and restrained, warm where it counts.
>
> (12-16) pequod is the read-first code palette, a sibling tuned for editors. Try-Works is the broader identity, named for the deck furnace of chapter 96 where the catch is rendered. Try-Works is the house; pequod is the room where code is read. Both belong to one named world, the Pequod's voyage, which is why the tools around them carry the same names: Nantucket, Liber Ceti, Bildad, Queequeg.
>
> (19-20) Crafted, plain-text, convivial in the sense Illich and Postman meant. Not corporate, not trend-chasing. Terse in voice, pre-AO90 in Portuguese, no emoji.
>
> (23-26) The identity is type-forward. The primary mark is the wordmark, Try-Works set in Fraunces display with WONK on. The secondary mark is the ember emblem: a single flame over a cold horizon, the rule made into a glyph, for favicons and avatars (assets/logo.svg lit, assets/logo-cold.svg).
>
> (31-34) Fire is rare: one hot mark per surface. The cold field is the default ground. Lead with the wordmark; reach for the emblem only where a square mark is needed. Below about 24 px the emblem's flame can stand alone, without the horizon.

docs/PRODUCT.md:

> (4-9) An audience of roughly one, honestly: an academic-maker who ships websites, slides, posters, code, and statistical plots, in R and Python and Quarto and Typst and 11ty, with a Moby-Dick aesthetic. Others may adopt it, but the design target is that workflow. Naming the user this plainly changes the scope rule: a surface earns its place only if it is used in that workflow, or clearly will be. Everything else is maintenance debt wearing a feature's clothes.
>
> (11-13) From the foundations, after Illich: keep what is touched often and convivial; question what sits idle.
>
> (15-31) Core, touched weekly: R ggplot2 and Python matplotlib; Typst slide theme; the CSS layer and the 11ty web starter; the VS Code / Positron theme. Maintained: Typst poster preset and the print spec. "Also core, now confirmed in use": Tailwind preset, Obsidian theme, Ghostty terminal theme. "With every surface confirmed, nothing is pruned. The scope discipline shifts from cutting to holding the line: no new surfaces beyond the one gap below."
>
> (33-37) Quarto. Documents, papers, and much of the site run through Quarto, and the system has no Quarto theme [...]. That is the single highest-value thing to build next [...].
>
> (39-42) Stop adding surfaces. The token core is complete and well-tested. The next move is the Quarto theme. After that, 1.0: freeze the public surface and commit to the versioning policy.

Note that Zed, iTerm2, oh-my-zsh, Vivaldi and the VS Code icon theme were added after these notes and are not listed in src/try-works.json product.tiers (lines 684-702), nor in PRODUCT.md.

### 1.7 Makefile, .editorconfig, dependabot, other dotfiles

Makefile targets (Makefile:1-44; default goal is help):

| Target | Recipe |
| --- | --- |
| help | greps the "## " comments and prints them |
| generate | python3 src/scripts/generate.py, then sh src/scripts/assemble.sh |
| css, tailwind, dist, all | aliases of generate |
| demo | typst compile src/typst/demo.typ demo.pdf (needs typst and the fonts) |
| clean | rm -rf src/web/_site demo.pdf |
| cvd | python3 src/scripts/cvd_check.py |
| validate | python3 src/scripts/validate.py |
| check | python3 src/scripts/generate.py --check |
| test | validate, then check |
| fonts-check | python3 src/scripts/check_fonts.py |
| fonts | sh src/scripts/subset_fonts.sh |

No target builds the specimens, runs npm, lints, or tags a release.

Other files:

- .editorconfig: root; utf-8, lf, final newline, trim trailing whitespace, 2-space indent; Makefile uses tabs; Python files use 4 spaces.
- .gitignore: node_modules/, _site/, PDF files (the pattern is a star followed by .pdf), .DS_Store. It does not exclude src/web/package-lock.json (npm install creates one; none is committed).
- .vscode/settings.json: "makefile.configureOnOpen": false.
- .github/dependabot.yml: see 1.3.

## 2. Versions

| Location | Value | Agrees |
| --- | --- | --- |
| src/try-works.json:3 | "1.0.0" | source of truth |
| src/vscode/package.json:5 and dist/vscode/package.json:5 | 1.0.0 (dist copy is stamped by generate.py) | yes |
| src/obsidian/manifest.json:3 and dist/obsidian/manifest.json:3 | 1.0.0 (minAppVersion 1.0.0 on line 4 is Obsidian's version, unrelated) | yes |
| src/tailwind/package.json:3 and dist/tailwind/package.json:3 | 1.0.0 | yes |
| CITATION.cff:7 | 1.0.0; date-released 2026-06-27 (line 8) | yes; edited by hand |
| docs/CHANGELOG.md:37 | heading "1.0.0" with no date; "Unreleased" heading at line 3 | yes; edited by hand |
| README.md:150 | "As of 1.0 the public surface is frozen" | yes |
| CLAUDE.md:62 | "public surface is frozen at 1.0" | yes |
| src/try-works.json:703-704 | "Quarto closed the last gap in 0.19.0." and "1.0 released" | yes |
| docs/PRODUCT.md:41 | "After that, 1.0: freeze the public surface" (future tense) | stale wording |
| src/web/package.json | no version field ("private": true) | n/a |
| Git tags, GitHub releases | none | 1.0.0 does not identify a commit |
| Other numbers that look like versions | Vivaldi settings.json "version": 1 (theme schema), Zed $schema v0.2.0, engines.vscode ^1.70.0 | unrelated |

- generate.py:898-901 (stamp_version) copies the JSON version into the three manifests. CITATION.cff and CHANGELOG carry the version by hand (docs/RELEASING.md:5), so the generator single-sources the JSON plus three manifests, and two more files can drift.
- All version strings agree at 1.0.0. The tree is nevertheless ahead of 1.0.0: CHANGELOG "Unreleased" (lines 3-35) lists the VS Code Cold theme, the icon theme, Zed light, iTerm2, oh-my-zsh and Vivaldi changes. dist/vscode/package.json (stamped 1.0.0) already contains the iconThemes entry and the Cold theme.
- docs/CHANGELOG.md:43 says 1.0.0 has "29 generated files"; the drift gate now covers 107.

## 3. Token file src/try-works.json

19,197 bytes, 707 lines, 456 leaf values (345 strings, 66 integers, 45 floats; no booleans, no nulls), maximum depth 6. Non-ASCII characters are written as \uXXXX escapes.

### 3.1 Outline

```
name, version, description, signature, notes, colorspace      strings (lines 2-5, 252, 455)
tiers      { core: string, extended: string }                                  6-9
modes      { lit | cold : { label, scheme, 15 colour roles } }                 10-49
palette    { ground{4}, sea{4}, fire{3}, whale{3}, extended{5} }  19 hex       50-80
code       { 11 roles : { color, style? } }   style on comment, keyword, type  81-118
terminal   { note, background, foreground, cursor, cursor-text,
             selection-bg, selection-fg, ansi[16] }                            119-145
type       { serif | sans | mono : { family, license, roles[2], axes:string },
             scale : { ratio, base, steps{10}, leading{4}, weight{4} } }       146-202
spacing    { unit, scale{13}, radius{5}, border }                              203-228
accessibility { standard, lit{5 ratios}, cold{5 ratios}, cvd, rules[3] }       229-251
typography { note, fonts{serif,sans,mono,reading : {family, axes{name:[min,max]}}},
             fluid{min-vw,max-vw}, measure{3}, features{4},
             roles{10 : font, size|fluid[2], weight, leading, opsz?, wonk?, soft?,
                   tracking?, features?, measure?, wrap?, transform?} }        253-441
gamut      { note, p3 : { lit | cold : { accent, accent-bright } } }           442-454
i18n       { unicode-range, note, quotes }                                     456-460
dataviz    { note, categorical{name,colors[7]}, sequential{name,colors[7]},
             diverging{name,colors[9]}, plot{light|dark:{bg,panel,text,grid,muted,accent}},
             fonts{base,title,mono}, shapes{name, matplotlib[7], ggplot_pch[7], linetypes[7]} }  461-554
print      { note, profile, ink_limit, rich_black{recipe,note}, cmyk{12}, gamut_risk[5],
             spot, bleed_mm, safe_mm, sizes_mm{4} }                            555-593
a11y       { note, focus{lit,cold,width,offset}, contrast_more{lit|cold:{text-muted,border}} }  594-612
performance{ note, subset_range_ref, payload_kb{5}, fallbacks{4 : fallback,size_adjust,ascent,descent,line_gap} }  613-653
motion     { note, durations{4}, easings{4} }                                  654-668
brand      { essence, tagline, family{pequod,try-works}, mark{primary,emblem}, note }  669-681
product    { audience, tiers{core[10],maintained[2],confirm[]}, top_gap, scope, note }  682-706
```

Value types: hex strings (123 leaves), CSS lengths and clamp() strings, CSS colour() strings (4, in gamut.p3), CMYK strings (12, in print.cmyk), prose strings, numbers for ratios, weights, optical sizes and metrics.

### 3.2 Modes: names and labels

| Key | label | scheme | Notes |
| --- | --- | --- | --- |
| lit (line 11) | Try-Fire | dark | CSS: :root and [data-mode="lit"] |
| cold (line 30) | True Lamp | light | CSS: [data-mode="cold"] |

There are three mode vocabularies in the file:

- lit and cold: modes, gamut.p3, a11y.focus, a11y.contrast_more, accessibility.
- light and dark: dataviz.plot (lines 501-518); the R and Python APIs also take "light" or "dark".
- dark and light: the values of the scheme key inside each mode.

The label field already acts as a display label and scheme as the neutral name. Try-Fire and True Lamp also appear in output names: VS Code "Try-Works Cold (True Lamp)" (src/vscode/package.json:26), Zed "Try-Works (Try-Fire)" and "Try-Works (True Lamp)", Vivaldi "Try-Works (True Lamp)", and file names starting Try-Works-Cold, try-works-cold.zsh-theme, dist/vivaldi/lit and dist/vivaldi/cold. "Try-Fire" occurs 48 times in 31 files, "True Lamp" 58 times in 32 files.

### 3.3 Mode colour roles (15 per mode)

| Role | lit | Palette entry equal to the lit value | cold | Palette entry equal to the cold value |
| --- | --- | --- | --- | --- |
| bg | #12161b | ground.pitch | #dee7e4 | whale.bone |
| surface | #1b2127 | ground.hold | #e7efeb | none |
| surface-raised | #232b32 | ground.deck | #f2f7f4 | none |
| text | #f1efe9 | whale.whale | #18272b | none |
| text-muted | #97a0a4 | whale.gull | #52646a | none |
| border | #2c3640 | none | #c4d2cd | none |
| accent | #c9651d | fire.ember | #9e5017 | none |
| accent-bright | #e0832a | fire.flame | #b85f1c | none |
| accent-deep | #9a4a16 | fire.oil | #7a3a10 | none |
| on-accent | #11151a | ground.iron | #eef3f0 | none |
| sea-deep | #14242c | sea.trough | #16242b | none |
| sea | #2c4953 | sea.swell | #264852 | none |
| sea-bright | #4d7680 | sea.spray | #3d6b76 | none |
| sea-pale | #8fb6bd | sea.foam | #b4ccc9 | none |
| on-sea | #0f1c22 | none | #eef3f0 | none |

Background, body text and muted text, from the file:

| Mode | bg | text | text-muted |
| --- | --- | --- | --- |
| lit (Try-Fire, dark) | #12161b (line 14) | #f1efe9 (line 17) | #97a0a4 (line 18) |
| cold (True Lamp, light) | #dee7e4 (line 33) | #18272b (line 36) | #52646a (line 37) |

Computed by me from those values: lit text on bg 15.79:1, muted on bg 6.82:1; cold text on bg 12.21:1, muted on bg 4.91:1.

### 3.4 Palette (lines 50-80): 19 entries

OKLCH hue (H, degrees) is computed by me from the hex value; it is not in the file.

| Group | Name | Hex | Lit role with the same value | OKLCH H | Colour family |
| --- | --- | --- | --- | --- | --- |
| ground | pitch | #12161b | bg | 254 | cool near-black |
| ground | hold | #1b2127 | surface | 248 | cool near-black |
| ground | deck | #232b32 | surface-raised | 245 | cool near-black |
| ground | iron | #11151a | on-accent | 254 | cool near-black |
| sea | trough | #14242c | sea-deep | 231 | blue-teal |
| sea | swell | #2c4953 | sea | 222 | blue-teal |
| sea | spray | #4d7680 | sea-bright | 215 | blue-teal |
| sea | foam | #8fb6bd | sea-pale | 210 | blue-teal |
| fire | ember | #c9651d | accent | 51 | orange |
| fire | flame | #e0832a | accent-bright | 59 | orange |
| fire | oil | #9a4a16 | accent-deep | 49 | dark orange |
| whale | whale | #f1efe9 | text | 92 | warm off-white |
| whale | bone | #dee7e4 | (cold bg) | 174 | pale green-grey |
| whale | gull | #97a0a4 | text-muted | 226 | cool grey |
| extended | kelp | #86a87f | none | 140 | green |
| extended | brick | #d06a52 | none | 34 | red |
| extended | dusk | #a487ba | none | 310 | violet |
| extended | tide | #5f93b0 | none | 234 | blue |
| extended | shoal | #5f97a0 | none | 209 | cyan |

The palette block is the dark-mode palette plus bone (the light background). Fourteen of the fifteen light-mode colours exist nowhere in the palette block.

### 3.5 Flame and Oil in the light mode

Short answer: neither exists as an entry in the light mode.

- modes.cold (lines 30-48) has no key called flame or oil. Both names exist only in palette.fire (lines 63-67), and the palette is not mode-scoped. Its values are the dark-mode ones: flame #e0832a equals modes.lit.accent-bright (line 21); oil #9a4a16 equals modes.lit.accent-deep (line 22); ember #c9651d equals modes.lit.accent (line 20).
- The light mode holds three fire values under role names: accent #9e5017 (line 39), accent-bright #b85f1c (line 40), accent-deep #7a3a10 (line 41). None of them is in the palette block. By role, the light equivalents are: ember-role #9e5017, flame-role #b85f1c, oil-role #7a3a10.
- How the generators treat the two names in light outputs:
  - generate.py:576 (shared light remap for VS Code Cold and Zed True Lamp): ember to cold accent #9e5017; flame to cold accent-deep #7a3a10; oil to cold accent-deep #7a3a10. Flame and Oil collapse to one light value.
  - Raw dark values used in the light mode: the Obsidian .theme-light block (dist/obsidian/theme.css:339-547) uses Flame #e0832a for --color-yellow, --callout-warning and --canvas-color-3 (lines 357, 528, 545) and Ember #c9651d for --color-orange. The Ghostty, iTerm2, VS Code Cold and Zed True Lamp presets keep ANSI 11 (bright yellow) at Flame #e0832a (for example dist/vscode/themes/Try-Works-Cold-color-theme.json:508).
  - Tailwind (dist/tailwind/colors.generated.js): fire.flame #e0832a and fire.oil #9a4a16 are single values with no mode variants.
  - Print (src/try-works.json:563-576): cmyk has flame, oil and one "cold-accent" entry. No light flame or oil.
  - CSS: there is no --tw-flame or --tw-oil variable; the mode variables are --tw-accent, --tw-accent-bright and --tw-accent-deep.
- gam's adapter (see section 9) treats ember, flame and oil as the three core fire ids.

### 3.6 Code (syntax) roles (lines 81-118)

Defined once, tuned for the dark background only (generate_obsidian.py:78-79 says so).

| Role | Hex | Palette entry | Style | Colour family |
| --- | --- | --- | --- | --- |
| comment | #97a0a4 | whale.gull | italic | cool grey |
| keyword | #c9651d | fire.ember | bold | orange |
| string | #86a87f | extended.kelp | none | green |
| number | #a487ba | extended.dusk | none | violet |
| function | #5f93b0 | extended.tide | none | blue |
| type | #5f97a0 | extended.shoal | italic | cyan |
| decorator | #d06a52 | extended.brick | none | red |
| variable | #f1efe9 | whale.whale | none | off-white |
| parameter | #cdd2d3 | none (literal) | none | grey |
| operator | #aeb6b8 | none (literal) | none | grey |
| punctuation | #8a9296 | none (literal) | none | grey |

### 3.7 Terminal (lines 119-145), dark only

Fields: background #12161b, foreground #f1efe9, cursor #c9651d, cursor-text #11151a, selection-bg #2c4953, selection-fg #f1efe9, note "ANSI 16-colour (lit). red, green, magenta derived in-register; yellow follows the fire."

| Index | Name | Hex | Palette entry |
| --- | --- | --- | --- |
| 0 | black | #1b2127 | ground.hold |
| 1 | red | #c05a3a | literal |
| 2 | green | #6f8f6a | literal |
| 3 | yellow | #c9651d | fire.ember |
| 4 | blue | #46708a | literal |
| 5 | magenta | #8a6f9e | literal |
| 6 | cyan | #5f97a0 | extended.shoal |
| 7 | white | #c9ccce | literal |
| 8 | bright black | #3a4754 | literal |
| 9 | bright red | #d06a52 | extended.brick |
| 10 | bright green | #86a87f | extended.kelp |
| 11 | bright yellow | #e0832a | fire.flame |
| 12 | bright blue | #5f93b0 | extended.tide |
| 13 | bright magenta | #a487ba | extended.dusk |
| 14 | bright cyan | #8fb6bd | sea.foam |
| 15 | bright white | #f1efe9 | whale.whale |

The light Ghostty and iTerm2 presets reuse this ANSI set unchanged (generate.py:128-137, 171-182). Computed by me, ANSI colour on the True Lamp background #dee7e4: white 1.28:1, bright white 1.10:1, bright cyan 1.74:1, bright green 2.10:1; 10 of 16 entries are below 3:1 and 14 of 16 are below 4.5:1 (only black 12.88 and bright black 7.54 pass). Not checked visually.

### 3.8 Status colours

The file has no status block. Generators assign them:

| Meaning | Colour | Where |
| --- | --- | --- |
| error, deleted | extended.brick #d06a52 | generate.py:337, 355, 843, 846 |
| warning, modified | fire.ember #c9651d | generate.py:337, 844, 847 |
| info, renamed, links | extended.tide #5f93b0 | generate.py:337, 356, 845, 848 |
| success, added | extended.kelp #86a87f | generate.py:354, 850 |
| hint | extended.shoal #5f97a0 | generate.py:849 |
| conflict | extended.dusk #a487ba | generate.py:841 |

The Obsidian callouts use flame for "warning" and ember for "summary" and "important" (generate_obsidian.py:52-60).

### 3.9 Extended hues and the blues

Extended tier (palette.extended, lines 73-79): kelp green, brick red, dusk violet, tide blue, shoal cyan. tiers.extended (line 8) says: "a derived green (kelp), red (brick), violet (dusk), plus a blue (tide) and cyan (shoal) drawn from the sea."

Entries that are blues, by the file's own naming: extended.tide #5f93b0 (blue; code.function), extended.shoal #5f97a0 (cyan; code.type), terminal ANSI 4 and 12 (blue: #46708a, #5f93b0) and ANSI 6 and 14 (cyan: #5f97a0, #8fb6bd).

Entries that are blue-teal by hue (OKLCH H 209 to 237, computed by me):

- The whole sea group: trough #14242c, swell #2c4953, spray #4d7680, foam #8fb6bd, and their lit mode aliases sea-deep, sea, sea-bright, sea-pale, plus on-sea #0f1c22 (H 229).
- The cold sea ramp: #16242b, #264852, #3d6b76 (H 231, 219, 215) and #b4ccc9 (H 188, greener).
- Cool neutrals with a blue cast (chroma at most 0.024): ground pitch, hold, deck, iron (H 245-254), lit border #2c3640 (H 249), gull #97a0a4 (H 226), cold text #18272b (H 216), cold text-muted #52646a (H 220).
- Data-viz: categorical #0072B2 and #56B4E9 (Okabe-Ito blue and sky blue), all 7 sequential steps (teal, H about 210-225), and the teal half of the diverging scale.

Nothing in the file states a rule for how blues may be used, other than the tier rule (extended hues, including tide and shoal, only for code and terminal) and the sea group being the field.

### 3.10 Metadata blocks

name, version, description (stale: lists six surfaces, line 4), signature (line 5), notes (release-note prose for 0.5.0, line 252), tiers, colorspace (line 455), i18n (unicode-range and quotes), brand (line 669-681), product (line 682-706), accessibility (ratios and rules), performance (payload sizes, font fallback metrics), motion, print, a11y.

### 3.11 References between values, and duplication

- The file has no reference syntax. The only reference-like value is performance.subset_range_ref = "i18n.unicode-range" (line 615), and no script reads it.
- Every colour is typed again wherever it is needed. Of 126 hex occurrences in the file, 19 are in the palette block and 107 are outside it. Of those 107, 44 are exact copies of a palette value (modes 14, code 8, terminal 16, dataviz 5, a11y 1) and 63 are values that are not in the palette (modes 16, code 3, terminal 6, dataviz 30, print 3, a11y 5; the three in print are prose mentions inside gamut_risk strings).
- Lit-mode colours: 13 of 15 are palette copies (border and on-sea are not). Light-mode colours: 1 of 15 (bg).
- type.serif, type.sans and type.mono repeat the family names held in typography.fonts (lines 146-173 against 255-313).

### 3.12 Other observations about the file

- Name collision: spacing.border is "1px" (line 227) and the border key inside each mode is a colour (lines 19, 38). Both become the CSS variable --tw-border. dist/css/try-works.css:43 declares 1px, then lines 54 and 72 redeclare it as a colour in the same :root cascade. src/web/src/css/site.css:41-42 uses var(--tw-border) as both width and colour. By CSS rules that declaration is invalid; I did not render it in a browser (unverified).
- accessibility.cold "button on fire" is 5.05 (line 242). I compute 5.18 (cold on-accent on accent), and validate.py prints 5.18. Other listed ratios match.
- The file describes itself as shipping six surfaces (line 4); it ships more (section 6).

## 4. Design rules and roles that must be told apart

### 4.1 Rules, their sources and how they are enforced

| # | Rule (quoted or condensed) | Source | Enforced by |
| --- | --- | --- | --- |
| R1 | "Fire is rare: one hot mark per surface. The cold field is the default ground." | docs/BRAND.md:32; README.md:14-15; docs/FOUNDATIONS.md:23-29; src/try-works.json:5, 670; docs/CONTRIBUTING.md:34-36; src/typst/demo.typ ("One accent per slide"); src/specimen/specimen.html:195 ("one accent per view") | Prose only. In practice: Obsidian puts the accent on links, tags, checkboxes, focus, collapsed markers and top-level list bullets (generate_obsidian.py:201-203, 440-442, 453-454, 470-472; the bullet choice is called "an explicit owner call"); the icon theme uses fire hues on 3 of 46 monogram icons (js and json in flame, readme in ember; generate.py:642, 645, 671) although its comment says "README carries the one rare fire mark" (generate.py:633); VS Code uses ember for cursor, focus, buttons, badges, active tab border and one bracket colour (generate.py:332-352). |
| R2 | The cold sea is the field and the substance; the sea, not the fire, is the signature. | docs/BRAND.md:4-5; README.md:12-13; docs/FOUNDATIONS.md:31-38 | Prose only. |
| R3 | The code tier is the one deliberate exception: fire goes on keywords, for colour-blind readers. | docs/FOUNDATIONS.md:48-56; README.md:14-17; CLAUDE.md:60; src/try-works.json:248 ("Fire-rare is an identity-tier rule; the code tier follows accessibility-first syntax logic with fire on keywords.") | Implemented in data (code.keyword = ember, bold); the rule itself is prose. |
| R4 | Core hues (ground, sea, fire, whale) everywhere. Extended hues (kelp, brick, dusk, tide, shoal) only for code and terminal; "never appear on posters, slides, or the web". | CLAUDE.md:59; README.md:19-24; src/try-works.json:6-9 | Prose only. Divergences: Obsidian uses all five extended hues for callouts, graph and canvas (generate_obsidian.py:28-34, 58-60, 231-240); VS Code chrome uses tide for links and info (generate.py:337, 356); the icon theme uses extended hues (generate.py:632). |
| R5 | "Amber fills on the sea use flame with dark iron text (ember on sea is below 3:1)." | src/try-works.json:247 | Partly: validate.py:74 checks lit flame on sea at 3.0 (measured 3.41). Not checked: iron on flame (6.50). I compute ember on sea 2.45, so the claim is right. |
| R6 | "Borders are deliberately faint; lift only if visible separators are wanted." | src/try-works.json:249 | Prose only. |
| R7 | Contrast floors: body 4.5:1, large text and UI 3:1 (WCAG 2.1). | src/try-works.json:230; README.md:97, 197; docs/CONTRIBUTING.md:35 | validate.py:68-90, 13 pairs, listed in 4.5. Nothing checks the code-role colours, the ANSI set, data-viz colours, sea-pale on sea, or on-sea on sea. |
| R8 | Hovers brighten in the dark mode and darken in the light mode. | validate.py:75-79; generate_obsidian.py:370-374; generate.py:563-565 | Two pairs only: lit accent-bright on bg (6.44), cold accent-deep on bg (6.83). |
| R9 | Both modes keep identical token keys; lit scheme is dark, cold scheme is light. | CLAUDE.md:58 | validate.py:16-22. |
| R10 | Syntax hues stay distinguishable under protan, deutan and tritan vision; close pairs are reinforced with weight and italics, not colour alone. | README.md:197-201; src/try-works.json:245; docs/FOUNDATIONS.md:50-56 | Report only. cvd_check.py:24-28 prints the three worst pairs per deficiency and always exits 0; its "under 10, reinforced" text is a label, not a gate. The reinforcement is data (comment italic, keyword bold, type italic; lines 82-102) and is untested. Pair data in 4.4. |
| R11 | Categorical data-viz colours are colour-blind safe (Okabe-Ito) and data is never encoded by colour alone. | README.md:61-69, 106-108; src/try-works.json:462-465; docs/CHANGELOG.md:107-108 | validate.py:48-58 checks only that the colours are valid 6-digit hex and that plot has light and dark. |
| R12 | Type: optical size follows point size; WONK and SOFT only on display and headline roles; oldstyle proportional figures in text, lining tabular in data; body measure 68ch. | README.md:178-183; src/try-works.json:254 | validate.py:35-46 checks that a role's font exists, size or fluid is present, leading is numeric, measure is defined, and opsz is inside 9-144. Not the WONK and SOFT confinement or the figure rule. |
| R13 | Generated files are never edited by hand. | CLAUDE.md:25; docs/CONTRIBUTING.md:5-10 | generate.py --check (generate.py:962-977) for 107 files, when someone runs it (no CI at HEAD). Not for the 23 scaffold copies or the 2 Vivaldi zips (CLAUDE.md:29). |
| R14 | "Motion marks a change; it does not decorate." | src/try-works.json:655; README.md:126-127 | Prose only. |
| R15 | Semver on the public surface (CSS custom properties, Tailwind keys, JSON schema, R and Python names). | CLAUDE.md:62-64; README.md:148-157 | Prose only. No tag, no API diff test. |
| R16 | Licensing split: code MIT, design CC BY 4.0, fonts OFL not bundled. | CLAUDE.md:66-68; README.md:139-146 | Prose only. |
| R17 | Scope: a surface must earn its place by weekly use; "Stop adding surfaces". | docs/PRODUCT.md:4-9, 30-31, 39-42; docs/FOUNDATIONS.md:65-71 | Prose only. |
| R18 | Obsidian callouts: warning uses yellow, not orange; only 2 of 14 callout types use the fire hue "so the rarity holds". | generate_obsidian.py:53-57 | Implemented in the mapping; not tested. |
| R19 | Vivaldi: fire stays off the whole window (accentOnWindow false). | generate.py:241-243 | Implemented; not tested. |
| R20 | oh-my-zsh: "the whole prompt is cool sea; the ember fire lights in exactly one place, the git-dirty mark"; a failed command uses brick, "a distinct signal, not the brand fire". | generate.py:186-190 | Implemented; not tested. |

### 4.2 Justification for dark-room use

I found no passage that justifies Try-Works for use in a dark room. The nearest text:

- README.md:7-8: "Try-Fire (dark, the furnace at night)". docs/FOUNDATIONS.md:12: Ishmael "steers the Pequod at night". src/specimen/specimen.html:195: "Try-Fire is the dark mode, the furnace at night."
- docs/FOUNDATIONS.md:42-46 (quoted in 1.6) presents the dark-first default as the author's preference and says "not because the night is truer".
- generate_obsidian.py:413-418, the only comment about reading comfort in a dark theme: "Reading weight, per mode: bright text on the near-black lit bg optically thins (halation), so the dark body reads at a hair over regular to hold its colour; the light bg has no halation, so cold stays at the true 400." The output is --tw-body-weight 430 (dark) and 400 (light).
- The documents describe True Lamp as the natural sun: README.md:8 ("the natural sun on cold water"), README.md:12-13 ("the True Lamp daylight"), docs/FOUNDATIONS.md:15-17, 24-25, 88-89, src/try-works.json:5, src/specimen/specimen.html:195 ("a sea-salt paper, the fire banked to a single mark"). docs/CHANGELOG.md:213-214 records the light mode as "a sea-salt paper in the teal family". The light background #dee7e4 is a pale green-grey (OKLCH H 174).

### 4.3 Claims about blue light, sleep and contrast

- Blue light, sleep, melatonin, circadian rhythm, eye strain, health effects: no claim anywhere in this repository. I searched all tracked text in English and Portuguese (sleep, melatonin, circadian, blue light, sono, luz azul, fadiga and related words), including the specimens with their font blobs stripped.
- The only claim in that area is about a typeface: docs/CHANGELOG.md:145, "a lower-contrast workhorse reduces fatigue". Related: src/fonts/README.md:35-36 ("built for sustained screen reading. Measured stroke contrast 1.67 against Fraunces 2.60"), src/try-works.json:312, src/specimen/reading-comparison.html:17 ("Lower contrast and larger x-height favour long-form reading"). The stroke-contrast and x-height figures (Fraunces 2.60 and 0.482, Literata 1.67 and 0.507, Source Serif 4 1.82 and 0.475) have no script in the repository behind them (unverified).
- Contrast ratios stated: src/try-works.json:231-244 (lit: whale on pitch 15.79, gull on pitch 6.82, fire on pitch 4.64, iron on fire 4.68, foam on pitch 8.3; cold: ink on paper 12.21, muted on paper 4.91, fire on paper 4.61, button on fire 5.05, sea-bright on paper 4.67); README.md:97-104 (focus ring 3:1, prefers-contrast raises muted text to 7:1 and borders to 3:1), README.md:197 ("Every body pair clears WCAG-AA in both modes"); docs/CHANGELOG.md:30, 104, 168, 194-195 (3.55, 3.36, 3.03, 4.61). All match my recomputation except the 5.05.

### 4.4 Syntax hue pairs that fail a dE 10 threshold

cvd_check.py compares 7 roles (keyword, string, number, function, type, decorator, comment) with the Machado-2009 matrices at full severity. I re-ran it. Pairs below dE 10:

| Deficiency | Pairs below 10 (dE) |
| --- | --- |
| protan | number/function 6.9, type/comment 7.0, function/type 9.9 |
| deutan | number/function 4.1, number/type 9.5 |
| tritan | function/type 2.1, keyword/decorator 4.5, string/comment 8.6 |

Under normal vision function/type (blue against cyan) is 12.0. Keyword/function (amber against blue) is 70.4 protan, 78.9 deutan and 90.4 tritan, which supports FOUNDATIONS.md:52-53. variable, parameter, operator and punctuation are not in the check.

### 4.5 The 13 contrast pairs validate.py enforces (validate.py:68-85)

lit: text/bg 15.79, muted/bg 6.82, accent/bg 4.64, on-accent/accent 4.68, sea-pale/bg 8.30 (all need 4.5), accent-bright/sea 3.41 (needs 3.0), hover accent-bright/bg 6.44. cold: hover accent-deep/bg 6.83, text/bg 12.21, muted/bg 4.91, accent/bg 4.61, on-accent/accent 5.18, sea-bright/bg 4.67 (all need 4.5).

## 5. Build system

### 5.1 Scripts

| Script | Language | Inputs | Outputs | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- |
| src/scripts/generate.py (1,275 lines) | Python 3 | src/try-works.json; src/vscode/package.json, src/obsidian/manifest.json, src/tailwind/package.json (for version stamping) | 107 files: 101 under dist/ and 6 under src/web/src/css/. With --check it writes nothing and exits 1 on any mismatch. | Standard library only (json, pathlib, sys, uuid); imports generate_obsidian | One build_ function per surface, artifacts() maps output path to text (lines 914-960). Templates for R, Python and the poster use @@TOKEN@@ placeholders. |
| src/scripts/generate_obsidian.py (722 lines) | Python 3 | the parsed JSON, passed in | returns the text of dist/obsidian/theme.css | colorsys, urllib.parse | Also exports _mix(), used by generate.py for the light remap and oh-my-zsh. |
| src/scripts/assemble.sh (41 lines) | POSIX sh | hand-written scaffolding in each src surface folder | 23 copied files in dist/ and 2 zip files | zip | Does not delete anything. |
| src/scripts/validate.py (94 lines) | Python 3 | src/try-works.json | prints; exit 1 on failure | standard library | Checks in 4.1 R7-R12. |
| src/scripts/cvd_check.py (28 lines) | Python 3 | src/try-works.json | prints; always exit 0 | standard library | 7 roles. |
| src/scripts/check_fonts.py (40 lines) | Python 3 | i18n.unicode-range; any .ttf or .woff2 file in src/fonts if present | prints; exit 1 if a Portuguese code point is outside the range or a glyph is missing | fontTools, optional | Font files are not committed, so the glyph check is skipped. |
| src/scripts/subset_fonts.sh (14 lines) | sh | src/fonts/{Fraunces,Literata,Archivo,JetBrainsMono}.ttf (not committed) | one .woff2 file per font in src/web/public/fonts | fontTools, brotli | Skips missing fonts. |

generate.py output count by builder: CSS files 6 (written twice, dist and web copy, 12 files), R 1, Python 2, print 1, Typst 2, Quarto 4, Tailwind 1, terminals 4, oh-my-zsh 2, VS Code themes 2, VS Code icons 69, Zed 1, Vivaldi 2, Obsidian 1, stamped manifests 3. Total 107.

### 5.2 How dist/ is produced, and how much of it is generated

dist/ has 126 tracked files:

| Class | Files | Produced by | Drift-gated |
| --- | --- | --- | --- |
| Generated | 101 | generate.py | yes |
| Scaffold copies | 23 | assemble.sh copies from src/ (identical bytes to the source) | no |
| Zip archives | 2 (dist/vivaldi/Try-Works.zip, Try-Works-Cold.zip) | assemble.sh zips the generated settings.json | no |

Of the 23 copies, 4 are duplicates created by the assemble.sh bug in 5.4 (dist/obsidian/img/img/cold.svg, lit.svg; dist/quarto/example/example/_quarto.yml, index.qmd). So dist/ is generated apart from copied hand-written scaffolding (READMEs, index.js, demo.typ, try-works.typ, preview SVGs, the Quarto example, the Obsidian screenshots). Hand-written source for those lives in src/.

### 5.3 Build run (in copies; the clone is untouched)

| Step | Result |
| --- | --- |
| python3 src/scripts/validate.py | passes; 13 pairs; smallest margin cold accent/bg 4.61 against 4.5 |
| python3 src/scripts/generate.py --check on the pristine copy | "clean: 107 generated files match the json" |
| python3 src/scripts/cvd_check.py | prints the worst three pairs per deficiency; exit 0 |
| python3 src/scripts/check_fonts.py | "all 38 Portuguese codepoints inside the declared subset"; glyph check skipped (no fonts) |
| make generate | writes 107 files; git status then shows only two changed files: dist/vivaldi/Try-Works.zip and Try-Works-Cold.zip |
| The two zips | Same size (503 and 513 bytes) and the inner settings.json has the same CRC (7fe4f03e, 0ed55dc8) and equals the committed one. Only the stored entry time differs (committed 2026-07-09 16:18, regenerated at run time). So the zips are not byte-reproducible. |
| make generate from a checkout with no dist/ (work/try-works-fresh) | Reproduces every committed dist/ file byte for byte except the two zips (different bytes) and the four nested duplicates (not created on the first run) |
| second make generate in the same tree | Creates the four nested duplicates, which then match the committed files. HEAD's dist/ is therefore the result of at least two runs. |
| make test | passes (validate, then check) |
| src/web: npm install, npx eleventy | 129 packages in 6 s; Eleventy 3.1.6 builds; writes 2 pages (index.html and fonts/README/index.html, because src/fonts/README.md is treated as a template) and copies 8 files |
| npm pack --dry-run in dist/tailwind | 4 files, 1.7 kB (README.md, colors.generated.js, index.js, package.json) |
| npx @vscode/vsce ls in dist/vscode | 75 files, no warning printed. I did not run vsce package, so packaging warnings (missing LICENSE, icon) are unverified. |
| make demo | not run (typst not installed) |
| make fonts, fonts-check with fonts present | not run (no fonts committed; fontTools and brotli not installed) |

Conclusion: dist/ is reproducible from src/ for 105 of 107 generated files plus the 23 scaffold copies, and reproducible in content, not in bytes, for the two Vivaldi zips.

### 5.4 Defects and gaps seen in the build

- assemble.sh:26 and :33 use cp -r src dst where dst exists, which nests the copy (dist/obsidian/img/img, dist/quarto/example/example). The build is not idempotent; the nested copies are committed.
- The Vivaldi zips depend on the file time (5.3).
- generate.py --check compares only the 107 generated paths. It does not see the scaffold copies, the zips, or extra stale files in dist/.
- No CI at HEAD (1.3), while CLAUDE.md, README.md and CONTRIBUTING.md say CI enforces the gate.
- subset_fonts.sh writes src/web/public/fonts. The Eleventy config copies src/web/src/fonts, and src/fonts/README.md:15-20 also points there. README.md:116 says "output lands in web/public/fonts". src/web/src/fonts/README.md says three woff2 files are needed, but base.njk:7-8 preloads Fraunces and Literata and site.css declares four faces.
- generate.py reads and writes with the platform default encoding (p.read_text(), p.write_text()) while some outputs contain non-ASCII characters (the caret glyph in the oh-my-zsh themes, the em dash in the Ghostty headers). On a non-UTF-8 default this would write differently (unverified; the build ran here on UTF-8).
- Values typed in the generators rather than read from the JSON: Vivaldi radius 6 and contrast 5 (generate.py:253-254), Tailwind letterSpacing (line 107), the Obsidian font stacks (generate_obsidian.py:609-618), and the literals listed in section 10.

## 6. Targets

Proposals in the last column of 6.2 are mine, for discussion in phase 2. They are not decisions.

### 6.1 Provenance

| # | Target | Files (source to output) | Generated or hand-written | Token roles consumed | Values or artwork specific to this family |
| --- | --- | --- | --- | --- | --- |
| 1 | CSS layer | generate.py to dist/css/{try-works,typography,p3,a11y,fallbacks,motion}.css; the same six are written to src/web/src/css | Generated | modes.lit and modes.cold (all 15 colour roles), type, spacing, typography roles, gamut.p3, a11y, performance.fallbacks, motion | Colour values; Fraunces, Archivo, JetBrains Mono, Literata and their fallback metrics; the 10 typography roles; --tw- prefix, .tw- classes, data-mode="lit" and "cold" selectors |
| 2 | Tailwind preset | generate.py to dist/tailwind/colors.generated.js and package.json (version stamped from src/tailwind/package.json); hand-written index.js, README.md | Mixed | all palette groups (mode-independent), type.scale, spacing, motion, font family names | Colour names fire (ember, flame, oil), sea, whale, bone, gull, pitch, hold, deck, iron, kelp, brick, dusk, tide, shoal; package name try-works-tailwind |
| 3 | VS Code colour themes | generate.py to dist/vscode/themes/Try-Works-color-theme.json and Try-Works-Cold-color-theme.json | Generated; the light theme is a total remap of the dark one (generate.py:557-628) | modes.lit, palette.fire, sea and extended, code (11 roles), terminal.ansi; the light theme also modes.cold | Colour values; 453 workbench colour keys per theme, 35 token rules, 37 semantic rules; theme labels; a remap table keyed by Try-Works hex values |
| 4 | VS Code file-icon theme | generate.py:630-785 to dist/vscode/icons (68 SVG and try-works-icon-theme.json) | Generated | palette.extended and fire, lit text-muted, sea foam and sea-bright | The monogram table (46 file types), folder hue table; icon id try-works-icons |
| 5 | Zed | generate.py:794-896 to dist/zed/themes/Try-Works.json (two themes: 131 style keys each) | Generated; light derived by the same remap | as VS Code | Names "Try-Works (Try-Fire)" and "Try-Works (True Lamp)"; author "tiagojct" |
| 6 | Terminals: Ghostty and iTerm2 | generate.py to dist/themes/terminals/{Try-Works,Try-Works-Cold}.{ghostty,itermcolors}; hand-written README.md and preview.svg | Generated, with hand-written scaffolding | terminal block (dark); modes.cold chrome for the light presets | The 16 ANSI values; file names; a stale preview.svg (section 10) |
| 7 | oh-my-zsh | generate.py:184-226 to dist/omz/try-works.zsh-theme and try-works-cold.zsh-theme; README.md hand-written | Generated | palette.sea.foam, lit sea-bright, extended.shoal and brick, fire.ember; cold text, text-muted, accent, sea-bright | Fire only on the git-dirty mark; theme names |
| 8 | Obsidian | generate_obsidian.py (722 lines) to dist/obsidian/theme.css (47 KB); manifest.json stamped from src/obsidian/manifest.json; hand-written README.md and img/{lit,cold}.svg | Mixed | both modes (all roles), palette.fire and extended, code map | Archivo note body, Fraunces headings, Style Settings block id "try-works" (generate_obsidian.py:287-290), fire accent on links, tags, checkboxes, bullets; screenshots with Try-Works text |
| 9 | Quarto | generate.py:1220-1271 to dist/quarto/{try-works.scss,try-works-dark.scss,try-works.theme,typst-brand.typ}; hand-written README.md and example/ | Mixed | modes bg, text, accent, border, surface, accent-deep; typography fonts; code map; cold text and accent for the Typst brand | Fraunces headings, Literata body; the .theme highlight style has a dark background in both light and dark pages (lit surface) |
| 10 | Typst slides | generate.py:787-792 to dist/typst/colors.typ; hand-written try-works.typ, demo.typ, README.md | Mixed | modes.lit only: bg, surface, sea-deep, sea, sea-bright, sea-pale, accent, accent-bright, text, text-muted | Colour names pitch, hold, ember, flame, whale, gull; fonts Archivo, Fraunces, JetBrains Mono; dark only |
| 11 | Typst poster and print spec | generate.py:1109-1168 to dist/typst/poster.typ and dist/print/SPEC.md | Generated | poster: lit bg, text, accent, accent-bright, sea-deep, sea, cold bg and text; SPEC.md: the print block only | Typed CMYK strings (12), PSO Coated v3 profile, 300% ink limit, rich black recipe, A0-A3 sizes, demo text "Look not too long in the face of the fire." |
| 12 | R (ggplot2) | generate.py:985-995, 1022-1068 to dist/r/tryworks.R | Generated | dataviz categorical, sequential, diverging, shapes, plot.light and plot.dark, fonts | Okabe-Ito set, teal sequential, teal-amber diverging; names `tryworks_categorical`, `tryworks_sequential`, `tryworks_diverging`, `scale_colour_tryworks_d`, `scale_colour_tryworks_c`, `scale_colour_tryworks_div`, `theme_tryworks` |
| 13 | Python (matplotlib) | generate.py:998-1019, 1070-1107 to dist/python/tryworks.py and tryworks.mplstyle | Generated | same as R | names `TRYWORKS_CATEGORICAL`, `TRYWORKS_SEQUENTIAL`, `TRYWORKS_DIVERGING`, `tryworks_seq`, `tryworks_div`, `use_tryworks`; font Archivo |
| 14 | Vivaldi | generate.py:228-257 to dist/vivaldi/{lit,cold}/settings.json; assemble.sh zips to Try-Works.zip and Try-Works-Cold.zip; README.md hand-written | Generated plus zip | modes accent, bg, text, sea, surface | Theme id is a uuid5 of the string "try-works.vivaldi." plus the mode key; names |
| 15 | Web starter (11ty) | src/web (12 files): generated CSS at src/web/src/css plus hand-written eleventy.config.js, package.json, base.njk, index.njk, site.css, fonts/README.md | Mixed | the CSS layer | English page copy about the system and a Melville quotation; lang="pt"; a toggle between lit and cold |
| 16 | Specimens and brand assets | src/specimen (10 files), src/assets (3 files) | Hand-written, no script | none (typed values) | All of it: Try-Works copy, ember emblem, cover |
| 17 | Font tooling | subset_fonts.sh, check_fonts.py | Hand-written | i18n.unicode-range | Family names in subset_fonts.sh |

### 6.2 Install route, publication and proposal

| # | Target | Documented install or publish route | Published anywhere | Proposal |
| --- | --- | --- | --- | --- |
| 1 | CSS layer | "static assets; ship them directly or via your bundler" (docs/PUBLISHING.md:25-29) | No package. | All ten. The output reads only role names, so the per-family work is the token values; the --tw-border clash and the lit and cold selectors need fixing once. |
| 2 | Tailwind | cd dist/tailwind && npm publish (docs/PUBLISHING.md:21-23); require("try-works-tailwind") in src/tailwind/README.md | No. npm has no try-works-tailwind (404). Sibling pequod-tailwind 0.2.0 is on npm. | All ten. It maps palette names to hex with no mode data, so it fits any family with the shared palette groups. |
| 3 | VS Code themes | cd dist/vscode && npx @vscode/vsce package, publish the .vsix to the Marketplace or Open VSX for Positron (docs/PUBLISHING.md:6-13); or copy to ~/.vscode/extensions/try-works-color-theme/ (src/vscode/README.md:14-19) | No. Marketplace and Open VSX have no try-works entry. tiagojct.pequod-color-theme exists on both. | All ten, one extension with two modes per family. It is the daily editor surface (docs/PRODUCT.md:20-21) and the light theme already derives from the dark one. The remap table must be re-keyed from Try-Works hex values to roles. |
| 4 | VS Code icons | select "Try-Works Icons" after installing (src/vscode/README.md:21-26) | No | Some. 69 files per family and the icons use only hue roles, so one icon theme parametrised at build time may be enough. Not in product.tiers. |
| 5 | Zed | copy the JSON to ~/.config/zed/themes (src/zed/README.md:13-30) | No. The Zed extension API returns nothing for try-works. | Some (owner to confirm use). Small and generated, but not in product.tiers. |
| 6 | Ghostty, iTerm2 | copy to ~/.config/ghostty/themes; import the .itermcolors (src/themes/terminals/README.md) | No registry checked (unverified) | All ten for Ghostty (core in product.tiers). The light presets need an ANSI set authored per family (3.7). iTerm2 not in product.tiers: some. |
| 7 | oh-my-zsh | copy to $ZSH_CUSTOM/themes and set ZSH_THEME (src/omz/README.md) | No | Some. Two small files, not in product.tiers. |
| 8 | Obsidian | copy manifest.json and theme.css to .obsidian/themes/Try-Works/; for the community list use a dedicated repository with both at the root (docs/PUBLISHING.md:15-19). The dist/obsidian folder has no screenshot.png; whether the community process needs one is unverified. | No. None of the 833 entries in community-css-themes.json matches Try-Works, tiagojct or pequod. | All ten, with parameters. The theme carries Try-Works decisions (Archivo body, fire on bullets, tags and checkboxes, Style Settings id) that need per-family parameters. Obsidian loads one theme at a time, so each family would be its own theme. |
| 9 | Quarto | copy the scss, theme and typst files next to _quarto.yml (src/quarto/README.md) | No | All ten. Small, generated from roles and fonts. |
| 10 | Typst slides | import try-works.typ; typst compile demo.typ (src/typst/README.md); typst is not installed here, so not compiled (unverified) | No | All ten after re-keying colours to roles. The slide theme is dark only. |
| 11 | Typst poster, print spec | none beyond the files (README.md:79-93) | No | Some. Posters are rare (docs/PRODUCT.md:22-24), and the CMYK strings are typed, not derived from the hex values. A night-reading family has no obvious poster use. |
| 12 | R | source dist/r/tryworks.R (README.md:71-72) | No. CRAN has no tryworks. There is no DESCRIPTION file, so it is a script, not a package. | All ten. Categorical Okabe-Ito is family-neutral; the sequential and diverging ramps are Try-Works teal and teal-amber and need a per-family or a shared choice. |
| 13 | Python | import dist/python/tryworks.py and call use_tryworks() (README.md:74-77) | No. PyPI has no try-works. PyPI has tryworks, an unrelated project (github.com/ezzcodeezzlife/tryworks, 0.1.x, first upload 2026-09-13). No packaging metadata here. | All ten, same reasoning as R. The module name tryworks is taken on PyPI if it is ever published. |
| 14 | Vivaldi | Settings, Themes, Import Theme, pick the zip (src/vivaldi/README.md) | No public registry known (unverified) | Some. Five colours, but not in product.tiers, and the zips are not byte-reproducible. |
| 15 | Web starter | npm run serve or build from src/web (CLAUDE.md:46) | Not published | Keep out of the token build. gam already presents each family; the CSS layer (1) is what a site consumes. |
| 16 | Specimens, brand assets | none | n/a | Jungfrau-only, as archive or to be redrawn. The specimens are 12 MB with embedded fonts; gam renders specimens for all families. |
| 17 | Font tooling | make fonts, make fonts-check | n/a | All ten as shared tooling. |

### 6.3 Registry checks (network reads on 2026-09-29)

| Registry | Query | Result |
| --- | --- | --- |
| npm | try-works, try-works-tailwind, try-works-color-theme, try-works-web, tryworks | all 404 |
| npm | search maintainer:tiagojct | 3 packages: @tiagojct/subsub 0.6.0, diagcalc 3.2.4, pequod-tailwind 0.2.0 |
| PyPI | try-works | 404 |
| PyPI | tryworks | 200, an unrelated project |
| CRAN | tryworks, try-works | 404, 404 (CRAN names cannot contain hyphens) |
| VS Code Marketplace | item tiagojct.try-works-color-theme; unique-id query; name search "try-works" | 404; 0 results; 0 results. Publisher tiagojct has tiagojct.pequod-color-theme ("Pequod Palette"). |
| Open VSX | tiagojct/try-works-color-theme; namespace tiagojct | 404; namespace lists only pequod-color-theme |
| Obsidian community themes | community-css-themes.json (833 entries), match on name, repo, author | no match |
| Zed extensions | api.zed.dev filter=try-works | empty |
| Vivaldi gallery, Ghostty and iTerm2 galleries | not queried | unverified |

### 6.4 Targets in Glauca but not in Try-Works

Checked in clones/glauca, dist/ directories: firefox, thunderbird, zotero, miniflux, markedit, pptx are present there and absent here. Glauca also has 7 files under dist/themes against 6 here (not investigated). Try-Works has no Firefox, Thunderbird, Zotero, Miniflux, MarkEdit or PowerPoint output.

gam (clones/gam) already generates Try-Works exports from the token file for: alacritty, ase, css, dtcg, ggplot2, ghostty, gpl, hex, iterm2, kitty, latex, matplotlib, neovim, observable, obsidian, pandoc-css, quarto-brand, quarto-scss, scss, tailwind3, tailwind4, tmux, tokens-studio, typst, vscode, wezterm, windows-terminal, zed (the snapshot folder test/`__snapshots__`/generators/try-works/both).

### 6.5 Why dist/vscode has 75 files

| Group | Files |
| --- | --- |
| Icon theme SVGs | 68: 46 monogram file icons, 6 glyph icons (file, pdf, image, audio, video, archive), 16 folder icons (8 folder variants, each closed and open) |
| Icon theme definition | 1 (icons/try-works-icon-theme.json: 68 definitions, 106 file extensions, 32 file names, 39 folder names, 37 language ids) |
| Colour themes | 2 |
| package.json | 1 |
| README.md and preview-python.svg and preview-r.svg | 3 |

A VS Code icon theme needs one file per icon definition (iconPath), which is why the count is high. The 69 icon files and the two themes are generated; package.json is stamped; README and previews are copied. vsce ls lists all 75.

## 7. Fonts and assets

Fonts named by the system (src/try-works.json:146-173, 255-313): Fraunces (serif; axes opsz, wght, SOFT, WONK), Archivo (sans; wdth, wght), JetBrains Mono (mono; wght), Literata (reading; opsz, wght). All are declared OFL. The plan keeps Fraunces, Literata and JetBrains Mono; Archivo is not in that list.

- src/fonts contains only README.md (41 lines): download commands for Fraunces, Archivo and JetBrains Mono from google/fonts, conversion to woff2, axis notes, and a section on Literata. No font file, no OFL text.
- No OFL text file exists in the repository. Licence files are only LICENSE-MIT and LICENSE-CC-BY-4.0.
- Fonts are nevertheless embedded in the specimens as base64 TTF (full fonts, not subsets). I decoded them:

| Font | Version | Bytes | Embedded in | Licence fields in the font's name table |
| --- | --- | --- | --- | --- |
| Fraunces | 1.000 | 360,440 | specimen.html, type-specimen.html, pt-specimen.html, reading-comparison.html, brand.svg, poster-proof.svg | copyright 2020 The Fraunces Project Authors; OFL 1.1 notice and URL |
| Inter | 4.001 | 876,576 | specimen.html | copyright 2016 The Inter Project Authors; OFL 1.1 notice and URL |
| Archivo | 2.001 | 658,596 | specimen.html, type-specimen.html, pt-specimen.html | copyright 2020 The Archivo Project Authors; OFL 1.1 notice and URL |
| JetBrains Mono | 2.211 | 187,208 | specimen.html, type-specimen.html, pt-specimen.html, poster-proof.svg | copyright 2020 The JetBrains Mono Project Authors; OFL 1.1 notice and URL |
| Literata | 3.103 | 955,132 | type-specimen.html, reading-comparison.html | copyright 2017 The Literata Project Authors; OFL 1.1 notice and URL |
| Source Serif 4 | 4.004 | 1,209,508 | reading-comparison.html | Adobe copyright with Reserved Font Name "Source"; OFL 1.1 notice |

- The licence notice and URL are inside each font binary; there is no standalone licence text next to the copies. README.md:145-146 and CLAUDE.md:68 say fonts are not bundled and that redistributed fonts need the OFL text. Whether the embedded notices satisfy the OFL is unverified and I do not offer a legal reading.
- Archivo appears in 26 tracked files (63 occurrences): src/try-works.json, CSS, Tailwind, Obsidian (body and UI font, generate_obsidian.py:609-618), Typst slides (src/typst/try-works.typ:6), R and matplotlib base font, caption and data roles, font fallbacks, docs and specimens. Inter appears only in specimen.html. Source Serif 4 appears only in reading-comparison.html and docs/CHANGELOG.md:145.
- Font metrics in src/try-works.json:613-653: payload sizes (Fraunces 121 KB, Literata 155, Archivo 88, JetBrains Mono 38, total 404) and metric-matched fallbacks for each face; the payload figures have no script behind them (unverified).

Assets (src/assets):

| File | Content |
| --- | --- |
| logo.svg (831 bytes) | Ember emblem, dark: rounded square #14242c, radial fire glow, foam horizon line, two flame paths (#c9651d, #e0832a) |
| logo-cold.svg (831 bytes) | Same emblem on #f2f7f4 with #9e5017 and #b85f1c |
| cover.svg (1,013 bytes) | 1200 by 630 cover with Georgia text and colour chips; uses #cd7a2c, which is not in the JSON |

The assets are referenced only from README.md:135 and docs/BRAND.md:26. Nothing in the web starter uses them (no favicon link in base.njk). Both docs give the path without the src/ prefix, as does src/try-works.json:678.

## 8. Specimens and web

src/specimen (10 files, 12.06 MB, all hand-written; no script or make target builds them):

| File | Size | Content | Hex typed |
| --- | --- | --- | --- |
| specimen.html | 2.79 MB | Type and colour specimen with 4 embedded fonts, a lit and cold toggle, an Inter/Archivo toggle; a full copy of both mode token blocks | 40 occurrences, 34 distinct, 6 not in the JSON |
| type-specimen.html | 2.89 MB | Type ladder; embeds the generated typography.css verbatim (identical to dist/css/typography.css today) | 7, 1 not in the JSON |
| pt-specimen.html | 1.61 MB | European Portuguese specimen; embeds an older typography.css (body roles still on Fraunces, so it predates Literata) | 6 |
| reading-comparison.html | 3.37 MB | Fraunces, Literata and Source Serif 4 side by side with contrast and x-height figures | 6 |
| motion.html | 3.4 KB | The four easings and durations; no fonts | 7 |
| brand.svg | 488 KB | Emblems, wordmark, lockups; Fraunces embedded | 55 occurrences, 12 distinct, 1 not in the JSON |
| poster-proof.svg | 734 KB | A2 poster proof with bleed, trim, safe area, CMYK chips; Fraunces and JetBrains Mono embedded | 36, 1 not in the JSON |
| try-works-dataviz.png | 138 KB | 1755 by 546 image of the three data-viz scales on spirometry examples | not text |
| try-works-dataviz-cvd.png | 28 KB | 1092 by 390 colour-vision simulation | not text |
| README.md | 207 bytes | Says specimen.html embeds "the three fonts"; it embeds four | none |

The specimens are static and out of sync with the JSON: specimen.html uses cold accent #a15117 (JSON: #9e5017) and fire gradients built from rgba(205,122,44) and rgba(231,151,47) (that is #cd7a2c and #e7972f; JSON ember #c9651d, flame #e0832a). The two PNGs have no script in the repository (provenance unverified).

src/web (12 tracked files): eleventy.config.js (passes through src/css and src/fonts), package.json (private; devDependency @11ty/eleventy ^3.0.0; scripts serve and build), src/_includes/base.njk (lang="pt", data-mode="lit", preloads Fraunces.woff2 and Literata.woff2, a script toggling lit and cold), src/index.njk (English copy), src/css/site.css (hand-written, 48 lines), six generated CSS files, src/fonts/README.md. No font files are committed, so the preloads and @font-face rules point at missing files and the page renders on fallbacks. Build: npm install then npx eleventy from src/web; verified in the copy (Eleventy 3.1.6; output in _site/, git-ignored; package-lock.json is not committed).

Hand-typed hex in the web starter: src/web/src/css/site.css:46-47 has #f1efe9 (in the JSON) and #e7e9e4 (not in the JSON) for the hero text. The six generated CSS files contain 36 hex occurrences, all from the JSON.

## 9. References to other repositories, sites and DOIs

No DOI, no ORCID, no email address and no reference to Glauca, Ambergris or gam appears in the tracked files.

Outbound references (edit when the source moves or the family is renamed):

| Reference | Location |
| --- | --- |
| https://github.com/tiagojct/try-works | CITATION.cff:10; src/vscode/package.json:16 and dist copy; src/tailwind/package.json:22 and dist copy |
| https://github.com/tiagojct/pequod | README.md:5, 227 (sibling and credits) |
| pequod as a sibling | docs/BRAND.md:11-16; docs/CHANGELOG.md:71; src/try-works.json:673; src/themes/terminals/preview.svg:6 (prompt text "tiago@pequod") |
| https://tiagojct.eu | CITATION.cff:11; src/obsidian/manifest.json:6 and dist copy (authorUrl) |
| publisher "tiagojct" | src/vscode/package.json:6 and dist copy |
| author "tiagojct" | generate.py:893 (Zed theme author), dist/zed/themes/Try-Works.json:4 |
| Author "Tiago Jacinto" | LICENSE-MIT:3; LICENSE-CC-BY-4.0:10; src/obsidian/manifest.json:5; src/tailwind/package.json:19 and dist copies |
| https://stephango.com/flexoki | README.md:228 |
| https://fonts.google.com/specimen/Literata, https://raw.githubusercontent.com/google/fonts/main/ofl | src/fonts/README.md:8, 39 |
| https://zed.dev/schema/themes/v0.2.0.json | generate.py:892; dist/zed/themes/Try-Works.json:2 |
| Legal code and summary URLs | LICENSE-CC-BY-4.0:7-8 |
| https://www.contributor-covenant.org/version/2/1/code_of_conduct/ | docs/CODE_OF_CONDUCT.md:11 |
| https://example.org | src/quarto/example/index.qmd:10 and dist copies |

Identifiers derived from the name (change on rename): Vivaldi theme ids, a uuid5 over the string "try-works.vivaldi." plus the mode key (generate.py:247); the Obsidian Style Settings id "try-works" (generate_obsidian.py:287-290), which keys users' saved settings; package names try-works-tailwind, try-works-color-theme, try-works-web; icon theme id try-works-icons; R and Python names (tryworks_categorical, tryworks_sequential, tryworks_diverging, tryworks_shapes, tryworks_pal_d, scale_colour_tryworks_d, scale_colour_tryworks_c, scale_colour_tryworks_div and fill and color variants, scale_shape_tryworks_d, theme_tryworks; TRYWORKS_CATEGORICAL, TRYWORKS_SEQUENTIAL, TRYWORKS_DIVERGING, TRYWORKS_MARKERS, tryworks_seq, tryworks_div, use_tryworks); the CSS prefix --tw- and .tw- classes; the data-mode values lit and cold. CLAUDE.md:62-64 classes these as the frozen public surface. The name Try-Works, try-works or tryworks appears in 104 of 200 tracked files (557 occurrences); 25 tracked paths contain it.

Stale internal paths and links: CLAUDE.md:44 links .github/workflows/ci.yml (deleted); src/tailwind/index.js:2 says scripts/generate.py; src/tailwind/README.md:29 says css/try-works.css; docs/BRAND.md:26 and src/try-works.json:678 say assets/logo.svg; README.md:116 says web/public/fonts; the README copies in each dist surface folder keep relative links that resolve only in src/ (dist/typst/README.md:20 points to ../fonts/README.md).

Inbound references (other repositories that depend on this one; found by grepping the clones):

- gam (clones/gam): scripts/vendor.sh:24 clones tiagojct/try-works; src/model/load.js:15 and src/model/adapters/try-works.js read src/try-works.json and depend on: the mode keys lit and cold (modeKeys), the palette groups ground, sea, whale, fire and extended, the core ids ember, flame and oil, the extended ids kelp, brick, dusk, tide, shoal, three literals #cdd2d3, #aeb6b8, #8a9296, README.md, and the paths dist/css/try-works.css, the two files in dist/vscode/themes, dist/zed/themes/Try-Works.json, the four Ghostty and iTerm2 files in dist/themes/terminals, dist/obsidian/theme.css, dist/quarto/try-works.scss and try-works-dark.scss, dist/typst/colors.typ, dist/r/tryworks.R, dist/python/tryworks.py. Its snapshot tests embed the header "Try-Works 1.0.0 (src/try-works.json, commit 400dd91)" (the same pinned commit). deploy/family-dispatch.yml is a job to be pasted into each family's workflow; try-works has no workflow. gam/README.md:108 calls the repository private; GitHub reports it public.
- glauca (clones/glauca): README.md:6, 175 link to it; docs/BRAND.md:13-14, docs/FOUNDATIONS.md:25, 71, docs/PRODUCT.md:13, 32, src/glauca.json:628 and 668 describe try-works as the dark sibling.
- pequod, ambergris: no reference.

## 10. Hex values typed outside src/try-works.json

Scan: every tracked text file, hex forms #rgb, #rrggbb and #rrggbbaa (alpha ignored when comparing values). Font blobs stripped first. Total 2,787 occurrences in 117 files.

| Class | Files with hex | Occurrences | Distinct values | Distinct not in the JSON |
| --- | --- | --- | --- | --- |
| Generated, dist/ (drift-gated) | 90 | 2,168 | 114 | 42 |
| Generated, src/web/src/css (drift-gated) | 2 | 36 | 33 | 0 |
| dist/ copies of hand-written src files | 7 | 187 | 32 | 4 |
| Hand-written: src/scripts/generate.py | 1 | 69 | 13 | 7 |
| Hand-written: other src files | 16 | 326 | 54 | 11 |
| Docs | 1 | 1 | 1 | 0 |

Generated files, by surface (107 generated files, 2,204 hex occurrences, 92 files carrying hex): VS Code themes 1,048; Zed 404; Obsidian theme.css 340; VS Code icons 114 (68 files); Quarto 49; terminals 44 (Ghostty; the iTerm2 files store floats, 24 colour entries each); CSS 36 plus 36 in the web copy; Python 33; R 33; Tailwind 20; Typst 18; oh-my-zsh 16; Vivaldi 10; print 3. They come from the builders. The 42 distinct values not in the JSON are 35 blends returned by _mix (light remap, Obsidian ramp, cold oh-my-zsh; I instrumented _mix and all 35 match) and 7 that equal literals in generate.py.

Hand-written places:

| File | Occurrences | Distinct | Notes |
| --- | --- | --- | --- |
| src/scripts/generate.py | 69 | 21 raw (13 without alpha) | Colour literals: #606c72 (lines 331, 365, 585, 815), #1d242b (341, 374, 483, 512, 586, 820), #222a31 (380, 587, 817, 818, 836, 837, 854), #3a1d1a, #33271a, #16242c (validation backgrounds, 399-401, 589-591), #cdd2d3 (342, 368, 583), #aeb6b8, #8a9296, #3a4754, #2c3640. Alpha overlays: #00000000, #0000004d, #00000066, #0000007f, #00000010, #0000001a, #0000000a, #ffffff14, #ffffff1f, #ffffff0a. |
| src/web/src/css/site.css | 2 | 2 | #f1efe9, #e7e9e4 (lines 46-47) |
| src/assets/cover.svg | 12 | 7 | #cd7a2c not in the JSON |
| src/assets/logo.svg, logo-cold.svg | 6 each | 4 each | all in the JSON |
| src/obsidian/img/lit.svg | 22 | 8 | all in the JSON |
| src/obsidian/img/cold.svg | 22 | 8 | #a15117 and #243038 not in the JSON (a15117 is the cold accent before it was darkened to #9e5017, docs/CHANGELOG.md:194-195) |
| src/themes/terminals/preview.svg | 38 | 18 | #cd7a2c and #e7972f (old fire values; the JSON ANSI yellows are #c9651d and #e0832a) |
| src/vscode/preview-python.svg, preview-r.svg | 32 and 29 | 12 and 10 | all in the JSON |
| src/specimen/specimen.html | 40 | 34 | #a15117, #eef0ec, #e7e9e4, #eef1ec, #dfe6e6, #e3e9e8 not in the JSON; plus rgba() gradients |
| src/specimen/type-specimen.html | 7 | 7 | #5f6c72 not in the JSON |
| src/specimen/pt-specimen.html, reading-comparison.html, motion.html | 6, 6, 7 | 6, 6, 7 | all in the JSON |
| src/specimen/brand.svg | 55 | 12 | #eef2f0 not in the JSON |
| src/specimen/poster-proof.svg | 36 | 8 | #eef2f0 not in the JSON |
| docs/CHANGELOG.md | 1 | 1 | "#9e5017" in prose (line 194) |
| README.md, CLAUDE.md, other docs | 0 | 0 | none |

The 187 occurrences in dist/ copies are the same hand-written files (Obsidian screenshots, preview SVGs) duplicated by assemble.sh. Seventeen distinct hand-written colour values are not in the JSON: #16242c, #1d242b, #222a31, #243038, #33271a, #3a1d1a, #5f6c72, #606c72, #a15117, #cd7a2c, #dfe6e6, #e3e9e8, #e7972f, #e7e9e4, #eef0ec, #eef1ec, #eef2f0. Three of them (#a15117, #cd7a2c, #e7972f) are stale values from earlier versions of the palette.

Other colour values typed as non-hex: src/try-works.json has 4 color(display-p3 ...) strings (gamut.p3, lines 446-451) and 12 CMYK strings (print.cmyk, lines 564-575), neither derived from the hex values; specimen.html has rgba() gradient stops (lines 22, 29); generate_obsidian.py builds rgba() triples from palette values.

Inside the JSON itself, the palette block holds 19 of 126 hex occurrences (section 3.11). Against the plan's rule (no colour typed outside a family's palette block), the current state is:

- the JSON: 107 hex occurrences outside the palette block (63 of them values that are not in the palette);
- generate.py: 21 colour and alpha literals;
- 16 hand-written asset, CSS and specimen files (326 occurrences);
- 2,204 generated occurrences, which are compliant in spirit (derived), although 35 distinct values are computed blends that no palette block lists.

## 11. Points that complicate the plan

1. The dark and light naming is lit and cold in the schema, CSS selectors, file names and gam's adapter, with dark and light already present as scheme values and as R and Python arguments. A rename touches the frozen public surface (CLAUDE.md:62-64).
2. True Lamp is defined in the repository as the natural sun and a cool sea-salt paper (README.md:8, docs/FOUNDATIONS.md:15-17, 88-89, src/try-works.json:5). Repositioning it as a dimmed warm paper for night reading contradicts those texts. FOUNDATIONS.md would need rewriting, including "the True Lamp paper that still shows the cold sea under it" (line 88). FOUNDATIONS.md also states that the dark default is a preference (lines 42-46) and that fire is rare because fixing on it is dangerous (lines 11-29).
3. Flame and Oil have no light-mode entries. The light-mode fire values are the role-named accent, accent-bright and accent-deep, and the shared remap folds Flame and Oil into one value (#7a3a10).
4. No sleep, melatonin or blue-light claim exists here. The only comfort statements are about typefaces and the halation comment for the dark body weight.
5. The light terminal presets reuse the dark ANSI set; 10 of 16 colours are below 3:1 on the True Lamp background. A warm dimmed paper will lower these ratios further.
6. Scope discipline in PRODUCT.md and FOUNDATIONS.md ("Stop adding surfaces", the conviviality threshold) conflicts with a ten-family, all-target expansion. Five surfaces (Zed, iTerm2, oh-my-zsh, Vivaldi, VS Code icons) are not in product.tiers.
7. The token file duplicates every colour by value and has no references; the light mode is almost entirely outside the palette block; the code map and ANSI set are dark-only; there is no status block; three mode vocabularies coexist; spacing.border and the mode-level border key collide in CSS.
8. dist/ is reproducible except for the Vivaldi zip times, but assemble.sh is not idempotent and the drift gate covers 107 of 132 output files. There is no CI, though four documents say there is.
9. Version 1.0.0 has no tag or release and HEAD contains unreleased additions.
10. Fonts: six full OFL fonts sit base64-embedded in specimens with no licence text file, contrary to README.md:143-146. Archivo appears in 26 files and is not in the plan's font list.
11. Nothing from this repository is published on any registry; the names try-works-tailwind, try-works-color-theme and try-works are free on npm, and tryworks is taken on PyPI by an unrelated project.
12. gam pins commit 400dd91 and reads src/try-works.json and many dist/ paths by name, so moving files or renaming keys breaks gam until its adapter is updated.

## 12. Not verified

- Typst compile of the slide theme and poster (typst not installed).
- vsce package warnings; the Obsidian community submission requirements (the docs page is script-rendered and could not be read).
- Browser rendering of the --tw-border clash and of the light terminal presets; the ANSI ratios are computed, not seen.
- Behaviour of generate.py on a non-UTF-8 default encoding.
- Whether the Dependabot run on GitHub failed for lack of workflows.
- CITATION.cff against the CFF schema.
- Legal effect of the licence split and of the embedded OFL notices.
- How the two PNGs and the reading-comparison metrics were produced.
- Vivaldi, Ghostty and iTerm2 theme galleries (no public query found).
- The font make targets (make fonts, make fonts-check with fonts present): no fonts or fontTools here.

Verification status of the clone at the end of the run: git status empty, HEAD 400dd91402459c124b24c7d0d6248b916639a7dc.
