import { describe, expect, test } from "vitest";
import { lstar, photocopy } from "../../../lib/colour/index.ts";

describe("photocopy", () => {
  // CIE L* of the greys either side of each threshold: 0xDC 87.76, 0xDD 88.12, 0x2B 17.53, 0x2C 18.00.
  test("the test greys sit either side of the thresholds", () => {
    expect(lstar("#DCDCDC")).toBeLessThan(88);
    expect(lstar("#DDDDDD")).toBeGreaterThan(88);
    expect(lstar("#2B2B2B")).toBeLessThan(18);
    expect(lstar("#2C2C2C")).toBeGreaterThan(18);
  });

  test("L* above 88 becomes white", () => {
    expect(photocopy("#DDDDDD")).toEqual({ hex: "#FFFFFF", rule: "white" });
    expect(photocopy("#FFFF00")).toEqual({ hex: "#FFFFFF", rule: "white" });
  });

  test("L* below 18 becomes black", () => {
    expect(photocopy("#2B2B2B")).toEqual({ hex: "#000000", rule: "black" });
    expect(photocopy("#000080")).toEqual({ hex: "#000000", rule: "black" });
  });

  test("anything between keeps its grey value", () => {
    expect(photocopy("#DCDCDC")).toEqual({ hex: "#DCDCDC", rule: "grey" });
    expect(photocopy("#2C2C2C")).toEqual({ hex: "#2C2C2C", rule: "grey" });
    expect(photocopy("#FF0000")).toEqual({ hex: "#7F7F7F", rule: "grey" });
  });
});
