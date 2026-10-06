// Build the local family pages: read every family and candidate, validate them,
// run the environment harness, and write a static site. Build time only (file
// system, Ajv, and APCA through the harness).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildReport, loadContext } from "../../lib/harness/index.ts";
import type { Thresholds } from "../../lib/harness/index.ts";
import { loadFamilies, loadSchema, readJson } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { MODES } from "../../lib/model/types.ts";
import type { FamilyFile, Meta } from "../../lib/model/types.ts";
import { validateFamily } from "../../lib/model/validate.ts";
import { simulationViews } from "./filters.ts";
import { familyPage, indexPage, standalonePage } from "./render.ts";
import type { Entry, Group, Site } from "./render.ts";
import { scopeProperties, tokensCss } from "./tokens-css.ts";
import { generateAll } from "../../lib/generators/index.ts";

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), "assets");

const FORBIDDEN: [RegExp, string][] = [
  [/<script/i, "a script element"],
  [/<style/i, "a style element"],
  [/(?<![\w-])style\s*=/i, "a style attribute"],
  [/<[^>]*\son[a-z]+\s*=/i, "an event handler attribute"],
  [/javascript:/i, "a javascript: URL"],
  [/[a-z][a-z0-9+.-]*:\/\/|(?:=\s*["']?|url\(\s*["']?)\/\//i, "an external URL"],
  [/(?<![&\w])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![\w-])/i, "a hex colour"],
  [/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i, "a colour function"],
];

/** Refuse a specimen file that would break the pages' rules. The fragment is used as it is, never cleaned. */
export function checkSpecimen(file: string, source: string): void {
  for (const [pattern, what] of FORBIDDEN) {
    const m = pattern.exec(source);
    if (m) throw new Error(`${file} contains ${what} (${JSON.stringify(m[0])}). A specimen takes every colour from tokens.css through its stylesheet; see scripts/pages/README.md.`);
  }
}

function tokenFile(rel: string, raw: unknown, schema: object): FamilyFile {
  const errors = validateFamily(raw, schema).filter((i) => i.level === "error");
  if (errors.length > 0) throw new Error(`${rel} is not a valid token file:\n${errors.map((e) => `  ${e.where}: ${e.message}`).join("\n")}`);
  return raw as FamilyFile;
}

function readSpecimen(root: string, id: string): { html: string; css?: string } | undefined {
  const base = `families/${id}/specimen`;
  if (!existsSync(join(root, base, "specimen.html"))) return undefined;
  const html = readFileSync(join(root, base, "specimen.html"), "utf8");
  checkSpecimen(`${base}/specimen.html`, html);
  if (!existsSync(join(root, base, "specimen.css"))) return { html };
  const css = readFileSync(join(root, base, "specimen.css"), "utf8");
  checkSpecimen(`${base}/specimen.css`, css);
  return { html, css };
}

/** A specimen stylesheet may name only properties that every token file of its family defines, or that it sets itself. */
function checkSpecimenProperties(id: string, css: string, entries: Pick<Entry, "family" | "file">[]): void {
  const own = new Set([...css.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((m) => m[1]!));
  const used = [...new Set([...css.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map((m) => m[1]!))].filter((p) => !own.has(p));
  for (const e of entries) {
    const defined = new Set(scopeProperties(e.family, "dark").map(([name]) => name));
    const missing = used.filter((p) => !defined.has(p));
    if (missing.length > 0) throw new Error(`families/${id}/specimen/specimen.css uses ${missing.join(", ")}, which ${e.file} does not define`);
  }
}

/** The host first, then the ships in the order the Pequod meets them. */
const bookOrder = (m: Meta): number => (m.host ? 0 : Array.isArray(m.chapter) ? m.chapter[0] : (m.chapter ?? Number.MAX_SAFE_INTEGER));

/**
 * Write the pages for the families under root into out and return the files written, relative
 * to out. Nothing in out is deleted, so a page of a removed family or candidate stays until
 * out is cleared by hand.
 */
export function buildPages(root: string, out: string): string[] {
  const schema = loadSchema(root);
  const thresholds = readJson(join(root, "tests/environments.json")) as Thresholds;
  const ctx = loadContext(root);
  const loaded = loadFamilies(root);

  const partial: { id: string; entries: Omit<Entry, "report">[]; specimen?: { html: string; css?: string }; docs: Group["docs"] }[] = [];
  for (const f of loaded) {
    const id = f.dir;
    const file = `families/${id}/${id}.tokens.json`;
    const entries: Omit<Entry, "report">[] = [{ id, scope: id, file, family: resolveFamily(tokenFile(file, f.raw, schema)) }];
    const dir = join(root, "families", id, "candidates");
    const names = existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".tokens.json")).sort() : [];
    for (const name of names) {
      const candidate = name.slice(0, -".tokens.json".length);
      const rel = `families/${id}/candidates/${name}`;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)) throw new Error(`${rel}: a candidate's name is lower-case letters and digits, with single hyphens`);
      const candidateFile = tokenFile(rel, readJson(join(root, rel)), schema);
      if (candidateFile.meta.id !== id) throw new Error(`${rel}: meta.id is ${candidateFile.meta.id}, but a candidate keeps its family's id, ${id}`);
      entries.push({ id, scope: `${id}--${candidate}`, candidate, file: rel, family: resolveFamily(candidateFile) });
    }
    const docs: Group["docs"] = {};
    if (existsSync(join(root, "families", id, "README.md"))) docs.readme = `families/${id}/README.md`;
    if (existsSync(join(root, "families", id, "CHANGELOG.md"))) docs.changelog = `families/${id}/CHANGELOG.md`;
    partial.push({ id, entries, specimen: readSpecimen(root, id), docs });
  }
  for (const dir of readdirSync(join(root, "families"), { withFileTypes: true })) {
    if (dir.isDirectory() && !loaded.some((f) => f.dir === dir.name) && existsSync(join(root, "families", dir.name, "candidates"))) {
      console.warn(`families/${dir.name} has candidates but no ${dir.name}.tokens.json, so it has no pages`);
    }
  }

  for (const p of partial) if (p.specimen?.css !== undefined) checkSpecimenProperties(p.id, p.specimen.css, p.entries);

  // The harness runs last, once the inputs are known to be sound. A candidate stands in for its family on disk.
  const groups: Group[] = partial.map((p) => {
    const entries = p.entries.map((e): Entry => ({ ...e, report: buildReport(e.family, thresholds, ctx) }));
    return { id: p.id, main: entries[0]!, candidates: entries.slice(1), docs: p.docs, ...(p.specimen ? { specimen: { html: p.specimen.html, css: p.specimen.css !== undefined } } : {}) };
  });
  groups.sort((a, b) => bookOrder(a.main.family.meta) - bookOrder(b.main.family.meta) || a.id.localeCompare(b.id, "en"));

  const site: Site = { groups, thresholds, views: simulationViews(thresholds) };
  const written: string[] = [];
  const write = (rel: string, content: string | Uint8Array) => {
    const path = join(out, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    written.push(rel);
  };

  const scopes = groups.flatMap((g) => [g.main, ...g.candidates]).map((e) => ({ scope: e.scope, family: e.family }));
  write("assets/tokens.css", tokensCss(scopes, groups.find((g) => g.id === "pequod")?.main.family));
  for (const name of ["pages.css", "standalone.css"]) write(`assets/${name}`, readFileSync(join(ASSETS, name), "utf8"));
  for (const p of partial) if (p.specimen?.css !== undefined) write(`assets/specimen-${p.id}.css`, p.specimen.css);

  write("index.html", indexPage(site));
  for (const g of groups) {
    for (const e of [g.main, ...g.candidates]) {
      e.exports = generateAll(e.family).filter((result) => result.files.length > 0).map(({ generator, files }) => ({
        label: generator.label,
        files: files.map((file) => {
          const path = `exports/${e.scope}/${generator.id}/${file.name}`;
          write(path, file.content);
          return { name: file.name, path };
        }),
      }));
      write(`${e.scope}.html`, familyPage(site, g, e));
      if (g.specimen) for (const mode of MODES) write(`specimen/${e.scope}--${mode}.html`, standalonePage(g, e, mode));
    }
  }
  return written;
}
