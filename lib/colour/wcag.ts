// WCAG 2.x relative luminance and contrast ratio.
// Source: WCAG 2.2, definitions of "relative luminance" and "contrast ratio";
// thresholds from success criteria 1.4.3 (AA text), 1.4.6 (AAA text) and
// 1.4.11 (non-text contrast, AA only). Thresholds compare the unrounded ratio.

import { hexToLinear } from "./srgb.ts";

export type ContrastKind = "text" | "large" | "component";

const AA: Record<ContrastKind, number> = { text: 4.5, large: 3, component: 3 };
const AAA: Record<Exclude<ContrastKind, "component">, number> = { text: 7, large: 4.5 };

/** The weights of linear R, G and B in relative luminance. */
export const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722] as const;

/** Relative luminance Y, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToLinear(hex);
  const [wr, wg, wb] = LUMINANCE_WEIGHTS;
  return wr * r + wg * g + wb * b;
}

/** WCAG ratio (L1 + 0.05) / (L2 + 0.05) with L1 the larger luminance. */
export function ratioFromLuminances(y1: number, y2: number): number {
  return (Math.max(y1, y2) + 0.05) / (Math.min(y1, y2) + 0.05);
}

/** Contrast ratio from 1 to 21; the order of the two colours does not matter. */
export function contrastRatio(a: string, b: string): number {
  return ratioFromLuminances(relativeLuminance(a), relativeLuminance(b));
}

export function meetsAA(fg: string, bg: string, kind: ContrastKind): boolean {
  return contrastRatio(fg, bg) >= AA[kind];
}

/** WCAG 2.x has no AAA level for non-text contrast, so kind is text or large. */
export function meetsAAA(fg: string, bg: string, kind: Exclude<ContrastKind, "component">): boolean {
  return contrastRatio(fg, bg) >= AAA[kind];
}
