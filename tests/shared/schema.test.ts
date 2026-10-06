// Every family token file is valid against the schema and has no semantic
// errors. The last block checks the validator itself: it must reject the
// mistakes it claims to catch.
import { describe, expect, it } from "vitest";
import { loadFamilies, loadSchema } from "../../lib/model/load.ts";
import { validateFamily, validateSchema, validateSemantics } from "../../lib/model/validate.ts";
import type { FamilyFile } from "../../lib/model/types.ts";

const schema = loadSchema();
const families = loadFamilies();
const MIGRATED = ["goney", "jungfrau", "pequod", "rosebud"];

describe("family token files", () => {
  it("includes every family migrated so far", () => {
    const ids = families.map((f) => f.dir);
    for (const id of MIGRATED) expect(ids).toContain(id);
  });

  for (const f of families) {
    describe(f.dir, () => {
      it("has its folder name as meta.id", () => {
        expect(f.file.meta.id).toBe(f.dir);
      });
      it("is valid against schema/family.schema.json", () => {
        expect(validateSchema(f.raw, schema)).toEqual([]);
      });
      it("has no semantic errors", () => {
        const errors = validateFamily(f.raw, schema).filter((i) => i.level === "error");
        expect(errors).toEqual([]);
      });
      it("defines exactly two modes, dark and light", () => {
        expect(Object.keys(f.file.modes).sort()).toEqual(["dark", "light"]);
      });
    });
  }
});

describe("the validator catches what it claims to", () => {
  const base = (): FamilyFile => structuredClone(families.find((f) => f.dir === "pequod")!.file);

  it("rejects a lowercase hex value", () => {
    const f = base();
    f.palette.log!["50"] = "#f7f3ee";
    expect(validateSchema(f, schema).length).toBeGreaterThan(0);
  });

  it("rejects a third mode", () => {
    const f = base() as unknown as { modes: Record<string, unknown> };
    f.modes.sepia = f.modes.light;
    expect(validateSchema(f, schema).length).toBeGreaterThan(0);
  });

  it("rejects a mode without a core role", () => {
    const f = base() as unknown as { modes: { dark: { roles: Record<string, unknown> } } };
    delete f.modes.dark.roles.focus;
    expect(validateSchema(f, schema).length).toBeGreaterThan(0);
  });

  it("rejects a hex value where a reference belongs", () => {
    const f = base() as unknown as { modes: { dark: { roles: Record<string, unknown> } } };
    f.modes.dark.roles.bg = "#0B1720";
    expect(validateSchema(f, schema).length).toBeGreaterThan(0);
  });

  it("flags a reference to a palette entry that does not exist", () => {
    const f = base();
    f.modes.dark.roles.bg = "{palette.log.999}";
    const issues = validateSemantics(f);
    expect(issues.some((i) => i.code === "reference")).toBe(true);
  });

  it("flags a role that exists in one mode only", () => {
    const f = base();
    f.modes.dark.roles.extra = { ...(f.modes.dark.roles.extra ?? {}), "only-dark": "{palette.log.50}" };
    const issues = validateSemantics(f);
    expect(issues.some((i) => i.code === "mode-parity")).toBe(true);
  });

  it("flags a colour literal inside design", () => {
    const f = base();
    f.design = { ring: "2px solid #ff0000" };
    const issues = validateSemantics(f);
    expect(issues.some((i) => i.code === "design-colour")).toBe(true);
  });

  it("flags a distinct set that names a missing member", () => {
    const f = base();
    f.distinct = [{ id: "crew", set: "accents", reinforced: [["ahab", "captain-nemo"]] }];
    const issues = validateSemantics(f);
    expect(issues.some((i) => i.code === "distinct")).toBe(true);
  });

  it("flags an explicit distinct member that does not exist in a mode", () => {
    const f = base();
    f.distinct = [{ id: "crew", members: ["accents.ahab", "accents.pip", "accents.captain-nemo"] }];
    const issues = validateSemantics(f).filter((i) => i.code === "distinct");
    // The set still has two members, so only the missing address is reported, once per mode.
    expect(issues.map((i) => i.message)).toEqual([
      "accents.captain-nemo does not exist in dark",
      "accents.captain-nemo does not exist in light",
    ]);
  });

  it("flags a pair that points at a colour that does not exist", () => {
    const f = base();
    f.pairs = [{ fg: "roles.nothing", bg: "roles.bg", kind: "text" }];
    const issues = validateSemantics(f);
    expect(issues.some((i) => i.code === "pair")).toBe(true);
  });
});
