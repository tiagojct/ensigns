// The views of the family pages: SVG filters that the view selector applies
// to both mode panels with CSS alone. Every number comes from lib/colour or
// tests/environments.json, so a view shows what the harness measures.
// tests/pages/filters.test.ts runs the same numbers through the SVG filter
// arithmetic and compares the result with the library.
import { AGED_EYE } from "../../lib/colour/aged-eye.ts";
import { cvdMatrix } from "../../lib/colour/cvd.ts";
import { LUMINANCE_WEIGHTS } from "../../lib/colour/wcag.ts";
import { num } from "../../lib/harness/types.ts";
import type { Thresholds } from "../../lib/harness/types.ts";

/** The colour space a primitive works in (its color-interpolation-filters). */
export type Space = "linearRGB" | "sRGB";

export type Primitive =
  | { kind: "matrix"; space: Space; values: number[] }
  | { kind: "transfer"; space: Space; type: "table" | "discrete"; tableValues: number[] }
  | { kind: "transfer"; space: Space; type: "linear"; slope: number; intercept: number };

export interface View {
  id: string;
  label: string;
  /** Empty for the normal view, which applies no filter. */
  primitives: Primitive[];
}

/** A 3 by 3 matrix in row-major order as the 4 by 5 matrix of feColorMatrix, alpha unchanged. */
const colourMatrix = (m: readonly number[]): number[] => [
  m[0]!, m[1]!, m[2]!, 0, 0,
  m[3]!, m[4]!, m[5]!, 0, 0,
  m[6]!, m[7]!, m[8]!, 0, 0,
  0, 0, 0, 1, 0,
];

const [wr, wg, wb] = LUMINANCE_WEIGHTS;
/** Every channel becomes the relative luminance, in linear light. */
const LUMINANCE: Primitive = { kind: "matrix", space: "linearRGB", values: colourMatrix([wr, wg, wb, wr, wg, wb, wr, wg, wb]) };

const flare = (k: number): Primitive => ({ kind: "transfer", space: "linearRGB", type: "linear", slope: 1, intercept: k });

/**
 * Relative luminance at a CIE L* above 8: the inverse of lstar in lib/colour/grey.ts, where
 * L* = 116 cbrt(Y) - 16 on that segment.
 */
export function luminanceAtLstar(l: number): number {
  if (!(l > 8 && l <= 100)) throw new RangeError(`a photocopy cut-off must lie between L* 8 and 100, got ${l}`);
  return ((l + 16) / 116) ** 3;
}

export function simulationViews(t: Thresholds): View[] {
  const severity = num(t, "common.cvd.severity.value");
  const cvd = (type: "protan" | "deutan" | "tritan"): Primitive => ({ kind: "matrix", space: "linearRGB", values: colourMatrix(cvdMatrix(type, severity)) });

  // Grey levels: the encoded grey rounded to the nearest of `levels` levels, as quantiseEink does.
  // Bin j of 2 * top covers [j, j + 1) / (2 * top); round(v * top) is ceil(j / 2) there.
  const levels = num(t, "profiles.eink.levels.value");
  const top = levels - 1;
  const einkTable = Array.from({ length: 2 * top }, (_, j) => Math.ceil(j / 2) / top);

  // Photocopy: luminance below the black cut-off becomes 0, above the white cut-off 1, else it stays.
  const black = luminanceAtLstar(num(t, "profiles.photocopy.blackBelow.value"));
  const white = luminanceAtLstar(num(t, "profiles.photocopy.whiteAbove.value"));
  const copyTable = Array.from({ length: 256 }, (_, i) => {
    const y = i / 255;
    return y < black ? 0 : y > white ? 1 : y;
  });

  return [
    { id: "normal", label: "Normal", primitives: [] },
    { id: "protan", label: "Protan", primitives: [cvd("protan")] },
    { id: "deutan", label: "Deutan", primitives: [cvd("deutan")] },
    { id: "tritan", label: "Tritan", primitives: [cvd("tritan")] },
    { id: "greyscale", label: "Greyscale", primitives: [LUMINANCE] },
    { id: "eink", label: `${levels} grey levels (e-ink)`, primitives: [LUMINANCE, { kind: "transfer", space: "sRGB", type: "discrete", tableValues: einkTable }] },
    { id: "photocopy", label: "Photocopy", primitives: [LUMINANCE, { kind: "transfer", space: "linearRGB", type: "table", tableValues: copyTable }] },
    { id: "projector-dark", label: "Projector, dark room", primitives: [flare(num(t, "common.flare.darkRoom.value"))] },
    { id: "projector-lit", label: "Projector, lit room", primitives: [flare(num(t, "common.flare.litRoom.value"))] },
    { id: "sunlight", label: "Sunlight", primitives: [flare(num(t, "common.flare.sunlight.value"))] },
    {
      id: "aged-eye",
      label: "Aged eye",
      primitives: [{ kind: "matrix", space: "linearRGB", values: colourMatrix(cvdMatrix("tritan", AGED_EYE.tritanSeverity)) }, flare(AGED_EYE.flare)],
    },
  ];
}

const n = (x: number): string => String(Number(x.toFixed(6)));
const list = (xs: number[]): string => xs.map(n).join(" ");

function primitiveSvg(p: Primitive): string {
  const space = `color-interpolation-filters="${p.space}"`;
  if (p.kind === "matrix") return `<feColorMatrix type="matrix" ${space} values="${list(p.values)}"/>`;
  const fn = p.type === "linear" ? `type="linear" slope="${n(p.slope)}" intercept="${n(p.intercept)}"` : `type="${p.type}" tableValues="${list(p.tableValues)}"`;
  return `<feComponentTransfer ${space}><feFuncR ${fn}/><feFuncG ${fn}/><feFuncB ${fn}/></feComponentTransfer>`;
}

/** One hidden inline svg with a filter per view, sim-<view id>; the filter region is the element's box. */
export function filtersSvg(views: View[]): string {
  const filters = views
    .filter((v) => v.primitives.length > 0)
    .map((v) => `<filter id="sim-${v.id}" x="0" y="0" width="1" height="1">${v.primitives.map(primitiveSvg).join("")}</filter>`);
  return `<svg class="filters" width="0" height="0" aria-hidden="true" focusable="false">\n${filters.join("\n")}\n</svg>`;
}
