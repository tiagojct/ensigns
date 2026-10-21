import { describe, expect, it } from "vitest";
import { loadFamilies } from "../../../lib/model/load.ts";
import { resolveFamily } from "../../../lib/model/resolve.ts";
import type { FamilyFile } from "../../../lib/model/types.ts";

const base = (): FamilyFile => structuredClone(loadFamilies().find((f) => f.dir === "pequod")!.file);

describe("resolveMode surfaces", () => {
  it("allows a surface to be drawn over a colour block that is resolved after it", () => {
    const file = base();
    file.modes.light.surfaces = {
      ...(file.modes.light.surfaces ?? {}),
      "over-syntax": { ref: "{palette.log.50}", alpha: 0.5, over: "syntax.keyword" },
    };

    const resolved = resolveFamily(file).modes.light.colours.get("surfaces.over-syntax");
    expect(resolved).toBeDefined();
    expect(resolved!.alpha).toBeUndefined();
  });
});
