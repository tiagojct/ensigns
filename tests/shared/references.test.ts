// Every reference resolves, both modes define the same addresses, and a
// translucent surface is composed the way editors draw it.
import { describe, expect, it } from "vitest";
import { loadFamilies } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { validateSemantics } from "../../lib/model/validate.ts";

const families = loadFamilies();
const ids = new Set(families.map((f) => f.dir));

describe("references", () => {
  for (const f of families) {
    describe(f.dir, () => {
      const resolved = resolveFamily(f.file);

      it("resolves every palette reference in both modes", () => {
        for (const m of ["dark", "light"] as const) {
          expect(resolved.modes[m].colours.size).toBeGreaterThan(40);
          for (const [address, c] of resolved.modes[m].colours) {
            expect(c.hex, `${m} ${address}`).toMatch(/^#[0-9A-F]{6}$/);
          }
        }
      });

      it("defines the same addresses in dark and light", () => {
        const dark = [...resolved.modes.dark.colours.keys()];
        const light = [...resolved.modes.light.colours.keys()];
        expect(dark).toEqual(light);
      });

      it("refers to a data source that exists when data is a reference", () => {
        for (const m of ["dark", "light"] as const) {
          const ref = resolved.modes[m].dataRef;
          if (ref) expect(ids.has(ref), `${m}: data.ref ${ref}`).toBe(true);
        }
      });

      it("lists its unused palette entries as warnings, not errors", () => {
        const warnings = validateSemantics(f.file).filter((i) => i.level === "warn" && i.code === "unused-palette");
        // Scales keep spare steps, and hand-tuned entries wait for the generators that use them.
        if (warnings.length > 0) console.info(`${f.dir}: ${warnings.length} palette entries are not referenced yet`);
        expect(validateSemantics(f.file).filter((i) => i.level === "error")).toEqual([]);
      });
    });
  }

  it("composes a surface drawn at an opacity over another surface in gamma-encoded sRGB", () => {
    const pequod = resolveFamily(families.find((f) => f.dir === "pequod")!.file);
    const line = pequod.modes.light.colours.get("surfaces.editor-line")!;
    const editor = pequod.modes.light.colours.get("surfaces.editor")!;
    expect(editor.hex).toBe("#F7F3EE");
    // Log 150 (#DBC9B6) at 50 per cent over Log 50 (#F7F3EE): (219+247)/2 = 233 = E9, (201+243)/2 = 222 = DE, (182+238)/2 = 210 = D2.
    expect(line.hex).toBe("#E9DED2");
  });
});
