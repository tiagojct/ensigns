// Colour-vision-deficiency simulation after Machado, Oliveira and Fernandes
// (2009), "A physiologically-based model for simulation of color vision
// deficiency", IEEE Transactions on Visualization and Computer Graphics
// 15(6):1291-1298, doi:10.1109/TVCG.2009.113.
//
// Matrices: the authors' precomputed table for protanomaly, deuteranomaly
// and tritanomaly at severity 0.0 to 1.0 in steps of 0.1
// (https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html),
// copied from culori 4.0.2 src/deficiency.js (MIT licence). Each row is a
// 3 by 3 matrix in row-major order. tests/lib/colour/cvd.test.ts checks
// every value against the tables in R's colorspace 2.1.3.
//
// The matrices act on linear-light RGB, as in the paper and in
// colorspace::simulate_cvd(linear = TRUE): decode, multiply, clamp to 0..1,
// encode. Between two table rows the matrices are interpolated linearly,
// as colorspace does.
//
// culori's own filterDeficiency* functions are not used: they apply the
// matrices to gamma-encoded values and snap the severity to the nearest
// row without interpolating. On the 552 cases of
// tests/fixtures/colour/cvd-reference.json (46 colours, three types,
// severities 0.33, 0.5, 0.75 and 1), culori 4.0.2 differs from colorspace
// in 405 cases, by up to 80 8-bit steps in a channel and up to 0.25 in
// OKLab (48 cases above 0.06). This module matches colorspace in all 552.

import { hexToLinear, linearToHex, type Linear } from "./srgb.ts";

export type CvdType = "protan" | "deutan" | "tritan";

/** 3 by 3 matrix in row-major order. */
export type Matrix = readonly [number, number, number, number, number, number, number, number, number];

const MACHADO_2009: Record<CvdType, readonly Matrix[]> = {
  protan: [
    [1, 0, 0, 0, 1, 0, 0, 0, 1], // 0.0
    [0.856167, 0.182038, -0.038205, 0.029342, 0.955115, 0.015544, -0.00288, -0.001563, 1.004443], // 0.1
    [0.734766, 0.334872, -0.069637, 0.05184, 0.919198, 0.028963, -0.004928, -0.004209, 1.009137], // 0.2
    [0.630323, 0.465641, -0.095964, 0.069181, 0.890046, 0.040773, -0.006308, -0.007724, 1.014032], // 0.3
    [0.539009, 0.579343, -0.118352, 0.082546, 0.866121, 0.051332, -0.007136, -0.011959, 1.019095], // 0.4
    [0.458064, 0.679578, -0.137642, 0.092785, 0.846313, 0.060902, -0.007494, -0.016807, 1.024301], // 0.5
    [0.38545, 0.769005, -0.154455, 0.100526, 0.829802, 0.069673, -0.007442, -0.02219, 1.029632], // 0.6
    [0.319627, 0.849633, -0.169261, 0.106241, 0.815969, 0.07779, -0.007025, -0.028051, 1.035076], // 0.7
    [0.259411, 0.923008, -0.18242, 0.110296, 0.80434, 0.085364, -0.006276, -0.034346, 1.040622], // 0.8
    [0.203876, 0.990338, -0.194214, 0.112975, 0.794542, 0.092483, -0.005222, -0.041043, 1.046265], // 0.9
    [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998], // 1.0
  ],
  deutan: [
    [1, 0, 0, 0, 1, 0, 0, 0, 1], // 0.0
    [0.866435, 0.177704, -0.044139, 0.049567, 0.939063, 0.01137, -0.003453, 0.007233, 0.99622], // 0.1
    [0.760729, 0.319078, -0.079807, 0.090568, 0.889315, 0.020117, -0.006027, 0.013325, 0.992702], // 0.2
    [0.675425, 0.43385, -0.109275, 0.125303, 0.847755, 0.026942, -0.00795, 0.018572, 0.989378], // 0.3
    [0.605511, 0.52856, -0.134071, 0.155318, 0.812366, 0.032316, -0.009376, 0.023176, 0.9862], // 0.4
    [0.547494, 0.607765, -0.155259, 0.181692, 0.781742, 0.036566, -0.01041, 0.027275, 0.983136], // 0.5
    [0.498864, 0.674741, -0.173604, 0.205199, 0.754872, 0.039929, -0.011131, 0.030969, 0.980162], // 0.6
    [0.457771, 0.731899, -0.18967, 0.226409, 0.731012, 0.042579, -0.011595, 0.034333, 0.977261], // 0.7
    [0.422823, 0.781057, -0.203881, 0.245752, 0.709602, 0.044646, -0.011843, 0.037423, 0.974421], // 0.8
    [0.392952, 0.82361, -0.216562, 0.263559, 0.69021, 0.046232, -0.01191, 0.040281, 0.97163], // 0.9
    [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881], // 1.0
  ],
  tritan: [
    [1, 0, 0, 0, 1, 0, 0, 0, 1], // 0.0
    [0.92667, 0.092514, -0.019184, 0.021191, 0.964503, 0.014306, 0.008437, 0.054813, 0.93675], // 0.1
    [0.89572, 0.13333, -0.02905, 0.029997, 0.9454, 0.024603, 0.013027, 0.104707, 0.882266], // 0.2
    [0.905871, 0.127791, -0.033662, 0.026856, 0.941251, 0.031893, 0.01341, 0.148296, 0.838294], // 0.3
    [0.948035, 0.08949, -0.037526, 0.014364, 0.946792, 0.038844, 0.010853, 0.193991, 0.795156], // 0.4
    [1.017277, 0.027029, -0.044306, -0.006113, 0.958479, 0.047634, 0.006379, 0.248708, 0.744913], // 0.5
    [1.104996, -0.046633, -0.058363, -0.032137, 0.971635, 0.060503, 0.001336, 0.317922, 0.680742], // 0.6
    [1.193214, -0.109812, -0.083402, -0.058496, 0.97941, 0.079086, -0.002346, 0.403492, 0.598854], // 0.7
    [1.257728, -0.139648, -0.118081, -0.078003, 0.975409, 0.102594, -0.003316, 0.501214, 0.502102], // 0.8
    [1.278864, -0.125333, -0.153531, -0.084748, 0.957674, 0.127074, -0.000989, 0.601151, 0.399838], // 0.9
    [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039], // 1.0
  ],
};

/** The matrix for a severity from 0 to 1, interpolated between the rows at steps of 0.1. */
export function cvdMatrix(type: CvdType, severity: number): Matrix {
  if (!(severity >= 0 && severity <= 1)) {
    throw new RangeError(`CVD severity must be between 0 and 1, got ${severity}`);
  }
  const rows = MACHADO_2009[type];
  const s = severity * 10;
  const lo = Math.floor(s);
  const hi = Math.ceil(s);
  // lo and hi lie in 0..10 and every table has 11 rows.
  const a = rows[lo]!;
  const b = rows[hi]!;
  if (lo === hi) return a;
  const mix = (x: number, y: number): number => (hi - s) * x + (s - lo) * y;
  const [a0, a1, a2, a3, a4, a5, a6, a7, a8] = a;
  const [b0, b1, b2, b3, b4, b5, b6, b7, b8] = b;
  return [
    mix(a0, b0), mix(a1, b1), mix(a2, b2),
    mix(a3, b3), mix(a4, b4), mix(a5, b5),
    mix(a6, b6), mix(a7, b7), mix(a8, b8),
  ];
}

/** Applies the matrix to linear-light RGB and clamps the result to 0..1, as colorspace does. */
export function simulateCvdLinear(linear: Linear, type: CvdType, severity = 1): Linear {
  const [m0, m1, m2, m3, m4, m5, m6, m7, m8] = cvdMatrix(type, severity);
  const [r, g, b] = linear;
  const clamp = (v: number): number => Math.min(1, Math.max(0, v));
  return [
    clamp(m0 * r + m1 * g + m2 * b),
    clamp(m3 * r + m4 * g + m5 * b),
    clamp(m6 * r + m7 * g + m8 * b),
  ];
}

/** Simulated colour as uppercase hex. Severity 0 returns the input colour. */
export function simulateCvd(hex: string, type: CvdType, severity = 1): string {
  return linearToHex(simulateCvdLinear(hexToLinear(hex), type, severity));
}
