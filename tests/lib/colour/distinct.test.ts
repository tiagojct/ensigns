import { describe, expect, test } from "vitest";
import {
  greyscaleHex,
  lstar,
  lstarDistance,
  minPairwise,
  oklabDistance,
  pairwiseDistances,
  simulateCvd,
} from "../../../lib/colour/index.ts";

// For a neutral grey OKLab has a = b = 0 and L equal to the cube root of the linear value,
// because the rows of Ottosson's (2020) matrices sum to 1.
const oklabL = (v: number): number => Math.cbrt(((v / 255 + 0.055) / 1.055) ** 2.4);

const set = ["#000000", "#FFFFFF", "#808080", "#7F7F7F"];

describe("pairwiseDistances", () => {
  test("lists every pair i < j in order, with the input colours", () => {
    const pairs = pairwiseDistances(set);
    expect(pairs.map((p) => [p.i, p.j])).toEqual([
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ]);
    expect(pairs[5]).toMatchObject({ a: "#808080", b: "#7F7F7F" });
  });

  test("returns no pairs for fewer than two colours", () => {
    expect(pairwiseDistances([])).toEqual([]);
    expect(pairwiseDistances(["#000000"])).toEqual([]);
  });
});

describe("minPairwise", () => {
  test("finds the two neighbouring greys in OKLab", () => {
    const m = minPairwise(set);
    expect(m.pair).toEqual([2, 3]);
    expect(m.a).toBe("#808080");
    expect(m.b).toBe("#7F7F7F");
    expect(m.min).toBeCloseTo(oklabL(128) - oklabL(127), 10);
  });

  test("measures after the transform, and reports the input colours", () => {
    // Pure red and the grey of the same luminance become the same grey.
    const m = minPairwise(["#FF0000", "#7F7F7F", "#0000FF"], oklabDistance, greyscaleHex);
    expect(m).toEqual({ min: 0, a: "#FF0000", b: "#7F7F7F", pair: [0, 1] });
  });

  test("red and green move closer under deuteranopia", () => {
    const primaries = ["#FF0000", "#00FF00", "#0000FF"];
    const normal = minPairwise(primaries);
    const deutan = minPairwise(primaries, oklabDistance, (hex) => simulateCvd(hex, "deutan"));
    expect(deutan.pair).toEqual([0, 1]);
    expect(deutan.min).toBeLessThan(normal.min);
  });

  test("accepts any distance, such as L*", () => {
    const m = minPairwise(["#000000", "#FFFFFF", "#777777"], lstarDistance);
    expect(m.pair).toEqual([1, 2]);
    expect(m.min).toBeCloseTo(100 - lstar("#777777"), 10);
  });

  test("a tie goes to the first pair", () => {
    expect(minPairwise(["#336699", "#336699", "#336699"]).pair).toEqual([0, 1]);
  });

  test("throws with fewer than two colours", () => {
    expect(() => minPairwise([])).toThrow(RangeError);
    expect(() => minPairwise(["#000000"])).toThrow(RangeError);
  });
});
