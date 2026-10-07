// The ci workflow runs on every push to main and on every pull request. This test keeps its
// promises in one place: the R package is built and its archive checked as CRAN checks it, the
// Python package is tested with pytest, every action is pinned to a commit, and no job can write
// to the repository, read a secret or run without a time limit.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRoot } from "../../lib/model/load.ts";

const root = repoRoot();
/** The workflow without its comment lines, so a comment cannot satisfy or break a check. */
const text = readFileSync(join(root, ".github/workflows/ci.yml"), "utf8").split("\n").filter((line) => !line.trim().startsWith("#")).join("\n");
/** The indented lines under a top-level key. */
const block = (key: string) => text.match(new RegExp(`^${key}:\\n((?:[ \\t].*\\n|\\n)*)`, "m"))?.[1] ?? "";
const jobs = Object.fromEntries(block("jobs").split(/^ {2}(?=[\w-]+:$)/m).filter((job) => job.trim()).map((job) => [job.slice(0, job.indexOf(":")), job]));

describe("the ci workflow", () => {
  it("runs every job on every push to main and on every pull request", () => {
    const on = block("on");
    expect(on).toMatch(/^ {2}push:\n {4}branches: \[main\]$/m);
    expect(on).toMatch(/^ {2}pull_request:$/m);
    for (const [name, job] of Object.entries(jobs)) expect(job, name).not.toMatch(/^ {4}if:/m);
  });

  it("can only read the repository", () => {
    expect(block("permissions").trim()).toBe("contents: read");
    expect(text).not.toMatch(/:\s*write\b|write-all/);
  });

  it("reads no secret", () => {
    expect(text).not.toMatch(/\bsecrets\b/);
  });

  it("gives every job a time limit", () => {
    expect(Object.keys(jobs)).toEqual(expect.arrayContaining(["test", "r-package", "python-package"]));
    for (const [name, job] of Object.entries(jobs)) expect(job, name).toMatch(/^ {4}timeout-minutes: \d+$/m);
  });

  it("pins every action to a full commit hash, with its version beside it", () => {
    const uses = [...text.matchAll(/^\s+(?:- )?uses: (.+)$/gm)].map((m) => m[1]!);
    expect(uses.length).toBeGreaterThan(5);
    for (const u of uses) expect(u, u).toMatch(/^[\w.-]+\/[\w./-]+@[0-9a-f]{40} # v\d+(?:\.\d+)*$/);
  });

  it("builds the R package with R CMD build, then checks the built archive with R CMD check --as-cran", () => {
    const r = jobs["r-package"] ?? "";
    const build = r.search(/^\s+run: R CMD build ensigns$/m);
    expect(build).toBeGreaterThan(-1);
    expect(r.search(/^\s+R CMD check --as-cran\b[^\n]* ensigns_\*\.tar\.gz$/m)).toBeGreaterThan(build);
    expect(r).toContain("grep -qx 'Status: OK' ensigns.Rcheck/00check.log");
  });

  it("installs the Python package with its plot extra and runs the pytest suite against it", () => {
    const python = jobs["python-package"] ?? "";
    expect(python).toContain('-m pip install "./dist/packages/python[plot]" pytest');
    expect(python).toContain("python -m pytest tests/packages/python");
    expect(existsSync(join(root, "tests/packages/python/test_ensigns.py"))).toBe(true);
  });
});
