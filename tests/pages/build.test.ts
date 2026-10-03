// The local family pages, built from the repository's families, the two example
// specimens in tests/pages/fixtures and a trial candidate, into a temporary folder.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { formatHex } from "../../lib/colour/srgb.ts";
import type { Thresholds } from "../../lib/harness/types.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import type { LoadedFamily } from "../../lib/model/load.ts";
import { filtersSvg, simulationViews } from "../../scripts/pages/filters.ts";
import { buildPages, checkSpecimen } from "../../scripts/pages/generate.ts";
import { esc } from "../../scripts/pages/render.ts";
import { designLeaves } from "../../scripts/pages/tokens-css.ts";

const repo = repoRoot();
const FIXTURES = join(repo, "tests/pages/fixtures");
const SPECIMENS = readdirSync(FIXTURES).sort();
const MODES = ["dark", "light"] as const;
const work = mkdtempSync(join(tmpdir(), "ensigns-pages-"));

/** A repository root with the families, the thresholds, the schema, the example specimens and a candidate for Pequod. */
function makeRoot(name: string): string {
  const root = join(work, name);
  cpSync(join(repo, "families"), join(root, "families"), { recursive: true });
  for (const f of ["tests/environments.json", "schema/family.schema.json"]) cpSync(join(repo, f), join(root, f));
  for (const id of SPECIMENS) cpSync(join(FIXTURES, id), join(root, "families", id, "specimen"), { recursive: true });
  const trial = JSON.parse(readFileSync(join(repo, "families/pequod/pequod.tokens.json"), "utf8"));
  trial.meta.version = "0.3.1-trial";
  mkdirSync(join(root, "families/pequod/candidates"), { recursive: true });
  writeFileSync(join(root, "families/pequod/candidates/trial.tokens.json"), JSON.stringify(trial));
  return root;
}

let root = "";
let out = "";
let written: string[] = [];
let families: LoadedFamily[] = [];

beforeAll(() => {
  root = makeRoot("root");
  out = join(work, "a");
  written = buildPages(root, out);
  families = loadFamilies(root);
});
afterAll(() => rmSync(work, { recursive: true, force: true }));

const read = (rel: string): string => readFileSync(join(out, rel), "utf8");
const pages = (): string[] => written.filter((f) => f.endsWith(".html"));
const scopesOf = (id: string): string[] => [id, ...(id === "pequod" ? ["pequod--trial"] : [])];
const plainText = (html: string): string => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/** The custom properties of each [data-scope][data-mode] block in tokens.css, by "scope mode". */
function scopeBlocks(): Map<string, string[]> {
  const blocks = new Map<string, string[]>();
  for (const m of read("assets/tokens.css").matchAll(/\[data-scope="([^"]+)"\]\[data-mode="(dark|light)"\] \{\n([^}]*)\}/g)) {
    blocks.set(`${m[1]} ${m[2]}`, [...m[3]!.matchAll(/^\s*(--[\w-]+):/gm)].map((x) => x[1]!));
  }
  return blocks;
}
const varsUsed = (css: string): string[] => [...new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]!))];

describe("the family pages", () => {
  it("write the index, a page per family and candidate, and the stylesheets", () => {
    expect(families.length).toBeGreaterThan(3);
    for (const f of ["index.html", "assets/tokens.css", "assets/pages.css", "assets/standalone.css"]) expect(written).toContain(f);
    for (const f of families) for (const scope of scopesOf(f.dir)) expect(written).toContain(`${scope}.html`);
    for (const id of SPECIMENS) expect(written).toContain(`assets/specimen-${id}.css`);
  });

  it("show each family's verbatim quote and its goal", () => {
    for (const f of families) {
      const html = read(`${f.dir}.html`);
      expect(html, f.dir).toContain(esc(f.file.meta.goal));
      if (f.file.meta.quote) expect(html, f.dir).toContain(`<blockquote><p>${esc(f.file.meta.quote)}</p></blockquote>`);
    }
  });

  it("link a family and its candidates both ways", () => {
    expect(read("pequod.html")).toContain('href="pequod--trial.html"');
    expect(read("index.html")).toContain('href="pequod--trial.html"');
    const candidate = read("pequod--trial.html");
    expect(candidate).toContain('<p class="note">Candidate trial for Pequod');
    expect(candidate).toContain('href="pequod.html"');
  });

  it("hold no inline style or script, no javascript: URL and no remote URL", () => {
    for (const f of pages()) {
      const html = read(f);
      for (const banned of [/<style/i, /\sstyle=/i, /<script/i, /javascript:/i, /https?:\/\//i]) expect(html, f).not.toMatch(banned);
    }
  });

  it("put no colour into the markup: a hex value appears only as displayed text", () => {
    for (const f of pages()) {
      const markup = read(f).replace(/<code class="hex">#[0-9A-F]{6}<\/code>/g, "");
      expect(markup, f).not.toMatch(/#[0-9A-Fa-f]{6}/);
    }
  });

  it("give tokens.css a block for every family and candidate in both modes, with the same properties in each", () => {
    const blocks = scopeBlocks();
    for (const f of families) {
      for (const scope of scopesOf(f.dir)) {
        const dark = blocks.get(`${scope} dark`);
        expect(dark?.length, scope).toBeGreaterThan(40);
        expect(blocks.get(`${scope} light`), scope).toEqual(dark);
      }
    }
  });

  it("exposes arrays in design as space-separated custom properties", () => {
    const leaves = [...designLeaves({ border: ["1px", "solid", "red"], list: [1, 2, 3] })];
    expect(leaves).toEqual([
      [["border"], "1px solid red"],
      [["list"], "1 2 3"],
    ]);
  });

  it("use only swatch, text, border and width classes that the stylesheets define", () => {
    const css = read("assets/tokens.css") + read("assets/pages.css");
    const defined = new Set([...css.matchAll(/^\.((?:sw|fg|bc|bw)-[\w-]+) \{/gm)].map((m) => m[1]!));
    const missing = new Set<string>();
    let used = 0;
    for (const f of pages()) {
      for (const m of read(f).matchAll(/class="([^"]*)"/g)) {
        for (const c of m[1]!.split(/\s+/)) {
          if (!/^(?:sw|fg|bc|bw)-/.test(c)) continue;
          used++;
          if (!defined.has(c)) missing.add(`${f}: .${c}`);
        }
      }
    }
    expect(used).toBeGreaterThan(100);
    expect([...missing]).toEqual([]);
  });

  it("name only custom properties that exist: the Pequod scope for the page, the family's own for a specimen", () => {
    const blocks = scopeBlocks();
    const pequod = new Set(blocks.get("pequod light"));
    for (const sheet of ["assets/pages.css", "assets/standalone.css"]) {
      expect(varsUsed(read(sheet)).filter((p) => !pequod.has(p)), sheet).toEqual([]);
    }
    for (const id of SPECIMENS) {
      const css = read(`assets/specimen-${id}.css`);
      const own = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]!));
      const scope = new Set(blocks.get(`${id} light`));
      expect(varsUsed(css).filter((p) => !scope.has(p) && !own.has(p)), id).toEqual([]);
    }
  });

  it("carry on every family page the filters that pages.css applies", () => {
    const ids = [...read("assets/pages.css").matchAll(/url\(#([\w-]+)\)/g)].map((m) => m[1]!);
    expect(ids.length).toBe(10);
    const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8")) as Thresholds;
    const svg = filtersSvg(simulationViews(thresholds));
    for (const f of families) {
      const html = read(`${f.dir}.html`);
      expect(html).toContain(svg);
      for (const id of ids) expect(html, `${f.dir}: ${id}`).toContain(`<filter id="${id}"`);
      for (const id of ids) expect(html, `${f.dir}: the radio for ${id}`).toContain(`value="${id.replace(/^sim-/, "")}"`);
    }
  });

  it("write the same bytes on a second build", () => {
    const second = buildPages(root, join(work, "b"));
    expect(second).toEqual(written);
    for (const f of written) expect(readFileSync(join(work, "b", f)).equals(readFileSync(join(out, f))), f).toBe(true);
  });
});

describe("the specimens", () => {
  it("sit once in each mode panel of the family page, with {mode} replaced", () => {
    for (const id of SPECIMENS) {
      const html = read(`${id}.html`);
      expect(html.split(`<div class="specimen specimen-${id}">`).length - 1, id).toBe(2);
      expect(html, id).not.toContain("{mode}");
      expect(html, id).toContain(`<link rel="stylesheet" href="assets/specimen-${id}.css">`);
    }
    const pequod = read("pequod.html");
    for (const mode of MODES) expect(pequod.split(`id="sp-entry-${mode}"`).length - 1).toBe(1);
  });

  it("have a standalone page per scope and mode with the fragment's text once", () => {
    const withSpecimen = families.filter((f) => existsSync(join(root, "families", f.dir, "specimen", "specimen.html")));
    expect(withSpecimen.map((f) => f.dir)).toEqual(expect.arrayContaining(SPECIMENS));
    for (const f of withSpecimen) {
      const fragment = readFileSync(join(root, "families", f.dir, "specimen", "specimen.html"), "utf8");
      for (const scope of scopesOf(f.dir)) {
        for (const mode of MODES) {
          const rel = `specimen/${scope}--${mode}.html`;
          expect(written, rel).toContain(rel);
          const page = read(rel);
          expect(page).toContain(`<body data-scope="${scope}" data-mode="${mode}">`);
          expect(page).toContain('<link rel="stylesheet" href="../assets/tokens.css">');
          const text = plainText(fragment.replaceAll("{mode}", mode));
          expect(plainText(page).split(text).length - 1, rel).toBe(1);
          expect((page.match(/<p\b[^>]*\bclass="[^"]*\bprose\b[^"]*"/g) ?? []).length, rel).toBe(1);
        }
      }
    }
    for (const f of families.filter((x) => !withSpecimen.includes(x))) expect(written.some((w) => w.startsWith(`specimen/${f.dir}--`)), f.dir).toBe(false);
  });

  it("refuse a script, a style, an event handler, a remote URL or a colour literal", () => {
    const hex = formatHex([0.2, 0.4, 0.6]);
    const colourFunction = ["rgb", "(1 2 3)"].join("");
    const cases: [string, string][] = [
      ["<script>go()</script>", "a script element"],
      ["<style>p { margin: 0 }</style>", "a style element"],
      ['<p style="margin: 0">x</p>', "a style attribute"],
      ['<button type="button" onclick="go()">x</button>', "an event handler attribute"],
      ['<a href="javascript:go()">x</a>', "a javascript: URL"],
      ['<img src="https://example.org/a.png" alt="">', "an external URL"],
      ['<a href="//example.org/">x</a>', "an external URL"],
      [".sp-a { background: url(//example.org/a.png); }", "an external URL"],
      [`.sp-a { color: ${hex}; }`, "a hex colour"],
      [`.sp-a { color: ${colourFunction}; }`, "a colour function"],
    ];
    for (const [source, what] of cases) expect(() => checkSpecimen("families/x/specimen/specimen.html", source), source).toThrow(what);
    const fine = '<svg class="sp-a" viewBox="0 0 8 8"><path class="sp-b" font-style="italic" d="M0 0h8"/></svg><a href="#sp-note-{mode}">note</a><p class="sp-c">One = one.</p>';
    expect(() => checkSpecimen("families/x/specimen/specimen.html", fine)).not.toThrow();
    expect(() => checkSpecimen("families/x/specimen/specimen.css", ".sp-a { fill: var(--roles-text); }")).not.toThrow();
  });

  it("stop the build with the file's name when a specimen breaks a rule", () => {
    const bad = makeRoot("bad");
    writeFileSync(join(bad, "families/goney/specimen/specimen.html"), '<p class="prose" style="margin: 0">Frost</p>');
    expect(() => buildPages(bad, join(work, "bad-out"))).toThrow("families/goney/specimen/specimen.html");
  });

  it("stop the build when a specimen stylesheet names a property its family lacks", () => {
    const bad = makeRoot("unknown-property");
    writeFileSync(join(bad, "families/goney/specimen/specimen.css"), ".sp-card { color: var(--accents-ahab); }\n");
    expect(() => buildPages(bad, join(work, "unknown-property-out"))).toThrow("--accents-ahab");
  });
});

describe("the candidates", () => {
  it("must keep their family's id", () => {
    const bad = makeRoot("wrong-id");
    const file = join(bad, "families/pequod/candidates/trial.tokens.json");
    const trial = JSON.parse(readFileSync(file, "utf8"));
    trial.meta.id = "goney";
    writeFileSync(file, JSON.stringify(trial));
    expect(() => buildPages(bad, join(work, "wrong-id-out"))).toThrow("keeps its family's id");
  });
});
