// Write the local family pages.
//
//   node scripts/pages/build.ts              into preview/ (git ignores it)
//   node scripts/pages/build.ts --out dir    somewhere else
//
// Open preview/index.html in a browser. scripts/pages/README.md says what the pages hold.
import { join, relative, resolve } from "node:path";
import { repoRoot } from "../../lib/model/load.ts";
import { buildPages } from "./generate.ts";

const root = repoRoot();
const args = process.argv.slice(2);
const at = args.indexOf("--out");
if (at >= 0 && !args[at + 1]) throw new Error("--out needs a folder");
const out = at >= 0 ? resolve(process.cwd(), args[at + 1]!) : join(root, "preview");

const written = buildPages(root, out);
const rel = relative(process.cwd(), out);
const shown = rel === "" ? "." : rel.startsWith("..") ? out : rel;
console.log(`Wrote ${written.length} files to ${shown}. Open ${join(shown, "index.html")}.`);
