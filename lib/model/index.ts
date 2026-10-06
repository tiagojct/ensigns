// lib/model: load, resolve references, validate. load.ts and validate.ts are
// build-time only (file system, Ajv); the rest also runs in the browser, so
// import those two by path, not from here.
export * from "./types.ts";
export { ModelError, at, flattenOver, paletteKey, resolveFamily, resolveMode, resolvePalette } from "./resolve.ts";
export { distinctMembers } from "./sets.ts";
export type { SetMember } from "./sets.ts";
export { RULE_CHECKS, hueClass, runRuleChecks } from "./checks.ts";
export type { CheckContext, HueClass, RuleCheck, RuleResult } from "./checks.ts";
