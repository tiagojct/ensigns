// editor: every syntax role clears 4.5:1 on the editor background and on the
// current line, and 3:1 on the selection.
import { describe, expect, it } from "vitest";
import { failures, runProfile } from "../../lib/harness/index.ts";
import { listWarnings, thresholds, withProfile } from "./helpers.ts";

describe("editor", () => {
  const families = withProfile("editor");

  it("applies to at least one family", () => {
    expect(families.length).toBeGreaterThan(0);
  });

  for (const family of families) {
    it(`${family.meta.id} keeps every syntax role legible on the editor surfaces`, () => {
      const { checks } = runProfile(family, "editor", thresholds);
      listWarnings(family.meta.id, "editor", failures(checks, "warn"));
      expect(checks.filter((c) => !c.report).length, "the profile checked something").toBeGreaterThan(20);
      expect(failures(checks)).toEqual([]);
    });
  }
});
