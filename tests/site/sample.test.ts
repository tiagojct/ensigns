import { describe, expect, it } from "vitest";
import { contrastRatio } from "../../lib/colour/wcag.ts";
import { loadFamilies } from "../../lib/model/load.ts";
import { flattenOver, resolveFamily } from "../../lib/model/resolve.ts";
import { sampleMeasures } from "../../site/src/sample.ts";

describe("sample measures", () => {
  it("flattens a translucent role before measuring its contrast", () => {
    const family = resolveFamily(loadFamilies().find((f) => f.dir === "pequod")!.file);
    const mode = family.modes.light;
    const page = mode.colours.get("roles.bg")!;
    const link = mode.colours.get("roles.link")!;
    const translucent = { ...link, alpha: 0.5 };
    mode.colours.set("roles.link", translucent);

    const expected = contrastRatio(flattenOver(translucent, page.hex), page.hex);
    const row = sampleMeasures(family, "light").find((m) => m.label === "Link")!;
    expect(row.ratio).toBe(`${expected.toFixed(2)}:1`);
  });
});
