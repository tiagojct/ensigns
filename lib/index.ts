// Browser-safe public API. Validation and environment reports stay at build time.
export { resolveFamily, resolveMode, resolvePalette, at, flattenOver, ModelError } from './model/resolve.ts';
export type * from './model/types.ts';
export * from './colour/index.ts';
export * from './generators/index.ts';
