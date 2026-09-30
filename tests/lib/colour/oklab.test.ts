import { describe, expect, test } from "vitest";
import { fromOklch, hueDifference, oklabDistance, toOklab, toOklch } from "../../../lib/colour/index.ts";
import { greys, grid4096, stepDifference } from "./helpers.ts";

describe("toOklab", () => {
  // Ottosson (2020) defines OKLab so that D65 white is L = 1, a = b = 0, and black is 0, 0, 0.
  test("white is L 1, a and b 0", () => {
    const { L, a, b } = toOklab("#FFFFFF");
    expect(L).toBeCloseTo(1, 12);
    expect(Math.abs(a)).toBeLessThan(1e-12);
    expect(Math.abs(b)).toBeLessThan(1e-12);
  });

  test("black is L 0, a and b 0", () => {
    expect(toOklab("#000000")).toEqual({ L: 0, a: 0, b: 0 });
  });
});

describe("toOklch", () => {
  test("greys have no chroma and hue 0", () => {
    for (const hex of greys) {
      const { C, h } = toOklch(hex);
      expect(C).toBeLessThan(1e-12);
      expect(h).toBe(0);
    }
  });

  test("hue lies in 0..360", () => {
    for (const hex of grid4096()) {
      const { h } = toOklch(hex);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });
});

describe("fromOklch", () => {
  test("hex to OKLCH to hex returns the same colour, within 1 step, for 4096 colours", () => {
    let worst = 0;
    for (const hex of grid4096()) {
      const { L, C, h } = toOklch(hex);
      worst = Math.max(worst, stepDifference(fromOklch(L, C, h), hex));
    }
    expect(worst).toBeLessThanOrEqual(1);
  });

  // The early clip step of CSS Color 4 keeps boundary colours exact; culori's toGamut alone
  // returned yellow with blue 1 and cyan with red 1.
  test("sRGB boundary colours come back exactly", () => {
    for (const hex of ["#FFFF00", "#00FFFF", "#FF00FF", "#FF0000", "#00FF00", "#0000FF", "#008877"]) {
      const { L, C, h } = toOklch(hex);
      expect(fromOklch(L, C, h)).toBe(hex);
    }
  });

  test("out-of-gamut colours keep lightness and hue closely while chroma drops", () => {
    for (const [L, C, h] of [
      [0.7, 0.4, 150],
      [0.5, 0.35, 300],
      [0.9, 0.3, 100],
    ] as const) {
      const out = toOklch(fromOklch(L, C, h));
      expect(Math.abs(out.L - L)).toBeLessThan(0.02);
      expect(Math.abs(out.h - h)).toBeLessThan(4);
      expect(out.C).toBeLessThan(C);
    }
  });

  test("lightness at or beyond the ends gives white or black", () => {
    expect(fromOklch(1.2, 0.1, 20)).toBe("#FFFFFF");
    expect(fromOklch(-0.1, 0.1, 20)).toBe("#000000");
  });

  test("rejects negative chroma and non-finite values", () => {
    expect(() => fromOklch(0.5, -0.1, 20)).toThrow(RangeError);
    expect(() => fromOklch(Number.NaN, 0.1, 20)).toThrow(RangeError);
    expect(() => fromOklch(0.5, 0.1, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("oklabDistance", () => {
  test("black to white is 1; identical colours are 0; symmetric", () => {
    expect(oklabDistance("#000000", "#FFFFFF")).toBeCloseTo(1, 12);
    expect(oklabDistance("#336699", "#336699")).toBe(0);
    expect(oklabDistance("#336699", "#CC6677")).toBe(oklabDistance("#CC6677", "#336699"));
  });
});

describe("hueDifference", () => {
  // Rounding to 8-bit hex moves hues 350 and 10 at chroma 0.1 by up to about 1 degree each.
  test("wraps around 360", () => {
    const a = fromOklch(0.6, 0.1, 350);
    const b = fromOklch(0.6, 0.1, 10);
    expect(Math.abs(hueDifference(a, b) - 20)).toBeLessThan(2);
    expect(hueDifference(b, a)).toBe(hueDifference(a, b));
  });

  test("lies in 0..180", () => {
    const colours = grid4096().filter((_, i) => i % 97 === 0);
    for (const a of colours) {
      for (const b of colours) {
        const d = hueDifference(a, b);
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(180);
      }
    }
  });
});
