// Enderby 0.1.0: figures for papers, reports and dashboards. The chart is the product.
//
// This script records how every colour value of the family was chosen, prints the derivation and stops
// (exit 1) when a token file differs from it or a check fails.
//
//   node scripts/design/enderby.ts             derive, compare with the token files, run the harness
//   node scripts/design/enderby.ts --write     write the palette of enderby.tokens.json and regenerate
//                                              candidates/balanced.tokens.json, then check
//
// What the rules come from. Numbers marked (brief) are the owner's; the rest are thresholds in
// tests/environments.json, read here and not typed again.
//
//   grounds     an ivory figure ground for the light mode and a pilot-cloth blue-black for the dark mode.
//               Both are read from enderby-search.ts, which measures every categorical colour against them.
//   text        print-grey holds every declared text pair to 7:1 after grey conversion, so every text
//               colour reaches 7:1 on the ground it is declared on: text 14:1, muted 8.6:1, subtle 7.6:1.
//   plot        axis 5:1, outline 3.4:1 (the figure profile asks 3:1 for the outline), grid about 1.25:1,
//               the context grey differs from the focus colour by at least 25 L*.
//   categorical eight colours, recorded from enderby-search.ts for two candidates (separable, balanced).
//               The figure profile holds each to Okabe-Ito's smallest pairwise OKLab distance in four views.
//   sequential  three ramps of nine steps, equal in OKLab distance along the path. Step 1 is the colour
//               nearest the ground, so the dark mode reads each ramp in the opposite order.
//   diverging   two ramps of nine steps. The extremes sit at OKLab lightness 0.52, where a mark keeps
//               more than 3:1 on both grounds, so the two modes share the colours.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { simulateCvd } from "../../lib/colour/cvd.ts";
import { lstar } from "../../lib/colour/grey.ts";
import { fromOklch, oklabDistance, toOklab, toOklch } from "../../lib/colour/oklab.ts";
import { contrastRatio } from "../../lib/colour/wcag.ts";
import { buildReport } from "../../lib/harness/index.ts";
import type { FamilyReport } from "../../lib/harness/index.ts";
import { referencePalettes, sampleRamp } from "../../lib/harness/reference.ts";
import { loadSchema, readJson, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { validateFamily } from "../../lib/model/validate.ts";
import type { FamilyFile } from "../../lib/model/types.ts";
import { GROUNDS, OKABE_ITO_MINIMA, maxChroma } from "./enderby-search.ts";

type Mode = "light" | "dark";
type Candidate = "separable" | "balanced";
type Palette = Record<string, Record<string, string>>;

const root = repoRoot();
const WRITE = process.argv.includes("--write");
const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8"));
const th = (path: string): number => {
  let cur: unknown = thresholds;
  for (const k of path.split(".")) cur = (cur as Record<string, unknown>)[k];
  return cur as number;
};
const MARK = th("profiles.figure.markContrast.min");
const UNIFORM = th("profiles.figure.sequentialUniformity.max");
const SYMMETRY = th("profiles.figure.divergingSymmetry.max");
const CENTRE_CHROMA = th("profiles.figure.divergingCentreChroma.max");
const AXIS = th("profiles.figure.divergingAxis.minDistance");
const PRINT_TEXT = th("profiles.print-grey.text.min");
const PRINT_GAP = th("profiles.print-grey.distinctLstar.min");
const FOCUS_DISTANCE = th("profiles.figure.focusContext.minDistance");
/** The focus colour differs from the context grey by at least this many L*: more than the 12 that print-grey asks of categories, so a highlighted series stands out in a greyscale copy. */
const FOCUS_GAP = 20;

const fmt = (n: number, d = 2) => n.toFixed(d);
const hex = (L: number, C: number, h: number) => fromOklch(L, C, h);
const VIEWS = ["normal", "protan", "deutan", "tritan"] as const;
const seen = (h: string, v: (typeof VIEWS)[number]) => (v === "normal" ? h : simulateCvd(h, v, 1));

// ---------------------------------------------------------------------------------------------
// Grounds, text and chart chrome
// ---------------------------------------------------------------------------------------------
/** The colour at this chroma and hue that just reaches `ratio` on `bg`, found by bisection on OKLab lightness. */
function atContrast(bg: string, ratio: number, C: number, h: number, lighter: boolean): string {
  let lo = 0.02;
  let hi = 0.99;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const ok = contrastRatio(hex(mid, C, h), bg) >= ratio;
    if (lighter) { if (ok) hi = mid; else lo = mid; } else if (ok) lo = mid; else hi = mid;
  }
  return hex(lighter ? hi : lo, C, h);
}

const light = GROUNDS.light;
const dark = GROUNDS.dark;
const chrome: Palette = {
  // The light ground and its tints, in OKLCH (L, C, h): ivory, hue 92.
  paper: {
    bg: light,
    sunk: hex(0.955, 0.013, 92),
    raised: hex(0.992, 0.006, 92),
    rule: hex(0.87, 0.014, 92),
    grid: hex(0.905, 0.01, 92),
    select: hex(0.905, 0.045, 250),
  },
  // Text, axes and context on the light ground: a blue-black ink, hue 258, grey near the axis and the context.
  ink: {
    text: atContrast(light, 14, 0.03, 258, false),
    muted: atContrast(light, 8.6, 0.028, 258, false),
    subtle: atContrast(light, 7.6, 0.026, 258, false),
    axis: atContrast(light, 5, 0.012, 92, false),
    outline: atContrast(light, 3.4, 0.01, 92, false),
    context: hex(0.76, 0.007, 92),
  },
  // The dark ground and its tints: pilot cloth, hue 255. The panel is darker than the ground, so a mark keeps at least its contrast there.
  night: {
    bg: dark,
    sunk: hex(0.245, 0.03, 255),
    raised: hex(0.285, 0.03, 255),
    rule: hex(0.36, 0.03, 255),
    grid: hex(0.3, 0.027, 255),
    deep: hex(0.18, 0.026, 255),
    select: hex(0.36, 0.06, 250),
  },
  chalk: {
    text: atContrast(dark, 14.5, 0.02, 92, true),
    muted: atContrast(dark, 8.6, 0.02, 92, true),
    subtle: atContrast(dark, 7.6, 0.018, 92, true),
    axis: atContrast(dark, 5, 0.01, 255, true),
    outline: atContrast(dark, 3.4, 0.01, 255, true),
    // The context grey sits 20 L* or more below the dark focus colours, recessive at 2.4:1 on the ground.
    context: hex(0.45, 0.01, 255),
  },
  // Links and buttons: the pilot blue, deep on ivory and pale on pilot cloth.
  "pilot-light": {
    link: atContrast(light, 8.4, 0.14, 258, false),
    hover: atContrast(light, 11, 0.13, 258, false),
    button: hex(0.34, 0.11, 258),
  },
  "pilot-dark": {
    link: atContrast(dark, 9, 0.1, 245, true),
    hover: atContrast(dark, 12, 0.08, 245, true),
  },
  // Brass: the accent and the focus ring, 3.4:1 on the light ground and 9:1 on the dark one.
  brass: {
    light: atContrast(light, 3.4, 0.115, 88, false),
    dark: atContrast(dark, 9, 0.12, 88, true),
  },
};

// ---------------------------------------------------------------------------------------------
// Categorical colours, recorded from enderby-search.ts
// ---------------------------------------------------------------------------------------------
/** Per slot: light hue, dark hue offset, then L and C in the light mode and in the dark mode (OKLCH). */
type Row = [number, number, number, number, number, number];
const RECORD: Record<Candidate, { first: number[]; rows: Row[] }> = {
  // node scripts/design/enderby-search.ts separable (seed 6): worst-view ratio 1.085 against Okabe-Ito, first four 1.504.
  separable: {
    first: [0, 7, 5, 4],
    rows: [
      [256.67, 8.68, 0.4139, 0.1437, 0.6518, 0.1386], // slot 0
      [97.79, 11.91, 0.6406, 0.1322, 0.6293, 0.136], // slot 1
      [163.83, 7.79, 0.5342, 0.1135, 0.7321, 0.1336], // slot 2
      [347.08, -7.27, 0.4128, 0.1368, 0.6355, 0.1391], // slot 3
      [231.71, -12, 0.6404, 0.1212, 0.8728, 0.0925], // slot 4
      [40.21, 3.75, 0.5418, 0.1493, 0.5446, 0.1349], // slot 5
      [298.95, 8.34, 0.5544, 0.148, 0.7953, 0.1303], // slot 6
      [61.92, 7.05, 0.2982, 0.0685, 0.7712, 0.1385], // slot 7
    ],
  },
  // node scripts/design/enderby-search.ts balanced (seed 3): worst-view ratio 1.060, all eight within 20 L* in each mode.
  balanced: {
    first: [0, 3, 1, 2],
    rows: [
      [250.49, -12, 0.4574, 0.101, 0.5321, 0.1054], // slot 0
      [84.9, 6.82, 0.6313, 0.1289, 0.5378, 0.1088], // slot 1
      [344.64, 3.72, 0.6503, 0.1793, 0.7231, 0.1667], // slot 2
      [84.87, 4.42, 0.4603, 0.0943, 0.7014, 0.1414], // slot 3
      [299.45, -6.25, 0.5514, 0.1783, 0.6222, 0.1696], // slot 4
      [172.61, -7.53, 0.5736, 0.0922, 0.6421, 0.1056], // slot 5
      [251.51, -10.55, 0.6311, 0.1794, 0.7022, 0.1581], // slot 6
      [1.26, 5.48, 0.4823, 0.1786, 0.5526, 0.1421], // slot 7
    ],
  },
};
const slotHex = (row: Row, m: Mode): string => (m === "light" ? hex(row[2], row[3], row[0]) : hex(row[4], row[5], row[0] + row[1]));

/** The order of the colours in the token file: slot 0 (the pilot blue) first, then each colour farthest, in the worst of both modes and four views, from those already chosen. The first four come from `first`. */
function ordering(cand: Candidate): number[] {
  const { rows, first } = RECORD[cand];
  const colours = rows.map((r) => [slotHex(r, "light"), slotHex(r, "dark")] as const);
  const ratio = (a: number, b: number) => {
    let min = Infinity;
    for (let m = 0; m < 2; m++) for (const v of VIEWS) min = Math.min(min, oklabDistance(seen(colours[a]![m]!, v), seen(colours[b]![m]!, v)) / OKABE_ITO_MINIMA[v]);
    return min;
  };
  const order = [0];
  const pools = cand === "separable" ? [first.filter((i) => i !== 0), rows.map((_, i) => i).filter((i) => !first.includes(i))] : [rows.map((_, i) => i).filter((i) => i !== 0)];
  for (const pool of pools) {
    const left = [...pool];
    while (left.length > 0) {
      let best = left[0]!;
      let bestScore = -Infinity;
      for (const c of left) {
        const s = Math.min(...order.map((o) => ratio(o, c)));
        if (s > bestScore + 1e-12) { bestScore = s; best = c; }
      }
      order.push(best);
      left.splice(left.indexOf(best), 1);
    }
  }
  return order;
}
const NAMES = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
function categorical(cand: Candidate): { light: Record<string, string>; dark: Record<string, string> } {
  const order = ordering(cand);
  const out = { light: {} as Record<string, string>, dark: {} as Record<string, string> };
  order.forEach((slot, i) => {
    out.light[NAMES[i]!] = slotHex(RECORD[cand].rows[slot]!, "light");
    out.dark[NAMES[i]!] = slotHex(RECORD[cand].rows[slot]!, "dark");
  });
  return out;
}

// ---------------------------------------------------------------------------------------------
// Sequential and diverging ramps
// ---------------------------------------------------------------------------------------------
type Pts = [number, number][];
interface PathDef { L: Pts; f: Pts; h: Pts }
const interp = (pts: Pts, u: number): number => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [u0, v0] = pts[i]!;
    const [u1, v1] = pts[i + 1]!;
    if (u <= u1) return v0 + ((v1 - v0) * (u - u0)) / (u1 - u0 || 1);
  }
  return pts[pts.length - 1]![1];
};
/** A point on a path: lightness and hue from the control points, chroma as a fraction of what sRGB allows there, so nothing is gamut-mapped. */
const point = (def: PathDef, u: number) => {
  const L = interp(def.L, u);
  const h = interp(def.h, u);
  return { L, h, C: Math.min(0.999, interp(def.f, u)) * maxChroma(L, h) };
};
const labOf = (p: { L: number; C: number; h: number }): [number, number, number] => [p.L, p.C * Math.cos((p.h * Math.PI) / 180), p.C * Math.sin((p.h * Math.PI) / 180)];
/** n parameters that cut the path into pieces of equal OKLab length. */
function equalSteps(def: PathDef, n: number): number[] {
  const M = 3000;
  const cum: number[] = [0];
  let prev = labOf(point(def, 0));
  for (let k = 1; k < M; k++) {
    const cur = labOf(point(def, k / (M - 1)));
    cum.push(cum[k - 1]! + Math.hypot(cur[0] - prev[0], cur[1] - prev[1], cur[2] - prev[2]));
    prev = cur;
  }
  const total = cum[M - 1]!;
  return Array.from({ length: n }, (_, i) => {
    let k = 0;
    while (k < M - 1 && cum[k]! < (total * i) / (n - 1)) k++;
    return k / (M - 1);
  });
}
const colourAt = (def: PathDef, u: number) => { const p = point(def, u); return hex(p.L, p.C, p.h); };

const stepsOf = (hexes: string[]) => hexes.slice(1).map((h, i) => oklabDistance(hexes[i]!, h));
const monotone = (hexes: string[]) => {
  const L = hexes.map((h) => toOklab(h).L);
  const d = L.slice(1).map((v, i) => v - L[i]!);
  return d.every((x) => x > 0) || d.every((x) => x < 0);
};
const ratioOf = (hexes: string[]) => { const s = stepsOf(hexes); return Math.max(...s) / Math.min(...s); };
const toRgb = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const fromRgb = (c: number[]) => "#" + c.map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
/** Moves each inner step by one 8-bit unit where that lowers the largest-to-smallest step ratio and keeps lightness monotone. */
function polish(hexes: string[]): string[] {
  const cur = hexes.slice();
  const score = (l: string[]) => (monotone(l) ? ratioOf(l) : 99);
  let best = score(cur);
  for (let sweep = 0; sweep < 6; sweep++) {
    let improved = false;
    for (let i = 1; i < cur.length - 1; i++) {
      const base = toRgb(cur[i]!);
      let pick = cur[i]!;
      let pickScore = best;
      for (let dr = -1; dr <= 1; dr++) for (let dg = -1; dg <= 1; dg++) for (let db = -1; db <= 1; db++) {
        const c = [base[0] + dr, base[1] + dg, base[2] + db];
        if (c.some((x) => x < 0 || x > 255)) continue;
        const trial = cur.slice();
        trial[i] = fromRgb(c);
        const s = score(trial);
        if (s < pickScore - 1e-9) { pickScore = s; pick = trial[i]!; }
      }
      if (pick !== cur[i]) { cur[i] = pick; best = pickScore; improved = true; }
    }
    if (!improved) break;
  }
  return cur;
}

const STEPS = 9;
/** Sequential paths from the pale end to the deep end: OKLab lightness, the fraction of the gamut chroma, and hue. */
const SEQUENTIAL: Record<string, PathDef> = {
  pilot: { L: [[0, 0.965], [1, 0.285]], f: [[0, 0.1], [0.25, 0.45], [0.55, 0.9], [0.8, 0.93], [1, 0.85]], h: [[0, 250], [1, 262]] },
  brass: { L: [[0, 0.972], [1, 0.3]], f: [[0, 0.16], [0.25, 0.55], [0.55, 0.92], [0.8, 0.95], [1, 0.8]], h: [[0, 92], [0.5, 80], [1, 62]] },
  lagoon: { L: [[0, 0.972], [1, 0.3]], f: [[0, 0.14], [0.25, 0.6], [0.55, 0.9], [0.8, 0.92], [1, 0.85]], h: [[0, 108], [0.3, 140], [0.55, 190], [0.8, 240], [1, 268]] },
};
function sequential(name: string): string[] {
  const def = SEQUENTIAL[name]!;
  return polish(equalSteps(def, STEPS).map((u) => colourAt(def, u)));
}

/** Diverging ramps: one side runs from a neutral centre at OKLab lightness 0.962 to the extreme at 0.52. */
const CENTRE_L = 0.962;
const EXTREME_L = 0.52;
const side = (h: number, fraction: number): PathDef => ({ L: [[0, CENTRE_L], [1, EXTREME_L]], f: [[0, 0], [1, fraction]], h: [[0, h], [1, h]] });
const DIVERGING: Record<string, [PathDef, PathDef]> = {
  "blue-orange": [side(258, 0.93), side(48, 0.93)],
  "teal-brass": [side(196, 0.9), side(68, 0.92)],
};
function diverging(name: string): string[] {
  const [a, b] = DIVERGING[name]!;
  const half = (STEPS - 1) / 2;
  const left = equalSteps(a, half + 1).map((u) => colourAt(a, u));
  const right = equalSteps(b, half + 1).map((u) => colourAt(b, u));
  return [...left.slice(1).reverse(), hex(CENTRE_L, 0.006, 92), ...right.slice(1)];
}

// ---------------------------------------------------------------------------------------------
// The palettes
// ---------------------------------------------------------------------------------------------
const indexed = (list: string[]): Record<string, string> => Object.fromEntries(list.map((h, i) => [String(i + 1), h]));
function paletteFor(cand: Candidate): Palette {
  const cat = categorical(cand);
  const pal: Palette = {};
  for (const [g, entries] of Object.entries(chrome)) pal[g] = { ...entries };
  pal["cat-light"] = cat.light;
  pal["cat-dark"] = cat.dark;
  for (const name of Object.keys(SEQUENTIAL)) pal[`seq-${name}`] = indexed(sequential(name));
  for (const name of Object.keys(DIVERGING)) pal[`div-${name}`] = indexed(diverging(name));
  return pal;
}

// ---------------------------------------------------------------------------------------------
// Token files
// ---------------------------------------------------------------------------------------------
const primaryPath = join(root, "families/enderby/enderby.tokens.json");
const candidatePath = join(root, "families/enderby/candidates/balanced.tokens.json");

/** Formats a value as JSON with short arrays and small leaf objects kept on one line. */
function format(v: unknown, ind = 0): string {
  const pad = "  ".repeat(ind);
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) {
    const one = "[" + v.map((x) => format(x, 0)).join(", ") + "]";
    if (v.every((x) => x === null || typeof x !== "object") && one.length <= 100) return one;
    return "[\n" + v.map((x) => pad + "  " + format(x, ind + 1)).join(",\n") + "\n" + pad + "]";
  }
  const entries = Object.entries(v as Record<string, unknown>);
  const leaf = entries.every(([, x]) => x === null || typeof x !== "object" || (Array.isArray(x) && x.every((y) => typeof y !== "object")));
  if (leaf) {
    const one = "{ " + entries.map(([k, x]) => JSON.stringify(k) + ": " + format(x, 0)).join(", ") + " }";
    if (one.length <= 140) return one;
  }
  return "{\n" + entries.map(([k, x]) => pad + "  " + JSON.stringify(k) + ": " + format(x, ind + 1)).join(",\n") + "\n" + pad + "}";
}
/** The palette block of a token file as text, from the line `  "palette": {` to the line `  },`. */
function withPalette(text: string, pal: Palette): string {
  const lines = text.split("\n");
  const start = lines.indexOf('  "palette": {');
  const end = lines.findIndex((l, i) => i > start && l === "  },");
  if (start < 0 || end < 0) throw new Error("the token file has no palette block in the expected layout");
  const inner = JSON.stringify(pal, null, 2).split("\n").slice(1, -1).map((l) => "  " + l);
  return [...lines.slice(0, start), '  "palette": {', ...inner, "  },", ...lines.slice(end + 1)].join("\n");
}
const valueOf = (e: unknown): string => (typeof e === "string" ? e : (e as { hex: string }).hex);

/** The balanced candidate: the primary file with the balanced categorical colours and the declarations that go with them. */
function candidateFile(primary: FamilyFile): FamilyFile {
  const f = structuredClone(primary);
  const pal = paletteFor("balanced");
  f.palette = Object.fromEntries(Object.entries(pal).map(([g, e]) => [g, e])) as FamilyFile["palette"];
  f.distinct = [
    primary.distinct!.find((d) => d.id === "categorical")!,
    {
      id: "categorical-greyscale",
      set: "data.categorical",
      patterned: NAMES,
      for: ["print-grey"],
      by: "All eight categories carry their own marker and dash pattern from design.markers and design.lines. The colours sit in a narrow band of lightness, so a greyscale print separates them by shape and line style alone.",
      note: "The balanced candidate cannot carry a greyscale gate by colour: its eight colours are close in lightness by design. Declaring all eight as patterned makes the gate measure nothing, and says what a print relies on.",
    },
  ];
  // The focus colour is the first category that stays FOCUS_GAP L* and FOCUS_DISTANCE from the context grey in the mode.
  for (const m of ["light", "dark"] as const) {
    const context = pal[m === "light" ? "ink" : "chalk"]!.context!;
    const cats = pal[`cat-${m}`]!;
    const pick = NAMES.find((n) => Math.abs(lstar(cats[n]!) - lstar(context)) >= FOCUS_GAP && oklabDistance(cats[n]!, context) >= FOCUS_DISTANCE);
    if (pick === undefined) throw new Error(`balanced: no category keeps ${FOCUS_GAP} L* from the context grey in ${m}`);
    (f.modes[m].data as { plot: Record<string, string> }).plot.focus = `{palette.cat-${m}.${pick}}`;
  }
  f.rules = (primary.rules ?? []).map((r) => {
    if (r.id === "series-carry-markers") return { ...r, text: "Every series carries the marker and the dash pattern of its number (design.markers and design.lines). In print all eight series are told apart by these and by direct labels, not by colour." };
    if (r.id === "categories-in-order") return { ...r, text: "Categories are used in the order given, which is the order of separability under normal vision and colour vision simulation. It is not an order of lightness." };
    return r;
  });
  return f;
}

// ---------------------------------------------------------------------------------------------
// Derive, compare, write
// ---------------------------------------------------------------------------------------------
const schema = loadSchema();
let failed = false;
const fail = (msg: string) => { console.log("FAIL " + msg); failed = true; };

const primaryPalette = paletteFor("separable");
if (WRITE) writeFileSync(primaryPath, withPalette(readFileSync(primaryPath, "utf8"), primaryPalette));
const primary = readJson(primaryPath) as FamilyFile;
const palette = primary.palette as Record<string, Record<string, unknown>>;
for (const [g, entries] of Object.entries(primaryPalette)) {
  for (const [n, h] of Object.entries(entries)) {
    const have = palette[g]?.[n];
    if (have === undefined) fail(`palette.${g}.${n} is missing from enderby.tokens.json (derived ${h})`);
    else if (valueOf(have) !== h) fail(`palette.${g}.${n} is ${valueOf(have)} in enderby.tokens.json, derived ${h}`);
  }
}
for (const [g, entries] of Object.entries(palette)) for (const n of Object.keys(entries)) if (primaryPalette[g]?.[n] === undefined) fail(`palette.${g}.${n} is in enderby.tokens.json and not derived`);

const candidate = candidateFile(primary);
const candidateText = format(candidate) + "\n";
if (WRITE) writeFileSync(candidatePath, candidateText);
let onDisk = "";
try { onDisk = readFileSync(candidatePath, "utf8"); } catch { onDisk = ""; }
if (onDisk !== candidateText) fail("candidates/balanced.tokens.json differs from the file this script generates; run it with --write");
if (failed && !WRITE) {
  console.log("\nThe token files are not in step with the derivation. Run node scripts/design/enderby.ts --write after checking the change.");
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------------------------
const table = (head: string[], rows: string[][]) => {
  const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length)));
  const line = (r: string[]) => r.map((c, i) => c.padEnd(w[i]!)).join("  ").trimEnd();
  console.log(line(head));
  console.log(w.map((n) => "-".repeat(n)).join("  "));
  for (const r of rows) console.log(line(r));
};
const ground = { light, dark };
const tokens = (cand: Candidate) => resolveFamily(cand === "separable" ? primary : candidate);

console.log("GROUND AND CHROME");
table(["group.name", "hex", "L*", "on its ground"], Object.entries(chrome).flatMap(([g, e]) =>
  Object.entries(e).map(([n, h]) => {
    const onLight = ["paper", "ink", "pilot-light"].includes(g) || (g === "brass" && n === "light");
    const bg = onLight ? ground.light : ground.dark;
    return [`${g}.${n}`, h, fmt(lstar(h), 1), `${fmt(contrastRatio(h, bg))}:1 on ${onLight ? "ivory" : "pilot cloth"}`];
  })));

const oi = referencePalettes().okabeIto.map((c) => c.hex);
const sd = (l: number[]) => { const m = l.reduce((a, b) => a + b, 0) / l.length; return Math.sqrt(l.reduce((a, b) => a + (b - m) ** 2, 0) / l.length); };
for (const cand of ["separable", "balanced"] as const) {
  const fam = tokens(cand);
  console.log(`\nCATEGORICAL, ${cand.toUpperCase()}`);
  const rows: string[][] = [];
  for (const m of ["light", "dark"] as const) {
    const mode = fam.modes[m];
    const bg = mode.colours.get("data.plot.background")!.hex;
    const list = NAMES.map((n) => mode.colours.get(`data.categorical.${n}`)!.hex);
    NAMES.forEach((n, i) => {
      const c = toOklch(list[i]!);
      rows.push([m, n, list[i]!, fmt(lstar(list[i]!), 1), fmt(c.C, 3), fmt(c.h, 0), `${fmt(contrastRatio(list[i]!, bg))}:1`]);
    });
    const l = list.map(lstar);
    const gap = Math.min(...[0, 1, 2, 3].flatMap((i) => [0, 1, 2, 3].filter((j) => j > i).map((j) => Math.abs(l[i]! - l[j]!))));
    const oiL = oi.map(lstar);
    const below = (xs: string[]) => xs.filter((x) => contrastRatio(x, bg) < MARK).length;
    const views = VIEWS.map((v) => {
      let min = Infinity;
      for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) min = Math.min(min, oklabDistance(seen(list[i]!, v), seen(list[j]!, v)));
      return `${v} ${fmt(min, 3)} (Okabe-Ito ${fmt(OKABE_ITO_MINIMA[v], 3)})`;
    });
    console.log(`  ${m}: ${views.join("; ")}`);
    console.log(`  ${m}: L* gap among the first four ${fmt(gap, 1)} (Okabe-Ito 0.8), L* standard deviation ${fmt(sd(l), 1)} (${fmt(sd(oiL), 1)}), L* range ${fmt(Math.max(...l) - Math.min(...l), 1)}, marks below ${MARK}:1 ${below(list)} (${below(oi)})`);
  }
  table(["mode", "name", "hex", "L*", "C", "h", "on the ground"], rows);
}

console.log("\nFOCUS AND CONTEXT");
for (const cand of ["separable", "balanced"] as const) {
  for (const m of ["light", "dark"] as const) {
    const colours = tokens(cand).modes[m].colours;
    const focus = colours.get("data.plot.focus")!.hex;
    const context = colours.get("data.plot.context")!.hex;
    const bg = colours.get("data.plot.background")!.hex;
    const name = NAMES.find((n) => colours.get(`data.categorical.${n}`)!.hex === focus) ?? "none";
    const gap = Math.abs(lstar(focus) - lstar(context));
    console.log(`  ${cand}, ${m}: focus is ${name} ${focus} (${fmt(contrastRatio(focus, bg))}:1), context ${context} (${fmt(contrastRatio(context, bg))}:1, chroma ${fmt(toOklch(context).C, 3)}), ${fmt(gap, 1)} L* and ${fmt(oklabDistance(focus, context), 3)} OKLab apart (limits ${FOCUS_GAP} L*, ${FOCUS_DISTANCE})`);
    if (gap < FOCUS_GAP) fail(`${cand} ${m}: the focus colour is ${fmt(gap, 1)} L* from the context grey, needs ${FOCUS_GAP}`);
  }
}

console.log("\nSEQUENTIAL");
for (const name of Object.keys(SEQUENTIAL)) {
  const list = indexedOf(primaryPalette[`seq-${name}`]!);
  const n = list.length;
  const v = sampleRamp(referencePalettes().viridis, n);
  const c = sampleRamp(referencePalettes().cividis, n);
  const L = list.map((h) => toOklab(h).L);
  console.log(`  ${name}: ${list.join(" ")}`);
  console.log(`    lightness ${fmt(L[0]!, 3)} to ${fmt(L[n - 1]!, 3)}, monotone ${monotone(list)}, step ratio ${fmt(ratioOf(list), 3)} (limit ${UNIFORM}; viridis ${fmt(ratioOf(v), 3)}, cividis ${fmt(ratioOf(c), 3)}), total length ${fmt(stepsOf(list).reduce((a, b) => a + b, 0), 3)} (${fmt(stepsOf(v).reduce((a, b) => a + b, 0), 3)}, ${fmt(stepsOf(c).reduce((a, b) => a + b, 0), 3)})`);
  console.log(`    contrast with the ground, step 1 to ${n}: light ${list.map((h) => fmt(contrastRatio(h, light), 1)).join(" ")}; dark ${list.map((h) => fmt(contrastRatio(h, dark), 1)).join(" ")}`);
}
function indexedOf(e: Record<string, string>): string[] { return Object.keys(e).sort((a, b) => Number(a) - Number(b)).map((k) => e[k]!); }

console.log("\nDIVERGING");
for (const name of Object.keys(DIVERGING)) {
  const list = indexedOf(primaryPalette[`div-${name}`]!);
  const L = list.map((h) => toOklab(h).L);
  const sym = Math.max(...[0, 1, 2, 3].map((i) => Math.abs(L[i]! - L[STEPS - 1 - i]!)));
  const apart = VIEWS.map((v) => {
    let min = Infinity;
    for (let i = 0; i < 2; i++) min = Math.min(min, oklabDistance(seen(list[i]!, v), seen(list[STEPS - 1 - i]!, v)));
    return `${v} ${fmt(min, 3)}`;
  });
  console.log(`  ${name}: ${list.join(" ")}`);
  console.log(`    matched steps differ by at most ${fmt(sym, 3)} (limit ${SYMMETRY}); centre chroma ${fmt(toOklch(list[4]!).C, 3)} (limit ${CENTRE_CHROMA}); outer halves apart: ${apart.join(", ")} (limit ${AXIS}); extremes ${fmt(contrastRatio(list[0]!, light), 1)}:1 and ${fmt(contrastRatio(list[8]!, light), 1)}:1 on ivory, ${fmt(contrastRatio(list[0]!, dark), 1)}:1 and ${fmt(contrastRatio(list[8]!, dark), 1)}:1 on pilot cloth`);
}
console.log(`  grey print limit for text is ${PRINT_TEXT}:1 and for the first four categories ${PRINT_GAP} L*`);

// ---------------------------------------------------------------------------------------------
// The harness
// ---------------------------------------------------------------------------------------------
console.log("\nHARNESS");
for (const [label, file, listed] of [["enderby.tokens.json", primary, ["figure", "cvd", "print-grey", "projector", "office-screen"]], ["candidates/balanced.tokens.json", candidate, ["figure", "cvd", "print-grey", "projector", "office-screen"]]] as const) {
  const issues = validateFamily(file, schema).filter((i) => i.level === "error");
  if (issues.length > 0) { for (const i of issues) fail(`${label}: ${i.where}: ${i.message}`); continue; }
  const report: FamilyReport = buildReport(resolveFamily(file), thresholds);
  console.log(`${label}`);
  for (const p of listed) {
    const r = report.profiles[p];
    if (!r) { fail(`${label}: profile ${p} did not run`); continue; }
    console.log(`  ${p.padEnd(14)} ${r.status.padEnd(6)} ${r.errors} errors, ${r.warnings} warnings`);
    if (r.status === "fail") {
      failed = true;
      for (const c of r.checks.filter((x) => !x.ok && !x.report && !x.waived && x.level === "error")) console.log(`    ${c.detail}`);
    }
  }
}
if (failed) { console.log("\nThe derivation failed."); process.exit(1); }
console.log("\nThe token files match the derivation and every listed profile passes.");
