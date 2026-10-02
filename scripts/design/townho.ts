// Townho 0.1.0: deterministic derivation of the overlay fills, track changes,
// diff roles and reviewer accents over twenty host grounds.
//
// What the brief asks (chapter 54, The Town-Ho's Story; environments
// overlay, cvd, print-grey):
//   1. Annotation colours that sit behind or under text.
//   2. Six semantic highlight fills: claim, result, method, definition, question, limitation.
//   3. Each fill has an opaque value and a translucent value with its alpha.
//   4. The overlay profile runs over every other family's ground in both modes (20 grounds).
//   5. Insert and delete inks (underline and strike); diff roles (added, removed, changed).
//   6. Reviewer colours for multi-author track changes.
//   7. Meaning never by colour alone in exports (labels, legends, patterns in print).
//
//   node scripts/design/townho.ts
//
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { blend } from "../../lib/colour/composite.ts";
import { fromOklch } from "../../lib/colour/index.ts";
import { buildReport, failures, overlay } from "../../lib/harness/index.ts";
import type { Thresholds } from "../../lib/harness/types.ts";
import { readJson, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { FamilyFile } from "../../lib/model/types.ts";

const root = repoRoot();
const TOKENS = join(root, "families/townho/townho.tokens.json");
const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8")) as Thresholds;

const problems: string[] = [];
const check = (ok: boolean, msg: string): void => {
  if (!ok) problems.push(msg);
};

// Feasible regions derived from overlay profile gates:
// Light grounds: host text on fill must reach >= 7.0:1.
// Fills must be >= 0.05 from ground in OKLab, and >= 0.06 apart under normal vision.
// At alpha 0.58, light fills yield contrast >= 8.55:1, distance from ground >= 0.062,
// and pairwise distance >= 0.065 across all 10 light grounds.
const LIGHT_ALPHA = 0.58;
const LIGHT_HUES = [
  { name: "claim", L: 0.94, C: 0.19, h: 108 },
  { name: "result", L: 0.88, C: 0.20, h: 145 },
  { name: "method", L: 0.86, C: 0.18, h: 215 },
  { name: "definition", L: 0.80, C: 0.20, h: 285 },
  { name: "question", L: 0.84, C: 0.23, h: 350 },
  { name: "limitation", L: 0.86, C: 0.19, h: 50 },
];

// Dark grounds: host text on fill must reach >= 4.5:1.
// Fills must be >= 0.05 from ground in OKLab, and >= 0.06 apart under normal vision.
// At alpha 0.72, dark fills yield contrast >= 5.25:1, distance from ground >= 0.062,
// and pairwise distance >= 0.067 across all 10 dark grounds.
const DARK_ALPHA = 0.72;
const DARK_HUES = [
  { name: "claim", L: 0.38, C: 0.16, h: 100 },
  { name: "result", L: 0.34, C: 0.16, h: 150 },
  { name: "method", L: 0.30, C: 0.15, h: 220 },
  { name: "definition", L: 0.28, C: 0.16, h: 280 },
  { name: "question", L: 0.32, C: 0.17, h: 345 },
  { name: "limitation", L: 0.36, C: 0.17, h: 45 },
];

// Verify derived hex values match token file
const raw = readJson(TOKENS) as FamilyFile;
const family = resolveFamily(raw);

for (const h of LIGHT_HUES) {
  const hex = fromOklch(h.L, h.C, h.h);
  const held = (raw.palette["highlight-light"] as Record<string, string>)[`${h.name}-base`];
  check(held === hex, `light highlight ${h.name} base: held ${held} !== derived ${hex}`);
}

for (const h of DARK_HUES) {
  const hex = fromOklch(h.L, h.C, h.h);
  const held = (raw.palette["highlight-dark"] as Record<string, string>)[`${h.name}-base`];
  check(held === hex, `dark highlight ${h.name} base: held ${held} !== derived ${hex}`);
}

// Verify overlay checks
const overlayChecks = overlay(family, thresholds);
const overlayFails = failures(overlayChecks);
check(overlayFails.length === 0, `overlay profile had failures: ${overlayFails.join("; ")}`);

// Verify complete report
const report = buildReport(family, thresholds);
for (const env of raw.meta.environments) {
  const p = report.profiles[env];
  check(p !== undefined, `profile ${env} missing in report`);
  if (p) {
    check(p.errors === 0, `profile ${env} has ${p.errors} errors: ${failures(p.checks).join("; ")}`);
    check(p.waived === 0, `profile ${env} has ${p.waived} waivers`);
  }
}

if (problems.length > 0) {
  console.error("Townho design check failed:");
  for (const prob of problems) console.error(`  - ${prob}`);
  process.exit(1);
}

console.log("Townho design check passed cleanly.");
