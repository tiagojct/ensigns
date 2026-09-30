// assets/tokens.css: one block of custom properties per family (or candidate) and
// mode, the Pequod values for the page itself, and one class per colour address
// for swatches and samples. Colour values reach CSS only from here, and only from
// the resolved token files.
import { parseHex } from "../../lib/colour/srgb.ts";
import { MODES } from "../../lib/model/types.ts";
import type { ModeName, Resolved, ResolvedFamily } from "../../lib/model/types.ts";

export interface Scope {
  /** The data-scope value: the family id, or <id>--<candidate>. */
  scope: string;
  family: ResolvedFamily;
}

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

/** Every string or number in the design block with its key path. Arrays, and what they hold, are left out. */
export function* designLeaves(value: unknown, path: string[] = []): Generator<[string[], string | number]> {
  if (typeof value === "string" || typeof value === "number") yield [path, value];
  else if (value && typeof value === "object" && !Array.isArray(value)) {
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

const block = (selector: string, props: [string, string][], indent = ""): string =>
  `${indent}${selector} {\n${props.map(([k, v]) => `${indent}  ${k}: ${v};`).join("\n")}\n${indent}}\n`;

/** The border widths that achromatic status levels name, as design-... names. */
function statusWeights(scopes: Scope[]): string[] {
  const out = new Set<string>();
  for (const { family } of scopes) {
    for (const mode of MODES) {
      const status = family.source.modes[mode].status;
      if (status?.policy !== "achromatic") continue;
      for (const level of [status.neutral, status.success, status.warning, status.critical]) out.add(designRefName(level.weight));
    }
  }
  return [...out];
}

/** chrome is the family whose values the page itself takes (Pequod); without it the page keeps the browser's defaults. */
export function tokensCss(scopes: Scope[], chrome: ResolvedFamily | undefined): string {
  const parts = ["/* Generated by scripts/pages/build.ts from the family token files. Do not edit. */\n"];
  if (chrome) {
    parts.push(block(":root", [["color-scheme", "light dark"], ...scopeProperties(chrome, "light")]));
    parts.push(`@media (prefers-color-scheme: dark) {\n${block(":root", scopeProperties(chrome, "dark"), "  ")}}\n`);
  } else {
    parts.push(block(":root", [["color-scheme", "light dark"]]));
  }
  for (const { scope, family } of scopes) {
    for (const mode of MODES) parts.push(block(`[data-scope="${scope}"][data-mode="${mode}"]`, scopeProperties(family, mode)));
  }

  const addresses = new Set<string>();
  for (const { family } of scopes) for (const mode of MODES) for (const a of family.modes[mode].colours.keys()) addresses.add(a);
  const each = (make: (cls: string, prop: string) => string) => [...addresses].map((a) => make(addressClass(a), addressProperty(a))).join("");
  parts.push("\n/* Swatches and sample backgrounds. */\n", each((c, p) => `.sw-${c} { background-color: var(${p}); }\n`));
  parts.push("\n/* Sample text colours. */\n", each((c, p) => `.fg-${c} { color: var(${p}); }\n`));
  parts.push("\n/* Sample border colours. */\n", each((c, p) => `.bc-${c} { border-color: var(${p}); }\n`));
  const weights = statusWeights(scopes);
  if (weights.length > 0) parts.push("\n/* Border widths of achromatic status levels. */\n", ...weights.map((w) => `.bw-${w} { border-width: var(--${w}); }\n`));
  return parts.join("");
}
