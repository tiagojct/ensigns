// eink: readers and tablets with sixteen grey levels. The members of a
// distinct set that opts in land at least two levels apart. Text pairs are
// reported with the levels they land on; the 7:1 gate for text belongs to
// print-grey.
import { einkLevelDistance, quantiseEink } from "../colour/eink.ts";
import { contrastRatio } from "../colour/wcag.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { declaredPairs, gatedSets, nothingDeclared, pairsApartCheck } from "./common.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "eink";

export function eink(family: ResolvedFamily, t: Thresholds): Check[] {
  const levels = num(t, "profiles.eink.levels.value");
  const gap = num(t, "profiles.eink.levelGap.min");
  const sets = gatedSets(family, "eink");
  const out: Check[] = [];
  if (sets.length === 0) out.push(nothingDeclared(PROFILE, "distinct set that opts in"));
  for (const set of sets) {
    out.push(pairsApartCheck({
      profile: PROFILE, id: `${set.d.id}: apart in grey levels`, set,
      measure: (a, b) => einkLevelDistance(a, b, levels), limit: gap, what: `of ${levels} grey levels`, digits: 0,
    }));
  }
  for (const p of declaredPairs(family)) {
    if (p.pair.kind !== "text") continue;
    const a = quantiseEink(p.fg, levels);
    const b = quantiseEink(p.bg, levels);
    const ratio = contrastRatio(a.hex, b.hex);
    out.push({
      profile: PROFILE, id: `levels ${p.id}`, mode: p.mode, ok: true, level: "warn", report: true, value: ratio,
      detail: `${p.id} in ${p.mode}: levels ${a.level} and ${b.level} of ${levels - 1}, ${fmt(ratio)}:1`,
    });
  }
  return out;
}
