import { describe, expect, test } from "vitest";
import { blend } from "../../../lib/colour/index.ts";

describe("blend", () => {
  test("alpha 0 gives the background and alpha 1 the foreground", () => {
    for (const [fg, bg] of [
      ["#000000", "#FFFFFF"],
      ["#CC6677", "#117733"],
      ["#F0E442", "#332288"],
    ] as const) {
      expect(blend(fg, 0, bg)).toBe(bg);
      expect(blend(fg, 1, bg)).toBe(fg);
    }
  });

  // 0.5 * 255 = 127.5, which rounds half up to 128 (0x80).
  test("alpha 0.5 averages the encoded channels", () => {
    expect(blend("#000000", 0.5, "#FFFFFF")).toBe("#808080");
    expect(blend("#FF0000", 0.5, "#0000FF")).toBe("#800080");
    expect(blend("#336699", 0.5, "#CC6677")).toBe("#806688");
  });

  // Averaging in linear light would give 0.5 linear, which encodes to 0xBC.
  test("blends gamma-encoded values, not linear light", () => {
    expect(blend("#000000", 0.5, "#FFFFFF")).not.toBe("#BCBCBC");
  });

  test("rejects alpha outside 0..1", () => {
    for (const alpha of [-0.1, 1.1, Number.NaN]) {
      expect(() => blend("#000000", alpha, "#FFFFFF")).toThrow(RangeError);
    }
  });
});
