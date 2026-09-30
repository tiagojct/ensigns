// The profiles that simulate a viewing condition or compare a family with a
// reference: every family that lists one passes it. A family that lists a
// profile and declares nothing for it fails inside the profile, so a listing
// is never empty.
import { describe, expect, it } from "vitest";
import { PROFILE_RUNNERS, failures, runProfile } from "../../lib/harness/index.ts";
import type { Environment } from "../../lib/model/types.ts";
import { listWarnings, thresholds, withProfile } from "./helpers.ts";

const PROFILES: Environment[] = ["projector", "sunlight", "aged-eye", "print-grey", "eink", "photocopy", "overlay", "clinical", "figure"];

describe("profiles that simulate a viewing condition", () => {
  it("has a runner for every one of them", () => {
    for (const p of PROFILES) expect(PROFILE_RUNNERS[p], p).toBeTypeOf("function");
  });

  for (const profile of PROFILES) {
    for (const family of withProfile(profile)) {
      it(`${family.meta.id} passes ${profile}`, () => {
        const { checks } = runProfile(family, profile, thresholds);
        listWarnings(family.meta.id, profile, failures(checks, "warn"));
        expect(checks.filter((c) => !c.report).length, "the profile checked something").toBeGreaterThan(0);
        expect(failures(checks)).toEqual([]);
      });
    }
  }
});
