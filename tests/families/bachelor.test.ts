// What the brief for Bachelor promises, locked: eight flags in two luminance bands, an ink for each,
// a print ladder with three patterned flags, and a colour vision set that has no way out. The profile
// checks themselves run over every family in tests/environments.
import { describe, expect, it } from "vitest";
import { lstar } from "../../lib/colour/grey.ts";
import { relativeLuminance } from "../../lib/colour/wcag.ts";
import { loadCandidates, loadFamilies } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { MODES } from "../../lib/model/types.ts";

const loaded = loadFamilies().find((f) => f.dir === "bachelor")!;
const file = loaded.file;
const family = resolveFamily(file);
const colour = (mode: "dark" | "light", address: string): string => family.modes[mode].colours.get(address)!.hex;

const WHEEL = ["red", "orange", "yellow", "green", "cyan", "blue", "violet", "magenta"];
const DEEP = ["red", "blue", "violet", "magenta"];
const BRIGHT = ["orange", "yellow", "green", "cyan"];
const PATTERNED = ["green", "cyan", "magenta"];

describe("Bachelor", () => {
  it("is chapter 115 with the environments of its brief and no editor or terminal bundle", () => {
    expect(file.meta.id).toBe("bachelor");
    expect(file.meta.version).toBe("0.1.0");
    expect(file.meta.chapter).toBe(115);
    expect(file.meta.chapterTitle).toBe("The Pequod Meets The Bachelor");
    expect(file.meta.quote).toBe("Signals, ensigns, and jacks of all colours were flying from her rigging, on every side.");
    expect(file.meta.environments).toEqual(["projector", "cvd", "print-grey"]);
    expect(file.targets?.exclude).toEqual(["vscode", "zed", "neovim", "terminals"]);
  });

  it("has eight flags, in wheel order, the same colour in both modes", () => {
    for (const mode of MODES) expect(Object.keys(file.modes[mode].accents ?? {})).toEqual(WHEEL);
    for (const flag of WHEEL) expect(colour("dark", `accents.${flag}`), flag).toBe(colour("light", `accents.${flag}`));
    expect(new Set(WHEEL.map((flag) => colour("dark", `accents.${flag}`))).size).toBe(8);
  });

  it("puts every flag in one of two luminance bands and none between them", () => {
    // White ink holds 7:1 in grey up to a luminance of 0.10; a near-black ink holds 4.5:1 after the lit flare from 0.455.
    for (const flag of DEEP) expect(relativeLuminance(colour("light", `accents.${flag}`)), flag).toBeLessThanOrEqual(0.1);
    for (const flag of BRIGHT) expect(relativeLuminance(colour("light", `accents.${flag}`)), flag).toBeGreaterThanOrEqual(0.455);
  });

  it("gives each field an ink of its own address, white on the deep fields and dark on the bright ones", () => {
    for (const mode of MODES) {
      for (const flag of WHEEL) {
        const ink = relativeLuminance(colour(mode, `extra.ink-${flag}`));
        if (DEEP.includes(flag)) expect(colour(mode, `extra.ink-${flag}`), flag).toBe("#FFFFFF");
        else expect(ink, flag).toBeLessThan(0.01);
      }
    }
  });

  it("declares a body text pair for every ink on its field and lowers no minimum", () => {
    const pairs = file.pairs ?? [];
    for (const flag of WHEEL) {
      const pair = pairs.find((p) => p.fg === `extra.ink-${flag}` && p.bg === `accents.${flag}`);
      expect(pair?.kind, flag).toBe("text");
      expect(pair?.min, flag).toBeUndefined();
      expect(pair?.modes, flag).toBeUndefined();
    }
    for (const p of pairs) expect(p.min, `${p.fg} on ${p.bg}`).toBeUndefined();
  });

  it("tells the fields apart by colour alone: one projector set and no reinforced pair anywhere", () => {
    const sets = file.distinct ?? [];
    const fields = sets.find((d) => d.id === "fields")!;
    expect(fields.set).toBe("accents");
    expect(fields.for).toEqual(["projector"]);
    expect(fields.patterned).toBeUndefined();
    expect(fields.min ?? 0.06).toBeGreaterThanOrEqual(0.06);
    for (const d of sets) {
      expect(d.reinforced, d.id).toBeUndefined();
      expect(d.cvd, d.id).toBeUndefined();
      expect(d.aliases, d.id).toBeUndefined();
      expect(d.min ?? 0.06, d.id).toBeGreaterThanOrEqual(0.06);
    }
    expect(file.exceptions).toBeUndefined();
  });

  it("leaves three flags to their pattern in print and stands the other five on their lightness", () => {
    const print = (file.distinct ?? []).find((d) => d.id === "fields-print")!;
    expect(print.for).toEqual(["print-grey"]);
    expect(print.patterned).toEqual(PATTERNED);
    expect(print.by).toContain("pattern");
    const alone = WHEEL.filter((f) => !PATTERNED.includes(f)).map((f) => ({ f, l: lstar(colour("light", `accents.${f}`)) })).sort((a, b) => a.l - b.l);
    expect(alone.map((a) => a.f)).toEqual(["violet", "blue", "red", "orange", "yellow"]);
    for (let i = 1; i < alone.length; i++) expect(alone[i]!.l - alone[i - 1]!.l, `${alone[i - 1]!.f} to ${alone[i]!.f}`).toBeGreaterThanOrEqual(12);
  });

  it("gives every flag a pattern of its own in design", () => {
    const pattern = (file.design as Record<string, Record<string, { name: string }>>).pattern!;
    expect(Object.keys(pattern)).toEqual(WHEEL);
    expect(new Set(Object.values(pattern).map((p) => p.name)).size).toBe(8);
  });

  it("uses the eight flags, and nothing else, as the chart colours in both modes", () => {
    for (const mode of MODES) {
      const data = file.modes[mode].data as { categorical: { colors: Record<string, string> } };
      expect(Object.keys(data.categorical.colors).sort()).toEqual([...WHEEL].sort());
      for (const flag of WHEEL) expect(colour(mode, `data.categorical.${flag}`), `${mode} ${flag}`).toBe(colour(mode, `accents.${flag}`));
    }
  });

  it("takes the accent from one flag in each mode, blue in the light mode and yellow in the dark", () => {
    for (const [mode, flag] of [["light", "blue"], ["dark", "yellow"]] as const) {
      const accent = colour(mode, "accents." + flag);
      for (const role of ["accent", "link", "button", "focus"]) expect(colour(mode, `roles.${role}`), `${mode} ${role}`).toBe(accent);
    }
  });

  it("sets text on the fields heavy and sizes it from the viewing distance", () => {
    const design = file.design as Record<string, any>;
    const { size, weight } = design.type;
    expect(size.caption).toBeLessThan(size.body);
    expect(size.body).toBeLessThan(size.title);
    expect(size.title).toBeLessThan(size.display);
    expect(weight.body).toBeGreaterThanOrEqual(500);
    expect(weight.title).toBeGreaterThanOrEqual(800);
    expect(design.viewing["distance-near-m"]).toBe(5);
    expect(design.viewing["distance-far-m"]).toBe(20);
    expect(file.typography).toEqual({ sans: "Overpass", display: "Overpass" });
  });

  it("has two modes with plain labels", () => {
    expect(file.modes.dark.label).toBe("Brazen lamp");
    expect(file.modes.light.label).toBe("Holiday apparel");
  });
});

describe("Bachelor, candidate ladder", () => {
  const ladder = loadCandidates().find((c) => c.dir === "bachelor" && c.candidate === "ladder")!;
  const tokens = ladder.file;
  const resolved = resolveFamily(tokens);
  const lightOf = (flag: string): string => resolved.modes.light.colours.get(`accents.${flag}`)!.hex;
  const TITLES_ONLY = ["red", "green"];

  it("keeps every flag name and the family's chapter, quote and environments", () => {
    expect(Object.keys(tokens.modes.light.accents ?? {})).toEqual(WHEEL);
    expect(tokens.meta.chapter).toBe(file.meta.chapter);
    expect(tokens.meta.quote).toBe(file.meta.quote);
    expect(tokens.meta.environments).toEqual(file.meta.environments);
    expect(tokens.exceptions).toBeUndefined();
  });

  it("puts red and green between the bands, with titles only, and leaves cyan alone to its pattern", () => {
    for (const flag of TITLES_ONLY) {
      const y = relativeLuminance(lightOf(flag));
      expect(y, flag).toBeGreaterThan(0.1);
      expect(y, flag).toBeLessThan(0.455);
      const pair = (tokens.pairs ?? []).find((p) => p.fg === `extra.ink-${flag}` && p.bg === `accents.${flag}`);
      expect(pair?.kind, flag).toBe("large");
      expect((tokens.design as Record<string, any>).field[flag]["smallest-text-pt"], flag).toBe((tokens.design as Record<string, any>).type.size.title);
    }
    for (const flag of WHEEL.filter((f) => !TITLES_ONLY.includes(f))) {
      const pair = (tokens.pairs ?? []).find((p) => p.fg === `extra.ink-${flag}` && p.bg === `accents.${flag}`);
      expect(pair?.kind, flag).toBe("text");
    }
    expect((tokens.distinct ?? []).find((d) => d.id === "fields-print")?.patterned).toEqual(["cyan"]);
  });

  it("stands seven flags on their lightness, 12 L* or more apart", () => {
    const alone = WHEEL.filter((f) => f !== "cyan").map((f) => ({ f, l: lstar(lightOf(f)) })).sort((a, b) => a.l - b.l);
    expect(alone.map((a) => a.f)).toEqual(["violet", "blue", "magenta", "red", "green", "orange", "yellow"]);
    for (let i = 1; i < alone.length; i++) expect(alone[i]!.l - alone[i - 1]!.l, `${alone[i - 1]!.f} to ${alone[i]!.f}`).toBeGreaterThanOrEqual(12);
  });
});
