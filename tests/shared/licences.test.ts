// Licence guards for dependencies that must not reach a browser bundle.
//
// apca-w3 0.1.9 carries a Limited W3 License that excludes clinical, human-safety
// and non-web use, and it depends on colorparsley 0.1.8, which is AGPL-3.0. The
// project is MIT, so APCA stays at build time: its numbers ship as data in the
// reports, and no code that reaches a browser imports it.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRoot } from "../../lib/model/load.ts";

const root = repoRoot();

function* walk(dir: string): Generator<string> {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (statSync(p).isFile() && p.endsWith(".ts")) yield p;
  }
}

describe("apca-w3", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

  it("is a development dependency, not a runtime one", () => {
    expect(pkg.dependencies?.["apca-w3"]).toBeUndefined();
    expect(pkg.devDependencies?.["apca-w3"]).toBeDefined();
  });

  it("is imported only by lib/colour/apca.ts", () => {
    const importers: string[] = [];
    for (const dir of ["lib", "site/src"]) {
      let files: string[] = [];
      try { files = [...walk(join(root, dir))]; } catch { continue; }
      for (const f of files) if (/from\s+["']apca-w3["']/.test(readFileSync(f, "utf8"))) importers.push(relative(root, f));
    }
    expect(importers).toEqual(["lib/colour/apca.ts"]);
  });

  it("is not re-exported from the public colour index", () => {
    const index = readFileSync(join(root, "lib/colour/index.ts"), "utf8");
    const exports = index.split("\n").filter((l) => l.trim().startsWith("export"));
    expect(exports.some((l) => l.includes("apca"))).toBe(false);
  });

  it("is imported by path, never from the colour index, by anything that could reach a browser", () => {
    const offenders: string[] = [];
    for (const f of walk(join(root, "lib"))) {
      const src = readFileSync(f, "utf8");
      if (/apca/.test(src) && !f.endsWith("lib/colour/apca.ts") && !f.endsWith("lib/colour/apca-w3.d.ts") && !f.endsWith("lib/colour/index.ts") && !relative(root, f).startsWith("lib/harness/")) {
        offenders.push(relative(root, f));
      }
    }
    expect(offenders).toEqual([]);
  });
});
