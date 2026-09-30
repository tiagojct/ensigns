// Jungfrau 2.0.0, the night family. Derives every value from stated rules in OKLCH and
// checks the night gates as it goes.
//
// The rules, each from the brief or the decisions taken at checkpoint 1:
//   ground     relative luminance 0.010 to 0.012 (D11), keeping the sea hue
//   body text  7:1 to 11:1 on the ground; with no token brighter than luminance 0.45 the usable
//              range is 7:1 to about 8.6:1
//   muted text at least 4.5:1
//   no blue    no text role with OKLCH hue 230 to 290 at chroma above 0.04; blues are dark fields
//   lamplight  the light mode is a dimmed warm paper, luminance 0.35 to 0.45, body text 7:1 or more
//   cap        no token in either mode brighter than luminance 0.45
//   code hues  retuned inside those limits, apart from each other under normal vision and CVD
//
//   node scripts/design/jungfrau.ts            print the design
//   node scripts/design/jungfrau.ts --write    write the token file and the records
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { simulateCvd } from "../../lib/colour/cvd.ts";
import { blend } from "../../lib/colour/composite.ts";
import { fromOklch, oklabDistance, toOklch } from "../../lib/colour/oklab.ts";
import { contrastRatio, relativeLuminance as Y } from "../../lib/colour/wcag.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";

type Mode = "dark" | "light";
const root = repoRoot();
const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8"));
const NIGHT = thresholds.profiles.night;
const CAP: number = NIGHT.maxTokenLuminance.max;
const TEXT: number = thresholds.common.wcag.text.value;
const SEL: number = thresholds.profiles.editor.textOnSelection.min;
const MARGIN = 0.03;

const old = resolveFamily(loadFamilies().find((f) => f.dir === "jungfrau")!.file);
const was = (mode: Mode, address: string) => old.modes[mode].colours.get(address)!.hex;

/** The colour at this chroma and hue whose relative luminance is y. */
function atY(y: number, C: number, h: number): string {
  let lo = 0.04;
  let hi = 0.99;
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (Y(fromOklch(mid, C, h)) < y) lo = mid; else hi = mid;
  }
  return fromOklch((lo + hi) / 2, C, h);
}

const lch = (hex: string) => toOklch(hex);
const fmt = (n: number, d = 3) => n.toFixed(d);

// ---------------------------------------------------------------------------------------------
// Core tones
// ---------------------------------------------------------------------------------------------
const seaHue = lch(was("dark", "roles.bg")).h;
const dark: Record<string, string> = {};
dark["roles.bg"] = atY(0.0110, 0.013, seaHue);
dark["roles.surface"] = atY(0.0170, 0.015, 248);
dark["roles.surface-raised"] = atY(0.0240, 0.017, 245);
dark["roles.border"] = atY(0.0370, 0.022, 249);
dark["roles.text"] = atY(0.410, 0.014, 88);
dark["roles.text-muted"] = atY(0.270, 0.012, 226);
dark["extra.contrast-more-text-muted"] = atY(0.330, 0.011, 229);
dark["extra.contrast-more-border"] = atY(0.140, 0.013, 244);

const light: Record<string, string> = {};
// The middle of the 0.35 to 0.45 band: dim enough for a dark room, bright enough to leave the code hues room to differ.
const PAPER = Number(process.env.PAPER ?? "0.40");
light["roles.bg"] = atY(PAPER, 0.034, 82);
light["roles.surface"] = atY(PAPER + 0.025, 0.034, 82);
light["roles.surface-raised"] = atY(CAP - 0.006, 0.032, 82);
light["roles.border"] = atY(PAPER - 0.075, 0.030, 80);
light["roles.text"] = atY(0.0055, 0.015, 60);
light["roles.text-muted"] = atY(0.035, 0.020, 70);
light["extra.contrast-more-text-muted"] = atY(0.020, 0.018, 65);
light["extra.contrast-more-border"] = atY(0.085, 0.020, 75);

const core = (mode: Mode) => (mode === "dark" ? dark : light);

function describe(mode: Mode) {
  const c = core(mode);
  const bg = c["roles.bg"]!;
  console.log(`\n${mode}: ground ${bg} luminance ${fmt(Y(bg), 4)}`);
  for (const k of ["roles.surface", "roles.surface-raised", "roles.border", "roles.text", "roles.text-muted"]) {
    console.log(`  ${k.padEnd(24)} ${c[k]}  Y ${fmt(Y(c[k]!))}  on ground ${contrastRatio(c[k]!, bg).toFixed(2)}`);
  }
}
describe("dark");
describe("light");

// ---------------------------------------------------------------------------------------------
// Fire and the sea
// ---------------------------------------------------------------------------------------------
// Dark: ember is the keyword colour, so it has to clear 4.5:1 on the current line (Y 0.017), not only on the
// ground. That raises it from luminance 0.218 to 0.258. Flame and oil stay as they were.
const fireHue = lch(was("dark", "accents.ember")).h;
dark["accents.ember"] = atY(0.258, lch(was("dark", "accents.ember")).C, fireHue);
// Flame is the hover and focus mark; it moves up in luminance so it stays 0.06 or more from ember.
dark["accents.flame"] = atY(0.360, 0.148, 61);
dark["accents.oil"] = was("dark", "accents.oil");
// Lamplight: the fire is burnt sienna. Ember has to reach 4.5:1 on the dim paper, flame is the brighter mark, oil the deeper.
light["accents.ember"] = atY(0.038, 0.100, 50);
light["accents.flame"] = atY(0.075, 0.110, 52);
light["accents.oil"] = atY(0.014, 0.060, 40);

// The sea is the field. Dark keeps the old fields; lamplight re-derives them under the cap.
for (const k of ["tint-deep", "tint", "tint-bright", "tint-pale", "on-tint"]) dark[`extra.${k}`] = was("dark", `extra.${k}`);
light["extra.tint-deep"] = atY(0.014, 0.025, 231);
light["extra.tint"] = atY(0.040, 0.043, 219);
light["extra.tint-bright"] = atY(0.085, 0.050, 215);
light["extra.tint-pale"] = atY(0.230, 0.040, 195);
light["on-fire"] = atY(0.400, 0.030, 85); // text on a fire or sea fill in lamplight

// ---------------------------------------------------------------------------------------------
// Code hues: a joint search
// ---------------------------------------------------------------------------------------------
interface Slot { name: string; windows: [number, number][]; C: [number, number]; L: [number, number] }
interface Pick { L: number; C: number; h: number; win: number }

function surfacesOf(mode: Mode) {
  const c = core(mode);
  const field = mode === "dark" ? dark["extra.tint"]! : light["extra.tint-pale"]!;
  return {
    editor: c["roles.bg"]!,
    line: c["roles.surface"]!,
    selection: blend(field, 0.4, c["roles.bg"]!),
  };
}

function admissible(hex: string, mode: Mode): boolean {
  const s = surfacesOf(mode);
  if (Y(hex) > CAP - 0.005) return false;
  if (contrastRatio(hex, s.editor) < TEXT + MARGIN || contrastRatio(hex, s.line) < TEXT + MARGIN) return false;
  if (contrastRatio(hex, s.selection) < SEL + MARGIN) return false;
  const k = toOklch(hex);
  const band = NIGHT.textHue;
  if (k.h >= band.hueMin - 2 && k.h <= band.hueMax + 2 && k.C > band.chromaAbove - 0.002) return false;
  return true;
}

const VIEWS = ["normal", "protan", "deutan", "tritan"] as const;
function worst(hexes: string[]): { min: number; view: string } {
  let best = { min: Infinity, view: "" };
  for (const v of VIEWS) {
    const seen = hexes.map((h) => (v === "normal" ? h : simulateCvd(h, v, 1)));
    for (let i = 0; i < seen.length; i++) {
      for (let j = i + 1; j < seen.length; j++) {
        const d = oklabDistance(seen[i]!, seen[j]!);
        if (d < best.min) best = { min: d, view: v };
      }
    }
  }
  return best;
}

let seed = 20260930;
const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

function search(mode: Mode, slots: Slot[], fixed: string[]): Record<string, string> {
  const toHex = (s: Slot, p: Pick) => fromOklch(p.L, p.C, p.h);
  const ok = (ps: Pick[]) => ps.every((p, i) => admissible(toHex(slots[i]!, p), mode));
  // Normal vision is the hard gate: reach 0.065 there first, then widen the CVD margin.
  const score = (ps: Pick[]) => {
    const hexes = [...fixed, ...ps.map((p, i) => toHex(slots[i]!, p))];
    let normal = Infinity;
    for (let i = 0; i < hexes.length; i++) for (let j = i + 1; j < hexes.length; j++) normal = Math.min(normal, oklabDistance(hexes[i]!, hexes[j]!));
    return 10 * Math.min(normal, 0.065) + worst(hexes).min;
  };
  let best: Pick[] | null = null;
  let bestScore = -1;
  for (let restart = 0; restart < 120; restart++) {
    let cur: Pick[] = slots.map((s) => {
      const win = Math.floor(rand() * s.windows.length);
      const [a, b] = s.windows[win]!;
      return { L: s.L[0] + rand() * (s.L[1] - s.L[0]), C: s.C[0] + rand() * (s.C[1] - s.C[0]), h: a + rand() * (b - a), win };
    });
    // Settle each start into the admissible region by lowering lightness.
    for (let i = 0; i < slots.length; i++) {
      let guard = 0;
      while (!admissible(toHex(slots[i]!, cur[i]!), mode) && guard++ < 80) cur[i] = { ...cur[i]!, L: cur[i]!.L + (mode === "dark" ? 0.01 : -0.01) * (Y(toHex(slots[i]!, cur[i]!)) > CAP - 0.005 ? -1 : 1) };
    }
    if (!ok(cur)) continue;
    let curScore = score(cur);
    for (let it = 0; it < 900; it++) {
      const i = Math.floor(rand() * slots.length);
      const s = slots[i]!;
      const p = cur[i]!;
      const [a, b] = s.windows[p.win]!;
      const next: Pick = {
        ...p,
        L: Math.min(s.L[1], Math.max(s.L[0], p.L + (rand() - 0.5) * 0.04)),
        C: Math.min(s.C[1], Math.max(s.C[0], p.C + (rand() - 0.5) * 0.015)),
        h: Math.min(b, Math.max(a, p.h + (rand() - 0.5) * 8)),
      };
      const trial = cur.map((q, k) => (k === i ? next : q));
      if (!admissible(toHex(s, next), mode)) continue;
      const sc = score(trial);
      if (sc > curScore) { cur = trial; curScore = sc; }
    }
    if (curScore > bestScore) { best = cur; bestScore = curScore; }
  }
  if (!best) throw new Error(`no admissible code hues found for ${mode}`);
  return Object.fromEntries(slots.map((s, i) => [s.name, toHex(s, best![i]!)]));
}

// The same hue windows in both modes, so a reader who switches modes keeps the same hue for each role.
const SHOAL: [number, number][] = process.env.SHOAL === "straw" ? [[80, 112]] : [[148, 180]];
const slotsDark: Slot[] = [
  { name: "kelp", windows: [[125, 155]], C: [0.05, 0.10], L: [0.60, 0.77] },
  { name: "dusk", windows: [[296, 335]], C: [0.05, 0.11], L: [0.58, 0.75] },
  { name: "tide", windows: [[194, 214]], C: [0.04, 0.10], L: [0.58, 0.77] },
  { name: "shoal", windows: SHOAL, C: [0.04, 0.10], L: [0.58, 0.77] },
  { name: "brick", windows: [[8, 26]], C: [0.09, 0.16], L: [0.56, 0.74] },
];
const slotsLight: Slot[] = [
  { name: "kelp", windows: [[125, 155]], C: [0.04, 0.09], L: [0.30, 0.46] },
  { name: "dusk", windows: [[296, 335]], C: [0.04, 0.10], L: [0.30, 0.46] },
  { name: "tide", windows: [[194, 214]], C: [0.03, 0.09], L: [0.30, 0.46] },
  { name: "shoal", windows: SHOAL, C: [0.03, 0.09], L: [0.30, 0.46] },
  { name: "brick", windows: [[8, 26]], C: [0.07, 0.14], L: [0.30, 0.46] },
];

for (const mode of ["dark", "light"] as const) {
  const fixed = [core(mode)["accents.ember"]!];
  const picked = search(mode, mode === "dark" ? slotsDark : slotsLight, fixed);
  for (const [k, v] of Object.entries(picked)) core(mode)[`accents.${k}`] = v;
  const set = [core(mode)["accents.ember"]!, ...Object.values(picked)];
  const w = worst(set);
  console.log(`\n${mode} code hues: closest pair over all views ${fmt(w.min)} (${w.view})`);
  const names = ["ember", ...Object.keys(picked)];
  for (const v of VIEWS) {
    const seen = set.map((h) => (v === "normal" ? h : simulateCvd(h, v, 1)));
    const close: string[] = [];
    for (let i = 0; i < seen.length; i++) for (let j = i + 1; j < seen.length; j++) { const d = oklabDistance(seen[i]!, seen[j]!); if (d < 0.06) close.push(`${names[i]}/${names[j]} ${fmt(d)}`); }
    console.log(`  ${v.padEnd(7)} below 0.06: ${close.join(", ") || "none"}`);
  }
  for (const [n, h] of [["ember", core(mode)["accents.ember"]!], ...Object.entries(picked)] as [string, string][]) {
    const k = lch(h);
    const s = surfacesOf(mode);
    console.log(`  ${n.padEnd(6)} ${h}  L ${fmt(k.L)} C ${fmt(k.C)} h ${k.h.toFixed(0).padStart(3)}  Y ${fmt(Y(h))}  editor ${contrastRatio(h, s.editor).toFixed(2)} line ${contrastRatio(h, s.line).toFixed(2)} sel ${contrastRatio(h, s.selection).toFixed(2)}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Neutral syntax, ANSI, terminal chrome
// ---------------------------------------------------------------------------------------------
dark["syntax.parameter"] = atY(0.340, 0.006, 211);
dark["syntax.operator"] = atY(0.300, 0.009, 214);
dark["syntax.punctuation"] = atY(0.262, 0.011, 229);
light["syntax.parameter"] = atY(0.020, 0.015, 65);
light["syntax.operator"] = light["roles.text-muted"]!;
light["syntax.punctuation"] = light["roles.text-muted"]!;

/** The same hue and chroma, shifted in lightness, kept under the cap. */
function shifted(hex: string, dL: number, yMax = CAP - 0.012): string {
  const k = lch(hex);
  let L = k.L + dL;
  let out = fromOklch(L, k.C, k.h);
  while (Y(out) > yMax && L > 0.05) { L -= 0.004; out = fromOklch(L, k.C, k.h); }
  return out;
}

// Slate, the ANSI blue. A blue at this chroma (below 0.04) is a grey with a lean, which the night rule allows.
dark["ansi.blue"] = atY(0.360, 0.034, 240);
dark["ansi.bright-blue"] = atY(0.425, 0.036, 240);
light["ansi.blue"] = atY(0.018, 0.034, 240);
light["ansi.bright-blue"] = atY(0.092, 0.040, 240);

for (const mode of ["dark", "light"] as const) {
  const c = core(mode);
  const dL = mode === "dark" ? { normal: -0.03, bright: 0 } : { normal: 0, bright: 0.055 };
  const hue = (n: string) => c[`accents.${n}`]!;
  c["ansi.red"] = shifted(hue("brick"), dL.normal);
  c["ansi.green"] = shifted(hue("kelp"), dL.normal);
  c["ansi.yellow"] = c["accents.ember"]!;
  c["ansi.magenta"] = shifted(hue("dusk"), dL.normal);
  c["ansi.cyan"] = shifted(hue("tide"), dL.normal);
  c["ansi.bright-red"] = shifted(hue("brick"), dL.bright);
  c["ansi.bright-green"] = shifted(hue("kelp"), dL.bright);
  c["ansi.bright-yellow"] = c["accents.flame"]!;
  c["ansi.bright-magenta"] = shifted(hue("dusk"), dL.bright);
  c["ansi.bright-cyan"] = shifted(hue("tide"), mode === "dark" ? 0.05 : 0.055);
  if (mode === "dark") {
    c["ansi.black"] = c["roles.surface"]!;
    c["ansi.white"] = atY(0.360, 0.006, 88);
    c["ansi.bright-black"] = atY(0.085, 0.022, 249);
    c["ansi.bright-white"] = c["roles.text"]!;
  } else {
    c["ansi.black"] = c["roles.text"]!;
    c["ansi.white"] = atY(0.040, 0.012, 70);
    c["ansi.bright-black"] = atY(0.060, 0.012, 215);
    c["ansi.bright-white"] = atY(0.085, 0.010, 75);
  }
  const field = mode === "dark" ? c["extra.tint"]! : c["extra.tint-pale"]!;
  c["terminal.background"] = c["roles.bg"]!;
  c["terminal.foreground"] = c["roles.text"]!;
  c["terminal.cursor"] = mode === "dark" ? c["accents.flame"]! : c["accents.ember"]!;
  c["terminal.cursor-text"] = mode === "dark" ? c["roles.bg"]! : light["on-fire"]!;
  c["terminal.selection-background"] = field;
  c["terminal.selection-foreground"] = c["roles.text"]!;
}

// ---------------------------------------------------------------------------------------------
// Data: scales re-derived under the cap
// ---------------------------------------------------------------------------------------------
const legacy = JSON.parse(readFileSync(join(root, "tests/fixtures/legacy/try-works.json"), "utf8"));
const OKABE: Record<string, string> = { E69F00: "orange", "56B4E9": "sky-blue", "009E73": "bluish-green", F0E442: "yellow", "0072B2": "blue", D55E00: "vermillion", CC79A7: "reddish-purple" };

/** Keep hue and chroma; lower lightness until the colour is under a luminance ceiling. */
function under(hex: string, yMax: number): string {
  const k = lch(hex);
  let L = k.L;
  let out = fromOklch(L, k.C, k.h);
  while (Y(out) > yMax && L > 0.05) { L -= 0.004; out = fromOklch(L, k.C, k.h); }
  return out;
}

const categorical: { name: string; dark: string; light: string }[] = (legacy.dataviz.categorical.colors as string[]).map((hex) => ({
  name: OKABE[hex.slice(1).toUpperCase()] ?? hex,
  dark: under(hex, 0.44),
  // On the dim paper a mark needs 3:1, which means a luminance of 0.11 or less.
  light: under(hex, 0.10),
}));

function ramp(n: number, L0: number, L1: number, h: number, C: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return fromOklch(L0 + (L1 - L0) * t, C * (0.35 + 0.65 * Math.sin(Math.PI * (0.15 + 0.7 * t))), h);
  });
}
const seqDark = ramp(7, 0.30, 0.76, 195, 0.075);
const seqLight = ramp(7, 0.72, 0.28, 195, 0.075);
function diverging(n: number, endL: number, midL: number, hA: number, hB: number, C: number): string[] {
  const half = (n - 1) / 2;
  return Array.from({ length: n }, (_, i) => {
    const t = Math.abs(i - half) / half; // 1 at the ends, 0 in the middle
    const L = midL + (endL - midL) * t;
    const h = i < half ? hA : i > half ? hB : 85;
    return fromOklch(L, i === half ? 0.012 : C * (0.25 + 0.75 * t), h);
  });
}
const divDark = diverging(9, 0.52, 0.76, 195, 70, 0.085);
const divLight = diverging(9, 0.30, 0.68, 195, 70, 0.07);

if (process.argv.includes("--data")) {
  for (const [label, list] of [["seq dark", seqDark], ["seq light", seqLight], ["div dark", divDark], ["div light", divLight], ["cat dark", categorical.map((c) => c.dark)], ["cat light", categorical.map((c) => c.light)]] as [string, string[]][]) {
    console.log(`${label.padEnd(10)} ${list.join(" ")}  Y max ${Math.max(...list.map(Y)).toFixed(3)}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Assemble the token file
// ---------------------------------------------------------------------------------------------
const WRITE = process.argv.includes("--write");
light["extra.on-tint"] = light["on-fire"]!;

const groups: Record<string, Record<string, unknown>> = {};
const byHex = new Map<string, string>();
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
function add(group: string, name: string, hex: string, note?: string): string {
  const g = slug(group);
  const n = slug(name);
  const bucket = (groups[g] ??= {});
  if (bucket[n] !== undefined) throw new Error(`duplicate palette entry ${g}.${n}`);
  bucket[n] = note ? { hex, note } : hex;
  if (!byHex.has(hex)) byHex.set(hex, `${g}.${n}`);
  return `${g}.${n}`;
}
function use(hex: string, group: string, name: string): string {
  const hit = byHex.get(hex);
  if (hit) return `{palette.${hit}}`;
  let n = slug(name);
  let i = 2;
  while (groups[slug(group)]?.[n] !== undefined) n = `${slug(name)}-${i++}`;
  return `{palette.${add(group, n, hex)}}`;
}
const named = (group: string, pairs: [string, string][]) => { for (const [n, h] of pairs) if (!byHex.has(h)) add(group, n, h); };

// Names first, so they win when two roles share a colour.
named("ground", [["pitch", dark["roles.bg"]!], ["hold", dark["roles.surface"]!], ["deck", dark["roles.surface-raised"]!], ["seam", dark["roles.border"]!]]);
named("whale", [["whale", dark["roles.text"]!], ["gull", dark["roles.text-muted"]!]]);
named("fire", [["ember", dark["accents.ember"]!], ["flame", dark["accents.flame"]!], ["oil", dark["accents.oil"]!]]);
named("sea", [["trough", dark["extra.tint-deep"]!], ["swell", dark["extra.tint"]!], ["spray", dark["extra.tint-bright"]!], ["foam", dark["extra.tint-pale"]!], ["abyss", dark["extra.on-tint"]!]]);
named("extended", ["kelp", "brick", "dusk", "tide", "shoal"].map((n) => [n, dark[`accents.${n}`]!] as [string, string]));
named("night", [["text-muted-more", dark["extra.contrast-more-text-muted"]!], ["border-more", dark["extra.contrast-more-border"]!]]);
named("lamp", [["paper", light["roles.bg"]!], ["leaf", light["roles.surface"]!], ["board", light["roles.surface-raised"]!], ["edge", light["roles.border"]!], ["ink", light["roles.text"]!], ["shade", light["roles.text-muted"]!], ["on-fire", light["on-fire"]!], ["text-muted-more", light["extra.contrast-more-text-muted"]!], ["border-more", light["extra.contrast-more-border"]!]]);
named("fire-lamp", [["ember", light["accents.ember"]!], ["flame", light["accents.flame"]!], ["oil", light["accents.oil"]!]]);
named("sea-lamp", [["trough", light["extra.tint-deep"]!], ["swell", light["extra.tint"]!], ["spray", light["extra.tint-bright"]!], ["foam", light["extra.tint-pale"]!]]);
named("extended-lamp", ["kelp", "brick", "dusk", "tide", "shoal"].map((n) => [n, light[`accents.${n}`]!] as [string, string]));
named("code", [["parameter", dark["syntax.parameter"]!], ["operator", dark["syntax.operator"]!], ["punctuation", dark["syntax.punctuation"]!]]);
named("code-lamp", [["parameter", light["syntax.parameter"]!]]);
for (const mode of ["dark", "light"] as const) {
  const grp = mode === "dark" ? "ansi-dark" : "ansi-lamp";
  for (const slot of ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "bright-black", "bright-red", "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan", "bright-white"]) {
    named(grp, [[slot, core(mode)[`ansi.${slot}`]!]]);
  }
}
categorical.forEach((c) => { named("night-okabe-ito", [[c.name, c.dark]]); named("lamp-okabe-ito", [[c.name, c.light]]); });
seqDark.forEach((h, i) => named("night-teal", [[String(i + 1), h]]));
seqLight.forEach((h, i) => named("lamp-teal", [[String(i + 1), h]]));
divDark.forEach((h, i) => named("night-teal-amber", [[String(i + 1), h]]));
divLight.forEach((h, i) => named("lamp-teal-amber", [[String(i + 1), h]]));

const ref = (hex: string): string => {
  const hit = byHex.get(hex);
  if (!hit) throw new Error(`${hex} has no palette entry`);
  return `{palette.${hit}}`;
};
const CODE_HUES = ["kelp", "brick", "dusk", "tide", "shoal"];

function modeBlock(mode: Mode): Record<string, unknown> {
  const v = core(mode);
  const dk = mode === "dark";
  const r = (a: string) => ref(v[a]!);
  const fire = r("accents.ember");
  const selectionHex = dk ? v["extra.tint"]! : v["extra.tint-pale"]!;
  const onFire = dk ? v["roles.bg"]! : light["on-fire"]!;
  const roles: Record<string, unknown> = {
    bg: r("roles.bg"), surface: r("roles.surface"), "surface-raised": r("roles.surface-raised"),
    text: r("roles.text"), "text-muted": r("roles.text-muted"), "text-subtle": r("roles.text-muted"),
    border: r("roles.border"),
    link: fire, "link-hover": dk ? r("accents.flame") : r("accents.oil"),
    accent: fire, "on-accent": ref(onFire), button: fire, "on-button": ref(onFire),
    focus: dk ? r("accents.flame") : fire, selection: ref(selectionHex),
    extra: {
      "accent-bright": r("accents.flame"), "accent-deep": r("accents.oil"),
      "tint-deep": r("extra.tint-deep"), tint: r("extra.tint"), "tint-bright": r("extra.tint-bright"), "tint-pale": r("extra.tint-pale"), "on-tint": r("extra.on-tint"),
      "contrast-more-text-muted": r("extra.contrast-more-text-muted"), "contrast-more-border": r("extra.contrast-more-border"),
    },
  };
  const accents: Record<string, string> = {};
  for (const n of ["ember", "flame", "oil", ...CODE_HUES]) accents[n] = r(`accents.${n}`);
  const syntax = {
    keyword: { color: r("accents.ember"), style: "bold" },
    string: r("accents.kelp"),
    number: { color: r("accents.dusk"), style: "italic" },
    comment: { color: r("roles.text-muted"), style: "italic" },
    function: r("accents.tide"),
    type: { color: r("accents.shoal"), style: "italic" },
    constant: { color: r("accents.dusk"), style: "italic" },
    variable: r("roles.text"),
    operator: r("syntax.operator"),
    punctuation: r("syntax.punctuation"),
    decorator: r("accents.brick"),
    parameter: r("syntax.parameter"),
  };
  const slots = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "bright-black", "bright-red", "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan", "bright-white"];
  const ansi = Object.fromEntries(slots.map((s) => [s, r(`ansi.${s}`)]));
  const terminal = Object.fromEntries(["background", "foreground", "cursor", "cursor-text", "selection-background", "selection-foreground"].map((k) => [k, r(`terminal.${k}`)]));
  const status = { policy: "chromatic", danger: accents.brick, warning: accents.ember, success: accents.kelp, info: accents.tide, hint: accents.shoal, conflict: accents.dusk };
  const catColors = Object.fromEntries(categorical.map((c) => [c.name, ref(dk ? c.dark : c.light)]));
  const seq = (dk ? seqDark : seqLight).map(ref);
  const div = (dk ? divDark : divLight).map(ref);
  const data = {
    categorical: { label: "Okabe-Ito, lowered under the night brightness cap", colors: catColors },
    sequential: { teal: { label: "Teal, even in lightness, under the cap", colors: seq } },
    diverging: { "teal-amber": { label: "Teal and amber with a pale centre, under the cap", colors: div } },
    plot: { bg: r("roles.bg"), grid: r("roles.border"), text: r("roles.text"), muted: r("roles.text-muted") },
  };
  const surfaces = {
    editor: r("roles.bg"),
    "editor-line": r("roles.surface"),
    "editor-selection": { ref: ref(selectionHex), alpha: 0.4, over: "surfaces.editor" },
    sidebar: r("roles.surface"),
  };
  return { label: dk ? "Try-Fire" : "Lamp-feeder", roles, accents, surfaces, syntax, ansi, terminal, status, data };
}

// Mirror the old file's structure and replace only what the repositioning changes.
const base = JSON.parse(readFileSync(join(root, "families/jungfrau/jungfrau.tokens.json"), "utf8"));
const file: any = { ...base };
file.meta = { ...base.meta, version: "2.0.0" };
file.palette = groups;
file.modes = { dark: modeBlock("dark"), light: modeBlock("light") };
delete file.exceptions;
file.rules = [
  { id: "one-hot-mark", text: "Fire is rare: one hot mark per surface.", check: "accent-only-in-roles:link,button,focus" },
  { id: "cold-field", text: "The cold sea is the field; fire is the mark." },
  { id: "night-ground", text: "The dark ground sits at a relative luminance of 0.010 to 0.012 and keeps the sea hue. Body text is 7:1 to about 8.6:1 on it." },
  { id: "no-blue-text", text: "No text role is blue. Blues appear only as dark fields." },
  { id: "brightness-cap", text: "No colour in either mode is brighter than a relative luminance of 0.45." },
  { id: "lamplight", text: "Light is lamplight, not daylight: a dimmed warm paper for reading at night, relative luminance 0.35 to 0.45." },
  { id: "no-health-claims", text: "Nothing here claims an effect on sleep or melatonin. The case is glare, halation and dark adaptation." },
];

// Pairs: the old file's rows that still describe a role, plus the terminal.
const pair = (fg: string, bg: string, kind = "text", modes?: Mode[], why?: string) => ({ fg, bg, kind, ...(modes ? { modes } : {}), ...(why ? { why } : {}) });
const hueSlots = ["red", "green", "yellow", "blue", "magenta", "cyan"];
file.pairs = [
  pair("roles.text", "roles.bg"),
  pair("roles.text-muted", "roles.bg"),
  pair("roles.accent", "roles.bg"),
  pair("roles.on-accent", "roles.accent", "text", undefined, "button text"),
  pair("extra.tint-pale", "roles.bg", "text", ["dark"]),
  pair("extra.accent-bright", "extra.tint", "component", ["dark"], "UI mark on the sea"),
  pair("extra.accent-bright", "roles.bg", "text", ["dark"], "hover text: dark hovers brighten"),
  pair("extra.accent-deep", "roles.bg", "text", ["light"], "hover text: light hovers darken"),
  pair("extra.on-tint", "extra.tint", "text", ["light"], "text on a sea field"),
  ...hueSlots.map((s) => pair(`ansi.${s}`, "terminal.background", "text", undefined, `ANSI ${s}`)),
  ...hueSlots.map((s) => pair(`ansi.bright-${s}`, "terminal.background", "large", undefined, `ANSI bright ${s}: emphasis colours`)),
];

// Distinct sets. Reinforced pairs only where a style difference (bold or italic) backs them up.
const STYLE: Record<string, string> = { keyword: "bold", number: "italic", constant: "italic", type: "italic", comment: "italic" };
function lightReinforced(): [string, string][] {
  const roles = ["keyword", "string", "number", "function", "type", "constant", "decorator"];
  const colourOf = (role: string) => light[`accents.${({ keyword: "ember", string: "kelp", number: "dusk", function: "tide", type: "shoal", constant: "dusk", decorator: "brick" } as Record<string, string>)[role]}`]!;
  const out: [string, string][] = [];
  for (let i = 0; i < roles.length; i++) {
    for (let j = i + 1; j < roles.length; j++) {
      const a = roles[i]!;
      const b = roles[j]!;
      if (colourOf(a) === colourOf(b)) continue;
      const short = VIEWS.slice(1).some((v) => oklabDistance(simulateCvd(colourOf(a), v, 1), simulateCvd(colourOf(b), v, 1)) < 0.06);
      if (short && (STYLE[a] ?? "upright") !== (STYLE[b] ?? "upright")) out.push([a, b]);
    }
  }
  return out;
}
file.distinct = [
  { id: "fire-trio", members: ["accents.ember", "accents.flame", "accents.oil"], note: "Ember, flame and oil are one ramp in two modes. In the old light mode flame and oil were both #7A3A10; each has its own value now." },
  { id: "syntax-hues-dark", set: "syntax-hues", modes: ["dark"], aliases: [["number", "constant"]] },
  { id: "syntax-hues-light", set: "syntax-hues", modes: ["light"], aliases: [["number", "constant"]], cvd: "report", reinforced: lightReinforced(), by: "style: keyword is bold, number, constant and type are italic, the rest upright", note: "Lamplight caps every text colour near luminance 0.05, which leaves little room to tell hues apart under CVD. Pairs with a style difference are reinforced; the rest are reported." },
  { id: "ansi-hues", set: "ansi-hues", cvd: "report", note: "Terminals give no way to reinforce a hue, so CVD results for the six hue slots are warnings. The normal-vision distance is a gate." },
];

// ---------------------------------------------------------------------------------------------
// Check the gates through the harness, then write
// ---------------------------------------------------------------------------------------------
import { buildReport, failures } from "../../lib/harness/index.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { differences } from "../../tests/shared/legacy.ts";
import type { Change } from "../../tests/shared/legacy.ts";

const fresh = resolveFamily(file);
const report = buildReport(fresh, thresholds);
console.log("\nharness");
for (const [p, r] of Object.entries(report.profiles)) {
  console.log(`  ${p.padEnd(14)} ${r.status.padEnd(6)} ${r.errors} errors, ${r.warnings} warnings`);
  for (const d of failures(r.checks)) console.log(`     error: ${d.slice(0, 210)}`);
}
for (const [p, r] of Object.entries(report.profiles)) for (const d of failures(r.checks, "warn")) console.log(`     warn ${p}: ${d.slice(0, 210)}`);

if (WRITE) {
  // Every address whose colour changed, old and new, for the tables and the changelog.
  const before: { mode: Mode; address: string; from: string; to: string }[] = [];
  for (const m of ["dark", "light"] as const) {
    for (const [address, c] of fresh.modes[m].colours) {
      const prev = old.modes[m].colours.get(address);
      if (!prev || prev.hex !== c.hex) before.push({ mode: m, address, from: prev?.hex ?? "", to: c.hex });
    }
  }
  const why = (mode: Mode, address: string): string => {
    const lamp = mode === "light";
    if (lamp) {
      if (/^roles\.(bg|surface|surface-raised|border)$/.test(address) || address.startsWith("surfaces.")) return "Jungfrau 2.0.0, lamplight: the light mode is a dimmed warm paper for night reading, luminance 0.399 (band 0.35 to 0.45); surfaces step up under the 0.45 cap.";
      if (/^roles\.text/.test(address) || address === "syntax.variable") return "Jungfrau 2.0.0, lamplight: ink on the dimmed paper at 8.07:1 (7:1 needed); muted text at 5.23:1.";
      return "Jungfrau 2.0.0, lamplight: re-derived for the dimmed paper so text reaches AA on it and nothing exceeds luminance 0.45; hues are as far apart as the dark values allow.";
    }
    if (/^roles\.(bg|surface|surface-raised|border)$/.test(address) || address.startsWith("surfaces.")) return "Jungfrau 2.0.0 (D11): the ground moves to luminance 0.0108 (target 0.010 to 0.012) and keeps the sea hue; surfaces and border follow in steps.";
    if (/^roles\.text/.test(address)) return "Jungfrau 2.0.0: body text brought from 15.79:1 to 7.61:1 (band 7:1 to 11:1) and under the luminance cap 0.45; muted text stays above AA.";
    if (address.startsWith("ansi.") || address.startsWith("terminal.")) return "Jungfrau 2.0.0: the terminal set follows the retuned hues, nothing above luminance 0.45, no blue text (ANSI blue is a slate at chroma 0.034).";
    if (address.startsWith("data.")) return "Jungfrau 2.0.0: the data scales are re-derived under the brightness cap.";
    return "Jungfrau 2.0.0: retuned for the night band: ember raised to 4.5:1 on the current line, code hues moved out of the blue range, under the cap, apart from each other under normal vision and CVD.";
  };
  const changes: Change[] = differences("jungfrau", fresh).map((d) => ({ mode: d.mode, address: d.address, from: d.was, to: d.now!, why: why(d.mode, d.address) }));
  const literals = new Set<string>();
  (function walk(o: unknown) { if (typeof o === "string") { if (/^#[0-9a-fA-F]{6}$/.test(o)) literals.add(o.toUpperCase()); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") Object.values(o).forEach(walk); })(legacy);
  const inPalette = new Set([...fresh.palette.values()].map((c) => c.hex));
  const replaced = new Set(changes.map((c) => c.from));
  const dropped = Object.fromEntries([...literals].filter((h) => !inPalette.has(h) && !replaced.has(h)).sort().map((h) => [h, "Retired by the Jungfrau 2.0.0 repositioning: an old night value that no role uses any more."]));

  const pathTokens = join(root, "families/jungfrau/jungfrau.tokens.json");
  writeFileSync(pathTokens, prettyJson(file) + "\n");
  writeFileSync(join(root, "tests/shared/expected-changes/jungfrau.json"), JSON.stringify(changes, null, 2) + "\n");
  const droppedPath = join(root, "tests/shared/migration-dropped.json");
  const allDropped = JSON.parse(readFileSync(droppedPath, "utf8"));
  allDropped.jungfrau = dropped;
  writeFileSync(droppedPath, JSON.stringify(allDropped, null, 2) + "\n");
  mkdirSync(join(root, "docs/migration/phase2"), { recursive: true });
  writeFileSync(join(root, "docs/migration/phase2/jungfrau-before-after.json"), JSON.stringify(before, null, 2) + "\n");
  console.log(`\nwrote ${pathTokens}\n${changes.length} recorded changes, ${Object.keys(dropped).length} retired literals, ${before.length} changed addresses`);
}

/** Objects expanded, short arrays of scalars on one line: the format the migration wrote. */
function prettyJson(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const pad1 = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    const flat = JSON.stringify(value);
    if (value.every((x) => typeof x !== "object" || x === null) && flat.length <= 96) return flat;
    return `[\n${value.map((x) => pad1 + prettyJson(x, indent + 1)).join(",\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const flat = JSON.stringify(value);
    const small = entries.every(([, x]) => typeof x !== "object" || x === null);
    if (small && flat.length <= 96 && indent > 2) return flat;
    return `{\n${entries.map(([k, x]) => `${pad1}${JSON.stringify(k)}: ${prettyJson(x, indent + 1)}`).join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}
