# Ensigns

Ten colour families named after the Pequod and the nine ships she gams with in Moby-Dick, with generators for editors, terminals, documents and the web. One repository holds the tokens, the libraries, the packages and the site. The site is at https://ensigns.tiagojacinto.eu.

## Layout

- families/<id>/<id>.tokens.json is the only hand-edited colour data. README.md and CHANGELOG.md sit beside it.
- schema/family.schema.json and docs/model.md describe the token file.
- lib/model, lib/colour and lib/harness are pure TypeScript. lib/model/load.ts, lib/model/validate.ts and lib/harness run at build time only (file system, Ajv, APCA). The rest also runs in the browser.
- tests/shared holds the tests that cover every family. tests/environments holds one test file per environment profile, and tests/environments.json holds every threshold with its reason.
- tests/fixtures/legacy and tests/parity are frozen copies of what the five old repositories held. Do not edit them.
- scripts/design records how each family's values were chosen. scripts/migrate records how the old repositories were converted. scripts/report.ts writes reports/<family>.json.
- scripts/pages builds the local family pages into preview/, which git ignores (npm run pages). A family's specimen is families/<id>/specimen/specimen.html and specimen.css; scripts/pages/README.md gives the rules.
- legacy/ and site/ are dormant until phase 4.

## Commands

- npm test runs Vitest over tests/.
- npm run typecheck runs tsc.
- node scripts/report.ts [family] runs the environment harness and prints a summary.
- Node 24 runs the TypeScript scripts directly, so use .ts extensions in imports and erasable syntax only (no enums, namespaces or parameter properties).

## Rules

1. A colour value appears only in a family's palette block. Everything else refers to a palette entry as {palette.group.name}. tests/shared/stray-hex.test.ts enforces it. Changelogs and migration reports are exempt, and tests/shared/hex-exemptions.json says why.
2. Changing a colour value means changing tests/shared/expected-changes/<family>.json in the same commit, with the reason.
3. Every threshold in tests/environments.json has a why. Change one with a written reason in the same commit, never silently.
4. A quotation from Moby-Dick must be verbatim from sources/moby-dick.txt. tests/shared/quotes.test.ts enforces it for the token files.
5. Prose is British English, plain register, no emojis, no marketing tone. No bold or italics in READMEs.
6. Commit as Tiago Jacinto <tiagojacinto@med.up.pt>. Do not add attribution lines to commits, pull requests or files. A phase pull request is merged with a merge commit, never squashed, because the imported history must survive.
7. Code that can reach a browser must not use eval or new Function, because the site's Content Security Policy forbids both. That is why Ajv lives in lib/model/validate.ts and nowhere else.
8. APCA runs at build time only. apca-w3 has a Limited W3 License and depends on colorparsley, which is AGPL-3.0. Import lib/colour/apca.ts by path from build code. tests/shared/licences.test.ts guards it.
9. Nothing is published to a registry from here. The publishing steps are written down for the owner, who runs them.
