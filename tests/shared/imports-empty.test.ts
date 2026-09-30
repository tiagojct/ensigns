// The import folder is a staging area. The brief says it must be empty when
// phase 2 ends: every imported file has a home in the layout.
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { repoRoot } from "../../lib/model/load.ts";

describe("imports/", () => {
  it("holds no tracked file", () => {
    const listed = execFileSync("git", ["ls-files", "imports"], { cwd: repoRoot(), encoding: "utf8" }).trim();
    expect(listed).toBe("");
  });
});
