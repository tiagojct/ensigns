// night: a dark ground in a luminance band, body text at 7:1 to 11:1, a
// brightness cap, no blue text, and a dimmed lamplight paper.
import { describe, expect, it } from "vitest";
import { failures, runProfile } from "../../lib/harness/index.ts";
import { listWarnings, thresholds, withProfile } from "./helpers.ts";

describe("night", () => {
  const families = withProfile("night");

  it("applies to at least one family", () => {
    expect(families.length).toBeGreaterThan(0);
  });

  for (const family of families) {
    it(`${family.meta.id} is comfortable in a dark room`, () => {
      const { checks } = runProfile(family, "night", thresholds);
      listWarnings(family.meta.id, "night", failures(checks, "warn"));
      expect(checks.filter((c) => !c.report).length, "the profile checked something").toBeGreaterThan(6);
      expect(failures(checks)).toEqual([]);
    });
  }
});
