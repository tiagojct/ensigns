// An ensign for each family: a signal flag drawn from the family's own light-mode colours.
// Ten designs, one per place in the book, so no two families share a flag. Build time only.
import { at } from '../../lib/model/resolve.ts';
import type { ResolvedFamily } from '../../lib/model/types.ts';

interface Colours { field: string; ink: string; a: string; b: string; c: string }

const rect = (x: number, y: number, w: number, h: number, fill: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const poly = (points: string, fill: string) => `<polygon points="${points}" fill="${fill}"/>`;
const disc = (cx: number, cy: number, r: number, fill: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;

// The canvas is 150 by 100. The swallowtail takes the right-hand 22, so keep detail left of x 128.
const DESIGNS: ((c: Colours) => string)[] = [
  // The host: three bands with an ink bar between two fields.
  (c) => rect(0, 0, 150, 100, c.field) + rect(0, 0, 150, 34, c.a) + rect(0, 38, 150, 24, c.ink) + rect(0, 66, 150, 34, c.b),
  // A block at the hoist and two thin stripes.
  (c) => rect(0, 0, 150, 100, c.field) + rect(0, 0, 58, 100, c.a) + rect(76, 22, 74, 14, c.b) + rect(76, 64, 74, 14, c.ink),
  // A cross.
  (c) => rect(0, 0, 150, 100, c.a) + rect(36, 0, 28, 100, c.field) + rect(0, 36, 150, 28, c.field) + rect(46, 0, 8, 100, c.ink) + rect(0, 46, 150, 8, c.ink),
  // Four quarters.
  (c) => rect(0, 0, 150, 100, c.field) + rect(0, 0, 75, 50, c.a) + rect(75, 50, 75, 50, c.a) + rect(0, 50, 75, 50, c.ink) + disc(75, 50, 14, c.b),
  // A saltire.
  (c) => rect(0, 0, 150, 100, c.field) + poly('0,0 28,0 150,86 150,100 122,100 0,14', c.a) + poly('150,0 150,14 28,100 0,100 0,86 122,0', c.b) + disc(75, 50, 10, c.ink),
  // Frames inside frames.
  (c) => rect(0, 0, 150, 100, c.a) + rect(12, 12, 126, 76, c.field) + rect(32, 30, 86, 40, c.ink) + rect(56, 42, 38, 16, c.b),
  // Two triangles from the hoist.
  (c) => rect(0, 0, 150, 100, c.field) + poly('0,0 100,50 0,100', c.b) + poly('0,24 52,50 0,76', c.ink) + rect(112, 0, 38, 100, c.a),
  // Five stripes.
  (c) => rect(0, 0, 150, 100, c.field) + rect(0, 20, 150, 20, c.a) + rect(0, 40, 150, 20, c.ink) + rect(0, 60, 150, 20, c.b),
  // A disc on a field.
  (c) => rect(0, 0, 150, 100, c.a) + disc(66, 50, 34, c.field) + disc(66, 50, 17, c.ink) + rect(112, 0, 38, 100, c.b),
  // A diagonal split.
  (c) => rect(0, 0, 150, 100, c.field) + poly('0,100 0,0 150,0', c.a) + poly('0,100 150,0 150,26 0,100', c.ink) + poly('0,100 150,26 150,100', c.b),
];

/** The colours a flag is drawn in. Accents that match the field or the ink are skipped, and the roles stand in when a family has few. */
export function ensignColours(f: ResolvedFamily): Colours {
  const m = f.modes.light;
  const field = at(m, 'roles.bg').hex, ink = at(m, 'roles.text').hex;
  const wanted = [...m.colours].filter(([k]) => k.startsWith('accents.')).map(([, v]) => v.hex);
  for (const role of ['roles.accent', 'roles.text-muted', 'roles.surface', 'roles.border']) wanted.push(at(m, role).hex);
  const accents = [...new Set(wanted)].filter((hex) => hex !== field && hex !== ink);
  return { field, ink, a: accents[0]!, b: accents[1]!, c: accents[2]! };
}

/** The flag as an inline SVG. `id` must be unique on the page, because the clip path is addressed by it. */
export function ensign(f: ResolvedFamily, index: number, id: string): string {
  const c = ensignColours(f);
  const outline = 'M0 0H150L128 50L150 100H0Z';
  return `<svg class="ensign" viewBox="-2 -2 154 104" aria-hidden="true" focusable="false"><defs><clipPath id="${id}"><path d="${outline}"/></clipPath></defs><g clip-path="url(#${id})">${DESIGNS[index % DESIGNS.length]!(c)}</g><path d="${outline}" fill="none" stroke="${c.ink}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
}
