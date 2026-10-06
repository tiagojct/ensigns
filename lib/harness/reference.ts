// Reference palettes the figure profile measures a family against: Okabe-Ito
// for categorical colours, viridis and cividis for sequential ramps. The hex
// values live in tests/fixtures/reference/palettes.json, written by
// scripts/gen-reference-palettes.R, because no colour value may be typed in
// lib/. Build time only.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../model/load.ts";

export interface ReferencePalettes {
  okabeIto: { name: string; hex: string }[];
  viridis: string[];
  cividis: string[];
}

interface Raw {
  "okabe-ito": { colors: Record<string, string> };
  viridis: { colors: string[] };
  cividis: { colors: string[] };
}

export function referencePalettes(root: string = repoRoot()): ReferencePalettes {
  const raw = JSON.parse(readFileSync(join(root, "tests/fixtures/reference/palettes.json"), "utf8")) as Raw;
  return {
    okabeIto: Object.entries(raw["okabe-ito"].colors).map(([name, hex]) => ({ name, hex })),
    viridis: raw.viridis.colors,
    cividis: raw.cividis.colors,
  };
}

/** n colours taken evenly, end to end, from a longer ramp. */
export function sampleRamp(ramp: readonly string[], n: number): string[] {
  return Array.from({ length: n }, (_, i) => ramp[Math.round((i * (ramp.length - 1)) / (n - 1))]!);
}
