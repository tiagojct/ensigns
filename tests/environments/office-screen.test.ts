// office-screen: every declared pair meets WCAG AA in each mode it covers.
import { describe, expect, it } from "vitest";
import { failures, runProfile } from "../../lib/harness/index.ts";
import { listWarnings, resolvedFamilies, thresholds, withProfile } from "./helpers.ts";

describe("office-screen", () => {
  // Declared pairs are a shared test: every family that declares them is checked, listed or not.
  const families = resolvedFamilies.filter((f) => (f.source.pairs?.length ?? 0) > 0);

  it("applies to at least one family", () => {
    expect(families.length).toBeGreaterThan(0);
  });

  it("is declared by every family that lists it", () => {
    for (const f of withProfile("office-screen")) expect(f.source.pairs?.length ?? 0, f.meta.id).toBeGreaterThan(0);
  });

  for (const family of families) {
    it(`${family.meta.id} meets its declared pairs`, () => {
      const { checks } = runProfile(family, "office-screen", thresholds);
      listWarnings(family.meta.id, "office-screen", failures(checks, "warn"));
      expect(failures(checks)).toEqual([]);
    });
  }
});
