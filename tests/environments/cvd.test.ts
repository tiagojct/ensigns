// cvd: every declared distinct set keeps its members apart under normal vision
// and under protan, deutan and tritan simulation, except declared reinforced
// pairs (CVD) and aliases (all gates).
import { describe, expect, it } from "vitest";
import { failures, runProfile } from "../../lib/harness/index.ts";
import { listWarnings, thresholds, withProfile } from "./helpers.ts";

describe("cvd", () => {
  const families = withProfile("cvd");

  it("applies to at least one family", () => {
    expect(families.length).toBeGreaterThan(0);
  });

  for (const family of families) {
    it(`${family.meta.id} keeps its distinct sets apart`, () => {
      expect(family.source.distinct?.length ?? 0, "a family that lists cvd declares distinct sets").toBeGreaterThan(0);
      const { checks } = runProfile(family, "cvd", thresholds);
      listWarnings(family.meta.id, "cvd", failures(checks, "warn"));
      expect(failures(checks)).toEqual([]);
    });
  }
});
