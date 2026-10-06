// The parts of the site that are drawn: one ensign for each family, the host card with its crew,
// the family pages that open in the family's own ground, and the figures on the sample cards.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { parseChapters, quoteIsIn } from "../../lib/model/quotes.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { catalogueEntries } from "../../scripts/site/build.ts";
import { ensign, ensignColours } from "../../scripts/site/ensign.ts";
import { pages } from "../../scripts/site/render.ts";
import { SAMPLE, grade, sampleMeasures } from "../../site/src/sample.ts";

const families = loadFamilies().map((f) => resolveFamily(f.file));
const hexes = (svg: string) => [...svg.matchAll(/(?:fill|stroke)="(#[0-9A-F]{6})"/g)].map((m) => m[1]!);
const shape = (svg: string) => svg.replace(/#[0-9A-F]{6}/g, "#").replace(/id="[^"]*"|url\(#[^)]*\)/g, "");

describe("ensigns", () => {
  it("are drawn in the family's own colours and nothing else", () => {
    for (const [i, f] of families.entries()) {
      const own = new Set([...f.modes.light.colours.values()].map((c) => c.hex));
      const used = hexes(ensign(f, i, `t${i}`));
      expect(used.length, f.meta.id).toBeGreaterThan(3);
      for (const hex of used) expect(own.has(hex), `${f.meta.id} ${hex}`).toBe(true);
    }
  });

  it("differ in design from one family to the next", () => {
    const shapes = families.map((f, i) => shape(ensign(f, i, `t${i}`)));
    expect(new Set(shapes).size).toBe(families.length);
  });

  it("give the field, the ink and three accents that differ from one another", () => {
    for (const f of families) {
      const c = ensignColours(f);
      expect(new Set(Object.values(c)).size, f.meta.id).toBe(5);
    }
  });

  it("hide from assistive technology and carry an id that the caller sets", () => {
    const svg = ensign(families[0]!, 0, "ensign-x");
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('id="ensign-x"');
    expect(svg).toContain('clip-path="url(#ensign-x)"');
  });
});

describe("the pages", () => {
  let rendered: Map<string, string>;
  beforeAll(() => {
    rendered = pages(catalogueEntries().entries, "1.0.0");
  }, 60000);

  it("show the host ship first, with its crew, then the nine ships she meets, each with an ensign and a link", () => {
    const home = rendered.get("/")!;
    expect(home.match(/<article class="family-card/g)).toHaveLength(10);
    expect(home.indexOf('family-card host')).toBeLessThan(home.indexOf('data-scope="goney"'));
    expect(home.match(/class="ensign"/g)).toHaveLength(10);
    for (const f of families) expect(home, f.meta.id).toContain(`<a href="/${f.meta.id}/">`);
    const crew = home.match(/<ul class="crew"[\s\S]*?<\/ul>/)![0];
    expect(crew.match(/<li>/g)).toHaveLength(8);
    for (const name of ["Ahab", "Starbuck", "Queequeg", "Pip", "Ishmael", "Stubb", "Tashtego", "Daggoo"]) expect(crew).toContain(name);
  });

  it("open each family page in the family's own ground with its ensign", () => {
    for (const f of families) {
      const html = rendered.get(`/${f.meta.id}/`)!;
      const head = html.match(/<header class="family-head" data-scope="([^"]+)" data-mode="light">/);
      expect(head?.[1], f.meta.id).toBe(f.meta.id);
      expect(html.match(/class="ensign"/g), f.meta.id).toHaveLength(1);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    }
  });

  it("print the headline figures from the build, not from a draft", () => {
    const home = rendered.get("/")!;
    const entries = catalogueEntries().entries;
    const checks = entries.reduce((n, x) => n + x.checks, 0).toLocaleString("en-GB");
    expect(home).toContain(`<strong>${checks}</strong> checks on every build, none failing`);
  });
});

describe("the sample card", () => {
  it("quotes the book word for word", () => {
    const chapters = parseChapters(readFileSync(join(repoRoot(), "sources", "moby-dick.txt"), "utf8"));
    expect(quoteIsIn(chapters.get(1), SAMPLE.heading)).toBe(true);
    expect(quoteIsIn(chapters.get(1), SAMPLE.quote)).toBe(true);
    expect(SAMPLE.cite).toBe("Moby-Dick, chapter 1");
  });

  it("measures the roles a reader meets first, and every family clears the bar in both modes", () => {
    for (const f of families) {
      for (const mode of ["light", "dark"] as const) {
        const rows = sampleMeasures(f, mode);
        expect(rows.map((r) => r.label)).toEqual(["Text", "Link", "Button label", "Focus ring"]);
        for (const r of rows) expect(r.grade, `${f.meta.id} ${mode} ${r.label} ${r.ratio}`).not.toBe("below AA");
      }
    }
    expect(sampleMeasures(families.find((f) => f.meta.id === "pequod")!, "light")[0]!.ratio).toBe("10.82:1");
  });

  it("grades text and components by their own thresholds", () => {
    expect(grade(7, "text")).toBe("AAA");
    expect(grade(4.5, "text")).toBe("AA");
    expect(grade(4.49, "text")).toBe("below AA");
    expect(grade(3, "component")).toBe("AA");
    expect(grade(2.99, "component")).toBe("below AA");
  });
});
