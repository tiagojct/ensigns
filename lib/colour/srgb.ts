// sRGB hex parsing and formatting, and the sRGB transfer functions.
// Source: IEC 61966-2-1:1999 (sRGB), piecewise transfer function with the
// threshold 0.04045 on the encoded side and 0.0031308 on the linear side.
// WCAG 2.0 printed 0.03928 as the encoded threshold. No 8-bit value lies
// between the two (10/255 is below 0.03928 and 11/255 is above 0.04045),
// so hex colours decode identically with either.

/** Gamma-encoded sRGB channels, each 0 to 1. */
export type Rgb = readonly [number, number, number];

/** Linear-light sRGB channels, each 0 to 1. */
export type Linear = readonly [number, number, number];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Parses a 3-digit or 6-digit hex colour in any case. Throws on anything else. */
export function parseHex(hex: string): Rgb {
  const digits = HEX.exec(hex)?.[1];
  if (digits === undefined) {
    throw new Error(`Not a hex colour (expected 3 or 6 hex digits after #): ${JSON.stringify(hex)}`);
  }
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join("") : digits;
  const channel = (at: number): number => Number.parseInt(full.slice(at, at + 2), 16) / 255;
  return [channel(0), channel(2), channel(4)];
}

/** Formats as uppercase 6-digit hex, rounding each channel to 8 bits and clamping to 0 to 255. */
export function formatHex(rgb: Rgb): string {
  const pairs = rgb.map((c) => {
    if (!Number.isFinite(c)) throw new RangeError(`Channel is not a finite number: ${c}`);
    const byte = Math.min(255, Math.max(0, Math.round(c * 255)));
    return byte.toString(16).padStart(2, "0");
  });
  return `#${pairs.join("")}`.toUpperCase();
}

/** Decodes one gamma-encoded channel to linear light. */
export function channelToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Encodes one linear-light channel to gamma-encoded sRGB. */
export function channelFromLinear(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
}

export function toLinear(rgb: Rgb): Linear {
  return [channelToLinear(rgb[0]), channelToLinear(rgb[1]), channelToLinear(rgb[2])];
}

export function fromLinear(linear: Linear): Rgb {
  return [channelFromLinear(linear[0]), channelFromLinear(linear[1]), channelFromLinear(linear[2])];
}

export function hexToLinear(hex: string): Linear {
  return toLinear(parseHex(hex));
}

/** Encodes, rounds and clamps a linear-light triple to hex. */
export function linearToHex(linear: Linear): string {
  return formatHex(fromLinear(linear));
}
