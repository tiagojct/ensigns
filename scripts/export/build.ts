import { join, resolve } from "node:path";
import { GENERATORS } from "../../lib/generators/index.ts";
import { repoRoot } from "../../lib/model/load.ts";
import { buildExports } from "./generate.ts";
import type { BuildOptions } from "./generate.ts";

const help = `Usage: npm run export -- [family ...] [--format id] [--mode dark|light|both] [--out folder]

Exports all ten families by default into dist/exports/.
Formats: ${GENERATORS.map((generator) => generator.id).join(", ")}.
Repeat --format to select more than one format. Unavailable targets are recorded in manifest.json.
`;

try {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(help);
  } else {
    const options: BuildOptions = { families: [], formats: [] };
    let out = join(repoRoot(), "dist", "exports");
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]!;
      if (["--format", "--mode", "--out"].includes(arg)) {
        const value = args[++i];
        if (!value || value.startsWith("--")) throw new Error(`${arg} needs a value`);
        if (arg === "--format") options.formats!.push(value);
        if (arg === "--out") out = resolve(process.cwd(), value);
        if (arg === "--mode") {
          if (!["dark", "light", "both"].includes(value)) throw new Error(`Unknown mode: ${value}`);
          options.mode = value as BuildOptions["mode"];
        }
      } else if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
      else options.families!.push(arg);
    }
    const written = buildExports(repoRoot(), out, options);
    console.log(`Wrote ${written.length - 1} exports and manifest.json to ${out}.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
