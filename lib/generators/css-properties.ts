// Pure CSS token serialisation, shared by exports and the family preview.
import { parseHex } from "../colour/srgb.ts";
import type { ModeName, Resolved, ResolvedFamily } from "../model/types.ts";

/** roles.bg becomes roles-bg, data.sequential.teal.3 becomes data-sequential-teal-3. */
export const addressClass = (address: string): string => address.replaceAll(".", "-");
export const addressProperty = (address: string): string => `--${addressClass(address)}`;

const kebab = (key: string): string => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** "{design.border.width.thin}" becomes design-border-width-thin: its custom property without the two dashes. */
export const designRefName = (ref: string): string => ref.replace(/^\{|\}$/g, "").split(".").map(kebab).join("-");

/** Hex when opaque; rgb() with the alpha when translucent. */
export function cssColour(c: Resolved): string {
  if (c.alpha === undefined) return c.hex;
  const [r, g, b] = parseHex(c.hex).map((v) => Math.round(v * 255));
  return `rgb(${r} ${g} ${b} / ${c.alpha})`;
}

const cssString = (s: string): string => `"${s.replace(/[\\"]/g, "\\$&").replace(/\n/g, "\\a ")}"`;

/** Every string, number or array of scalars in the design block with its key path. Arrays become space-separated. */
export function* designLeaves(value: unknown, path: string[] = []): Generator<[string[], string | number]> {
  if (typeof value === "string" || typeof value === "number") yield [path, value];
  else if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "string" || typeof v === "number")) {
      yield [path, value.join(" ")];
    }
  } else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) yield* designLeaves(v, [...path, key]);
  }
}

/**
 * A design value as CSS. Palette references become colours and design references var().
 * Anything that could break the stylesheet (a semicolon, a brace, a quote, unbalanced
 * parentheses) is written as a CSS string instead.
 */
function designValue(value: string | number, palette: Map<string, Resolved>): string {
  if (typeof value === "number") return String(value);
  const css = value
    .replace(/\{palette\.([a-z0-9][a-z0-9-]*\.[a-z0-9][a-z0-9-]*)\}/g, (_, key: string) => cssColour(palette.get(key)!))
    .replace(/\{design((?:\.[A-Za-z0-9_-]+)+)\}/g, (ref: string) => `var(--${designRefName(ref)})`);
  const bare = css.trim() !== "" && /^[^;{}"'`\\<>!\n]*$/.test(css) && css.split("(").length === css.split(")").length;
  return bare ? css : cssString(css);
}

const FALLBACK: Record<string, string> = { sans: "system-ui, sans-serif", serif: "ui-serif, serif", mono: "ui-monospace, monospace" };

/**
 * Every custom property of a family in a mode: one per colour address, one per design scalar
 * and one per typeface. The three generic typefaces are always defined, with the system
 * fallback alone when the family names none, so a panel never inherits the page's.
 */
export function scopeProperties(family: ResolvedFamily, mode: ModeName): [string, string][] {
  const out = new Map<string, string>();
  const put = (name: string, value: string) => {
    if (!/^--[A-Za-z0-9_-]+$/.test(name)) throw new Error(`${family.meta.id}: ${name} is not a valid custom property name`);
    if (out.has(name)) throw new Error(`${family.meta.id} ${mode}: two tokens map to the custom property ${name}`);
    out.set(name, value);
  };
  for (const [address, c] of family.modes[mode].colours) put(addressProperty(address), cssColour(c));
  for (const [address, c] of family.modes[mode].colours) {
    if (!address.startsWith("syntax.")) continue;
    const style = c.style ?? "";
    put(`${addressProperty(address)}-font-weight`, style.includes("bold") ? "700" : "400");
    put(`${addressProperty(address)}-font-style`, style.includes("italic") ? "italic" : "normal");
    put(`${addressProperty(address)}-text-decoration`, style === "underline" ? "underline" : style === "strikethrough" ? "line-through" : "none");
  }
  const status = family.source.modes[mode].status;
  if (status?.policy === "achromatic") {
    for (const name of ["neutral", "success", "warning", "critical"] as const) {
      const level = status[name];
      put(`--status-${name}-weight`, `var(--${designRefName(level.weight)})`);
      put(`--status-${name}-edge`, level.edge);
      put(`--status-${name}-icon`, cssString(level.icon));
    }
  }
  for (const [path, v] of designLeaves(family.source.design)) put(`--design-${path.map(kebab).join("-")}`, designValue(v, family.palette));
  const typography = family.source.typography ?? {};
  const face = (role: string, name: string | undefined) => {
    const fallback = FALLBACK[role] ?? FALLBACK.sans!;
    put(`--font-${kebab(role)}`, name === undefined ? fallback : `${cssString(name)}, ${fallback}`);
  };
  for (const role of Object.keys(FALLBACK)) face(role, typography[role]);
  for (const [role, name] of Object.entries(typography)) if (!(role in FALLBACK)) face(role, name);
  return [...out];
}
