// Shared colour library: public interface. Every module names its source
// in its own header.

export * from "./srgb.ts";
export * from "./wcag.ts";
export * from "./oklab.ts";
export * from "./cvd.ts";
export * from "./flare.ts";
export * from "./aged-eye.ts";
export * from "./grey.ts";
export * from "./eink.ts";
export * from "./photocopy.ts";
// apca.ts is not exported here on purpose. apca-w3 (Limited W3 License) depends on
// colorparsley (AGPL-3.0), so APCA runs at build time only and its numbers ship as data.
// Import it by path from build and test code; never from code that reaches a browser bundle.
export * from "./composite.ts";
export * from "./distinct.ts";
