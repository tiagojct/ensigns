// The original, for comparison. The normalised model the old gam adapters
// produced lives in tests/fixtures/legacy/model/<id>.json. This module pairs each
// colour of it with the colour the new token file holds at the matching address,
// and is shared by the equality test and by the design scripts that record changes.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../../lib/model/load.ts";
import { SYNTAX_ROLES } from "../../lib/model/types.ts";
import type { ModeName, ResolvedFamily } from "../../lib/model/types.ts";

export const readJson = (path: string): any => JSON.parse(readFileSync(join(repoRoot(), path), "utf8"));

export interface Change {
  mode: ModeName;
  address: string;
  from: string;
  to: string;
  why: string;
}

export const SOURCE: Record<string, { snapshot: string; legacy: string }> = {
  pequod: { snapshot: "pequod", legacy: "pequod" },
  goney: { snapshot: "glauca", legacy: "glauca" },
  jungfrau: { snapshot: "try-works", legacy: "try-works" },
  rosebud: { snapshot: "ambergris", legacy: "ambergris" },
};

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

export interface Pair {
  address: string;
  was: string;
  now: string | undefined;
}

export const snapshotOf = (family: string): any => readJson(`tests/fixtures/legacy/model/${SOURCE[family]!.snapshot}.json`);

/** The original's colours in a mode, each with the colour the new file holds at the matching address. */
export function pairsFor(snapshot: any, resolved: ResolvedFamily, mode: ModeName): Pair[] {
  const sm = snapshot.modes[mode];
  const colours = resolved.modes[mode].colours;
  const out: Pair[] = [];
  const add = (address: string, was: string) => out.push({ address, was: was.toUpperCase(), now: colours.get(address)?.hex });
  for (const [camel, kebab] of Object.entries(CORE)) add(`roles.${kebab}`, sm.roles[camel].hex);
  for (const role of SYNTAX_ROLES) add(`syntax.${role}`, sm.syntax[role].hex);
  ANSI.forEach((slot, i) => add(`ansi.${slot}`, sm.terminal.ansi[i].hex));
  for (const [k, v] of Object.entries(TERMINAL)) add(`terminal.${v}`, sm.terminal[k].hex);
  if (snapshot.id !== "ambergris") for (const a of snapshot.accents) add(`accents.${a.id}`, a[mode].hex);

  // Scales have no names in the original, so they are compared by position.
  const positional = (prefix: string, list: any[] | null | undefined) => {
    const addresses = [...colours.keys()].filter((a) => a.startsWith(prefix));
    (list ?? []).forEach((t, i) => {
      const address = addresses[i] ?? `${prefix}#${i + 1} (missing)`;
      out.push({ address, was: t.hex.toUpperCase(), now: colours.get(address)?.hex });
    });
    if (addresses.length !== (list ?? []).length) out.push({ address: `${prefix} (count)`, was: String((list ?? []).length), now: String(addresses.length) });
  };
  positional("data.categorical.", sm.dataviz.categorical);
  positional("data.sequential.", sm.dataviz.sequential);
  positional("data.diverging.", sm.dataviz.diverging);
  for (const [k, t] of Object.entries<any>(sm.dataviz.plot ?? {})) add(`data.plot.${k}`, t.hex);
  // Gam's model omitted achromatic status. Compare Rosebud's accents directly
  // with the frozen Ambergris tokens so their changes have the same audit trail.
  if (snapshot.id === "ambergris") {
    const legacy = readJson("tests/fixtures/legacy/ambergris.json");
    for (const level of ["neutral", "success", "warning", "critical"]) {
      const step = legacy.status[level].accent.match(/^\{color\.grey\.(\d+)\}$/)?.[1];
      if (!step) throw new Error(`Ambergris status.${level}.accent is not a grey reference`);
      add(`status.${level}.accent`, legacy.color.grey[step].hex);
    }
  }
  return out;
}

/** Every address whose colour differs from the original, in both modes. */
export function differences(family: string, resolved: ResolvedFamily): { mode: ModeName; address: string; was: string; now: string | undefined }[] {
  const snapshot = snapshotOf(family);
  const out = [];
  for (const mode of ["dark", "light"] as const) {
    for (const p of pairsFor(snapshot, resolved, mode)) if (p.now !== p.was) out.push({ mode, ...p });
  }
  return out;
}
