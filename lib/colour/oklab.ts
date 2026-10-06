// OKLab and OKLCH, converted by culori 4.0.2.
// Source: Björn Ottosson, "A perceptual color space for image processing"
// (2020).
//
// Gamut mapping in fromOklch follows CSS Color Module Level 4 (Candidate
// Recommendation Draft, 26 September 2026), "Binary Search Gamut Map with
// Local MINDE": keep OKLCH lightness and hue and reduce chroma until the
// colour clipped to sRGB is within deltaEOK 0.02 (the JND) of it, then
// clip. The bisection is culori's toGamut("rgb", "oklch"), whose loop is
// close to the spec's but which lacks the spec's first step: return the
// clipped colour when it is already within the JND. Without that step,
// sRGB boundary colours that come back from OKLCH a rounding error
// outside the gamut move by one 8-bit step (yellow came back with blue at
// 1 of 255), so fromOklch applies the step itself.
// culori's clampChroma was not chosen: it works in CIELCh by default and
// its strict in-gamut test can desaturate more than needed.

import { clampRgb, converter, differenceEuclidean, toGamut } from "culori";
import { formatHex, parseHex } from "./srgb.ts";

export interface Oklab {
  L: number;
  a: number;
  b: number;
}

/** h in degrees, 0 to 360; 0 for achromatic colours, whose hue is undefined. */
export interface Oklch {
  L: number;
  C: number;
  h: number;
}

const oklab = converter("oklab");
const oklch = converter("oklch");
const rgb = converter("rgb");
const deltaEOK = differenceEuclidean("oklab");
const mapToSrgb = toGamut("rgb", "oklch");
const JND = 0.02;

function culoriRgb(hex: string) {
  const [r, g, b] = parseHex(hex);
  return { mode: "rgb" as const, r, g, b };
}

export function toOklab(hex: string): Oklab {
  const { l, a, b } = oklab(culoriRgb(hex));
  return { L: l, a, b };
}

export function toOklch(hex: string): Oklch {
  const { l, c, h } = oklch(culoriRgb(hex));
  return { L: l, C: c, h: h ?? 0 };
}

/** Euclidean distance in OKLab (deltaEOK). */
export function oklabDistance(a: string, b: string): number {
  const p = toOklab(a);
  const q = toOklab(b);
  return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);
}

/** Smallest angle between the two OKLCH hues, 0 to 180 degrees. Meaningless if either colour is achromatic. */
export function hueDifference(a: string, b: string): number {
  const d = Math.abs(toOklch(a).h - toOklch(b).h) % 360;
  return d > 180 ? 360 - d : d;
}

/** OKLCH to hex, gamut-mapped into sRGB (see the header). */
export function fromOklch(L: number, C: number, h: number): string {
  if (![L, C, h].every(Number.isFinite) || C < 0) {
    throw new RangeError(`Invalid OKLCH: L ${L}, C ${C}, h ${h}`);
  }
  const colour = { mode: "oklch" as const, l: L, c: C, h };
  const clipped = clampRgb(rgb(colour));
  const { r, g, b } = deltaEOK(colour, clipped) < JND ? clipped : mapToSrgb(colour);
  return formatHex([r, g, b]);
}
