// One-off. Runs the four gam adapters (site/src/model/adapters) against the
// frozen legacy token files and the committed golden outputs, and writes the
// normalised model each one produced to tests/fixtures/legacy/model/<id>.json.
//
// That snapshot is "the original" for the equality tests: it holds every
// colour the old site knew for a family (14 roles, 12 syntax roles, the
// terminal block, the data scales), each with its origin. The adapters are
// deleted after the migration passes, so this script cannot be re-run once
// they are gone. The snapshots stay.
//
//   node scripts/migrate/export-legacy-model.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const adapters = {
  pequod: await import('../../site/src/model/adapters/pequod.js'),
  glauca: await import('../../site/src/model/adapters/glauca.js'),
  'try-works': await import('../../site/src/model/adapters/try-works.js'),
  ambergris: await import('../../site/src/model/adapters/ambergris.js'),
};

// Where each file the adapters ask for (paths relative to the old repository
// root) lives now. Files that are not colour sources (README text) map to ''.
const SOURCES = {
  pequod: {
    tokens: 'tests/fixtures/legacy/pequod.json',
    files: {
      'README.md': 'families/pequod/README.md',
      'themes/terminals/Pequod.ghostty': 'tests/parity/pequod/themes/terminals/Pequod.ghostty',
    },
  },
  glauca: {
    tokens: 'tests/fixtures/legacy/glauca.json',
    files: {
      'README.md': 'families/goney/README.md',
      'dist/themes/terminals/Glauca-Dark.ghostty': 'tests/parity/goney/dist/themes/terminals/Glauca-Dark.ghostty',
      'dist/themes/terminals/Glauca.ghostty': 'tests/parity/goney/dist/themes/terminals/Glauca.ghostty',
    },
  },
  'try-works': {
    tokens: 'tests/fixtures/legacy/try-works.json',
    files: {
      'README.md': 'families/jungfrau/README.md',
      'dist/themes/terminals/Try-Works.ghostty': 'tests/parity/jungfrau/dist/themes/terminals/Try-Works.ghostty',
      'dist/themes/terminals/Try-Works-Cold.ghostty': 'tests/parity/jungfrau/dist/themes/terminals/Try-Works-Cold.ghostty',
    },
  },
  ambergris: {
    tokens: 'tests/fixtures/legacy/ambergris.json',
    files: {
      'ports/ghostty/ambergris-dark': 'tests/parity/rosebud/ports/ghostty/ambergris-dark',
      'ports/zed/ambergris.json': 'tests/parity/rosebud/ports/zed/ambergris.json',
      'ports/README.md': 'legacy/ambergris/ports/README.md',
    },
  },
};

const outDir = join(ROOT, 'tests/fixtures/legacy/model');
mkdirSync(outDir, { recursive: true });

for (const [id, mod] of Object.entries(adapters)) {
  const src = SOURCES[id];
  const json = JSON.parse(read(src.tokens));
  const files = {};
  for (const need of mod.NEEDS) {
    const where = src.files[need];
    if (!where) throw new Error(`${id}: no source mapped for ${need}`);
    files[need] = existsSync(join(ROOT, where)) ? read(where) : '';
  }
  const fam = mod.adapt({ json, files });

  // Colour content only: no ships, install text, URLs or taglines.
  const snapshot = {
    id: fam.id,
    name: fam.name,
    version: fam.version,
    scale: fam.scale,
    extraScales: fam.extraScales,
    accents: fam.accents,
    rules: fam.rules ?? null,
    modes: Object.fromEntries(Object.entries(fam.modes).map(([m, mode]) => [m, {
      label: mode.label,
      scheme: mode.scheme,
      roles: mode.roles,
      syntax: mode.syntax,
      terminal: mode.terminal,
      dataviz: mode.dataviz,
    }])),
  };
  writeFileSync(join(outDir, `${id}.json`), JSON.stringify(snapshot, null, 2) + '\n');
  const count = (o) => JSON.stringify(o).split('"hex"').length - 1;
  console.log(`${id}: ${count(snapshot)} colours written`);
}
