// Delight 0.1.0: deterministic derivation of the 16-level e-ink ramp, achromatic
// status, photocopy window and print-grey scales.
//
// What the brief asks (chapter 131, The Pequod Meets The Delight; environments
// print-grey, eink, photocopy, forced-colors, cvd):
//   1. Hue carries no meaning. Every distinction is lightness, weight, pattern or line style.
//   2. A 16-level grey ramp mapping exactly onto the 16 e-ink levels.
//   3. Core roles for both modes: light is black ink on white paper, dark is high contrast.
//   4. Text, including muted text, is 7:1 or more in both modes.
//   5. Photocopy fills sit between L* 25 and 80, or carry a pattern token.
//   6. Categorical greys in print-grey differ by 12 L* or more.
//
//   node scripts/design/delight.ts
//
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { einkLevelDistance, quantiseEink } from "../../lib/colour/eink.ts";
import { lstar, lstarDistance } from "../../lib/colour/grey.ts";
import { oklabDistance } from "../../lib/colour/oklab.ts";
import { simulateCvd } from "../../lib/colour/cvd.ts";
import { minPairwise } from "../../lib/colour/distinct.ts";
import { contrastRatio, relativeLuminance as Y } from "../../lib/colour/wcag.ts";
import { buildReport, failures } from "../../lib/harness/index.ts";
import type { Thresholds } from "../../lib/harness/types.ts";
import { readJson, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { FamilyFile } from "../../lib/model/types.ts";

const root = repoRoot();
const TOKENS = join(root, "families/delight/delight.tokens.json");
const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8")) as Thresholds;
const problems: string[] = [];
const check = (ok: boolean, msg: string): void => {
  if (!ok) problems.push(msg);
};

// 1. Derive the 16-level grey ramp
const ramp: Record<string, string> = {};
for (let i = 0; i < 16; i++) {
  const h = (i * 0x11).toString(16).padStart(2, "0").toUpperCase();
  ramp[`g${i}`] = `#${h}${h}${h}`;
  const q = quantiseEink(ramp[`g${i}`]!, 16);
  check(q.level === i, `level ${i} quantised as ${q.level}`);
}

// 2. Load token file and compare
const raw = readJson(TOKENS) as FamilyFile;
const family = resolveFamily(raw);

for (let i = 0; i < 16; i++) {
  const held = (raw.palette.grey as Record<string, string>)[`g${i}`];
  check(held === ramp[`g${i}`], `g${i} in tokens (${held}) differs from derived (${ramp[`g${i}`]})`);
}

// 3. Check text pairs contrast >= 7:1
for (const mode of ["dark", "light"] as const) {
  for (const p of raw.pairs ?? []) {
    if (p.kind !== "text") continue;
    const fg = family.modes[mode].colours.get(p.fg)!.hex;
    const bg = family.modes[mode].colours.get(p.bg)!.hex;
    const cr = contrastRatio(fg, bg);
    check(cr >= 7.0, `${mode} ${p.fg} on ${p.bg} contrast is ${cr.toFixed(2)}, needs >= 7:1`);
  }
}

// 4. Check e-ink level spacing >= 2
const einkSet = (raw.distinct ?? []).find((d) => d.id === "eink-roles")!;
for (const mode of ["dark", "light"] as const) {
  const mems = (einkSet.members ?? []).map((m) => family.modes[mode].colours.get(m)!.hex);
  for (let i = 0; i < mems.length; i++) {
    for (let j = i + 1; j < mems.length; j++) {
      const d = einkLevelDistance(mems[i]!, mems[j]!, 16);
      check(d >= 2, `${mode} eink ${einkSet.members![i]} and ${einkSet.members![j]} are ${d} levels apart, needs >= 2`);
    }
  }
}

// 5. Check print-grey categorical spacing >= 12 L*
const printSet = (raw.distinct ?? []).find((d) => d.id === "print-grey-categories")!;
for (const mode of ["dark", "light"] as const) {
  const mems = (printSet.members ?? []).map((m) => family.modes[mode].colours.get(m)!.hex);
  for (let i = 0; i < mems.length; i++) {
    for (let j = i + 1; j < mems.length; j++) {
      const d = lstarDistance(mems[i]!, mems[j]!);
      check(d >= 12.0, `${mode} print-grey ${printSet.members![i]} and ${printSet.members![j]} are ${d.toFixed(1)} L* apart, needs >= 12`);
    }
  }
}

// 6. Check photocopy window [25, 80]
const photoSet = (raw.distinct ?? []).find((d) => d.id === "photocopy-fills")!;
const patterned = new Set(photoSet.patterned ?? []);
for (const mode of ["dark", "light"] as const) {
  for (const m of photoSet.members ?? []) {
    if (patterned.has(m)) continue;
    const hex = family.modes[mode].colours.get(m)!.hex;
    const l = lstar(hex);
    check(l >= 25 && l <= 80, `${mode} photocopy ${m} L* is ${l.toFixed(1)}, outside [25, 80]`);
  }
}

// 7. Check CVD separation on status accents >= 0.06
const statusSet = (raw.distinct ?? []).find((d) => d.id === "status-accents")!;
for (const mode of ["dark", "light"] as const) {
  const mems = (statusSet.members ?? []).map((m) => family.modes[mode].colours.get(m)!.hex);
  for (const sim of ["normal", "protan", "deutan", "tritan"] as const) {
    const minD = minPairwise(mems, (a, b) => {
      const sa = sim === "normal" ? a : simulateCvd(a, sim);
      const sb = sim === "normal" ? b : simulateCvd(b, sim);
      return oklabDistance(sa, sb);
    });
    check(minD.min >= 0.06, `${mode} status accents under ${sim} CVD distance is ${minD.min.toFixed(3)}, needs >= 0.06`);
  }
}

// 8. Run harness report
const report = buildReport(family, thresholds);
for (const [prof, data] of Object.entries(report.profiles)) {
  const errs = failures(data.checks);
  for (const e of errs) problems.push(`harness ${prof} error: ${e}`);
}

if (problems.length > 0) {
  console.error("Delight derivation problems:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

console.log("Delight derivation clean: all checks passed.");
