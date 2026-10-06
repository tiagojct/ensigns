# Ensigns site

The active static catalogue and Carpenter use the ten current family token files and pure generators from lib/. The retired Gam source is under legacy/gam/; the old site fixtures and snapshots remain unchanged.

Run commands from the repository root:

```sh
npm ci
npm run build
npm run preview
```

Open http://127.0.0.1:4174/. npm run dev builds the local packages, prepares the catalogue and starts the development server. The pages link to the archives that the package build writes. There are no separate site dependencies; site/package.json delegates to the root scripts.

scripts/site/build.ts validates the tokens, measures declared environments, renders 18 routes, generates the catalogue stylesheet, swatches, favicon and social image, and copies current exports, specimens, reports and releases. Vite hashes the browser assets into site/dist/. The reading pages and ready-made downloads work without JavaScript; the Carpenter and comparison controls load their small modules when needed.

The Carpenter generates text, binary and ZIP downloads locally. It preserves authored palettes and explains unavailable targets. The contrast checker uses the shared WCAG and Machado calculations. The header's Site family selector applies any of the ten families to the website's colours and typography, independently of specimens and comparison panels. Family and System, Light or Dark appearance are restored before painting and persisted locally when storage is available; the controls still work when storage is blocked.

All selected fonts are served from public/fonts/ with their original OFL texts. fonts/sources.json records the added files and hashes. No third-party script, font, analytics or conversion endpoint is loaded.

The production browser suite in tests/site/ checks the static routes, local links and assets, mobile layouts, keyboard focus, appearance persistence, comparisons and every export format under the nginx Content Security Policy.

[Release and deployment instructions](../docs/RELEASE.md) cover the static directory, container, owner publication and the portable delivery. The build and CI do not publish or modify a live server.
