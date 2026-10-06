// Shared set-up for the environment tests: the thresholds and every family,
// resolved once.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Thresholds } from "../../lib/harness/index.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { Environment, FamilyFile, ResolvedFamily } from "../../lib/model/types.ts";

export const thresholds: Thresholds = JSON.parse(readFileSync(join(repoRoot(), "tests/environments.json"), "utf8"));

const loaded = loadFamilies();
export const resolvedFamilies: ResolvedFamily[] = loaded.map((f) => resolveFamily(f.file));

export const withProfile = (profile: Environment): ResolvedFamily[] =>
  resolvedFamilies.filter((f) => f.meta.environments.includes(profile));

/** A deep copy of a family's token file, for tests that break it on purpose. */
export const cloneFile = (id: string): FamilyFile => structuredClone(loaded.find((f) => f.dir === id)!.file);

/** Print warnings (they never fail a test) so a run shows them. */
export function listWarnings(family: string, profile: string, lines: string[]): void {
  if (lines.length > 0) console.warn(`${family} ${profile}: ${lines.length} warnings\n  ${lines.join("\n  ")}`);
}
