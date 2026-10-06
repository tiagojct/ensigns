// E-ink quantisation: relative luminance becomes a gamma-encoded grey,
// rounded to one of `levels` evenly spaced levels (16 for most e-paper
// panels). Level 0 is black and level levels - 1 is white.
// Source: the project brief, section 6 (eink profile).

import { channelFromLinear, formatHex } from "./srgb.ts";
import { relativeLuminance } from "./wcag.ts";

export interface EinkLevel {
  level: number;
  hex: string;
}

export function quantiseEink(hex: string, levels = 16): EinkLevel {
  if (!Number.isInteger(levels) || levels < 2) {
    throw new RangeError(`E-ink levels must be an integer of 2 or more, got ${levels}`);
  }
  const top = levels - 1;
  const level = Math.round(channelFromLinear(relativeLuminance(hex)) * top);
  const v = level / top;
  return { level, hex: formatHex([v, v, v]) };
}

/** How many levels apart the two colours land. */
export function einkLevelDistance(a: string, b: string, levels = 16): number {
  return Math.abs(quantiseEink(a, levels).level - quantiseEink(b, levels).level);
}
