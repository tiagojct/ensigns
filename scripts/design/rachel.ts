// Rachel 0.1.0: how the palette was chosen, and a check that the token file still holds it.
//
// Rachel is for patient-facing apps, leaflets and consent forms, read by older adults, people with
// low vision and people with low health literacy. Four profiles gate it: aged-eye, sunlight,
// print-grey and cvd. Office-screen runs as well, because the token file declares pairs.
//
// The feasible regions, each from tests/environments.json:
//   aged-eye    every text pair keeps 7:1 after Machado tritanomaly at 0.5 and a flare of 0.02. With the
//               flare, the ratio of ink Yt on a ground Yb is (Yb + 0.07) / (Yt + 0.07). A ground of
//               luminance 0.87 allows ink up to 0.064, and a ground of 0.0099 needs ink of 0.49 or more.
//               The sunlight (4.5:1 after glare 0.06) and print-grey (7:1 in grey) text gates are weaker
//               for the same pair, so the aged-eye gate sets the limit.
//   print-grey  the three status colours are 12 L* apart.
//   cvd         the status colours and the action colour are 0.06 apart in OKLab under normal vision and
//               under protan, deutan and tritan simulation, with no floor and no reinforced pair.
//
// The method, in OKLCH (lib/colour/oklab.ts; fromOklch gamut-maps into sRGB):
//   grounds     a warm paper and two steps of it for the light mode, a warm dark and two steps of it for
//               the dark mode. Ink is a near-black brown (light) and a cream (dark).
//   soft ink    the lightest (light) or darkest (dark) warm ink that still clears 7:1 after the aged-eye
//               simulation, with a margin, on every ground it is declared on. There is no subtle grey.
//   edge        the lightest (light) or darkest (dark) line that reaches 3.5:1 on every ground.
//   action      one blue. Its lightness is the lightest navy (light) or the darkest pale blue (dark) whose
//               link and button text clear 7:1 after the aged-eye simulation, with a margin. Its hover is
//               a step further from the ground, so a link darkens in the light mode and lightens in the
//               dark mode. The deep blues of the migrated families crowd that region, so the hue, the
//               chroma and the hover are searched for the largest distance from the accents of Pequod,
//               Goney, Jungfrau and Rosebud, inside a window of blues that stays well clear of teal.
//   status      teal for fine, amber for needs attention, brick (light) or coral (dark) for contact your
//               clinician. They are told apart by lightness first: each is 12.6 L* from the next, so the
//               12 L* print gate holds with a margin and every simulation keeps them apart. Hue comes
//               second: a search inside narrow windows finds the hues that keep the four colours furthest
//               apart in the worst of six views, and takes the combination nearest the window centres
//               among those within 0.005 of the best.
//   tints       a pale fill for each status level (light) or a dark one (dark), and a blue selection fill,
//               each under ink that clears 7:1.
//
//   node scripts/design/rachel.ts              derive, compare with the token file, run the checks
//   node scripts/design/rachel.ts --print      print the palette block for the token file
//   node scripts/design/rachel.ts --write      rewrite the palette block of the token file, then check
//
// The script exits 1 when the token file differs from the derived palette, when a derivation rule
// cannot be met, when a rule check fails or when a profile the family lists has an error.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { agedEye, applyFlare, contrastRatio, fromOklch, greyscaleHex, lstar, minPairwise, oklabDistance, relativeLuminance as Y, simulateCvd, toOklch } from "../../lib/colour/index.ts";
import { buildReport, failures } from "../../lib/harness/index.ts";
import type { Thresholds } from "../../lib/harness/index.ts";
import { hueClass, runRuleChecks } from "../../lib/model/checks.ts";
import { readJson, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { distinctMembers } from "../../lib/model/sets.ts";
import type { FamilyFile, ModeName } from "../../lib/model/types.ts";

const root = repoRoot();
const TOKENS = join(root, "families/rachel/rachel.tokens.json");
const thresholds = readJson(join(root, "tests/environments.json")) as Thresholds & {
  profiles: Record<string, Record<string, { min?: number }>>;
  common: { flare: { sunlight: { value: number } } };
};

// ---------------------------------------------------------------------------------------------
// Gates and margins
// ---------------------------------------------------------------------------------------------
const AGED_TEXT = thresholds.profiles["aged-eye"]!.bodyText!.min!; // 7
const PRINT_GAP = thresholds.profiles["print-grey"]!.distinctLstar!.min!; // 12
const GLARE = thresholds.common.flare.sunlight.value; // 0.06
const COMPONENT = 3; // WCAG 1.4.11

/** Stay this far above a text gate, so a rounding step in a hex value cannot cross it. */
const TEXT_MARGIN = 0.4;
/** The status colours are this far apart in L*: the print gate plus a margin for 8-bit rounding. */
const LADDER_STEP = PRINT_GAP + 0.6;
/** Light mode: the lightest status colour (amber) keeps this ratio on the ground, 3:1 plus a margin. */
const AMBER_ON_GROUND = COMPONENT + 0.25;
/** Dark mode: the darkest status colour (coral) keeps this ratio on the ground. */
const CORAL_ON_GROUND = 5.5;
/** Edges (borders, input outlines) keep this ratio on every ground. */
const EDGE_RATIO = 3.5;
/** The action colour and its hover keep this OKLab distance from every accent of the migrated families: a just noticeable difference (0.02) and a margin. */
const ACTION_FROM_OTHERS = 0.03;

const MODES = ["light", "dark"] as const;
const fmt = (n: number, d = 3): string => n.toFixed(d);
const failed: string[] = [];
const need = (ok: boolean, message: string): void => {
  if (!ok) failed.push(message);
};

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------
/**
 * The hex at this chroma and hue whose CIE L* is closest to the target. Bisection finds the OKLCH lightness,
 * then a fine scan around it picks the 8-bit colour that lands nearest. fromOklch keeps the hue and lowers
 * the chroma when a value is out of gamut.
 */
function atLstar(target: number, C: number, h: number): string {
  let lo = 0.05;
  let hi = 0.99;
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (lstar(fromOklch(mid, C, h)) < target) lo = mid; else hi = mid;
  }
  const centre = (lo + hi) / 2;
  let best = fromOklch(centre, C, h);
  for (let d = -0.004; d <= 0.004; d += 0.0002) {
    const hex = fromOklch(centre + d, C, h);
    if (Math.abs(lstar(hex) - target) < Math.abs(lstar(best) - target)) best = hex;
  }
  return best;
}

function lstarOfY(y: number): number {
  return y <= 216 / 24389 ? (24389 / 27) * y : 116 * Math.cbrt(y) - 16;
}
/** The L* of a colour darker than the ground with contrast `ratio` against it. */
const lstarDarkerThan = (ground: string, ratio: number): number => lstarOfY((Y(ground) + 0.05) / ratio - 0.05);
/** The L* of a colour lighter than the ground with contrast `ratio` against it. */
const lstarLighterThan = (ground: string, ratio: number): number => lstarOfY(ratio * (Y(ground) + 0.05) - 0.05);

/** Scan an OKLCH lightness from `from` to `to` and return the first value for which `ok` holds. */
function firstL(from: number, to: number, ok: (L: number) => boolean, what: string): number {
  const step = from < to ? 0.001 : -0.001;
  for (let L = from; step > 0 ? L <= to : L >= to; L += step) {
    const rounded = Math.round(L * 1000) / 1000;
    if (ok(rounded)) return rounded;
  }
  throw new Error(`no lightness between ${from} and ${to} satisfies: ${what}`);
}

/** Contrast of two colours after the aged-eye simulation. */
const aged = (fg: string, bg: string): number => contrastRatio(agedEye(fg), agedEye(bg));

// ---------------------------------------------------------------------------------------------
// The accents of the four migrated families, which Rachel keeps its distance from. Their token files are
// frozen by the equality tests, so the result of the search does not move when other families are added.
// ---------------------------------------------------------------------------------------------
const MIGRATED = ["pequod", "goney", "jungfrau", "rosebud"];
const migrated = MIGRATED.map((id) => resolveFamily(readJson(join(root, `families/${id}/${id}.tokens.json`)) as FamilyFile));
const isAccent = (address: string): boolean => address.startsWith("accents.") || ["roles.accent", "roles.link", "roles.link-hover", "roles.focus"].includes(address);
const othersAccents = (m: ModeName): { who: string; hex: string }[] =>
  migrated.flatMap((f) => [...f.modes[m].colours].filter(([a]) => isAccent(a)).map(([a, c]) => ({ who: `${f.meta.id} ${a.replace("accents.", "")}`, hex: c.hex })));
const accentPool: Record<ModeName, { who: string; hex: string }[]> = { light: othersAccents("light"), dark: othersAccents("dark") };
/** The accent of another family nearest to a colour, and how far it is. */
function nearestOther(m: ModeName, hex: string): { d: number; who: string } {
  let best = { d: Infinity, who: "" };
  for (const a of accentPool[m]) {
    const d = oklabDistance(hex, a.hex);
    if (d < best.d) best = { d, who: a.who };
  }
  return best;
}

// ---------------------------------------------------------------------------------------------
// Grounds and ink, chosen as OKLCH triples (lightness, chroma, hue)
// ---------------------------------------------------------------------------------------------
type Lch = [number, number, number];
const FIXED: Record<ModeName, Record<string, Lch>> = {
  // Daylight: a warm cream paper, a deeper cream for panels, a lighter sheet for cards and fields.
  light: { ground: [0.955, 0.022, 85], panel: [0.935, 0.028, 82], sheet: [0.985, 0.012, 88], ink: [0.21, 0.022, 58] },
  // Beacon: a warm dark, two steps up for panels and sheets, and a cream ink.
  dark: { ground: [0.215, 0.014, 58], panel: [0.245, 0.015, 58], sheet: [0.275, 0.016, 58], ink: [0.93, 0.03, 85] },
};

const palette: Record<string, Record<string, string>> = { paper: {}, hearth: {}, sea: {}, spray: {}, fire: {}, cherry: {} };
const neutralGroup: Record<ModeName, string> = { light: "paper", dark: "hearth" };
for (const m of MODES) for (const [name, [L, C, h]] of Object.entries(FIXED[m])) palette[neutralGroup[m]]![name] = fromOklch(L, C, h);
const g = (m: ModeName, name: string): string => palette[neutralGroup[m]]![name]!;

// Soft ink: the lightest (light) or darkest (dark) ink that still clears the aged-eye gate on the grounds it sits on.
const SOFT_HUE = { light: 58, dark: 82 } as const;
const SOFT_CHROMA = 0.03;
{
  const grounds = (m: ModeName): string[] => [g(m, "ground"), g(m, "sheet"), g(m, "panel")];
  const passes = (m: ModeName) => (L: number): boolean => grounds(m).every((bg) => aged(fromOklch(L, SOFT_CHROMA, SOFT_HUE[m]), bg) >= AGED_TEXT + TEXT_MARGIN);
  palette.paper!["soft-ink"] = fromOklch(firstL(0.5, 0.2, passes("light"), "soft ink on the light grounds"), SOFT_CHROMA, SOFT_HUE.light);
  palette.hearth!["soft-ink"] = fromOklch(firstL(0.7, 0.98, passes("dark"), "soft ink on the dark grounds"), SOFT_CHROMA, SOFT_HUE.dark);
}

// Edge: a warm grey-brown line. The lightest (light) or darkest (dark) that reaches 3.5:1 on every ground.
{
  const EDGE_CHROMA = 0.035;
  const EDGE_HUE = 72;
  const passes = (m: ModeName, names: string[]) => (L: number): boolean => names.every((n) => contrastRatio(fromOklch(L, EDGE_CHROMA, EDGE_HUE), g(m, n)) >= EDGE_RATIO);
  palette.paper!.edge = fromOklch(firstL(0.75, 0.3, passes("light", ["ground", "panel"]), "light edge"), EDGE_CHROMA, EDGE_HUE);
  palette.hearth!.edge = fromOklch(firstL(0.3, 0.9, passes("dark", ["ground", "panel", "sheet"]), "dark edge"), EDGE_CHROMA, EDGE_HUE);
}

// ---------------------------------------------------------------------------------------------
// The action colour
// ---------------------------------------------------------------------------------------------
interface ActionParams {
  /** Chroma of the base colour. */
  C: number;
  /** Chroma of the hover. */
  hoverC: number;
  /** How far the hover sits from the base in OKLCH lightness, away from the ground. */
  step: number;
}
/** Blues from 244 to 258 degrees: clear of the teal of Fine (about 194) and short of violet (the class edge is 280). */
const SEA_HUES = [244, 246, 248, 250, 252, 254, 256, 258];
/** Chroma of the base stays at 0.10 or more in the light mode and 0.09 or more in the dark, so that the action colour reads as a blue and not as a slate. */
const ACTION_GRID: Record<ModeName, { C: number[]; hoverC: number[]; step: number[] }> = {
  light: { C: [0.10, 0.12, 0.14], hoverC: [0.06, 0.08, 0.10, 0.12], step: [0.07, 0.09] },
  dark: { C: [0.09, 0.12], hoverC: [0.04, 0.06, 0.08], step: [0.04, 0.06] },
};

/** The base colour of the action at a hue: the lightest (light) or darkest (dark) whose link and button text clear the aged-eye gate on the grounds they sit on. */
function actionAt(m: ModeName, h: number, p: ActionParams): { base: string; hover: string } {
  const passes = (L: number): boolean => [g(m, "ground"), g(m, "sheet")].every((bg) => aged(fromOklch(L, p.C, h), bg) >= AGED_TEXT + TEXT_MARGIN);
  if (m === "light") {
    const L = firstL(0.5, 0.25, passes, "light action colour");
    return { base: fromOklch(L, p.C, h), hover: fromOklch(L - p.step, p.hoverC, h) };
  }
  const L = firstL(0.6, 0.97, passes, "dark action colour");
  return { base: fromOklch(L, p.C, h), hover: fromOklch(L + p.step, p.hoverC, h) };
}

/** The chroma and hover at a hue that put the base and the hover furthest from the accents of the migrated families. */
function bestAction(m: ModeName, h: number): { p: ActionParams; base: string; hover: string; score: number } {
  let best: { p: ActionParams; base: string; hover: string; score: number } | undefined;
  for (const C of ACTION_GRID[m].C) {
    for (const hoverC of ACTION_GRID[m].hoverC) {
      for (const step of ACTION_GRID[m].step) {
        const p = { C, hoverC, step };
        const a = actionAt(m, h, p);
        const score = Math.min(nearestOther(m, a.base).d, nearestOther(m, a.hover).d);
        if (!best || score > best.score + 1e-9) best = { p, ...a, score };
      }
    }
  }
  return best!;
}

// A hue is scored by the worse of its two modes. The top is flat within SLACK_ACTION, so the hue nearest the
// middle of the window wins among the admissible ones.
const SLACK_ACTION = 0.003;
const seaScored = SEA_HUES.map((h) => ({ h, light: bestAction("light", h), dark: bestAction("dark", h) })).map((s) => ({ ...s, score: Math.min(s.light.score, s.dark.score) }));
const seaBest = Math.max(...seaScored.map((s) => s.score));
const seaMiddle = (SEA_HUES[0]! + SEA_HUES[SEA_HUES.length - 1]!) / 2;
const SEA = seaScored.filter((s) => s.score >= seaBest - SLACK_ACTION).reduce((a, b) => (Math.abs(b.h - seaMiddle) < Math.abs(a.h - seaMiddle) ? b : a));
palette.sea!.day = SEA.light.base;
palette.sea!["day-deep"] = SEA.light.hover;
palette.sea!.night = SEA.dark.base;
palette.sea!["night-bright"] = SEA.dark.hover;

// ---------------------------------------------------------------------------------------------
// The three status colours
// ---------------------------------------------------------------------------------------------
type Status = "spray" | "fire" | "cherry";
const STATUSES: Status[] = ["spray", "fire", "cherry"];
/** Hue windows in OKLCH degrees. Each keeps its colour in one named hue class of lib/model/checks.ts, away from the class edges. */
const WINDOWS: Record<Status, [number, number]> = { spray: [188, 202], fire: [72, 88], cherry: [28, 42] };
const WANT_CLASS: Record<Status | "sea", string> = { sea: "blue", spray: "cyan", fire: "orange", cherry: "red" };
const CHROMA: Record<ModeName, Record<Status, number>> = {
  light: { spray: 0.08, fire: 0.11, cherry: 0.11 },
  dark: { spray: 0.08, fire: 0.12, cherry: 0.12 },
};

/** The status ladder in L*, lightest first: amber, teal, brick (light) and amber, teal, coral (dark). */
const LADDER: Record<ModeName, Record<Status, number>> = (() => {
  const top = lstarDarkerThan(g("light", "ground"), AMBER_ON_GROUND);
  const bottom = lstarLighterThan(g("dark", "ground"), CORAL_ON_GROUND);
  return {
    light: { fire: top, spray: top - LADDER_STEP, cherry: top - 2 * LADDER_STEP },
    dark: { cherry: bottom, spray: bottom + LADDER_STEP, fire: bottom + 2 * LADDER_STEP },
  };
})();

const VIEWS: [string, (hex: string) => string][] = [
  ["normal", (x) => x],
  ["protan", (x) => simulateCvd(x, "protan", 1)],
  ["deutan", (x) => simulateCvd(x, "deutan", 1)],
  ["tritan", (x) => simulateCvd(x, "tritan", 1)],
  ["aged eye", agedEye],
  ["sunlight", (x) => applyFlare(x, GLARE)],
];

const cache = new Map<string, string>();
function statusAt(m: ModeName, status: Status, h: number): string {
  const key = `${m}:${status}:${h}`;
  let c = cache.get(key);
  if (c === undefined) {
    c = atLstar(LADDER[m][status], CHROMA[m][status], h);
    cache.set(key, c);
  }
  return c;
}

const seaColour: Record<ModeName, string> = { light: SEA.light.base, dark: SEA.dark.base };
/** The smallest pairwise distance of the action colour and the three status colours, over both modes and the six views. */
function worstOf(hs: number[]): { min: number; where: string } {
  let worst = { min: Infinity, where: "" };
  const names = ["sea", ...STATUSES];
  for (const m of MODES) {
    const colours = [seaColour[m], ...STATUSES.map((s, i) => statusAt(m, s, hs[i]!))];
    for (const [view, transform] of VIEWS) {
      const p = minPairwise(colours, oklabDistance, transform);
      if (p.min < worst.min) worst = { min: p.min, where: `${m}, ${view}, ${names[p.pair[0]]} and ${names[p.pair[1]]}` };
    }
  }
  return worst;
}

// Every combination of status hues, every 2 degrees inside the windows, is scored by its worst pair. The top of
// that score is flat, so any combination within SLACK of the best is admissible and the one nearest the windows'
// centres wins: a hue leaves its centre only where that buys more than SLACK of distance in the worst case.
const SLACK = 0.005;
const steps = STATUSES.map((s) => {
  const out: number[] = [];
  for (let h = WINDOWS[s][0]; h <= WINDOWS[s][1]; h += 2) out.push(h);
  return out;
});
const tried: number[][] = [];
for (const spray of steps[0]!) for (const fire of steps[1]!) for (const cherry of steps[2]!) tried.push([spray, fire, cherry]);
const scored = tried.map((hs) => ({ hs, ...worstOf(hs) }));
const best = Math.max(...scored.map((s) => s.min));
const offCentre = (hs: number[]): number => STATUSES.reduce((sum, s, i) => sum + Math.abs(hs[i]! - (WINDOWS[s][0] + WINDOWS[s][1]) / 2) / (WINDOWS[s][1] - WINDOWS[s][0]), 0);
const admissible = scored.filter((s) => s.min >= best - SLACK);
const pick = admissible.reduce((a, b) => (offCentre(b.hs) < offCentre(a.hs) ? b : a));
const H = Object.fromEntries(STATUSES.map((s, i) => [s, pick.hs[i]!])) as Record<Status, number>;

for (const m of MODES) {
  const suffix = m === "light" ? "day" : "night";
  for (const s of STATUSES) palette[s]![suffix] = statusAt(m, s, H[s]);
}

// Tints: a fill for each status level, and the selection fill. Each sits under ink that clears the aged-eye gate.
// Light tints are a little deeper than the paper, dark tints a little lighter than the sheet; the status hues keep
// the chroma that looks like a tint and not like a colour.
const TINT: Record<ModeName, Record<Status, [lightness: number, chroma: number]>> = {
  light: { spray: [0.945, 0.022], fire: [0.945, 0.045], cherry: [0.945, 0.028] },
  dark: { spray: [0.3, 0.035], fire: [0.3, 0.045], cherry: [0.3, 0.04] },
};
for (const m of MODES) {
  const suffix = m === "light" ? "day-tint" : "night-tint";
  for (const s of STATUSES) palette[s]![suffix] = fromOklch(TINT[m][s][0], TINT[m][s][1], H[s]);
}
// The selection fill is a blue tint. Light: a pale one. Dark: the lightest blue-black under which ink still clears the gate.
palette.sea!["day-tint"] = fromOklch(0.935, 0.03, SEA.h);
palette.sea!["night-tint"] = fromOklch(
  firstL(0.5, 0.2, (L) => aged(g("dark", "ink"), fromOklch(L, 0.065, SEA.h)) >= AGED_TEXT + TEXT_MARGIN, "dark selection fill"),
  0.065,
  SEA.h,
);

// ---------------------------------------------------------------------------------------------
// The palette block of the token file
// ---------------------------------------------------------------------------------------------
/** The order of the entries of each group in the token file: a light entry, its tint and its hover, then the dark ones. */
const ORDER: Record<string, string[]> = {
  paper: ["ground", "panel", "sheet", "ink", "soft-ink", "edge"],
  hearth: ["ground", "panel", "sheet", "ink", "soft-ink", "edge"],
  sea: ["day", "day-deep", "day-tint", "night", "night-bright", "night-tint"],
  spray: ["day", "day-tint", "night", "night-tint"],
  fire: ["day", "day-tint", "night", "night-tint"],
  cherry: ["day", "day-tint", "night", "night-tint"],
};

function block(): string {
  const lines = ['  "palette": {'];
  const groups = Object.entries(palette);
  groups.forEach(([group, entries], gi) => {
    lines.push(`    ${JSON.stringify(group)}: {`);
    const order = ORDER[group] ?? Object.keys(entries);
    need(order.length === Object.keys(entries).length && order.every((n) => entries[n] !== undefined), `the order of palette group ${group} does not match its entries`);
    const items = order.map((n): [string, string] => [n, entries[n] ?? ""]);
    items.forEach(([name, hex], i) => lines.push(`      ${JSON.stringify(name)}: ${JSON.stringify(hex)}${i < items.length - 1 ? "," : ""}`));
    lines.push(`    }${gi < groups.length - 1 ? "," : ""}`);
  });
  lines.push("  },");
  return lines.join("\n");
}

if (process.argv.includes("--print")) {
  console.log(block());
  process.exit(0);
}

// ---------------------------------------------------------------------------------------------
// The derivation, as tables
// ---------------------------------------------------------------------------------------------
console.log("Feasible regions (aged-eye, flare 0.02: ratio = (Yb + 0.07) / (Yt + 0.07), needs 7)");
for (const m of MODES) {
  for (const n of ["ground", "panel", "sheet"]) {
    const yb = Y(g(m, n));
    const limit = m === "light" ? `ink up to Y ${fmt((yb + 0.07) / AGED_TEXT - 0.07)}` : `ink from Y ${fmt(AGED_TEXT * (yb + 0.07) - 0.07)}`;
    console.log(`  ${m.padEnd(5)} ${n.padEnd(7)} ${g(m, n)} Y ${fmt(yb, 4)}  ${limit}`);
  }
}

console.log(`\nAction colour search: blues from ${SEA_HUES[0]} to ${SEA_HUES[SEA_HUES.length - 1]} degrees, with the chroma and the hover of each mode searched for the distance from the accents of ${MIGRATED.join(", ")}`);
console.log(`  best score ${fmt(seaBest)} (the smallest distance of a base or a hover to such an accent, the worse mode); chosen hue ${SEA.h}, the hue nearest ${seaMiddle} among those within ${SLACK_ACTION}`);
for (const m of MODES) {
  const r = SEA[m];
  console.log(`  ${m.padEnd(5)} chroma ${r.p.C}, hover chroma ${r.p.hoverC}, hover step ${r.p.step}: base ${r.base}, hover ${r.hover}`);
}

console.log("\nStatus ladder in L*, lightest first");
for (const m of MODES) {
  const l = LADDER[m];
  console.log(`  ${m.padEnd(5)} amber ${fmt(l.fire, 1)}  teal ${fmt(l.spray, 1)}  ${m === "light" ? "brick" : "coral"} ${fmt(l.cherry, 1)}  (steps of ${fmt(LADDER_STEP, 1)})`);
}

console.log(`\nStatus hue search: ${tried.length} combinations of spray ${WINDOWS.spray.join("-")}, fire ${WINDOWS.fire.join("-")}, cherry ${WINDOWS.cherry.join("-")} degrees, every 2 degrees`);
console.log(`  best worst pair ${fmt(best)}; ${admissible.length} combinations within ${SLACK} of it; the one nearest the window centres is spray ${H.spray}, fire ${H.fire}, cherry ${H.cherry}`);
console.log(`  its worst pair over both modes and six views: ${fmt(pick.min)} (${pick.where})`);

console.log("\nPalette");
console.log("  entry                hex      L_ok   C      h    Y      L*    class");
for (const [group, entries] of Object.entries(palette)) {
  for (const name of ORDER[group] ?? Object.keys(entries)) {
    const hex = entries[name]!;
    const k = toOklch(hex);
    console.log(`  ${`${group}.${name}`.padEnd(20)} ${hex} ${fmt(k.L)} ${fmt(k.C)} ${fmt(k.h, 0).padStart(3)}  ${fmt(Y(hex))} ${fmt(lstar(hex), 1).padStart(5)} ${hueClass(hex)}`);
  }
}

console.log("\nNearest accent of another family (OKLab distance)");
const hueEntries: [string, string, string][] = [
  ["sea", "day", "light"], ["sea", "day-deep", "light"], ["sea", "night", "dark"], ["sea", "night-bright", "dark"],
  ["spray", "day", "light"], ["spray", "night", "dark"], ["fire", "day", "light"], ["fire", "night", "dark"], ["cherry", "day", "light"], ["cherry", "night", "dark"],
];
for (const [group, name, m] of hueEntries) {
  const hex = palette[group]![name]!;
  const n = nearestOther(m as ModeName, hex);
  console.log(`  ${`${group}.${name}`.padEnd(18)} ${hex} ${fmt(n.d)} ${n.who}`);
  if (group === "sea") need(n.d >= ACTION_FROM_OTHERS, `${group}.${name} is ${fmt(n.d)} from ${n.who}, needs ${ACTION_FROM_OTHERS}`);
}

// The teal of Fine cannot leave the crowd: its lightness is fixed by the ladder, so scan every cyan hue and a range
// of chroma at that lightness and report the furthest any of them gets from an accent of another family.
console.log("\nScan of the teal at the ladder lightness: hue 180 to 225 degrees (the cyan class), chroma 0.04 to 0.12");
for (const m of MODES) {
  let furthest = { d: 0, h: 0, C: 0, who: "" };
  for (let h = 180; h <= 225; h += 5) {
    for (const C of [0.04, 0.06, 0.08, 0.10, 0.12]) {
      const n = nearestOther(m, atLstar(LADDER[m].spray, C, h));
      if (n.d > furthest.d) furthest = { d: n.d, h, C, who: n.who };
    }
  }
  console.log(`  ${m.padEnd(5)} the furthest any teal gets is ${fmt(furthest.d)} (hue ${furthest.h}, chroma ${furthest.C}, nearest ${furthest.who}); the teal of Fine is ${fmt(nearestOther(m, palette.spray![m === "light" ? "day" : "night"]!).d)}`);
}

for (const hue of ["sea", ...STATUSES] as const) {
  for (const m of MODES) {
    const c = palette[hue]![m === "light" ? "day" : "night"]!;
    need(hueClass(c) === WANT_CLASS[hue], `${hue} in ${m} is in hue class ${hueClass(c)}, wanted ${WANT_CLASS[hue]}`);
  }
}
for (const m of MODES) {
  const l = (["fire", "spray", "cherry"] as const).map((h) => lstar(palette[h]![m === "light" ? "day" : "night"]!));
  const gap = Math.min(Math.abs(l[0]! - l[1]!), Math.abs(l[1]! - l[2]!), Math.abs(l[0]! - l[2]!));
  need(gap >= PRINT_GAP + 0.4, `${m} status colours are ${fmt(gap, 2)} L* apart, needs ${PRINT_GAP + 0.4}`);
}

// ---------------------------------------------------------------------------------------------
// Compare with the token file
// ---------------------------------------------------------------------------------------------
if (process.argv.includes("--write")) {
  const text = readFileSync(TOKENS, "utf8");
  const start = text.indexOf('  "palette": {');
  const end = text.indexOf('  "modes": {');
  if (start < 0 || end < 0) throw new Error("the token file has no palette block to replace");
  writeFileSync(TOKENS, text.slice(0, start) + block() + "\n" + text.slice(end));
  console.log(`\nwrote the palette block of ${TOKENS}`);
}
const file = readJson(TOKENS) as FamilyFile;
const onDisk = file.palette as Record<string, Record<string, unknown>>;
for (const [group, entries] of Object.entries(palette)) {
  for (const [name, hex] of Object.entries(entries)) {
    const held = onDisk[group]?.[name];
    need(held === hex, `palette.${group}.${name} is ${JSON.stringify(held)} in the token file, the method gives ${hex}`);
  }
}
for (const [group, entries] of Object.entries(onDisk)) {
  for (const name of Object.keys(entries)) need(palette[group]?.[name] !== undefined, `palette.${group}.${name} is in the token file and the method does not derive it`);
}

// ---------------------------------------------------------------------------------------------
// The checks on the token file as it is
// ---------------------------------------------------------------------------------------------
const family = resolveFamily(file);
const report = buildReport(family, thresholds);
const at = (m: ModeName, address: string): string => {
  const c = family.modes[m].colours.get(address);
  if (!c) throw new Error(`no ${address} in ${m}`);
  return c.hex;
};

console.log("\nColours in use per mode");
for (const m of MODES) console.log(`  ${m.padEnd(5)} ${new Set([...family.modes[m].colours.values()].map((c) => c.hex)).size} distinct colours at ${family.modes[m].colours.size} addresses`);

console.log("\nText pairs: contrast plain, after the aged-eye simulation, after glare, in grey (needs 7, 7, 4.5, 7)");
console.log("  mode  pair                                             plain  aged   glare  grey");
let tightest = { ratio: Infinity, label: "" };
for (const p of file.pairs ?? []) {
  if (p.kind !== "text") continue;
  for (const m of p.modes ?? MODES) {
    const fg = at(m, p.fg);
    const bg = at(m, p.bg);
    const a = aged(fg, bg);
    if (a < tightest.ratio) tightest = { ratio: a, label: `${m} ${p.fg} on ${p.bg}` };
    const row = [contrastRatio(fg, bg), a, contrastRatio(applyFlare(fg, GLARE), applyFlare(bg, GLARE)), contrastRatio(greyscaleHex(fg), greyscaleHex(bg))];
    console.log(`  ${m.padEnd(5)} ${`${p.fg} on ${p.bg}`.padEnd(48)} ${fmt(row[0]!, 2).padStart(5)} ${fmt(row[1]!, 2).padStart(5)} ${fmt(row[2]!, 2).padStart(6)} ${fmt(row[3]!, 2).padStart(5)}`);
  }
}
console.log(`  smallest after the aged-eye simulation: ${fmt(tightest.ratio, 2)}:1 (${tightest.label})`);

console.log("\nAction, status and edge colours on the ground (components, need 3)");
for (const m of MODES) {
  const ground = at(m, "roles.bg");
  const row = ["roles.accent", "status.success", "status.warning", "status.danger", "roles.border"].map((a) => `${a.split(".")[1]} ${fmt(contrastRatio(at(m, a), ground), 2)}`);
  console.log(`  ${m.padEnd(5)} on roles.bg: ${row.join("  ")}`);
}

console.log("\nDistinct sets: smallest OKLab distance per view (need 0.06); smallest L* gap (print-grey needs 12)");
for (const d of file.distinct ?? []) {
  for (const m of d.modes ?? MODES) {
    const members = distinctMembers(family.modes[m], d);
    const colours = members.map((x) => x.colour.hex);
    const cells = VIEWS.map(([view, transform]) => {
      const p = minPairwise(colours, oklabDistance, transform);
      return `${view} ${fmt(p.min)} (${members[p.pair[0]]!.name}, ${members[p.pair[1]]!.name})`;
    });
    const l = colours.map(lstar);
    const gaps = l.flatMap((x, i) => l.slice(i + 1).map((y) => Math.abs(x - y)));
    console.log(`  ${d.id.padEnd(7)} ${m.padEnd(5)} ${cells.join("; ")}; L* gap ${fmt(Math.min(...gaps), 1)}`);
  }
}

console.log("\nRule checks");
for (const r of runRuleChecks(family)) {
  console.log(`  ${r.failures.length === 0 ? "pass" : "FAIL"}  ${r.id} (${r.check})`);
  for (const f of r.failures) failed.push(`rule ${r.id} (${r.check}): ${f}`);
}

console.log("\nHarness: each profile, and its tightest check (value against limit)");
for (const [profile, r] of Object.entries(report.profiles)) {
  const numeric = r.checks.filter((c) => !c.report && c.value !== undefined && c.limit !== undefined);
  const t = numeric.reduce((a, b) => (b.value! / b.limit! < a.value! / a.limit! ? b : a));
  console.log(`  ${profile.padEnd(14)} ${r.status.padEnd(6)} ${r.errors} errors, ${r.warnings} warnings, ${r.checks.length} checks; tightest ${t.id}${t.mode ? ` (${t.mode})` : ""}: ${fmt(t.value!, 3)} against ${t.limit}`);
  for (const d of failures(r.checks)) failed.push(`${profile}: ${d}`);
}
for (const env of [...file.meta.environments, "office-screen"]) need(report.profiles[env]?.status === "pass", `profile ${env} is ${report.profiles[env]?.status ?? "missing"}, it must pass`);

if (failed.length > 0) {
  console.error(`\n${failed.length} problems:\n  ${failed.join("\n  ")}`);
  process.exit(1);
}
console.log("\nThe token file holds the derived palette and every check passes.");
