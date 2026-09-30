import { describe, expect, test } from "vitest";
import {
  applyFlare,
  contrastRatio,
  contrastWithFlare,
  flareLinear,
  relativeLuminance,
} from "../../../lib/colour/index.ts";

const ks = Array.from({ length: 21 }, (_, i) => i / 100);
const colours = ["#000000", "#1A1A1A", "#336699", "#7F3F3F", "#CC6677", "#F5F0E1", "#FFFFFF"];

describe("flareLinear", () => {
  test("adds k to each linear channel and clamps at 1", () => {
    const [r, g, b] = flareLinear([0.1, 0.99, 1], 0.05);
    expect(r).toBeCloseTo(0.15, 15);
    expect(g).toBe(1);
    expect(b).toBe(1);
  });

  test("rejects negative or non-finite k", () => {
    expect(() => flareLinear([0.5, 0.5, 0.5], -0.01)).toThrow(RangeError);
    expect(() => flareLinear([0.5, 0.5, 0.5], Number.NaN)).toThrow(RangeError);
    expect(() => applyFlare("#808080", Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("applyFlare", () => {
  // The luminance weights sum to 1, so adding k to each channel adds k to Y;
  // the tolerance covers rounding to 8 bits.
  test("adds k to the relative luminance of colours that stay below 1", () => {
    for (const hex of ["#000000", "#404040", "#336699", "#7F3F3F"]) {
      for (const k of [0.02, 0.06, 0.08]) {
        expect(relativeLuminance(applyFlare(hex, k))).toBeCloseTo(relativeLuminance(hex) + k, 2);
      }
    }
  });

  test("k = 0 changes nothing and white stays white", () => {
    for (const hex of colours) expect(applyFlare(hex, 0)).toBe(hex);
    expect(applyFlare("#FFFFFF", 0.08)).toBe("#FFFFFF");
  });

  test("luminance never falls as k grows", () => {
    for (const hex of colours) {
      const ys = ks.map((k) => relativeLuminance(applyFlare(hex, k)));
      ys.slice(1).forEach((y, i) => expect(y).toBeGreaterThanOrEqual(ys[i] ?? Number.NaN));
    }
  });
});

describe("contrastWithFlare", () => {
  test("k = 0 is the WCAG contrast ratio", () => {
    expect(contrastWithFlare("#767676", "#FFFFFF", 0)).toBe(contrastRatio("#767676", "#FFFFFF"));
  });

  // (1 + k + 0.05) / (0 + k + 0.05): 1.07 / 0.07 in a dark room, 1.13 / 0.13 in a lit room.
  test("black on white under the brief's projector flare levels", () => {
    expect(contrastWithFlare("#000000", "#FFFFFF", 0.02)).toBeCloseTo(1.07 / 0.07, 12);
    expect(contrastWithFlare("#000000", "#FFFFFF", 0.08)).toBeCloseTo(1.13 / 0.13, 12);
  });

  test("falls strictly as k grows for colours of different luminance", () => {
    const pairs = [
      ["#000000", "#FFFFFF"],
      ["#767676", "#FFFFFF"],
      ["#F5F0E1", "#336699"],
    ] as const;
    for (const [fg, bg] of pairs) {
      const ratios = ks.map((k) => contrastWithFlare(fg, bg, k));
      ratios.slice(1).forEach((r, i) => expect(r).toBeLessThan(ratios[i] ?? Number.NaN));
    }
  });

  test("is order independent and 1 for equal colours", () => {
    expect(contrastWithFlare("#336699", "#F5F0E1", 0.06)).toBe(contrastWithFlare("#F5F0E1", "#336699", 0.06));
    expect(contrastWithFlare("#336699", "#336699", 0.06)).toBe(1);
  });
});
