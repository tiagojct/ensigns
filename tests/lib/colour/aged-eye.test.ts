import { describe, expect, test } from "vitest";
import {
  agedEye,
  applyFlare,
  flareLinear,
  greyFromLuminance,
  hexToLinear,
  linearToHex,
  simulateCvd,
  simulateCvdLinear,
} from "../../../lib/colour/index.ts";
import { greys, grid4096, stepDifference } from "./helpers.ts";

describe("agedEye", () => {
  test("is tritan at severity 0.5 then flare 0.02, in linear light", () => {
    for (const hex of grid4096().filter((_, i) => i % 13 === 0)) {
      const expected = linearToHex(flareLinear(simulateCvdLinear(hexToLinear(hex), "tritan", 0.5), 0.02));
      expect(agedEye(hex)).toBe(expected);
    }
  });

  // Rounding once instead of after each step changes the result by at most 1 step.
  test("agrees with the two public steps applied in turn, within 1 step", () => {
    for (const hex of grid4096()) {
      expect(stepDifference(agedEye(hex), applyFlare(simulateCvd(hex, "tritan", 0.5), 0.02)), hex).toBeLessThanOrEqual(1);
    }
  });

  test("black becomes the grey of luminance 0.02 and white stays white", () => {
    expect(agedEye("#000000")).toBe(greyFromLuminance(0.02));
    expect(agedEye("#FFFFFF")).toBe("#FFFFFF");
  });

  test("greys stay grey", () => {
    for (const hex of greys) {
      const out = agedEye(hex);
      expect(stepDifference(out, greyFromLuminance(hexToLinear(hex)[0] + 0.02)), hex).toBeLessThanOrEqual(1);
    }
  });
});
