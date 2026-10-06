import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "../../lib/colour/wcag.ts";
import { loadFamilies } from "../../lib/model/load.ts";
import { at, flattenOver, resolveFamily } from "../../lib/model/resolve.ts";

const family = resolveFamily(loadFamilies().find((loaded) => loaded.dir === "rosebud")!.file);
const levels = ["neutral", "success", "warning", "critical"];

describe("Rosebud dark status", () => {
  it("keeps every accent readable on all chrome surfaces, including its own fill", () => {
    const mode = family.modes.dark;
    for (const surface of ["roles.bg", "roles.surface", "roles.surface-raised"]) {
      const ground = at(mode, surface).hex;
      for (const level of levels) {
        const accent = at(mode, `status.${level}.accent`).hex;
        const fill = flattenOver(at(mode, `status.${level}.fill`), ground);
        expect(contrastRatio(accent, ground), `${level} on ${surface}`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(accent, fill), `${level} on its fill over ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("increases prominence with severity and retains non-colour cues", () => {
    const luminances = levels.map((level) => relativeLuminance(at(family.modes.dark, `status.${level}.accent`).hex));
    expect(luminances).toEqual([...luminances].sort((a, b) => a - b));
    expect(new Set(luminances).size).toBe(4);
    for (const mode of ["dark", "light"] as const) {
      const status = family.source.modes[mode].status!;
      expect(status.policy).toBe("achromatic");
      if (status.policy !== "achromatic") throw new Error("Rosebud status must be achromatic");
      expect(new Set([status.neutral, status.success, status.warning, status.critical].map((level) => level.icon)).size).toBe(4);
      expect(status.warning.edge).toBe("dashed");
      expect(status.critical.weight).toBe("{design.border.width.thick}");
    }
  });
});
