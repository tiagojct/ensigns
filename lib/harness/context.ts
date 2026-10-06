// The other families a cross-family profile needs. Build time only: it reads
// the token files from disk.
import { loadFamilies, repoRoot } from "../model/load.ts";
import { resolveFamily } from "../model/resolve.ts";
import type { ResolvedFamily } from "../model/types.ts";

export interface HarnessContext {
  /** Every family in the repository, resolved. */
  families: ResolvedFamily[];
}

/** Read and resolve every family under root. Nothing is cached, so a script that rewrites a token file sees the change. */
export function loadContext(root: string = repoRoot()): HarnessContext {
  return { families: loadFamilies(root).map((f) => resolveFamily(f.file)) };
}
