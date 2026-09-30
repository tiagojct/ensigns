/// <reference lib="dom" />
// forced-colors: forced-colours modes such as Windows High Contrast replace
// every colour, so focus, selection, the current item and status must each keep
// a marker that is not colour alone. Chromium renders each family's specimen
// with forced colours active, in light and in dark, and DOM checks read the
// result. A whole-page screenshot per family and scheme goes to
// reports/forced-colors/. The DOM types above are for the functions that run
// in the page.
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { BrowserContext, ElementHandle, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { repoRoot } from "../../lib/model/load.ts";
import { buildPages } from "../../scripts/pages/generate.ts";
import { launchChromium } from "./browser.ts";
import type { ResolvedFamily } from "../../lib/model/types.ts";
import { withProfile } from "./helpers.ts";

// A family with a specimen of its own (families/<id>/specimen) is tested on the standalone page the page
// builder writes for each mode. Rosebud's own specimen comes in phase 4; until then the old generated one
// stands in, relative to the repository root.
const LEGACY_SPECIMENS: Record<string, string> = {
  rosebud: "tests/parity/rosebud/specimen.html",
};
const pages = mkdtempSync(join(tmpdir(), "ensigns-pages-"));
buildPages(repoRoot(), pages);

/** The specimen file for a family in a colour scheme, or undefined when the family has none. */
function specimenFor(id: string, scheme: string): string | undefined {
  const built = join(pages, "specimen", `${id}--${scheme}.html`);
  if (existsSync(built)) return built;
  const legacy = LEGACY_SPECIMENS[id];
  return legacy === undefined ? undefined : join(repoRoot(), legacy);
}

const SCHEMES = ["light", "dark"] as const;
const STATUS_LEVELS = ["neutral", "success", "warning", "critical"];
const MAX_TAB_STOPS = 20;
const ARTEFACTS = join(repoRoot(), "reports", "forced-colors");

/**
 * What an element draws besides colour. A line counts only when it is drawn:
 * a style, a width above 0 and a colour that is not fully transparent.
 */
interface Marks {
  outline: string;
  border: string;
  underline: string;
  weight: string;
}

function marksOf(el: ElementHandle): Promise<Marks> {
  return el.evaluate((node) => {
    const s = getComputedStyle(node as Element);
    const clear = (colour: string) => /^rgba\(.*,\s*0\)$|\/\s*0\)$/.test(colour);
    const line = (style: string, width: string, colour: string) =>
      style === "none" || style === "hidden" || parseFloat(width) === 0 || clear(colour) ? "none" : `${width} ${style}`;
    return {
      outline: line(s.outlineStyle, s.outlineWidth, s.outlineColor),
      border: ["top", "right", "bottom", "left"]
        .map((side) => line(s.getPropertyValue(`border-${side}-style`), s.getPropertyValue(`border-${side}-width`), s.getPropertyValue(`border-${side}-color`)))
        .join(" / "),
      underline: s.textDecorationLine === "none" || clear(s.textDecorationColor) ? "none" : `${s.textDecorationLine} ${s.textDecorationStyle} ${s.textDecorationThickness}`,
      weight: s.fontWeight,
    };
  });
}

/** Tag, id and the start of the text, to name an element in a message. */
function nameOf(el: ElementHandle): Promise<string> {
  return el.evaluate((node) => {
    const e = node as Element;
    const text = (e.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ""}${text ? ` "${text}"` : ""}`;
  });
}

/** Bytes that differ between two buffers, counting any difference in length. */
function differingBytes(a: Uint8Array, b: Uint8Array): number {
  let n = Math.abs(a.length - b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) n++;
  return n;
}

/**
 * A check the family has waived (an exception with profile forced-colors and this check's id) must still
 * fail, so a waiver cannot outlive its cause. Every other check runs as written.
 */
function waivable(family: ResolvedFamily, id: string, scheme: string, body: () => void | Promise<void>): () => Promise<void> {
  const waiver = (family.source.exceptions ?? []).find((e) => e.profile === "forced-colors" && e.id === id && (e.mode === undefined || e.mode === scheme));
  return async () => {
    if (!waiver) return body();
    let failed = false;
    try {
      await body();
    } catch {
      failed = true;
    }
    expect(failed, `the exception for forced-colors ${id} (${scheme}) is stale: the check passes now`).toBe(true);
  };
}

const found = await launchChromium();

describe("forced-colors", () => {
  const families = withProfile("forced-colors");

  it("applies to at least one family", () => {
    expect(families.length).toBeGreaterThan(0);
  });

  if ("reason" in found) {
    it("has a Chromium to render the specimens", (ctx) => {
      if (process.env.ENSIGNS_REQUIRE_BROWSER === "1") throw new Error(`ENSIGNS_REQUIRE_BROWSER=1 and no browser: ${found.reason}`);
      ctx.skip(found.reason);
    });
    return;
  }
  const { browser } = found;
  afterAll(() => browser.close());

  for (const family of families) {
    const id = family.meta.id;
    if (SCHEMES.some((scheme) => specimenFor(id, scheme) === undefined)) {
      it(`${id} has a specimen`, () => {
        throw new Error(`${id} lists forced-colors but has no specimen: add families/${id}/specimen/specimen.html`);
      });
      continue;
    }

    for (const scheme of SCHEMES) {
      const specimen = specimenFor(id, scheme)!;
      describe(`${id} ${scheme}`, () => {
        let context: BrowserContext | undefined;
        let page: Page;
        const requests: string[] = [];

        beforeAll(async () => {
          context = await browser.newContext({ forcedColors: "active", colorScheme: scheme });
          // Nothing leaves the machine; the request event still records each attempt.
          await context.route((url) => url.protocol !== "file:", (route) => route.abort());
          page = await context.newPage();
          page.on("request", (request) => requests.push(request.url()));
          await page.goto(pathToFileURL(specimen).href);
          await page.screenshot({ path: join(ARTEFACTS, `${id}-${scheme}.png`), fullPage: true, animations: "disabled" });
        }, 60_000);

        afterAll(() => context?.close());

        it("renders with forced colours active", async () => {
          expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches), "matchMedia('(forced-colors: active)')").toBe(true);
        });

        it("requests nothing beyond file:// URLs", waivable(family, "network", scheme, () => {
          expect(requests.filter((url) => !url.startsWith("file:")), "the specimen requests URLs outside the file system").toEqual([]);
        }));

        it("focus: each Tab stop gains an outline, border or text decoration", waivable(family, "focus", scheme, async () => {
          const stops: { el: ElementHandle; name: string; focused: Marks }[] = [];
          for (let i = 0; i < MAX_TAB_STOPS; i++) {
            await page.keyboard.press("Tab");
            const el = (await page.evaluateHandle(() => document.activeElement)).asElement();
            if (el === null || (await el.evaluate((node) => node === document.body))) break;
            stops.push({ el, name: await nameOf(el), focused: await marksOf(el) });
          }
          await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
          const colourOnly: string[] = [];
          for (const { el, name, focused } of stops) {
            const rest = await marksOf(el);
            if (focused.outline === rest.outline && focused.border === rest.border && focused.underline === rest.underline) colourOnly.push(name);
          }
          expect(stops.length, "Tab reaches at least one element").toBeGreaterThan(0);
          expect(colourOnly, "focused elements that keep the outline, border and text decoration they have unfocused").toEqual([]);
        }));

        it("selection: a selected paragraph looks different", async () => {
          const paragraph = page.locator("p.prose");
          expect(await paragraph.count(), "the specimen has one p.prose paragraph to select").toBe(1);
          const before = await paragraph.screenshot({ animations: "disabled" });
          const again = await paragraph.screenshot({ animations: "disabled" });
          await paragraph.evaluate((node) => getSelection()?.selectAllChildren(node));
          const selected = await page.evaluate(() => getSelection()?.toString() ?? "");
          const after = await paragraph.screenshot({ animations: "disabled" });
          await page.evaluate(() => getSelection()?.removeAllRanges());
          const changed = differingBytes(before, after);
          console.info(`${id} ${scheme}: ${changed} bytes differ between the paragraph screenshots before (${before.length} bytes) and after (${after.length} bytes) selecting`);
          expect(differingBytes(before, again), "two screenshots of the unselected paragraph are identical").toBe(0);
          expect(selected.length, "selectAllChildren selects the paragraph's text").toBeGreaterThan(0);
          expect(changed, "the selected paragraph differs from the unselected one").toBeGreaterThan(0);
        });

        it("current: the current item differs from its siblings in border, underline or weight", waivable(family, "current", scheme, async () => {
          const items = await page.locator("[aria-current]:not([aria-current='false'])").elementHandles();
          expect(items.length, "the specimen marks a current item with aria-current").toBeGreaterThan(0);
          const alike: string[] = [];
          let siblings = 0;
          for (const item of items) {
            const mine = await marksOf(item);
            for (const sibling of await item.$$("xpath=../*")) {
              const flag = await sibling.getAttribute("aria-current");
              if (flag !== null && flag !== "false") continue;
              siblings++;
              const theirs = await marksOf(sibling);
              if (mine.border === theirs.border && mine.underline === theirs.underline && mine.weight === theirs.weight) {
                alike.push(`${await nameOf(item)} matches ${await nameOf(sibling)}`);
              }
            }
          }
          expect(siblings, "the current item has siblings that are not current").toBeGreaterThan(0);
          expect(alike, "current items that match a sibling in border, underline and weight").toEqual([]);
        }));

        it("status: the four levels differ by border or icon, and each carries words", async () => {
          const looks = new Map<string, { border: string; icon: string }[]>();
          const wordless: string[] = [];
          for (const chip of await page.locator("[data-status]").elementHandles()) {
            const level = (await chip.getAttribute("data-status")) ?? "";
            const icon = await chip.$("svg, img, [role='img']");
            const box = icon === null ? null : await icon.boundingBox();
            const look = {
              border: (await marksOf(chip)).border,
              icon: icon !== null && box !== null && box.width > 0 && box.height > 0 ? await icon.evaluate((node) => (node as Element).outerHTML) : "none",
            };
            looks.set(level, [...(looks.get(level) ?? []), look]);
            if (((await chip.textContent()) ?? "").trim() === "") wordless.push(`${level}: ${await nameOf(chip)}`);
          }
          const alike: string[] = [];
          for (const [i, a] of STATUS_LEVELS.entries()) {
            for (const b of STATUS_LEVELS.slice(i + 1)) {
              const shared = looks.get(a)?.find((x) => looks.get(b)?.some((y) => x.border === y.border && x.icon === y.icon));
              if (shared) alike.push(`${a} and ${b} both draw border ${shared.border} and ${shared.icon === "none" ? "no icon" : "the same icon"}`);
            }
          }
          expect(STATUS_LEVELS.filter((level) => !looks.has(level)), "status levels the specimen does not show").toEqual([]);
          expect(wordless, "status chips without words").toEqual([]);
          expect(alike, "status levels alike in border width, border style and icon").toEqual([]);
        });
      });
    }
  }
});
