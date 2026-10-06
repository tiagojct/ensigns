// A rule that names a check is run against the resolved family. The tests below
// also break a family on purpose to show that each check fails when it should.
import { describe, expect, it } from "vitest";
import { loadFamilies } from "../../lib/model/load.ts";
import { fromOklch } from "../../lib/colour/oklab.ts";
import { RULE_CHECKS, hueClass, runRuleChecks } from "../../lib/model/checks.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { MODES } from "../../lib/model/types.ts";
import type { FamilyFile, ResolvedFamily } from "../../lib/model/types.ts";

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

  describe("the pair checks", () => {
    const pequod = resolveFamily(fileOf("pequod"));
    const run = (name: string, ...args: string[]) => RULE_CHECKS[name]!({ family: pequod, args });

    it("classifies hues by OKLCH angle", () => {
      const pure = { red: "#FF0000", yellow: "#FFFF00", green: "#00FF00", cyan: "#00FFFF", blue: "#0000FF", magenta: "#FF00FF", orange: "#FF8000", violet: "#8000FF" };
      for (const [name, hex] of Object.entries(pure)) expect(hueClass(hex), name).toBe(name);
      expect(hueClass("#808080")).toBe("neutral");
    });

    it("not-red-green fails Ahab against Tashtego and passes Ahab against Starbuck", () => {
      expect(run("not-red-green", "accents.ahab", "accents.tashtego").length).toBeGreaterThan(0);
      expect(run("not-red-green", "accents.tashtego", "accents.ahab").length).toBeGreaterThan(0);
      expect(run("not-red-green", "accents.ahab", "accents.starbuck")).toEqual([]);
    });

    it("not-blue-green and not-blue-violet catch their pairs and only those", () => {
      expect(run("not-blue-green", "accents.starbuck", "accents.tashtego").length).toBeGreaterThan(0);
      expect(run("not-blue-green", "accents.starbuck", "accents.ahab")).toEqual([]);
      expect(run("not-blue-violet", "accents.starbuck", "accents.starbuck")).toEqual([]);
    });

    it("not-blue-violet fails a violet against Starbuck in both modes, in either order", () => {
      // Pequod has no violet accent, so a copy of the resolved family gets one in each mode.
      const violet = { hex: fromOklch(0.6, 0.15, 300), from: "test" };
      expect(hueClass(violet.hex)).toBe("violet");
      const modes = Object.fromEntries(
        MODES.map((m) => [m, { ...pequod.modes[m], colours: new Map(pequod.modes[m].colours).set("accents.violet", violet) }]),
      ) as ResolvedFamily["modes"];
      const family: ResolvedFamily = { ...pequod, modes };
      for (const args of [["accents.starbuck", "accents.violet"], ["accents.violet", "accents.starbuck"]]) {
        const failures = RULE_CHECKS["not-blue-violet"]!({ family, args });
        expect(failures.map((f) => f.split(":")[0])).toEqual(["dark", "light"]);
      }
      // The same pair is not a blue-green or a red-green confusion.
      expect(RULE_CHECKS["not-blue-green"]!({ family, args: ["accents.starbuck", "accents.violet"] })).toEqual([]);
    });

    it("lightness-gap wants the stated L*", () => {
      expect(run("lightness-gap", "roles.text", "roles.bg", "40")).toEqual([]);
      expect(run("lightness-gap", "roles.text", "roles.text-muted", "40").length).toBeGreaterThan(0);
    });

    it("lightness-gap rejects a negative minimum, which would pass every pair", () => {
      // roles.text and roles.text-muted are 40 L* apart or less, so a minimum of zero passes and -1 must not.
      expect(run("lightness-gap", "roles.text", "roles.text-muted", "0")).toEqual([]);
      const failures = run("lightness-gap", "roles.text", "roles.text-muted", "-1");
      expect(failures.map((f) => f.split(":")[0])).toEqual(["dark", "light"]);
      expect(failures.every((f) => f.includes("minimum"))).toBe(true);
    });

    it("reports a missing address or a missing minimum", () => {
      expect(run("not-red-green", "accents.ahab", "accents.nobody").length).toBeGreaterThan(0);
      expect(run("lightness-gap", "roles.text", "roles.bg").length).toBeGreaterThan(0);
    });
  });
});
