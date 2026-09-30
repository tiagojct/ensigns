// Rule checks. A rule in a token file may name a check as "name" or
// "name:arg1,arg2"; the model tests run every named check against the
// resolved family. Checks work on tokens. The same rules also get lint tests
// on generated outputs in phase 4.
import { lstarDistance } from "../colour/grey.ts";
import { toOklch } from "../colour/oklab.ts";
import { MODES } from "./types.ts";
import type { ModeName, ResolvedFamily } from "./types.ts";

export type HueClass = "red" | "orange" | "yellow" | "green" | "cyan" | "blue" | "violet" | "magenta" | "neutral";

/**
 * The family of hues a colour belongs to, by OKLCH hue angle, or neutral when its chroma (below 0.04)
 * is too low to read as a hue. Pure red is at 29 degrees, yellow at 110, green at 142, cyan at 195,
 * blue at 264 and magenta at 328.
 */
export function hueClass(hex: string): HueClass {
  const { C, h } = toOklch(hex);
  if (C < 0.04) return "neutral";
  if (h < 10 || h >= 320) return "magenta";
  if (h < 45) return "red";
  if (h < 85) return "orange";
  if (h < 125) return "yellow";
  if (h < 180) return "green";
  if (h < 225) return "cyan";
  if (h < 280) return "blue";
  return "violet";
}

export interface CheckContext {
  family: ResolvedFamily;
  args: string[];
}

/** A check returns one message per failure. An empty list means it holds. */
export type RuleCheck = (ctx: CheckContext) => string[];

/** Hex values of every entry in the named palette groups. */
const hexesOf = (family: ResolvedFamily, groups: string[]): Set<string> => {
  const out = new Set<string>();
  for (const [key, colour] of family.palette) if (groups.some((g) => key.startsWith(`${g}.`))) out.add(colour.hex);
  return out;
};

const CHROME = ["roles.", "extra.", "surfaces.", "status."];
const isChrome = (address: string) => CHROME.some((p) => address.startsWith(p));

const eachMode = (ctx: CheckContext, fn: (m: ModeName) => string[]): string[] => MODES.flatMap((m) => fn(m));

/** Two colours that must not differ only as the named hue classes, for colour-vision reasons. */
const notConfusable = (ctx: CheckContext, one: HueClass, other: HueClass): string[] =>
  eachMode(ctx, (m) => {
    const [a, b] = ctx.args.slice(0, 2).map((address) => ctx.family.modes[m].colours.get(address ?? ""));
    if (!a || !b) return [`${m}: ${ctx.args.slice(0, 2).join(" and ")} must both exist`];
    const pair = [hueClass(a.hex), hueClass(b.hex)];
    return pair.includes(one) && pair.includes(other) && pair[0] !== pair[1]
      ? [`${m}: ${ctx.args[0]} (${pair[0]}) and ${ctx.args[1]} (${pair[1]}) differ only as ${one} and ${other}`]
      : [];
  });

export const RULE_CHECKS: Record<string, RuleCheck> = {
  // The accent is a mark. Among the core and extra roles, only the listed
  // ones (and accent itself) may take the accent's colour.
  "accent-only-in-roles": (ctx) =>
    eachMode(ctx, (m) => {
      const mode = ctx.family.modes[m];
      const accent = mode.colours.get("roles.accent");
      if (!accent) return [`${m}: no roles.accent`];
      const allowed = new Set(["accent", ...ctx.args]);
      const out: string[] = [];
      for (const [address, c] of mode.colours) {
        const role = address.startsWith("roles.") ? address.slice(6) : address.startsWith("extra.") ? address.slice(6) : null;
        if (role === null || allowed.has(role)) continue;
        if (c.hex === accent.hex && c.alpha === undefined) out.push(`${m}: ${address} uses the accent colour ${accent.hex}`);
      }
      return out;
    }),

  // Status carries no hue: every status colour has OKLCH chroma below the limit.
  "status-achromatic": (ctx) =>
    eachMode(ctx, (m) => {
      const limit = Number(ctx.args[0] ?? "0.02");
      const out: string[] = [];
      for (const [address, c] of ctx.family.modes[m].colours) {
        if (!address.startsWith("status.")) continue;
        const chroma = toOklch(c.hex).C;
        if (chroma >= limit) out.push(`${m}: ${address} has chroma ${chroma.toFixed(3)}, limit ${limit}`);
      }
      return out;
    }),

  // The interface accent never appears in a chart. Arguments: the palette groups that hold the accent ramp.
  "accent-not-in-data": (ctx) =>
    eachMode(ctx, (m) => {
      const ramp = hexesOf(ctx.family, ctx.args);
      const out: string[] = [];
      for (const [address, c] of ctx.family.modes[m].colours) {
        if (address.startsWith("data.") && !address.startsWith("data.plot.") && ramp.has(c.hex)) out.push(`${m}: ${address} uses ${c.hex} from the accent ramp`);
      }
      return out;
    }),

  // No colour of the named palette groups appears in interface chrome (roles, extra roles, surfaces, status).
  // Used for the data sweep and for the functional hues that belong to terminals and editors only.
  "group-not-in-chrome": (ctx) =>
    eachMode(ctx, (m) => {
      const banned = hexesOf(ctx.family, ctx.args);
      const out: string[] = [];
      for (const [address, c] of ctx.family.modes[m].colours) {
        if (isChrome(address) && banned.has(c.hex)) out.push(`${m}: ${address} uses ${c.hex} from ${ctx.args.join(", ")}`);
      }
      return out;
    }),

  // Two colours that carry different meanings differ in lightness by at least the given L*: lightness-gap:<address>,<address>,<L*>.
  "lightness-gap": (ctx) =>
    eachMode(ctx, (m) => {
      const [a, b] = ctx.args.slice(0, 2).map((address) => ctx.family.modes[m].colours.get(address ?? ""));
      const min = Number(ctx.args[2]);
      if (!a || !b || !Number.isFinite(min)) return [`${m}: lightness-gap needs two addresses that exist and a minimum in L*`];
      const gap = lstarDistance(a.hex, b.hex);
      return gap >= min ? [] : [`${m}: ${ctx.args[0]} and ${ctx.args[1]} differ by ${gap.toFixed(1)} L*, needs ${min}`];
    }),

  // Red against green alone is lost to a large share of readers. The two addresses must not be that pair.
  "not-red-green": (ctx) => notConfusable(ctx, "red", "green"),

  // Blue against violet, and blue against green, blur for readers with a tritan deficiency and for ageing eyes.
  "not-blue-violet": (ctx) => notConfusable(ctx, "blue", "violet"),
  "not-blue-green": (ctx) => notConfusable(ctx, "blue", "green"),

  // Hovers brighten in dark mode and darken in light mode: link-hover is lighter than link in dark, darker in light.
  "hover-direction": (ctx) =>
    eachMode(ctx, (m) => {
      const mode = ctx.family.modes[m];
      const link = mode.colours.get("roles.link");
      const hover = mode.colours.get("roles.link-hover");
      if (!link || !hover) return [`${m}: roles.link or roles.link-hover is missing`];
      const dl = toOklch(hover.hex).L - toOklch(link.hex).L;
      const ok = m === "dark" ? dl > 0 : dl < 0;
      return ok ? [] : [`${m}: link-hover is ${dl > 0 ? "lighter" : "darker"} than link (OKLab L difference ${dl.toFixed(3)})`];
    }),
};

export interface RuleResult {
  id: string;
  check: string;
  failures: string[];
}

/** Run every rule that names a check. Unknown check names fail loudly. */
export function runRuleChecks(family: ResolvedFamily): RuleResult[] {
  const results: RuleResult[] = [];
  for (const rule of family.source.rules ?? []) {
    if (!rule.check) continue;
    for (const check of Array.isArray(rule.check) ? rule.check : [rule.check]) {
      const [name, rest] = check.split(":");
      const fn = RULE_CHECKS[name ?? ""];
      if (!fn) {
        results.push({ id: rule.id, check, failures: [`no check named ${name}`] });
        continue;
      }
      results.push({ id: rule.id, check, failures: fn({ family, args: rest ? rest.split(",") : [] }) });
    }
  }
  return results;
}
