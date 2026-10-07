// Findings of the Lighthouse audit of the live site, kept as tests: the heading outline, the
// accessible name of a link or button, and the contrast of the small text on the sample cards.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { contrastRatio } from "../../lib/colour/wcag.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { catalogueEntries } from "../../scripts/site/build.ts";
import { pages } from "../../scripts/site/render.ts";

describe("the pages", () => {
  let rendered: Map<string, string>;
  beforeAll(() => {
    rendered = pages(catalogueEntries().entries, "1.0.0");
  }, 60000);

  it("have one h1 and a heading outline that never skips a level", () => {
    for (const [path, html] of rendered) {
      const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
      expect(levels.filter((l) => l === 1), `${path}: h1`).toHaveLength(1);
      expect(levels[0], `${path}: first heading`).toBe(1);
      for (const [i, level] of levels.entries()) {
        if (i > 0) expect(level, `${path}: h${level} after h${levels[i - 1]}`).toBeLessThanOrEqual(levels[i - 1]! + 1);
      }
    }
  });

  it("give every link and button with an aria-label a name that contains its visible text", () => {
    const squash = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    let checked = 0;
    for (const [path, html] of rendered) {
      for (const m of html.matchAll(/<(a|button)\b[^>]*\saria-label="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/g)) {
        const visible = squash(m[3]!.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, ""));
        if (!visible) continue; // an icon with no text: the label is its only name
        expect(squash(m[2]!), `${path}: ${m[2]}`).toContain(visible);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("show a sample card with no heading element, because the card is an example and not part of the outline", () => {
    for (const [path, html] of rendered) {
      for (const card of html.match(/<section class="sample"[\s\S]*?<\/section>/g) ?? []) {
        expect(card, path).not.toMatch(/<h[1-6]\b/);
      }
    }
  });
});

describe("the small text on a sample card", () => {
  it("carries no opacity, which would lower its contrast below the colour it declares", () => {
    const css = readFileSync(join(repoRoot(), "site/src/site.css"), "utf8");
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, selector]) => /\.sample-(label|cite|text)/.test(selector!));
    expect(rules.length).toBeGreaterThan(2);
    for (const [, selector, declarations] of rules) {
      expect(declarations, selector!.trim()).not.toMatch(/(^|[;\s])opacity\s*:/);
    }
  });

  it("is readable in all twenty family modes: the muted text colour on the page ground reaches 4.5 to 1", () => {
    for (const f of loadFamilies().map((x) => resolveFamily(x.file))) {
      for (const mode of ["light", "dark"] as const) {
        const colours = f.modes[mode].colours;
        const ratio = contrastRatio(colours.get("roles.text-muted")!.hex, colours.get("roles.bg")!.hex);
        expect(ratio, `${f.meta.id} ${mode}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
