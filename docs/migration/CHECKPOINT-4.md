# Ensigns 1.0.0 release checkpoint

Prepared on 2026-10-04. This records the finished local product; CHECKPOINT-3.md remains the historical phase record. No registry publication, remote repository change or live deployment was performed.

## Delivered

Ten primary families, both modes, 29 export formats and 326 generated files. The static site includes the catalogue, comparisons, native specimens, measurement reports and Carpenter's previews, downloads, ZIP bundles and contrast checker. Local package distributions cover JavaScript, Python, R, Typst, VS Code, Zed, Obsidian, Tailwind, Firefox, Mastodon and Loomings.

The complete portable delivery is dist/ensigns-1.0.0.zip with its adjacent SHA-256 file. Individual distributions and SHA256SUMS.txt are in dist/releases/. Installation and owner publication steps are in docs/RELEASE.md. Build-generated files are intentionally ignored by Git; npm run build recreates them.

## Verified

- npm run typecheck passes under Node 24.
- npm test passes: 678 tests across 46 files, with Chromium available and all browser checks executed.
- Site family selection applies the canonical colours in all twenty family modes at 1440px, 1024px, 390px and 320px widths. Tests verify independent samples, System appearance, navigation persistence, restoration before the main script loads, invalid saved preferences and blocked storage.
- Production-site checks cover desktop and mobile, light and dark appearance, keyboard focus in forced colours, the deployment CSP, local assets and links, independent shareable comparisons, all 29 formats and actual text, Adobe ASE and ZIP downloads.
- node scripts/export/freshness.ts produces byte-identical output from two independent builds: all 326 files and their source-hash manifest.
- The actual packed npm archive installs into a separate consumer directory. Its package exports, canonical JSON import, all 29 generators and Uint8Array binary output work; the consumer also passes TypeScript checking against the packaged declarations.
- Python 3.12 installs the generated package and builds wheel and source distributions. The resolved data for all twenty family modes load; matplotlib 3.11.2 renders all fourteen authored chart modes and registers the supplied colormaps.
- R 4.6.1 installs the generated deterministic source archive and renders the authored ggplot2 exports. R CMD check reports no errors or warnings and one note recommending R CMD build for that archive. A standard archive prepared with R CMD build passes R CMD check with Status: OK, including namespace, dependency, documentation and code checks.
- Typst 0.15.1 compiles the included package example successfully.
- git diff --check passes. Frozen migration and parity fixtures and the old site fixtures and snapshots have no changes.

The R check uses installed dependencies; registry index requests were unavailable in the sandbox. Docker is not installed on this host, so the container recipe is supplied but has not been built locally. The static site itself is built and exercised under the nginx configuration's CSP.

## Update after review, 2026-10-06

Copilot's review of the three pull requests led to five fixes, merged forward through all three branches. A distinct set with an explicit member list fails when a listed address is missing from a mode. The stray-hex lint scans scripts/ and compares an eight-digit literal whole, so a palette colour with an added alpha byte no longer passes. The lightness-gap check rejects a negative minimum, and a new test runs the failing branch of not-blue-violet. The 678 tests above are 682 across the same 46 files. On a clean checkout of the merged phase 4 branch, the type check, npm test with Chromium, npm run build and node scripts/export/freshness.ts all pass.

## Remaining owner operations

The local product is finished. Live hosting, account verification, registry submissions, old package retirement notices, consumer adoption in other repositories and a Zenodo DOI require the owner's accounts. CLAUDE.md explicitly reserves registry publication for the owner; docs/RELEASE.md provides the generated artifacts and concrete steps.
