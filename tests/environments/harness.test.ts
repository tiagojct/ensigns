// The harness itself: each profile must fail when it should. Every case
// breaks a copy of Pequod's token file on purpose.
import { describe, expect, it } from "vitest";
import { buildReport, cvd, editor, failures, night, officeScreen, statusOf } from "../../lib/harness/index.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { cloneFile, thresholds } from "./helpers.ts";

const resolve = (mutate: (f: ReturnType<typeof cloneFile>) => void) => {
  const f = cloneFile("pequod");
  mutate(f);
  return resolveFamily(f);
};

describe("office-screen fails on a weak pair", () => {
  it("rejects a border used as text", () => {
    const fam = resolve((f) => { f.pairs = [{ fg: "roles.border", bg: "roles.bg", kind: "text" }]; });
    expect(failures(officeScreen(fam, thresholds)).length).toBeGreaterThan(0);
  });

  it("accepts body text on the page", () => {
    const fam = resolve((f) => { f.pairs = [{ fg: "roles.text", bg: "roles.bg", kind: "text" }]; });
    expect(failures(officeScreen(fam, thresholds))).toEqual([]);
  });

  it("reports AAA and APCA without failing", () => {
    const fam = resolve((f) => { f.pairs = [{ fg: "roles.text-muted", bg: "roles.bg", kind: "text" }]; });
    const checks = officeScreen(fam, thresholds);
    // Two modes, each with one AAA line and one APCA line.
    expect(checks.filter((c) => c.report).length).toBe(4);
    expect(failures(checks, "warn")).toEqual([]);
  });
});

describe("editor fails when a syntax role disappears into a surface", () => {
  it("rejects a keyword drawn in the editor background colour", () => {
    const fam = resolve((f) => { f.modes.dark.syntax!.keyword = f.modes.dark.surfaces!.editor as string; });
    expect(failures(editor(fam, thresholds)).some((d) => d.includes("syntax.keyword"))).toBe(true);
  });

  it("reports a missing surface", () => {
    const fam = resolve((f) => { delete f.modes.light.surfaces!["editor-line"]; });
    expect(failures(editor(fam, thresholds)).some((d) => d.includes("editor-line"))).toBe(true);
  });
});

describe("cvd fails on shared hex and on close pairs", () => {
  it("rejects two members with one colour unless they are aliases", () => {
    const shared = resolve((f) => { f.distinct = [{ id: "crew", set: "accents" }]; f.modes.dark.accents!.ahab = f.modes.dark.accents!.pip!; });
    expect(failures(cvd(shared, thresholds)).some((d) => d.includes("ahab") && d.includes("pip"))).toBe(true);
    const aliased = resolve((f) => { f.distinct = [{ id: "crew", set: "accents", modes: ["dark"], aliases: [["ahab", "pip"]], cvd: "report" }]; f.modes.dark.accents!.ahab = f.modes.dark.accents!.pip!; });
    expect(failures(cvd(aliased, thresholds)).filter((d) => d.includes("ahab") && d.includes("pip"))).toEqual([]);
  });

  it("lets a reinforced pair through the CVD gate but not the normal-vision gate", () => {
    // Ishmael and Tashtego (dark) are close under every view; declare them reinforced.
    const plain = resolve((f) => { f.distinct = [{ id: "crew", set: "accents", modes: ["dark"] }]; });
    const plainChecks = cvd(plain, thresholds);
    expect(plainChecks.some((c) => c.id === "crew: deutan" && !c.ok)).toBe(true);
    const reinforced = resolve((f) => {
      const all = Object.keys(f.modes.dark.accents!);
      const pairs: [string, string][] = [];
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) pairs.push([all[i]!, all[j]!]);
      f.distinct = [{ id: "crew", set: "accents", modes: ["dark"], reinforced: pairs }];
    });
    const r = cvd(reinforced, thresholds);
    expect(r.filter((c) => c.id !== "crew: normal" && c.id !== "crew: no shared hex").every((c) => c.ok)).toBe(true);
  });

  it("demotes CVD failures to warnings when a set says cvd report", () => {
    const fam = resolve((f) => { f.distinct = [{ id: "crew", set: "accents", modes: ["dark"], cvd: "report" }]; });
    const checks = cvd(fam, thresholds);
    const cvdFails = checks.filter((c) => c.id.startsWith("crew: ") && ["protan", "deutan", "tritan"].some((v) => c.id.endsWith(v)) && !c.ok);
    expect(cvdFails.length).toBeGreaterThan(0);
    expect(cvdFails.every((c) => c.level === "warn")).toBe(true);
  });
});

describe("night fails on glare", () => {
  it("rejects a brightness above the cap and a blue text role", () => {
    const fam = resolve((f) => {
      f.modes.dark.syntax!.function = f.modes.dark.accents!.starbuck!;
    });
    const checks = night(fam, thresholds);
    expect(failures(checks).some((d) => d.includes("above luminance"))).toBe(true);
  });
});

describe("the report", () => {
  it("summarises the profiles a family lists", () => {
    const report = buildReport(resolve(() => {}), thresholds);
    expect(report.family).toBe("pequod");
    expect(Object.keys(report.profiles).sort()).toEqual(["cvd", "editor", "office-screen"]);
  });

  it("marks forced-colors as external and an unknown profile as not implemented", () => {
    const report = buildReport(resolve((f) => { f.meta.environments = ["forced-colors", "hologram" as never]; }), thresholds);
    expect(report.profiles["forced-colors"]!.status).toBe("external");
    expect(report.profiles.hologram!.status).toBe("not-implemented");
  });

  it("derives a status from the checks", () => {
    expect(statusOf([{ profile: "p", id: "a", ok: true, level: "error", detail: "" }])).toBe("pass");
    expect(statusOf([{ profile: "p", id: "a", ok: false, level: "warn", detail: "" }])).toBe("warn");
    expect(statusOf([{ profile: "p", id: "a", ok: false, level: "error", detail: "" }])).toBe("fail");
    expect(statusOf([{ profile: "p", id: "a", ok: false, level: "error", report: true, detail: "" }])).toBe("pass");
  });
});
