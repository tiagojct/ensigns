// Bachelor 0.1.0: eight flags that work as full-bleed fields and as chart colours, each with an ink
// for text, on a calm light ground and a dark one. The record of how the values were chosen.
//
// What the brief asks (chapter 115, The Pequod Meets The Bachelor; environments projector, cvd and
// print-grey) turns into four pieces of arithmetic, all read from tests/environments.json:
//
//   1. Text on a field keeps 4.5:1 after a flare of 0.02 (dark room) and of 0.08 (lit room), and 7:1
//      once the page is converted to grey. With ink luminance Yi and field luminance Yf, a flare k and
//      a minimum m:  light ink needs Yf <= (Yi + k + 0.05) / m - (k + 0.05), dark ink needs
//      Yf >= m (Yi + k + 0.05) - (k + 0.05). The two bands those limits leave are the only places a
//      field that carries body text can sit. Between them nothing can, in either ink.
//   2. Fields stay 0.08 apart in OKLab after each flare and 0.06 apart under normal vision and under
//      protan, deutan and tritan simulation. No field is exempt from these.
//   3. In print, unpatterned fields differ by 12 L* or more. Inside one band that allows only so many
//      rungs, so the rest of the flags carry a pattern in print and are declared patterned.
//   4. Pairs of fields from different bands are more than 0.25 apart in every view, so each band is a
//      small problem of its own.
//
// Method. The band limits and the print ladder come out of the arithmetic. Each flag then has a hue
// window and a luminance window. A branch-and-bound search picks, for each band, the combination in
// which every pair keeps MARGIN times every distance gate in every view and the flags are as vivid as
// that allows (OKLCH chroma against the most chromatic colour in the flag's own window). Inks and
// grounds are placed by luminance, because the gates are luminance gates. Nothing here is random.
//
//   node scripts/design/bachelor.ts            check the token file against the derivation, run the harness
//   node scripts/design/bachelor.ts --write    write the derived palette into the token file first
//
// The script stops with a non-zero exit when the token file differs from the derived values or when a
// check fails.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyFlare, contrastRatio, fromOklch, greyscaleHex, lstar, oklabDistance, relativeLuminance as Y, simulateCvd, toOklab, toOklch } from "../../lib/colour/index.ts";
import { buildReport, failures, num } from "../../lib/harness/index.ts";
import { repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { FamilyFile } from "../../lib/model/types.ts";

const root = repoRoot();
const TOKENS = join(root, "families/bachelor/bachelor.tokens.json");
const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8"));
const WRITE = process.argv.includes("--write");
const problems: string[] = [];
const check = (ok: boolean, message: string): void => {
  if (!ok) problems.push(message);
};
const f = (n: number, d = 3): string => n.toFixed(d);

// ---------------------------------------------------------------------------------------------
// The gates, read from tests/environments.json
// ---------------------------------------------------------------------------------------------
const FLARE = { "dark room": num(thresholds, "common.flare.darkRoom.value"), "lit room": num(thresholds, "common.flare.litRoom.value") };
const BODY = num(thresholds, "profiles.projector.bodyText.min");
const TITLE = num(thresholds, "profiles.projector.titles.min");
const FIELDS_APART = num(thresholds, "profiles.projector.flagFields.minDistance");
const GREY_TEXT = num(thresholds, "profiles.print-grey.text.min");
const GREY_GAP = num(thresholds, "profiles.print-grey.distinctLstar.min");
const CVD_APART = num(thresholds, "common.cvd.minDistance.value");
const NORMAL_APART = num(thresholds, "common.distinct.minDistance.value");
const SEVERITY = num(thresholds, "common.cvd.severity.value");

// ---------------------------------------------------------------------------------------------
// Choices, each with its reason
// ---------------------------------------------------------------------------------------------
/** Every field pair keeps this multiple of each distance gate in every view. The owner sets the gates; this is room on top. */
const MARGIN = 1.4;
/** Every ink keeps this multiple of each contrast gate, so a rounding in the last hex digit cannot cost a pass. */
const INK_MARGIN = 1.03;
/** L* added to the 12 L* print gap, for the same reason. */
const GAP_MARGIN = 0.4;
/** Luminance of the dark inks. About as dark as a tinted colour gets, which keeps the bright band as wide as it can be. */
const DARK_INK_Y = 0.004;
/** OKLCH chroma of a dark ink: a tint of the field's hue, not a colour. */
const DARK_INK_CHROMA = 0.03;

const ROOMS = Object.entries(FLARE);
const white = fromOklch(1, 0, 0);

// ---------------------------------------------------------------------------------------------
// 1. The bands
// ---------------------------------------------------------------------------------------------
const lightInkLimit = (yi: number, k: number, min: number): number => (yi + k + 0.05) / min - (k + 0.05);
const darkInkLimit = (yi: number, k: number, min: number): number => min * (yi + k + 0.05) - (k + 0.05);
const lstarOfY = (y: number): number => 116 * Math.cbrt(y) - 16;
const yOfLstar = (l: number): number => ((l + 16) / 116) ** 3;

interface Gate { name: string; k: number; min: number }
const TEXT_GATES: Gate[] = [...ROOMS.map(([room, k]) => ({ name: `${room}, body`, k, min: BODY })), { name: "print in grey", k: 0, min: GREY_TEXT }];
const TITLE_GATES: Gate[] = ROOMS.map(([room, k]) => ({ name: `${room}, title`, k, min: TITLE }));

const deepMax = Math.min(...TEXT_GATES.map((g) => lightInkLimit(Y(white), g.k, g.min * INK_MARGIN)));
const brightMin = Math.max(...TEXT_GATES.map((g) => darkInkLimit(DARK_INK_Y, g.k, g.min * INK_MARGIN)));

console.log("Bands: where a field can carry text");
console.log(`white ink (Y ${f(Y(white), 2)}) and dark ink (Y ${DARK_INK_Y}); limits on the field's relative luminance, with ${INK_MARGIN} times each contrast gate`);
console.log("gate               min   white ink: field Y at most   dark ink: field Y at least");
for (const g of [...TEXT_GATES, ...TITLE_GATES]) {
  const upper = lightInkLimit(Y(white), g.k, g.min * INK_MARGIN);
  const lower = darkInkLimit(DARK_INK_Y, g.k, g.min * INK_MARGIN);
  console.log(`${g.name.padEnd(18)} ${String(g.min).padEnd(5)} ${f(upper, 4).padStart(12)} (L* ${f(lstarOfY(upper), 1)})   ${f(lower, 4).padStart(12)} (L* ${f(lstarOfY(lower), 1)})`);
}
console.log(`deep band   : relative luminance up to ${f(deepMax, 4)} (L* ${f(lstarOfY(deepMax), 1)}), set by ${TEXT_GATES.find((g) => lightInkLimit(Y(white), g.k, g.min * INK_MARGIN) === deepMax)!.name}`);
console.log(`bright band : relative luminance from ${f(brightMin, 4)} (L* ${f(lstarOfY(brightMin), 1)}), set by ${TEXT_GATES.find((g) => darkInkLimit(DARK_INK_Y, g.k, g.min * INK_MARGIN) === brightMin)!.name}`);
console.log(`no field between them carries body text, in either ink: ${f(deepMax, 4)} to ${f(brightMin, 4)}\n`);

// The print ladder: rungs of the deep band, GAP + margin apart, the top one as high as the band goes.
const STEP = GREY_GAP + GAP_MARGIN;
const rungTop = lstarOfY(deepMax);
const rungs = [rungTop - 2 * STEP, rungTop - STEP, rungTop];
// A window of about a point of L* around a rung. The 12.4 L* step between unpatterned flags is enforced pair by pair in the search.
const around = (l: number): [number, number] => [yOfLstar(l - 1.2), Math.min(deepMax, yOfLstar(l + 0.6))];
console.log(`Print ladder in the deep band (${GREY_GAP} L* apart plus ${GAP_MARGIN}): L* ${rungs.map((r) => f(r, 1)).join(", ")}`);
console.log(`Three deep flags stand on the rungs; the bright band holds two more, about ${f(lstarOfY(brightMin), 1)} and ${f(lstarOfY(brightMin) + STEP, 1)} L* and above; the other three flags carry a pattern in print.\n`);

// ---------------------------------------------------------------------------------------------
// 2. The search
// ---------------------------------------------------------------------------------------------
const HUE_STEP = 2;
const Y_STEPS = 40;

/** The most chromatic colour of this lightness and hue that sRGB holds (fromOklch reduces chroma until it fits). */
const vivid = (L: number, h: number): string => fromOklch(L, 0.4, h);

/** The most chromatic colour of hue h whose relative luminance is y. */
function vividAtY(y: number, h: number): string {
  let lo = 0.02;
  let hi = 0.999;
  for (let i = 0; i < 36; i++) {
    const mid = (lo + hi) / 2;
    if (Y(vivid(mid, h)) < y) lo = mid; else hi = mid;
  }
  return vivid((lo + hi) / 2, h);
}

/** A colour of chroma C and hue h whose relative luminance is y (chroma falls only where sRGB runs out). */
function tintAtY(y: number, C: number, h: number): string {
  let lo = 0.02;
  let hi = 0.999;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (Y(fromOklch(mid, C, h)) < y) lo = mid; else hi = mid;
  }
  return fromOklch((lo + hi) / 2, C, h);
}

interface Slot { name: string; band: "deep" | "bright"; h: [number, number]; y: [number, number]; unpatterned: boolean }
const SLOTS: Slot[] = [
  { name: "red", band: "deep", h: [22, 34], y: around(rungs[2]!), unpatterned: true },
  { name: "blue", band: "deep", h: [262, 268], y: around(rungs[1]!), unpatterned: true },
  { name: "violet", band: "deep", h: [284, 296], y: around(rungs[0]!), unpatterned: true },
  { name: "magenta", band: "deep", h: [326, 342], y: [0.03, deepMax], unpatterned: false },
  { name: "yellow", band: "bright", h: [99, 106], y: [0.74, 0.84], unpatterned: true },
  { name: "orange", band: "bright", h: [62, 76], y: [brightMin, brightMin + 0.05], unpatterned: true },
  { name: "green", band: "bright", h: [146, 158], y: [brightMin, 0.6], unpatterned: false },
  { name: "cyan", band: "bright", h: [196, 214], y: [brightMin, 0.64], unpatterned: false },
];

type Lab = [number, number, number];
const lab = (hex: string): Lab => {
  const o = toOklab(hex);
  return [o.L, o.a, o.b];
};
const dist = (a: Lab, b: Lab): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const VIEWS = ["protan", "deutan", "tritan"] as const;
interface Cand { hex: string; y: number; h: number; C: number; w: number; ls: number; lab: Lab; sim: Lab[]; flared: Lab[] }

function candidates(s: Slot): Cand[] {
  const out: Cand[] = [];
  const seen = new Set<string>();
  for (let h = s.h[0]; h <= s.h[1] + 1e-9; h += HUE_STEP) {
    for (let i = 0; i < Y_STEPS; i++) {
      const y = s.y[0] + ((s.y[1] - s.y[0]) * i) / (Y_STEPS - 1);
      const hex = vividAtY(y, h);
      // The colour is rounded to 8 bits, so its luminance can fall a little outside the window it was aimed at.
      if (seen.has(hex) || Y(hex) < s.y[0] || Y(hex) > s.y[1]) continue;
      seen.add(hex);
      out.push({
        hex, y: Y(hex), h, C: toOklch(hex).C, w: 0, ls: lstar(hex), lab: lab(hex),
        sim: VIEWS.map((v) => lab(simulateCvd(hex, v, SEVERITY))),
        flared: ROOMS.map(([, k]) => lab(applyFlare(hex, k))),
      });
    }
  }
  const top = Math.max(...out.map((c) => c.C));
  for (const c of out) c.w = c.C / top;
  return out;
}

/** How many times the gates a pair keeps, worst view. A pair below 1 fails a gate. */
function worstRatio(a: Cand, b: Cand): number {
  let m = dist(a.lab, b.lab) / NORMAL_APART;
  VIEWS.forEach((_, v) => { m = Math.min(m, dist(a.sim[v]!, b.sim[v]!) / CVD_APART); });
  ROOMS.forEach((_, r) => { m = Math.min(m, dist(a.flared[r]!, b.flared[r]!) / FIELDS_APART); });
  return m;
}

function solve(slots: Slot[]): Cand[] {
  const cands = slots.map(candidates);
  const n = slots.length;
  const ok = (i: number, a: Cand, j: number, b: Cand): boolean => {
    if (worstRatio(a, b) < MARGIN) return false;
    return !(slots[i]!.unpatterned && slots[j]!.unpatterned && Math.abs(a.ls - b.ls) < STEP);
  };
  let best = -1;
  let bestPick: number[] | null = null;
  const pick: number[] = new Array(n).fill(-1);
  const rec = (dom: number[][], sum: number): void => {
    let free = 0;
    let bound = sum;
    let slot = -1;
    for (let i = 0; i < n; i++) {
      if (pick[i]! >= 0) continue;
      free++;
      bound += Math.max(0, ...dom[i]!.map((a) => cands[i]![a]!.w));
      if (slot < 0 || dom[i]!.length < dom[slot]!.length) slot = i;
    }
    if (free === 0) {
      if (sum > best) { best = sum; bestPick = [...pick]; }
      return;
    }
    if (bound <= best) return;
    for (const a of [...dom[slot]!].sort((x, y) => cands[slot]![y]!.w - cands[slot]![x]!.w || x - y)) {
      const next = dom.map((d, j) => (j === slot || pick[j]! >= 0 ? d : d.filter((b) => ok(slot, cands[slot]![a]!, j, cands[j]![b]!))));
      if (next.some((d, j) => j !== slot && pick[j]! < 0 && d.length === 0)) continue;
      pick[slot] = a;
      rec(next, sum + cands[slot]![a]!.w);
      pick[slot] = -1;
    }
  };
  rec(cands.map((c) => c.map((_, i) => i)), 0);
  if (!bestPick) throw new Error(`no combination of ${slots.map((s) => s.name).join(", ")} keeps ${MARGIN} times the gates`);
  return (bestPick as number[]).map((a, i) => cands[i]![a]!);
}

const flags: Record<string, Cand> = {};
for (const band of ["deep", "bright"] as const) {
  const slots = SLOTS.filter((s) => s.band === band);
  solve(slots).forEach((c, i) => { flags[slots[i]!.name] = c; });
}
const ORDER = ["red", "orange", "yellow", "green", "cyan", "blue", "violet", "magenta"];
const bandOf = (name: string): "deep" | "bright" => SLOTS.find((s) => s.name === name)!.band;
const unpatterned = (name: string): boolean => SLOTS.find((s) => s.name === name)!.unpatterned;
const hexOfFlag = (n: string): string => flags[n]!.hex;

/** The smallest distance between two flags over normal vision, each simulation and each flare. */
const worstView = (a: string, b: string): number => Math.min(
  oklabDistance(hexOfFlag(a), hexOfFlag(b)),
  ...VIEWS.map((v) => oklabDistance(simulateCvd(hexOfFlag(a), v, SEVERITY), simulateCvd(hexOfFlag(b), v, SEVERITY))),
  ...ROOMS.map(([, k]) => oklabDistance(applyFlare(hexOfFlag(a), k), applyFlare(hexOfFlag(b), k))),
);

// The claim that lets each band be solved alone: a deep flag and a bright flag are far apart in every view.
const CROSS_BAND = 0.25;
let crossMin = Infinity;
let crossAt = "";
for (const a of ORDER) {
  for (const b of ORDER) {
    if (a < b && bandOf(a) !== bandOf(b) && worstView(a, b) < crossMin) { crossMin = worstView(a, b); crossAt = `${a}, ${b}`; }
  }
}
check(crossMin >= CROSS_BAND, `${crossAt} are ${f(crossMin)} apart in their worst view, and the bands are solved apart on the claim that no such pair comes within ${CROSS_BAND}`);

// ---------------------------------------------------------------------------------------------
// 3. Inks
// ---------------------------------------------------------------------------------------------
const inks: Record<string, string> = { white };
for (const name of ORDER) if (bandOf(name) === "bright") inks[name] = tintAtY(DARK_INK_Y, DARK_INK_CHROMA, flags[name]!.h);
const inkOf = (name: string): string => (bandOf(name) === "deep" ? inks.white! : inks[name]!);

// ---------------------------------------------------------------------------------------------
// 4. Grounds and text, placed by luminance
// ---------------------------------------------------------------------------------------------
// Light: a warm off-white page, a slightly darker panel, a white card. Text, muted text and subtle
// text are dark neutrals with a blue lean. Muted text is held to the bound of its worst ground (the
// panel); subtle text is for large type and keeps 3:1 after the lit flare.
const HUE_WARM = 85;
const HUE_COOL = 265;
const light = {
  bg: tintAtY(0.87, 0.010, HUE_WARM),
  surface: tintAtY(0.80, 0.012, HUE_WARM),
  raised: white,
  text: tintAtY(0.006, 0.030, HUE_COOL),
  muted: tintAtY(0.058, 0.020, HUE_COOL),
  subtle: tintAtY(0.160, 0.016, HUE_COOL),
  rule: tintAtY(0.220, 0.010, HUE_WARM),
  grid: tintAtY(0.620, 0.010, HUE_WARM),
  hover: fromOklch(toOklch(flags.blue!.hex).L - 0.07, toOklch(flags.blue!.hex).C * 0.95, toOklch(flags.blue!.hex).h),
};
// Dark: a blue-black page a little darker than the darkest field, panels a step up, ivory text.
const dark = {
  bg: tintAtY(0.0045, 0.030, HUE_COOL),
  surface: tintAtY(0.0110, 0.030, HUE_COOL),
  raised: tintAtY(0.0200, 0.030, HUE_COOL),
  text: tintAtY(0.900, 0.010, HUE_WARM),
  muted: tintAtY(0.580, 0.015, HUE_WARM),
  subtle: tintAtY(0.360, 0.012, HUE_WARM),
  rule: tintAtY(0.160, 0.030, HUE_COOL),
  grid: tintAtY(0.050, 0.030, HUE_COOL),
  hover: tintAtY(0.920, 0.110, toOklch(flags.yellow!.hex).h),
};

// ---------------------------------------------------------------------------------------------
// 5. The palette, as the token file holds it
// ---------------------------------------------------------------------------------------------
type Entry = { hex: string; note?: string } | { ref: string; alpha: number };
const noteOf = (name: string): string =>
  `${bandOf(name) === "deep" ? "Deep field, white ink." : "Bright field, dark ink."}${unpatterned(name) ? "" : " Told apart in print by its pattern."}`;
const palette: Record<string, Record<string, Entry>> = {
  flag: Object.fromEntries(ORDER.map((n) => [n, { hex: flags[n]!.hex, note: noteOf(n) }])),
  ink: Object.fromEntries([["white", { hex: inks.white! }], ...ORDER.filter((n) => bandOf(n) === "bright").map((n) => [n, { hex: inks[n]! }])]),
  light: Object.fromEntries(Object.entries(light).map(([k, hex]) => [k, { hex }])),
  dark: Object.fromEntries(Object.entries(dark).map(([k, hex]) => [k, { hex }])),
  alpha: { yellow: { ref: "{palette.flag.yellow}", alpha: 0.45 }, blue: { ref: "{palette.flag.blue}", alpha: 0.5 } },
};

// ---------------------------------------------------------------------------------------------
// 6. Tables
// ---------------------------------------------------------------------------------------------
const lch = (hex: string): string => {
  const c = toOklch(hex);
  return `L ${f(c.L)} C ${f(c.C)} h ${c.h.toFixed(0).padStart(3)}`;
};
console.log("Flags, in wheel order (band, print rung, the field's ink, and the ink's contrast after each flare and in grey)");
console.log("flag     hex      band    Y      L*    OKLCH                   ink      plain  dark   lit    grey   print");
for (const name of ORDER) {
  const c = flags[name]!;
  const ink = inkOf(name);
  const greyContrast = contrastRatio(greyscaleHex(ink), greyscaleHex(c.hex));
  const after = ROOMS.map(([, k]) => {
    const fl = (hex: string) => Y(hex) + k;
    return (Math.max(fl(ink), fl(c.hex)) + 0.05) / (Math.min(fl(ink), fl(c.hex)) + 0.05);
  });
  console.log(
    `${name.padEnd(8)} ${c.hex} ${bandOf(name).padEnd(7)} ${f(c.y, 4)} ${f(c.ls, 1).padStart(5)} ${lch(c.hex)}  ${ink}  ${contrastRatio(ink, c.hex).toFixed(2).padStart(5)}  ${after.map((x) => x.toFixed(2).padStart(5)).join("  ")}  ${greyContrast.toFixed(2).padStart(5)}  ${unpatterned(name) ? "lightness" : "pattern"}`,
  );
  check(after.every((x) => x >= BODY * INK_MARGIN - 1e-9), `${name}: ink after flare ${after.map((x) => x.toFixed(2)).join(", ")}, needs ${BODY} with margin`);
}

const table = (label: string, names: string[], hexOf: (n: string) => string, transform: (hex: string) => string): string => {
  let min = Infinity;
  let at = "";
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const d = oklabDistance(transform(hexOf(names[i]!)), transform(hexOf(names[j]!)));
      if (d < min) { min = d; at = `${names[i]}, ${names[j]}`; }
    }
  }
  return `${label.padEnd(18)} ${f(min)}  ${at}`;
};
console.log(`\nSmallest distance between two flags in OKLab, all eight (gates: ${NORMAL_APART} normal, ${CVD_APART} colour vision, ${FIELDS_APART} after flare)`);
console.log(table("normal vision", ORDER, hexOfFlag, (h) => h));
for (const v of VIEWS) console.log(table(v, ORDER, hexOfFlag, (h) => simulateCvd(h, v, SEVERITY)));
for (const [room, k] of ROOMS) console.log(table(`${room} flare`, ORDER, hexOfFlag, (h) => applyFlare(h, k)));

console.log("\nPrint in grey: L* of each flag; the unpatterned flags must differ by the gap");
const grey = ORDER.map((n) => ({ n, l: lstar(flags[n]!.hex) })).sort((a, b) => a.l - b.l);
console.log(grey.map((g) => `${g.n} ${f(g.l, 1)}${unpatterned(g.n) ? "" : " (pattern)"}`).join("  "));
const ladder = grey.filter((g) => unpatterned(g.n));
for (let i = 1; i < ladder.length; i++) {
  const gap = ladder[i]!.l - ladder[i - 1]!.l;
  console.log(`  ${ladder[i - 1]!.n} to ${ladder[i]!.n}: ${f(gap, 1)} L*`);
  check(gap >= GREY_GAP, `${ladder[i - 1]!.n} and ${ladder[i]!.n} are ${f(gap, 1)} L* apart in print, needs ${GREY_GAP}`);
}
check(ORDER.filter((n) => !unpatterned(n)).length === 3, "the ladder leaves three flags to their pattern");

// Most separable first: start from the pair that is furthest apart in the worst view, then add the flag
// whose nearest chosen flag is furthest away, in the worst view.
let categorical: string[] = [];
{
  let bestPair: [string, string] = [ORDER[0]!, ORDER[1]!];
  let bestD = -1;
  for (const a of ORDER) for (const b of ORDER) if (a < b && worstView(a, b) > bestD) { bestD = worstView(a, b); bestPair = [a, b]; }
  categorical = [...bestPair];
  while (categorical.length < ORDER.length) {
    let pickName = "";
    let pickD = -1;
    for (const c of ORDER.filter((n) => !categorical.includes(n))) {
      const d = Math.min(...categorical.map((x) => worstView(c, x)));
      if (d > pickD) { pickD = d; pickName = c; }
    }
    categorical.push(pickName);
  }
}
console.log(`\nChart order, most separable first: ${categorical.join(", ")}`);

// Viewing distance to type size. The sizes are derived here and held in the token file.
// The inputs are design choices and live in the token file (design.viewing, design.slide, design.type).
const inputs = (JSON.parse(readFileSync(TOKENS, "utf8")) as { design: Record<string, any> }).design;
const VIEW = {
  near: inputs.viewing["distance-near-m"] as number,
  far: inputs.viewing["distance-far-m"] as number,
  arcmin: inputs.viewing["cap-height-arcmin"] as number,
  floorArcmin: inputs.viewing["cap-height-floor-arcmin"] as number,
  screenHeights: inputs.viewing["screen-heights-to-farthest-viewer"] as number,
  capHeight: inputs.type["cap-height-em"] as number,
  slideHeightPt: inputs.slide["height-pt"] as number,
  widthPt: inputs.slide["width-pt"] as number,
  largeRatio: inputs.type["large-ratio"] as number,
  displayRatio: inputs.type["display-ratio"] as number,
};
const capShare = (arcmin: number): number => VIEW.screenHeights * Math.tan((arcmin / 60) * (Math.PI / 180));
const sizePt = (arcmin: number): number => (capShare(arcmin) / VIEW.capHeight) * VIEW.slideHeightPt;
const even = (x: number): number => Math.ceil(x / 2) * 2;
const sizes = {
  caption: even(sizePt(VIEW.floorArcmin)),
  body: even(sizePt(VIEW.arcmin)),
  title: even(sizePt(VIEW.arcmin) * VIEW.largeRatio),
  display: even(sizePt(VIEW.arcmin) * VIEW.largeRatio) * VIEW.displayRatio,
};
const perMetre = { body: Math.tan((VIEW.arcmin / 60) * (Math.PI / 180)) * 1000 / VIEW.capHeight, title: (Math.tan((VIEW.arcmin / 60) * (Math.PI / 180)) * 1000 / VIEW.capHeight) * VIEW.largeRatio };
console.log(`\nType. A cap height of ${VIEW.arcmin} arcmin (floor ${VIEW.floorArcmin}), the farthest viewer ${VIEW.screenHeights} screen heights away, a cap height of ${VIEW.capHeight} em:`);
console.log(`  cap height ${f(capShare(VIEW.arcmin) * 100, 2)} per cent of the slide height; body ${f(sizePt(VIEW.arcmin), 1)} pt, caption ${f(sizePt(VIEW.floorArcmin), 1)} pt on a ${VIEW.widthPt} by ${VIEW.slideHeightPt} pt slide`);
console.log(`  sizes in pt: caption ${sizes.caption}, body ${sizes.body}, title ${sizes.title}, display ${sizes.display}`);
console.log(`  on a sign: body ${f(perMetre.body, 1)} mm of type size per metre of distance, title ${f(perMetre.title, 1)} mm (${VIEW.near} m: ${f(perMetre.body * VIEW.near, 0)} and ${f(perMetre.title * VIEW.near, 0)} mm; ${VIEW.far} m: ${f(perMetre.body * VIEW.far, 0)} and ${f(perMetre.title * VIEW.far, 0)} mm)`);

// ---------------------------------------------------------------------------------------------
// 7. The token file
// ---------------------------------------------------------------------------------------------
/** Objects expanded; short flat objects and arrays of scalars on one line. */
function pretty(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const pad1 = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    const flat = JSON.stringify(value);
    if (value.every((x) => typeof x !== "object" || x === null) && flat.length <= 100) return flat;
    return `[\n${value.map((x) => pad1 + pretty(x, indent + 1)).join(",\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const flat = JSON.stringify(value);
    const small = entries.every(([, x]) => typeof x !== "object" || x === null);
    if (small && flat.length <= 150 && indent >= 2) return flat;
    return `{\n${entries.map(([k, x]) => `${pad1}${JSON.stringify(k)}: ${pretty(x, indent + 1)}`).join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

const file = JSON.parse(readFileSync(TOKENS, "utf8")) as FamilyFile & Record<string, unknown>;
if (WRITE) {
  file.palette = palette;
  writeFileSync(TOKENS, `${pretty(file)}\n`);
  console.log(`\nwrote the palette into ${TOKENS}`);
}

// What the token file must hold.
const held = JSON.parse(readFileSync(TOKENS, "utf8")) as FamilyFile & { design?: Record<string, any> };
for (const [group, entries] of Object.entries(palette)) {
  for (const [name, entry] of Object.entries(entries)) {
    const have = (held.palette[group] as Record<string, unknown> | undefined)?.[name];
    if (have === undefined) { check(false, `palette.${group}.${name} is missing from the token file`); continue; }
    if ("ref" in entry) {
      const h = have as { ref?: string; alpha?: number };
      check(h.ref === entry.ref && h.alpha === entry.alpha, `palette.${group}.${name} is ${JSON.stringify(have)}, the derivation gives ${JSON.stringify(entry)}`);
    } else {
      const hex = typeof have === "string" ? have : (have as { hex: string }).hex;
      check(hex === entry.hex, `palette.${group}.${name} is ${hex}, the derivation gives ${entry.hex}`);
    }
  }
}
for (const [group, entries] of Object.entries(held.palette)) {
  for (const name of Object.keys(entries)) check(palette[group]?.[name] !== undefined, `palette.${group}.${name} is in the token file but not in the derivation`);
}
const design = held.design ?? {};
const wantSizes: Record<string, number> = sizes;
for (const [k, v] of Object.entries(wantSizes)) check(design.type?.size?.[k] === v, `design.type.size.${k} is ${design.type?.size?.[k]}, the derivation gives ${v}`);
check(design.signage?.["body-mm-per-metre"] === Number(f(perMetre.body, 1)), `design.signage.body-mm-per-metre is ${design.signage?.["body-mm-per-metre"]}, the derivation gives ${f(perMetre.body, 1)}`);
check(design.signage?.["title-mm-per-metre"] === Number(f(perMetre.title, 1)), `design.signage.title-mm-per-metre is ${design.signage?.["title-mm-per-metre"]}, the derivation gives ${f(perMetre.title, 1)}`);
check(JSON.stringify(Object.keys(held.modes.dark.accents ?? {})) === JSON.stringify(ORDER), `modes.dark.accents lists ${Object.keys(held.modes.dark.accents ?? {}).join(", ")}, the wheel order is ${ORDER.join(", ")}`);
check(JSON.stringify(Object.keys((held.modes.dark.data as { categorical?: { colors: object } } | undefined)?.categorical?.colors ?? {})) === JSON.stringify(categorical), `data.categorical is not in the derived order ${categorical.join(", ")}`);
const patterned = ORDER.filter((n) => !unpatterned(n));
const declared = held.distinct?.find((d) => d.id === "fields-print")?.patterned ?? [];
check(JSON.stringify([...declared].sort()) === JSON.stringify([...patterned].sort()), `fields-print declares ${declared.join(", ")} as patterned, the ladder leaves ${patterned.join(", ")}`);

// ---------------------------------------------------------------------------------------------
// 8. The harness
// ---------------------------------------------------------------------------------------------
const family = resolveFamily(held);
const report = buildReport(family, thresholds);
console.log("\nHarness");
for (const [profile, r] of Object.entries(report.profiles)) {
  console.log(`  ${profile.padEnd(14)} ${r.status.padEnd(6)} ${r.errors} errors, ${r.warnings} warnings, ${r.checks.length} checks`);
  for (const d of failures(r.checks)) problems.push(`${profile}: ${d}`);
}
check(JSON.stringify(Object.keys(report.profiles).sort()) === JSON.stringify(["cvd", "office-screen", "print-grey", "projector"]), `the report covers ${Object.keys(report.profiles).join(", ")}`);

// The two-band promise, read off the resolved colours.
for (const mode of ["dark", "light"] as const) {
  for (const name of ORDER) {
    const y = Y(family.modes[mode].colours.get(`accents.${name}`)!.hex);
    check(bandOf(name) === "deep" ? y <= deepMax + 1e-9 : y >= brightMin - 1e-9, `${mode} accents.${name} has luminance ${f(y, 4)}, outside its band`);
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problems:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("\nThe token file holds the derived values and every check passes.");
