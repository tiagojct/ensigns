// An exception is a check a family is allowed to fail, with a reason. It must
// not outlive its cause: each one has to match a check that still fails.
import { describe, expect, it } from "vitest";
import { PROFILE_RUNNERS, runProfile } from "../../lib/harness/index.ts";
import { resolvedFamilies, thresholds } from "./helpers.ts";

describe("exceptions", () => {
  for (const family of resolvedFamilies) {
    const exceptions = family.source.exceptions ?? [];
    if (exceptions.length === 0) continue;
    describe(family.meta.id, () => {
      // forced-colors exceptions are checked by the browser test itself, which fails when one goes stale.
      for (const profile of new Set(exceptions.map((e) => e.profile).filter((p) => p in PROFILE_RUNNERS))) {
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
