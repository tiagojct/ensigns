// No colour value is typed anywhere except in a family's palette. A hex value
// in lib/, packages/, the site sources or the docs must be a palette value of
// some family, or sit in a file the exemption file lists with a reason.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";

const root = repoRoot();
const exemptions = JSON.parse(readFileSync(join(root, "tests/shared/hex-exemptions.json"), "utf8")) as {
  globs: { pattern: string; why: string }[];
  values: string[];
};

const TEXT = new Set([".ts", ".js", ".mjs", ".cjs", ".css", ".scss", ".json", ".md", ".typ", ".toml", ".yml", ".yaml", ".html", ".svg", ".r", ".py", ".lua", ".conf", ".txt", ".qmd", ".cff", ".tex", ".sh"]);
// Directories and files the lint covers. Token files hold the palette, so they are not scanned.
const ROOTS = ["lib", "packages", "docs", "families", "scripts/pages", "site/src", "site/public", "README.md", "CHANGELOG.md", "CITATION.cff"];
const SKIP_DIRS = new Set(["node_modules", ".git"]);

/** ** matches any path, **\/ matches any folders (or none), * matches within one folder. */
function globToRegExp(pattern: string): RegExp {
  let re = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]!;
    if (c === "*" && pattern[i + 1] === "*") {
      i++;
      if (pattern[i + 1] === "/") { i++; re += "(?:.*/)?"; } else re += ".*";
    } else if (c === "*") re += "[^/]*";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}
const exemptRes = exemptions.globs.map((g) => globToRegExp(g.pattern));
const isExempt = (rel: string) => exemptRes.some((re) => re.test(rel));

function* walk(path: string): Generator<string> {
  const s = statSync(path, { throwIfNoEntry: false });
  if (!s) return;
  if (s.isFile()) { yield path; return; }
  for (const e of readdirSync(path, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    yield* walk(join(path, e.name));
  }
}

const allowed = new Set<string>();
for (const f of loadFamilies()) for (const c of resolveFamily(f.file).palette.values()) allowed.add(c.hex);
for (const v of exemptions.values) allowed.add(v.toUpperCase());

// Six or eight hex digits after a hash, not part of a longer word or an HTML entity.
const HEX = /(?<![0-9A-Za-z&])#([0-9a-fA-F]{6})(?:[0-9a-fA-F]{2})?(?![0-9A-Za-z])/g;

describe("stray hex lint", () => {
  it("covers real files", () => {
    let n = 0;
    for (const r of ROOTS) for (const f of walk(join(root, r))) if (TEXT.has(extname(f).toLowerCase())) n++;
    expect(n).toBeGreaterThan(20);
  });

  it("finds no colour value that does not trace to a palette", () => {
    const offenders: string[] = [];
    for (const r of ROOTS) {
      for (const file of walk(join(root, r))) {
        const rel = relative(root, file).split("\\").join("/");
        if (!TEXT.has(extname(file).toLowerCase())) continue;
        if (rel.endsWith(".tokens.json") || isExempt(rel)) continue;
        const lines = readFileSync(file, "utf8").split("\n");
        lines.forEach((line, i) => {
          for (const m of line.matchAll(HEX)) {
            if (!allowed.has(`#${m[1]!.toUpperCase()}`)) offenders.push(`${rel}:${i + 1} ${m[0]}`);
          }
        });
      }
    }
    expect(offenders).toEqual([]);
  });

  it("explains every exemption", () => {
    for (const g of exemptions.globs) expect(g.why.length).toBeGreaterThan(20);
  });
});
