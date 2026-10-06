// APCA lightness contrast (Lc) through calcAPCA from apca-w3 0.1.9.
//
// Licence warning: apca-w3 0.1.9 is under the "Limited W3 License". It
// permits contrast prediction for WCAG-related web content on
// self-illuminated displays and excludes medical, clinical evaluation,
// human-safety and other non-web uses. The project therefore reports APCA
// only for the web-UI profiles (office-screen, editor, night), as
// information and never as a gate. calcAPCA parses colours with
// colorparsley 0.1.8, a dependency of apca-w3 licensed under AGPL-3.0.
//
// apca-w3 0.1.9 is an ES module with named exports only: a default import
// fails in Node ("does not provide an export named 'default'") and under
// Vitest, so it is imported by name.

import { calcAPCA } from "apca-w3";
import { formatHex, parseHex } from "./srgb.ts";

/**
 * Signed Lc as apca-w3 returns it: positive for dark text on a light
 * background, negative for light text on a dark one. The order matters.
 * Both colours are validated first, because calcAPCA reads unparseable
 * input as black.
 */
export function apcaLc(textHex: string, bgHex: string): number {
  return calcAPCA(formatHex(parseHex(textHex)), formatHex(parseHex(bgHex)));
}
