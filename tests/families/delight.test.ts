// Delight 0.1.0: unit tests locking the invariant properties of Delight.
import { describe, expect, it } from "vitest";
import { einkLevelDistance, quantiseEink } from "../../lib/colour/eink.ts";
import { lstar, lstarDistance } from "../../lib/colour/grey.ts";
import { contrastRatio } from "../../lib/colour/wcag.ts";
import { loadFamilies } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { MODES } from "../../lib/model/types.ts";

const loaded = loadFamilies().find((f) => f.dir === "delight")!;
const file = loaded.file;
const family = resolveFamily(file);
const colour = (mode: "dark" | "light", address: string): string => family.modes[mode].colours.get(address)!.hex;

describe("Delight", () => {
  it("is chapter 131 with the environments of its brief and no editor bundle", () => {
    expect(file.meta.id).toBe("delight");
    expect(file.meta.version).toBe("0.1.0");
    expect(file.meta.chapter).toBe(131);
    expect(file.meta.chapterTitle).toBe("The Pequod Meets The Delight");
    expect(file.meta.quote).toBe("another ship, most miserably misnamed the Delight, was descried.");
    expect(file.meta.environments).toEqual(["print-grey", "eink", "photocopy", "forced-colors", "cvd"]);
    expect(file.targets?.exclude).toEqual(["vscode", "zed", "neovim"]);
  });

  it("defines a 16-level grey ramp that maps exactly onto 16 e-ink levels", () => {
    const grey = file.palette.grey as Record<string, string>;
    expect(Object.keys(grey).length).toBe(16);
    for (let i = 0; i < 16; i++) {
      const hex = grey[`g${i}`];
      expect(hex, `level ${i}`).toBeDefined();
      const q = quantiseEink(hex!, 16);
      expect(q.level, `quantised level for g${i}`).toBe(i);
    }
  });

  it("keeps every declared text pair at 7:1 or more in both modes", () => {
    for (const mode of MODES) {
      for (const p of file.pairs ?? []) {
        if (p.kind !== "text") continue;
        const fg = colour(mode, p.fg);
        const bg = colour(mode, p.bg);
        const ratio = contrastRatio(fg, bg);
        expect(ratio, `${p.fg} on ${p.bg} in ${mode}`).toBeGreaterThanOrEqual(7.0);
      }
    }
  });

  it("declares an achromatic status block with four levels", () => {
    for (const mode of MODES) {
      const status = file.modes[mode].status as Record<string, any>;
      expect(status.policy).toBe("achromatic");
      for (const level of ["neutral", "success", "warning", "critical"]) {
        expect(status[level], `${mode} ${level}`).toBeDefined();
        expect(status[level].weight).toMatch(/^{design\./);
        expect(["solid", "dashed", "dotted", "double"]).toContain(status[level].edge);
        expect(status[level].icon).toBeTruthy();
        expect(status[level].accent).toMatch(/^{palette\.grey\./);
      }
    }
  });

  it("defines pattern, line and marker tokens in design", () => {
    const design = file.design as Record<string, any>;
    expect(design.patterns).toBeDefined();
    expect(design.lines).toBeDefined();
    expect(design.markers).toBeDefined();
    expect(design.stroke).toBeDefined();
    expect(design.stroke["hairline-min-pt"]).toBeGreaterThanOrEqual(1.0);
  });

  it("maintains at least two e-ink levels between roles in eink-roles", () => {
    const set = (file.distinct ?? []).find((d) => d.id === "eink-roles")!;
    expect(set.for).toContain("eink");
    for (const mode of MODES) {
      const members = (set.members ?? []).map((m) => colour(mode, m));
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const dist = einkLevelDistance(members[i]!, members[j]!, 16);
          expect(dist, `${set.members![i]} and ${set.members![j]} in ${mode}`).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it("keeps categorical greys at least 12 L* apart in greyscale", () => {
    const set = (file.distinct ?? []).find((d) => d.id === "print-grey-categories")!;
    expect(set.for).toContain("print-grey");
    for (const mode of MODES) {
      const members = (set.members ?? []).map((m) => colour(mode, m));
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const dist = lstarDistance(members[i]!, members[j]!);
          expect(dist, `${set.members![i]} and ${set.members![j]} in ${mode}`).toBeGreaterThanOrEqual(12.0);
        }
      }
    }
  });

  it("keeps unpatterned photocopy fills between L* 25 and 80", () => {
    const set = (file.distinct ?? []).find((d) => d.id === "photocopy-fills")!;
    expect(set.for).toContain("photocopy");
    const patterned = new Set(set.patterned ?? []);
    for (const mode of MODES) {
      for (const m of set.members ?? []) {
        if (patterned.has(m)) continue;
        const hex = colour(mode, m);
        const l = lstar(hex);
        expect(l, `${m} in ${mode}`).toBeGreaterThanOrEqual(25.0);
        expect(l, `${m} in ${mode}`).toBeLessThanOrEqual(80.0);
      }
    }
  });
});
