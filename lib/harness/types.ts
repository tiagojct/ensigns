// Shared types for the environment harness. A profile function takes a
// resolved family and the thresholds from tests/environments.json and returns
// checks. Pure: the caller reads the thresholds file.
import type { ModeName } from "../model/types.ts";

export type Level = "error" | "warn";

export interface Check {
  profile: string;
  /** Stable inside a profile and a mode. */
  id: string;
  mode?: ModeName;
  ok: boolean;
  /** How a failure counts: an error fails the build, a warning is listed. */
  level: Level;
  /** Information only (APCA, AAA): never fails and never warns. */
  report?: boolean;
  /** The family's reason for failing this check on purpose (an entry in its exceptions list). */
  waived?: string;
  value?: number;
  limit?: number;
  detail: string;
}

export type Thresholds = Record<string, unknown>;

/** A number from the thresholds by dotted path. A missing path throws, so a typo cannot pass silently. */
export function num(t: Thresholds, path: string): number {
  let cur: unknown = t;
  for (const part of path.split(".")) {
    if (cur && typeof cur === "object" && part in cur) cur = (cur as Record<string, unknown>)[part];
    else throw new Error(`tests/environments.json has no ${path}`);
  }
  if (typeof cur !== "number") throw new Error(`tests/environments.json: ${path} is not a number`);
  return cur;
}

export const fmt = (n: number, digits = 2): string => n.toFixed(digits);
