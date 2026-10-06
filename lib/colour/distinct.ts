// Pairwise distances within a set of colours that must be told apart,
// optionally after a simulation (CVD, greyscale, flare) applied to every
// colour first.
// Source: the project brief, sections 5 and 6 (distinct sets, minimum
// pairwise OKLab distance).

import { oklabDistance } from "./oklab.ts";

export type Distance = (a: string, b: string) => number;
export type Transform = (hex: string) => string;

/** a and b are the input colours; the distance is measured after the transform. */
export interface PairDistance {
  i: number;
  j: number;
  a: string;
  b: string;
  distance: number;
}

export interface MinPair {
  min: number;
  a: string;
  b: string;
  pair: readonly [number, number];
}

/** Every pair i < j, in order. */
export function pairwiseDistances(
  hexes: readonly string[],
  distance: Distance = oklabDistance,
  transform?: Transform,
): PairDistance[] {
  const items = hexes.map((hex, i) => ({ i, hex, seen: transform ? transform(hex) : hex }));
  return items.flatMap((p) =>
    items.slice(p.i + 1).map((q) => ({ i: p.i, j: q.i, a: p.hex, b: q.hex, distance: distance(p.seen, q.seen) })),
  );
}

/** The closest pair; on a tie, the first in pairwiseDistances order. */
export function minPairwise(hexes: readonly string[], distance: Distance = oklabDistance, transform?: Transform): MinPair {
  const [first, ...rest] = pairwiseDistances(hexes, distance, transform);
  if (first === undefined) throw new RangeError(`minPairwise needs at least two colours, got ${hexes.length}`);
  const best = rest.reduce((m, p) => (p.distance < m.distance ? p : m), first);
  return { min: best.distance, a: best.a, b: best.b, pair: [best.i, best.j] };
}
