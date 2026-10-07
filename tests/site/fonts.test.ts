// The bundled fonts. Every TrueType file has a WOFF2 file that the style sheet offers first, every WOFF2
// file says where it came from and what its hashes are, and a family whose licence declares a Reserved
// Font Name is converted and never subset.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRoot } from "../../lib/model/load.ts";

interface Source { family: string; file: string; sha256: string; derivedFrom?: string; derivedFromSha256?: string; derivation?: string; }

const dir = join(repoRoot(), "site/public/fonts");
const sources = JSON.parse(readFileSync(join(dir, "sources.json"), "utf8")) as Source[];
const css = readFileSync(join(dir, "fonts.css"), "utf8");
const sha = (file: string) => createHash("sha256").update(readFileSync(join(dir, file))).digest("hex");
const size = (file: string) => statSync(join(dir, file)).size;
const fromTrueType = sources.filter((s) => s.file.endsWith(".woff2") && s.derivedFrom?.endsWith(".ttf"));

describe("the bundled fonts", () => {
  it("offer a WOFF2 file before every TrueType file in the style sheet", () => {
    const truetype = (css.match(/@font-face\{[^}]*\}/g) ?? []).filter((rule) => rule.includes('format("truetype")'));
    expect(truetype.length).toBeGreaterThan(20);
    for (const rule of truetype) {
      const urls = [...rule.matchAll(/url\("([^"]+)"\) format\("([^"]+)"\)/g)];
      expect(urls.map((u) => u[2]), rule).toEqual(["woff2", "truetype"]);
      expect(urls[0]![1], rule).toBe(urls[1]![1]!.replace(/\.ttf$/, ".woff2"));
      expect(existsSync(join(dir, urls[0]![1]!)), urls[0]![1]).toBe(true);
    }
  });

  it("have a WOFF2 file for every TrueType file, with the source and both hashes recorded and true", () => {
    expect(fromTrueType.length).toBe(sources.filter((s) => s.file.endsWith(".ttf") && !s.derivedFrom).length);
    for (const entry of fromTrueType) {
      expect(sha(entry.file), `${entry.file} sha256`).toBe(entry.sha256);
      expect(sha(entry.derivedFrom!), `${entry.derivedFrom} sha256`).toBe(entry.derivedFromSha256);
      expect(entry.derivation, entry.file).toMatch(/fontTools \d/);
      expect(size(entry.file), `${entry.file} is smaller than its source`).toBeLessThan(size(entry.derivedFrom!));
    }
  });

  it("never subset a family whose licence text declares a Reserved Font Name", () => {
    // The declaration sits on the copyright line: with Reserved Font Name "Plex". Every OFL text also
    // defines the term in its preamble, so the phrase alone proves nothing.
    const reserved = readdirSync(dir)
      .filter((f) => /OFL.*\.txt$/.test(f) && /with Reserved Font Names?\s+["“]/i.test(readFileSync(join(dir, f), "utf8")))
      .map((f) => f.replace(/-?OFL-?/, "").replace(/\.txt$/, ""));
    expect(reserved.length, "families with a reserved name").toBeGreaterThanOrEqual(4);
    for (const prefix of reserved) {
      const entries = fromTrueType.filter((s) => s.file.startsWith(`${prefix}-`));
      expect(entries.length, prefix).toBeGreaterThan(0);
      for (const entry of entries) expect(entry.derivation, entry.file).toMatch(/^Converted to WOFF2/);
    }
    for (const entry of fromTrueType.filter((s) => !reserved.some((prefix) => s.file.startsWith(`${prefix}-`)))) {
      expect(entry.derivation, entry.file).toMatch(/^Subset with fontTools/);
    }
  });
});
