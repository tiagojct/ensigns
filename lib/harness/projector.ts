// projector: slides in a room with ambient light. The room adds the same
// luminance k to every colour, 0.02 in a dark room and 0.08 in a lit room.
// After that, body text keeps 4.5:1, titles 3:1, and the fields that carry
// meaning stay 0.08 apart in OKLab. A family may gate itself for one room
// (design.projector.rooms); the default is both.
import { applyFlare, contrastWithFlare } from "../colour/flare.ts";
import { oklabDistance } from "../colour/oklab.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { gatedSets, nothingDeclared, pairChecks, pairsApartCheck } from "./common.ts";
import { num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "projector";

export function projector(family: ResolvedFamily, t: Thresholds): Check[] {
  const out: Check[] = [];
  const rooms = family.source.design?.projector?.rooms ?? (["dark", "lit"] as const);
  const flare = { dark: num(t, "common.flare.darkRoom.value"), lit: num(t, "common.flare.litRoom.value") };
  const bodyMin = num(t, "profiles.projector.bodyText.min");
  const titleMin = num(t, "profiles.projector.titles.min");
  const fieldMin = num(t, "profiles.projector.flagFields.minDistance");
  const sets = gatedSets(family, "projector");

  let counted = 0;
  for (const room of rooms) {
    const k = flare[room];
    const checks = pairChecks({
      profile: PROFILE, family, suffix: `${room} room`, situation: `after flare ${k}`,
      contrast: (fg, bg) => contrastWithFlare(fg, bg, k),
      minFor: (kind) => (kind === "text" ? bodyMin : kind === "large" ? titleMin : undefined),
    });
    counted += checks.length;
    out.push(...checks);
    for (const set of sets) {
      out.push(pairsApartCheck({
        profile: PROFILE, id: `${set.d.id}: fields apart, ${room} room`, set,
        measure: (a, b) => oklabDistance(applyFlare(a, k), applyFlare(b, k)), limit: fieldMin, what: `in OKLab after flare ${k}`,
      }));
    }
  }
  if (counted === 0) out.push(nothingDeclared(PROFILE, "text or large-text pairs"));
  return out;
}
