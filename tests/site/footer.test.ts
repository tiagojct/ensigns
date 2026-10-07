// The footer names the build: the collection version, each family's version and, in the image
// build, the commit and its date (checkpoint 5, D34). A local build has no commit, so it prints
// none and stays repeatable.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { repoRoot } from "../../lib/model/load.ts";
import { catalogueEntries } from "../../scripts/site/build.ts";
import { pages } from "../../scripts/site/render.ts";
import type { CatalogueFamily } from "../../scripts/site/render.ts";
import { STAMP_ENV, readStamp } from "../../scripts/site/stamp.ts";

const SHA = "3477a91eae0b59a33df9efb5642326923af4ae79";
const env = (sha?: string, date?: string, require?: string) => ({ [STAMP_ENV.sha]: sha, [STAMP_ENV.date]: date, [STAMP_ENV.require]: require });

describe("the commit stamp", () => {
  it("is absent in a local build", () => {
    expect(readStamp({})).toBeNull();
    expect(readStamp(env("", ""))).toBeNull();
  });

  it("reads a full commit hash and a date, and ignores surrounding space", () => {
    expect(readStamp(env(SHA, "2026-10-07"))).toEqual({ sha: SHA, date: "2026-10-07" });
    expect(readStamp(env(` ${SHA}\n`, "2026-10-07 "))).toEqual({ sha: SHA, date: "2026-10-07" });
  });

  it("stops on a hash that is missing, short, in upper case or not a hash", () => {
    for (const sha of ["", SHA.slice(0, 7), SHA.toUpperCase(), "not-a-hash"]) {
      expect(() => readStamp(env(sha, "2026-10-07")), sha).toThrow(STAMP_ENV.sha);
    }
  });

  it("stops on a date that is missing or not on the calendar", () => {
    for (const date of ["", "2026-02-30", "2026-13-01", "07/10/2026", "2026-10-07T10:00:00Z"]) {
      expect(() => readStamp(env(SHA, date)), date).toThrow(STAMP_ENV.date);
    }
  });

  it("is required by the image build", () => {
    expect(() => readStamp(env("", "", "1"))).toThrow("required");
    expect(readStamp(env(SHA, "2026-10-07", "1"))).toEqual({ sha: SHA, date: "2026-10-07" });
  });

  it("stops the real build script when an image build has no commit", () => {
    const run = spawnSync(process.execPath, ["scripts/site/build.ts"], {
      cwd: repoRoot(),
      encoding: "utf8",
      env: { ...process.env, [STAMP_ENV.require]: "1", [STAMP_ENV.sha]: "", [STAMP_ENV.date]: "" },
    });
    expect(run.status).not.toBe(0);
    expect(run.stderr).toContain(STAMP_ENV.sha);
    expect(run.stdout).not.toContain("Prepared");
  });

  it("is read before the build script measures, removes or writes anything", () => {
    const source = readFileSync(join(repoRoot(), "scripts/site/build.ts"), "utf8");
    const body = source.slice(source.indexOf("export function prepareSite"));
    const read = body.indexOf("readStamp(process.env)");
    expect(read).toBeGreaterThan(-1);
    for (const later of ["catalogueEntries(", "rmSync(", "write("]) expect(read, later).toBeLessThan(body.indexOf(later));
  });
});

describe("the footer", () => {
  let entries: CatalogueFamily[];
  beforeAll(() => {
    entries = catalogueEntries().entries;
  });
  const footer = (html: string) => html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)![0];

  it("names the commit, its date, the collection version and every family version on every page", () => {
    const rendered = pages(entries, "1.0.0", { sha: SHA, date: "2026-10-07" });
    expect(rendered.size).toBeGreaterThan(10);
    for (const [path, html] of rendered) {
      const text = footer(html);
      expect(text, path).toContain(`<a href="https://github.com/tiagojct/ensigns/commit/${SHA}"><code>3477a91</code></a>`);
      expect(text, path).toContain('<time datetime="2026-10-07">2026-10-07</time>');
      expect(text, path).toContain("Collection 1.0.0");
      for (const { family } of entries) expect(text, path).toContain(`${family.meta.name} ${family.meta.version}`);
    }
  });

  it("prints no commit and no date without a stamp, and gives the same bytes twice", () => {
    const first = pages(entries, "1.0.0");
    const second = pages(entries, "1.0.0");
    for (const [path, html] of first) {
      const text = footer(html);
      expect(text, path).toContain("Collection 1.0.0");
      expect(text, path).not.toMatch(/commit|<time/);
      expect(html, path).toBe(second.get(path));
    }
  });
});
