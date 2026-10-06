// office-screen: a reader at a desk on an ordinary monitor. Every declared
// pair meets its WCAG 2.x minimum in each mode it covers. AAA and APCA are
// reported, never gated.
import { apcaLc } from "../colour/apca.ts";
import { contrastRatio } from "../colour/wcag.ts";
import { flattenOver } from "../model/resolve.ts";
import { MODES } from "../model/types.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { apcaAllowed } from "./common.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "office-screen";

export function officeScreen(family: ResolvedFamily, t: Thresholds): Check[] {
  const out: Check[] = [];
  const aaa = num(t, "common.wcag.aaaText.value");
  for (const p of family.source.pairs ?? []) {
    for (const m of p.modes ?? MODES) {
      const mode = family.modes[m];
      const id = `${p.fg} on ${p.bg}`;
      const fgColour = mode.colours.get(p.fg);
      const bgColour = mode.colours.get(p.bg);
      if (!fgColour || !bgColour) {
        out.push({ profile: PROFILE, id, mode: m, ok: false, level: "error", detail: `${id}: an address is missing in ${m}` });
        continue;
      }
      // A translucent background is drawn over the page; a translucent foreground over its background.
      const page = mode.colours.get("roles.bg")!.hex;
      const bg = flattenOver(bgColour, page);
      const fg = flattenOver(fgColour, bg);
      const min = p.min ?? num(t, `common.wcag.${p.kind}.value`);
      const ratio = contrastRatio(fg, bg);
      out.push({
        profile: PROFILE, id, mode: m, ok: ratio >= min, level: "error", value: ratio, limit: min,
        detail: `${id} in ${m}: ${fmt(ratio)}:1, needs ${min}${p.why ? ` (${p.why})` : ""}`,
      });
      if (p.kind === "text") {
        out.push({
          profile: PROFILE, id: `aaa ${id}`, mode: m, ok: ratio >= aaa, level: "warn", report: true, value: ratio, limit: aaa,
          detail: `${id} in ${m}: AAA ${ratio >= aaa ? "met" : "not met"} at ${fmt(ratio)}:1`,
        });
      }
      if (apcaAllowed(family)) {
        const lc = apcaLc(fg, bg);
        out.push({ profile: PROFILE, id: `apca ${id}`, mode: m, ok: true, level: "warn", report: true, value: lc, detail: `${id} in ${m}: APCA Lc ${fmt(lc, 1)}` });
      }
    }
  }
  return out;
}
