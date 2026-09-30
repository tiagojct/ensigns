// Two layers. The JSON Schema says what shape a token file has (build time
// only: Ajv compiles schemas with new Function, which the site's Content
// Security Policy forbids, so never import this file in the browser).
// The semantic layer says what the shape cannot: that every reference
// resolves, that both modes define the same keys, and that declared pairs and
// distinct sets point at colours that exist.
import Ajv2020 from "ajv/dist/2020.js";
import { ModelError, resolveFamily } from "./resolve.ts";
import { distinctMembers } from "./sets.ts";
import { MODES } from "./types.ts";
import type { FamilyFile, ModeName, ResolvedFamily } from "./types.ts";

export interface Issue {
  level: "error" | "warn";
  code: string;
  where: string;
  message: string;
}

let compiled: ReturnType<Ajv2020["compile"]> | undefined;

export function validateSchema(file: unknown, schema: object): Issue[] {
  if (!compiled) {
    const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
    compiled = ajv.compile(schema);
  }
  if (compiled(file)) return [];
  return (compiled.errors ?? []).map((e) => ({
    level: "error" as const,
    code: "schema",
    where: e.instancePath || "/",
    message: `${e.message ?? "invalid"}${e.params && "allowedValues" in e.params ? ` (${JSON.stringify(e.params.allowedValues)})` : ""}`,
  }));
}

const PALETTE_STRING = /^\{palette\.([a-z0-9][a-z0-9-]*)\.([a-z0-9][a-z0-9-]*)\}$/;
const DESIGN_STRING = /^\{design((?:\.[A-Za-z0-9_-]+)+)\}$/;
const COLOUR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/;

/** Every string in a value that looks like a reference, with its JSON path. */
function* walkStrings(value: unknown, path: string): Generator<[string, string]> {
  if (typeof value === "string") yield [path, value];
  else if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* walkStrings(value[i], `${path}[${i}]`);
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) yield* walkStrings(v, path ? `${path}.${k}` : k);
  }
}

function designHas(design: unknown, segments: string[]): boolean {
  let cur: unknown = design;
  for (const s of segments) {
    if (cur && typeof cur === "object" && s in cur) cur = (cur as Record<string, unknown>)[s];
    else return false;
  }
  return true;
}

export function validateSemantics(file: FamilyFile): Issue[] {
  const issues: Issue[] = [];
  const error = (code: string, where: string, message: string) => issues.push({ level: "error", code, where, message });
  const warn = (code: string, where: string, message: string) => issues.push({ level: "warn", code, where, message });

  // References: every palette and design reference resolves.
  const used = new Set<string>();
  const paletteKeys = new Set<string>();
  for (const [g, entries] of Object.entries(file.palette)) for (const n of Object.keys(entries)) paletteKeys.add(`${g}.${n}`);
  const scan = (value: unknown, root: string) => {
    for (const [path, s] of walkStrings(value, root)) {
      const p = PALETTE_STRING.exec(s);
      if (p) {
        const key = `${p[1]}.${p[2]}`;
        used.add(key);
        if (!paletteKeys.has(key)) error("reference", path, `${s} does not exist in the palette`);
      } else if (s.startsWith("{palette.")) {
        error("reference", path, `${s} is not a valid palette reference (use {palette.group.name})`);
      }
      const d = DESIGN_STRING.exec(s);
      if (d && !designHas(file.design, d[1]!.split(".").slice(1))) error("reference", path, `${s} does not exist in design`);
    }
  };
  scan(file.palette, "palette");
  for (const m of MODES) scan(file.modes[m], `modes.${m}`);

  // Design: no colour literal, and any palette reference inside a longer string (a shadow, say) must resolve.
  for (const [path, s] of walkStrings(file.design ?? {}, "design")) {
    if (COLOUR_LITERAL.test(s)) error("design-colour", path, `"${s}" is a colour value; colours belong in the palette`);
    for (const m of s.matchAll(/\{palette\.([a-z0-9][a-z0-9-]*)\.([a-z0-9][a-z0-9-]*)\}/g)) {
      const key = `${m[1]}.${m[2]}`;
      used.add(key);
      if (!paletteKeys.has(key)) error("reference", path, `${m[0]} does not exist in the palette`);
    }
  }

  // Resolution (catches cycles, translucent chains, bad surfaces).
  let resolved: ResolvedFamily | undefined;
  if (!issues.some((i) => i.code === "reference")) {
    try {
      resolved = resolveFamily(file);
    } catch (e) {
      if (e instanceof ModelError) error("resolve", "/", e.message);
      else throw e;
    }
  }

  // Unused palette entries are a warning: scales legitimately hold spare steps.
  for (const key of paletteKeys) if (!used.has(key)) warn("unused-palette", `palette.${key}`, "no role, syntax, ansi, status or data entry refers to it");

  // Both modes define the same keys.
  if (resolved) {
    const dark = new Set(resolved.modes.dark.colours.keys());
    const light = new Set(resolved.modes.light.colours.keys());
    for (const a of dark) if (!light.has(a)) error("mode-parity", a, "defined in dark but not in light");
    for (const a of light) if (!dark.has(a)) error("mode-parity", a, "defined in light but not in dark");
    if ((resolved.modes.dark.dataRef ?? "") !== (resolved.modes.light.dataRef ?? "")) {
      error("mode-parity", "data.ref", "the two modes refer to different data sources");
    }
  }

  // Blocks the family's targets need.
  const exclude = new Set(file.targets?.exclude ?? []);
  const derived = new Set(file.derived ?? []);
  const editors = ["vscode", "zed", "neovim"].some((t) => !exclude.has(t));
  const terminals = !exclude.has("terminals");
  for (const m of MODES) {
    const mode = file.modes[m];
    if (editors && !derived.has("syntax") && !mode.syntax) error("missing-block", `modes.${m}.syntax`, "required when an editor bundle is not excluded");
    if (terminals && !derived.has("ansi") && !mode.ansi) error("missing-block", `modes.${m}.ansi`, "required when the terminals bundle is not excluded");
    if (terminals && !derived.has("terminal") && !mode.terminal) error("missing-block", `modes.${m}.terminal`, "required when the terminals bundle is not excluded");
  }

  // Identity of the ships.
  const meta = file.meta;
  if (!meta.host) {
    for (const k of ["chapter", "chapterTitle", "quote"] as const) {
      if (meta[k] === undefined) error("meta", `meta.${k}`, "every ship has a chapter, a chapter title and a quote");
    }
  }

  // Pairs and distinct sets point at colours that exist.
  if (resolved) {
    const modesOf = (only?: ModeName[]) => (only ?? [...MODES]) as ModeName[];
    (file.pairs ?? []).forEach((p, i) => {
      for (const m of modesOf(p.modes)) {
        for (const side of ["fg", "bg"] as const) {
          if (!resolved!.modes[m].colours.has(p[side])) error("pair", `pairs[${i}].${side}`, `${p[side]} does not exist in ${m}`);
        }
      }
    });
    (file.distinct ?? []).forEach((d, i) => {
      for (const m of modesOf(d.modes)) {
        const members = distinctMembers(resolved!.modes[m], d);
        if (members.length < 2) error("distinct", `distinct[${i}]`, `${d.id} has fewer than two members in ${m}`);
        const names = new Set(members.map((x) => x.name));
        for (const kind of ["reinforced", "aliases"] as const) {
          for (const [a, b] of d[kind] ?? []) {
            for (const n of [a, b]) if (!names.has(n)) error("distinct", `distinct[${i}].${kind}`, `${n} is not a member of ${d.id} in ${m}`);
          }
        }
        for (const n of d.patterned ?? []) if (!names.has(n)) error("distinct", `distinct[${i}].patterned`, `${n} is not a member of ${d.id} in ${m}`);
      }
    });

    // Declarations that profiles read point at colours that exist.
    const design = file.design;
    const exists = (m: ModeName, address: string) => resolved!.modes[m].colours.has(address);
    if (design?.overlay) {
      design.overlay.fills.forEach((address, i) => {
        for (const m of MODES) {
          const c = resolved!.modes[m].colours.get(address);
          if (!c) error("design-overlay", `design.overlay.fills[${i}]`, `${address} does not exist in ${m}`);
          else if (c.alpha === undefined) error("design-overlay", `design.overlay.fills[${i}]`, `${address} is opaque in ${m}; an overlay fill is a translucent palette entry`);
        }
      });
    }
    if (design?.clinical) {
      const { critical, levels, triage } = design.clinical;
      const lists: [string, typeof levels][] = [["levels", levels], ...(triage ? ([["triage", triage]] as [string, typeof levels][]) : [])];
      for (const [listName, list] of lists) {
        const seen = new Set<string>();
        list.forEach((level, i) => {
          const where = `design.clinical.${listName}[${i}]`;
          if (seen.has(level.name)) error("design-clinical", where, `two ${listName} are called ${level.name}`);
          seen.add(level.name);
          for (const side of ["fg", "fill", "border"] as const) {
            for (const m of MODES) if (!exists(m, level[side])) error("design-clinical", `${where}.${side}`, `${level[side]} does not exist in ${m}`);
          }
        });
      }
      if (!levels.some((l) => l.name === critical)) error("design-clinical", "design.clinical.critical", `${critical} is not one of the levels`);
    }
  }

  return issues;
}

/** Schema first; semantics only when the shape is right. */
export function validateFamily(file: unknown, schema: object): Issue[] {
  const shape = validateSchema(file, schema);
  if (shape.length > 0) return shape;
  return validateSemantics(file as FamilyFile);
}
