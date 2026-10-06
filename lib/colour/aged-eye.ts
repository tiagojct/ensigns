// Aged-eye simulation: Machado tritanomaly at severity 0.5, then ambient
// flare k = 0.02.
// Source: the project brief, section 6 (aged-eye profile).
//
// This approximates the yellowing of the ageing crystalline lens, which
// absorbs short wavelengths and so weakens blue-yellow discrimination,
// with the flare standing in for the extra light scatter inside older
// eyes. It is not a spectral model. The spectral route is the lens optical
// density model of Pokorny, Smith and Lutze (1987), "Aging of the human
// lens", Applied Optics 26(8):1437, doi:10.1364/AO.26.001437.

import { simulateCvdLinear } from "./cvd.ts";
import { flareLinear } from "./flare.ts";
import { hexToLinear, linearToHex } from "./srgb.ts";

const TRITAN_SEVERITY = 0.5;
const FLARE = 0.02;

/** Both steps run in linear light and the result is rounded once. */
export function agedEye(hex: string): string {
  return linearToHex(flareLinear(simulateCvdLinear(hexToLinear(hex), "tritan", TRITAN_SEVERITY), FLARE));
}
