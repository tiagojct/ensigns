// Run the environment harness over every family and write reports/<id>.json.
// The same JSON is rendered on each family page of the site. Exits 1 when any
// profile has an error.
//
//   node scripts/report.ts                   write reports/ and print a summary
//   node scripts/report.ts --out some/dir    write somewhere else
//   node scripts/report.ts pequod goney      only these families
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { buildReport } from "../lib/harness/index.ts";
import { loadFamilies, repoRoot } from "../lib/model/load.ts";
import { resolveFamily } from "../lib/model/resolve.ts";

const root = repoRoot();
const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outDir = outIndex >= 0 ? join(process.cwd(), args[outIndex + 1]!) : join(root, "reports");
const wanted = args.filter((a, i) => !a.startsWith("--") && i !== outIndex + 1);

const thresholds = JSON.parse(readFileSync(join(root, "tests/environments.json"), "utf8"));
mkdirSync(outDir, { recursive: true });

let failed = false;
for (const f of loadFamilies()) {
  if (wanted.length && !wanted.includes(f.dir)) continue;
  const report = buildReport(resolveFamily(f.file), thresholds);
  const bytes = readFileSync(f.path);
  const tokens = { file: relative(root, f.path), sha256: createHash("sha256").update(bytes).digest("hex") };
  writeFileSync(join(outDir, `${f.dir}.json`), JSON.stringify({ ...report, tokens }, null, 2) + "\n");

  console.log(`${report.family} ${report.version}`);
  for (const [profile, p] of Object.entries(report.profiles)) {
    console.log(`  ${profile.padEnd(14)} ${p.status.padEnd(16)} ${p.errors} errors, ${p.warnings} warnings`);
    if (p.status === "fail") failed = true;
  }
}
process.exit(failed ? 1 : 0);
