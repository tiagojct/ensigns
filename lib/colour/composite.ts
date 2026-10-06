// Alpha compositing in gamma-encoded sRGB, the source-over blend that CSS
// and code editors apply to a translucent colour over an opaque one.
// Source: W3C Compositing and Blending Level 1, simple alpha compositing:
// co = cs * as + cb * ab * (1 - as), here with an opaque backdrop (ab = 1).

import { formatHex, parseHex } from "./srgb.ts";

/** fgHex at opacity alpha (0 to 1) over the opaque bgHex, as hex. */
export function blend(fgHex: string, alpha: number, bgHex: string): string {
  if (!(alpha >= 0 && alpha <= 1)) throw new RangeError(`Alpha must be between 0 and 1, got ${alpha}`);
  const [fr, fg, fb] = parseHex(fgHex);
  const [br, bg, bb] = parseHex(bgHex);
  const mix = (f: number, b: number): number => f * alpha + b * (1 - alpha);
  return formatHex([mix(fr, br), mix(fg, bg), mix(fb, bb)]);
}
