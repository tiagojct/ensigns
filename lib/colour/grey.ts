// Greyscale by relative luminance, and CIE 1976 lightness L*.
// Source: CIE 15:2004, L* = 116 f(Y/Yn) - 16 with Yn = 1 for relative
// luminance, written with the exact constants epsilon = 216/24389 and
// kappa = 24389/27 so the two segments meet at Y = epsilon.

import { channelFromLinear, formatHex } from "./srgb.ts";
import { relativeLuminance } from "./wcag.ts";

const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

/** CIE L*, 0 (black) to 100 (white). */
export function lstar(hex: string): number {
  const y = relativeLuminance(hex);
  return y <= EPSILON ? KAPPA * y : 116 * Math.cbrt(y) - 16;
}

/** The 8-bit neutral grey nearest to relative luminance y. */
export function greyFromLuminance(y: number): string {
  const v = channelFromLinear(y);
  return formatHex([v, v, v]);
}

/** Neutral grey with the same relative luminance, to the nearest 8-bit step. */
export function greyscaleHex(hex: string): string {
  return greyFromLuminance(relativeLuminance(hex));
}

export function lstarDistance(a: string, b: string): number {
  return Math.abs(lstar(a) - lstar(b));
}
