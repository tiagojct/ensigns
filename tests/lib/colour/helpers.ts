import { parseHex } from "../../../lib/colour/index.ts";

const byte = (v: number): string => v.toString(16).padStart(2, "0").toUpperCase();

export function hexOf(r: number, g: number, b: number): string {
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}

/** Largest per-channel difference between two colours, in 8-bit steps. */
export function stepDifference(a: string, b: string): number {
  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);
  return Math.round(Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2)) * 255);
}

/** Every colour whose channels are multiples of 17 (0x11): 4096 colours. */
export function grid4096(): string[] {
  const levels = Array.from({ length: 16 }, (_, i) => i * 17);
  return levels.flatMap((r) => levels.flatMap((g) => levels.map((b) => hexOf(r, g, b))));
}

export const greys: readonly string[] = Array.from({ length: 256 }, (_, v) => hexOf(v, v, v));
