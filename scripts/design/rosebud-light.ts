// Rosebud's light terminal (decision D3): how the light ANSI set was authored, the checks on the
// light syntax and terminal chrome, and the record of every value that changed from the original.
//
// Ambergris 0.3.0 shipped dark ports only. The old site filled the light terminal by reusing the
// dark slots (problem P12: most of them fall far below 4.5:1 on the light ground) and the light
// syntax by a contrast mirror of the dark greys. D3 builds the light ports from the rules of the
// main branch: syntax stays achromatic, and the functional hues are retuned for light grounds.
//
// Method. The gates are the WCAG values in tests/environments.json, on the light terminal background.
// - Red, green, yellow, blue and magenta: take the dark slot (palette group ansi-dark) in OKLCH,
//   keep the hue angle and the chroma (capped at 0.10, near the accent's, so a screen of colour
//   still reads near-monochrome), and lower the lightness until the colour clears 4.5:1. The bright
//   slot keeps its own dark hue and chroma and sits above the new normal slot by the lightness step
//   it has in the dark set; it must clear 3:1 and stay 0.04 to 0.08 lighter.
// - Cyan is the accent: the lightest pair of adjacent accent steps that clears 4.5:1 and 3:1 with a
//   bright step of 0.04 to 0.08.
// - The greys come from the grey ramp (GREYS, with the reasons).
// - The six hue slots keep a normal-vision OKLab distance of at least 0.06 (the ansi-hues set).
// Syntax and the terminal chrome are checked, not changed.
//
// The script fails before writing anything if the token file does not hold the derived values, a
// gate fails or a rule check fails. Otherwise it prints the tables the README and the changelog
// quote and writes tests/shared/expected-changes/rosebud.json.
//
//   node scripts/design/rosebud-light.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { contrastRatio, fromOklch, minPairwise, oklabDistance, simulateCvd, toOklab, toOklch } from "../../lib/colour/index.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { runRuleChecks } from "../../lib/model/checks.ts";
import { at, flattenOver, resolveFamily } from "../../lib/model/resolve.ts";
import { ANSI_HUES, ANSI_SLOTS, MODES, SYNTAX_ROLES } from "../../lib/model/types.ts";
import { differences, pairsFor, readJson, snapshotOf } from "../../tests/shared/legacy.ts";
import type { Change } from "../../tests/shared/legacy.ts";

const thresholds = readJson("tests/environments.json");
const TEXT: number = thresholds.common.wcag.text.value;
const LARGE: number = thresholds.common.wcag.large.value;
const DISTANCE: number = thresholds.common.distinct.minDistance.value;
const SEVERITY: number = thresholds.common.cvd.severity.value;
const MARGIN = 0.005; // as in pequod-corrections.ts: stay clear of the gate
const CHROMA_CAP = 0.1;
const STEP_MIN = 0.04;
const STEP_MAX = 0.08;
const HUES = ["red", "green", "yellow", "blue", "magenta"];

// Black stays the terminal foreground, as in the dark set. White is the lightest grey step that
// clears 4.5:1: programs that print white text expect a dark background, and a mid grey keeps that
// text readable. Bright white is the lightest step that clears 3:1. Bright black sits between them,
// so dim text (shell autosuggestions, for one) stays lighter than the foreground and the four greys
// stay distinct.
const GREYS: Record<string, string> = { black: "grey.950", white: "grey.700", "bright-black": "grey.600", "bright-white": "grey.500" };
const GREY_REASONS: Record<string, string> = {
  black: "the terminal foreground, as in the dark set",
  white: "the lightest grey step that clears 4.5:1, so white text stays readable",
  "bright-black": "grey.700 is now white, so bright black takes the next step: dimmer than the foreground, distinct from white and bright white",
  "bright-white": "the lightest grey step that clears 3:1",
};

const loaded = loadFamilies().find((f) => f.dir === "rosebud");
if (!loaded) throw new Error("families/rosebud/rosebud.tokens.json not found");
const file = loaded.file;
const family = resolveFamily(file);
const { dark, light } = family.modes;

const paletteHex = (key: string): string => {
  const c = family.palette.get(key);
  if (!c) throw new Error(`no palette entry ${key}`);
  return c.hex;
};
const ground = at(light, "terminal.background").hex;
const contrast = (hex: string): number => contrastRatio(hex, ground);
const lightness = (hex: string): number => toOklab(hex).L;
const ratio = (hex: string): string => `${contrast(hex).toFixed(1)}:1`;
const gateOf = (slot: string): number => (slot.startsWith("bright-") ? LARGE : TEXT);

const failures: string[] = [];
const check = (ok: boolean, message: string): void => {
  if (!ok) failures.push(message);
};

// The five hue slots and their bright forms.
const derived: Record<string, string> = {};
const plannedStep: Record<string, number> = {};
for (const slot of HUES) {
  const normal = toOklch(paletteHex(`ansi-dark.${slot}`));
  const bright = toOklch(paletteHex(`ansi-dark.bright-${slot}`));
  let L = normal.L;
  let hex = fromOklch(L, Math.min(normal.C, CHROMA_CAP), normal.h);
  while (contrast(hex) < TEXT + MARGIN) {
    L -= 0.001;
    hex = fromOklch(L, Math.min(normal.C, CHROMA_CAP), normal.h);
  }
  derived[slot] = hex;
  plannedStep[slot] = bright.L - normal.L;
  derived[`bright-${slot}`] = fromOklch(L + plannedStep[slot], Math.min(bright.C, CHROMA_CAP), bright.h);
}

// Cyan: accent steps from the lightest to the darkest. Each adjacent pair is (bright, normal); the
// lightest pair that fits is taken.
const accentSteps = Object.keys(file.palette.accent ?? {})
  .map((k) => `accent.${k}`)
  .sort((a, b) => lightness(paletteHex(b)) - lightness(paletteHex(a)));
console.log(`Cyan: adjacent accent steps whose darker step clears ${TEXT}:1 on the light terminal (${ground})`);
console.log("normal       bright       normal  bright  step");
let cyan: [string, string] | undefined;
for (let i = 0; i + 1 < accentSteps.length && !cyan; i++) {
  const bright = accentSteps[i]!;
  const normal = accentSteps[i + 1]!;
  if (contrast(paletteHex(normal)) < TEXT + MARGIN) continue;
  const step = lightness(paletteHex(bright)) - lightness(paletteHex(normal));
  const fits = contrast(paletteHex(bright)) >= LARGE + MARGIN && step >= STEP_MIN && step <= STEP_MAX;
  console.log(normal.padEnd(12), bright.padEnd(12), ratio(paletteHex(normal)).padStart(6), ratio(paletteHex(bright)).padStart(7), step.toFixed(3).padStart(6), fits ? " chosen" : "");
  if (fits) cyan = [normal, bright];
}
if (!cyan) throw new Error(`no pair of accent steps clears ${TEXT}:1 and ${LARGE}:1 with a bright step of ${STEP_MIN} to ${STEP_MAX}`);

// The references the token file must hold.
const expected: Record<string, string> = { cyan: `{palette.${cyan[0]}}`, "bright-cyan": `{palette.${cyan[1]}}` };
for (const slot of HUES) {
  expected[slot] = `{palette.ansi-light.${slot}}`;
  expected[`bright-${slot}`] = `{palette.ansi-light.bright-${slot}}`;
}
for (const [slot, key] of Object.entries(GREYS)) expected[slot] = `{palette.${key}}`;
for (const slot of ANSI_SLOTS) {
  const ref = file.modes.light.ansi?.[slot];
  check(ref === expected[slot], `modes.light.ansi.${slot} is ${ref}, the method gives ${expected[slot]}`);
}
for (const [slot, hex] of Object.entries(derived)) {
  const held = file.palette["ansi-light"]?.[slot];
  check(held === hex, `palette.ansi-light.${slot} is ${JSON.stringify(held)}, the method gives ${hex}`);
}

// Gates on what the token file resolves to.
const slotHex = (slot: string): string => at(light, `ansi.${slot}`).hex;
for (const slot of ANSI_SLOTS) check(contrast(slotHex(slot)) >= gateOf(slot), `light ansi.${slot} is ${ratio(slotHex(slot))}, needs ${gateOf(slot)}:1`);
for (const slot of ANSI_HUES) {
  const step = lightness(slotHex(`bright-${slot}`)) - lightness(slotHex(slot));
  check(step >= STEP_MIN && step <= STEP_MAX, `light bright-${slot} is ${step.toFixed(3)} lighter than ${slot}, needs ${STEP_MIN} to ${STEP_MAX}`);
}
for (const slot of ["black", "white"]) {
  check(lightness(slotHex(`bright-${slot}`)) > lightness(slotHex(slot)), `light bright-${slot} is not lighter than ${slot}`);
}
check(new Set(Object.keys(GREYS).map(slotHex)).size === 4, "the four light greys are not distinct");
const hues = minPairwise(ANSI_HUES.map(slotHex));
check(hues.min >= DISTANCE, `light ansi-hues: ${ANSI_HUES[hues.pair[0]]} and ${ANSI_HUES[hues.pair[1]]} are ${hues.min.toFixed(4)} apart, needs ${DISTANCE}`);

// Syntax: each light role clears 4.5:1 on the light background and keeps the dark order of
// prominence (weakly: roles that share a grey in dark share one in light) and the dark style.
const page = at(light, "roles.bg").hex;
const darkPage = at(dark, "roles.bg").hex;
const syntax = (mode: typeof dark, role: string) => at(mode, `syntax.${role}`);
for (const role of SYNTAX_ROLES) {
  check(contrastRatio(syntax(light, role).hex, page) >= TEXT, `light syntax.${role} is below ${TEXT}:1 on roles.bg`);
  check(syntax(light, role).style === syntax(dark, role).style, `light syntax.${role} has style ${syntax(light, role).style}, dark has ${syntax(dark, role).style}`);
  for (const other of SYNTAX_ROLES) {
    // In dark, more lightness is more prominence; in light, less lightness is.
    const inDark = lightness(syntax(dark, role).hex) - lightness(syntax(dark, other).hex);
    const inLight = lightness(syntax(light, other).hex) - lightness(syntax(light, role).hex);
    if (inDark > 0) check(inLight >= 0, `syntax.${role} stands out more than syntax.${other} in dark but less in light`);
    if (inDark === 0) check(inLight === 0, `syntax.${role} and syntax.${other} share a grey in dark but not in light`);
  }
}

// Terminal chrome: the text on each chrome surface, and the selection, which in both modes is the
// accent at 24 per cent (alpha-accent.24) drawn over the terminal background.
const accentSelection = family.palette.get("alpha-accent.24");
if (!accentSelection) throw new Error("no palette entry alpha-accent.24");
const chrome: [string, string][] = [["foreground", "background"], ["cursor-text", "cursor"], ["selection-foreground", "selection-background"]];
for (const m of MODES) {
  const t = (key: string) => at(family.modes[m], `terminal.${key}`).hex;
  for (const [fg, bg] of chrome) check(contrastRatio(t(fg), t(bg)) >= TEXT, `${m} terminal.${fg} on terminal.${bg} is below ${TEXT}:1`);
  check(t("selection-background") === flattenOver(accentSelection, t("background")), `${m} terminal.selection-background is not alpha-accent.24 over the background`);
}

// The four rules, among them rule 4, whose check must cover ansi-light as well as ansi-dark.
for (const rule of runRuleChecks(family)) for (const f of rule.failures) failures.push(`rule ${rule.id} (${rule.check}): ${f}`);
const functional = file.rules?.find((r) => r.id === "functional-hues-in-content")?.check;
check(String(functional).includes("ansi-light"), `rule functional-hues-in-content checks ${functional}, which leaves out ansi-light`);

if (failures.length > 0) {
  console.error(`\n${failures.length} problems; nothing written:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}

// Tables.
const snapshot = snapshotOf("rosebud");
const oldLight = new Map(pairsFor(snapshot, family, "light").map((p) => [p.address, p.was]));
const oklch = (hex: string): string => {
  const c = toOklch(hex);
  return `oklch(${c.L.toFixed(3)} ${c.C.toFixed(3)} ${c.h.toFixed(1)})`;
};
console.log(`\nLight ANSI on terminal.background (${at(light, "terminal.background").from}, ${ground})`);
console.log("slot            old      new      contrast old   new  gate  palette entry              new in OKLCH");
for (const slot of ANSI_SLOTS) {
  const was = oldLight.get(`ansi.${slot}`)!;
  const now = slotHex(slot);
  console.log(
    slot.padEnd(15), was, now === was ? "(same) " : now, " ", contrast(was).toFixed(2).padStart(11), contrast(now).toFixed(2).padStart(5),
    ` ${gateOf(slot)}`.padEnd(5), at(light, `ansi.${slot}`).from.padEnd(26), oklch(now),
  );
}
console.log("\nBright steps in OKLab lightness, dark and light");
for (const slot of ANSI_HUES) {
  const step = (mode: typeof dark) => lightness(at(mode, `ansi.bright-${slot}`).hex) - lightness(at(mode, `ansi.${slot}`).hex);
  console.log(slot.padEnd(8), step(dark).toFixed(3), step(light).toFixed(3));
}

console.log(`\nSyntax: dark on roles.bg (${darkPage}), light on roles.bg (${page})`);
console.log("role         dark      contrast  light     contrast  style");
for (const role of SYNTAX_ROLES) {
  const d = syntax(dark, role);
  const l = syntax(light, role);
  console.log(role.padEnd(12), d.from.padEnd(9), contrastRatio(d.hex, darkPage).toFixed(2).padStart(8), " ", l.from.padEnd(9), contrastRatio(l.hex, page).toFixed(2).padStart(8), " ", l.style ?? "");
}

console.log("\nTerminal chrome");
for (const m of MODES) {
  const t = (key: string) => at(family.modes[m], `terminal.${key}`);
  for (const [fg, bg] of chrome) console.log(m.padEnd(6), `${fg} (${t(fg).from}) on ${bg} (${t(bg).from}):`, contrastRatio(t(fg).hex, t(bg).hex).toFixed(2));
  console.log(m.padEnd(6), `selection-background against background: ${contrastRatio(t("selection-background").hex, t("background").hex).toFixed(2)}`);
}

console.log(`\nansi-hues, smallest pairwise OKLab distance (Machado 2009, severity ${SEVERITY}, linear light)`);
for (const m of MODES) {
  const hexes = ANSI_HUES.map((s) => at(family.modes[m], `ansi.${s}`).hex);
  const row = (["normal", "protan", "deutan", "tritan"] as const).map((view) => {
    const mp = minPairwise(hexes, oklabDistance, view === "normal" ? undefined : (h) => simulateCvd(h, view, SEVERITY));
    return `${view} ${mp.min.toFixed(3)} (${ANSI_HUES[mp.pair[0]]}, ${ANSI_HUES[mp.pair[1]]})`;
  });
  console.log(m.padEnd(6), row.join("  "));
}

// The record.
function why(slot: string, was: string, now: string): string {
  const darkSlot = at(dark, `ansi.${slot}`);
  if (darkSlot.hex !== was) throw new Error(`light ansi.${slot} was ${was}, which is not the dark slot; write its reason by hand`);
  const failed = contrast(was) < gateOf(slot) ? "P12: " : "";
  const old = `${failed}the old site reused the dark slot (${darkSlot.from}), ${ratio(was)} on the light terminal`;
  const entry = `${at(light, `ansi.${slot}`).from}, ${ratio(now)}`;
  const hue = slot.replace("bright-", "");
  if (HUES.includes(hue)) {
    return slot === hue
      ? `${old}; D3: ${entry}, the dark hue and chroma with the lightness lowered until it clears ${TEXT}:1`
      : `${old}; D3: ${entry}, the dark hue and chroma, ${plannedStep[hue]!.toFixed(2)} lighter than ${hue} as in the dark set; bright slots are emphasis colours, held at ${LARGE}:1`;
  }
  if (hue === "cyan") return `${old}; D3: ${entry}; cyan and bright cyan are the lightest pair of accent steps that clears ${TEXT}:1 and ${LARGE}:1 with a bright step of ${STEP_MIN} to ${STEP_MAX}`;
  return `${old}; D3: ${entry}, ${GREY_REASONS[slot]}`;
}

const changes: Change[] = differences("rosebud", family).map((d) => {
  if (d.mode !== "light" || !d.address.startsWith("ansi.") || d.now === undefined) {
    throw new Error(`${d.mode} ${d.address} changed (${d.was} to ${d.now}) and this script records no reason for it`);
  }
  return { mode: d.mode, address: d.address, from: d.was, to: d.now, why: why(d.address.slice("ansi.".length), d.was, d.now) };
});
const out = join(repoRoot(), "tests/shared/expected-changes/rosebud.json");
writeFileSync(out, JSON.stringify(changes, null, 2) + "\n");
console.log(`\nrecorded ${changes.length} changes in tests/shared/expected-changes/rosebud.json`);
