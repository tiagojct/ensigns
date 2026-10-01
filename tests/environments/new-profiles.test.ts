// Each profile added in phase 3 must fail when it should and pass when it
// should. Every case builds a family from a copy of Pequod's token file plus a
// few colours of its own, so the profile code is tested apart from any family
// that lists it.
import { describe, expect, it } from "vitest";
import { agedEyeProfile, clinical, eink, failures, figure, officeScreen, overlay, photocopyProfile, printGrey, projector, sunlight } from "../../lib/harness/index.ts";
import type { Check } from "../../lib/harness/index.ts";
import { fromOklch } from "../../lib/colour/oklab.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { Distinct, FamilyFile, PaletteColour } from "../../lib/model/types.ts";
import { cloneFile, thresholds } from "./helpers.ts";

/** A copy of Pequod with colours added to the palette, and to both modes as extra roles of the same name. */
function family(colours: Record<string, PaletteColour>, edit: (f: FamilyFile) => void = () => {}) {
  const f = cloneFile("pequod");
  f.palette.t = colours;
  for (const m of ["dark", "light"] as const) {
    f.modes[m].roles.extra = { ...(f.modes[m].roles.extra ?? {}), ...Object.fromEntries(Object.keys(colours).map((k) => [k, `{palette.t.${k}}`])) };
  }
  edit(f);
  return resolveFamily(f);
}

const textPair = (fg: string, bg: string, kind: "text" | "large" = "text") => ({ fg: `extra.${fg}`, bg: `extra.${bg}`, kind });
const set = (members: string[], forProfiles: NonNullable<Distinct["for"]>, more: Partial<Distinct> = {}): Distinct => ({
  id: "s", members: members.map((m) => `extra.${m}`), for: forProfiles, ...more,
});
const byId = (checks: Check[], id: string) => checks.filter((c) => c.id === id);
const first = (checks: Check[], id: string) => byId(checks, id)[0]!;

describe("APCA and the apca-w3 licence", () => {
  const withPair = (environments: FamilyFile["meta"]["environments"]) =>
    family({ ink: "#202020", paper: "#FFFFFF" }, (f) => { f.pairs = [textPair("ink", "paper")]; f.meta.environments = environments; });

  it("reports APCA for an ordinary family", () => {
    const checks = officeScreen(withPair(["office-screen"]), thresholds);
    expect(checks.some((c) => c.id.startsWith("apca "))).toBe(true);
  });

  it("reports none for a family that lists clinical, because the licence excludes clinical use", () => {
    const checks = officeScreen(withPair(["office-screen", "clinical"]), thresholds);
    expect(checks.some((c) => c.id.startsWith("apca "))).toBe(false);
    expect(checks.some((c) => c.id.startsWith("aaa "))).toBe(true);
  });
});

describe("projector", () => {
  const colours = { ink: "#666666", paper: "#FFFFFF", grey: "#8A8A8A" };
  const pair = (design?: FamilyFile["design"]) => family(colours, (f) => { f.pairs = [textPair("ink", "paper")]; if (design) f.design = design; });

  it("holds body text in a dark room and loses it in a lit room", () => {
    const checks = projector(pair(), thresholds);
    expect(byId(checks, "extra.ink on extra.paper, dark room").every((c) => c.ok)).toBe(true);
    expect(byId(checks, "extra.ink on extra.paper, lit room").every((c) => !c.ok)).toBe(true);
  });

  it("gates only the rooms a family names", () => {
    const checks = projector(pair({ projector: { rooms: ["dark"] } }), thresholds);
    expect(failures(checks)).toEqual([]);
    expect(checks.some((c) => c.id.includes("lit room"))).toBe(false);
  });

  it("asks less of a title than of body text", () => {
    const fam = family(colours, (f) => { f.pairs = [textPair("grey", "paper", "large"), textPair("grey", "paper", "text")]; f.design = { projector: { rooms: ["dark"] } }; });
    const checks = projector(fam, thresholds);
    expect(byId(checks, "extra.grey on extra.paper, dark room").map((c) => c.ok).sort()).toEqual([false, false, true, true]);
  });

  it("keeps the fields of a set apart after flare", () => {
    const fields = { a: "#336699", b: "#346699", c: "#CC9933" };
    const near = projector(family(fields, (f) => { f.pairs = [textPair("a", "c")]; f.distinct = [set(["a", "b"], ["projector"])]; }), thresholds);
    expect(near.filter((c) => c.id.startsWith("s:") && !c.ok).length).toBeGreaterThan(0);
    const far = projector(family(fields, (f) => { f.pairs = [textPair("a", "c")]; f.distinct = [set(["a", "c"], ["projector"])]; }), thresholds);
    expect(far.filter((c) => c.id.startsWith("s:")).every((c) => c.ok)).toBe(true);
  });

  it("fails a family that lists it and declares no pair", () => {
    const checks = projector(family(colours, (f) => { f.pairs = []; }), thresholds);
    expect(failures(checks).length).toBe(1);
    expect(first(checks, "declared").ok).toBe(false);
  });
});

describe("sunlight", () => {
  it("keeps 4.5:1 for body text after glare", () => {
    const good = sunlight(family({ ink: "#595959", paper: "#FFFFFF" }, (f) => { f.pairs = [textPair("ink", "paper")]; }), thresholds);
    expect(failures(good)).toEqual([]);
    const bad = sunlight(family({ ink: "#767676", paper: "#FFFFFF" }, (f) => { f.pairs = [textPair("ink", "paper")]; }), thresholds);
    expect(failures(bad).length).toBeGreaterThan(0);
  });

  it("asks 3:1 of large text after glare and nothing of a component", () => {
    const large = (ink: string, kind: "large" | "component") => sunlight(family({ ink: ink, paper: "#FFFFFF", body: "#000000" }, (f) => { f.pairs = [textPair("body", "paper"), textPair("ink", "paper", kind as "text" | "large")]; }), thresholds);
    expect(failures(large("#767676", "large"))).toEqual([]);
    expect(failures(large("#9A9A9A", "large")).length).toBeGreaterThan(0);
    const component = sunlight(family({ ink: "#9A9A9A", paper: "#FFFFFF", body: "#000000" }, (f) => { f.pairs = [textPair("body", "paper"), { fg: "extra.ink", bg: "extra.paper", kind: "component" }]; }), thresholds);
    expect(failures(component)).toEqual([]);
  });
});

describe("aged-eye", () => {
  it("asks for 7:1 after the simulation", () => {
    const good = agedEyeProfile(family({ ink: "#444444", paper: "#FFFFFF" }, (f) => { f.pairs = [textPair("ink", "paper")]; }), thresholds);
    expect(failures(good)).toEqual([]);
    const bad = agedEyeProfile(family({ ink: "#595959", paper: "#FFFFFF" }, (f) => { f.pairs = [textPair("ink", "paper")]; }), thresholds);
    expect(failures(bad).length).toBeGreaterThan(0);
  });

  it("asks 4.5:1 of large text after the simulation", () => {
    const large = (ink: string) => agedEyeProfile(family({ ink, paper: "#FFFFFF" }, (f) => { f.pairs = [textPair("ink", "paper", "large")]; }), thresholds);
    expect(failures(large("#595959"))).toEqual([]);
    expect(failures(large("#767676")).length).toBeGreaterThan(0);
  });

  it("keeps the members of a set apart", () => {
    const colours = { ink: "#202020", paper: "#E0E0E0", a: "#808080", b: "#818181" };
    const near = agedEyeProfile(family(colours, (f) => { f.pairs = [textPair("ink", "paper")]; f.distinct = [set(["a", "b"], ["aged-eye"])]; }), thresholds);
    expect(near.filter((c) => c.id.startsWith("s:") && !c.ok).length).toBeGreaterThan(0);
    const far = agedEyeProfile(family(colours, (f) => { f.pairs = [textPair("ink", "paper")]; f.distinct = [set(["ink", "paper"], ["aged-eye"])]; }), thresholds);
    expect(far.filter((c) => c.id.startsWith("s:")).every((c) => c.ok)).toBe(true);
  });
});

describe("print-grey", () => {
  it("asks for 7:1 text and 12 L* between the members of a set", () => {
    const colours = { ink: "#555555", weak: "#666666", paper: "#FFFFFF", a: "#777777", b: "#7A7A7A", c: "#B0B0B0" };
    const text = printGrey(family(colours, (f) => { f.pairs = [textPair("ink", "paper"), textPair("weak", "paper")]; }), thresholds);
    expect(first(text, "extra.ink on extra.paper").ok).toBe(true);
    expect(byId(text, "extra.weak on extra.paper").every((c) => !c.ok)).toBe(true);
    const close = printGrey(family(colours, (f) => { f.pairs = [textPair("ink", "paper")]; f.distinct = [set(["a", "b"], ["print-grey"])]; }), thresholds);
    expect(close.filter((c) => c.id === "s: apart in grey").every((c) => !c.ok)).toBe(true);
    const apart = printGrey(family(colours, (f) => { f.pairs = [textPair("ink", "paper")]; f.distinct = [set(["a", "c"], ["print-grey"])]; }), thresholds);
    expect(apart.filter((c) => c.id === "s: apart in grey").every((c) => c.ok)).toBe(true);
  });

  it("lets a patterned member through and a reinforced pair through", () => {
    const colours = { ink: "#555555", paper: "#FFFFFF", a: "#777777", b: "#7A7A7A" };
    const patterned = printGrey(family(colours, (f) => { f.pairs = [textPair("ink", "paper")]; f.distinct = [set(["a", "b"], ["print-grey"], { patterned: ["extra.b"] })]; }), thresholds);
    expect(failures(patterned)).toEqual([]);
    const reinforced = printGrey(family(colours, (f) => { f.pairs = [textPair("ink", "paper")]; f.distinct = [set(["a", "b"], ["print-grey"], { reinforced: [["extra.a", "extra.b"]] })]; }), thresholds);
    expect(failures(reinforced)).toEqual([]);
  });
});

describe("eink", () => {
  it("wants two grey levels between the members of a set", () => {
    const colours = { a: "#777777", b: "#787878", c: "#999999" };
    const same = eink(family(colours, (f) => { f.distinct = [set(["a", "b"], ["eink"])]; }), thresholds);
    expect(failures(same).length).toBeGreaterThan(0);
    const apart = eink(family(colours, (f) => { f.distinct = [set(["a", "c"], ["eink"])]; }), thresholds);
    expect(failures(apart)).toEqual([]);
  });

  it("fails a family that lists it and declares no set", () => {
    const checks = eink(family({ a: "#777777", b: "#999999" }), thresholds);
    expect(first(checks, "declared").ok).toBe(false);
  });
});

describe("photocopy", () => {
  it("keeps fills inside L* 25 to 80 unless they carry a pattern", () => {
    const colours = { pale: "#FAFAFA", mid: "#777777", dark: "#0A0A0A" };
    const lost = photocopyProfile(family(colours, (f) => { f.distinct = [set(["pale", "mid", "dark"], ["photocopy"])]; }), thresholds);
    expect(failures(lost).some((d) => d.includes("extra.pale") && d.includes("extra.dark"))).toBe(true);
    const patterned = photocopyProfile(family(colours, (f) => { f.distinct = [set(["pale", "mid", "dark"], ["photocopy"], { patterned: ["extra.pale", "extra.dark"] })]; }), thresholds);
    expect(failures(patterned)).toEqual([]);
  });
});

describe("overlay", () => {
  const fills = (alpha: number) => ({
    amber: "#FFC107", blue: "#2196F3", green: "#4CAF50",
    "fill-amber": { ref: "{palette.t.amber}", alpha }, "fill-blue": { ref: "{palette.t.blue}", alpha }, "fill-green": { ref: "{palette.t.green}", alpha },
  }) as Record<string, PaletteColour>;
  // Amber and blue stay apart under every simulation; blue and green do not, which is the point of the gate.
  const declare = (alpha: number, edit: (f: FamilyFile) => void = () => {}, names = ["amber", "blue"]) =>
    family(fills(alpha), (f) => { f.design = { overlay: { fills: names.map((n) => `extra.fill-${n}`) } }; edit(f); });
  const alone = { families: [] };

  it("passes subtle tints over Pequod's two grounds", () => {
    const checks = overlay(declare(0.3), thresholds, alone);
    expect(failures(checks)).toEqual([]);
    expect(checks.some((c) => c.id.includes("over pequod dark"))).toBe(true);
    expect(checks.some((c) => c.id.includes("over pequod light"))).toBe(true);
  });

  it("fails strong tints because text no longer reads on them", () => {
    const checks = overlay(declare(0.9), thresholds, alone);
    expect(failures(checks).some((d) => d.startsWith("text on a fill"))).toBe(true);
  });

  it("fails tints too faint to see against the ground", () => {
    const checks = overlay(declare(0.03), thresholds, alone);
    expect(failures(checks).some((d) => d.includes("too close to the ground"))).toBe(true);
  });

  it("fails two fills that are the same colour, unless the pair is an alias", () => {
    const twin = (f: FamilyFile) => { f.palette.t!["fill-green"] = { ref: "{palette.t.blue}", alpha: 0.3 }; };
    const names = ["blue", "green"];
    expect(failures(overlay(declare(0.3, twin, names), thresholds, alone)).some((d) => d.startsWith("fills over"))).toBe(true);
    const aliased = (f: FamilyFile) => { twin(f); f.distinct = [{ id: "fills", members: ["extra.fill-blue", "extra.fill-green"], aliases: [["extra.fill-blue", "extra.fill-green"]] }]; };
    expect(failures(overlay(declare(0.3, aliased, names), thresholds, alone)).filter((d) => d.startsWith("fills over"))).toEqual([]);
  });

  it("lets a reinforced pair through the simulations but not normal vision", () => {
    const names = ["blue", "green"];
    const lookAlike = (f: FamilyFile) => { f.palette.t!.blue = "#2196F3"; f.palette.t!.green = "#2396F1"; };
    const plain = overlay(declare(0.3, lookAlike, names), thresholds, alone);
    expect(failures(plain).some((d) => d.includes("under protan"))).toBe(true);
    const labelled = overlay(declare(0.3, (f) => { lookAlike(f); f.distinct = [{ id: "fills", members: ["extra.fill-blue", "extra.fill-green"], reinforced: [["extra.fill-blue", "extra.fill-green"]] }]; }, names), thresholds, alone);
    expect(failures(labelled).some((d) => d.includes("under protan"))).toBe(false);
    expect(failures(labelled).some((d) => d.includes("under normal"))).toBe(true);
  });

  it("fails a family that declares no fills", () => {
    expect(failures(overlay(resolveFamily(cloneFile("pequod")), thresholds, alone)).length).toBe(1);
  });
});

describe("clinical", () => {
  const colours = {
    "low-fg": "#1F4E79", "low-fill": "#E8F1F8", "low-border": "#5B8DB8",
    "mid-fg": "#5C4B00", "mid-fill": "#FFF6CC", "mid-border": "#C9A400",
    "high-fg": "#7B1F16", "high-fill": "#FDECEA", "high-border": "#FF0000",
  };
  const level = (name: string, icon = `icon-${name}`, label = name) => ({ name, fg: `extra.${name}-fg`, fill: `extra.${name}-fill`, border: `extra.${name}-border`, icon, label });
  const declare = (edit: (f: FamilyFile) => void = () => {}, levels = [level("low"), level("mid"), level("high")]) =>
    family(colours, (f) => { f.design = { clinical: { critical: "high", levels } }; edit(f); });

  it("orders levels by lightness of their borders", () => {
    const checks = clinical(declare(), thresholds);
    expect(byId(checks, "levels: adjacent borders differ in L*").every((c) => c.ok)).toBe(true);
    expect(byId(checks, "levels: icons and words differ").every((c) => c.ok)).toBe(true);
  });

  it("fails two neighbours with the same lightness", () => {
    const flat = declare((f) => { f.palette.t!["mid-border"] = "#5B8DB9"; });
    expect(byId(clinical(flat, thresholds), "levels: adjacent borders differ in L*").some((c) => !c.ok)).toBe(true);
  });

  it("fails a repeated icon or word, because colour would stand alone", () => {
    const repeat = declare(() => {}, [level("low", "same"), level("mid", "same"), level("high")]);
    expect(first(clinical(repeat, thresholds), "levels: icons and words differ").ok).toBe(false);
    const words = declare(() => {}, [level("low", "a", "same"), level("mid", "b", "same"), level("high", "c", "x")]);
    expect(first(clinical(words, thresholds), "levels: icons and words differ").ok).toBe(false);
  });

  it("fails a foreground that does not read on its fill", () => {
    const weak = declare((f) => { f.palette.t!["low-fg"] = "#9DB8D0"; });
    expect(byId(clinical(weak, thresholds), "levels: foreground on fill").every((c) => !c.ok)).toBe(true);
  });

  it("keeps the critical red to the status tokens", () => {
    const lonely = clinical(declare(), thresholds);
    expect(byId(lonely, "critical red is reserved").every((c) => c.ok)).toBe(true);
    const crowded = clinical(declare((f) => {
      f.palette.t!.stray = "#F20A0A";
      for (const m of ["dark", "light"] as const) f.modes[m].accents = { ...(f.modes[m].accents ?? {}), "near-red": "{palette.t.stray}" };
    }), thresholds);
    expect(failures(crowded).some((d) => d.includes("accents.near-red"))).toBe(true);
  });

  it("checks a triage list as it checks the levels", () => {
    const fam = family(colours, (f) => { f.design = { clinical: { critical: "high", levels: [level("low"), level("mid"), level("high")], triage: [level("low", "t1", "blue"), level("mid", "t2", "yellow"), level("high", "t3", "red")] } }; });
    expect(clinical(fam, thresholds).some((c) => c.id.startsWith("triage:"))).toBe(true);
  });

  it("fails a family that declares no levels", () => {
    expect(failures(clinical(resolveFamily(cloneFile("pequod")), thresholds)).length).toBe(1);
  });
});

describe("figure", () => {
  const OI = { black: "#000000", orange: "#E69F00", skyblue: "#56B4E9", bluishgreen: "#009E73", yellow: "#F0E442", blue: "#0072B2", vermillion: "#D55E00", reddishpurple: "#CC79A7" };
  const ramp = (n: number, hue: number) => Array.from({ length: n }, (_, i) => fromOklch(0.95 - i * (0.65 / (n - 1)), 0.06, hue));
  const diverging = (n: number) => {
    const mid = (n - 1) / 2;
    return Array.from({ length: n }, (_, i) => {
      const k = Math.abs(i - mid);
      return fromOklch(0.96 - k * (0.5 / mid), k === 0 ? 0 : 0.03 + 0.03 * k, i < mid ? 250 : 45);
    });
  };

  function chart(edit: (f: FamilyFile, refs: { seq: string[]; div: string[] }) => void = () => {}) {
    const f = cloneFile("pequod");
    const seq = ramp(6, 250);
    const div = diverging(7);
    f.palette.oi = OI;
    f.palette.seq = Object.fromEntries(seq.map((h, i) => [`s${i + 1}`, h]));
    f.palette.div = Object.fromEntries(div.map((h, i) => [`d${i + 1}`, h]));
    f.palette.plot = { paper: "#FFFFFF", night: "#111111", ink: "#1A1A1A", snow: "#F0F0F0", muted: "#595959", dim: "#B0B0B0", grid: "#D9D9D9", outline: "#404040", bright: "#D0D0D0", focus: "#0072B2", light: "#56B4E9", context: "#9A9A9A" };
    for (const m of ["dark", "light"] as const) {
      const p = (k: string) => `{palette.plot.${k}}`;
      f.modes[m].data = {
        categorical: { colors: Object.fromEntries(Object.keys(OI).map((k) => [k, `{palette.oi.${k}}`])) },
        sequential: { blue: { colors: seq.map((_, i) => `{palette.seq.s${i + 1}}`) } },
        diverging: { warm: { colors: div.map((_, i) => `{palette.div.d${i + 1}}`) } },
        plot: m === "light"
          ? { background: p("paper"), text: p("ink"), muted: p("muted"), grid: p("grid"), outline: p("outline"), focus: p("focus"), context: p("context") }
          : { background: p("night"), text: p("snow"), muted: p("dim"), grid: p("muted"), outline: p("bright"), focus: p("light"), context: p("context") },
      };
    }
    edit(f, { seq, div });
    return resolveFamily(f);
  }

  it("passes a family whose categorical set is Okabe-Ito and whose ramps are regular", () => {
    const checks = figure(chart(), thresholds);
    expect(failures(checks)).toEqual([]);
    expect(checks.some((c) => c.id.includes("against viridis and cividis") && c.report)).toBe(true);
    expect(first(checks, "categorical: beats Okabe-Ito on one measure").detail).toContain("Okabe-Ito itself");
  });

  it("fails a categorical colour copied from its neighbour", () => {
    const copied = chart((f) => { f.palette.oi!.blue = f.palette.oi!.skyblue!; });
    expect(byId(figure(copied, thresholds), "categorical: matches Okabe-Ito under normal").some((c) => !c.ok)).toBe(true);
  });

  it("fails a set that does not beat Okabe-Ito on any measure", () => {
    const dull = chart((f) => { f.palette.oi!.black = "#050505"; });
    const checks = figure(dull, thresholds);
    expect(first(checks, "categorical: beats Okabe-Ito on one measure").detail).not.toContain("Okabe-Ito itself");
  });

  it("wants sequential lightness to be monotone and its steps regular", () => {
    const kinked = chart((f, refs) => { f.palette.seq!.s3 = refs.seq[5]!; });
    const checks = figure(kinked, thresholds);
    expect(byId(checks, "sequential blue: lightness is monotone").some((c) => !c.ok)).toBe(true);
    const lumpy = chart((f, refs) => { f.palette.seq!.s2 = refs.seq[1] === undefined ? "#000000" : fromOklch(0.93, 0.06, 250); });
    expect(byId(figure(lumpy, thresholds), "sequential blue: steps are near-uniform").some((c) => !c.ok)).toBe(true);
  });

  it("wants a diverging ramp with a centre, symmetric lightness and a neutral light middle", () => {
    const even = chart((f) => { for (const m of ["dark", "light"] as const) { const d = f.modes[m].data as { diverging: { warm: { colors: string[] } } }; d.diverging.warm.colors.pop(); } });
    expect(byId(figure(even, thresholds), "diverging warm: has a centre").some((c) => !c.ok)).toBe(true);
    const lopsided = chart((f) => { f.palette.div!.d7 = fromOklch(0.6, 0.1, 45); });
    expect(byId(figure(lopsided, thresholds), "diverging warm: lightness is symmetric").some((c) => !c.ok)).toBe(true);
    const tinted = chart((f) => { f.palette.div!.d4 = fromOklch(0.96, 0.08, 120); });
    expect(byId(figure(tinted, thresholds), "diverging warm: neutral light centre").some((c) => !c.ok)).toBe(true);
  });

  it("wants an outline token for marks below 3:1", () => {
    const naked = chart((f) => { for (const m of ["dark", "light"] as const) delete (f.modes[m].data as { plot: Record<string, string> }).plot.outline; });
    expect(byId(figure(naked, thresholds), "marks below 3:1 have an outline token").some((c) => !c.ok)).toBe(true);
    const weak = chart((f) => { f.palette.plot!.outline = "#E0E0E0"; });
    expect(byId(figure(weak, thresholds), "marks below 3:1 have an outline token").some((c) => !c.ok)).toBe(true);
  });

  it("wants a focus colour that stands out from a grey context", () => {
    const tinted = chart((f) => { f.palette.plot!.context = "#9A6A6A"; });
    expect(byId(figure(tinted, thresholds), "plot context is a grey").some((c) => !c.ok)).toBe(true);
    const same = chart((f) => { f.palette.plot!.focus = "#595959"; f.palette.plot!.context = "#626262"; });
    expect(byId(figure(same, thresholds), "plot focus stands out from the context").some((c) => !c.ok)).toBe(true);
  });

  it("follows a reference to another family's data without measuring it", () => {
    const ref = chart((f) => { for (const m of ["dark", "light"] as const) f.modes[m].data = { ref: "enderby" }; });
    const checks = figure(ref, thresholds);
    expect(failures(checks)).toEqual([]);
    expect(checks.every((c) => c.report)).toBe(true);
  });
});
