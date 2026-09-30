// A rule that names a check is run against the resolved family. The tests below
// also break a family on purpose to show that each check fails when it should.
import { describe, expect, it } from "vitest";
import { loadFamilies } from "../../lib/model/load.ts";
import { runRuleChecks } from "../../lib/model/checks.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { FamilyFile } from "../../lib/model/types.ts";

const families = loadFamilies();
const fileOf = (id: string): FamilyFile => structuredClone(families.find((f) => f.dir === id)!.file);

describe("rule checks", () => {
  for (const f of families) {
    it(`${f.dir} keeps every rule that names a check`, () => {
      const results = runRuleChecks(resolveFamily(f.file));
      const failed = results.filter((r) => r.failures.length > 0).map((r) => `${r.id} (${r.check}): ${r.failures.join("; ")}`);
      expect(failed).toEqual([]);
    });
  }

  it("runs at least one check for Goney, Jungfrau and Rosebud", () => {
    for (const id of ["goney", "jungfrau", "rosebud"]) {
      const file = families.find((f) => f.dir === id)!.file;
      expect(runRuleChecks(resolveFamily(file)).length, id).toBeGreaterThan(0);
    }
  });

  it("names only checks that exist", () => {
    for (const f of families) {
      for (const r of runRuleChecks(resolveFamily(f.file))) {
        expect(r.failures.some((m) => m.startsWith("no check named")), `${f.dir} ${r.id}`).toBe(false);
      }
    }
  });

  describe("fail when broken on purpose", () => {
    it("accent-only-in-roles: the accent colour on a surface", () => {
      const file = fileOf("goney");
      file.modes.dark.roles.surface = file.modes.dark.roles.accent;
      const results = runRuleChecks(resolveFamily(file)).filter((r) => r.check.startsWith("accent-only-in-roles"));
      expect(results.some((r) => r.failures.length > 0)).toBe(true);
    });

    it("status-achromatic: a chromatic status colour", () => {
      const file = fileOf("rosebud");
      const status = file.modes.dark.status as { neutral: { accent: string } };
      status.neutral.accent = file.modes.dark.accents!.teal!;
      const results = runRuleChecks(resolveFamily(file)).filter((r) => r.check.startsWith("status-achromatic"));
      expect(results.some((r) => r.failures.length > 0)).toBe(true);
    });

    it("accent-not-in-data: the accent in a chart", () => {
      const file = fileOf("rosebud");
      const data = file.modes.light.data as { sequential: { sweep: { colors: string[] } } };
      data.sequential.sweep.colors[0] = file.modes.light.accents!.teal!;
      const results = runRuleChecks(resolveFamily(file)).filter((r) => r.check.startsWith("accent-not-in-data"));
      expect(results.some((r) => r.failures.length > 0)).toBe(true);
    });

    it("hover-direction: a link that hovers the wrong way", () => {
      const file = fileOf("goney");
      const roles = file.modes.dark.roles;
      [roles.link, roles["link-hover"]] = [roles["link-hover"], roles.link];
      const results = runRuleChecks(resolveFamily(file)).filter((r) => r.check === "hover-direction");
      expect(results.some((r) => r.failures.length > 0)).toBe(true);
    });
  });
});
