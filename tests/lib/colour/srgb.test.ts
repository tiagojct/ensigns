import { describe, expect, test } from "vitest";
import {
  channelFromLinear,
  channelToLinear,
  formatHex,
  fromLinear,
  hexToLinear,
  linearToHex,
  parseHex,
  toLinear,
} from "../../../lib/colour/index.ts";
import { hexOf } from "./helpers.ts";

describe("parseHex", () => {
  test("reads 6-digit hex in any case", () => {
    expect(parseHex("#FF8000")).toEqual([1, 128 / 255, 0]);
    expect(parseHex("#ff8000")).toEqual(parseHex("#FF8000"));
    expect(parseHex("#fF8000")).toEqual(parseHex("#FF8000"));
  });

  test("expands 3-digit hex", () => {
    expect(parseHex("#F80")).toEqual(parseHex("#FF8800"));
    expect(parseHex("#abc")).toEqual(parseHex("#AABBCC"));
  });

  test.each([
    "",
    "#",
    "FF8000",
    "#FF80",
    "#FF800",
    "#FF80000",
    "#FF8000FF",
    "#GG8000",
    " #FF8000",
    "#FF8000 ",
    "rgb(255, 128, 0)",
    "orange",
  ])("throws on %j", (input) => {
    expect(() => parseHex(input)).toThrow(/Not a hex colour/);
  });
});

describe("formatHex", () => {
  test("writes uppercase 6-digit hex", () => {
    expect(formatHex([1, 128 / 255, 0])).toBe("#FF8000");
  });

  test("rounds each channel to the nearest 8-bit step, halves up", () => {
    expect(formatHex([127.49 / 255, 0.5, 0.2 / 255])).toBe("#7F8000");
  });

  test("clamps to 0 and 255", () => {
    expect(formatHex([-0.2, 1.3, 0.5])).toBe("#00FF80");
  });

  test("throws on non-finite channels", () => {
    expect(() => formatHex([Number.NaN, 0, 0])).toThrow(RangeError);
    expect(() => formatHex([0, Number.POSITIVE_INFINITY, 0])).toThrow(RangeError);
  });
});

describe("transfer functions", () => {
  // IEC 61966-2-1: 0.5 encoded is ((0.5 + 0.055) / 1.055)^2.4 = 0.214041 linear.
  test("sRGB mid value decodes to 0.2140", () => {
    expect(channelToLinear(0.5)).toBeCloseTo(0.214041, 6);
    expect(channelFromLinear(0.214041140482232)).toBeCloseTo(0.5, 12);
  });

  test("0 and 1 are fixed points", () => {
    const [r, g, b] = fromLinear(toLinear([0, 1, 0]));
    expect(r).toBe(0);
    expect(g).toBeCloseTo(1, 15);
    expect(b).toBe(0);
  });

  test("fromLinear inverts toLinear across 0..1", () => {
    for (let i = 0; i <= 1000; i++) {
      const c = i / 1000;
      expect(channelFromLinear(channelToLinear(c))).toBeCloseTo(c, 12);
    }
  });

  // WCAG 2.0 printed 0.03928 as the threshold; no 8-bit value lies between it and 0.04045.
  test("the WCAG 2.0 threshold 0.03928 decodes every 8-bit value identically", () => {
    for (let v = 0; v < 256; v++) {
      const c = v / 255;
      const wcag20 = c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      expect(channelToLinear(c)).toBe(wcag20);
    }
  });

  test("every 8-bit value survives hex to Linear and back", () => {
    for (let v = 0; v < 256; v++) {
      const hex = hexOf(v, 255 - v, (v * 7) % 256);
      expect(linearToHex(hexToLinear(hex))).toBe(hex);
    }
  });
});
