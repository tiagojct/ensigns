// cvd: every distinct set keeps its members apart. Under normal vision the
// gate is the set's own minimum (default from tests/environments.json); under
// protan, deutan and tritan simulation (Machado 2009, severity 1.0, linear
// light) it is the global CVD minimum. Declared reinforced pairs are exempt
// from the CVD gate, declared aliases from every gate. Two members that share
// a hex value and are not declared aliases fail outright.
import { simulateCvd } from "../colour/cvd.ts";
import { oklabDistance } from "../colour/oklab.ts";
import { distinctMembers } from "../model/sets.ts";
import { MODES } from "../model/types.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "cvd";
const VIEWS = ["normal", "protan", "deutan", "tritan"] as const;
const pairKey = (a: string, b: string) => [a, b].sort().join("|");

export function cvd(family: ResolvedFamily, t: Thresholds): Check[] {
  const out: Check[] = [];
  const severity = num(t, "common.cvd.severity.value");
  const cvdMin = num(t, "common.cvd.minDistance.value");
  const normalMin = num(t, "common.distinct.minDistance.value");

  for (const d of family.source.distinct ?? []) {
    const aliases = new Set((d.aliases ?? []).map(([a, b]) => pairKey(a, b)));
    const reinforced = new Set((d.reinforced ?? []).map(([a, b]) => pairKey(a, b)));
    for (const m of d.modes ?? MODES) {
      const members = distinctMembers(family.modes[m], d);
      const pairs: [(typeof members)[number], (typeof members)[number]][] = [];
      for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) pairs.push([members[i]!, members[j]!]);

      const shared = pairs
        .filter(([a, b]) => a.colour.hex === b.colour.hex && !aliases.has(pairKey(a.name, b.name)))
        .map(([a, b]) => `${a.name} and ${b.name} are both ${a.colour.hex}`);
      out.push({
        profile: PROFILE, id: `${d.id}: no shared hex`, mode: m, ok: shared.length === 0, level: "error",
        detail: shared.length ? `${d.id} in ${m}: ${shared.join("; ")}` : `${d.id} in ${m}: no two members share a hex value`,
      });

      for (const view of VIEWS) {
        const transform = view === "normal" ? (h: string) => h : (h: string) => simulateCvd(h, view, severity);
        const limit = view === "normal" ? (d.min ?? normalMin) : cvdMin;
        const failing: string[] = [];
        let min = Infinity;
        for (const [a, b] of pairs) {
          const key = pairKey(a.name, b.name);
          if (aliases.has(key)) continue;
          if (view !== "normal" && reinforced.has(key)) continue;
          const dist = oklabDistance(transform(a.colour.hex), transform(b.colour.hex));
          min = Math.min(min, dist);
          if (dist < limit) failing.push(`${a.name} and ${b.name} ${fmt(dist, 3)}`);
        }
        const level = view === "normal" || d.cvd !== "report" ? "error" : "warn";
        out.push({
          profile: PROFILE, id: `${d.id}: ${view}`, mode: m, ok: failing.length === 0, level,
          ...(Number.isFinite(min) ? { value: min } : {}), limit,
          detail: failing.length
            ? `${d.id} under ${view} in ${m}, needs ${limit}: ${failing.join("; ")}`
            : `${d.id} under ${view} in ${m}: minimum ${Number.isFinite(min) ? fmt(min, 3) : "n/a"}`,
        });

        // A set whose own floor is below the global target is a baseline, not a pass: list what misses the target.
        if (view === "normal" && d.min !== undefined && d.min < normalMin) {
          const short = pairs
            .filter(([a, b]) => !aliases.has(pairKey(a.name, b.name)))
            .map(([a, b]) => ({ a, b, dist: oklabDistance(a.colour.hex, b.colour.hex) }))
            .filter((p) => p.dist < normalMin)
            .map((p) => `${p.a.name} and ${p.b.name} ${fmt(p.dist, 3)}`);
          out.push({
            profile: PROFILE, id: `${d.id}: normal, target`, mode: m, ok: short.length === 0, level: "warn", limit: normalMin,
            detail: short.length ? `${d.id} in ${m} is held at a floor of ${d.min}; below the target ${normalMin}: ${short.join("; ")}` : `${d.id} in ${m} meets the target ${normalMin}`,
          });
        }
      }
    }
  }
  return out;
}
