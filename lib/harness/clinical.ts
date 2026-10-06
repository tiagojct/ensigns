// clinical: status for professionals. The family declares ordered severity
// levels (and optionally triage levels) in design.clinical, each with a
// foreground, a subtle fill, a border, an icon and a word. Then:
//   - adjacent levels have borders at least 8 L* apart and at least 0.06 apart
//     in OKLab under normal vision and each CVD simulation;
//   - the foreground on each fill keeps 4.5:1 and each border keeps 3:1 on the page;
//   - every level has its own icon and its own word, so colour never stands alone;
//   - no colour outside the status tokens comes within 0.10 of the critical red.
import { simulateCvd } from "../colour/cvd.ts";
import { lstarDistance } from "../colour/grey.ts";
import { oklabDistance } from "../colour/oklab.ts";
import { contrastRatio } from "../colour/wcag.ts";
import { MODES } from "../model/types.ts";
import type { ClinicalLevel, ResolvedFamily } from "../model/types.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "clinical";
const VIEWS = ["normal", "protan", "deutan", "tritan"] as const;

export function clinical(family: ResolvedFamily, t: Thresholds): Check[] {
  const declared = family.source.design?.clinical;
  if (!declared) return [{ profile: PROFILE, id: "levels declared", ok: false, level: "error", detail: "design.clinical is missing" }];

  const lstarMin = num(t, "profiles.clinical.severityStepLstar.min");
  const stepMin = num(t, "profiles.clinical.severityStepDistance.minDistance");
  const fgMin = num(t, "profiles.clinical.foregroundOnFill.min");
  const borderMin = num(t, "profiles.clinical.badgeBorder.min");
  const redMin = num(t, "profiles.clinical.criticalRedExclusion.minDistance");
  const severity = num(t, "common.cvd.severity.value");

  const lists: [string, ClinicalLevel[]][] = [["levels", declared.levels]];
  if (declared.triage) lists.push(["triage", declared.triage]);
  const out: Check[] = [];

  for (const [name, list] of lists) {
    const duplicates = (key: "icon" | "label") => list.filter((l, i) => list.findIndex((o) => o[key] === l[key]) !== i).map((l) => `${l.name} repeats "${l[key]}"`);
    const repeats = [...duplicates("icon"), ...duplicates("label")];
    out.push({
      profile: PROFILE, id: `${name}: icons and words differ`, ok: repeats.length === 0, level: "error",
      detail: repeats.length ? `${name}: ${repeats.join("; ")}` : `${name}: every level has its own icon and word`,
    });
  }

  const statusAddresses = new Set<string>();
  for (const [, list] of lists) for (const l of list) for (const a of [l.fg, l.fill, l.border]) statusAddresses.add(a);

  for (const m of MODES) {
    const colours = family.modes[m].colours;
    const hex = (address: string): string | undefined => colours.get(address)?.hex;
    const page = hex("roles.bg");
    if (!page) continue;

    for (const [name, list] of lists) {
      const borders = list.map((l) => ({ l, hex: hex(l.border) }));
      if (borders.some((b) => b.hex === undefined)) continue;

      const steps: [ClinicalLevel, ClinicalLevel, string, string][] = [];
      for (let i = 0; i + 1 < borders.length; i++) steps.push([borders[i]!.l, borders[i + 1]!.l, borders[i]!.hex!, borders[i + 1]!.hex!]);

      const dark = steps.map(([a, b, ha, hb]) => ({ a, b, d: lstarDistance(ha, hb) }));
      const flat = dark.filter((s) => s.d < lstarMin);
      out.push({
        profile: PROFILE, id: `${name}: adjacent borders differ in L*`, mode: m, ok: flat.length === 0, level: "error",
        value: Math.min(...dark.map((s) => s.d)), limit: lstarMin,
        detail: flat.length
          ? `${name} in ${m}, needs ${lstarMin} L*: ${flat.map((s) => `${s.a.name} and ${s.b.name} ${fmt(s.d, 1)}`).join("; ")}`
          : `${name} in ${m}: smallest step ${fmt(Math.min(...dark.map((s) => s.d)), 1)} L*, needs ${lstarMin}`,
      });

      for (const view of VIEWS) {
        const seen = (h: string) => (view === "normal" ? h : simulateCvd(h, view, severity));
        const close = steps.map(([a, b, ha, hb]) => ({ a, b, d: oklabDistance(seen(ha), seen(hb)) }));
        const bad = close.filter((s) => s.d < stepMin);
        out.push({
          profile: PROFILE, id: `${name}: adjacent borders apart under ${view}`, mode: m, ok: bad.length === 0, level: "error",
          value: Math.min(...close.map((s) => s.d)), limit: stepMin,
          detail: bad.length
            ? `${name} under ${view} in ${m}, needs ${stepMin}: ${bad.map((s) => `${s.a.name} and ${s.b.name} ${fmt(s.d, 3)}`).join("; ")}`
            : `${name} under ${view} in ${m}: smallest step ${fmt(Math.min(...close.map((s) => s.d)), 3)}, needs ${stepMin}`,
        });
      }

      const weakText = list.flatMap((l) => {
        const fg = hex(l.fg);
        const fill = hex(l.fill);
        return fg && fill && contrastRatio(fg, fill) < fgMin ? [`${l.name} ${fmt(contrastRatio(fg, fill))}:1`] : [];
      });
      out.push({
        profile: PROFILE, id: `${name}: foreground on fill`, mode: m, ok: weakText.length === 0, level: "error", limit: fgMin,
        detail: weakText.length ? `${name} in ${m}, needs ${fgMin}:1: ${weakText.join("; ")}` : `${name} in ${m}: every foreground keeps ${fgMin}:1 on its fill`,
      });

      const weakBorder = borders.flatMap((b) => (contrastRatio(b.hex!, page) < borderMin ? [`${b.l.name} ${fmt(contrastRatio(b.hex!, page))}:1`] : []));
      out.push({
        profile: PROFILE, id: `${name}: border against the page`, mode: m, ok: weakBorder.length === 0, level: "error", limit: borderMin,
        detail: weakBorder.length ? `${name} in ${m}, needs ${borderMin}:1: ${weakBorder.join("; ")}` : `${name} in ${m}: every border keeps ${borderMin}:1 on the page`,
      });
    }

    const critical = declared.levels.find((l) => l.name === declared.critical);
    const red = critical ? hex(critical.border) : undefined;
    if (red) {
      const near: string[] = [];
      let nearest = Infinity;
      for (const [address, c] of colours) {
        if (statusAddresses.has(address) || address.startsWith("status.")) continue;
        const d = oklabDistance(red, c.hex);
        nearest = Math.min(nearest, d);
        if (d < redMin) near.push(`${address} ${fmt(d, 3)}`);
      }
      out.push({
        profile: PROFILE, id: "critical red is reserved", mode: m, ok: near.length === 0, level: "error", value: nearest, limit: redMin,
        detail: near.length
          ? `in ${m}, no other role may come within ${redMin} of the critical red: ${near.join("; ")}`
          : `in ${m}: the nearest non-status colour to the critical red is ${fmt(nearest, 3)}, needs ${redMin}`,
      });
    }
  }
  return out;
}
