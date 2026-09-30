// The environment harness: run the profiles a family lists and collect the
// results as a report, the same JSON the site renders on each family page.
import { agedEyeProfile } from "./aged-eye.ts";
import { clinical } from "./clinical.ts";
import type { HarnessContext } from "./context.ts";
import { cvd } from "./cvd.ts";
import { editor } from "./editor.ts";
import { eink } from "./eink.ts";
import { figure } from "./figure.ts";
import { night } from "./night.ts";
import { officeScreen } from "./office-screen.ts";
import { overlay } from "./overlay.ts";
import { photocopyProfile } from "./photocopy.ts";
import { printGrey } from "./print-grey.ts";
import { projector } from "./projector.ts";
import { sunlight } from "./sunlight.ts";
import type { Exception, ResolvedFamily } from "../model/types.ts";
import type { Check, Thresholds } from "./types.ts";

export * from "./types.ts";
export { loadContext } from "./context.ts";
export type { HarnessContext } from "./context.ts";
export { agedEyeProfile, clinical, cvd, editor, eink, figure, night, officeScreen, overlay, photocopyProfile, printGrey, projector, sunlight };

/** A profile reads the family, the thresholds and, for the profiles that compare families, every family. */
export type ProfileRunner = (family: ResolvedFamily, t: Thresholds, ctx?: HarnessContext) => Check[];

/** Profiles that run on tokens alone. forced-colors renders a specimen in a browser, so it runs elsewhere. */
export const PROFILE_RUNNERS: Record<string, ProfileRunner> = {
  "office-screen": officeScreen,
  editor,
  cvd,
  night,
  projector,
  sunlight,
  "aged-eye": agedEyeProfile,
  "print-grey": printGrey,
  eink,
  photocopy: photocopyProfile,
  overlay,
  clinical,
  figure,
};

export type ProfileStatus = "pass" | "warn" | "fail" | "external" | "not-implemented";

export interface ProfileReport {
  status: ProfileStatus;
  errors: number;
  warnings: number;
  /** Failures the family has waived, each with its reason in the check. */
  waived: number;
  checks: Check[];
}

export interface FamilyReport {
  family: string;
  version: string;
  environments: string[];
  profiles: Record<string, ProfileReport>;
}

const EXTERNAL = new Set(["forced-colors"]);

const counts = (c: Check) => !c.ok && !c.report && !c.waived;

export function statusOf(checks: Check[]): ProfileStatus {
  if (checks.some((c) => counts(c) && c.level === "error")) return "fail";
  if (checks.some((c) => counts(c) && c.level === "warn")) return "warn";
  return "pass";
}

/**
 * Mark the failing checks that the family's exceptions name as waived. Returns the exceptions that
 * matched nothing, so a test can fail on a waiver that outlived its cause.
 */
export function applyExceptions(checks: Check[], exceptions: Exception[]): { checks: Check[]; unused: Exception[] } {
  const used = new Set<Exception>();
  const out = checks.map((c) => {
    if (c.ok || c.report) return c;
    const hit = exceptions.find((e) => e.profile === c.profile && e.id === c.id && (e.mode === undefined || e.mode === c.mode));
    if (!hit) return c;
    used.add(hit);
    return { ...c, waived: hit.why };
  });
  return { checks: out, unused: exceptions.filter((e) => !used.has(e)) };
}

/** Run one profile for a family, with the family's exceptions for that profile applied. */
export function runProfile(family: ResolvedFamily, profile: string, thresholds: Thresholds, ctx?: HarnessContext): { checks: Check[]; unused: Exception[] } {
  const run = PROFILE_RUNNERS[profile];
  if (!run) throw new Error(`no runner for profile ${profile}`);
  const own = (family.source.exceptions ?? []).filter((e) => e.profile === profile);
  return applyExceptions(run(family, thresholds, ctx), own);
}

export function buildReport(family: ResolvedFamily, thresholds: Thresholds, ctx?: HarnessContext): FamilyReport {
  const profiles: Record<string, ProfileReport> = {};
  // Declared pairs and distinct sets are shared tests: they run for every family that declares them.
  const envs = new Set<string>(family.meta.environments);
  if ((family.source.pairs?.length ?? 0) > 0) envs.add("office-screen");
  if ((family.source.distinct?.length ?? 0) > 0) envs.add("cvd");
  for (const env of envs) {
    if (!PROFILE_RUNNERS[env]) {
      profiles[env] = { status: EXTERNAL.has(env) ? "external" : "not-implemented", errors: 0, warnings: 0, waived: 0, checks: [] };
      continue;
    }
    const { checks } = runProfile(family, env, thresholds, ctx);
    profiles[env] = {
      status: statusOf(checks),
      errors: checks.filter((c) => counts(c) && c.level === "error").length,
      warnings: checks.filter((c) => counts(c) && c.level === "warn").length,
      waived: checks.filter((c) => !c.ok && !c.report && c.waived).length,
      checks,
    };
  }
  return { family: family.meta.id, version: family.meta.version, environments: [...family.meta.environments], profiles };
}

/** The failing checks of a profile that are not waived, as lines for a test message. */
export function failures(checks: Check[], level: "error" | "warn" = "error"): string[] {
  return checks.filter((c) => counts(c) && c.level === level).map((c) => c.detail);
}
