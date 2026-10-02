// Townho 0.1.0: unit tests locking the invariant properties of Townho.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lstarDistance } from "../../lib/colour/grey.ts";
import { contrastRatio } from "../../lib/colour/wcag.ts";
import { buildReport, failures } from "../../lib/harness/index.ts";
import type { Thresholds } from "../../lib/harness/types.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { MODES } from "../../lib/model/types.ts";

const root = repoRoot();
const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8")) as Thresholds;
const loaded = loadFamilies().find((f) => f.dir === "townho")!;
const file = loaded.file;
const family = resolveFamily(file);
const colour = (mode: "dark" | "light", address: string): string => family.modes[mode].colours.get(address)!.hex;

describe("Townho", () => {
  it("is chapter 54 with the environments of its brief and excluded editor bundles", () => {
    expect(file.meta.id).toBe("townho");
    expect(file.meta.version).toBe("0.1.0");
    expect(file.meta.chapter).toBe(54);
    expect(file.meta.chapterTitle).toBe("The Town-Ho’s Story");
    expect(file.meta.quote).toBe("Interweaving in its proper place this darker thread with the story as publicly narrated on the ship, the whole of this strange affair I now proceed to put on lasting record.");
    expect(file.meta.environments).toEqual(["overlay", "cvd", "print-grey"]);
    expect(file.targets?.exclude).toEqual(["vscode", "zed", "neovim", "terminals"]);
  });

  it("declares six translucent highlight fills in design.overlay.fills", () => {
    const fills = file.design?.overlay?.fills;
    expect(fills).toBeDefined();
    expect(fills?.length).toBe(6);
    for (const addr of fills!) {
      for (const mode of MODES) {
        const c = family.modes[mode].colours.get(addr);
        expect(c, `${mode} ${addr}`).toBeDefined();
        expect(c?.alpha, `${mode} ${addr} alpha`).toBeDefined();
        expect(c!.alpha!).toBeGreaterThan(0);
        expect(c!.alpha!).toBeLessThan(1);
      }
    }
  });

  it("keeps every declared text pair at 7:1 or more in both modes", () => {
    for (const mode of MODES) {
      for (const p of file.pairs ?? []) {
        if (p.kind !== "text") continue;
        if (p.modes && !p.modes.includes(mode)) continue;
        const fg = colour(mode, p.fg);
        const bg = colour(mode, p.bg);
        const ratio = contrastRatio(fg, bg);
        expect(ratio, `${p.fg} on ${p.bg} in ${mode}`).toBeGreaterThanOrEqual(7.0);
      }
    }
  });

  it("keeps diff added and removed at least 12 L* apart in both modes", () => {
    for (const mode of MODES) {
      const added = colour(mode, "extra.diff-added");
      const removed = colour(mode, "extra.diff-removed");
      const gap = lstarDistance(added, removed);
      expect(gap, `${mode} diff gap`).toBeGreaterThanOrEqual(12.0);
    }
  });

  it("passes every listed profile with zero errors and zero waivers in buildReport", () => {
    const report = buildReport(family, thresholds);
    for (const env of file.meta.environments) {
      const p = report.profiles[env];
      expect(p, env).toBeDefined();
      expect(p!.errors, `${env} errors`).toBe(0);
      expect(p!.waived, `${env} waivers`).toBe(0);
      expect(failures(p!.checks), `${env} failures`).toEqual([]);
    }
  });
});
