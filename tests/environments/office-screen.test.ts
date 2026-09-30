// office-screen: every declared pair meets WCAG AA in each mode it covers.
import { describe, expect, it } from "vitest";
import { failures, runProfile } from "../../lib/harness/index.ts";
import { listWarnings, thresholds, withProfile } from "./helpers.ts";

describe("office-screen", () => {
  const families = withProfile("office-screen");

  it("applies to at least one family", () => {
    expect(families.length).toBeGreaterThan(0);
  });

  for (const family of families) {
    it(`${family.meta.id} meets its declared pairs`, () => {
      expect(family.source.pairs?.length ?? 0, "a family that lists office-screen declares pairs").toBeGreaterThan(0);
      const { checks } = runProfile(family, "office-screen", thresholds);
      listWarnings(family.meta.id, "office-screen", failures(checks, "warn"));
      expect(failures(checks)).toEqual([]);
    });
  }
});
