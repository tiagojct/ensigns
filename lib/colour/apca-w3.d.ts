// Type declaration for the part of apca-w3 0.1.9 that apca.ts uses; the
// package ships no types. Source: node_modules/apca-w3/src/apca-w3.js.

declare module "apca-w3" {
  /**
   * Signed Lc of text on a background; a number with the default places
   * (-1). A colour it cannot parse is read as black after a console
   * message, so callers must validate their input first.
   */
  export function calcAPCA(textColor: string, bgColor: string): number;
}
