import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
  cvdMatrix,
  hexToLinear,
  simulateCvd,
  simulateCvdLinear,
  type CvdType,
} from "../../../lib/colour/index.ts";
import { greys, grid4096, stepDifference } from "./helpers.ts";

// Written by scripts/gen-cvd-reference.R with R's colorspace (simulate_cvd, linear = TRUE).
interface CvdCase {
  input: string;
  group: string;
  type: CvdType;
  severity: number;
  output: string;
  linear: [number, number, number];
}

interface CvdReference {
  colorspace: string;
  matrices: Record<CvdType, number[][]>;
  cases: CvdCase[];
}

const reference = JSON.parse(
  readFileSync(new URL("../../fixtures/colour/cvd-reference.json", import.meta.url), "utf8"),
) as CvdReference;

const types: readonly CvdType[] = ["protan", "deutan", "tritan"];
const severities = [...new Set(reference.cases.map((c) => c.severity))];

const maxAbsDifference = (xs: readonly number[], ys: readonly number[]): number =>
  xs.length === ys.length ? Math.max(...xs.map((x, i) => Math.abs(x - (ys[i] ?? Number.NaN)))) : Number.NaN;

describe("the reference fixture", () => {
  test("covers at least 40 colours, three types and severities 0.5, 0.75 and 1", () => {
    expect(new Set(reference.cases.map((c) => c.input)).size).toBeGreaterThanOrEqual(40);
    expect(new Set(reference.cases.map((c) => c.type))).toEqual(new Set(types));
    expect(severities).toEqual(expect.arrayContaining([0.5, 0.75, 1]));
  });
});

describe("Machado matrices", () => {
  test.each(types)("the %s table equals colorspace's, row by row", (type) => {
    const rows = reference.matrices[type];
    expect(rows).toHaveLength(11);
    rows.forEach((row, i) => {
      expect(maxAbsDifference(cvdMatrix(type, i / 10), row), `row ${i}`).toBeLessThan(1e-12);
    });
  });

  // 0.33 sits between rows 3 and 4 with weights 0.7 and 0.3, which catches swapped weights.
  test("interpolates linearly between rows", () => {
    const [row3, row4] = [reference.matrices.protan[3] ?? [], reference.matrices.protan[4] ?? []];
    const expected = row3.map((v, k) => 0.7 * v + 0.3 * (row4[k] ?? Number.NaN));
    expect(maxAbsDifference(cvdMatrix("protan", 0.33), expected)).toBeLessThan(1e-12);
  });

  test("rejects severities outside 0..1", () => {
    for (const s of [-0.1, 1.1, Number.NaN]) {
      expect(() => cvdMatrix("deutan", s)).toThrow(RangeError);
      expect(() => simulateCvd("#336699", "deutan", s)).toThrow(RangeError);
    }
  });
});

describe(`against R colorspace ${reference.colorspace}`, () => {
  for (const type of types) {
    for (const severity of severities) {
      test(`${type} at severity ${severity}: hex within 1 step, linear light within 1e-9`, () => {
        const cases = reference.cases.filter((c) => c.type === type && c.severity === severity);
        expect(cases.length).toBeGreaterThanOrEqual(40);
        for (const c of cases) {
          const linear = simulateCvdLinear(hexToLinear(c.input), type, severity);
          expect(maxAbsDifference(linear, c.linear), c.input).toBeLessThan(1e-9);
          expect(stepDifference(simulateCvd(c.input, type, severity), c.output), c.input).toBeLessThanOrEqual(1);
        }
      });
    }
  }
});

describe("simulateCvd", () => {
  test("severity 0 returns the input colour", () => {
    for (const type of types) {
      for (const hex of grid4096()) expect(simulateCvd(hex, type, 0)).toBe(hex);
    }
    expect(simulateCvd("#abc", "protan", 0)).toBe("#AABBCC");
  });

  test("greys stay grey under every type and severity, within 1 step", () => {
    const steps = [...Array.from({ length: 11 }, (_, i) => i / 10), 0.33, 0.75];
    for (const type of types) {
      for (const severity of steps) {
        for (const hex of greys) {
          expect(stepDifference(simulateCvd(hex, type, severity), hex), `${type} ${severity} ${hex}`).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test("severity defaults to 1", () => {
    for (const type of types) expect(simulateCvd("#CC6677", type)).toBe(simulateCvd("#CC6677", type, 1));
  });

  test("output channels stay within 0..1 in linear light", () => {
    for (const type of types) {
      for (const hex of ["#FF0000", "#00FF00", "#0000FF", "#FF00FF"]) {
        for (const v of simulateCvdLinear(hexToLinear(hex), type)) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});
