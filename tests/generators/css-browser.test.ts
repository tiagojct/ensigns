/// <reference lib="dom" />
import { afterAll, describe, expect, it } from "vitest";
import { GENERATORS } from "../../lib/generators/index.ts";
import { loadFamilies } from "../../lib/model/load.ts";
import { at, resolveFamily } from "../../lib/model/resolve.ts";
import { launchChromium } from "../environments/browser.ts";

const family = resolveFamily(loadFamilies().find((loaded) => loaded.dir === "rosebud")!.file);
const css = GENERATORS.find((generator) => generator.id === "css")!;
const found = await launchChromium();

describe("exported CSS in the browser", () => {
  if ("reason" in found) {
    it("has a Chromium to check mode selection", (context) => {
      if (process.env.ENSIGNS_REQUIRE_BROWSER === "1") throw new Error(found.reason);
      context.skip(found.reason);
    });
    return;
  }
  const { browser } = found;
  afterAll(() => browser.close());

  for (const system of ["dark", "light"] as const) {
    for (const explicit of [undefined, "dark", "light"] as const) {
      it(`uses ${explicit ?? "automatic"} mode on a ${system} system`, async () => {
        const context = await browser.newContext({ colorScheme: system });
        try {
          const page = await context.newPage();
          await page.setContent(`<html${explicit ? ` data-mode="${explicit}"` : ""}><head><style>${css.generate(family)[0]!.content}</style></head><body><div data-family="rosebud" data-mode="light" id="light"></div><div data-family="rosebud" data-mode="dark" id="dark"></div></body></html>`);
          const mode = explicit ?? system;
          const actual = await page.evaluate(() => {
            const style = getComputedStyle(document.documentElement);
            return {
              bg: style.getPropertyValue("--roles-bg").trim(),
              scheme: style.colorScheme,
              weight: style.getPropertyValue("--status-critical-weight").trim(),
              edge: style.getPropertyValue("--status-warning-edge").trim(),
              light: getComputedStyle(document.getElementById("light")!).getPropertyValue("--roles-bg").trim(),
              dark: getComputedStyle(document.getElementById("dark")!).getPropertyValue("--roles-bg").trim(),
            };
          });
          expect(actual.bg).toBe(at(family.modes[mode], "roles.bg").hex);
          expect(actual.scheme).toBe(mode);
          expect(actual.weight).toBe("3px");
          expect(actual.edge).toBe("dashed");
          expect(actual.light).toBe(at(family.modes.light, "roles.bg").hex);
          expect(actual.dark).toBe(at(family.modes.dark, "roles.bg").hex);
        } finally { await context.close(); }
      });
    }
  }

  it("keeps a single-mode export fixed when the system mode changes", async () => {
    const context = await browser.newContext({ colorScheme: "dark" });
    try {
      const page = await context.newPage();
      await page.setContent(`<style>${css.generate(family, { mode: "light" })[0]!.content}</style>`);
      const bg = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--roles-bg").trim());
      expect(await bg()).toBe(at(family.modes.light, "roles.bg").hex);
      await page.emulateMedia({ colorScheme: "light" });
      expect(await bg()).toBe(at(family.modes.light, "roles.bg").hex);
    } finally { await context.close(); }
  });

  it("parses every Obsidian snippet and follows theme classes with authored syntax styles", async () => {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      const obsidian = GENERATORS.find((generator) => generator.id === "obsidian")!;
      for (const loaded of loadFamilies()) {
        const family = resolveFamily(loaded.file);
        await page.setContent(`<style>${obsidian.generate(family)[0]!.content}</style><span class="token comment" id="comment">Comment</span>`);
        for (const mode of ["dark", "light"] as const) {
          await page.evaluate((mode) => { document.documentElement.className = `theme-${mode}`; }, mode);
          const actual = await page.evaluate(() => ({
            bg: getComputedStyle(document.documentElement).getPropertyValue("--background-primary").trim(),
            text: getComputedStyle(document.documentElement).getPropertyValue("--text-normal").trim(),
            italic: getComputedStyle(document.getElementById("comment")!).fontStyle,
            rules: [...document.styleSheets[0]!.cssRules].map((rule) => (rule as CSSStyleRule).selectorText),
          }));
          expect(actual.rules).toContain(".theme-dark");
          expect(actual.rules).toContain(".theme-light");
          expect(actual.bg, family.meta.id).toBe(at(family.modes[mode], "roles.bg").hex);
          expect(actual.text, family.meta.id).toBe(at(family.modes[mode], "roles.text").hex);
          const style = family.modes[mode].colours.get("syntax.comment")?.style;
          expect(actual.italic, family.meta.id).toBe(style?.includes("italic") ? "italic" : "normal");
        }
      }
    } finally { await context.close(); }
  });
});
