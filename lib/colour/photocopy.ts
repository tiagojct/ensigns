// Photocopy: CIE L* above 88 becomes white, L* below 18 becomes black, and
// anything in between keeps its neutral grey (same relative luminance).
// Source: the project brief, section 6 (photocopy profile).

import { greyscaleHex, lstar } from "./grey.ts";
import { formatHex } from "./srgb.ts";

const WHITE_ABOVE = 88;
const BLACK_BELOW = 18;

export type PhotocopyRule = "white" | "black" | "grey";

export interface Photocopied {
  hex: string;
  rule: PhotocopyRule;
}

export function photocopy(hex: string): Photocopied {
  const l = lstar(hex);
  if (l > WHITE_ABOVE) return { hex: formatHex([1, 1, 1]), rule: "white" };
  if (l < BLACK_BELOW) return { hex: formatHex([0, 0, 0]), rule: "black" };
  return { hex: greyscaleHex(hex), rule: "grey" };
}
