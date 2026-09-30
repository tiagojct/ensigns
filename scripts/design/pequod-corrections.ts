// Pequod corrections: a joint search under explicit gated surfaces (decision D10).
//
// The gates come from tests/environments.json. Every crew colour is a text colour on the page
// and a syntax colour in the editor, so each must clear 4.5:1 on the page, on the editor
// background and on the current line, and 3:1 on the selection, in both modes. Separately, the
// brief says the smallest pairwise OKLab distance among the crew in each mode may not fall below
// the original.
//
// Method, in the order the brief asks for: change lightness first and only where a gate needs it;
// allow small hue and chroma moves only to hold the distance floor; minimise the total change
// from the original. Two routes are compared: the brief's (Ahab may move towards crimson) and one
// that leaves Ahab alone.
//
//   node scripts/design/pequod-corrections.ts             print both routes
//   node scripts/design/pequod-corrections.ts --apply     write a route (--route A|E, default: the feasible one with the least change)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { minPairwise } from "../../lib/colour/distinct.ts";
import { fromOklch, oklabDistance, toOklch } from "../../lib/colour/oklab.ts";
import { contrastRatio } from "../../lib/colour/wcag.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { differences, snapshotOf } from "../../tests/shared/legacy.ts";
import type { Change } from "../../tests/shared/legacy.ts";

type Mode = "dark" | "light";
const root = repoRoot();
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const routeArg = args.includes("--route") ? args[args.indexOf("--route") + 1] : undefined;

const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8"));
const GATE = {
  text: thresholds.common.wcag.text.value as number,
  selection: thresholds.profiles.editor.textOnSelection.min as number,
};
const MARGIN = 0.005; // stay clear of the gate so rounding to hex cannot undo it
const CREW = ["ahab", "starbuck", "queequeg", "pip", "ishmael", "stubb", "tashtego", "daggoo"];

const tokenPath = join(root, "families/pequod/pequod.tokens.json");
let file = JSON.parse(readFileSync(tokenPath, "utf8"));
const resolved = resolveFamily(file);

interface Surface { name: string; hex: string; min: number }

const surfacesOf = (m: Mode): Surface[] => {
  const c = resolved.modes[m].colours;
  return [
    { name: "page", hex: c.get("roles.bg")!.hex, min: GATE.text },
    { name: "editor", hex: c.get("surfaces.editor")!.hex, min: GATE.text },
    { name: "line", hex: c.get("surfaces.editor-line")!.hex, min: GATE.text },
    { name: "selection", hex: c.get("surfaces.editor-selection")!.hex, min: GATE.selection },
  ];
};

const meets = (hex: string, surfaces: Surface[]) => surfaces.every((s) => contrastRatio(hex, s.hex) >= s.min + MARGIN);

/** The colour at this hue and chroma whose lightness is as close to the original as the gates allow. */
function fit(mode: Mode, origL: number, C: number, h: number, surfaces: Surface[]): string | null {
  const step = mode === "light" ? -0.001 : 0.001;
  for (let L = origL, i = 0; i < 800 && L > 0.02 && L < 0.99; L += step, i++) {
    const hex = fromOklch(L, C, h);
    if (meets(hex, surfaces)) return hex;
  }
  return null;
}

// The originals are the colours the old repository held (the frozen snapshot), so the search gives the same
// answer whatever the token file holds now. current() is what the token file holds now.
const snapshot = snapshotOf("pequod");
const originals = (m: Mode): Record<string, string> =>
  Object.fromEntries(CREW.map((n) => [n, (snapshot.accents.find((a: { id: string }) => a.id === n)![m].hex as string).toUpperCase()]));
const current = (m: Mode): Record<string, string> =>
  Object.fromEntries(CREW.map((n) => [n, resolved.modes[m].colours.get(`accents.${n}`)!.hex]));

function floorOf(m: Mode): number {
  const entry = (file.distinct as { id: string; min?: number }[]).find((d) => d.id === `crew-${m}`);
  return entry?.min ?? 0.06;
}

interface Route {
  name: string;
  fixed: string[];
  hue: Record<string, [number, number]>;
  /** Extra lightness change beyond what the gates need, per colour (OKLab L, negative is darker). */
  lightness?: Record<string, [number, number]>;
  /** Chroma range per colour (OKLab C, relative to the original). */
  chroma?: Record<string, [number, number]>;
}

function search(mode: Mode, route: Route): Record<string, string> {
  const orig = originals(mode);
  const surfaces = surfacesOf(mode);
  const floor = floorOf(mode);
  const cur: Record<string, string> = { ...orig };
  // A colour is held in place only where it passes every gate in this mode.
  const held = (n: string) => route.fixed.includes(n) && meets(orig[n]!, surfaces);

  const shortfall = (set: Record<string, string>) => {
    let s = 0;
    for (let i = 0; i < CREW.length; i++) {
      for (let j = i + 1; j < CREW.length; j++) s += Math.max(0, floor - oklabDistance(set[CREW[i]!]!, set[CREW[j]!]!));
    }
    return s;
  };
  const moved = (set: Record<string, string>) => CREW.reduce((t, n) => t + oklabDistance(orig[n]!, set[n]!), 0);
  const score = (set: Record<string, string>) => 1000 * shortfall(set) + moved(set);

  // Step 1: lightness only, where a gate needs it.
  for (const n of CREW) {
    if (held(n) || meets(orig[n]!, surfaces)) continue;
    const k = toOklch(orig[n]!);
    cur[n] = fit(mode, k.L, k.C, k.h, surfaces) ?? orig[n]!;
  }

  // Step 2: small hue and chroma moves, only as far as the distance floor and the gates call for.
  for (let pass = 0; pass < 8; pass++) {
    let improved = false;
    for (const n of CREW) {
      if (held(n)) continue;
      const k = toOklch(orig[n]!);
      const [lo, hi] = route.hue[n] ?? [-4, 4];
      const [cLo, cHi] = route.chroma?.[n] ?? [-0.04, 0.04];
      const [lLo, lHi] = route.lightness?.[n] ?? [0, 0];
      let best = cur[n]!;
      let bestScore = score(cur);
      for (let dh = lo; dh <= hi; dh += 1) {
        for (let dc = cLo; dc <= cHi + 1e-9; dc += 0.005) {
          for (let dl = lLo; dl <= lHi + 1e-9; dl += 0.01) {
            const C = Math.max(0, k.C + dc);
            const untouched = dh === 0 && dc === 0 && dl === 0 && meets(orig[n]!, surfaces);
            const hex = untouched ? orig[n]! : fit(mode, k.L + dl, C, (k.h + dh + 360) % 360, surfaces);
            if (!hex) continue;
            // The hue that counts is the hue of the rounded, gamut-mapped colour, not the one asked for.
            const got = toOklch(hex);
            const drift = Math.abs(((got.h - k.h + 540) % 360) - 180);
            if (k.C > 0.03 && got.C > 0.03 && drift > (route.hue[n] ? Math.max(Math.abs(lo), Math.abs(hi)) + 1 : 4.5)) continue;
            const s = score({ ...cur, [n]: hex });
            if (s < bestScore - 1e-9) { best = hex; bestScore = s; }
          }
        }
      }
      if (best !== cur[n]) { cur[n] = best; improved = true; }
    }
    if (!improved) break;
  }
  return cur;
}

// Colours that already pass every gate stay exactly as they are: only a failing colour, or Ahab for
// separation, may move.
const PASSING = ["queequeg", "pip", "daggoo"];

const ROUTES: Record<string, Route> = {
  A: { name: "A, the brief's route: Ahab may move towards crimson", fixed: PASSING, hue: { ahab: [-16, 4], ishmael: [-75, 75] }, chroma: { ishmael: [-0.01, 0.03] } },
  B: { name: "B, Ahab stays as it is", fixed: ["ahab"], hue: {} },
  C: { name: "C, Ahab stays; Stubb and Pip may move much further", fixed: ["ahab"], hue: { stubb: [-6, 28], pip: [-12, 12] } },
  D: { name: "D, Ahab moves at most 8 degrees", fixed: PASSING, hue: { ahab: [-8, 4] } },
  E: { name: "E, Ahab moves towards a darker crimson and keeps its chroma", fixed: PASSING, hue: { ahab: [-14, 2], ishmael: [-75, 75] }, lightness: { ahab: [-0.16, 0] }, chroma: { ahab: [-0.01, 0.01], ishmael: [-0.01, 0.03] } },
};

function report(route: Route, sets: Record<Mode, Record<string, string>>) {
  console.log(`\n=== Route ${route.name}`);
  for (const m of ["light", "dark"] as const) {
    const orig = originals(m);
    const surf = surfacesOf(m);
    console.log(`\n${m}: surfaces ${surf.map((s) => `${s.name} ${s.hex}`).join(", ")}; floor ${floorOf(m)}`);
    console.log("crew".padEnd(10), "old".padEnd(8), "new".padEnd(8), "dL      dC      dh    ", "page  edit  line  sel   ", "moved");
    for (const n of CREW) {
      const a = toOklch(orig[n]!);
      const b = toOklch(sets[m][n]!);
      const dh = ((b.h - a.h + 540) % 360) - 180;
      const cs = surf.map((s) => contrastRatio(sets[m][n]!, s.hex).toFixed(2).padStart(5)).join(" ");
      console.log(n.padEnd(10), orig[n]!.padEnd(8), sets[m][n]!.padEnd(8), (b.L - a.L).toFixed(3).padStart(6), (b.C - a.C).toFixed(3).padStart(7), dh.toFixed(1).padStart(6), " ", cs, " ", oklabDistance(orig[n]!, sets[m][n]!).toFixed(3));
    }
    const mp = minPairwise(CREW.map((n) => sets[m][n]!));
    console.log(`minimum pairwise ${mp.min.toFixed(4)} (${CREW[mp.pair[0]]} and ${CREW[mp.pair[1]]}), floor ${floorOf(m)}: ${mp.min >= floorOf(m) ? "holds" : "BELOW THE FLOOR"}`);
  }
}

const results: Record<string, Record<Mode, Record<string, string>>> = {};
for (const [key, route] of Object.entries(ROUTES)) {
  results[key] = { light: search("light", route), dark: search("dark", route) };
  report(route, results[key]);
}

// The brief's own starting values, for comparison. They are typed here because they come from the brief, not from a token file.
const BRIEF: Record<Mode, Record<string, string>> = {
  light: { starbuck: "#066C93", ishmael: "#69645F", tashtego: "#04744D", stubb: "#A74605", ahab: "#932038" },
  dark: { daggoo: "#A4736C" },
};

if (args.includes("--export")) {
  const out = args[args.indexOf("--export") + 1]!;
  const routes: Record<string, unknown> = {};
  for (const [key, route] of Object.entries(ROUTES)) {
    routes[key] = { name: route.name };
    for (const m of ["light", "dark"] as const) {
      const set = results[key]![m];
      const surf = surfacesOf(m);
      (routes[key] as Record<string, unknown>)[m] = {
        colours: set,
        floor: floorOf(m),
        minimum: minPairwise(CREW.map((n) => set[n]!)).min,
        contrast: Object.fromEntries(CREW.map((n) => [n, Object.fromEntries(surf.map((s) => [s.name, contrastRatio(set[n]!, s.hex)]))])),
      };
    }
  }
  const briefSet = Object.fromEntries((["light", "dark"] as const).map((m) => [m, { ...originals(m), ...BRIEF[m] }]));
  routes.brief = {
    name: "the brief's starting values",
    ...Object.fromEntries((["light", "dark"] as const).map((m) => [m, {
      colours: briefSet[m],
      floor: floorOf(m),
      minimum: minPairwise(CREW.map((n) => briefSet[m]![n]!)).min,
      contrast: Object.fromEntries(CREW.map((n) => [n, Object.fromEntries(surfacesOf(m).map((s) => [s.name, contrastRatio(briefSet[m]![n]!, s.hex)]))])),
    }])),
  };
  writeFileSync(out, JSON.stringify({ original: { light: originals("light"), dark: originals("dark") }, surfaces: { light: surfacesOf("light"), dark: surfacesOf("dark") }, routes }, null, 2) + "\n");
  console.log("exported", out);
}

const total = (key: string) => (["light", "dark"] as const).reduce((t, m) => t + CREW.reduce((u, n) => u + oklabDistance(originals(m)[n]!, results[key]![m][n]!), 0), 0);
console.log(`\ntotal change: route A ${total("A").toFixed(3)}, route B ${total("B").toFixed(3)}`);

if (apply) {
  // The default is the feasible route (distance floors held) with the least total change.
  const feasible = Object.keys(ROUTES).filter((k) => (["light", "dark"] as const).every((m) => minPairwise(CREW.map((n) => results[k]![m][n]!)).min >= floorOf(m)));
  const key = routeArg ?? feasible.sort((a, b) => total(a) - total(b))[0]!;
  const chosen = results[key]!;
  console.log(`\napplying route ${key}`);
  // Replace the values in the text, so the file keeps its formatting and the diff shows only the colours.
  let text = readFileSync(tokenPath, "utf8");
  const palette = file.palette as Record<string, Record<string, unknown>>;
  for (const n of CREW) {
    const lightOld = current("light")[n]!;
    const darkOld = current("dark")[n]!;
    if (chosen.light[n] !== lightOld) {
      const re = new RegExp(`("${n}": \\{\\s+"light": \\{"hex":")${lightOld}"`);
      if (!re.test(text)) throw new Error(`cannot find ${n} light ${lightOld} in the token file`);
      text = text.replace(re, `$1${chosen.light[n]}"`);
    }
    if (chosen.dark[n] !== darkOld) {
      const re = new RegExp(`("${n}": \\{\\s+"light": [^\\n]+\\n\\s+"dark": ")${darkOld}"`);
      if (!re.test(text)) throw new Error(`cannot find ${n} dark ${darkOld} in the token file`);
      text = text.replace(re, `$1${chosen.dark[n]}"`);
    }
  }
  void palette;
  writeFileSync(tokenPath, text);
  console.log("wrote", tokenPath);
  file = JSON.parse(text);

  // Record every difference from the original, keeping the reasons already written.
  const changesPath = join(root, "tests/shared/expected-changes/pequod.json");
  const existing: Change[] = JSON.parse(readFileSync(changesPath, "utf8"));
  const why = (hex: string, mode: Mode, address: string): string => {
    const name = CREW.find((n) => originals(mode)[n] === hex) ?? "a crew colour";
    const cap = name[0]!.toUpperCase() + name.slice(1);
    const where = mode === "light" ? "Parchment" : "Below deck";
    return `Pequod corrections (brief section 7, decision D10): ${cap} in ${where} clears AA on the page, the editor, the current line and the selection (${address}); hue and chroma held as close to the original as the distance floor allows.`;
  };
  const fresh = resolveFamily(file);
  const diffs = differences("pequod", fresh);
  const out: Change[] = diffs.map((d) => {
    const prior = existing.find((e) => e.mode === d.mode && e.address === d.address);
    return { mode: d.mode, address: d.address, from: d.was, to: d.now!, why: prior?.why ?? why(d.was, d.mode, d.address) };
  });
  writeFileSync(changesPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`recorded ${out.length} changes in ${changesPath}`);
}
