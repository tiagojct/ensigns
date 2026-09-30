// Bundle the Glauca MarkEdit theme into dist/markedit/glauca.js.
// markedit-theming is bundled in; MarkEdit provides the CodeMirror/Lezer and
// markedit-api modules at runtime, so those stay external.
import * as esbuild from 'esbuild';
import { mkdirSync } from 'node:fs';

mkdirSync('../../dist/markedit', { recursive: true });

await esbuild.build({
  entryPoints: ['glauca.mjs'],
  bundle: true,
  format: 'esm',
  outfile: '../../dist/markedit/glauca.js',
  external: ['markedit-api', '@codemirror/*', '@lezer/*', 'style-mod'],
  legalComments: 'none',
  banner: { js: '// Glauca theme for MarkEdit -- generated from glauca.json. Source: src/markedit/.' },
});

console.log('bundled dist/markedit/glauca.js');
