// sunlight: a phone or tablet in daylight. Glare adds 0.06 to every
// luminance; body text still keeps 4.5:1. A distinct set that opts in
// stays 0.06 apart in OKLab after the same glare.
import { applyFlare, contrastWithFlare } from "../colour/flare.ts";
import { oklabDistance } from "../colour/oklab.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { gatedSets, nothingDeclared, pairChecks, pairsApartCheck } from "./common.ts";
import { num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "sunlight";

export function sunlight(family: ResolvedFamily, t: Thresholds): Check[] {
  const k = num(t, "common.flare.sunlight.value");
  const bodyMin = num(t, "profiles.sunlight.bodyText.min");
  const apartMin = num(t, "profiles.sunlight.meaningfulPairs.minDistance");
  const out = pairChecks({
    profile: PROFILE, family, situation: `after glare ${k}`,
    contrast: (fg, bg) => contrastWithFlare(fg, bg, k),
    minFor: (kind) => (kind === "text" ? bodyMin : undefined),
  });
  if (out.length === 0) out.push(nothingDeclared(PROFILE, "text pairs"));
  for (const set of gatedSets(family, "sunlight")) {
    out.push(pairsApartCheck({
      profile: PROFILE, id: `${set.d.id}: apart in daylight`, set,
      measure: (a, b) => oklabDistance(applyFlare(a, k), applyFlare(b, k)), limit: apartMin, what: `in OKLab after glare ${k}`,
    }));
  }
  return out;
}
