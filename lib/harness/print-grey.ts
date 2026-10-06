// print-grey: greyscale laser print. Every colour becomes the grey of the same
// luminance. Text keeps 7:1 after the conversion, and the members of a distinct
// set that opts in are at least 12 L* apart, unless they carry a pattern or a
// line style of their own (patterned) or something else tells them apart
// (reinforced).
import { greyscaleHex, lstarDistance } from "../colour/grey.ts";
import { contrastRatio } from "../colour/wcag.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { gatedSets, nothingDeclared, pairChecks, pairsApartCheck } from "./common.ts";
import { num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "print-grey";

export function printGrey(family: ResolvedFamily, t: Thresholds): Check[] {
  const textMin = num(t, "profiles.print-grey.text.min");
  const gapMin = num(t, "profiles.print-grey.distinctLstar.min");
  const out = pairChecks({
    profile: PROFILE, family, situation: "in greyscale",
    contrast: (fg, bg) => contrastRatio(greyscaleHex(fg), greyscaleHex(bg)),
    minFor: (kind) => (kind === "text" ? textMin : undefined),
  });
  const sets = gatedSets(family, "print-grey");
  if (out.length === 0 && sets.length === 0) out.push(nothingDeclared(PROFILE, "text pairs or distinct sets"));
  for (const set of sets) {
    out.push(pairsApartCheck({
      profile: PROFILE, id: `${set.d.id}: apart in grey`, set, measure: lstarDistance, limit: gapMin, what: "L*", digits: 1,
    }));
  }
  return out;
}
