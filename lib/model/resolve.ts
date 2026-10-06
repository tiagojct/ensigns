// Follow every {palette.group.name} reference in a family token file and
// return the colours as hex, per mode, by address. Pure: no file system, so
// the build, the tests and the browser run the same code.
//
// Addresses are paths inside one mode:
//   roles.<core role>            extra.<name>            surfaces.<name>
//   syntax.<role>                ansi.<slot>             terminal.<key>
//   status.<level>               status.<level>.fill     status.<level>.accent
//   data.categorical.<name>      data.sequential.<scale>.<n>   data.diverging.<scale>.<n>
//   data.plot.<key>
// extra.<name> is roles.extra.<name>. Steps of a scale are numbered from 1.
import { blend } from "../colour/composite.ts";
import { CORE_ROLES, MODES } from "./types.ts";
import type {
  Address,
  FamilyFile,
  ModeFile,
  ModeName,
  Palette,
  PaletteRef,
  Resolved,
  ResolvedFamily,
  ResolvedMode,
  Style,
} from "./types.ts";

export class ModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelError";
  }
}

const PALETTE_REF = /^\{palette\.([a-z0-9][a-z0-9-]*)\.([a-z0-9][a-z0-9-]*)\}$/;

/** "{palette.log.100}" becomes "log.100". */
export function paletteKey(ref: PaletteRef, where = "reference"): string {
  const m = PALETTE_REF.exec(ref);
  if (!m) throw new ModelError(`${where}: "${ref}" is not a palette reference`);
  return `${m[1]}.${m[2]}`;
}

/** Palette entries by group.name, in file order within each kind (opaque first, then translucent). */
export function resolvePalette(palette: Palette): Map<string, Resolved> {
  const out = new Map<string, Resolved>();
  const translucent: [string, PaletteRef, number][] = [];
  for (const [group, entries] of Object.entries(palette)) {
    for (const [name, value] of Object.entries(entries)) {
      const key = `${group}.${name}`;
      if (typeof value === "string") out.set(key, { hex: value, from: key });
      else if ("hex" in value) out.set(key, { hex: value.hex, from: key });
      else translucent.push([key, value.ref, value.alpha]);
    }
  }
  for (const [key, ref, alpha] of translucent) {
    const base = out.get(paletteKey(ref, `palette.${key}`));
    if (!base) throw new ModelError(`palette.${key}: unknown palette entry ${ref}`);
    if (base.alpha !== undefined) {
      throw new ModelError(`palette.${key}: a translucent entry cannot refer to another translucent entry (${ref})`);
    }
    out.set(key, { hex: base.hex, alpha, from: key });
  }
  return out;
}

export function resolveMode(palette: Map<string, Resolved>, mode: ModeFile, where: string): ResolvedMode {
  const colours = new Map<Address, Resolved>();

  const get = (ref: PaletteRef, at: string, style?: Style): Resolved => {
    const base = palette.get(paletteKey(ref, at));
    if (!base) throw new ModelError(`${at}: unknown palette entry ${ref}`);
    return style ? { ...base, style } : { ...base };
  };
  const put = (address: Address, ref: PaletteRef, style?: Style) =>
    colours.set(address, get(ref, `${where}.${address}`, style));

  for (const role of CORE_ROLES) put(`roles.${role}`, mode.roles[role]);
  for (const [name, ref] of Object.entries(mode.roles.extra ?? {})) put(`extra.${name}`, ref);
  for (const [name, ref] of Object.entries(mode.accents ?? {})) put(`accents.${name}`, ref);

  // Surfaces may be drawn over other surfaces, so resolve them on demand.
  const defs = mode.surfaces ?? {};
  const inProgress = new Set<string>();
  const surface = (name: string): Resolved => {
    const address = `surfaces.${name}`;
    const done = colours.get(address);
    if (done) return done;
    if (inProgress.has(name)) throw new ModelError(`${where}.${address}: surfaces refer to each other in a cycle`);
    inProgress.add(name);
    const def = defs[name];
    if (def === undefined) throw new ModelError(`${where}.${address}: no such surface`);
    let resolved: Resolved;
    if (typeof def === "string") {
      resolved = get(def, `${where}.${address}`);
    } else {
      const base = get(def.ref, `${where}.${address}`);
      let over = colours.get(def.over);
      if (!over && def.over.startsWith("surfaces.")) over = surface(def.over.slice("surfaces.".length));
      if (!over) throw new ModelError(`${where}.${address}: "over" points at ${def.over}, which does not exist`);
      if (over.alpha !== undefined || base.alpha !== undefined) {
        throw new ModelError(`${where}.${address}: both layers of a surface must be opaque`);
      }
      resolved = { hex: blend(base.hex, def.alpha, over.hex), from: `${base.from} at ${def.alpha} over ${def.over}` };
    }
    colours.set(address, resolved);
    inProgress.delete(name);
    return resolved;
  };
  for (const name of Object.keys(defs)) surface(name);

  for (const [role, value] of Object.entries(mode.syntax ?? {})) {
    if (typeof value === "string") put(`syntax.${role}`, value);
    else put(`syntax.${role}`, value.color, value.style);
  }
  for (const [slot, ref] of Object.entries(mode.ansi ?? {})) put(`ansi.${slot}`, ref);
  for (const [key, ref] of Object.entries(mode.terminal ?? {})) put(`terminal.${key}`, ref);

  const status = mode.status;
  if (status) {
    for (const [level, value] of Object.entries(status)) {
      if (level === "policy") continue;
      if (typeof value === "string") put(`status.${level}`, value);
      else if (typeof value === "object" && value !== null) {
        put(`status.${level}.fill`, (value as { fill: PaletteRef }).fill);
        put(`status.${level}.accent`, (value as { accent: PaletteRef }).accent);
      }
    }
  }

  let dataRef: string | undefined;
  const data = mode.data;
  if (data) {
    if ("ref" in data) {
      dataRef = data.ref;
    } else {
      for (const [name, ref] of Object.entries(data.categorical?.colors ?? {})) put(`data.categorical.${name}`, ref);
      for (const kind of ["sequential", "diverging"] as const) {
        for (const [scale, def] of Object.entries(data[kind] ?? {})) {
          def.colors.forEach((ref, i) => put(`data.${kind}.${scale}.${i + 1}`, ref));
        }
      }
      for (const [key, ref] of Object.entries(data.plot ?? {})) put(`data.plot.${key}`, ref);
    }
  }

  return { label: mode.label, colours, dataRef };
}

export function resolveFamily(file: FamilyFile): ResolvedFamily {
  const palette = resolvePalette(file.palette);
  const modes = {} as Record<ModeName, ResolvedMode>;
  for (const m of MODES) modes[m] = resolveMode(palette, file.modes[m], `modes.${m}`);
  return { meta: file.meta, palette, modes, source: file };
}

/** The colour at an address, or a ModelError that names the address. */
export function at(mode: ResolvedMode, address: Address, where = "mode"): Resolved {
  const c = mode.colours.get(address);
  if (!c) throw new ModelError(`${where}: no colour at ${address}`);
  return c;
}

/** The opaque hex of a colour drawn over a background. Translucent entries are blended; opaque ones pass through. */
export function flattenOver(colour: Resolved, backgroundHex: string): string {
  return colour.alpha === undefined ? colour.hex : blend(colour.hex, colour.alpha, backgroundHex);
}
