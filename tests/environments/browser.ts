// Chromium for the browser tests. Playwright's own revision comes first. When
// that revision is not installed, a Chromium already in the local Playwright
// cache stands in. With neither, the result carries the reason, so the caller
// can skip or fail.
import { globSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Browser } from "playwright";
import { chromium } from "playwright";

const CACHE = join(homedir(), "Library", "Caches", "ms-playwright");

const revision = (path: string) => Number(/^chromium-(\d+)\//.exec(path)?.[1]);

/** The binary inside the newest cached chromium-<revision> app bundle, if there is one. */
function cachedChromium(): string | undefined {
  const [newest] = globSync("chromium-[0-9]*/*/*.app/Contents/MacOS/*", { cwd: CACHE }).sort((a, b) => revision(b) - revision(a));
  return newest === undefined ? undefined : join(CACHE, newest);
}

export async function launchChromium(): Promise<{ browser: Browser } | { reason: string }> {
  try {
    return { browser: await chromium.launch() };
  } catch (error) {
    // Only a missing build falls back; any other launch error is a real failure.
    if (!(error instanceof Error) || !error.message.includes("Executable doesn't exist")) throw error;
    const executablePath = cachedChromium();
    if (executablePath === undefined) {
      return { reason: `${error.message.split("\n")[0]}, and ${CACHE} holds no chromium-* build. Run npx playwright install chromium.` };
    }
    console.warn(`Playwright's own Chromium is not installed; using the cached ${executablePath}`);
    return { browser: await chromium.launch({ executablePath }) };
  }
}
