// The commit that the site is built from, for the footer (checkpoint 5, D34).
//
// A local build has no stamp, so it prints no commit and no date and stays repeatable. The
// image build sets ENSIGNS_REQUIRE_STAMP and passes both values as build arguments
// (site/deploy/Dockerfile, .github/workflows/build-deploy.yml), so an image cannot be built
// without a commit. The image build has no .git folder, which is why the values come in
// from outside.
export interface Stamp { sha: string; date: string; }

/** The environment variables that carry the stamp. The Dockerfile and its test use these names. */
export const STAMP_ENV = { sha: "ENSIGNS_COMMIT_SHA", date: "ENSIGNS_COMMIT_DATE", require: "ENSIGNS_REQUIRE_STAMP" } as const;

/** A date that exists on the calendar, written YYYY-MM-DD. */
function isDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

/**
 * Read the stamp from the environment. With neither value set it returns null, unless the
 * build requires a stamp. A value that is half set or malformed always stops the build.
 */
export function readStamp(env: Record<string, string | undefined>): Stamp | null {
  const sha = (env[STAMP_ENV.sha] ?? "").trim();
  const date = (env[STAMP_ENV.date] ?? "").trim();
  if (!sha && !date) {
    if (env[STAMP_ENV.require]) {
      throw new Error(`${STAMP_ENV.sha} and ${STAMP_ENV.date} are required for this build. The image build passes them as the build arguments COMMIT_SHA and COMMIT_DATE.`);
    }
    return null;
  }
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`${STAMP_ENV.sha} must be a full commit hash in lower case, got "${sha}".`);
  if (!isDate(date)) throw new Error(`${STAMP_ENV.date} must be a date written YYYY-MM-DD, got "${date}".`);
  return { sha, date };
}
