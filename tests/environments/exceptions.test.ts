// An exception is a check a family is allowed to fail, with a reason. It must
// not outlive its cause: each one has to match a check that still fails.
import { describe, expect, it } from "vitest";
import { runProfile } from "../../lib/harness/index.ts";
import { resolvedFamilies, thresholds } from "./helpers.ts";

describe("exceptions", () => {
  for (const family of resolvedFamilies) {
    const exceptions = family.source.exceptions ?? [];
    if (exceptions.length === 0) continue;
    describe(family.meta.id, () => {
      for (const profile of new Set(exceptions.map((e) => e.profile))) {
        it(`every ${profile} exception matches a failing check`, () => {
          const { unused } = runProfile(family, profile, thresholds);
          expect(unused.map((e) => `${e.profile}: ${e.id}${e.mode ? ` (${e.mode})` : ""}`)).toEqual([]);
        });
      }
      it("gives every exception a reason of some length", () => {
        for (const e of exceptions) expect(e.why.length, e.id).toBeGreaterThan(30);
      });
    });
  }

  it("is used sparingly", () => {
    const total = resolvedFamilies.reduce((n, f) => n + (f.source.exceptions?.length ?? 0), 0);
    expect(total).toBeLessThanOrEqual(6);
  });
});
