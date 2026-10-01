// aged-eye: a reader whose lens has yellowed. Machado tritanomaly at severity
// 0.5, then flare 0.02, applied to both colours of every pair. Body text still
// keeps 7:1, and a distinct set that opts in stays 0.06 apart in OKLab. An
// approximation, as lib/colour/aged-eye.ts says.
import { agedEye } from "../colour/aged-eye.ts";
import { oklabDistance } from "../colour/oklab.ts";
import { contrastRatio } from "../colour/wcag.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { gatedSets, nothingDeclared, pairChecks, pairsApartCheck } from "./common.ts";
import { num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "aged-eye";

export function agedEyeProfile(family: ResolvedFamily, t: Thresholds): Check[] {
  const bodyMin = num(t, "profiles.aged-eye.bodyText.min");
  const largeMin = num(t, "profiles.aged-eye.largeText.min");
  const apartMin = num(t, "profiles.aged-eye.meaningfulPairs.minDistance");
  const out = pairChecks({
    profile: PROFILE, family, situation: "after the aged-eye simulation",
    contrast: (fg, bg) => contrastRatio(agedEye(fg), agedEye(bg)),
    minFor: (kind) => (kind === "text" ? bodyMin : kind === "large" ? largeMin : undefined),
  });
  if (out.length === 0) out.push(nothingDeclared(PROFILE, "text pairs"));
  for (const set of gatedSets(family, "aged-eye")) {
    out.push(pairsApartCheck({
      profile: PROFILE, id: `${set.d.id}: apart to an aged eye`, set,
      measure: (a, b) => oklabDistance(agedEye(a), agedEye(b)), limit: apartMin, what: "in OKLab after the aged-eye simulation",
    }));
  }
  return out;
}
