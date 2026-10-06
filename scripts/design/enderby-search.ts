// Enderby 0.1.0: the search for the eight categorical colours.
//
// The figure profile wants eight colours that match Okabe-Ito's smallest pairwise OKLab distance under
// normal vision and under protan, deutan and tritan simulation, and beat it on one further measure.
// The owner's brief asks for two real candidates that trade against each other:
//
//   separable  the first four colours are far apart in lightness, so they survive a greyscale copy
//   balanced   all eight colours sit in a narrow lightness band, so none shouts
//
// This file searches both. It is a simulated annealing over eight colours, each given as a hue that both
// modes share (the dark hue may move by up to 12 degrees), a lightness in each mode and a chroma in each
// mode (as a fraction of what sRGB allows at that lightness and hue, so no gamut mapping is needed).
// The search is seeded and deterministic. enderby.ts holds the result and does not run the search.
//
//   node scripts/design/enderby-search.ts separable            search with the recorded seed
//   node scripts/design/enderby-search.ts balanced --seed 7    another seed
//   node scripts/design/enderby-search.ts frontier             how the balanced ratio falls with the band
//
// Options: --seed N  --iters N  --restarts N
//
// The arithmetic in the inner loop is plain arrays (OKLab matrices of Ottosson 2020, the Machado matrices
// read from lib/colour/cvd.ts, 8-bit rounding after every step as simulateCvd and applyFlare do). It
// agrees with lib/colour to 1e-8 on distances. enderby.ts measures the recorded colours again with lib.
import { cvdMatrix, simulateCvd } from "../../lib/colour/cvd.ts";
import { minPairwise } from "../../lib/colour/distinct.ts";
import { fromOklch, oklabDistance } from "../../lib/colour/oklab.ts";
import { referencePalettes } from "../../lib/harness/reference.ts";

export type Candidate = "separable" | "balanced";
export type Triple = [number, number, number];

// ---------------------------------------------------------------------------------------------
// Fast colour arithmetic
// ---------------------------------------------------------------------------------------------
const VIEWS = ["normal", "protan", "deutan", "tritan"] as const;
type View = (typeof VIEWS)[number];
const MAT = { protan: cvdMatrix("protan", 1), deutan: cvdMatrix("deutan", 1), tritan: cvdMatrix("tritan", 1) } as const;

const decode = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const encode = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
const DEC8 = Array.from({ length: 256 }, (_, i) => decode(i / 255));
const lin8 = (c: Triple): Triple => [DEC8[c[0]]!, DEC8[c[1]]!, DEC8[c[2]]!];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const to8 = (l: Triple): Triple => {
  const f = (v: number) => Math.min(255, Math.max(0, Math.round(encode(clamp01(v)) * 255)));
  return [f(l[0]), f(l[1]), f(l[2])];
};
export const hexTo8 = (hex: string): Triple => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
export const hexOf8 = (c: Triple): string => "#" + c.map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
function linToOklab(l: Triple): Triple {
  const a = Math.cbrt(0.4122214708 * l[0] + 0.5363325363 * l[1] + 0.0514459929 * l[2]);
  const b = Math.cbrt(0.2119034982 * l[0] + 0.6806995451 * l[1] + 0.1073969566 * l[2]);
  const c = Math.cbrt(0.0883024619 * l[0] + 0.2817188376 * l[1] + 0.6299787005 * l[2]);
  return [
    0.2104542553 * a + 0.793617785 * b - 0.0040720468 * c,
    1.9779984951 * a - 2.428592205 * b + 0.4505937099 * c,
    0.0259040371 * a + 0.7827717662 * b - 0.808675766 * c,
  ];
}
function oklabToLin(L: number, a: number, b: number): Triple {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const inGamut = (v: Triple) => v.every((x) => x >= -1e-6 && x <= 1 + 1e-6);
/** The largest chroma sRGB allows at this lightness and hue. */
export function maxChroma(L: number, h: number): number {
  const r = (h * Math.PI) / 180;
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToLin(L, mid * Math.cos(r), mid * Math.sin(r)))) lo = mid; else hi = mid;
  }
  return lo;
}
/** OKLCH to 8-bit sRGB. The caller keeps chroma inside the gamut, so nothing is mapped. */
export function lchTo8(L: number, C: number, h: number): Triple {
  const r = (h * Math.PI) / 180;
  return to8(oklabToLin(L, C * Math.cos(r), C * Math.sin(r)));
}
const seen8 = (c: Triple, view: View): Triple => {
  if (view === "normal") return c;
  const m = MAT[view];
  const [r, g, b] = lin8(c);
  return to8([m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b]);
};
const lab8 = (c: Triple): Triple => linToOklab(lin8(c));
const dist = (a: Triple, b: Triple) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const lum8 = (c: Triple) => { const [r, g, b] = lin8(c); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (y1: number, y2: number) => (Math.max(y1, y2) + 0.05) / (Math.min(y1, y2) + 0.05);
const lstarOfY = (y: number) => (y <= 216 / 24389 ? (24389 / 27) * y : 116 * Math.cbrt(y) - 16);
const flare8 = (c: Triple, k: number): Triple => { const [r, g, b] = lin8(c); return to8([Math.min(1, r + k), Math.min(1, g + k), Math.min(1, b + k)]); };
const lchOf = (c: Triple): Triple => {
  const [L, a, b] = lab8(c);
  const C = Math.hypot(a, b);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return [L, C, C < 1e-4 ? 0 : h < 0 ? h + 360 : h];
};
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------------------------------------------------------------------------------------------
// What the search has to satisfy, with where each number comes from
// ---------------------------------------------------------------------------------------------
/** The two figure grounds the search measures against. enderby.ts derives the same two colours. */
export const GROUNDS = { light: fromOklch(0.975, 0.012, 92), dark: fromOklch(0.205, 0.028, 255) } as const;
const GROUND_Y = [lum8(hexTo8(GROUNDS.light)), lum8(hexTo8(GROUNDS.dark))];

/** Okabe-Ito's smallest pairwise OKLab distance in each view, from tests/fixtures/reference/palettes.json. */
function referenceMinima(): Record<View, number> {
  const oi = referencePalettes().okabeIto.map((c) => c.hex);
  const out = {} as Record<View, number>;
  for (const v of VIEWS) out[v] = minPairwise(oi, oklabDistance, v === "normal" ? undefined : (h) => simulateCvd(h, v, 1)).min;
  return out;
}
export const OKABE_ITO_MINIMA = referenceMinima();

export interface Limits {
  /** WCAG 1.4.11 asks 3:1 for a mark. The search keeps a little above it in light mode and more in dark mode, where a mark at 3:1 looks dim. */
  contrast: [number, number];
  /** print-grey asks 12 L* between the first four (tests/environments.json, print-grey.distinctLstar). The search aims for 13.5. */
  gap: number;
  /** All eight within this many L*, for the balanced candidate. */
  spread: number;
  /** projector asks 0.08 after a flare of 0.02 (projector.flagFields); the search keeps 0.085. */
  flare: number;
  /** Chroma caps: light, dark, and for colours of L* 78 or more (no neon). */
  cmax: [number, number];
  cbright: number;
  cmin: number;
  /** Lightest allowed mark in dark mode, darkest in light mode, in L*. */
  lmaxDark: number;
  lminLight: number;
}
export const LIMITS: Record<Candidate, Limits> = {
  separable: { contrast: [3.05, 3.4], gap: 13.5, spread: 999, flare: 0.085, cmax: [0.15, 0.14], cbright: 0.1, cmin: 0.065, lmaxDark: 86, lminLight: 18 },
  // The balanced candidate holds all eight colours within 20 L* in each mode. Matching Okabe-Ito in a band that narrow takes more chroma: see `frontier`.
  balanced: { contrast: [3.05, 3.4], gap: 0, spread: 20, flare: 0.085, cmax: [0.18, 0.17], cbright: 0.12, cmin: 0.065, lmaxDark: 86, lminLight: 18 },
};
/**
 * The first phase of the search runs with the chroma caps loosened: a search under the final caps from a random
 * start settles 0.05 to 0.08 lower in worst-view ratio than one that tightens the caps afterwards.
 */
const loosen = (l: Limits): Limits => ({ ...l, cmax: [0.16, 0.16], cbright: 1 });
const FMIN = 0.5; // each colour keeps at least half the chroma sRGB allows at its lightness and hue
const TWIN_DEG = 22; // two colours within 22 degrees of hue differ by at least 12 L*
const TWIN_L = 12;
const DH_MAX = 12;
const N = 8;

/** Slot 0 is the pilot blue, slot 1 the brass; the other six are free. Lightness windows are for light mode. */
const WINDOWS: ({ lo: number; hi: number; L?: [number, number] } | null)[] = [
  { lo: 250, hi: 270, L: [0.38, 0.46] },
  { lo: 78, hi: 98, L: [0.52, 0.64] },
  null, null, null, null, null, null,
];

export interface Col { h: number; dh: number; L: [number, number]; f: [number, number] }
export interface State { cols: Col[]; first: number[] }
const hueIn = (c: Col, m: number) => c.h + (m === 1 ? c.dh : 0);
function render(c: Col, m: number): Triple {
  const h = hueIn(c, m);
  return lchTo8(c.L[m]!, Math.min(c.f[m]!, 0.998) * maxChroma(c.L[m]!, h), h);
}
const hdiff = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** What the search needs to know about one colour in both modes. A move changes one colour, so this is computed once per colour and kept. */
interface Info { lch: [Triple, Triple]; labs: [Triple[], Triple[]]; ls: [number, number]; cr: [number, number]; fr: [number, number]; flared: [Triple, Triple] }
const INFO = new WeakMap<Col, Info>();
function info(c: Col): Info {
  let v = INFO.get(c);
  if (v) return v;
  const rgb: [Triple, Triple] = [render(c, 0), render(c, 1)];
  const lch: [Triple, Triple] = [lchOf(rgb[0]), lchOf(rgb[1])];
  v = {
    lch,
    labs: [VIEWS.map((x) => lab8(seen8(rgb[0], x))), VIEWS.map((x) => lab8(seen8(rgb[1], x)))],
    ls: [lstarOfY(lum8(rgb[0])), lstarOfY(lum8(rgb[1]))],
    cr: [contrast(lum8(rgb[0]), GROUND_Y[0]!), contrast(lum8(rgb[1]), GROUND_Y[1]!)],
    fr: [lch[0][1] / maxChroma(lch[0][0], hueIn(c, 0)), lch[1][1] / maxChroma(lch[1][0], hueIn(c, 1))],
    flared: [lab8(flare8(rgb[0], 0.02)), lab8(flare8(rgb[1], 0.02))],
  };
  INFO.set(c, v);
  return v;
}

export interface Eval { score: number; rmin: number; rminFirst: number; pen: number; meanC: number; worst: string; br: Record<string, number> }
function evaluate(st: State, cand: Candidate, lim: Limits): Eval {
  const { cols, first } = st;
  let rmin = Infinity;
  let rminFirst = Infinity;
  let pen = 0;
  const br: Record<string, number> = {};
  const add = (k: string, v: number) => { pen += v; br[k] = (br[k] ?? 0) + v; };
  let worst = "";
  let sumC = 0;
  const infos = cols.map(info);
  for (let m = 0; m < 2; m++) {
    const lch = infos.map((x) => x.lch[m]!);
    const labs = infos.map((x) => x.labs[m]!);
    const ls = infos.map((x) => x.ls[m]!);
    for (let i = 0; i < N; i++) {
      const cr = infos[i]!.cr[m]!;
      if (cr < lim.contrast[m]!) add("contrast", (lim.contrast[m]! - cr) * 4);
      const C = lch[i]![1];
      sumC += C;
      if (C > lim.cmax[m]!) add("cmax", (C - lim.cmax[m]!) * 6);
      if (ls[i]! >= 78 && C > lim.cbright) add("cbright", (C - lim.cbright) * 6);
      const floor = i === 0 ? Math.max(lim.cmin, 0.085) : lim.cmin;
      if (C < floor) add("cmin", (floor - C) * 6);
      const fr = infos[i]!.fr[m]!;
      if (fr < FMIN) add("fmin", FMIN - fr);
      for (let j = i + 1; j < N; j++) {
        const both = first.includes(i) && first.includes(j);
        for (let v = 0; v < 4; v++) {
          const d = dist(labs[i]![v]!, labs[j]![v]!) / OKABE_ITO_MINIMA[VIEWS[v]!];
          if (d < rmin) { rmin = d; worst = `${m === 0 ? "light" : "dark"} ${VIEWS[v]} slots ${i} and ${j}`; }
          if (both && d < rminFirst) rminFirst = d;
        }
        const df = dist(infos[i]!.flared[m]!, infos[j]!.flared[m]!);
        if (df < lim.flare) add("flare", (lim.flare - df) * 20);
        if (hdiff(cols[i]!.h, cols[j]!.h) < TWIN_DEG) {
          const g = Math.abs(ls[i]! - ls[j]!);
          if (g < TWIN_L) add("twin", (TWIN_L - g) * 0.05);
        }
      }
    }
    if (lim.gap > 0) {
      for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
        const g = Math.abs(ls[first[a]!]! - ls[first[b]!]!);
        if (g < lim.gap) add("gap", (lim.gap - g) * 0.08);
      }
    }
    const spread = Math.max(...ls) - Math.min(...ls);
    if (spread > lim.spread) add("spread", (spread - lim.spread) * 0.08);
    if (m === 0) for (const l of ls) if (l < lim.lminLight) add("lmin", (lim.lminLight - l) * 0.05);
    if (m === 1) for (const l of ls) if (l > lim.lmaxDark) add("lmax", (l - lim.lmaxDark) * 0.05);
  }
  const meanC = sumC / (2 * N);
  // The score is the worst-view ratio, plus a quarter of the same ratio among the first four (so they are the most separable), less the penalties.
  const score = rmin + (cand === "separable" ? 0.25 * Math.min(rminFirst, 2) : 0) - pen;
  return { score, rmin, rminFirst, pen, meanC, worst, br };
}

function shuffle<T>(a: T[], r: () => number): T[] {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
function randomState(r: () => number): State {
  const cols: Col[] = Array.from({ length: N }, (_, i) => {
    const w = WINDOWS[i];
    return {
      h: w ? w.lo + r() * (w.hi - w.lo) : r() * 360,
      dh: (r() - 0.5) * 8,
      L: [w?.L ? w.L[0] + r() * (w.L[1] - w.L[0]) : 0.3 + r() * 0.3, 0.55 + r() * 0.35],
      f: [0.5 + r() * 0.5, 0.5 + r() * 0.5],
    };
  });
  return { cols, first: [0, ...shuffle([1, 2, 3, 4, 5, 6, 7], r).slice(0, 3)] };
}
function clampCol(c: Col, i: number): Col {
  const w = WINDOWS[i];
  c.h = w ? Math.min(w.hi, Math.max(w.lo, c.h)) : ((c.h % 360) + 360) % 360;
  c.dh = Math.min(DH_MAX, Math.max(-DH_MAX, c.dh));
  const l0 = w?.L ?? [0.2, 0.75];
  c.L[0] = Math.min(l0[1], Math.max(l0[0], c.L[0]));
  c.L[1] = Math.min(0.97, Math.max(0.5, c.L[1]));
  for (let m = 0; m < 2; m++) c.f[m] = Math.min(0.998, Math.max(0.05, c.f[m]!));
  return c;
}

/** One annealing run. `refine` keeps the set of first four and takes smaller steps. */
function anneal(st0: State, cand: Candidate, lim: Limits, n: number, T0: number, T1: number, r: () => number, refine = false) {
  let st = st0;
  let cur = evaluate(st, cand, lim);
  let best = { st: structuredClone(st), ev: cur };
  for (let it = 0; it < n; it++) {
    const T = T0 * (T1 / T0) ** (it / n);
    const scale = (refine ? 0.35 : 1) * (0.25 + 0.75 * (1 - it / n));
    let next: State;
    if (cand === "separable" && !refine && r() < 0.04) {
      const first = [...st.first];
      let c2 = Math.floor(r() * N);
      while (first.includes(c2)) c2 = Math.floor(r() * N);
      first[1 + Math.floor(r() * 3)] = c2;
      next = { cols: st.cols, first };
    } else {
      const i = Math.floor(r() * N);
      const nw: Col = structuredClone(st.cols[i]!);
      const k = r();
      const w = WINDOWS[i];
      const hw = w ? w.hi - w.lo : 360;
      if (k < 0.2) nw.h += gauss(r) * 0.25 * hw * scale;
      else if (k < 0.28) nw.dh += gauss(r) * 5 * scale;
      else if (k < 0.5) { nw.L[0] += gauss(r) * 0.03 * scale; nw.L[1] += gauss(r) * 0.03 * scale; }
      else if (k < 0.75) { nw.f[0] += gauss(r) * 0.12 * scale; nw.f[1] += gauss(r) * 0.12 * scale; }
      else { nw.h += gauss(r) * 0.06 * hw * scale; nw.L[0] += gauss(r) * 0.01 * scale; nw.L[1] += gauss(r) * 0.01 * scale; nw.f[0] += gauss(r) * 0.04 * scale; nw.f[1] += gauss(r) * 0.04 * scale; }
      clampCol(nw, i);
      const cols = st.cols.slice();
      cols[i] = nw;
      next = { cols, first: st.first };
    }
    const ev = evaluate(next, cand, lim);
    if (ev.score >= cur.score || r() < Math.exp((ev.score - cur.score) / T)) {
      st = next;
      cur = ev;
      if (ev.score > best.ev.score) best = { st: structuredClone(next), ev };
    }
  }
  return best;
}

export interface Found {
  candidate: Candidate;
  seed: number;
  state: State;
  eval: Eval;
  /** Per slot: hue of the light mode, dark hue offset, lightness, chroma and hex in each mode. */
  slots: { h: number; dh: number; L: [number, number]; C: [number, number]; hex: [string, string] }[];
}

/** Each restart anneals from a random state under loosened caps, then refines under the final limits. The best refined state wins. */
export function search(cand: Candidate, seed: number, iters: number, restarts: number, override: Partial<Limits> = {}): Found {
  const r = rng(seed);
  const final: Limits = { ...LIMITS[cand], ...override };
  let best: { st: State; ev: Eval } | undefined;
  for (let rs = 0; rs < restarts; rs++) {
    const a = anneal(randomState(r), cand, loosen(final), iters, 0.05, 0.0003, r);
    const b = anneal(a.st, cand, final, Math.round(iters * 0.4), 0.006, 0.0002, r, true);
    if (!best || b.ev.score > best.ev.score) best = b;
  }
  const st = best!.st;
  const slots = st.cols.map((c) => {
    const rgb = [render(c, 0), render(c, 1)] as const;
    const lch = [lchOf(rgb[0]), lchOf(rgb[1])] as const;
    return {
      h: c.h, dh: c.dh,
      L: [lch[0][0], lch[1][0]] as [number, number],
      C: [lch[0][1], lch[1][1]] as [number, number],
      hex: [hexOf8(rgb[0]), hexOf8(rgb[1])] as [string, string],
    };
  });
  return { candidate: cand, seed, state: st, eval: best!.ev, slots };
}

// ---------------------------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------------------------
/** The seeds and lengths enderby.ts records. Changing one changes the colours. */
export const RECORDED: Record<Candidate, { seed: number; iters: number; restarts: number }> = {
  separable: { seed: 6, iters: 400000, restarts: 3 },
  balanced: { seed: 3, iters: 400000, restarts: 3 },
};

function show(f: Found) {
  const e = f.eval;
  console.log(`${f.candidate}, seed ${f.seed}: worst-view ratio to Okabe-Ito ${e.rmin.toFixed(3)} (${e.worst}), first four ${e.rminFirst.toFixed(3)}, mean chroma ${e.meanC.toFixed(3)}, penalty ${e.pen.toFixed(3)} ${JSON.stringify(Object.fromEntries(Object.entries(e.br).map(([k, v]) => [k, +v.toFixed(3)])))}`);
  console.log("slot  hue   dark hue  light L / C / hex          dark L / C / hex");
  f.slots.forEach((s, i) => console.log(`${String(i).padStart(4)}  ${s.h.toFixed(1).padStart(5)}  ${(s.h + s.dh).toFixed(1).padStart(7)}   ${s.L[0].toFixed(4)} ${s.C[0].toFixed(4)} ${s.hex[0]}   ${s.L[1].toFixed(4)} ${s.C[1].toFixed(4)} ${s.hex[1]}`));
  console.log("first four:", f.state.first.join(", "));
  // The rows enderby.ts records: light hue, dark hue offset, then L and C in the light mode and in the dark mode.
  const r = (x: number, d: number) => Number(x.toFixed(d));
  console.log("\nRECORD rows for enderby.ts:");
  f.slots.forEach((s, i) => console.log(`      [${r(s.h, 2)}, ${r(s.dh, 2)}, ${r(s.L[0], 4)}, ${r(s.C[0], 4)}, ${r(s.L[1], 4)}, ${r(s.C[1], 4)}], // slot ${i} ${s.hex[0]} ${s.hex[1]}`));
  console.log(`      first: [${f.state.first.join(", ")}]`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const arg = (name: string) => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : undefined; };
  const what = args[0];
  if (what === "separable" || what === "balanced") {
    const rec = RECORDED[what];
    show(search(what, arg("--seed") ?? rec.seed, arg("--iters") ?? rec.iters, arg("--restarts") ?? rec.restarts));
  } else if (what === "frontier") {
    // How far the worst-view ratio falls as the balanced band narrows. Short runs, so the numbers are what this
    // search finds, not a proof that nothing better exists.
    console.log("band (L*)  worst-view ratio to Okabe-Ito (balanced candidate, chroma caps as in LIMITS)");
    for (const spread of [16, 20, 24, 28, 32]) {
      const f = search("balanced", arg("--seed") ?? 1, arg("--iters") ?? 100000, arg("--restarts") ?? 2, { spread });
      console.log(`${String(spread).padStart(9)}  ${f.eval.rmin.toFixed(3)}  (penalty ${f.eval.pen.toFixed(3)})`);
    }
  } else {
    console.log("usage: node scripts/design/enderby-search.ts separable|balanced|frontier [--seed N] [--iters N] [--restarts N]");
    process.exit(2);
  }
}
