// The views of the family pages against lib/colour. Each view's numbers, run through
// the arithmetic of SVG filter primitives, give what the library gives for the same
// colour, within one 8-bit step.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  agedEye,
  applyFlare,
  channelFromLinear,
  channelToLinear,
  formatHex,
  greyscaleHex,
  LUMINANCE_WEIGHTS,
  lstar,
  parseHex,
  photocopy,
  quantiseEink,
  relativeLuminance,
  simulateCvd,
} from "../../lib/colour/index.ts";
import { num } from "../../lib/harness/types.ts";
import type { Thresholds } from "../../lib/harness/types.ts";
import { repoRoot } from "../../lib/model/load.ts";
import { luminanceAtLstar, simulationViews } from "../../scripts/pages/filters.ts";
import type { Primitive, Space, View } from "../../scripts/pages/filters.ts";
import { greys, grid4096, stepDifference } from "../lib/colour/helpers.ts";

const thresholds = JSON.parse(readFileSync(join(repoRoot(), "tests/environments.json"), "utf8")) as Thresholds;
const views = simulationViews(thresholds);
const view = (id: string): View => {
  const v = views.find((x) => x.id === id);
  if (!v) throw new Error(`no view ${id}`);
  return v;
};
const colours = [...grid4096().filter((_, i) => i % 7 === 0), ...greys];

const clamp = (v: number): number => Math.min(1, Math.max(0, v));

/** One channel through a transfer function, as feComponentTransfer defines it. */
function transfer(p: Extract<Primitive, { kind: "transfer" }>, c: number): number {
  if (p.type === "linear") return clamp(p.slope * c + p.intercept);
  const v = p.tableValues;
  if (p.type === "discrete") return v[Math.min(v.length - 1, Math.floor(c * v.length))]!;
  const n = v.length - 1;
  const k = Math.min(n - 1, Math.floor(c * n));
  return v[k]! + (c * n - k) * (v[k + 1]! - v[k]!);
}

/** A colour through a view. Each primitive works in its own space (color-interpolation-filters); the result is encoded and rounded once. */
function through(v: View, hex: string): string {
  let space: Space = "sRGB";
  let rgb = [...parseHex(hex)];
  for (const p of v.primitives) {
    if (p.space !== space) rgb = rgb.map(p.space === "linearRGB" ? channelToLinear : channelFromLinear);
    space = p.space;
    if (p.kind === "matrix") {
      const m = p.values;
      rgb = [0, 1, 2].map((i) => clamp(m[i * 5]! * rgb[0]! + m[i * 5 + 1]! * rgb[1]! + m[i * 5 + 2]! * rgb[2]! + m[i * 5 + 3]! + m[i * 5 + 4]!));
    } else {
      rgb = rgb.map((c) => transfer(p, c));
    }
  }
  if (space === "linearRGB") rgb = rgb.map(channelFromLinear);
  return formatHex([rgb[0]!, rgb[1]!, rgb[2]!]);
}

function worst(id: string, expected: (hex: string) => string, samples = colours): { steps: number; at: string } {
  let out = { steps: 0, at: "" };
  for (const hex of samples) {
    const steps = stepDifference(through(view(id), hex), expected(hex));
    if (steps > out.steps) out = { steps, at: hex };
  }
  return out;
}

describe("the views of the family pages", () => {
  it("are the eleven views, normal first and without a filter", () => {
    expect(views.map((v) => v.id)).toEqual(["normal", "protan", "deutan", "tritan", "greyscale", "eink", "photocopy", "projector-dark", "projector-lit", "sunlight", "aged-eye"]);
    expect(view("normal").primitives).toEqual([]);
  });

  const severity = num(thresholds, "common.cvd.severity.value");
  for (const type of ["protan", "deutan", "tritan"] as const) {
    it(`${type} is simulateCvd at the harness's severity`, () => {
      expect(worst(type, (hex) => simulateCvd(hex, type, severity)).steps).toBeLessThanOrEqual(1);
    });
  }

  it("greyscale takes its weights from lib/colour/wcag.ts and gives the grey of the same relative luminance", () => {
    const matrix = view("greyscale").primitives[0]!;
    expect(matrix.kind === "matrix" && matrix.values.slice(0, 3)).toEqual([...LUMINANCE_WEIGHTS]);
    expect(worst("greyscale", greyscaleHex).steps).toBeLessThanOrEqual(1);
  });

  it("16 grey levels land on quantiseEink's level", () => {
    const levels = num(thresholds, "profiles.eink.levels.value");
    expect(worst("eink", (hex) => quantiseEink(hex, levels).hex).steps).toBeLessThanOrEqual(1);
  });

  const blackL = num(thresholds, "profiles.photocopy.blackBelow.value");
  const whiteL = num(thresholds, "profiles.photocopy.whiteAbove.value");
  const black = luminanceAtLstar(blackL);
  const white = luminanceAtLstar(whiteL);

  it("puts the photocopy cut-offs where lstar crosses the thresholds", () => {
    for (const g of greys) {
      expect(relativeLuminance(g) < black, g).toBe(lstar(g) < blackL);
      expect(relativeLuminance(g) > white, g).toBe(lstar(g) > whiteL);
    }
  });

  it("photocopy is the library's photocopy, outside the one table step that holds each cut-off", () => {
    const clear = colours.filter((hex) => {
      const y = relativeLuminance(hex);
      return Math.abs(y - black) >= 1 / 255 && Math.abs(y - white) >= 1 / 255;
    });
    expect(clear.length).toBeGreaterThan(colours.length * 0.9);
    expect(worst("photocopy", (hex) => photocopy(hex).hex, clear).steps).toBeLessThanOrEqual(1);
  });

  for (const [id, path] of [
    ["projector-dark", "common.flare.darkRoom.value"],
    ["projector-lit", "common.flare.litRoom.value"],
    ["sunlight", "common.flare.sunlight.value"],
  ] as const) {
    it(`${id} adds the flare at ${path}`, () => {
      const k = num(thresholds, path);
      expect(worst(id, (hex) => applyFlare(hex, k)).steps).toBeLessThanOrEqual(1);
    });
  }

  it("aged eye is agedEye", () => {
    expect(worst("aged-eye", agedEye).steps).toBeLessThanOrEqual(1);
  });

  it("refuses a photocopy cut-off at or below L* 8, where the cube root no longer holds", () => {
    expect(() => luminanceAtLstar(8)).toThrow(RangeError);
    expect(luminanceAtLstar(100)).toBeCloseTo(1, 12);
  });
});
