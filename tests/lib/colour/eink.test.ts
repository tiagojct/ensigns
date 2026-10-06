import { describe, expect, test } from "vitest";
import { einkLevelDistance, quantiseEink } from "../../../lib/colour/index.ts";
import { greys, hexOf } from "./helpers.ts";

describe("quantiseEink", () => {
  test("black is level 0 and white is level 15", () => {
    expect(quantiseEink("#000000")).toEqual({ level: 0, hex: "#000000" });
    expect(quantiseEink("#FFFFFF")).toEqual({ level: 15, hex: "#FFFFFF" });
  });

  // 16 evenly spaced gamma-encoded levels are the multiples of 255 / 15 = 17.
  test("the 16 levels are the greys 0x00, 0x11, ... 0xFF, and each maps to itself", () => {
    for (let level = 0; level < 16; level++) {
      const hex = hexOf(17 * level, 17 * level, 17 * level);
      expect(quantiseEink(hex)).toEqual({ level, hex });
    }
  });

  test("every 8-bit grey lands on the nearest level", () => {
    greys.forEach((hex, v) => expect(quantiseEink(hex).level, hex).toBe(Math.round(v / 17)));
  });

  // Y(red) = 0.2126 encodes to 0.498, which is 7.48 of 15.
  test("colours are quantised by their luminance", () => {
    expect(quantiseEink("#FF0000")).toEqual({ level: 7, hex: "#777777" });
  });

  test("two levels split at mid-grey", () => {
    expect(quantiseEink("#7F7F7F", 2)).toEqual({ level: 0, hex: "#000000" });
    expect(quantiseEink("#808080", 2)).toEqual({ level: 1, hex: "#FFFFFF" });
  });

  test("rejects fewer than 2 levels or a fractional count", () => {
    expect(() => quantiseEink("#808080", 1)).toThrow(RangeError);
    expect(() => quantiseEink("#808080", 2.5)).toThrow(RangeError);
  });
});

describe("einkLevelDistance", () => {
  test("black to white is 15 levels; order does not matter", () => {
    expect(einkLevelDistance("#000000", "#FFFFFF")).toBe(15);
    expect(einkLevelDistance("#FFFFFF", "#000000")).toBe(15);
    expect(einkLevelDistance("#808080", "#848484")).toBe(0);
    expect(einkLevelDistance("#000000", "#FFFFFF", 4)).toBe(3);
  });
});
