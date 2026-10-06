import { describe, expect, test } from "vitest";
import { contrastRatio, meetsAA, meetsAAA, relativeLuminance } from "../../../lib/colour/index.ts";

// WebAIM Contrast Checker API (webaim.org/resources/contrastchecker/?...&api, read 2026-09-30)
// reports ratios truncated to two decimals, so the tests truncate too.
const truncated = (ratio: number): number => Math.floor(ratio * 100) / 100;

describe("relativeLuminance", () => {
  // WCAG 2.x definition: Y = 0.2126 R + 0.7152 G + 0.0722 B on linear sRGB.
  test("sRGB primaries give the three coefficients", () => {
    expect(relativeLuminance("#FF0000")).toBeCloseTo(0.2126, 12);
    expect(relativeLuminance("#00FF00")).toBeCloseTo(0.7152, 12);
    expect(relativeLuminance("#0000FF")).toBeCloseTo(0.0722, 12);
  });

  test("black is 0 and white is 1", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 12);
  });
});

describe("contrastRatio", () => {
  // WCAG 2.x: ratios run from 1:1 to 21:1.
  test("black on white is 21", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 12);
  });

  test("white on white is 1", () => {
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBe(1);
  });

  test("the order of the colours does not matter", () => {
    const pairs = [
      ["#000000", "#FFFFFF"],
      ["#767676", "#FFFFFF"],
      ["#336699", "#F5F0E1"],
      ["#CC6677", "#117733"],
    ] as const;
    for (const [a, b] of pairs) expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });

  test("mid greys on white match the WebAIM checker", () => {
    expect(truncated(contrastRatio("#767676", "#FFFFFF"))).toBe(4.54);
    expect(truncated(contrastRatio("#777777", "#FFFFFF"))).toBe(4.47);
    expect(truncated(contrastRatio("#595959", "#FFFFFF"))).toBe(7);
    expect(truncated(contrastRatio("#5A5A5A", "#FFFFFF"))).toBe(6.89);
  });
});

describe("meetsAA and meetsAAA", () => {
  // Same pass and fail results as the WebAIM checker for these greys.
  test("text needs 4.5, large text and components need 3", () => {
    expect(meetsAA("#767676", "#FFFFFF", "text")).toBe(true);
    expect(meetsAA("#777777", "#FFFFFF", "text")).toBe(false);
    expect(meetsAA("#777777", "#FFFFFF", "large")).toBe(true);
    expect(meetsAA("#777777", "#FFFFFF", "component")).toBe(true);
    expect(meetsAA("#959595", "#FFFFFF", "large")).toBe(false);
  });

  test("AAA needs 7 for text and 4.5 for large text", () => {
    expect(meetsAAA("#595959", "#FFFFFF", "text")).toBe(true);
    expect(meetsAAA("#5A5A5A", "#FFFFFF", "text")).toBe(false);
    expect(meetsAAA("#5A5A5A", "#FFFFFF", "large")).toBe(true);
    expect(meetsAAA("#777777", "#FFFFFF", "large")).toBe(false);
  });
});
