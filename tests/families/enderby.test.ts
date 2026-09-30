// Enderby: the promises of the owner's specification that the shared tests do not name. The harness tests
// run every profile over every family and candidate; these cases lock counts, names, order and the
// declarations the profiles read, and the two conventions of the specimen that a generator could break.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { simulateCvd } from "../../lib/colour/cvd.ts";
import { lstar } from "../../lib/colour/grey.ts";
import { oklabDistance, toOklab, toOklch } from "../../lib/colour/oklab.ts";
import { contrastRatio } from "../../lib/colour/wcag.ts";
import { buildReport, failures } from "../../lib/harness/index.ts";
import { referencePalettes } from "../../lib/harness/reference.ts";
import { hueClass } from "../../lib/model/checks.ts";
import { loadCandidates, loadFamilies, loadSchema, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { Distinct, ModeName, ResolvedFamily } from "../../lib/model/types.ts";
import { validateFamily } from "../../lib/model/validate.ts";
import { OKABE_ITO_MINIMA } from "../../scripts/design/enderby-search.ts";
import { thresholds } from "../environments/helpers.ts";

const root = repoRoot();
const primaryFile = loadFamilies().find((f) => f.dir === "enderby")!;
const balancedFile = loadCandidates().find((c) => c.dir === "enderby" && c.candidate === "balanced")!;
const primary = resolveFamily(primaryFile.file);
const balanced = resolveFamily(balancedFile.file);

const MODES: ModeName[] = ["light", "dark"];
const NAMES = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
const VIEWS = ["normal", "protan", "deutan", "tritan"] as const;
const hexAt = (f: ResolvedFamily, m: ModeName, address: string) => f.modes[m].colours.get(address)!.hex;
const categories = (f: ResolvedFamily, m: ModeName) => NAMES.map((n) => hexAt(f, m, `data.categorical.${n}`));
const ramp = (f: ResolvedFamily, m: ModeName, kind: "sequential" | "diverging", name: string) => Array.from({ length: 9 }, (_, i) => hexAt(f, m, `data.${kind}.${name}.${i + 1}`));
const seen = (h: string, v: (typeof VIEWS)[number]) => (v === "normal" ? h : simulateCvd(h, v, 1));
const gaps = (hexes: string[]) => hexes.flatMap((a, i) => hexes.slice(i + 1).map((b) => Math.abs(lstar(a) - lstar(b))));
const sd = (xs: number[]) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length); };

describe("enderby", () => {
  it("is the Samuel Enderby at 0.1.0, with the environments and exclusions of the brief", () => {
    const meta = primaryFile.file.meta;
    expect(meta.id).toBe("enderby");
    expect(meta.chapter).toEqual([100, 101]);
    expect(meta.chapterTitle).toBe("Leg and Arm; The Decanter");
    expect(meta.version).toBe("0.1.0");
    expect(meta.environments).toEqual(["figure", "cvd", "print-grey", "projector"]);
    expect(primaryFile.file.design?.projector?.rooms).toEqual(["dark"]);
    expect(primaryFile.file.targets?.exclude).toEqual(["vscode", "zed", "neovim", "terminals"]);
    expect(primaryFile.file.typography).toMatchObject({ sans: "Inter" });
  });

  it("names eight categories c1 to c8, in the same order in both modes and both files", () => {
    for (const file of [primaryFile.file, balancedFile.file]) {
      for (const m of MODES) expect(Object.keys((file.modes[m].data as { categorical: { colors: object } }).categorical.colors)).toEqual(NAMES);
    }
  });

  it("keeps every categorical colour at 3:1 on the figure ground, where Okabe-Ito keeps fewer", () => {
    const oi = referencePalettes().okabeIto.map((c) => c.hex);
    for (const f of [primary, balanced]) {
      for (const m of MODES) {
        const bg = hexAt(f, m, "data.plot.background");
        for (const h of categories(f, m)) expect(contrastRatio(h, bg), `${m} ${h}`).toBeGreaterThanOrEqual(3);
        expect(oi.filter((h) => contrastRatio(h, bg) < 3).length).toBeGreaterThan(0);
      }
    }
  });

  it("lists the categories by separability: each colour is the farthest, among the ones left in its group, from those before it", () => {
    const ratio = (f: ResolvedFamily, a: string, b: string) => {
      let min = Infinity;
      for (const m of MODES) {
        const x = hexAt(f, m, `data.categorical.${a}`);
        const y = hexAt(f, m, `data.categorical.${b}`);
        for (const v of VIEWS) min = Math.min(min, oklabDistance(seen(x, v), seen(y, v)) / OKABE_ITO_MINIMA[v]);
      }
      return min;
    };
    // The first four are chosen first in the primary file, the other four after them; the balanced candidate has one group.
    const groups: [ResolvedFamily, string[][]][] = [[primary, [NAMES.slice(1, 4), NAMES.slice(4)]], [balanced, [NAMES.slice(1)]]];
    for (const [f, pools] of groups) {
      const chosen = ["c1"];
      for (const pool of pools) {
        for (let k = 0; k < pool.length; k++) {
          const pick = pool[k]!;
          const score = Math.min(...chosen.map((c) => ratio(f, c, pick)));
          for (const other of pool.slice(k + 1)) expect(Math.min(...chosen.map((c) => ratio(f, c, other))), `${f.meta.id} ${pick} before ${other}`).toBeLessThanOrEqual(score + 1e-9);
          chosen.push(pick);
        }
      }
    }
    for (const f of [primary, balanced]) for (const m of MODES) expect(hueClass(hexAt(f, m, "data.categorical.c1")), `${m} c1 is the pilot blue`).toBe("blue");
  });

  it("separates the first four categories by 12 L* or more in both modes, which is the greyscale gate", () => {
    for (const m of MODES) expect(Math.min(...gaps(categories(primary, m).slice(0, 4))), m).toBeGreaterThanOrEqual(12);
    const d = primaryFile.file.distinct as Distinct[];
    const four = d.find((x) => x.id === "categorical-first-four")!;
    expect(four.members).toEqual(NAMES.slice(0, 4).map((n) => `data.categorical.${n}`));
    expect(four.for).toEqual(["print-grey"]);
    const eight = d.find((x) => x.id === "categorical-greyscale")!;
    expect(eight.set).toBe("data.categorical");
    expect(eight.patterned).toEqual(NAMES.slice(4));
    expect(eight.for).toEqual(["print-grey"]);
    expect(d.find((x) => x.id === "categorical")).toMatchObject({ set: "data.categorical", for: ["projector"] });
  });

  it("gives each of the eight series a marker and a dash pattern, all different", () => {
    const design = primaryFile.file.design as { markers: Record<string, { shape: string; fill: string }>; lines: Record<string, { name: string; dash: number[] }> };
    expect(Object.keys(design.markers)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(Object.keys(design.lines)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(new Set(Object.values(design.markers).map((m) => `${m.fill} ${m.shape}`)).size).toBe(8);
    expect(new Set(Object.values(design.lines).map((l) => l.dash.join(" "))).size).toBe(8);
    for (const l of Object.values(design.lines)) expect(l.dash.every((n) => Number.isFinite(n) && n > 0)).toBe(true);
  });

  it("has three sequential ramps of nine steps whose step 1 is nearest the ground, read the other way round in the dark mode", () => {
    const names = Object.keys((primaryFile.file.modes.light.data as { sequential: object }).sequential);
    expect(names).toEqual(["pilot", "brass", "lagoon"]);
    const hueSpread = (hexes: string[]) => {
      const hues = hexes.map(toOklch).filter((c) => c.C >= 0.03).map((c) => c.h);
      return Math.max(...hues) - Math.min(...hues);
    };
    for (const name of names) {
      const light = ramp(primary, "light", "sequential", name);
      const dark = ramp(primary, "dark", "sequential", name);
      expect(dark).toEqual([...light].reverse());
      const L = light.map((h) => toOklab(h).L);
      expect(L.every((v, i) => i === 0 || v < L[i - 1]!), `${name} gets darker step by step on ivory`).toBe(true);
      expect(Math.abs(L[0]! - toOklab(hexAt(primary, "light", "data.plot.background")).L), `${name} step 1 is near the light ground`).toBeLessThan(0.05);
    }
    expect(hueSpread(ramp(primary, "light", "sequential", "pilot"))).toBeLessThan(40);
    expect(hueSpread(ramp(primary, "light", "sequential", "brass"))).toBeLessThan(40);
    expect(hueSpread(ramp(primary, "light", "sequential", "lagoon"))).toBeGreaterThan(100);
  });

  it("has two diverging ramps of nine steps with a neutral centre, blue against orange and teal against brass, the same in both modes", () => {
    const names = Object.keys((primaryFile.file.modes.light.data as { diverging: object }).diverging);
    expect(names).toEqual(["blue-orange", "teal-brass"]);
    for (const name of names) {
      const light = ramp(primary, "light", "diverging", name);
      expect(ramp(primary, "dark", "diverging", name)).toEqual(light);
      expect(toOklch(light[4]!).C).toBeLessThanOrEqual(0.02);
      const ends = [hueClass(light[0]!), hueClass(light[8]!)].sort();
      expect(ends, name).not.toEqual(["green", "red"]);
    }
    expect([hueClass(ramp(primary, "light", "diverging", "blue-orange")[0]!), hueClass(ramp(primary, "light", "diverging", "blue-orange")[8]!)]).toEqual(["blue", "orange"]);
  });

  it("declares every plot token, keeps the panel away from the marks, and draws the focus in a category", () => {
    for (const f of [primary, balanced]) {
      for (const m of MODES) {
        const plot = ["background", "panel", "text", "muted", "axis", "grid", "outline", "focus", "context"].map((k) => [k, hexAt(f, m, `data.plot.${k}`)] as const);
        expect(plot).toHaveLength(9);
        const bg = hexAt(f, m, "data.plot.background");
        expect(bg).toBe(hexAt(f, m, "roles.bg"));
        // The panel is further from the marks than the ground is: lighter in the light mode, darker in the dark mode.
        const panel = toOklab(hexAt(f, m, "data.plot.panel")).L;
        expect(m === "light" ? panel > toOklab(bg).L : panel < toOklab(bg).L, `${m} panel`).toBe(true);
        expect(categories(f, m)).toContain(hexAt(f, m, "data.plot.focus"));
        expect(toOklch(hexAt(f, m, "data.plot.context")).C).toBeLessThanOrEqual(0.02);
        expect(Math.abs(lstar(hexAt(f, m, "data.plot.focus")) - lstar(hexAt(f, m, "data.plot.context"))), `${f.meta.id} ${m} focus against context`).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it("offers a balanced candidate that gives up the greyscale gate for a narrow band of lightness", () => {
    const schema = loadSchema();
    expect(validateFamily(balancedFile.raw, schema).filter((i) => i.level === "error")).toEqual([]);
    const report = buildReport(balanced, thresholds);
    for (const p of ["figure", "cvd", "office-screen", "projector", "print-grey"]) expect(failures(report.profiles[p]!.checks), p).toEqual([]);
    for (const m of MODES) {
      const b = categories(balanced, m).map(lstar);
      const a = categories(primary, m).map(lstar);
      expect(Math.max(...b) - Math.min(...b), `${m} band`).toBeLessThanOrEqual(20.5);
      expect(sd(b), `${m} spread`).toBeLessThan(sd(a));
      expect(sd(b), `${m} spread against Okabe-Ito`).toBeLessThan(sd(referencePalettes().okabeIto.map((c) => lstar(c.hex))));
      expect(Math.min(...gaps(categories(balanced, m).slice(0, 4))), `${m} first four in grey`).toBeLessThan(12);
    }
    const eight = (balancedFile.file.distinct as Distinct[]).find((x) => x.id === "categorical-greyscale")!;
    expect(eight.patterned).toEqual(NAMES);
    // Everything but the categorical colours and the focus choice is the primary's.
    for (const group of Object.keys(primaryFile.file.palette)) {
      if (group.startsWith("cat-")) expect(balancedFile.file.palette[group], group).not.toEqual(primaryFile.file.palette[group]);
      else expect(balancedFile.file.palette[group], group).toEqual(primaryFile.file.palette[group]);
    }
    for (const m of MODES) for (const kind of ["sequential", "diverging"] as const) expect((balancedFile.file.modes[m].data as Record<string, unknown>)[kind]).toEqual((primaryFile.file.modes[m].data as Record<string, unknown>)[kind]);
  });

  describe("specimen", () => {
    const html = readFileSync(join(root, "families/enderby/specimen/specimen.html"), "utf8");
    const css = readFileSync(join(root, "families/enderby/specimen/specimen.css"), "utf8");

    it("draws the six figures, the key and the scales, with no script, style attribute or colour literal", () => {
      expect(html.split('class="sp-fig"').length - 1).toBe(7);
      for (const title of ["Bar", "Line", "Scatter", "Heatmap", "Diverging heatmap", "Small multiples"]) expect(html).toContain(`>${title}</h6>`);
      expect(html).not.toMatch(/<script|<style|\sstyle=|javascript:|https?:\/\//i);
      expect(html + css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch)a?\(/i);
      const classes = [...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1]!.split(/\s+/));
      expect(classes.filter((c) => !c.startsWith("sp-") && c !== "prose")).toEqual([]);
      expect(html.match(/class="prose"/g)).toHaveLength(1);
      expect(html).toContain("sp-grey-{mode}");
      expect(css).toContain("font-variant-numeric: tabular-nums");
    });

    it("outlines every ramp step that falls below 3:1 on the figure ground in either mode, and takes its dash patterns from the tokens", () => {
      const block = css.split("}").find((b) => b.includes("stroke: var(--data-plot-outline)"))!;
      const outlined = new Set(block.split("{")[0]!.split(",").map((s) => s.trim()));
      const short = (name: string) => (name === "blue-orange" ? "bo" : name === "teal-brass" ? "tb" : name);
      const below: string[] = [];
      for (const kind of ["sequential", "diverging"] as const) {
        for (const name of Object.keys((primaryFile.file.modes.light.data as Record<string, object>)[kind]!)) {
          for (let k = 1; k <= 9; k++) {
            const low = MODES.some((m) => contrastRatio(hexAt(primary, m, `data.${kind}.${name}.${k}`), hexAt(primary, m, "data.plot.background")) < 3);
            if (low) below.push(`.sp-x-${short(name)}-${k}`);
          }
        }
      }
      expect(below.length).toBeGreaterThan(10);
      for (const cls of below) expect(outlined.has(cls), cls).toBe(true);
      const design = primaryFile.file.design as { lines: Record<string, { dash: number[] }> };
      for (const [, i, dash] of css.matchAll(/\.sp-ln-(\d) \{ stroke-dasharray: ([^;]+); \}/g)) {
        const want = design.lines[i!]!.dash;
        expect(dash, `line ${i}`).toBe(want.length === 0 ? "none" : want.join(" "));
      }
    });
  });
});
