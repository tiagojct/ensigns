// Jeroboam: the structural promises of the brief. The harness tests already run every profile over every family;
// these cases lock what is specific to this one: the levels and their order, the protocol numbers, the hues, the
// neutral chrome, the declarations that stand in for floors, and the targets it leaves out.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lstar } from "../../lib/colour/grey.ts";
import { oklabDistance, toOklch } from "../../lib/colour/oklab.ts";
import { buildReport, failures } from "../../lib/harness/index.ts";
import { loadCandidates, loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { CORE_ROLES, MODES } from "../../lib/model/types.ts";
import type { ModeName } from "../../lib/model/types.ts";

const file = loadFamilies().find((f) => f.dir === "jeroboam")!.file;
const family = resolveFamily(file);
const thresholds = JSON.parse(readFileSync(join(repoRoot(), "tests/environments.json"), "utf8"));
const hex = (m: ModeName, address: string) => family.modes[m].colours.get(address)!.hex;
const clinical = file.design!.clinical!;
const TRIAGE = ["blue", "green", "yellow", "orange", "red"];
// The hue windows of the brief, in OKLCH degrees.
const WINDOW: Record<string, [number, number]> = { red: [20, 40], orange: [50, 75], yellow: [95, 115], green: [135, 160], blue: [240, 265] };

describe("jeroboam", () => {
  it("lists the four environments of the brief and nothing else", () => {
    expect(file.meta.environments).toEqual(["office-screen", "clinical", "cvd", "print-grey"]);
    expect(file.meta.version).toBe("0.1.0");
    expect(file.meta.chapter).toBe(71);
  });

  it("declares three severity levels, lowest first, and names the critical one", () => {
    expect(clinical.levels.map((l) => l.name)).toEqual(["info", "caution", "critical"]);
    expect(clinical.critical).toBe("critical");
  });

  it("declares the five Manchester levels, least urgent first, with the protocol numbers and target times", () => {
    expect(clinical.triage!.map((l) => l.name)).toEqual(TRIAGE);
    const tokens = file.design!.triage as Record<string, { number: number; "target-minutes": number }>;
    expect(TRIAGE.map((n) => tokens[n]!.number)).toEqual([5, 4, 3, 2, 1]);
    expect(TRIAGE.map((n) => tokens[n]!["target-minutes"])).toEqual([240, 120, 60, 10, 0]);
    expect(new Set(clinical.triage!.map((l) => l.label)).size).toBe(5);
    expect(new Set(clinical.triage!.map((l) => l.icon)).size).toBe(5);
  });

  it("keeps each triage hue in the region where its name is read, in both modes", () => {
    for (const m of MODES) {
      for (const level of clinical.triage!) {
        const { h } = toOklch(hex(m, level.border));
        const [lo, hi] = WINDOW[level.name]!;
        expect(h, `${level.name} in ${m}`).toBeGreaterThanOrEqual(lo);
        expect(h, `${level.name} in ${m}`).toBeLessThanOrEqual(hi);
      }
    }
  });

  it("makes status.danger the critical red, and the severity levels reuse the triage colours", () => {
    for (const m of MODES) {
      expect(hex(m, "status.danger")).toBe(hex(m, "extra.critical-border"));
      expect(hex(m, "extra.critical-border")).toBe(hex(m, "extra.triage-red-border"));
      expect(hex(m, "extra.caution-border")).toBe(hex(m, "extra.triage-yellow-border"));
      expect(hex(m, "extra.info-border")).toBe(hex(m, "extra.triage-blue-border"));
      expect(hex(m, "status.success")).toBe(hex(m, "extra.triage-green-border"));
    }
  });

  it("keeps the chrome neutral: every core role has OKLCH chroma under 0.04", () => {
    for (const m of MODES) for (const role of CORE_ROLES) expect(toOklch(hex(m, `roles.${role}`)).C, `${role} in ${m}`).toBeLessThan(0.04);
  });

  it("keeps red for critical: nothing outside the status tokens is within 0.10 of it", () => {
    const declared = new Set<string>();
    for (const list of [clinical.levels, clinical.triage!]) for (const l of list) for (const a of [l.fg, l.fill, l.border]) declared.add(a);
    for (const m of MODES) {
      const red = hex(m, "extra.critical-border");
      for (const [address, c] of family.modes[m].colours) {
        if (declared.has(address) || address.startsWith("status.")) continue;
        expect(oklabDistance(red, c.hex), `${address} in ${m}`).toBeGreaterThanOrEqual(0.1);
      }
    }
  });

  it("declares colour vision sets with no floor and reinforces no pair", () => {
    for (const d of file.distinct!) {
      expect(d.min ?? 0.06, d.id).toBeGreaterThanOrEqual(0.06);
      expect(d.cvd, d.id).not.toBe("report");
      expect(d.reinforced, d.id).toBeUndefined();
      expect(d.patterned, d.id).toBeUndefined();
    }
    const flags = file.distinct!.find((d) => d.id === "flags")!;
    expect(flags.members).toHaveLength(9);
    expect(file.distinct!.find((d) => d.id === "link-and-accent")!.members).toEqual(expect.arrayContaining(["roles.link", "roles.accent"]));
  });

  it("holds 12 L* between every pair of triage borders in greyscale, in both modes", () => {
    for (const m of MODES) {
      for (let i = 0; i < TRIAGE.length; i++) {
        for (let j = i + 1; j < TRIAGE.length; j++) {
          const gap = Math.abs(lstar(hex(m, `extra.triage-${TRIAGE[i]}-border`)) - lstar(hex(m, `extra.triage-${TRIAGE[j]}-border`)));
          expect(gap, `${TRIAGE[i]} and ${TRIAGE[j]} in ${m}`).toBeGreaterThanOrEqual(12);
        }
      }
    }
  });

  it("declares a text pair for every level, so the simulation profiles read them", () => {
    const declared = new Set((file.pairs ?? []).map((p) => `${p.fg} on ${p.bg}`));
    for (const list of [clinical.levels, clinical.triage!]) for (const l of list) expect(declared.has(`${l.fg} on ${l.fill}`), l.name).toBe(true);
    for (const a of ["roles.text on roles.bg", "roles.text-muted on roles.bg", "roles.link on roles.bg", "roles.on-button on roles.button", "roles.on-accent on roles.accent"]) expect(declared.has(a), a).toBe(true);
  });

  it("passes every profile it lists with no error and no waiver", () => {
    expect(file.exceptions).toBeUndefined();
    const report = buildReport(family, thresholds);
    for (const env of file.meta.environments) {
      const profile = report.profiles[env]!;
      expect(profile.status, env).toBe("pass");
      expect(profile.waived, env).toBe(0);
      expect(failures(profile.checks), env).toEqual([]);
    }
  });

  it("leaves out the editor and terminal bundles and names its two fonts", () => {
    expect(file.targets?.exclude).toEqual(["vscode", "zed", "neovim", "terminals"]);
    expect(file.typography).toEqual({ sans: "Inter", mono: "JetBrains Mono" });
  });

  it("offers one candidate, royal-blue, which reinforces two pairs in the light mode and passes every profile", () => {
    const candidates = loadCandidates().filter((c) => c.dir === "jeroboam");
    expect(candidates.map((c) => c.candidate)).toEqual(["royal-blue"]);
    const royal = candidates[0]!.file;
    expect(royal.meta.environments).toEqual(file.meta.environments);
    const reinforced = royal.distinct!.filter((d) => d.reinforced).map((d) => ({ id: d.id, modes: d.modes, pairs: d.reinforced }));
    expect(reinforced).toEqual([
      { id: "severity-light", modes: ["light"], pairs: [["extra.info-border", "extra.critical-border"]] },
      { id: "triage-light", modes: ["light"], pairs: [["extra.triage-yellow-border", "extra.triage-orange-border"], ["extra.triage-blue-border", "extra.triage-red-border"]] },
    ]);
    const light = resolveFamily(royal).modes.light.colours;
    const grey = (a: string) => lstar(light.get(a)!.hex);
    expect(Math.abs(grey("extra.triage-blue-border") - grey("extra.triage-red-border"))).toBeLessThan(12);
    expect(grey("extra.triage-blue-border")).toBeGreaterThan(lstar(hex("light", "extra.triage-blue-border")) + 10);
    for (const [env, profile] of Object.entries(buildReport(resolveFamily(royal), thresholds).profiles)) expect(failures(profile.checks), env).toEqual([]);
  });

  it("maps alarm priorities onto the levels, and keeps orange out of them", () => {
    const alarm = file.design!.alarm as Record<string, string>;
    expect(alarm).toEqual({ high: "critical", medium: "caution", low: "info" });
    expect(clinical.levels.map((l) => l.name)).not.toContain("orange");
  });
});
