// A candidate is a second design of a family, offered for the owner to choose
// between (families/<id>/candidates/<name>.tokens.json). loadFamilies does not
// read them, so this test gives each one the checks a family gets: the schema,
// the semantics, and every profile it lists.
import { describe, expect, it } from "vitest";
import { buildReport, failures } from "../../lib/harness/index.ts";
import { loadCandidates, loadFamilies, loadSchema } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { validateFamily, validateSchema } from "../../lib/model/validate.ts";
import { thresholds } from "../environments/helpers.ts";

const schema = loadSchema();
const candidates = loadCandidates();
const families = loadFamilies();

describe("candidates", () => {
  it("are read from families/<id>/candidates", () => {
    expect(Array.isArray(candidates)).toBe(true);
  });

  for (const c of candidates) {
    describe(`${c.dir}, candidate ${c.candidate}`, () => {
      it("belongs to a family of the same id and keeps its ship", () => {
        expect(c.file.meta.id).toBe(c.dir);
        const primary = families.find((f) => f.dir === c.dir);
        expect(primary, `families/${c.dir}/${c.dir}.tokens.json exists`).toBeDefined();
        expect(c.file.meta.chapter).toEqual(primary!.file.meta.chapter);
        expect(c.file.meta.quote).toBe(primary!.file.meta.quote);
        expect(c.file.meta.environments).toEqual(primary!.file.meta.environments);
      });

      it("is valid against the schema and has no semantic errors", () => {
        expect(validateSchema(c.raw, schema)).toEqual([]);
        expect(validateFamily(c.raw, schema).filter((i) => i.level === "error")).toEqual([]);
      });

      it("lists derived: ['data'] when it defines no data block", () => {
        const hasData = c.file.modes.light.data !== undefined || c.file.modes.dark.data !== undefined;
        if (!hasData) {
          expect(c.file.derived, `${c.dir} ${c.candidate} lacks a data block, so it must declare derived: ["data"]`).toContain("data");
        }
      });

      it("passes every profile it lists", () => {
        const report = buildReport(resolveFamily(c.file), thresholds);
        for (const [profile, p] of Object.entries(report.profiles)) {
          if (p.status === "external" || p.status === "not-implemented") continue;
          expect(failures(p.checks), `${c.dir} ${c.candidate} ${profile}`).toEqual([]);
        }
      });
    });
  }
});
