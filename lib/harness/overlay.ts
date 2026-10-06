// overlay: annotation fills that sit over other text. Each translucent fill is
// composited at its declared opacity over the ground of every family in both
// modes, and then:
//   - the host's text on the tinted ground keeps 7:1 on a light ground and
//     4.5:1 on a dark one;
//   - the tinted ground is at least 0.05 from the bare ground in OKLab;
//   - the tinted grounds of two fills are at least 0.06 apart, under normal
//     vision and under each CVD simulation (declared reinforced pairs, told
//     apart by a label, are exempt from the simulations).
// The overlay's own light mode is used over a light ground and its dark mode
// over a dark one. A distinct set with the id "fills" may declare reinforced
// pairs and aliases by address.
import { blend } from "../colour/composite.ts";
import { simulateCvd } from "../colour/cvd.ts";
import { lstar } from "../colour/grey.ts";
import { oklabDistance } from "../colour/oklab.ts";
import { contrastRatio } from "../colour/wcag.ts";
import { MODES } from "../model/types.ts";
import type { ModeName, ResolvedFamily } from "../model/types.ts";
import { pairKey } from "./common.ts";
import { loadContext } from "./context.ts";
import type { HarnessContext } from "./context.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "overlay";
const VIEWS = ["normal", "protan", "deutan", "tritan"] as const;

export function overlay(family: ResolvedFamily, t: Thresholds, ctx?: HarnessContext): Check[] {
  const declared = family.source.design?.overlay;
  if (!declared) return [{ profile: PROFILE, id: "fills declared", ok: false, level: "error", detail: "design.overlay.fills is missing" }];

  const textLight = num(t, "profiles.overlay.textOnFillLight.min");
  const textDark = num(t, "profiles.overlay.textOnFillDark.min");
  const fromGround = num(t, "profiles.overlay.fillFromGround.minDistance");
  const apart = num(t, "profiles.overlay.fillsApart.minDistance");
  const severity = num(t, "common.cvd.severity.value");
  const cvdApart = num(t, "common.cvd.minDistance.value");

  const fillsSet = (family.source.distinct ?? []).find((d) => d.id === "fills");
  const aliases = new Set((fillsSet?.aliases ?? []).map(([a, b]) => pairKey(a, b)));
  const reinforced = new Set((fillsSet?.reinforced ?? []).map(([a, b]) => pairKey(a, b)));

  // The family under test stands in for its own copy on disk, so a candidate is tested as it is.
  const hosts = [...(ctx ?? loadContext()).families.filter((f) => f.meta.id !== family.meta.id), family];
  const out: Check[] = [];

  for (const host of hosts) {
    for (const hostMode of MODES) {
      const colours = host.modes[hostMode].colours;
      const ground = colours.get("roles.bg")?.hex;
      const text = colours.get("roles.text")?.hex;
      if (!ground || !text) continue;
      const polarity: ModeName = lstar(ground) >= 50 ? "light" : "dark";
      const where = `over ${host.meta.id} ${hostMode}`;

      const fills: { name: string; address: string; hex: string }[] = [];
      for (const address of declared.fills) {
        const c = family.modes[polarity].colours.get(address);
        if (c && c.alpha !== undefined) fills.push({ name: address.split(".").slice(1).join("."), address, hex: blend(c.hex, c.alpha, ground) });
      }
      if (fills.length < 2) continue;

      const textMin = polarity === "light" ? textLight : textDark;
      const readable = fills.map((f) => ({ f, ratio: contrastRatio(text, f.hex) }));
      const weak = readable.filter((r) => r.ratio < textMin);
      out.push({
        profile: PROFILE, id: `text on fill ${where}`, mode: polarity, ok: weak.length === 0, level: "error",
        value: Math.min(...readable.map((r) => r.ratio)), limit: textMin,
        detail: weak.length
          ? `text on a fill ${where}, needs ${textMin}:1: ${weak.map((r) => `${r.f.name} ${fmt(r.ratio)}:1`).join("; ")}`
          : `text on a fill ${where}: lowest ${fmt(Math.min(...readable.map((r) => r.ratio)))}:1, needs ${textMin}:1`,
      });

      const visible = fills.map((f) => ({ f, d: oklabDistance(f.hex, ground) }));
      const faint = visible.filter((v) => v.d < fromGround);
      out.push({
        profile: PROFILE, id: `fill from ground ${where}`, mode: polarity, ok: faint.length === 0, level: "error",
        value: Math.min(...visible.map((v) => v.d)), limit: fromGround,
        detail: faint.length
          ? `a fill ${where} is too close to the ground, needs ${fromGround}: ${faint.map((v) => `${v.f.name} ${fmt(v.d, 3)}`).join("; ")}`
          : `fills ${where}: nearest to the ground ${fmt(Math.min(...visible.map((v) => v.d)), 3)}, needs ${fromGround}`,
      });

      for (const view of VIEWS) {
        const limit = view === "normal" ? apart : cvdApart;
        const seen = (hex: string) => (view === "normal" ? hex : simulateCvd(hex, view, severity));
        const failing: string[] = [];
        let min = Infinity;
        for (let i = 0; i < fills.length; i++) {
          for (let j = i + 1; j < fills.length; j++) {
            const a = fills[i]!;
            const b = fills[j]!;
            const key = pairKey(a.address, b.address);
            if (aliases.has(key) || (view !== "normal" && reinforced.has(key))) continue;
            const d = oklabDistance(seen(a.hex), seen(b.hex));
            min = Math.min(min, d);
            if (d < limit) failing.push(`${a.name} and ${b.name} ${fmt(d, 3)}`);
          }
        }
        out.push({
          profile: PROFILE, id: `fills apart ${where}, ${view}`, mode: polarity, ok: failing.length === 0, level: "error",
          ...(Number.isFinite(min) ? { value: min } : {}), limit,
          detail: failing.length
            ? `fills ${where} under ${view}, needs ${limit}: ${failing.join("; ")}`
            : `fills ${where} under ${view}: minimum ${Number.isFinite(min) ? fmt(min, 3) : "n/a"}, needs ${limit}`,
        });
      }
    }
  }
  if (out.length === 0) out.push({ profile: PROFILE, id: "declared", ok: false, level: "error", detail: "no fill resolved to a translucent colour over any ground" });
  return out;
}
