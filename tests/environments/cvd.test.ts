// cvd: every declared distinct set keeps its members apart under normal vision
// and under protan, deutan and tritan simulation, except declared reinforced
// pairs (CVD) and aliases (all gates).
import { describe, expect, it } from "vitest";
import { failures, runProfile } from "../../lib/harness/index.ts";
import { listWarnings, resolvedFamilies, thresholds, withProfile } from "./helpers.ts";

describe("cvd", () => {
  // Declared distinct are a shared test: every family that declares them is checked, listed or not.
  const families = resolvedFamilies.filter((f) => (f.source.distinct?.length ?? 0) > 0);

  it("applies to at least one family", () => {
    expect(families.length).toBeGreaterThan(0);
  });

  it("is declared by every family that lists it", () => {
    for (const f of withProfile("cvd")) expect(f.source.distinct?.length ?? 0, f.meta.id).toBeGreaterThan(0);
  });

  for (const family of families) {
    it(`${family.meta.id} keeps its distinct sets apart`, () => {
      const { checks } = runProfile(family, "cvd", thresholds);
      listWarnings(family.meta.id, "cvd", failures(checks, "warn"));
      expect(failures(checks)).toEqual([]);
    });
  }
});
