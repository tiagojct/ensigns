// Helpers for the profiles that simulate a viewing condition: the declared
// pairs, and the distinct sets that opt in to a profile with `for`.
import { flattenOver } from "../model/resolve.ts";
import { distinctMembers } from "../model/sets.ts";
import type { SetMember } from "../model/sets.ts";
import { MODES } from "../model/types.ts";
import type { Distinct, ModeName, Pair, ProfileForSets, ResolvedFamily } from "../model/types.ts";
import { fmt } from "./types.ts";
import type { Check } from "./types.ts";

export const pairKey = (a: string, b: string): string => [a, b].sort().join("|");

export interface PairInMode {
  pair: Pair;
  mode: ModeName;
  /** The pair as the report prints it: fg on bg. */
  id: string;
  /** Both colours flattened over the page. */
  fg: string;
  bg: string;
}

/** The declared pairs in each mode they cover. A pair with a missing address is left out; the validator reports it. */
export function declaredPairs(family: ResolvedFamily): PairInMode[] {
  const out: PairInMode[] = [];
  for (const pair of family.source.pairs ?? []) {
    for (const mode of pair.modes ?? MODES) {
      const colours = family.modes[mode].colours;
      const fgColour = colours.get(pair.fg);
      const bgColour = colours.get(pair.bg);
      const page = colours.get("roles.bg")?.hex;
      if (!fgColour || !bgColour || !page) continue;
      const bg = flattenOver(bgColour, page);
      out.push({ pair, mode, id: `${pair.fg} on ${pair.bg}`, fg: flattenOver(fgColour, bg), bg });
    }
  }
  return out;
}

export interface GatedSet {
  d: Distinct;
  mode: ModeName;
  members: SetMember[];
  /** The pairs that still count: aliases, reinforced pairs and pairs with a patterned member are left out. */
  pairs: [SetMember, SetMember][];
}

/** The distinct sets that opt in to a profile, in each mode they cover. */
export function gatedSets(family: ResolvedFamily, profile: ProfileForSets): GatedSet[] {
  const out: GatedSet[] = [];
  for (const d of family.source.distinct ?? []) {
    if (!d.for?.includes(profile)) continue;
    const aliases = new Set((d.aliases ?? []).map(([a, b]) => pairKey(a, b)));
    const reinforced = new Set((d.reinforced ?? []).map(([a, b]) => pairKey(a, b)));
    const patterned = new Set(d.patterned ?? []);
    for (const mode of d.modes ?? MODES) {
      const members = distinctMembers(family.modes[mode], d);
      const pairs: [SetMember, SetMember][] = [];
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i]!;
          const b = members[j]!;
          if (aliases.has(pairKey(a.name, b.name)) || reinforced.has(pairKey(a.name, b.name))) continue;
          if (patterned.has(a.name) || patterned.has(b.name)) continue;
          pairs.push([a, b]);
        }
      }
      out.push({ d, mode, members, pairs });
    }
  }
  return out;
}

/** A profile the family lists but gives nothing to test is a failure, not a pass. */
export function nothingDeclared(profile: string, what: string): Check {
  return { profile, id: "declared", ok: false, level: "error", detail: `the family lists ${profile} but declares no ${what} for it to test` };
}

/** One check for each declared pair of a kind that has a minimum, measured after a simulation. */
export function pairChecks(args: {
  profile: string;
  family: ResolvedFamily;
  /** Names the situation in the id and the detail, for example "lit room". */
  suffix?: string;
  /** What the simulation does, for the detail, for example "after flare 0.08". */
  situation: string;
  contrast: (fg: string, bg: string) => number;
  /** The minimum for a kind of pair, or undefined to leave that kind out. */
  minFor: (kind: Pair["kind"]) => number | undefined;
}): Check[] {
  const out: Check[] = [];
  for (const p of declaredPairs(args.family)) {
    const min = args.minFor(p.pair.kind);
    if (min === undefined) continue;
    const ratio = args.contrast(p.fg, p.bg);
    const where = args.suffix ? `, ${args.suffix}` : "";
    out.push({
      profile: args.profile, id: `${p.id}${where}`, mode: p.mode, ok: ratio >= min, level: "error", value: ratio, limit: min,
      detail: `${p.id} in ${p.mode}${where}: ${fmt(ratio)}:1 ${args.situation}, needs ${min}`,
    });
  }
  return out;
}

/** One check for a set and mode: every counted pair is at least `limit` apart by `measure`. */
export function pairsApartCheck(args: {
  profile: string;
  id: string;
  set: GatedSet;
  measure: (a: string, b: string) => number;
  limit: number;
  /** The unit and the simulation, for the detail, for example "OKLab after flare". */
  what: string;
  digits?: number;
}): Check {
  const digits = args.digits ?? 3;
  const failing: string[] = [];
  let min = Infinity;
  for (const [a, b] of args.set.pairs) {
    const d = args.measure(a.colour.hex, b.colour.hex);
    min = Math.min(min, d);
    if (d < args.limit) failing.push(`${a.name} and ${b.name} ${fmt(d, digits)}`);
  }
  const shown = Number.isFinite(min) ? fmt(min, digits) : "n/a";
  return {
    profile: args.profile, id: args.id, mode: args.set.mode, ok: failing.length === 0, level: "error",
    ...(Number.isFinite(min) ? { value: min } : {}), limit: args.limit,
    detail: failing.length
      ? `${args.id} in ${args.set.mode}, needs ${args.limit} ${args.what}: ${failing.join("; ")}`
      : `${args.id} in ${args.set.mode}: minimum ${shown} ${args.what}`,
  };
}
