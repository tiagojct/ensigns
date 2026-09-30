import { describe, expect, test } from "vitest";
import { apcaLc } from "../../../lib/colour/apca.ts";

// apca-w3 0.1.9 README: calcAPCA "returns a signed float -108.0 to 106.0 (approx)", the two
// ends being black text on white and white text on black. The two decimals are the values
// apca-w3 0.1.9 returns (106.0407 and -107.8847).
describe("apcaLc", () => {
  test("black text on white is about +106", () => {
    expect(apcaLc("#000000", "#FFFFFF")).toBeCloseTo(106.04, 2);
  });

  test("white text on black is about -108", () => {
    expect(apcaLc("#FFFFFF", "#000000")).toBeCloseTo(-107.88, 2);
  });

  test("the sign follows polarity, so the order matters", () => {
    expect(apcaLc("#333333", "#EEEEEE")).toBeGreaterThan(0);
    expect(apcaLc("#EEEEEE", "#333333")).toBeLessThan(0);
    expect(apcaLc("#EEEEEE", "#333333")).not.toBe(-apcaLc("#333333", "#EEEEEE"));
  });

  test("identical colours give 0", () => {
    expect(apcaLc("#123456", "#123456")).toBe(0);
  });

  test("accepts 3-digit and lower-case hex", () => {
    expect(apcaLc("#000", "#fff")).toBe(apcaLc("#000000", "#FFFFFF"));
  });

  // calcAPCA itself reads unparseable input as black and returns about 106 here.
  test("throws on invalid colours", () => {
    expect(() => apcaLc("nonsense", "#FFFFFF")).toThrow(/Not a hex colour/);
    expect(() => apcaLc("#000000", "#FFFFFFF")).toThrow(/Not a hex colour/);
  });
});
