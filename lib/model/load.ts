// Node only: read family token files from disk. Everything else in
// lib/model is pure and also runs in the browser.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { FamilyFile } from "./types.ts";

export interface LoadedFamily {
  /** Folder name under families/. The schema test checks it equals meta.id. */
  dir: string;
  path: string;
  raw: unknown;
  file: FamilyFile;
}

export function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..");
}

export function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** families/<id>/<id>.tokens.json for every family folder that has one, in name order. */
export function loadFamilies(root: string = repoRoot()): LoadedFamily[] {
  const base = join(root, "families");
  const out: LoadedFamily[] = [];
  for (const dir of readdirSync(base, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const path = join(base, dir.name, `${dir.name}.tokens.json`);
    if (!existsSync(path)) continue;
    const raw = readJson(path);
    out.push({ dir: dir.name, path, raw, file: raw as FamilyFile });
  }
  return out.sort((a, b) => a.dir.localeCompare(b.dir));
}

export interface LoadedCandidate extends LoadedFamily {
  /** The file name without .tokens.json. */
  candidate: string;
}

/**
 * families/<id>/candidates/<name>.tokens.json: a second design of the same family, offered for the owner
 * to choose between. loadFamilies does not read them; the candidate tests and the page builder do.
 */
export function loadCandidates(root: string = repoRoot()): LoadedCandidate[] {
  const base = join(root, "families");
  const out: LoadedCandidate[] = [];
  for (const dir of readdirSync(base, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const folder = join(base, dir.name, "candidates");
    if (!existsSync(folder)) continue;
    for (const name of readdirSync(folder).filter((f) => f.endsWith(".tokens.json")).sort()) {
      const path = join(folder, name);
      const raw = readJson(path);
      out.push({ dir: dir.name, candidate: name.replace(/\.tokens\.json$/, ""), path, raw, file: raw as FamilyFile });
    }
  }
  return out;
}

export function loadSchema(root: string = repoRoot()): object {
  return readJson(join(root, "schema", "family.schema.json")) as object;
}
