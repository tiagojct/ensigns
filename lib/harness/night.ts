// night: reading, writing and code in a dark room. The argument is glare,
// halation and dark adaptation, not sleep. Dark mode: ground luminance in a
// band, body text at 7:1 to 11:1, muted text at AA. Both modes: no token
// brighter than a relative luminance cap, and no text role in the blue to
// violet range at visible chroma. Light mode (lamplight): a dimmed paper.
import { apcaLc } from "../colour/apca.ts";
import { toOklch } from "../colour/oklab.ts";
import { contrastRatio, relativeLuminance } from "../colour/wcag.ts";
import { ANSI_SLOTS, MODES, SYNTAX_ROLES } from "../model/types.ts";
import type { ModeName, ResolvedFamily } from "../model/types.ts";
import { apcaAllowed } from "./common.ts";
import { fmt, num } from "./types.ts";
import type { Check, Thresholds } from "./types.ts";

const PROFILE = "night";

const TEXT_ROLES = ["roles.text", "roles.text-muted", "roles.text-subtle", "roles.link", "roles.link-hover", "roles.accent"];

/** Addresses whose colour is drawn as text on the ground. */
function textAddresses(): string[] {
  return [
    ...TEXT_ROLES,
    ...SYNTAX_ROLES.map((r) => `syntax.${r}`),
    ...ANSI_SLOTS.filter((s) => s !== "black").map((s) => `ansi.${s}`),
    "terminal.foreground",
  ];
}

export function night(family: ResolvedFamily, t: Thresholds): Check[] {
  const out: Check[] = [];
  const bandMin = num(t, "profiles.night.darkBackgroundLuminance.min");
  const bandMax = num(t, "profiles.night.darkBackgroundLuminance.max");
  const targetMin = num(t, "profiles.night.darkBackgroundTarget.min");
  const targetMax = num(t, "profiles.night.darkBackgroundTarget.max");
  const bodyMin = num(t, "profiles.night.bodyContrast.min");
  const bodyMax = num(t, "profiles.night.bodyContrast.max");
  const mutedMin = num(t, "profiles.night.mutedContrast.min");
  const cap = num(t, "profiles.night.maxTokenLuminance.max");
  const hueMin = num(t, "profiles.night.textHue.hueMin");
  const hueMax = num(t, "profiles.night.textHue.hueMax");
  const chromaAbove = num(t, "profiles.night.textHue.chromaAbove");
  const paperMin = num(t, "profiles.night.lamplightPaperLuminance.min");
  const paperMax = num(t, "profiles.night.lamplightPaperLuminance.max");
  const paperBody = num(t, "profiles.night.lamplightBodyContrast.min");

  const hexAt = (m: ModeName, address: string) => family.modes[m].colours.get(address)?.hex;

  // Dark mode.
  const dark = {
    bg: hexAt("dark", "roles.bg"),
    text: hexAt("dark", "roles.text"),
    muted: hexAt("dark", "roles.text-muted"),
  };
  if (dark.bg && dark.text && dark.muted) {
    const y = relativeLuminance(dark.bg);
    out.push({ profile: PROFILE, id: "dark ground luminance", mode: "dark", ok: y >= bandMin && y <= bandMax, level: "error", value: y, limit: bandMax, detail: `dark ground ${dark.bg} has luminance ${fmt(y, 4)}, band ${bandMin} to ${bandMax}` });
    out.push({ profile: PROFILE, id: "dark ground target", mode: "dark", ok: y >= targetMin && y <= targetMax, level: "warn", value: y, limit: targetMax, detail: `dark ground luminance ${fmt(y, 4)}, target ${targetMin} to ${targetMax}` });
    const body = contrastRatio(dark.text, dark.bg);
    out.push({ profile: PROFILE, id: "dark body contrast", mode: "dark", ok: body >= bodyMin && body <= bodyMax, level: "error", value: body, limit: bodyMin, detail: `body text ${fmt(body)}:1, band ${bodyMin} to ${bodyMax}` });
    const muted = contrastRatio(dark.muted, dark.bg);
    out.push({ profile: PROFILE, id: "dark muted contrast", mode: "dark", ok: muted >= mutedMin, level: "error", value: muted, limit: mutedMin, detail: `muted text ${fmt(muted)}:1, needs ${mutedMin}` });
    if (apcaAllowed(family)) {
      const lc = apcaLc(dark.text, dark.bg);
      out.push({ profile: PROFILE, id: "apca dark body", mode: "dark", ok: true, level: "warn", report: true, value: lc, detail: `body text APCA Lc ${fmt(lc, 1)}` });
    }
  }

  // Lamplight (light) mode.
  const paper = hexAt("light", "roles.bg");
  const ink = hexAt("light", "roles.text");
  if (paper && ink) {
    const y = relativeLuminance(paper);
    out.push({ profile: PROFILE, id: "lamplight paper luminance", mode: "light", ok: y >= paperMin && y <= paperMax, level: "error", value: y, limit: paperMax, detail: `paper ${paper} has luminance ${fmt(y, 3)}, band ${paperMin} to ${paperMax}` });
    const body = contrastRatio(ink, paper);
    out.push({ profile: PROFILE, id: "lamplight body contrast", mode: "light", ok: body >= paperBody, level: "error", value: body, limit: paperBody, detail: `body text ${fmt(body)}:1, needs ${paperBody}` });
    if (apcaAllowed(family)) {
      const lc = apcaLc(ink, paper);
      out.push({ profile: PROFILE, id: "apca lamplight body", mode: "light", ok: true, level: "warn", report: true, value: lc, detail: `body text APCA Lc ${fmt(lc, 1)}` });
    }
  }

  for (const m of MODES) {
    // Brightness cap over every colour in the mode.
    const over: string[] = [];
    let brightest = 0;
    for (const [address, c] of family.modes[m].colours) {
      const y = relativeLuminance(c.hex);
      brightest = Math.max(brightest, y);
      if (y > cap) over.push(`${address} ${c.hex} (${fmt(y, 2)})`);
    }
    out.push({
      profile: PROFILE, id: "brightness cap", mode: m, ok: over.length === 0, level: "error", value: brightest, limit: cap,
      detail: over.length ? `${over.length} colours above luminance ${cap} in ${m}: ${over.slice(0, 8).join(", ")}${over.length > 8 ? ", ..." : ""}` : `no colour above luminance ${cap} in ${m}`,
    });

    // No blue text.
    const blue: string[] = [];
    for (const address of textAddresses()) {
      const c = family.modes[m].colours.get(address);
      if (!c) continue;
      const k = toOklch(c.hex);
      if (k.h >= hueMin && k.h <= hueMax && k.C > chromaAbove) blue.push(`${address} ${c.hex} (hue ${fmt(k.h, 0)}, chroma ${fmt(k.C, 3)})`);
    }
    out.push({
      profile: PROFILE, id: "no blue text", mode: m, ok: blue.length === 0, level: "error",
      detail: blue.length ? `text roles in the blue range in ${m}: ${blue.join(", ")}` : `no text role with hue ${hueMin} to ${hueMax} above chroma ${chromaAbove} in ${m}`,
    });
  }
  return out;
}
