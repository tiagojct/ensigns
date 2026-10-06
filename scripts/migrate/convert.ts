// One-off migration. Turns the four old token formats into family token files
// in the new schema (schema/family.schema.json).
//
// Input:  tests/fixtures/legacy/model/<id>.json   the normalised model the old gam adapters
//                                                 produced (written by export-legacy-model.mjs)
//         tests/fixtures/legacy/<old>.json        the frozen legacy token files
//         tests/parity/**                         the committed outputs the old repositories shipped
// Output: families/<id>/<id>.tokens.json
//         tests/shared/expected-changes/<id>.json every value that differs from the original, with a reason
//
// Rules the conversion follows:
//  - The palette is the only place a hex value appears. A colour that already has a palette name is
//    referenced by that name; one that has none gets a new entry. Two roles that share a hex therefore
//    share one palette entry, which is how an alias is declared.
//  - Nothing is typed here. Every hex comes from a snapshot, a legacy token file or a shipped theme.
//  - A value may differ from the original only where the overrides table below says so, and the
//    difference is recorded. Any other difference stops the run.
//
//   node scripts/migrate/convert.ts            all four families
//   node scripts/migrate/convert.ts goney      one family
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { minPairwise } from "../../lib/colour/distinct.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { distinctMembers } from "../../lib/model/sets.ts";
import type { Distinct, ResolvedFamily } from "../../lib/model/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const readJson = (p: string): any => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const readText = (p: string): string => readFileSync(join(ROOT, p), "utf8");
const up = (h: string) => h.toUpperCase();
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

type Mode = "dark" | "light";
const MODES: Mode[] = ["dark", "light"];
const modeOfKey = (k: string): Mode => (k === "light" || k === "cold" ? "light" : "dark");

const CORE: Record<string, string> = {
  bg: "bg", surface: "surface", text: "text", textMuted: "text-muted", textSubtle: "text-subtle", border: "border",
  link: "link", linkHover: "link-hover", accent: "accent", onAccent: "on-accent", button: "button",
  onButton: "on-button", focus: "focus", selection: "selection",
};
const TERMINAL: Record<string, string> = {
  bg: "background", fg: "foreground", cursor: "cursor", cursorText: "cursor-text",
  selectionBg: "selection-background", selectionFg: "selection-foreground",
};
const ANSI = [
  "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
  "bright-black", "bright-red", "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan", "bright-white",
];
const SYNTAX = ["keyword", "string", "number", "comment", "function", "type", "constant", "variable", "operator", "punctuation", "decorator", "parameter"];

// Okabe and Ito (2008) names for the standard colours, so the categorical scale reads by name.
const OKABE_ITO: Record<string, string> = {
  "#E69F00": "orange", "#56B4E9": "sky-blue", "#009E73": "bluish-green", "#F0E442": "yellow",
  "#0072B2": "blue", "#D55E00": "vermillion", "#CC79A7": "reddish-purple", "#000000": "black",
};

interface Tok {
  id: string;
  hex: string;
  origin: { file?: string; path?: string; official?: boolean; derived?: string };
  style?: string;
}

// ---------------------------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------------------------
class Palette {
  groups: Record<string, Record<string, any>> = {};
  private byHex = new Map<string, string>();

  add(group: string, name: string, value: string | { hex: string; note?: string } | { ref: string; alpha: number; note?: string }): string {
    const g = slug(group);
    const n = slug(name);
    const bucket = (this.groups[g] ??= {});
    if (bucket[n] !== undefined) throw new Error(`duplicate palette entry ${g}.${n}`);
    bucket[n] = value;
    const hex = typeof value === "string" ? value : "hex" in value ? value.hex : undefined;
    if (hex && !this.byHex.has(hex)) this.byHex.set(hex, `${g}.${n}`);
    return `${g}.${n}`;
  }

  find(hex: string): string | undefined {
    return this.byHex.get(up(hex));
  }

  /** A reference to the entry that holds this colour, creating one under the suggested name if none does. */
  use(hex: string, group: string, name: string): string {
    const H = up(hex);
    const existing = this.byHex.get(H);
    if (existing) return `{palette.${existing}}`;
    const g = slug(group);
    let n = slug(name);
    let i = 2;
    while (this.groups[g]?.[n] !== undefined) n = `${slug(name)}-${i++}`;
    return `{palette.${this.add(g, n, H)}}`;
  }
}

// ---------------------------------------------------------------------------------------------
// Naming for colours that have no palette name yet
// ---------------------------------------------------------------------------------------------
function nameOf(tok: Tok, mode: Mode): [string, string] {
  const o = tok.origin;
  const p = o.path ?? "";
  let m: RegExpMatchArray | null;
  if (o.derived) {
    const parts = tok.id.split(".").filter((s) => s !== "light" && s !== "dark");
    const name = parts.at(-1) ?? "value";
    const group = parts.length > 1 ? parts.at(-2)! : "derived";
    return [`${group}-${mode}`, name];
  }
  if (o.official) {
    const parts = tok.id.split(".");
    // dark.terminal.ansi.red, dark.terminal.cursor, dark.syntax.keyword
    if (parts[1] === "terminal") return [`terminal-${mode}`, parts.slice(parts[2] === "ansi" ? 3 : 2).join("-")];
    if (parts[1] === "syntax") return [`syntax-${mode}`, parts.slice(2).join("-")];
    return [`official-${mode}`, slug(tok.id)];
  }
  if ((m = /^modes\.(\w+)\.(.+)$/.exec(p))) return [modeOfKey(m[1]!), m[2]!];
  if ((m = /^a11y\.focus\.(\w+)$/.exec(p))) return [modeOfKey(m[1]!), "focus"];
  if ((m = /^code\.(\w+)\.color$/.exec(p))) return ["code", m[1]!];
  if ((m = /^theme\.(\w+)\.(.+)$/.exec(p))) return [m[1]!, m[2]!];
  if ((m = /^data\.sequence-on-(\w+)\.(\d+)$/.exec(p))) return [`sweep-${m[1]}`, m[2]!];
  if ((m = /^palette\.(\w+)\.(\w+)$/.exec(p))) return [m[1]!, m[2]!];
  return [`other-${mode}`, slug(tok.id)];
}

// ---------------------------------------------------------------------------------------------
// One family under construction
// ---------------------------------------------------------------------------------------------
interface Change { mode: Mode; address: string; from: string; to: string; why: string }
interface Override { mode: Mode; address: string; to: string; why: string }

class Build {
  pb = new Palette();
  modes: Record<Mode, Record<string, any>> = { dark: {}, light: {} };
  changes: Change[] = [];
  /** Every colour the new file will hold at an address, for the self-check against the snapshot. */
  newHex: Record<Mode, Map<string, string>> = { dark: new Map(), light: new Map() };
  oldHex: Record<Mode, Map<string, string>> = { dark: new Map(), light: new Map() };
  private overrides = new Map<string, Override>();

  id: string;
  /** Legacy role names that get a new name here (Try-Works sea-* become tint-*). */
  renames: Record<string, string>;

  constructor(id: string, overrides: Override[] = [], renames: Record<string, string> = {}) {
    this.id = id;
    this.renames = renames;
    for (const o of overrides) this.overrides.set(`${o.mode}:${o.address}`, o);
  }

  /** Reference for a snapshot token at an address, applying an override when one exists. */
  tok(mode: Mode, address: string, t: Tok, forced?: [string, string]): string {
    this.oldHex[mode].set(address, up(t.hex));
    const ov = this.overrides.get(`${mode}:${address}`);
    const hex = up(ov ? ov.to : t.hex);
    this.newHex[mode].set(address, hex);
    const [g, n] = forced ?? nameOf(t, mode);
    return this.pb.use(hex, g, this.renames[n] ?? n);
  }

  /** Reference for a colour that has no snapshot counterpart (a new role or entry). */
  fresh(mode: Mode, address: string, hex: string, group: string, name: string): string {
    this.newHex[mode].set(address, up(hex));
    return this.pb.use(hex, group, name);
  }

  /** Compare new against old. Differences must be overrides; everything else stops the run. */
  settle(): void {
    const unexplained: string[] = [];
    for (const m of MODES) {
      for (const [address, oldHex] of this.oldHex[m]) {
        const newHex = this.newHex[m].get(address);
        if (newHex === undefined) { unexplained.push(`${m} ${address}: missing from the new file`); continue; }
        if (newHex === oldHex) continue;
        const ov = this.overrides.get(`${m}:${address}`);
        if (!ov) unexplained.push(`${m} ${address}: ${oldHex} became ${newHex} with no override`);
        else this.changes.push({ mode: m, address, from: oldHex, to: newHex, why: ov.why });
      }
    }
    for (const ov of this.overrides.values()) {
      if (!this.oldHex[ov.mode].has(ov.address)) unexplained.push(`${ov.mode} ${ov.address}: override has no original value`);
    }
    if (unexplained.length) throw new Error(`${this.id}: unexplained differences\n  ${unexplained.join("\n  ")}`);
  }
}

// ---------------------------------------------------------------------------------------------
// Pretty printer: objects expanded, short arrays of scalars on one line
// ---------------------------------------------------------------------------------------------
function pretty(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const pad1 = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    const flat = JSON.stringify(value);
    if (value.every((v) => typeof v !== "object" || v === null) && flat.length <= 96) return flat;
    return `[\n${value.map((v) => pad1 + pretty(v, indent + 1)).join(",\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const flat = JSON.stringify(value);
    const small = entries.every(([, v]) => typeof v !== "object" || v === null);
    if (small && flat.length <= 96 && indent > 2) return flat;
    return `{\n${entries.map(([k, v]) => `${pad1}${JSON.stringify(k)}: ${pretty(v, indent + 1)}`).join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------------------------
function coreRoles(b: Build, m: Mode, sm: any): Record<string, string> {
  const roles: Record<string, string> = {};
  for (const [camel, kebab] of Object.entries(CORE)) roles[kebab] = b.tok(m, `roles.${kebab}`, sm.roles[camel]);
  return roles;
}

function syntaxBlock(b: Build, m: Mode, sm: any): Record<string, any> {
  const out: Record<string, any> = {};
  for (const role of SYNTAX) {
    const t: Tok = sm.syntax[role];
    const ref = b.tok(m, `syntax.${role}`, t);
    out[role] = t.style ? { color: ref, style: t.style } : ref;
  }
  return out;
}

function ansiBlock(b: Build, m: Mode, sm: any): Record<string, string> {
  const out: Record<string, string> = {};
  ANSI.forEach((slot, i) => { out[slot] = b.tok(m, `ansi.${slot}`, sm.terminal.ansi[i]); });
  return out;
}

function terminalBlock(b: Build, m: Mode, sm: any): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(TERMINAL)) out[v] = b.tok(m, `terminal.${v}`, sm.terminal[k]);
  return out;
}

/** Scales and chart chrome from the normalised model's dataviz block. */
function dataBlock(b: Build, m: Mode, sm: any, spec: { catNames?: string[]; catLabel?: string; seqKey?: string; seqLabel?: string; seqGroup?: string; divKey?: string; divLabel?: string; divGroup?: string }): Record<string, any> {
  const dv = sm.dataviz;
  const data: Record<string, any> = {};
  if (dv.categorical?.length) {
    const colors: Record<string, string> = {};
    dv.categorical.forEach((t: Tok, i: number) => {
      const name = spec.catNames?.[i] ?? OKABE_ITO[up(t.hex)] ?? `c${i + 1}`;
      colors[name] = b.tok(m, `data.categorical.${name}`, t, spec.catNames ? undefined : ["okabe-ito", name]);
    });
    data.categorical = { ...(spec.catLabel ? { label: spec.catLabel } : {}), colors };
  }
  const scale = (list: Tok[], kind: string, key: string, group: string, label?: string) => ({
    ...(label ? { label } : {}),
    colors: list.map((t, i) => b.tok(m, `data.${kind}.${key}.${i + 1}`, t, [group, String(i + 1)])),
  });
  if (dv.sequential?.length && spec.seqKey) data.sequential = { [spec.seqKey]: scale(dv.sequential, "sequential", spec.seqKey, spec.seqGroup ?? spec.seqKey, spec.seqLabel) };
  if (dv.diverging?.length && spec.divKey) data.diverging = { [spec.divKey]: scale(dv.diverging, "diverging", spec.divKey, spec.divGroup ?? spec.divKey, spec.divLabel) };
  if (dv.plot) {
    data.plot = {};
    for (const [k, t] of Object.entries<Tok>(dv.plot)) data.plot[k] = b.tok(m, `data.plot.${k}`, t, [`plot-${m}`, k]);
  }
  return data;
}

const firstClause = (s: string) => s.split(",")[0]!.trim();

// ---------------------------------------------------------------------------------------------
// Goney (Glauca) and Jungfrau (Try-Works): one template, two palettes
// ---------------------------------------------------------------------------------------------
interface SystemSpec {
  snapshot: string;
  legacy: string;
  id: string;
  modeKeys: Record<Mode, string>;
  /** Legacy mode-role keys that are not core roles, and the names they get here. */
  extraKeys: Record<string, string>;
  status: (acc: Record<string, string>, term: Record<string, string>) => Record<string, any>;
  meta: any;
  rules: any[];
  typography: Record<string, string>;
}

function system(spec: SystemSpec): { file: any; changes: Change[] } {
  const S = readJson(`tests/fixtures/legacy/model/${spec.snapshot}.json`);
  const L = readJson(`tests/fixtures/legacy/${spec.legacy}.json`);
  const b = new Build(spec.id, [], Object.fromEntries(Object.entries(spec.extraKeys).filter(([legacy, name]) => legacy !== name)));

  for (const [g, entries] of Object.entries<Record<string, string>>(L.palette)) {
    for (const [n, h] of Object.entries(entries)) b.pb.add(g, n, up(h));
  }

  const accentsByMode: Record<Mode, Record<string, string>> = { dark: {}, light: {} };
  const termByMode: Record<Mode, Record<string, string>> = { dark: {}, light: {} };
  const modes: Record<Mode, any> = { dark: {}, light: {} };

  for (const m of MODES) {
    const sm = S.modes[m];
    const lm = L.modes[spec.modeKeys[m]];
    const roles: Record<string, any> = coreRoles(b, m, sm);
    // The mode's surface-raised is a literal in the legacy file and a core role here.
    roles["surface-raised"] = b.fresh(m, "roles.surface-raised", lm["surface-raised"], m, "surface-raised");
    const extra: Record<string, string> = {};
    for (const [legacyKey, name] of Object.entries(spec.extraKeys)) {
      extra[name] = b.fresh(m, `extra.${name}`, lm[legacyKey], m, name);
    }
    // The higher-contrast path (prefers-contrast: more): a tuned muted text and border per mode.
    const more = L.a11y.contrast_more[spec.modeKeys[m]];
    for (const key of ["text-muted", "border"]) {
      extra[`contrast-more-${key}`] = b.fresh(m, `extra.contrast-more-${key}`, more[key], m, `contrast-more-${key}`);
    }
    roles.extra = extra;

    const accents: Record<string, string> = {};
    for (const a of S.accents) accents[a.id] = b.tok(m, `accents.${a.id}`, a[m]);
    accentsByMode[m] = accents;

    const syntax = syntaxBlock(b, m, sm);
    const ansi = ansiBlock(b, m, sm);
    const terminal = terminalBlock(b, m, sm);
    termByMode[m] = ansi;

    // Editor surfaces as the shipped VS Code themes draw them: the editor on bg, the current line on
    // surface, the selection at 40 per cent over the editor.
    const surfaces = {
      editor: roles.bg,
      "editor-line": roles.surface,
      "editor-selection": { ref: roles.selection, alpha: 0.4, over: "surfaces.editor" },
      sidebar: roles.surface,
    };

    const data = dataBlock(b, m, sm, {
      catLabel: L.dataviz.categorical.name,
      seqKey: slug(firstClause(L.dataviz.sequential.name)),
      seqLabel: L.dataviz.sequential.name,
      divKey: slug(firstClause(L.dataviz.diverging.name)),
      divLabel: L.dataviz.diverging.name,
    });

    modes[m] = {
      label: sm.label,
      roles, accents, surfaces, syntax, ansi, terminal,
      status: spec.status(accents, ansi),
      data,
    };
  }

  b.settle();
  const file = {
    $schema: "../../schema/family.schema.json",
    meta: spec.meta,
    palette: b.pb.groups,
    modes,
    typography: spec.typography,
    rules: spec.rules,
  };
  return { file, changes: b.changes };
}

// ---------------------------------------------------------------------------------------------
// Pequod
// ---------------------------------------------------------------------------------------------
function pequod(): { file: any; changes: Change[] } {
  const S = readJson("tests/fixtures/legacy/model/pequod.json");
  const L = readJson("tests/fixtures/legacy/pequod.json");
  const themes = "tests/parity/pequod/themes";
  const darkTheme = readJson(`${themes}/Pequod-color-theme.json`);
  const lightTheme = readJson(`${themes}/Pequod-light-color-theme.json`);
  const zed = readJson(`${themes}/Pequod.zed.json`);
  const iterm = readText(`${themes}/Pequod.itermcolors`);

  const six = (v: string) => up(v.slice(0, 7));
  const tokenColour = (theme: any, scope: string): string => {
    const hit = theme.tokenColors.find((t: any) => (Array.isArray(t.scope) ? t.scope : String(t.scope).split(",")).map((s: string) => s.trim()).includes(scope));
    if (!hit) throw new Error(`theme has no token rule for ${scope}`);
    return up(hit.settings.foreground);
  };
  const dc = darkTheme.colors;
  const lc = lightTheme.colors;

  // D16: where the shipped themes and pequod.json disagree, the themes win.
  const overrides: Override[] = [
    { mode: "dark", address: "roles.text-muted", to: dc.descriptionForeground, why: "D16: the dark theme draws muted text as Ishmael (descriptionForeground), pequod.json says Log 300" },
    { mode: "dark", address: "roles.link", to: tokenColour(darkTheme, "markup.underline.link"), why: "D16: the dark theme draws links in the hand-tuned cyan, pequod.json says Log 300" },
    { mode: "dark", address: "roles.link-hover", to: tokenColour(darkTheme, "markup.underline.link"), why: "D16: link hover keeps the link colour, which changed" },
    { mode: "dark", address: "data.plot.muted", to: dc.descriptionForeground, why: "D16: chart muted text follows text-muted, which changed" },
    { mode: "light", address: "roles.focus", to: lc.focusBorder, why: "D16: the light theme draws focus in Log 700 (focusBorder), pequod.json says Log 400" },
    { mode: "dark", address: "syntax.variable", to: tokenColour(darkTheme, "variable"), why: "D16: the themes draw plain variables in the text colour, pequod.json says Daggoo" },
    { mode: "light", address: "syntax.variable", to: tokenColour(lightTheme, "variable"), why: "D16: the themes draw plain variables in the text colour, pequod.json says Daggoo" },
    // The light terminal has no shipped preset. The old site derived one; the light VS Code theme holds the real values.
    { mode: "light", address: "terminal.background", to: lc["terminal.background"], why: "D16: the light theme draws the terminal on Log 50; the old site derived Log 100" },
    { mode: "light", address: "terminal.cursor-text", to: lc["terminal.background"], why: "D16: cursor text follows the terminal background" },
    ...ANSI.filter((_, i) => i !== 1 && i !== 2 && i !== 3 && i !== 4 && i !== 5 && i !== 7 && i !== 8).map((slot) => ({
      mode: "light" as Mode,
      address: `ansi.${slot}`,
      to: lc[`terminal.ansi${slot.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")}`],
      why: "D16: the light VS Code theme holds the hand-tuned light terminal colours; the old site derived them",
    })),
  ];
  const b = new Build("pequod", overrides);

  // Palette: the Log scale, the crew in both modes, then the hand-tuned colours the themes hold.
  for (const [n, h] of Object.entries<string>(L.log)) b.pb.add("log", n, up(h));
  for (const [name, a] of Object.entries<any>(L.accents)) {
    b.pb.add(name, "light", { hex: up(a.light), note: `${name[0]!.toUpperCase()}${name.slice(1)}, ${a.role}. ${a.note}` });
    b.pb.add(name, "dark", up(a.dark));
  }
  const hand = (group: string, name: string, hex: string, note?: string) => b.pb.add(group, name, note ? { hex: up(hex), note } : up(hex));
  for (const slot of ["cyan", "bright-red", "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan"]) {
    hand("ansi-dark", slot, dc[`terminal.ansi${slot.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")}`]);
  }
  for (const slot of ["bright-red", "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan", "bright-white"]) {
    hand("ansi-light", slot, lc[`terminal.ansi${slot.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")}`]);
  }
  hand("chrome", "text-dark", dc["titleBar.activeForeground"], "Dark chrome text: side bar titles, status bar, panel titles. Slightly warmer than Log 100.");
  hand("chrome", "highlight-light", six(lc["editorBracketMatch.background"]), "Light theme word, hover and bracket highlights, drawn at 19 to 31 per cent.");
  const dim = zed.themes.find((t: any) => /light/i.test(t.name)).style;
  for (const slot of ["red", "green", "yellow", "blue", "magenta", "cyan"]) hand("zed-dim-light", slot, dim[`terminal.ansi.dim_${slot}`], "Zed dim variant, light theme.");
  const plist = (name: string): string => {
    const m = new RegExp(`<key>${name}</key>\\s*<dict>([\\s\\S]*?)</dict>`).exec(iterm);
    if (!m) throw new Error(`iTerm2 preset has no ${name}`);
    const c = (k: string) => Number(new RegExp(`<key>${k} Component</key>\\s*<real>([\\d.]+)</real>`).exec(m[1]!)![1]);
    return "#" + [c("Red"), c("Green"), c("Blue")].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
  };
  hand("iterm", "cursor-guide", plist("Cursor Guide Color"), "iTerm2 preset only.");
  for (const [slot, n] of [["bright-red", 9], ["bright-green", 10], ["bright-yellow", 11], ["bright-blue", 12], ["bright-magenta", 13]] as const) {
    hand("iterm", slot, plist(`Ansi ${n} Color`), "iTerm2 preset variant of the Ghostty bright colour.");
  }

  const modes: Record<Mode, any> = { dark: {}, light: {} };
  for (const m of MODES) {
    const sm = S.modes[m];
    const lr = L.roles[m];
    const roles: Record<string, any> = coreRoles(b, m, sm);
    // The legacy bg-alt becomes surface-raised; accent-secondary has no core counterpart.
    const step = (path: string): string => path.split(".")[1]!;
    roles["surface-raised"] = b.fresh(m, "roles.surface-raised", L.log[step(lr["bg-alt"])], "log", step(lr["bg-alt"]));
    roles.extra = { "accent-secondary": b.fresh(m, "extra.accent-secondary", L.log[step(lr["accent-secondary"])], "log", step(lr["accent-secondary"])) };

    const accents: Record<string, string> = {};
    for (const a of S.accents) accents[a.id] = b.tok(m, `accents.${a.id}`, a[m]);

    // Surfaces as the shipped VS Code themes draw them.
    const theme = m === "dark" ? darkTheme : lightTheme;
    const c = theme.colors;
    const logName = (hex: string) => { const k = b.pb.find(hex); if (!k) throw new Error(`${hex} is not a Log step`); return `{palette.${k}}`; };
    const editor = logName(six(c["editor.background"]));
    const surfaces: Record<string, any> = {
      editor,
      "editor-line": { ref: logName(six(c["editor.lineHighlightBackground"])), alpha: 0.5, over: "surfaces.editor" },
      "editor-selection": m === "dark"
        ? logName(six(c["editor.selectionBackground"]))
        : { ref: logName(six(c["editor.selectionBackground"])), alpha: 0.5, over: "surfaces.editor" },
      sidebar: logName(six(c["sideBar.background"])),
    };

    const syntax = syntaxBlock(b, m, sm);
    const ansi = ansiBlock(b, m, sm);
    const terminal = terminalBlock(b, m, sm);

    // Chromatic status as the shipped themes draw diagnostics and version control.
    const status = {
      policy: "chromatic",
      danger: accents.ahab,
      warning: accents.pip,
      success: accents.tashtego,
      info: accents.starbuck,
      hint: accents.ishmael,
      conflict: accents.stubb,
    };

    const data = dataBlock(b, m, sm, {
      catNames: S.accents.map((a: any) => a.id),
      catLabel: "The crew of the Pequod",
      seqKey: "log",
      seqLabel: "Log, warm to cool (the hue turns between Log 500 and Log 600, so this is not a sequential scale)",
      seqGroup: "log",
    });
    // The Log scale is one palette group; the scale steps reuse its entries.
    modes[m] = {
      label: m === "dark" ? "Below deck" : "Parchment",
      roles, accents, surfaces, syntax, ansi, terminal, status, data,
    };
  }
  b.settle();

  const file = {
    $schema: "../../schema/family.schema.json",
    meta: {
      id: "pequod",
      name: "Pequod",
      host: true,
      version: L.version === "0.2.0-alpha" ? "0.2.0" : L.version,
      tagline: "Warm paper, deep ink, the crew as accents.",
      goal: "Reading and code in editors, terminals and long documents on screen.",
      environments: ["office-screen", "editor", "cvd"],
      licence: { tokens: "CC-BY-4.0", code: "MIT" },
    },
    palette: b.pb.groups,
    modes,
    typography: { sans: "Atkinson Hyperlegible Next", mono: "JetBrains Mono" },
    rules: [
      { id: "crew", text: "The accents are the crew of the Pequod. Each keeps its name and has a light and a dark value." },
      { id: "warm-to-cool", text: "The Log scale runs from warm paper to cool ink. The hue turns between Log 500 and Log 600, so it is a warm-to-cool scale and not a sequential colormap." },
    ],
  };
  return { file, changes: b.changes };
}

// ---------------------------------------------------------------------------------------------
// Rosebud (Ambergris)
// ---------------------------------------------------------------------------------------------
function rosebud(): { file: any; changes: Change[] } {
  const S = readJson("tests/fixtures/legacy/model/ambergris.json");
  const L = readJson("tests/fixtures/legacy/ambergris.json");
  const b = new Build("rosebud");

  const ramp = (group: string, src: Record<string, any>) => {
    for (const [n, v] of Object.entries(src)) if (n !== "comment") b.pb.add(group, n, up(v.hex));
  };
  ramp("grey", L.color.grey);
  ramp("accent", L.color.accent);
  // Translucent colours: rgb(r g b / a) strings in the old file, each a ramp anchor at an opacity.
  const anchors: Record<string, string> = { ink: "grey.1000", paper: "grey.000", accent: "accent.500" };
  const rgbOf = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (const [name, steps] of Object.entries<Record<string, string>>(L.color.alpha)) {
    const base = anchors[name]!;
    const [bg, bn] = base.split(".") as [string, string];
    const baseRgb = rgbOf(b.pb.groups[bg]![bn] as string);
    for (const [n, css] of Object.entries(steps)) {
      const m = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(css);
      if (!m) throw new Error(`cannot read ${css}`);
      if ([m[1], m[2], m[3]].map(Number).join() !== baseRgb.join()) throw new Error(`alpha.${name}.${n} does not match ${base}`);
      b.pb.add(`alpha-${name}`, n, { ref: `{palette.${base}}`, alpha: Number(m[4]) });
    }
  }
  for (const m of MODES) {
    for (const [n, v] of Object.entries<any>(L.data[`sequence-on-${m}`])) b.pb.add(`sweep-${m}`, n, up(v.hex));
  }
  // The five hexes the sweep was derived from. Nothing reads them; they stay as the record of the design input.
  (L.data.supplied as string[]).forEach((hex, i) => b.pb.add("sweep-supplied", String(i + 1), { hex: up(hex), note: "Design input for the hue sweep. The light and dark variants derive from it." }));
  // Functional hues for terminal and editor content (rule 4): the literal slots of the old ansi block.
  for (const slot of ANSI) {
    const v = L.ansi[slot];
    if (v && typeof v === "object") b.pb.add("ansi-dark", slot, up(v.hex));
  }

  // Theme keys the core roles already use, by the names the old site mapped them to.
  const usedAsCore = new Set(["surface", "surface-sunken", "surface-raised", "text-primary", "text-secondary", "text-tertiary", "rule", "link", "link-hover", "accent-line", "fill-solid", "text-on-fill", "focus-ring", "accent-surface"]);
  const resolveAlias = (raw: string): string => {
    const m = /^\{(.+)\}$/.exec(raw.trim());
    if (!m) throw new Error(`not a reference: ${raw}`);
    const path = m[1]!;
    let hit = /^color\.(grey|accent)\.(\w+)$/.exec(path);
    if (hit) return `{palette.${hit[1]}.${hit[2]}}`;
    hit = /^color\.alpha\.(ink|paper|accent)\.(\d+)$/.exec(path);
    if (hit) return `{palette.alpha-${hit[1]}.${hit[2]}}`;
    throw new Error(`cannot map ${raw}`);
  };

  const modes: Record<Mode, any> = { dark: {}, light: {} };
  for (const m of MODES) {
    const sm = S.modes[m];
    const roles: Record<string, any> = coreRoles(b, m, sm);
    roles["surface-raised"] = resolveAlias(L.theme[m]["surface-raised"]);
    const extra: Record<string, string> = {};
    for (const [key, raw] of Object.entries<string>(L.theme[m])) {
      if (usedAsCore.has(key)) continue;
      extra[key === "border" ? "border-control" : key] = resolveAlias(raw);
    }
    roles.extra = extra;

    const syntax = syntaxBlock(b, m, sm);
    const ansi = ansiBlock(b, m, sm);
    const terminal = terminalBlock(b, m, sm);

    const level = (name: string) => {
      const s = L.status[name];
      return {
        weight: String(s.weight).replace(/^\{border\./, "{design.border."),
        edge: s.edge,
        fill: resolveAlias(s.fill),
        accent: resolveAlias(s.accent),
        icon: s.icon,
      };
    };
    const status = { policy: "achromatic", neutral: level("neutral"), success: level("success"), warning: level("warning"), critical: level("critical") };

    const data = dataBlock(b, m, sm, {
      seqKey: "sweep",
      seqLabel: "Five-step hue sweep, sequential only; pick the variant that matches the chart background",
      seqGroup: `sweep-${m}`,
    });
    modes[m] = { roles, accents: { teal: roles.accent }, syntax, ansi, terminal, status, data };
  }
  b.settle();

  const design = {
    border: { width: L.border.width, radius: L.border.radius },
    focus: L.focus && { width: L.focus.width, offset: L.focus.offset },
    shadow: Object.fromEntries(Object.entries<string>(L.shadow).map(([k, v]) => [k, v.replace(/\{color\.alpha\.(ink|paper|accent)\.(\d+)\}/g, "{palette.alpha-$1.$2}")])),
  };

  const file = {
    $schema: "../../schema/family.schema.json",
    meta: {
      id: "rosebud",
      name: "Rosebud",
      formerly: { id: "ambergris", name: "Ambergris", version: L.meta.version },
      version: L.meta.version,
      chapter: [91, 92],
      chapterTitle: "The Pequod Meets the Rose-Bud; Ambergris",
      quote: "the romantic name of this aromatic ship",
      tagline: "Near-monochrome, one teal for interaction, a hue sweep for data.",
      goal: "Quiet application chrome for tools used for hours: dashboards, admin tools, editors' chrome, Loomings' interface.",
      environments: ["office-screen", "cvd", "forced-colors"],
      licence: { tokens: "CC-BY-4.0", code: "MIT" },
    },
    palette: b.pb.groups,
    modes,
    design,
    rules: (S.rules as string[]).map((text, i) => ({ id: ["accent-marks-interaction", "status-achromatic", "data-and-chrome-apart", "functional-hues-in-content"][i]!, text })),
  };
  return { file, changes: b.changes };
}

// ---------------------------------------------------------------------------------------------
// Declarations: contrast pairs, distinct sets and rule checks. Added with --declare, in a
// commit of their own, so the migration commit holds values only.
// ---------------------------------------------------------------------------------------------
type Kind = "text" | "large" | "component";
const pair = (fg: string, bg: string, kind: Kind = "text", modes?: Mode[], why?: string) => ({
  fg, bg, kind, ...(modes ? { modes } : {}), ...(why ? { why } : {}),
});
const DARK: Mode[] = ["dark"];
const LIGHT: Mode[] = ["light"];

/** Pairs of a set that share one hex value in a mode: same colour by design in the original. */
function sharedAliases(resolved: ResolvedFamily, mode: Mode, set: Distinct["set"]): [string, string][] {
  const members = distinctMembers(resolved.modes[mode], { id: "x", set });
  const out: [string, string][] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      if (members[i]!.colour.hex === members[j]!.colour.hex) out.push([members[i]!.name, members[j]!.name]);
    }
  }
  return out;
}

/**
 * One distinct entry when both modes agree, one per mode when they do not. With `baseline`, a set whose
 * closest pair is below the target gets a floor at its current minimum: a ratchet, not a pass. The report
 * keeps listing what misses the target.
 */
function setEntries(resolved: ResolvedFamily, id: string, set: Distinct["set"], extra: Record<string, unknown> = {}, baseline = false): any[] {
  const target = 0.06;
  const per = MODES.map((m) => {
    const aliases = sharedAliases(resolved, m, set);
    let floor: number | undefined;
    if (baseline) {
      const skip = new Set(aliases.map(([a, b]) => [a, b].sort().join("|")));
      const members = distinctMembers(resolved.modes[m], { id: "x", set });
      let min = Infinity;
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          if (skip.has([members[i]!.name, members[j]!.name].sort().join("|"))) continue;
          min = Math.min(min, minPairwise([members[i]!.colour.hex, members[j]!.colour.hex]).min);
        }
      }
      if (min < target) floor = Math.floor(min * 1000) / 1000;
    }
    return { aliases, floor };
  });
  const entry = (p: { aliases: [string, string][]; floor: number | undefined }) => ({
    ...(p.aliases.length ? { aliases: p.aliases } : {}),
    ...(p.floor !== undefined ? { min: p.floor } : {}),
  });
  if (JSON.stringify(per[0]) === JSON.stringify(per[1])) return [{ id, set, ...entry(per[0]!), ...extra }];
  return MODES.map((m, i) => ({ id: `${id}-${m}`, set, modes: [m], ...entry(per[i]!), ...extra }));
}

/** The dark keyword colour is the family mark and misses 4.5:1 on the current line by a whisker. */
const keywordOnLine = (family: string, mark: string) => ({
  profile: "editor",
  id: "syntax.keyword on surfaces.editor-line",
  mode: "dark",
  why: `${family}'s dark keyword is ${mark} and reaches 4.15:1 on the current line. The shipped theme draws that line in the surface colour. Options: lighten the keyword, soften the line highlight, or accept. Decision needed at checkpoint 2.`,
});

const coreTextPairs = (): any[] => [
  pair("roles.text", "roles.bg"),
  pair("roles.text", "roles.surface"),
  pair("roles.text", "roles.surface-raised"),
  pair("roles.text-muted", "roles.bg"),
  pair("roles.link", "roles.bg"),
  pair("roles.link-hover", "roles.bg"),
  pair("roles.accent", "roles.bg"),
  pair("roles.on-accent", "roles.accent"),
  pair("roles.on-button", "roles.button"),
  pair("roles.focus", "roles.bg", "component"),
];

function declare(id: string, file: any): void {
  const resolved = resolveFamily(file);
  const ansi = setEntries(resolved, "ansi-hues", "ansi-hues", {
    cvd: "report",
    note: "Terminals give no way to reinforce a hue, so CVD results for the six hue slots are warnings. The normal-vision distance is a gate.",
  });

  if (id === "pequod") {
    const crew = Object.keys(file.modes.dark.accents);
    file.pairs = [
      ...coreTextPairs(),
      pair("roles.text-subtle", "roles.bg", "large", undefined, "subtle text is for large or de-emphasised text"),
      // The brief's failing set: every crew accent is a text colour on the page.
      ...crew.map((n) => pair(`accents.${n}`, "roles.bg", "text", undefined, "the crew are text colours on the page")),
    ];
    file.distinct = [
      ...MODES.map((m) => {
        const hexes = crew.map((n) => resolved.modes[m].colours.get(`accents.${n}`)!.hex);
        const min = Math.floor(minPairwise(hexes).min * 10000) / 10000;
        return { id: `crew-${m}`, set: "accents", modes: [m], min, note: "The brief: the minimum pairwise OKLab distance among the crew in each mode must not fall below the original." };
      }),
      ...setEntries(resolved, "syntax-hues", "syntax-hues", { cvd: "report", note: "The crew sets above carry the CVD gate for these colours; this set reports the same pairs as seen through the syntax roles." }),
      ...ansi,
    ];
  } else if (id === "goney") {
    file.pairs = [
      pair("roles.text", "roles.bg"),
      pair("roles.text-muted", "roles.bg"),
      pair("roles.accent", "roles.bg"),
      pair("roles.on-accent", "roles.accent", "text", undefined, "button text"),
      pair("extra.tint-pale", "roles.bg", "text", DARK),
      pair("extra.accent-bright", "extra.tint", "component", DARK, "UI mark on the tint"),
      pair("extra.accent-bright", "roles.bg", "text", DARK, "hover text: dark hovers brighten"),
      pair("extra.accent-deep", "roles.bg", "text", LIGHT, "hover text: light hovers darken"),
      pair("roles.text", "extra.tint", "text", DARK, "the tint as a selection fill"),
      pair("roles.text", "extra.tint-pale", "text", LIGHT, "the tint as a selection fill"),
      pair("extra.on-tint", "extra.tint-pale", "text", DARK),
      pair("extra.tint-bright", "roles.bg", "text", LIGHT),
      pair("roles.on-accent", "extra.accent-deep", "text", DARK, "accent-deep as a fill (the Zotero selected row)"),
      pair("extra.accent-deep", "roles.bg", "component", DARK),
    ];
    file.distinct = [
      ...setEntries(resolved, "syntax-hues", "syntax-hues", { cvd: "report", reinforced: [["number", "function"], ["function", "constant"], ["function", "type"]], by: "italics: number, constant and type are set italic, function is upright", note: "Baseline. The old repository reported CVD and never gated it, and several close pairs here are both italic or both upright, so they cannot be reinforced. The floor stops the migrated colours getting worse; the report lists what misses the 0.06 target. Retuning the syntax hues is a decision for checkpoint 2." }, true),
      ...ansi,
    ];
    file.exceptions = [keywordOnLine("Goney", "the blue mark")];
    file.rules[0].check = "accent-only-in-roles:link,button,focus";
    file.rules[2].check = "hover-direction";
  } else if (id === "jungfrau") {
    file.pairs = [
      pair("roles.text", "roles.bg"),
      pair("roles.text-muted", "roles.bg"),
      pair("roles.accent", "roles.bg"),
      pair("roles.on-accent", "roles.accent", "text", undefined, "button text"),
      pair("extra.tint-pale", "roles.bg", "text", DARK),
      pair("extra.accent-bright", "extra.tint", "component", DARK, "UI mark on the sea"),
      pair("extra.accent-bright", "roles.bg", "text", DARK, "hover text: dark hovers brighten"),
      pair("extra.accent-deep", "roles.bg", "text", LIGHT, "hover text: light hovers darken"),
      pair("extra.tint-bright", "roles.bg", "text", LIGHT),
    ];
    file.distinct = [
      ...setEntries(resolved, "syntax-hues", "syntax-hues", { cvd: "report", note: "Baseline of Try-Works 1.0.0. The repositioning retunes the code hues to the night band and must beat this floor." }, true),
      ...setEntries(resolved, "ansi-hues", "ansi-hues", { cvd: "report", note: "Baseline of Try-Works 1.0.0, whose light terminals reuse the dark slots. The repositioning authors new sets and must beat this floor." }, true),
    ];
    file.exceptions = [keywordOnLine("Jungfrau", "the fire mark")];
    file.rules[0].check = "accent-only-in-roles:link,button,focus";
  } else if (id === "rosebud") {
    // The old file's 23 assertions, by the roles they test.
    file.pairs = [
      pair("roles.text", "roles.bg", "text", LIGHT, "body text, light"),
      { ...pair("roles.text-muted", "roles.bg", "text", LIGHT, "secondary text, light") },
      pair("extra.border-strong", "roles.bg", "component", LIGHT, "input borders, light: the old file tested grey 500, which is the control border"),
      pair("roles.text", "roles.surface", "text", DARK, "body text, dark, on the sunken surface the old file tested"),
      pair("roles.text-subtle", "roles.surface", "text", DARK, "tertiary text, dark"),
      pair("roles.link", "roles.bg", "text", undefined, "link"),
      pair("roles.link-hover", "roles.bg", "text", undefined, "link hover"),
      pair("roles.accent", "roles.bg", "component", LIGHT, "accent rule, light"),
      pair("roles.accent", "roles.surface", "component", DARK, "accent rule, dark"),
      ...["red", "green", "yellow", "blue", "magenta", "cyan", "bright-red", "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan"]
        .map((slot) => pair(`ansi.${slot}`, "terminal.background", "text", DARK, `ANSI ${slot.replace("-", " ")}, dark`)),
    ];
    file.distinct = [...ansi];
    const byId = (rid: string) => file.rules.find((r: any) => r.id === rid);
    byId("accent-marks-interaction").check = "accent-only-in-roles";
    byId("status-achromatic").check = "status-achromatic";
    byId("data-and-chrome-apart").check = ["accent-not-in-data:accent", "group-not-in-chrome:sweep-light,sweep-dark,sweep-supplied"];
    byId("functional-hues-in-content").check = "group-not-in-chrome:ansi-dark";
  }
}

// ---------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------
const glauca = (): { file: any; changes: Change[] } => system({
  snapshot: "glauca",
  legacy: "glauca",
  id: "goney",
  modeKeys: { dark: "dark", light: "light" },
  extraKeys: { "accent-bright": "accent-bright", "accent-deep": "accent-deep", "tint-deep": "tint-deep", tint: "tint", "tint-bright": "tint-bright", "tint-pale": "tint-pale", "on-tint": "on-tint" },
  status: (acc, ansi) => ({ policy: "chromatic", danger: acc.bacca, warning: ansi.yellow, success: acc.folium, info: acc.lacus }),
  meta: {
    id: "goney",
    name: "Goney",
    formerly: { id: "glauca", name: "Glauca", version: "0.1.0" },
    version: "0.1.0",
    chapter: 52,
    chapterTitle: "The Albatross",
    quote: "bleached like the skeleton of a stranded walrus",
    quotes: [{ chapter: 52, text: "furred over with hoar-frost" }],
    tagline: "One sky-blue mark on a frost-bloom field.",
    goal: "Tiago's identity on the web, in documents and on slides.",
    environments: ["office-screen", "editor", "cvd"],
    licence: { tokens: "CC-BY-4.0", code: "MIT" },
  },
  rules: [
    { id: "one-mark", text: "The bloom is the field; the blue is the mark." },
    { id: "extended-hues", text: "The extended hues (folium, bacca, viola, lacus, unda) appear in code and terminals only." },
    { id: "hover-direction", text: "Hovers darken in light mode and brighten in dark mode." },
  ],
  typography: { serif: "IBM Plex Serif", sans: "IBM Plex Sans", mono: "IBM Plex Mono" },
});

const tryWorks = (): { file: any; changes: Change[] } => system({
  snapshot: "try-works",
  legacy: "try-works",
  id: "jungfrau",
  modeKeys: { dark: "lit", light: "cold" },
  extraKeys: { "accent-bright": "accent-bright", "accent-deep": "accent-deep", "sea-deep": "tint-deep", sea: "tint", "sea-bright": "tint-bright", "sea-pale": "tint-pale", "on-sea": "on-tint" },
  status: (acc) => ({ policy: "chromatic", danger: acc.brick, warning: acc.ember, success: acc.kelp, info: acc.tide, hint: acc.shoal, conflict: acc.dusk }),
  meta: {
    id: "jungfrau",
    name: "Jungfrau",
    formerly: { id: "try-works", name: "Try-Works", version: "1.0.0" },
    version: "1.0.0",
    chapter: 81,
    chapterTitle: "The Pequod Meets the Virgin",
    quote: "a clean one (that is, an empty one)",
    quotes: [{ chapter: 96, text: "Look not too long in the face of the fire" }],
    tagline: "A cold sea is the field; the fire is the one hot mark.",
    goal: "Reading, writing and code in a dark room at night.",
    environments: ["night", "editor", "cvd"],
    licence: { tokens: "CC-BY-4.0", code: "MIT" },
  },
  rules: [
    { id: "one-hot-mark", text: "Fire is rare: one hot mark per surface." },
    { id: "cold-field", text: "The cold sea is the field; fire is the mark." },
  ],
  typography: { serif: "Fraunces", sans: "Archivo", mono: "JetBrains Mono", reading: "Literata" },
});

const builders: Record<string, () => { file: any; changes: Change[] }> = { pequod, goney: glauca, jungfrau: tryWorks, rosebud };
const DECLARE = process.argv.includes("--declare");
const wanted = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const ids = wanted.length ? wanted : Object.keys(builders);
const allChanges: Record<string, Change[]> = {};
for (const id of ids) {
  const build = builders[id];
  if (!build) throw new Error(`unknown family ${id}`);
  const { file, changes } = build();
  if (DECLARE) declare(id, file);
  const dir = join(ROOT, "families", id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${id}.tokens.json`), pretty(file) + "\n");
  allChanges[id] = changes;
  const entries = Object.values<Record<string, unknown>>(file.palette).reduce((n, g) => n + Object.keys(g).length, 0);
  console.log(`${id}: ${Object.keys(file.palette).length} palette groups, ${entries} entries, ${changes.length} recorded changes`);
}

// One file per family, so that work on one family never collides with work on another.
const changesDir = join(ROOT, "tests/shared/expected-changes");
mkdirSync(changesDir, { recursive: true });
for (const [id, list] of Object.entries(allChanges)) writeFileSync(join(changesDir, `${id}.json`), pretty(list) + "\n");
