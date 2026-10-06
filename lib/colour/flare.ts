// Ambient flare: light from the room or the sun reflected off a screen or
// projection surface adds roughly the same luminance k to every colour.
// Source: the project brief, section 6. Projector profile: k = 0.02 for a
// dark room and k = 0.08 for a lit room; sunlight profile: k = 0.06.
// Adding k to each linear channel adds k to the relative luminance, because
// the luminance weights sum to 1.

import { hexToLinear, linearToHex, type Linear } from "./srgb.ts";
import { ratioFromLuminances, relativeLuminance } from "./wcag.ts";

function checkFlare(k: number): void {
  if (!(k >= 0 && Number.isFinite(k))) throw new RangeError(`Flare k must be a finite number of 0 or more, got ${k}`);
}

/** Adds k to each linear channel, clamped at 1. */
export function flareLinear(linear: Linear, k: number): Linear {
  checkFlare(k);
  const [r, g, b] = linear;
  return [Math.min(1, r + k), Math.min(1, g + k), Math.min(1, b + k)];
}

/** The colour as seen under flare k, as hex. Channels that reach 1 are clamped, so bright colours gain less than k. */
export function applyFlare(hex: string, k: number): string {
  return linearToHex(flareLinear(hexToLinear(hex), k));
}

/** WCAG contrast ratio with k added to both luminances, without clamping. */
export function contrastWithFlare(fg: string, bg: string, k: number): number {
  checkFlare(k);
  return ratioFromLuminances(relativeLuminance(fg) + k, relativeLuminance(bg) + k);
}
