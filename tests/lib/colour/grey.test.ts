import { converter } from "culori";
import { describe, expect, test } from "vitest";
import {
  channelFromLinear,
  greyFromLuminance,
  greyscaleHex,
  lstar,
  lstarDistance,
  parseHex,
  relativeLuminance,
} from "../../../lib/colour/index.ts";
import { greys, grid4096 } from "./helpers.ts";

// culori's CIELAB (D65) is an independent implementation of the CIE 15:2004 lightness formula.
const lab65 = converter("lab65");
const culoriLstar = (hex: string): number => {
  const [r, g, b] = parseHex(hex);
  return lab65({ mode: "rgb", r, g, b }).l;
};

describe("lstar", () => {
  test("black is 0 and white is 100", () => {
    expect(lstar("#000000")).toBe(0);
    expect(lstar("#FFFFFF")).toBeCloseTo(100, 10);
  });

  test("matches culori's CIELAB L* for every grey", () => {
    for (const hex of greys) expect(lstar(hex)).toBeCloseTo(culoriLstar(hex), 5);
  });

  // culori derives Y from its own sRGB-to-XYZ matrix, whose luminance row differs from
  // WCAG's rounded coefficients in the fifth decimal, so chromatic colours agree less closely.
  test("matches culori's CIELAB L* for chromatic colours within 0.01", () => {
    for (const hex of grid4096().filter((_, i) => i % 7 === 0)) {
      expect(Math.abs(lstar(hex) - culoriLstar(hex)), hex).toBeLessThan(0.01);
    }
  });

  test("uses the linear segment below Y = 216/24389", () => {
    // #010101: Y = (1/255)/12.92, well below the threshold.
    expect(lstar("#010101")).toBeCloseTo((24389 / 27) * (1 / 255 / 12.92), 12);
  });
});

describe("greyscale", () => {
  test("greys map to themselves", () => {
    for (const hex of greys) expect(greyscaleHex(hex)).toBe(hex);
  });

  // Y(red) = 0.2126 encodes to 127.1 of 255.
  test("pure red becomes grey 127", () => {
    expect(greyscaleHex("#FF0000")).toBe("#7F7F7F");
  });

  test("output is the neutral 8-bit grey nearest to the input luminance", () => {
    for (const hex of grid4096().filter((_, i) => i % 5 === 0)) {
      const out = greyscaleHex(hex);
      expect(out.slice(1, 3)).toBe(out.slice(3, 5));
      expect(out.slice(3, 5)).toBe(out.slice(5, 7));
      const exact = channelFromLinear(relativeLuminance(hex)) * 255;
      expect(Math.abs(exact - Number.parseInt(out.slice(1, 3), 16)), hex).toBeLessThanOrEqual(0.5);
    }
  });

  test("greyFromLuminance: 0 is black and 1 is white", () => {
    expect(greyFromLuminance(0)).toBe("#000000");
    expect(greyFromLuminance(1)).toBe("#FFFFFF");
  });
});

describe("lstarDistance", () => {
  test("black to white is 100 and the order does not matter", () => {
    expect(lstarDistance("#000000", "#FFFFFF")).toBeCloseTo(100, 10);
    expect(lstarDistance("#336699", "#CC6677")).toBe(lstarDistance("#CC6677", "#336699"));
  });
});
