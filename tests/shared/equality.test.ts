// Every migrated value equals the original, except the changes listed in
// tests/shared/expected-changes/<family>.json, each with a reason.
//
// "The original" is the normalised model the old gam adapters produced from the
// frozen legacy token files and the committed outputs (tests/fixtures/legacy/model/).
// A second check compares the legacy token files themselves: every colour literal
// in them must still be in the palette, unless it is listed as dropped (with a
// reason) or as the old side of an expected change.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { toOklch } from "../../lib/colour/oklab.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { SYNTAX_ROLES } from "../../lib/model/types.ts";
import type { ModeName, ResolvedFamily } from "../../lib/model/types.ts";

const root = repoRoot();
const read = (p: string): any => JSON.parse(readFileSync(join(root, p), "utf8"));

interface Change { mode: ModeName; address: string; from: string; to: string; why: string }
const dropped: Record<string, Record<string, string>> = read("tests/shared/migration-dropped.json");

const SOURCE: Record<string, { snapshot: string; legacy: string }> = {
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

interface Pair { address: string; was: string; now: string | undefined }

/** The original's colours in a mode, each with the colour the new file holds at the matching address. */
function pairsFor(snapshot: any, resolved: ResolvedFamily, mode: ModeName): Pair[] {
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
  return out;
}

function* strings(value: unknown): Generator<string> {
  if (typeof value === "string") yield value;
  else if (Array.isArray(value)) for (const v of value) yield* strings(v);
  else if (value && typeof value === "object") for (const v of Object.values(value)) yield* strings(v);
}

describe("migration equality", () => {
  const families = loadFamilies();
  for (const [id, source] of Object.entries(SOURCE)) {
    const loaded = families.find((f) => f.dir === id);
    describe(id, () => {
      it("has a token file", () => expect(loaded).toBeDefined());
      if (!loaded) return;
      const snapshot = read(`tests/fixtures/legacy/model/${source.snapshot}.json`);
      const resolved = resolveFamily(loaded.file);
      const changes: Change[] = read(`tests/shared/expected-changes/${id}.json`);

      it("holds every colour of the original, or records why it changed", () => {
        const used = new Set<Change>();
        const failures: string[] = [];
        for (const mode of ["dark", "light"] as const) {
          for (const p of pairsFor(snapshot, resolved, mode)) {
            if (p.now === p.was) continue;
            const hit = changes.find((c) => c.mode === mode && c.address === p.address && c.from === p.was && c.to === p.now);
            if (hit) used.add(hit);
            else failures.push(`${mode} ${p.address}: was ${p.was}, now ${p.now}`);
          }
        }
        expect(failures).toEqual([]);
        const stale = changes.filter((c) => !used.has(c)).map((c) => `${c.mode} ${c.address} ${c.from} to ${c.to}`);
        expect(stale, "expected changes that no longer happen").toEqual([]);
      });

      it("explains each change", () => {
        for (const c of changes) expect(c.why.length, `${c.mode} ${c.address}`).toBeGreaterThan(20);
      });

      it("holds every step of the original scales in the palette", () => {
        const steps = [...snapshot.scale.steps, ...snapshot.extraScales.flatMap((s: any) => s.steps)];
        for (const t of steps) expect(resolved.palette.get(t.id)?.hex, t.id).toBe(t.hex.toUpperCase());
      });

      it("keeps every colour literal of the legacy token file in the palette, except those listed", () => {
        const legacy = read(`tests/fixtures/legacy/${source.legacy}.json`);
        const literals = new Set<string>();
        for (const s of strings(legacy)) if (/^#[0-9a-fA-F]{6}$/.test(s)) literals.add(s.toUpperCase());
        const inPalette = new Set([...resolved.palette.values()].map((c) => c.hex));
        const replaced = new Set(changes.map((c) => c.from));
        const missing = [...literals].filter((h) => !inPalette.has(h) && !replaced.has(h)).sort();
        const listed = Object.keys(dropped[id] ?? {}).map((h) => h.toUpperCase()).sort();
        expect(missing, "legacy colours that left the palette without a reason").toEqual(listed);
      });
    });
  }

  it("keeps the hand-synced oklch strings of Ambergris within rounding of the hex values", () => {
    const legacy = read("tests/fixtures/legacy/ambergris.json");
    const worst = { L: 0, C: 0, h: 0 };
    let checked = 0;
    const visit = (o: any) => {
      if (!o || typeof o !== "object") return;
      if (typeof o.hex === "string" && typeof o.oklch === "string") {
        const m = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(o.oklch);
        if (m) {
          const c = toOklch(o.hex);
          worst.L = Math.max(worst.L, Math.abs(c.L - Number(m[1])));
          worst.C = Math.max(worst.C, Math.abs(c.C - Number(m[2])));
          if (c.C > 0.02) worst.h = Math.max(worst.h, Math.min(Math.abs(c.h - Number(m[3])), 360 - Math.abs(c.h - Number(m[3]))));
          checked++;
        }
      }
      for (const v of Object.values(o)) visit(v);
    };
    visit(legacy);
    console.info(`ambergris oklch strings checked: ${checked}; worst L ${worst.L.toFixed(4)}, C ${worst.C.toFixed(4)}, hue ${worst.h.toFixed(2)} degrees`);
    expect(checked).toBeGreaterThan(30);
    expect(worst.L).toBeLessThan(0.01);
    expect(worst.C).toBeLessThan(0.02);
    expect(worst.h).toBeLessThan(3);
  });
});
