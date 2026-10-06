// editor: code on the surfaces the shipped themes draw. Every syntax role
// clears 4.5:1 on the editor background and on the current line, and 3:1 on
// the selection. APCA is reported.
import { apcaLc } from "../colour/apca.ts";
import { contrastRatio } from "../colour/wcag.ts";
import { MODES, SYNTAX_ROLES } from "../model/types.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "editor";

export function editor(family: ResolvedFamily, t: Thresholds): Check[] {
  const out: Check[] = [];
  const surfaces: [string, number][] = [
    ["surfaces.editor", num(t, "profiles.editor.textOnBackground.min")],
    ["surfaces.editor-line", num(t, "profiles.editor.textOnCurrentLine.min")],
    ["surfaces.editor-selection", num(t, "profiles.editor.textOnSelection.min")],
  ];
  for (const m of MODES) {
    const colours = family.modes[m].colours;
    for (const [surface] of surfaces) {
      if (!colours.has(surface)) out.push({ profile: PROFILE, id: `${surface} declared`, mode: m, ok: false, level: "error", detail: `${surface} is not declared in ${m}` });
    }
    for (const role of SYNTAX_ROLES) {
      const c = colours.get(`syntax.${role}`);
      if (!c) continue;
      for (const [surface, min] of surfaces) {
        const s = colours.get(surface);
        if (!s) continue;
        const ratio = contrastRatio(c.hex, s.hex);
        out.push({
          profile: PROFILE, id: `syntax.${role} on ${surface}`, mode: m, ok: ratio >= min, level: "error", value: ratio, limit: min,
          detail: `syntax.${role} on ${surface} in ${m}: ${fmt(ratio)}:1, needs ${min}`,
        });
      }
      const bg = colours.get("surfaces.editor");
      if (bg) {
        const lc = apcaLc(c.hex, bg.hex);
        out.push({ profile: PROFILE, id: `apca syntax.${role}`, mode: m, ok: true, level: "warn", report: true, value: lc, detail: `syntax.${role} in ${m}: APCA Lc ${fmt(lc, 1)}` });
      }
    }
  }
  return out;
}
