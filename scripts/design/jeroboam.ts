// Jeroboam 0.1.0, clinical status for professionals. The record of how every value was chosen.
//
//   node scripts/design/jeroboam.ts                       print the derivation, run the harness, stop on any difference or failure
//   node scripts/design/jeroboam.ts --write               write families/jeroboam/jeroboam.tokens.json from the derivation
//   node scripts/design/jeroboam.ts --candidate royal-blue    the same for the second candidate (candidates/royal-blue.tokens.json)
//   node scripts/design/jeroboam.ts --refine              only the refinement of the light plans (seconds)
//   node scripts/design/jeroboam.ts --search              the grid search that fixed the order of the slots (a few minutes), then the refinement
//
// What the brief and the gates ask, turned into numbers first:
//   page      the ground is a calm, low-chroma neutral. Its luminance fixes what a border may be: the clinical profile wants every
//             border at 3:1 or more on the page, so in the light mode a border is no lighter than L* 58.7 and in the dark mode no
//             darker than L* 42.2 (see FEASIBILITY, printed from the derived page colours).
//   flags     the five Manchester hues are fixed by protocol: red 20 to 40 degrees of OKLCH hue, orange 50 to 75, yellow 95 to 115,
//             green 135 to 160, blue 240 to 265. Each flag has a border (the identity), a pale fill and a foreground.
//   print     members of a distinct set are 12 L* apart in greyscale. Five borders need 48 L* between the lightest and the darkest.
//             In the light mode the 3:1 rule stops the lightest at L* 58.7, so the darkest lands near L* 9, where the blue is a navy
//             that is close to black. The main plan pays that price and needs no reinforced pair. The royal-blue candidate lifts the
//             blue to a proper royal blue and pays with two pairs that print alike (blue and red, yellow and orange).
//   cvd       every pair of borders stays 0.06 apart in OKLab under protan, deutan and tritan simulation, with no floor.
//   text      every declared text pair holds 7:1, because print-grey holds text to 7:1 after conversion to grey.
//   red       no colour outside the declared status tokens is within 0.10 of the critical red, in OKLab.
//   chrome    ground, text, link, accent, button and focus are neutral (OKLCH chroma under 0.04). Colour means status.
//
// Colours are computed in OKLCH and gamut-mapped into sRGB by fromOklch, or read back from the token file. There is no typed copy of
// the palette in this file.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { simulateCvd } from "../../lib/colour/cvd.ts";
import { lstar } from "../../lib/colour/grey.ts";
import { fromOklch, oklabDistance, toOklab, toOklch } from "../../lib/colour/oklab.ts";
import { contrastRatio, relativeLuminance } from "../../lib/colour/wcag.ts";
import { buildReport, failures } from "../../lib/harness/index.ts";
import { loadSchema, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { validateFamily } from "../../lib/model/validate.ts";
import type { FamilyFile } from "../../lib/model/types.ts";

type Mode = "dark" | "light";
const MODES: Mode[] = ["dark", "light"];
const root = repoRoot();
const T = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8"));
const argv = process.argv.slice(2);
const CANDIDATE = argv.includes("--candidate") ? argv[argv.indexOf("--candidate") + 1] : undefined;
if (CANDIDATE !== undefined && CANDIDATE !== "royal-blue") throw new Error(`no candidate called ${CANDIDATE}; the candidates are: royal-blue`);
const FILE = join(root, CANDIDATE ? `families/jeroboam/candidates/${CANDIDATE}.tokens.json` : "families/jeroboam/jeroboam.tokens.json");

// ---------------------------------------------------------------------------------------------
// The gates that shape the design, read from tests/environments.json
// ---------------------------------------------------------------------------------------------
const STEP_LSTAR: number = T.profiles.clinical.severityStepLstar.min; // 8
const BORDER_ON_PAGE: number = T.profiles.clinical.badgeBorder.min; // 3
const PRINT_GAP: number = T.profiles["print-grey"].distinctLstar.min; // 12
const PRINT_TEXT: number = T.profiles["print-grey"].text.min; // 7
const TEXT_AIM = 8; // fg on fill: above the 7:1 print gate, with a margin
const VIEWS = ["protan", "deutan", "tritan"] as const;

const fmt = (n: number, d = 2) => n.toFixed(d);
const lch = (hex: string) => toOklch(hex);

/** The colour at this chroma cap and hue whose CIE L* is the target. fromOklch gamut-maps, so the chroma is the most the gamut allows. */
function atLstar(target: number, C: number, h: number): string {
  let lo = 0.05;
  let hi = 0.99;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (lstar(fromOklch(mid, C, h)) < target) lo = mid; else hi = mid;
  }
  return fromOklch((lo + hi) / 2, C, h);
}
const Lx = (y: number) => (y <= 216 / 24389 ? (24389 / 27) * y : 116 * Math.cbrt(y) - 16);

// ---------------------------------------------------------------------------------------------
// Neutral ground: the faded walnut tinge of chapter 71, as a hue of 72 degrees at chroma 0.006 to 0.009
// ---------------------------------------------------------------------------------------------
const WALNUT_HUE = 72;
const walnut = (L: number): string => (L >= 100 ? "#FFFFFF" : atLstar(L, L >= 90 ? 0.006 : 0.009, WALNUT_HUE));
/** Nominal L* of each step of the ramp; the step name is that number. Only the steps the roles use are in the palette. */
const RAMP = [8, 10, 11, 14, 15, 22, 24, 26, 31, 34, 43, 55, 71, 78, 84, 90, 92, 94, 96, 98, 100];
// The link and the accent are a slate ink, a neutral with a faint violet cast (chroma 0.024, hue 298). A warm neutral of the same
// lightness would sit within 0.06 of the dark red, green or navy flag after colour-vision simulation (measured 0.036 to 0.066 over
// L* 8 to 35 against the main plan); the slate keeps at least 0.079 from every flag under every view, in both modes.
const SLATE_HUE = 298;
const slate = (L: number): string => atLstar(L, 0.024, SLATE_HUE);
const SLATE_RAMP = [18, 27, 72, 84];
type Group = "walnut" | "slate";
type Step = [Group, number];
const W = (L: number): Step => ["walnut", L];
const S = (L: number): Step => ["slate", L];

// ---------------------------------------------------------------------------------------------
// The five flags. The searches are recorded below; their results are these plans.
// ---------------------------------------------------------------------------------------------
const FLAGS = ["blue", "green", "yellow", "orange", "red"] as const; // least urgent first, the order of the protocol
type Flag = (typeof FLAGS)[number];
interface Slot { h: number; L: number }
/** Hue in OKLCH degrees and border lightness in CIE L*, both as asked of the gamut mapper. Chroma is the most the gamut allows up to 0.20. */
const PLAN: Record<Mode, Record<Flag, Slot>> = {
  // Light: the result of the refinement (--refine). Dark: the result of the grid search (--search).
  light: { blue: { h: 246.0, L: 8.70 }, green: { h: 155.5, L: 33.21 }, yellow: { h: 101.7, L: 58.16 }, orange: { h: 65.4, L: 45.80 }, red: { h: 31.4, L: 20.78 } },
  dark: { blue: { h: 258, L: 43 }, green: { h: 144, L: 83 }, yellow: { h: 102, L: 96 }, orange: { h: 56, L: 69 }, red: { h: 32, L: 56 } },
};
/** The royal-blue candidate's light plan: blue with red, and yellow with orange, may print alike. The result of --refine. */
const ROYAL_LIGHT: Record<Flag, Slot> = { blue: { h: 251.9, L: 23.36 }, green: { h: 155.1, L: 35.81 }, yellow: { h: 101.6, L: 58.33 }, orange: { h: 66.0, L: 47.99 }, red: { h: 30.7, L: 23.17 } };
if (CANDIDATE === "royal-blue") PLAN.light = ROYAL_LIGHT;

const HUE_WINDOW: Record<Flag, [number, number]> = { red: [20, 40], orange: [50, 75], yellow: [95, 115], green: [135, 160], blue: [240, 265] };
const CHROMA_CAP = 0.2;

/** Fill and foreground from the border's hue: the fill is a pale tint (light) or a dark one (dark); the foreground moves away until 8:1. */
function tint(mode: Mode, slot: Slot): { border: string; fill: string; fg: string } {
  const border = atLstar(slot.L, CHROMA_CAP, slot.h);
  const fill = mode === "light" ? atLstar(95, 0.035, slot.h) : atLstar(17.5, 0.045, slot.h);
  let L = mode === "light" ? 24 : 88;
  let fg = atLstar(L, 0.09, slot.h);
  for (let i = 0; i < 60 && contrastRatio(fg, fill) < TEXT_AIM; i++) {
    L += mode === "light" ? -0.5 : 0.5;
    fg = atLstar(L, 0.09, slot.h);
  }
  return { border, fill, fg };
}
const flagColours: Record<Mode, Record<Flag, { border: string; fill: string; fg: string }>> = { dark: {} as never, light: {} as never };
for (const m of MODES) for (const f of FLAGS) flagColours[m][f] = tint(m, PLAN[m][f]);

// ---------------------------------------------------------------------------------------------
// Roles. Names are the step of the walnut ramp, so the file reads as lightness.
// ---------------------------------------------------------------------------------------------
const ROLES: Record<Mode, Record<string, Step>> = {
  light: { bg: W(96), surface: W(98), "surface-raised": W(100), text: W(10), "text-muted": W(31), "text-subtle": W(34), border: W(84), link: S(27), "link-hover": W(10), accent: S(18), "on-accent": W(98), button: W(10), "on-button": W(98), focus: W(10), selection: W(90) },
  dark: { bg: W(8), surface: W(11), "surface-raised": W(15), text: W(94), "text-muted": W(78), "text-subtle": W(71), border: W(22), link: S(84), "link-hover": W(98), accent: S(72), "on-accent": W(8), button: W(92), "on-button": W(8), focus: W(98), selection: W(24) },
};
const EXTRA_NEUTRAL: Record<Mode, Record<string, Step>> = {
  light: { "border-strong": W(43), "row-alt": W(94), "triage-white-fill": W(100), "triage-white-border": W(43), "triage-white-fg": W(10) },
  dark: { "border-strong": W(55), "row-alt": W(14), "triage-white-fill": W(15), "triage-white-border": W(55), "triage-white-fg": W(94) },
};

// ---------------------------------------------------------------------------------------------
// The two ordered lists the clinical profile reads
// ---------------------------------------------------------------------------------------------
const SEVERITY = [
  { name: "info", flag: "blue" as Flag, icon: "circle-info", label: "Information" },
  { name: "caution", flag: "yellow" as Flag, icon: "triangle-exclamation", label: "Caution" },
  { name: "critical", flag: "red" as Flag, icon: "octagon-exclamation", label: "Critical" },
];
/** The Manchester levels: number, name, colour and target time to first medical assessment, in minutes. */
const TRIAGE = [
  { name: "blue", number: 5, minutes: 240, label: "Non-urgent" },
  { name: "green", number: 4, minutes: 120, label: "Standard" },
  { name: "yellow", number: 3, minutes: 60, label: "Urgent" },
  { name: "orange", number: 2, minutes: 10, label: "Very urgent" },
  { name: "red", number: 1, minutes: 0, label: "Immediate" },
] as const;

// ---------------------------------------------------------------------------------------------
// Palette: the only place a colour value is written
// ---------------------------------------------------------------------------------------------
const palette: Record<string, Record<string, string>> = { walnut: {}, slate: {} };
const used: Record<Group, Set<number>> = { walnut: new Set(), slate: new Set() };
for (const m of MODES) for (const [g, L] of [...Object.values(ROLES[m]), ...Object.values(EXTRA_NEUTRAL[m])]) used[g].add(L);
for (const L of RAMP) if (used.walnut.has(L)) palette.walnut![`l${L}`] = walnut(L);
for (const L of SLATE_RAMP) if (used.slate.has(L)) palette.slate![`l${L}`] = slate(L);
for (const L of used.walnut) if (!RAMP.includes(L)) throw new Error(`walnut step l${L} is used but not in the ramp`);
for (const L of used.slate) if (!SLATE_RAMP.includes(L)) throw new Error(`slate step l${L} is used but not in the ramp`);
for (const f of FLAGS) {
  palette[f] = {};
  for (const m of MODES) {
    const c = flagColours[m][f];
    palette[f]![`${m}-border`] = c.border;
    palette[f]![`${m}-fill`] = c.fill;
    palette[f]![`${m}-fg`] = c.fg;
  }
}
const ref = (group: string, name: string) => `{palette.${group}.${name}}`;
const flagRef = (m: Mode, f: Flag, part: "border" | "fill" | "fg") => ref(f, `${m}-${part}`);
const stepRef = ([g, L]: Step) => ref(g, `l${L}`);

function modeBlock(m: Mode): Record<string, unknown> {
  const roles: Record<string, unknown> = {};
  for (const [k, L] of Object.entries(ROLES[m])) roles[k] = stepRef(L);
  const extra: Record<string, string> = {};
  const add = (name: string, value: string) => { extra[name] = value; };
  for (const s of SEVERITY) for (const part of ["fg", "fill", "border"] as const) add(`${s.name}-${part}`, flagRef(m, s.flag, part));
  for (const part of ["fg", "fill", "border"] as const) add(`success-${part}`, flagRef(m, "green", part));
  for (const t of TRIAGE) for (const part of ["fg", "fill", "border"] as const) add(`triage-${t.name}-${part}`, flagRef(m, t.name, part));
  for (const [k, L] of Object.entries(EXTRA_NEUTRAL[m])) add(k, stepRef(L));
  roles.extra = extra;
  return {
    roles,
    status: { policy: "chromatic", danger: flagRef(m, "red", "border"), warning: flagRef(m, "yellow", "border"), success: flagRef(m, "green", "border"), info: flagRef(m, "blue", "border") },
  };
}

const level = (name: string, prefix: string, icon: string, label: string) => ({ name, fg: `extra.${prefix}-fg`, fill: `extra.${prefix}-fill`, border: `extra.${prefix}-border`, icon, label });
const design = {
  clinical: {
    critical: "critical",
    levels: SEVERITY.map((s) => level(s.name, s.name, s.icon, s.label)),
    triage: TRIAGE.map((t) => level(t.name, `triage-${t.name}`, `number-${t.number}`, t.label)),
  },
  triage: Object.fromEntries(TRIAGE.map((t) => [t.name, { number: t.number, "target-minutes": t.minutes }])),
  alarm: { high: "critical", medium: "caution", low: "info" },
  lab: {
    low: { letter: "L", icon: "arrow-down", level: "caution" },
    high: { letter: "H", icon: "arrow-up", level: "caution" },
    "critical-low": { letter: "LL", icon: "arrow-down-double", level: "critical" },
    "critical-high": { letter: "HH", icon: "arrow-up-double", level: "critical" },
  },
  type: { features: { sans: "tnum, ss02", mono: "zero" }, weight: { regular: 400, medium: 500, bold: 700 }, scale: { small: "0.8125rem", body: "0.9375rem", value: "1.5rem", display: "2.25rem" } },
  border: { width: { hairline: "1px", flag: "2px", stripe: "6px" }, radius: { small: "4px", medium: "8px", round: "999px" } },
  focus: { width: "2px", offset: "2px" },
};

// Pairs. Every text pair holds 7:1 (print-grey); components hold 3:1.
type Kind = "text" | "large" | "component";
const pair = (fg: string, bg: string, kind: Kind, why: string, modes?: Mode[]) => ({ fg, bg, kind, ...(modes ? { modes } : {}), why });
const levelPairs = (prefix: string, what: string) => [pair(`extra.${prefix}-fg`, `extra.${prefix}-fill`, "text", `${what}: text and icon on its fill`)];
const pairs = [
  pair("roles.text", "roles.bg", "text", "body text on the page"),
  pair("roles.text", "roles.surface", "text", "body text on a card"),
  pair("roles.text", "roles.surface-raised", "text", "body text on a raised card"),
  pair("roles.text-muted", "roles.bg", "text", "secondary text on the page"),
  pair("roles.text-muted", "roles.surface", "text", "secondary text on a card"),
  pair("roles.text-subtle", "roles.bg", "text", "tertiary text on the page"),
  pair("roles.text-subtle", "roles.surface", "text", "tertiary text on a card"),
  pair("roles.link", "roles.bg", "text", "link on the page"),
  pair("roles.link", "roles.surface", "text", "link on a card"),
  pair("roles.link-hover", "roles.bg", "text", "link on hover"),
  pair("roles.on-accent", "roles.accent", "text", "text on the accent"),
  pair("roles.on-button", "roles.button", "text", "button label"),
  pair("roles.accent", "roles.bg", "component", "accent rule or marker on the page"),
  pair("roles.focus", "roles.bg", "component", "focus ring on the page"),
  pair("roles.focus", "roles.surface", "component", "focus ring on a card"),
  pair("extra.border-strong", "roles.bg", "component", "control outline on the page"),
  pair("extra.border-strong", "roles.surface", "component", "control outline on a card"),
  pair("roles.text", "roles.selection", "text", "selected text"),
  pair("roles.text", "extra.row-alt", "text", "table text on an alternate row"),
  pair("roles.text-muted", "extra.row-alt", "text", "table units and ranges on an alternate row"),
  ...SEVERITY.flatMap((s) => levelPairs(s.name, `severity ${s.name}`)),
  ...levelPairs("success", "success"),
  ...TRIAGE.flatMap((t) => levelPairs(`triage-${t.name}`, `triage ${t.name}`)),
  ...levelPairs("triage-white", "triage white"),
];

// Distinct sets. Colour vision has no floor and no `cvd: report`, and no set reinforces a pair for colour vision. The main plan
// reinforces nothing at all. The royal-blue candidate reinforces pairs for print only, and only in the light mode. The notes quote
// numbers that the derivation measures, so they cannot drift from the colours.
const pageLight = walnut(ROLES.light.bg![1]);
const limitLight = Lx((relativeLuminance(pageLight) + 0.05) / BORDER_ON_PAGE - 0.05);
const gapLight = (a: Flag, b: Flag) => Math.abs(lstar(flagColours.light[a].border) - lstar(flagColours.light[b].border));
const aliases: [string, string][] = [
  ["extra.info-border", "extra.triage-blue-border"],
  ["extra.caution-border", "extra.triage-yellow-border"],
  ["extra.critical-border", "extra.triage-red-border"],
  ["extra.success-border", "extra.triage-green-border"],
];
const triageBorders = TRIAGE.map((t) => `extra.triage-${t.name}-border`);
const royal = CANDIDATE === "royal-blue";
const severityBorders = ["extra.info-border", "extra.caution-border", "extra.critical-border"];
const distinct = [
  {
    id: "flags",
    members: ["extra.info-border", "extra.caution-border", "extra.critical-border", "extra.success-border", ...triageBorders],
    aliases,
    note: "Every status and triage border, severity first and then the protocol order. The severity borders reuse the triage colours on purpose: info is the blue, caution the yellow, critical the red, success the green. Gated under normal vision and protan, deutan and tritan simulation, with no reinforced pair and no floor.",
  },
  ...(royal
    ? [
        { id: "severity-dark", members: severityBorders, modes: ["dark"], for: ["print-grey"], note: "In the dark mode the three severity borders are at least 12 L* apart in greyscale." },
        {
          id: "severity-light",
          members: severityBorders,
          modes: ["light"],
          for: ["print-grey"],
          reinforced: [["extra.info-border", "extra.critical-border"]],
          by: "the icon and the word on every alert: a circle for information, an octagon for critical",
          note: `In the light mode the information and critical borders are ${fmt(gapLight("blue", "red"), 1)} L* apart in greyscale, the same grey for print.`,
        },
      ]
    : [{ id: "severity", members: severityBorders, for: ["print-grey"], note: "The three severity borders are at least 12 L* apart in greyscale in both modes." }]),
  {
    id: "triage-dark",
    members: triageBorders,
    modes: ["dark"],
    for: ["print-grey"],
    note: "In the dark mode the five triage borders are at least 12 L* apart in greyscale, with no reinforced pair.",
  },
  royal
    ? {
        id: "triage-light",
        members: triageBorders,
        modes: ["light"],
        for: ["print-grey"],
        reinforced: [["extra.triage-yellow-border", "extra.triage-orange-border"], ["extra.triage-blue-border", "extra.triage-red-border"]],
        by: "the protocol number and the word on every triage row, and the fixed queue order from 1 to 5",
        note: `This candidate lifts the light-mode blue to a royal blue. Blue and red then print as the same grey (${fmt(gapLight("blue", "red"), 1)} L* apart) and yellow and orange as near greys (${fmt(gapLight("yellow", "orange"), 1)} L*), both under the 12 that print-grey asks. The other eight pairs are 12 L* or more apart. Every pair is told apart under colour vision deficiency by colour alone (see the flags set).`,
      }
    : {
        id: "triage-light",
        members: triageBorders,
        modes: ["light"],
        for: ["print-grey"],
        note: `In the light mode all ten pairs of triage borders are at least 12 L* apart in greyscale, with no reinforced pair. The 3:1 rule stops yellow at about L* ${fmt(limitLight, 1)}, so the five borders reach down to a blue of L* ${fmt(lstar(flagColours.light.blue.border), 1)}. The price is in the colours: the blue is a navy close to black and the red a dark maroon.`,
      },
  {
    id: "link-and-accent",
    members: ["roles.link", "roles.accent", ...triageBorders],
    note: "The link and the accent are neutral inks. They are told apart from every status and triage hue, under normal vision and under each simulation.",
  },
];

const rules = [
  { id: "red-reserved", text: "Red is reserved for critical and immediate. No other colour of the family is within 0.10 of the critical red in OKLab, in either mode; the clinical profile measures every role, extra role and surface against it." },
  { id: "colour-means-status", text: "Chroma belongs to status and triage. Ground, text, link, accent, button, focus and selection are neutral, with OKLCH chroma under 0.04." },
  { id: "never-colour-alone", text: "Every level has its own icon and its own word, and every triage level has its protocol number. Colour never stands alone." },
  { id: "links-underlined", text: "Links are underlined, because their colour is an ink and not a hue. The hover darkens the link in the light mode and lightens it in the dark mode.", check: "hover-direction" },
  { id: "accent-is-a-marker", text: "The accent is a quiet marker and never a fill: no other role takes its colour.", check: "accent-only-in-roles" },
  { id: "red-and-green-by-lightness", text: "Red and green are never told apart by hue alone: the critical and standard borders differ by at least 12 L* in both modes.", check: "lightness-gap:extra.triage-red-border,extra.triage-green-border,12" },
  { id: "orange-is-triage", text: "Orange belongs to the triage scale. Alarm priorities use critical for high, caution for medium and info for low, as the design.alarm tokens say." },
  { id: "no-conformance-claim", text: "The family is a colour and type system. It does not validate a triage algorithm, a decision rule or an alarm design, and nothing here claims conformance with a protocol or with IEC 60601-1-8; the README says what was checked." },
];

const file: FamilyFile = {
  $schema: CANDIDATE ? "../../../schema/family.schema.json" : "../../schema/family.schema.json",
  meta: {
    id: "jeroboam",
    name: "Jeroboam",
    version: "0.1.0",
    chapter: 71,
    chapterTitle: "The Jeroboam's Story",
    quote: "the Jeroboam had a malignant epidemic on board",
    quotes: [
      { chapter: 71, text: "Think, think of the fevers, yellow and bilious!" },
      { chapter: 71, text: "the timid quarantine of the land" },
      { chapter: 71, text: "coat of a faded walnut tinge" },
      { chapter: 71, text: "recognise each other upon the ocean" },
    ],
    tagline: "A quiet ground, and colour only where a status is meant.",
    goal: "Clinical status for professionals: CDSS alerts, lab flags, Manchester triage, alarm priorities, and the teaching prototypes and the Doubloon game that show them.",
    environments: ["office-screen", "clinical", "cvd", "print-grey"],
    licence: { tokens: "CC-BY-4.0", code: "MIT" },
  },
  palette,
  modes: { dark: modeBlock("dark") as never, light: modeBlock("light") as never },
  typography: { sans: "Inter", mono: "JetBrains Mono" },
  design: design as never,
  pairs,
  rules,
  distinct: distinct as never,
  targets: { exclude: ["vscode", "zed", "neovim", "terminals"] },
};

// ---------------------------------------------------------------------------------------------
// The derivation as tables
// ---------------------------------------------------------------------------------------------
const fresh = resolveFamily(file);
const hexOf = (m: Mode, address: string) => fresh.modes[m].colours.get(address)!.hex;

console.log(`JEROBOAM ${CANDIDATE ? `candidate ${CANDIDATE}` : "main"}`);
console.log("\nFEASIBILITY");
for (const m of MODES) {
  const page = hexOf(m, "roles.bg");
  const Y = relativeLuminance(page);
  const limit = m === "light" ? (Y + 0.05) / BORDER_ON_PAGE - 0.05 : BORDER_ON_PAGE * (Y + 0.05) - 0.05;
  console.log(`  ${m}: page ${page} has luminance ${fmt(Y, 4)}; a border at ${BORDER_ON_PAGE}:1 is ${m === "light" ? "no lighter" : "no darker"} than luminance ${fmt(limit, 3)}, L* ${fmt(Lx(limit), 1)}`);
}
console.log(`  five borders ${PRINT_GAP} L* apart span ${4 * PRINT_GAP} L*. In the light mode, from L* ${fmt(limitLight, 1)} they reach L* ${fmt(limitLight - 4 * PRINT_GAP, 1)}, where a blue is a navy that is nearly black.`);

console.log("\nFLAG LADDER (border colours, lightest to darkest in each mode)");
for (const m of MODES) {
  const page = hexOf(m, "roles.bg");
  const rows = FLAGS.map((f) => ({ f, hex: flagColours[m][f].border })).sort((a, b) => lstar(b.hex) - lstar(a.hex));
  console.log(`  ${m}, page ${page}`);
  rows.forEach((r, i) => {
    const k = lch(r.hex);
    const next = rows[i + 1];
    const [a, b] = HUE_WINDOW[r.f];
    console.log(`    ${r.f.padEnd(7)} ${r.hex}  L* ${fmt(lstar(r.hex), 1).padStart(5)}  C ${fmt(k.C, 3)}  h ${fmt(k.h, 0).padStart(3)} (window ${a} to ${b})  ${fmt(contrastRatio(r.hex, page))}:1 on page${next ? `  gap to next ${fmt(lstar(r.hex) - lstar(next.hex), 1)} L*` : ""}`);
    if (k.h < a || k.h > b) throw new Error(`${r.f} in ${m} is outside its hue window`);
  });
}

console.log("\nFILL AND FOREGROUND");
for (const m of MODES) for (const f of FLAGS) {
  const c = flagColours[m][f];
  console.log(`  ${m.padEnd(5)} ${f.padEnd(7)} fill ${c.fill}  fg ${c.fg}  ${fmt(contrastRatio(c.fg, c.fill))}:1`);
}

console.log("\nNEUTRAL ROLES (contrast on the page)");
for (const m of MODES) {
  const page = hexOf(m, "roles.bg");
  for (const k of ["text", "text-muted", "text-subtle", "link", "accent", "button", "focus"]) {
    const hex = hexOf(m, `roles.${k}`);
    console.log(`  ${m.padEnd(5)} ${k.padEnd(12)} ${hex}  L* ${fmt(lstar(hex), 1).padStart(5)}  C ${fmt(lch(hex).C, 3)}  ${fmt(contrastRatio(hex, page))}:1`);
  }
}

// ---------------------------------------------------------------------------------------------
// Why the link and the accent are a slate ink: the smallest distance from an ink to any flag border under any view
// ---------------------------------------------------------------------------------------------
{
  const views = ["normal", ...VIEWS] as const;
  const see = (hex: string, v: (typeof views)[number]) => (v === "normal" ? hex : simulateCvd(hex, v, 1));
  const nearest = (mode: Mode, ink: string) => Math.min(...FLAGS.flatMap((f) => views.map((v) => oklabDistance(see(ink, v), see(flagColours[mode][f].border, v)))));
  console.log("\nINK CHOICE (smallest OKLab distance from an ink to any of the five flag borders, under normal vision and each simulation)");
  for (const m of MODES) {
    const [lo, hi] = m === "light" ? [8, 35] : [60, 92];
    const warm: number[] = [];
    for (let L = lo; L <= hi; L++) warm.push(nearest(m, atLstar(L, 0.012, WALNUT_HUE)));
    console.log(`  ${m}: a warm neutral (hue ${WALNUT_HUE}, chroma 0.012) over L* ${lo} to ${hi}: ${fmt(Math.min(...warm), 3)} to ${fmt(Math.max(...warm), 3)}`);
    for (const role of ["link", "accent"]) console.log(`  ${m}: ${role.padEnd(6)} ${hexOf(m, `roles.${role}`)} (slate, chroma 0.024, hue ${SLATE_HUE}): ${fmt(nearest(m, hexOf(m, `roles.${role}`)), 3)}`);
  }
}

// ---------------------------------------------------------------------------------------------
// The searches that chose the flag plans (only with --search or --refine)
// ---------------------------------------------------------------------------------------------
// The grid search (--search) fixes the order of the slots. Hard: border 3:1 on the page, every pair at least 0.062 apart under each
// simulation and normal vision, list neighbours 8.5 L* apart. Objective: fewest pairs under 12 L*, then the largest smallest gap, then
// the most chroma. Light ranges are the lightnesses at which a hue still reads as itself with a dark border on a pale page: yellow
// 54 to 60, orange 44 to 60, red 24 to 52, green 22 to 60, blue 10 to 60. On this grid of hues the best light plan still has one pair
// under 12 L*, yellow and orange at 9.1 L*; the refinement below, which also moves the hues, removes it. Dark ranges: yellow 70 to 97,
// orange 60 to 92, red 50 to 82, green 44 to 86, blue 43 to 80. The top dark plan has no pair under 12 L* and no gap under 13, and it is
// the recorded plan in PLAN.dark.
if (argv.includes("--search")) {
  const RANGE: Record<Mode, Record<Flag, [number, number]>> = {
    light: { yellow: [54, 60], orange: [44, 60], red: [24, 52], green: [22, 60], blue: [10, 60] },
    dark: { yellow: [70, 97], orange: [60, 92], red: [50, 82], green: [44, 86], blue: [43, 80] },
  };
  const GRID: Record<Flag, number[]> = { blue: [250, 258], green: [144, 154], yellow: [98, 102], orange: [56, 64], red: [26, 32] };
  interface Opt { flag: Flag; hue: number; hex: string; ls: number; C: number; lab: [number, number, number][] }
  for (const m of MODES) {
    const page = hexOf(m, "roles.bg");
    const stepL = 1;
    const best: { short: number; gap: number; C: number; cvd: number; text: string }[] = [];
    let count = 0;
    const hueCombos: number[][] = [];
    for (const b of GRID.blue) for (const g of GRID.green) for (const y of GRID.yellow) for (const o of GRID.orange) for (const r of GRID.red) hueCombos.push([b, g, y, o, r]);
    for (const hc of hueCombos) {
      const sets = FLAGS.map((f, i) => {
        const [a, b] = RANGE[m][f];
        const list: Opt[] = [];
        for (let L = a; L <= b + 1e-9; L += stepL) {
          const hex = atLstar(L, CHROMA_CAP, hc[i]!);
          if (contrastRatio(hex, page) < BORDER_ON_PAGE + 0.03) continue;
          const lab = (["normal", ...VIEWS] as const).map((v) => { const o = toOklab(v === "normal" ? hex : simulateCvd(hex, v, 1)); return [o.L, o.a, o.b] as [number, number, number]; });
          list.push({ flag: f, hue: hc[i]!, hex, ls: lstar(hex), C: lch(hex).C, lab });
        }
        return list;
      });
      const dist = (p: Opt, q: Opt) => {
        let least = Infinity;
        for (let v = 0; v < 4; v++) {
          const a = p.lab[v]!;
          const b = q.lab[v]!;
          const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
          if (d < least) least = d;
        }
        return Math.sqrt(least);
      };
      const choose = (i: number, picked: Opt[]) => {
        if (i === 5) {
          let gap = Infinity;
          let cvd = Infinity;
          let short = 0;
          for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) {
            const g = Math.abs(picked[a]!.ls - picked[b]!.ls);
            gap = Math.min(gap, g);
            cvd = Math.min(cvd, dist(picked[a]!, picked[b]!));
            if (g < PRINT_GAP) short++;
          }
          count++;
          const C = picked.reduce((s, p) => s + p.C, 0);
          const row = { short, gap, C, cvd, text: picked.map((p) => `${p.flag[0]}${p.hue}/${p.ls.toFixed(0)} ${p.hex}`).join("  ") };
          // Light: the fewest pairs under 12 L*, then the largest smallest gap. Dark has room, so once every gap is 13 L* or more the
          // most chroma wins.
          const better = m === "light"
            ? (x: typeof row, y: typeof row) => x.short - y.short || y.gap - x.gap || y.C - x.C
            : (x: typeof row, y: typeof row) => x.short - y.short || Number(y.gap >= 13) - Number(x.gap >= 13) || (x.gap >= 13 && y.gap >= 13 ? y.C - x.C : y.gap - x.gap);
          if (best.length >= 6 && better(row, best[best.length - 1]!) >= 0) return;
          best.push(row);
          best.sort(better);
          if (best.length > 6) best.pop();
          return;
        }
        for (const o of sets[i]!) {
          let ok = true;
          for (let k = 0; k < picked.length && ok; k++) {
            if (dist(picked[k]!, o) < 0.062) ok = false;
            if (k === i - 1 && Math.abs(picked[k]!.ls - o.ls) < STEP_LSTAR + 0.5) ok = false;
          }
          if (!ok) continue;
          picked.push(o);
          choose(i + 1, picked);
          picked.pop();
        }
      };
      choose(0, []);
    }
    console.log(`\nSEARCH ${m}: ${count} admissible plans. ${m === "light" ? `Best by fewest pairs under ${PRINT_GAP} L*, then largest smallest gap, then chroma` : `Best by fewest pairs under ${PRINT_GAP} L*, then every gap at 13 L* or more, then chroma`}:`);
    for (const r of best) console.log(`  short ${r.short}  gap ${fmt(r.gap, 1)}  cvd ${fmt(r.cvd, 3)}  C ${fmt(r.C)}  ${r.text}`);
  }
}

// The refinement (--refine): a hill-climb that moves each flag's lightness and hue in small steps, inside the hue windows of the brief
// (judged on the final colour, not the request), to raise the smallest colour-vision distance and then the lightness of red, green and
// blue. Hard: border 3.05:1 on the page, list neighbours 8.4 L* apart, every pair but the exempt ones 12.05 L* apart. The main plan
// exempts no pair. The royal-blue candidate exempts two, blue with red and yellow with orange, and so may lift the blue. The random
// numbers come from a fixed seed, so the run is repeatable.
if (argv.includes("--search") || argv.includes("--refine")) {
  const page = pageLight;
  const WIN: Record<Flag, [number, number]> = { blue: [246, 258], green: [140, 156], yellow: [96, 104], orange: [56, 66], red: [24, 32] };
  const LR: Record<Flag, [number, number]> = { blue: [8, 40], green: [18, 50], yellow: [54, 60], orange: [40, 56], red: [18, 45] };
  interface S { L: Record<Flag, number>; h: Record<Flag, number> }
  const cache = new Map<string, { hex: string; ls: number; h: number; lab: [number, number, number][] }>();
  const colour = (L: number, h: number) => {
    const key = `${L.toFixed(2)}|${h.toFixed(1)}`;
    let c = cache.get(key);
    if (!c) {
      const hex = atLstar(L, CHROMA_CAP, h);
      const lab = (["normal", ...VIEWS] as const).map((v) => { const o = toOklab(v === "normal" ? hex : simulateCvd(hex, v, 1)); return [o.L, o.a, o.b] as [number, number, number]; });
      c = { hex, ls: lstar(hex), h: lch(hex).h, lab };
      cache.set(key, c);
    }
    return c;
  };
  const q = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d; // lightness to 0.01 and hue to 0.1, so the state is what is recorded
  const refine = (name: string, exempt: [Flag, Flag][], ranges: Record<Flag, [number, number]>, from: Record<Flag, Slot>) => {
    const exempted = (a: Flag, b: Flag) => exempt.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    const evaluate = (s: S) => {
      const cs = Object.fromEntries(FLAGS.map((f) => [f, colour(s.L[f], s.h[f])])) as Record<Flag, ReturnType<typeof colour>>;
      let pen = 0;
      for (const f of FLAGS) {
        const r = contrastRatio(cs[f].hex, page);
        if (r < 3.05) pen += (3.05 - r) * 20;
        if (Math.abs(cs[f].ls - s.L[f]) > 0.6) pen += Math.abs(cs[f].ls - s.L[f]);
        const [a, b] = HUE_WINDOW[f];
        if (cs[f].h < a + 1 || cs[f].h > b - 1) pen += Math.min(Math.abs(cs[f].h - a - 1), Math.abs(cs[f].h - b + 1)) + 1;
      }
      for (let i = 0; i + 1 < FLAGS.length; i++) {
        const g = Math.abs(cs[FLAGS[i]!].ls - cs[FLAGS[i + 1]!].ls);
        if (g < 8.4) pen += (8.4 - g) * 2;
      }
      let cvd = Infinity;
      let gapMin = Infinity;
      for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) {
        const a = cs[FLAGS[i]!];
        const b = cs[FLAGS[j]!];
        const gap = Math.abs(a.ls - b.ls);
        if (!exempted(FLAGS[i]!, FLAGS[j]!)) { gapMin = Math.min(gapMin, gap); if (gap < 12.05) pen += (12.05 - gap) * 3; }
        for (let v = 0; v < 4; v++) cvd = Math.min(cvd, Math.hypot(a.lab[v]![0] - b.lab[v]![0], a.lab[v]![1] - b.lab[v]![1], a.lab[v]![2] - b.lab[v]![2]));
      }
      const yo = Math.abs(cs.yellow.ls - cs.orange.ls);
      const score = Math.min(cvd, 0.075) * 400 + (s.L.red + s.L.green + s.L.blue) * 0.2 + yo * 0.3 - pen * 5;
      return { score, cvd, pen, gapMin, yo, cs };
    };
    let seed = 12345;
    const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const start: S = { L: Object.fromEntries(FLAGS.map((f) => [f, from[f].L])) as never, h: Object.fromEntries(FLAGS.map((f) => [f, from[f].h])) as never };
    let best = { s: start, e: evaluate(start) };
    for (let restart = 0; restart < 12; restart++) {
      const cur: S = { L: { ...best.s.L }, h: { ...best.s.h } };
      if (restart > 0) for (const f of FLAGS) { cur.L[f] = q(Math.min(ranges[f][1], Math.max(ranges[f][0], cur.L[f] + (rand() - 0.5) * 3)), 2); cur.h[f] = q(Math.min(WIN[f][1], Math.max(WIN[f][0], cur.h[f] + (rand() - 0.5) * 8)), 1); }
      let now = cur;
      let ce = evaluate(now);
      for (let it = 0; it < 1800; it++) {
        const f = FLAGS[Math.floor(rand() * 5)]!;
        const next: S = { L: { ...now.L }, h: { ...now.h } };
        if (rand() < 0.5) next.L[f] = q(Math.min(ranges[f][1], Math.max(ranges[f][0], now.L[f] + (rand() - 0.5) * 1.6)), 2);
        else next.h[f] = q(Math.min(WIN[f][1], Math.max(WIN[f][0], now.h[f] + (rand() - 0.5) * 6)), 1);
        const ne = evaluate(next);
        if (ne.score > ce.score) { now = next; ce = ne; }
      }
      if (ce.score > best.e.score) best = { s: now, e: ce };
    }
    const gb = Math.abs(best.e.cs.blue.ls - best.e.cs.red.ls);
    console.log(`\nREFINEMENT (light, ${name}): smallest CVD distance ${fmt(best.e.cvd, 4)}, smallest gap ${exempt.length ? "outside the exempt pairs " : ""}${fmt(best.e.gapMin, 2)} L*, yellow and orange ${fmt(best.e.yo, 2)} L*, blue and red ${fmt(gb, 2)} L*, penalty ${fmt(best.e.pen, 2)}`);
    for (const f of FLAGS) console.log(`  ${f.padEnd(7)} { h: ${best.s.h[f].toFixed(1)}, L: ${best.s.L[f].toFixed(2)} }  ${best.e.cs[f].hex}  actual hue ${fmt(best.e.cs[f].h, 1)}`);
  };
  // The winner of the grid search above is the starting point of both.
  const GRID_WINNER: Record<Flag, Slot> = { blue: { h: 250, L: 12 }, green: { h: 154, L: 36 }, yellow: { h: 98, L: 58 }, orange: { h: 64, L: 49 }, red: { h: 26, L: 24 } };
  refine("main", [], LR, GRID_WINNER);
  refine("royal-blue", [["yellow", "orange"], ["blue", "red"]], { ...LR, blue: [8, 40] }, GRID_WINNER);
}

// ---------------------------------------------------------------------------------------------
// Compare with the token file, then run the profiles
// ---------------------------------------------------------------------------------------------
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
const text = prettyJson(file) + "\n";
let failed = false;

const issues = validateFamily(JSON.parse(text), loadSchema());
for (const i of issues.filter((x) => x.level === "error")) { console.log(`\nschema or semantic error at ${i.where}: ${i.message}`); failed = true; }

if (argv.includes("--write")) {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, text);
  console.log(`\nwrote ${FILE}`);
} else if (!existsSync(FILE)) {
  console.log(`\n${FILE} does not exist. Run with --write.`);
  failed = true;
} else if (readFileSync(FILE, "utf8") !== text) {
  console.log("\nThe token file differs from the derivation. Run with --write after checking the change.");
  failed = true;
}

const report = buildReport(fresh, T);
console.log("\nHARNESS");
for (const [p, r] of Object.entries(report.profiles)) {
  console.log(`  ${p.padEnd(14)} ${r.status.padEnd(6)} ${r.errors} errors, ${r.warnings} warnings, ${r.checks.length} checks`);
  for (const d of failures(r.checks)) { console.log(`     error: ${d.slice(0, 260)}`); failed = true; }
}
for (const p of file.meta.environments) if (!report.profiles[p]) { console.log(`  ${p} has no runner`); failed = true; }

console.log("\nKEY NUMBERS");
const pick = (profile: string, id: string, m?: Mode) => report.profiles[profile]!.checks.filter((c) => c.id === id && (m === undefined || c.mode === m));
for (const m of MODES) {
  for (const id of ["levels: adjacent borders differ in L*", "triage: adjacent borders differ in L*", "levels: adjacent borders apart under deutan", "triage: adjacent borders apart under deutan", "critical red is reserved"]) {
    for (const c of pick("clinical", id, m)) console.log(`  clinical ${m.padEnd(5)} ${id}: ${c.value !== undefined ? fmt(c.value, 3) : ""} (limit ${c.limit})`);
  }
}
for (const c of report.profiles.cvd!.checks.filter((c) => c.value !== undefined && /flags|link-and-accent/.test(c.id))) console.log(`  cvd ${String(c.mode).padEnd(5)} ${c.id}: minimum ${fmt(c.value!, 3)}`);
for (const c of report.profiles["print-grey"]!.checks.filter((c) => /apart in grey/.test(c.id))) console.log(`  print-grey ${String(c.mode).padEnd(5)} ${c.id}: minimum ${fmt(c.value ?? NaN, 1)} L*`);
const tight = report.profiles["office-screen"]!.checks.filter((c) => !c.report && c.value !== undefined).sort((a, b) => a.value! / a.limit! - b.value! / b.limit!).slice(0, 4);
for (const c of tight) console.log(`  office-screen tightest ${c.mode} ${c.id}: ${fmt(c.value!)}:1 (needs ${c.limit})`);
const textPairs = report.profiles["print-grey"]!.checks.filter((c) => c.value !== undefined && /:1/.test(c.detail) && !/apart/.test(c.id));
console.log(`  print-grey text pairs: smallest ${fmt(Math.min(...textPairs.map((c) => c.value!)))}:1 over ${textPairs.length} checks (needs ${PRINT_TEXT})`);
process.exit(failed ? 1 : 0);
