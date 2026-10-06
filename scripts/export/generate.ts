// Node only: validate all requested input before writing any generated output.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { GENERATORS, generateAll } from "../../lib/generators/index.ts";
import type { ExportOptions } from "../../lib/generators/index.ts";
import { loadFamilies, loadSchema } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { validateFamily } from "../../lib/model/validate.ts";

export interface BuildOptions extends ExportOptions {
  families?: string[];
  formats?: string[];
}

export function buildExports(root: string, out: string, options: BuildOptions = {}): string[] {
  const loaded = loadFamilies(root);
  for (const id of options.families ?? []) {
    if (!loaded.some((family) => family.dir === id)) throw new Error(`Unknown family: ${id}`);
  }
  for (const id of options.formats ?? []) {
    if (!GENERATORS.some((generator) => generator.id === id)) throw new Error(`Unknown format: ${id}`);
  }
  const selected = loaded.filter((family) => !options.families?.length || options.families.includes(family.dir));
  const schema = loadSchema(root);
  const files = new Map<string, string | Uint8Array>();
  const manifests = [];
  for (const family of selected) {
    const errors = validateFamily(family.raw, schema).filter((issue) => issue.level === "error");
    if (errors.length) throw new Error(`${family.dir}: invalid tokens\n${errors.map((issue) => `${issue.where}: ${issue.message}`).join("\n")}`);
    const results = generateAll(resolveFamily(family.file), options)
      .filter(({ generator }) => !options.formats?.length || options.formats.includes(generator.id));
    const formats = results.map(({ generator, files: exports, reason }) => {
      const paths = exports.map((file) => {
        const path = `${family.dir}/${generator.id}/${file.name}`;
        files.set(path, file.content);
        return { path, mime: file.mime, sha256: createHash("sha256").update(file.content).digest("hex") };
      });
      return { id: generator.id, label: generator.label, ...(reason ? { reason } : {}), files: paths };
    });
    manifests.push({
      id: family.dir, version: family.file.meta.version,
      source: { file: relative(root, family.path).split("\\").join("/"), sha256: createHash("sha256").update(readFileSync(family.path)).digest("hex") },
      formats,
    });
  }
  files.set("manifest.json", JSON.stringify({ format: "ensigns-exports-v1", mode: options.mode ?? "both", families: manifests }, null, 2) + "\n");
  for (const [path, content] of files) {
    const target = join(out, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return [...files.keys()];
}
