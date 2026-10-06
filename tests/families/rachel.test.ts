// Rachel: the promises of the brief that no shared test states. The harness tests already run every
// profile the family lists and every rule that names a check; these lock the counts, the names, the
// order of the status ladder, the declarations the profiles read and the rules the specimen keeps.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lstar, oklabDistance } from "../../lib/colour/index.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { parseChapters, quoteIsIn } from "../../lib/model/quotes.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { ModeName } from "../../lib/model/types.ts";

const root = repoRoot();
const loaded = loadFamilies().find((f) => f.dir === "rachel");
if (!loaded) throw new Error("families/rachel/rachel.tokens.json not found");
const file = loaded.file;
const family = resolveFamily(file);
const MODES: ModeName[] = ["light", "dark"];
const LEVELS = ["success", "warning", "danger"] as const;

const hex = (mode: ModeName, address: string): string => {
  const c = family.modes[mode].colours.get(address);
  if (!c) throw new Error(`no ${address} in ${mode}`);
  return c.hex;
};
/** A token of the design block by dotted path. */
const design = (path: string): string | number => {
  let cur: unknown = file.design;
  for (const part of path.split(".")) cur = (cur as Record<string, unknown> | undefined)?.[part];
  if (typeof cur !== "string" && typeof cur !== "number") throw new Error(`design.${path} is not a string or a number`);
  return cur;
};
const px = (value: string | number, rootPx = 16): number => {
  const text = String(value);
  return text.endsWith("rem") ? parseFloat(text) * rootPx : parseFloat(text);
};

describe("rachel", () => {
  it("is the ship of chapter 128, quotes the chapter and puts the Epilogue sentence in quotes", () => {
    const chapters = parseChapters(readFileSync(join(root, "sources/moby-dick.txt"), "utf8"));
    expect(file.meta).toMatchObject({ id: "rachel", name: "Rachel", version: "0.1.0", chapter: 128 });
    expect(quoteIsIn(chapters.get(128), file.meta.quote ?? "")).toBe(true);
    const epilogue = file.meta.quotes?.find((q) => q.chapter === "Epilogue");
    expect(epilogue?.text).toMatch(/^It was the devious-cruising Rachel/);
    expect(quoteIsIn(chapters.get(136), epilogue?.text ?? "")).toBe(true);
  });

  it("lists the four environments of the brief and leaves out the editor and terminal bundles", () => {
    expect(file.meta.environments).toEqual(["aged-eye", "sunlight", "print-grey", "cvd"]);
    expect(file.targets?.exclude).toEqual(["vscode", "zed", "neovim", "terminals"]);
    for (const m of MODES) {
      for (const block of ["syntax", "ansi", "terminal", "data"] as const) expect(file.modes[m][block], `${m} ${block}`).toBeUndefined();
    }
  });

  it("has two labelled modes whose extra roles match", () => {
    expect([file.modes.dark.label, file.modes.light.label]).toEqual(["Beacon", "Daylight"]);
    expect(Object.keys(file.modes.dark.roles.extra ?? {})).toEqual(Object.keys(file.modes.light.roles.extra ?? {}));
  });

  it("uses fifteen colours in each mode", () => {
    for (const m of MODES) {
      const distinct = new Set([...family.modes[m].colours.values()].map((c) => c.hex));
      expect(distinct.size, m).toBe(15);
    }
    expect(family.palette.size).toBe(30);
  });

  it("has one action colour, with its hover one step on", () => {
    for (const m of MODES) {
      const action = hex(m, "roles.accent");
      for (const role of ["roles.link", "roles.button", "roles.focus"]) expect(hex(m, role), `${m} ${role}`).toBe(action);
      expect(hex(m, "roles.link-hover")).not.toBe(action);
      expect(hex(m, "extra.button-hover")).toBe(hex(m, "roles.link-hover"));
    }
  });

  it("keeps the action colour and its hover 0.03 or more from the accents of the four migrated families", () => {
    const others = loadFamilies().filter((f) => ["pequod", "goney", "jungfrau", "rosebud"].includes(f.dir)).map((f) => resolveFamily(f.file));
    expect(others.length).toBe(4);
    for (const m of MODES) {
      const pool = others.flatMap((o) => [...o.modes[m].colours].filter(([a]) => a.startsWith("accents.") || ["roles.accent", "roles.link", "roles.link-hover", "roles.focus"].includes(a)).map(([a, c]) => ({ a: `${o.meta.id} ${a}`, hex: c.hex })));
      for (const role of ["roles.accent", "roles.link-hover"]) {
        for (const other of pool) expect(oklabDistance(hex(m, role), other.hex), `${m} ${role} and ${other.a}`).toBeGreaterThanOrEqual(0.03);
      }
    }
  });

  it("has no subtle grey: text-subtle is text-muted", () => {
    for (const m of MODES) expect(file.modes[m].roles["text-subtle"]).toBe(file.modes[m].roles["text-muted"]);
  });

  it("has three chromatic status levels and gives each an icon and words", () => {
    for (const m of MODES) {
      const status = file.modes[m].status as Record<string, unknown>;
      expect(status.policy).toBe("chromatic");
      expect(Object.keys(status).sort()).toEqual(["danger", "policy", "success", "warning"]);
    }
    const icons = LEVELS.map((l) => design(`status.${l}.icon`));
    const labels = LEVELS.map((l) => design(`status.${l}.label`));
    expect(new Set(icons).size).toBe(3);
    expect(labels).toEqual(["Fine", "Needs attention", "Contact your clinician"]);
    for (const l of LEVELS) for (const part of ["fg", "fill", "border", "on"]) expect(family.modes.light.colours.has(`extra.${l}-${part}`), `${l}-${part}`).toBe(true);
  });

  it("orders the status colours by lightness, amber lightest and brick or coral darkest, at least 12 L* apart", () => {
    for (const m of MODES) {
      const [warning, success, danger] = [hex(m, "status.warning"), hex(m, "status.success"), hex(m, "status.danger")].map(lstar) as [number, number, number];
      expect(warning - success, `${m} amber to teal`).toBeGreaterThanOrEqual(12);
      expect(success - danger, `${m} teal to ${m === "light" ? "brick" : "coral"}`).toBeGreaterThanOrEqual(12);
    }
  });

  it("declares every text pair at 7:1 and keeps the distinct sets honest", () => {
    const text = (file.pairs ?? []).filter((p) => p.kind === "text");
    expect(text.length).toBeGreaterThanOrEqual(10);
    for (const p of text) expect(p.min, `${p.fg} on ${p.bg}`).toBe(7);
    const sets = file.distinct ?? [];
    expect(sets.map((d) => d.id)).toEqual(["status", "hues"]);
    expect(sets[0]?.for).toEqual(["aged-eye", "sunlight", "print-grey"]);
    expect(sets[1]?.for).toEqual(["aged-eye", "sunlight"]);
    for (const d of sets) {
      expect(d.min ?? 0.06, d.id).toBeGreaterThanOrEqual(0.06);
      for (const key of ["cvd", "reinforced", "patterned", "aliases"] as const) expect(d[key], `${d.id} ${key}`).toBeUndefined();
    }
  });

  it("names the rules of the brief, each with the checks that exist", () => {
    const rules = new Map((file.rules ?? []).map((r) => [r.id, r]));
    for (const id of ["one-action-colour", "status-by-lightness", "no-blue-against-violet-or-green", "no-red-against-green", "urgent-has-icon-and-words"]) expect(rules.has(id), id).toBe(true);
    const checks = (id: string): string[] => [rules.get(id)?.check ?? []].flat();
    expect(checks("no-blue-against-violet-or-green").filter((c) => c.startsWith("not-blue-violet:")).length).toBe(6);
    expect(checks("no-blue-against-violet-or-green").filter((c) => c.startsWith("not-blue-green:")).length).toBe(6);
    expect(checks("no-red-against-green").length).toBe(3);
    expect(rules.get("urgent-has-icon-and-words")?.check).toBeUndefined();
  });

  it("sets a large type scale, big touch targets and a scale of space in tokens", () => {
    expect(px(design("type.size.body"))).toBeGreaterThanOrEqual(20);
    expect(px(design("type.size.min"))).toBeGreaterThanOrEqual(18);
    expect(px(design("type.size.min"))).toBeLessThan(px(design("type.size.body")));
    expect(Number(design("type.line-height.body"))).toBeGreaterThanOrEqual(1.5);
    expect(px(design("touch.target.min"))).toBeGreaterThanOrEqual(48);
    expect(px(design("touch.gap.min"))).toBeGreaterThanOrEqual(8);
    expect(px(design("focus.width"))).toBeGreaterThanOrEqual(3);
    const space = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"].map((k) => px(design(`space.${k}`)));
    expect([...space].sort((a, b) => a - b)).toEqual(space);
    expect(new Set(space).size).toBe(7);
  });

  it("names Atkinson Hyperlegible Next and no other typeface", () => {
    expect(file.typography).toEqual({ sans: "Atkinson Hyperlegible Next" });
  });
});

describe("rachel specimen", () => {
  const html = readFileSync(join(root, "families/rachel/specimen/specimen.html"), "utf8");
  const css = readFileSync(join(root, "families/rachel/specimen/specimen.css"), "utf8");

  it("shows a phone screen, a leaflet page and a consent form, with the three status levels as icon and words", () => {
    expect([...html.matchAll(/<h5 [^>]*>([^<]+)<\/h5>/g)].map((m) => m[1])).toEqual(["Phone screen", "Leaflet page", "Consent form"]);
    const labels = LEVELS.map((l) => String(design(`status.${l}.label`)));
    for (const l of LEVELS) {
      const boxes = [...html.matchAll(new RegExp(`<(\\w+)[^>]*data-status="${l}"[^>]*>([\\s\\S]*?)</\\1>`, "g"))];
      expect(boxes.length, l).toBeGreaterThan(0);
      for (const b of boxes) expect(b[2], `${l} has an icon`).toContain("<svg");
    }
    for (const label of labels) expect(html, label).toContain(label);
    expect(html.match(/class="prose"/g)?.length).toBe(1);
    expect(html.match(/aria-current/g)?.length).toBe(1);
    expect(html.match(/type="checkbox"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(html).toContain('type="submit"');
  });

  it("keeps every class under sp- (prose aside) and sets every font size from a size token of 18 px or more", () => {
    const classes = [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1]!.split(/\s+/));
    expect(classes.filter((c) => !c.startsWith("sp-") && c !== "prose")).toEqual([]);
    const sizes = [...css.matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1]!.trim());
    expect(sizes.length).toBeGreaterThan(10);
    for (const s of sizes) {
      const token = /^var\(--design-type-size-([a-z0-9]+)\)$/.exec(s);
      expect(token, `font-size: ${s}`).not.toBeNull();
      expect(px(design(`type.size.${token![1]}`)), `font-size: ${s}`).toBeGreaterThanOrEqual(18);
    }
  });
});
