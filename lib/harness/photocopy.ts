// photocopy: a copier clips highlights and shadows. The fills of a distinct
// set that opts in sit between L* 25 and 80, or carry a pattern of their own
// (patterned), so none of them is lost to white or black.
import { lstar } from "../colour/grey.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { gatedSets, nothingDeclared } from "./common.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "photocopy";

export function photocopyProfile(family: ResolvedFamily, t: Thresholds): Check[] {
  const min = num(t, "profiles.photocopy.fills.min");
  const max = num(t, "profiles.photocopy.fills.max");
  const sets = gatedSets(family, "photocopy");
  if (sets.length === 0) return [nothingDeclared(PROFILE, "distinct set that opts in")];
  return sets.map((set) => {
    const patterned = new Set(set.d.patterned ?? []);
    const outside = set.members
      .filter((m) => !patterned.has(m.name))
      .map((m) => ({ name: m.name, l: lstar(m.colour.hex) }))
      .filter((m) => m.l < min || m.l > max);
    const id = `${set.d.id}: fills between L* ${min} and ${max}`;
    return {
      profile: PROFILE, id, mode: set.mode, ok: outside.length === 0, level: "error" as const, limit: max,
      detail: outside.length
        ? `${id} in ${set.mode}: ${outside.map((m) => `${m.name} L* ${fmt(m.l, 1)}`).join("; ")}`
        : `${id} in ${set.mode}: every fill is inside the window`,
    };
  });
}
