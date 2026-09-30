// figure: charts. The chart is the product. The family's data block is
// measured in each mode:
//   categorical  the first eight match Okabe-Ito's smallest pairwise OKLab
//                distance under normal vision and each CVD simulation, and beat
//                it on at least one of greyscale separation among the first
//                four, lightness balance, and 3:1 against the figure
//                background for every mark. A set that is Okabe-Ito itself
//                passes: the brief's fallback.
//   sequential   lightness is monotone, steps are near-uniform; viridis and
//                cividis are reported beside it.
//   diverging    an odd number of steps, lightness symmetric at matched steps,
//                a neutral centre that is the lightest step, and the two sides
//                apart under each simulation.
//   chrome       a plot background, text and muted text at AA, an outline
//                token that marks below 3:1 can use, and a focus colour with a
//                neutral context grey beside it.
import { simulateCvd } from "../colour/cvd.ts";
import { minPairwise } from "../colour/distinct.ts";
import { lstar } from "../colour/grey.ts";
import { oklabDistance, toOklab, toOklch } from "../colour/oklab.ts";
import { contrastRatio } from "../colour/wcag.ts";
import { MODES } from "../model/types.ts";
import type { ModeName, Resolved, ResolvedFamily } from "../model/types.ts";
import { referencePalettes, sampleRamp } from "./reference.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "figure";
const VIEWS = ["normal", "protan", "deutan", "tritan"] as const;
type View = (typeof VIEWS)[number];

function scales(colours: Map<string, Resolved>, kind: "sequential" | "diverging"): { name: string; hexes: string[] }[] {
  const byName = new Map<string, { i: number; hex: string }[]>();
  for (const [address, c] of colours) {
    const parts = address.split(".");
    if (parts.length === 4 && parts[0] === "data" && parts[1] === kind) {
      const list = byName.get(parts[2]!) ?? [];
      list.push({ i: Number(parts[3]), hex: c.hex });
      byName.set(parts[2]!, list);
    }
  }
  return [...byName].map(([name, list]) => ({ name, hexes: list.sort((a, b) => a.i - b.i).map((x) => x.hex) }));
}

function rampStats(hexes: string[]) {
  const L = hexes.map((h) => toOklab(h).L);
  const diffs = L.slice(1).map((v, i) => v - L[i]!);
  const steps = hexes.slice(1).map((h, i) => oklabDistance(hexes[i]!, h));
  return {
    monotone: diffs.every((d) => d > 0) || diffs.every((d) => d < 0),
    ratio: Math.max(...steps) / Math.min(...steps),
    length: steps.reduce((a, b) => a + b, 0),
    lightest: Math.max(...L),
    darkest: Math.min(...L),
  };
}

const sdOfLstar = (hexes: string[]): number => {
  const l = hexes.map(lstar);
  const mean = l.reduce((a, b) => a + b, 0) / l.length;
  return Math.sqrt(l.reduce((a, b) => a + (b - mean) ** 2, 0) / l.length);
};

const minLstarGap = (hexes: string[]): number => {
  let min = Infinity;
  for (let i = 0; i < hexes.length; i++) for (let j = i + 1; j < hexes.length; j++) min = Math.min(min, Math.abs(lstar(hexes[i]!) - lstar(hexes[j]!)));
  return min;
};

export function figure(family: ResolvedFamily, t: Thresholds): Check[] {
  const out: Check[] = [];
  const ref = referencePalettes();
  const oi = ref.okabeIto.map((c) => c.hex);
  const severity = num(t, "common.cvd.severity.value");
  const countMin = num(t, "profiles.figure.categoricalCount.min");
  const markMin = num(t, "profiles.figure.markContrast.min");
  const textMin = num(t, "common.wcag.text.value");
  const uniformMax = num(t, "profiles.figure.sequentialUniformity.max");
  const symmetryMax = num(t, "profiles.figure.divergingSymmetry.max");
  const centreChroma = num(t, "profiles.figure.divergingCentreChroma.max");
  const axisMin = num(t, "profiles.figure.divergingAxis.minDistance");
  const focusMin = num(t, "profiles.figure.focusContext.minDistance");
  const contextChroma = num(t, "profiles.figure.contextChroma.max");
  const seen = (view: View) => (hex: string) => (view === "normal" ? hex : simulateCvd(hex, view, severity));

  for (const m of MODES as readonly ModeName[]) {
    const mode = family.modes[m];
    if (mode.dataRef) {
      out.push({ profile: PROFILE, id: "data declared", mode: m, ok: true, level: "warn", report: true, detail: `${m}: the data is a reference to ${mode.dataRef}, measured there` });
      continue;
    }
    const colours = mode.colours;
    const cats = [...colours].filter(([a]) => a.startsWith("data.categorical.")).map(([a, c]) => ({ name: a.slice("data.categorical.".length), hex: c.hex }));
    const bg = colours.get("data.plot.background")?.hex;

    out.push({
      profile: PROFILE, id: "categorical: enough members", mode: m, ok: cats.length >= countMin, level: "error", value: cats.length, limit: countMin,
      detail: `${m}: ${cats.length} categorical colours, needs ${countMin}`,
    });
    if (!bg) {
      out.push({ profile: PROFILE, id: "plot background declared", mode: m, ok: false, level: "error", detail: `${m}: data.plot.background is missing` });
      continue;
    }

    // Categorical against Okabe-Ito.
    const first = cats.slice(0, 8).map((c) => c.hex);
    if (first.length >= 2) {
      const ships = new Set(first.map((h) => h.toUpperCase()));
      const isOkabeIto = oi.length === first.length && oi.every((h) => ships.has(h.toUpperCase()));
      for (const view of VIEWS) {
        const ours = minPairwise(first, oklabDistance, seen(view));
        const theirs = minPairwise(oi, oklabDistance, seen(view));
        out.push({
          profile: PROFILE, id: `categorical: matches Okabe-Ito under ${view}`, mode: m, ok: ours.min >= theirs.min - 1e-9, level: "error", value: ours.min, limit: theirs.min,
          detail: `categorical under ${view} in ${m}: smallest distance ${fmt(ours.min, 3)}, Okabe-Ito ${fmt(theirs.min, 3)}`,
        });
      }
      const grey = { ours: minLstarGap(first.slice(0, 4)), theirs: minLstarGap(oi.slice(0, 4)) };
      const sd = { ours: sdOfLstar(first), theirs: sdOfLstar(oi) };
      const low = { ours: first.filter((h) => contrastRatio(h, bg) < markMin).length, theirs: oi.filter((h) => contrastRatio(h, bg) < markMin).length };
      const wins = [
        grey.ours > grey.theirs ? "greyscale separation among the first four" : "",
        sd.ours < sd.theirs ? "lightness balance" : "",
        low.ours < low.theirs ? `${markMin}:1 against the figure background` : "",
      ].filter(Boolean);
      out.push({
        profile: PROFILE, id: "categorical: beats Okabe-Ito on one measure", mode: m, ok: isOkabeIto || wins.length > 0, level: "error",
        detail: isOkabeIto
          ? `${m}: the categorical set is Okabe-Ito itself, the brief's fallback`
          : `${m}: greyscale gap among the first four ${fmt(grey.ours, 1)} L* (Okabe-Ito ${fmt(grey.theirs, 1)}); lightness spread ${fmt(sd.ours, 1)} L* (${fmt(sd.theirs, 1)}); marks below ${markMin}:1 ${low.ours} (${low.theirs})${wins.length ? `; beats it on ${wins.join(", ")}` : "; beats it on none"}`,
      });
    }

    // Sequential ramps.
    for (const s of scales(colours, "sequential")) {
      const ours = rampStats(s.hexes);
      out.push({
        profile: PROFILE, id: `sequential ${s.name}: lightness is monotone`, mode: m, ok: ours.monotone, level: "error",
        detail: `sequential ${s.name} in ${m}: lightness is ${ours.monotone ? "monotone" : "not monotone"}`,
      });
      out.push({
        profile: PROFILE, id: `sequential ${s.name}: steps are near-uniform`, mode: m, ok: ours.ratio <= uniformMax, level: "error", value: ours.ratio, limit: uniformMax,
        detail: `sequential ${s.name} in ${m}: largest step is ${fmt(ours.ratio)} times the smallest, limit ${uniformMax}`,
      });
      const v = rampStats(sampleRamp(ref.viridis, s.hexes.length));
      const c = rampStats(sampleRamp(ref.cividis, s.hexes.length));
      out.push({
        profile: PROFILE, id: `sequential ${s.name}: against viridis and cividis`, mode: m, ok: true, level: "warn", report: true,
        detail: `sequential ${s.name} in ${m}, ${s.hexes.length} steps: step ratio ${fmt(ours.ratio)} (viridis ${fmt(v.ratio)}, cividis ${fmt(c.ratio)}); total length ${fmt(ours.length)} (${fmt(v.length)}, ${fmt(c.length)}); lightness ${fmt(ours.darkest)} to ${fmt(ours.lightest)} (${fmt(v.darkest)} to ${fmt(v.lightest)}, ${fmt(c.darkest)} to ${fmt(c.lightest)})`,
      });
    }

    // Diverging ramps.
    for (const s of scales(colours, "diverging")) {
      const n = s.hexes.length;
      if (n % 2 === 0) {
        out.push({ profile: PROFILE, id: `diverging ${s.name}: has a centre`, mode: m, ok: false, level: "error", detail: `diverging ${s.name} in ${m} has ${n} steps; it needs an odd number so it has a centre` });
        continue;
      }
      const mid = (n - 1) / 2;
      const L = s.hexes.map((h) => toOklab(h).L);
      const lopsided: string[] = [];
      let worst = 0;
      for (let i = 0; i < mid; i++) {
        const d = Math.abs(L[i]! - L[n - 1 - i]!);
        worst = Math.max(worst, d);
        if (d > symmetryMax) lopsided.push(`steps ${i + 1} and ${n - i} differ by ${fmt(d, 3)}`);
      }
      out.push({
        profile: PROFILE, id: `diverging ${s.name}: lightness is symmetric`, mode: m, ok: lopsided.length === 0, level: "error", value: worst, limit: symmetryMax,
        detail: lopsided.length ? `diverging ${s.name} in ${m}, limit ${symmetryMax}: ${lopsided.join("; ")}` : `diverging ${s.name} in ${m}: matched steps differ by at most ${fmt(worst, 3)} of lightness`,
      });
      const centre = s.hexes[mid]!;
      const chroma = toOklch(centre).C;
      const lightest = L[mid]! >= Math.max(...L) - 1e-9;
      out.push({
        profile: PROFILE, id: `diverging ${s.name}: neutral light centre`, mode: m, ok: chroma <= centreChroma && lightest, level: "error", value: chroma, limit: centreChroma,
        detail: `diverging ${s.name} in ${m}: centre chroma ${fmt(chroma, 3)} (limit ${centreChroma}), centre is ${lightest ? "the lightest step" : "not the lightest step"}`,
      });
      for (const view of VIEWS) {
        const far: string[] = [];
        let min = Infinity;
        for (let i = 0; i < mid / 2; i++) {
          const d = oklabDistance(seen(view)(s.hexes[i]!), seen(view)(s.hexes[n - 1 - i]!));
          min = Math.min(min, d);
          if (d < axisMin) far.push(`steps ${i + 1} and ${n - i} ${fmt(d, 3)}`);
        }
        out.push({
          profile: PROFILE, id: `diverging ${s.name}: sides apart under ${view}`, mode: m, ok: far.length === 0, level: "error",
          ...(Number.isFinite(min) ? { value: min } : {}), limit: axisMin,
          detail: far.length ? `diverging ${s.name} under ${view} in ${m}, needs ${axisMin}: ${far.join("; ")}` : `diverging ${s.name} under ${view} in ${m}: outer halves at least ${Number.isFinite(min) ? fmt(min, 3) : "n/a"} apart`,
        });
      }
    }

    // Marks below 3:1 need an outline.
    const marks = [
      ...cats.map((c) => ({ name: `categorical ${c.name}`, hex: c.hex })),
      ...scales(colours, "sequential").flatMap((s) => s.hexes.map((h, i) => ({ name: `sequential ${s.name} ${i + 1}`, hex: h }))),
      ...scales(colours, "diverging").flatMap((s) => s.hexes.map((h, i) => ({ name: `diverging ${s.name} ${i + 1}`, hex: h }))),
    ];
    const faint = marks.filter((x) => contrastRatio(x.hex, bg) < markMin);
    const outline = colours.get("data.plot.outline")?.hex;
    const outlineOk = outline !== undefined && contrastRatio(outline, bg) >= markMin;
    out.push({
      profile: PROFILE, id: "marks below 3:1 have an outline token", mode: m, ok: faint.length === 0 || outlineOk, level: "error", limit: markMin,
      detail: faint.length === 0
        ? `${m}: every mark keeps ${markMin}:1 on the figure background`
        : outlineOk
          ? `${m}: ${faint.length} marks fall below ${markMin}:1 and data.plot.outline (${fmt(contrastRatio(outline!, bg))}:1) covers them`
          : `${m}: ${faint.length} marks fall below ${markMin}:1 and data.plot.outline is ${outline ? `only ${fmt(contrastRatio(outline, bg))}:1` : "missing"}`,
    });

    // Chrome.
    for (const key of ["text", "muted", "grid", "focus", "context"]) {
      if (!colours.has(`data.plot.${key}`)) out.push({ profile: PROFILE, id: `plot ${key} declared`, mode: m, ok: false, level: "error", detail: `${m}: data.plot.${key} is missing` });
    }
    for (const key of ["text", "muted"]) {
      const c = colours.get(`data.plot.${key}`)?.hex;
      if (!c) continue;
      const r = contrastRatio(c, bg);
      out.push({ profile: PROFILE, id: `plot ${key} on the background`, mode: m, ok: r >= textMin, level: "error", value: r, limit: textMin, detail: `data.plot.${key} in ${m}: ${fmt(r)}:1, needs ${textMin}` });
    }
    const focus = colours.get("data.plot.focus")?.hex;
    const context = colours.get("data.plot.context")?.hex;
    if (focus) {
      const r = contrastRatio(focus, bg);
      out.push({ profile: PROFILE, id: "plot focus on the background", mode: m, ok: r >= markMin, level: "error", value: r, limit: markMin, detail: `data.plot.focus in ${m}: ${fmt(r)}:1, needs ${markMin}` });
    }
    if (context) {
      const c = toOklch(context).C;
      out.push({ profile: PROFILE, id: "plot context is a grey", mode: m, ok: c <= contextChroma, level: "error", value: c, limit: contextChroma, detail: `data.plot.context in ${m}: chroma ${fmt(c, 3)}, limit ${contextChroma}` });
    }
    if (focus && context) {
      const d = oklabDistance(focus, context);
      out.push({ profile: PROFILE, id: "plot focus stands out from the context", mode: m, ok: d >= focusMin, level: "error", value: d, limit: focusMin, detail: `focus and context in ${m}: ${fmt(d, 3)} apart, needs ${focusMin}` });
    }
  }
  return out;
}
