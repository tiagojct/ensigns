// Writes docs/migration/phase2/swatches.html: every value that changed in phase 2, old beside new, with
// the contrast that matters, and the alternatives offered for Pequod and Goney. A plain local page with
// no script and no request. The page's own colours come from the Pequod tokens.
//
//   node scripts/design/swatch-sheet.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { oklabDistance, toOklch } from "../../lib/colour/oklab.ts";
import { contrastRatio } from "../../lib/colour/wcag.ts";
import { night } from "../../lib/harness/night.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import { MODES } from "../../lib/model/types.ts";
import type { ModeName, ResolvedFamily } from "../../lib/model/types.ts";
import type { Change } from "../../tests/shared/legacy.ts";

const root = repoRoot();
const read = (path: string): any => JSON.parse(readFileSync(join(root, path), "utf8"));

const IDS = ["pequod", "goney", "jungfrau", "rosebud"];
const families: Record<string, ResolvedFamily> = Object.fromEntries(loadFamilies().map((f) => [f.dir, resolveFamily(f.file)]));
const thresholds = read("tests/environments.json");
const routes = read("docs/migration/phase2/pequod-routes.json");

interface Row {
  mode: ModeName;
  address: string;
  from: string;
  to: string;
  why?: string;
}
const changes: Record<string, Row[]> = Object.fromEntries(IDS.map((id) => [id, read(`tests/shared/expected-changes/${id}.json`) as Change[]]));
// Jungfrau's list is wider than the expected changes. It also holds the surfaces, status and extra
// colours, which the snapshot of the old model does not carry.
const jungfrau: Row[] = read("docs/migration/phase2/jungfrau-before-after.json");
const rowsOf = (id: string): Row[] => (id === "jungfrau" ? jungfrau : changes[id]!);

const hexNow = (id: string, mode: ModeName, address: string): string | undefined => families[id]!.modes[mode].colours.get(address)?.hex;
const hexWas = (id: string, mode: ModeName, address: string): string | undefined => {
  const hit = rowsOf(id).find((r) => r.mode === mode && r.address === address);
  return hit ? hit.from || undefined : hexNow(id, mode, address);
};

// The lists must describe the token files as they are now, and agree with each other.
for (const id of IDS) {
  for (const r of rowsOf(id)) {
    const now = hexNow(id, r.mode, r.address);
    if (now !== r.to) throw new Error(`${id} ${r.mode} ${r.address}: the change list says ${r.to}, the token file says ${now}. Regenerate the list.`);
  }
}
for (const c of changes.jungfrau!) {
  const w = jungfrau.find((r) => r.mode === c.mode && r.address === c.address);
  if (!w || w.from !== c.from) throw new Error(`jungfrau-before-after.json and expected-changes/jungfrau.json disagree at ${c.mode} ${c.address}`);
}

// ---------------------------------------------------------------------------------------------
// Markup helpers
// ---------------------------------------------------------------------------------------------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sw = (hex: string) => (hex ? `<span class="sw" style="background:${hex}" role="img" aria-label="${hex}"></span>` : `<span class="sw none"></span>`);
const cell = (hex: string) => `<td class="c">${sw(hex)}${hex ? `<code>${hex}</code>` : " none"}</td>`;
/** A contrast figure. In the bad style when it is below the level the row is meant to reach. */
const fig = (value: number, min?: number) => `<span${min !== undefined && value < min ? ' class="bad"' : ""}>${value.toFixed(2)}</span>`;

/** The colour a value is read on: the editor for syntax, the terminal ground for the terminal, the page otherwise. */
function ground(id: string, mode: ModeName, address: string, old: boolean): string {
  const at = (a: string) => (old ? hexWas : hexNow)(id, mode, a);
  const wanted = address.startsWith("syntax.") ? "surfaces.editor" : address.startsWith("ansi.") || address.startsWith("terminal.") ? "terminal.background" : "roles.bg";
  return at(wanted) ?? at("roles.bg")!;
}

const TEXT_LIKE = /^(roles\.(text|link|accent)|syntax\.|ansi\.|accents\.|terminal\.foreground)/;

/** The minimum the family itself declares for a colour as text: a pair's own minimum, else by its kind. */
function declaredMin(id: string, r: Row): number | undefined {
  const pair = families[id]!.source.pairs?.find((p) => p.fg === r.address && (p.modes === undefined || p.modes.includes(r.mode)));
  return pair ? (pair.min ?? (pair.kind === "text" ? 4.5 : 3)) : undefined;
}

interface Flag {
  /** Judge each figure against the family's declared pair for the address, where there is one. */
  declared?: boolean;
  /** Otherwise judge text-like addresses against this. */
  below?: number;
}

function contrastCell(id: string, r: Row, flag: Flag): string {
  if (!TEXT_LIKE.test(r.address) || !r.from || !r.to) return "<td></td>";
  const before = contrastRatio(r.from, ground(id, r.mode, r.address, true));
  const after = contrastRatio(r.to, ground(id, r.mode, r.address, false));
  const min = (flag.declared ? declaredMin(id, r) : undefined) ?? flag.below;
  return `<td class="n">${fig(before, min)} to ${fig(after, min)}</td>`;
}

function table(id: string, rows: Row[], opts: Flag & { why?: boolean } = {}): string {
  const head = `<thead><tr><th>mode</th><th>address</th><th>old</th><th>new</th><th>contrast, old to new</th>${opts.why ? "<th>reason</th>" : ""}</tr></thead>`;
  const body = rows
    .map((r) => `<tr><td>${r.mode}</td><td><code>${esc(r.address)}</code></td>${cell(r.from)}${cell(r.to)}${contrastCell(id, r, opts)}${opts.why ? `<td class="why">${esc((r.why ?? "").replace(/^./, (c) => c.toUpperCase()))}</td>` : ""}</tr>`)
    .join("\n");
  return `<table>${head}<tbody>\n${body}\n</tbody></table>`;
}

/** Old and new swatches side by side, one pair per name. */
function strip(label: string, items: { name: string; was: string; now: string }[]): string {
  return `<div class="strip"><b>${esc(label)}</b>${items.map((i) => `<span class="pair">${sw(i.was)}${sw(i.now)}<small>${esc(i.name)}</small></span>`).join("")}</div>`;
}
const keysOf = (id: string, mode: ModeName, prefix: string) => [...families[id]!.modes[mode].colours.keys()].filter((a) => a.startsWith(prefix));
const stripOf = (id: string, mode: ModeName, label: string, addresses: string[]) =>
  strip(label, addresses.map((a) => ({ name: a.split(".")[1]!, was: hexWas(id, mode, a) ?? "", now: hexNow(id, mode, a)! })));

const heading = (id: string) => `${families[id]!.meta.name} ${families[id]!.meta.version}`;
const NUMBERS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
/** A count as a word up to twenty, for prose. */
const spell = (n: number) => NUMBERS[n] ?? String(n);
const cap = (s: string) => s.replace(/^./, (c) => c.toUpperCase());
const sections: string[] = [];

// ---------------------------------------------------------------------------------------------
// Pequod
// ---------------------------------------------------------------------------------------------
const CREW = ["ahab", "starbuck", "queequeg", "pip", "ishmael", "stubb", "tashtego", "daggoo"];
for (const m of MODES) {
  for (const n of CREW) {
    if (routes.original[m][n] !== hexWas("pequod", m, `accents.${n}`)) throw new Error(`pequod-routes.json and the change list disagree about ${n} in ${m}`);
  }
}
const moved = [...MODES].reverse().flatMap((m) => CREW.filter((n) => hexWas("pequod", m, `accents.${n}`) !== hexNow("pequod", m, `accents.${n}`)).map((n) => ({ m, n })));
const crewRows = moved
  .map(({ m, n }) => {
    const was = hexWas("pequod", m, `accents.${n}`)!;
    const now = hexNow("pequod", m, `accents.${n}`)!;
    const cols = (routes.surfaces[m] as { hex: string; min: number }[]).map((s) => `<td class="n">${fig(contrastRatio(was, s.hex), s.min)} to ${fig(contrastRatio(now, s.hex), s.min)}</td>`).join("");
    return `<tr><td>${m}</td><td>${n}</td>${cell(was)}${cell(now)}${cols}</tr>`;
  })
  .join("\n");
const surfaceHead = (routes.surfaces.light as { name: string; min: number }[]).map((s) => `<th>${s.name} (${s.min})</th>`).join("");

const ROUTE_CREW = ["ahab", "starbuck", "ishmael", "stubb", "tashtego"];
const minDistance = (hexes: string[]) => Math.min(...hexes.flatMap((a, i) => hexes.slice(i + 1).map((b) => oklabDistance(a, b))));
const lightFloor: number = routes.routes.E.light.floor;
/** How many crew and surface pairs in Parchment fall below the minimum for that surface. */
const belowAA = (colours: Record<string, string>) =>
  CREW.reduce((n, crew) => n + (routes.surfaces.light as { hex: string; min: number }[]).filter((s) => contrastRatio(colours[crew]!, s.hex) < s.min).length, 0);
const ahabCell = (hex: string) => {
  const k = toOklch(hex);
  return `<td class="c">${sw(hex)}<code>${hex}</code><br><small>L ${k.L.toFixed(2)}, C ${k.C.toFixed(3)}, h ${k.h.toFixed(0)}</small></td>`;
};
const routeRow = (label: string, colours: Record<string, string>) => {
  const distance = minDistance(CREW.map((n) => colours[n]!));
  const holds = distance >= lightFloor;
  const low = belowAA(colours);
  return `<tr><td>${esc(label)}</td>${ahabCell(colours.ahab!)}${ROUTE_CREW.slice(1).map((n) => cell(colours[n]!)).join("")}<td class="n${low ? " bad" : ""}">${low ? `${low} below` : "holds"}</td><td class="n${holds ? "" : " bad"}">${distance.toFixed(4)}</td><td>${holds ? "holds" : "below the floor"}</td></tr>`;
};
const routeRows = [
  routeRow("the old set", routes.original.light),
  ...Object.entries(routes.routes as Record<string, any>).map(([key, r]) => routeRow(`${r.name}${key === "E" ? ", applied" : ""}`, r.light.colours)),
].join("\n");
const darkSets = new Set(Object.values(routes.routes as Record<string, any>).map((r) => JSON.stringify(r.dark.colours)));
const darkNote =
  darkSets.size === 1
    ? `<p>In Below deck every route holds the same eight crew colours. The smallest distance is ${routes.routes.E.dark.minimum.toFixed(4)} against a floor of ${routes.routes.E.dark.floor}.</p>`
    : "";

const pequodD16 = changes.pequod!.filter((c) => c.why?.startsWith("D16"));
const pequodFix = changes.pequod!.filter((c) => c.why?.startsWith("Pequod corrections"));

// The prose below says every new crew colour reaches the minimum, so check it.
const surfacesIn = (m: ModeName) => routes.surfaces[m] as { hex: string; min: number }[];
const clears = (hex: string, m: ModeName) => surfacesIn(m).every((s) => contrastRatio(hex, s.hex) >= s.min);
for (const { m, n } of moved) {
  if (!clears(hexNow("pequod", m, `accents.${n}`)!, m)) throw new Error(`pequod ${m} ${n} does not reach the minimum on every surface`);
}
const failedBefore = moved.filter(({ m, n }) => !clears(hexWas("pequod", m, `accents.${n}`)!, m));
const passedBefore = moved.filter((x) => !failedBefore.includes(x)).map(({ m, n }) => `${n[0]!.toUpperCase()}${n.slice(1)} in ${m === "light" ? "Parchment" : "Below deck"}`);
const k0 = toOklch(routes.original.light.ahab);
const kA = toOklch(routes.routes.A.light.colours.ahab);
const kE = toOklch(routes.routes.E.light.colours.ahab);
sections.push(`<h2 id="pequod">${esc(heading("pequod"))}</h2>
<h3>The corrected crew</h3>
<p>${cap(spell(moved.length))} crew colours change: ${spell(moved.filter((x) => x.m === "light").length)} in Parchment and ${spell(moved.filter((x) => x.m === "dark").length)} in Below deck. ${cap(spell(failedBefore.length))} of them were below the minimum on at least one surface, and those old figures are in the bad style. ${passedBefore.join(" and ")} already passed and ${passedBefore.length === 1 ? "moves" : "move"} for the distance floor, described below. Every new colour reaches the minimum on every surface. The minimum is in brackets in each header: 4.5:1 for text on the page, the editor and the current line, 3:1 on the selection.</p>
${stripOf("pequod", "light", "Parchment", keysOf("pequod", "light", "accents."))}
${stripOf("pequod", "dark", "Below deck", keysOf("pequod", "dark", "accents."))}
<table><thead><tr><th>mode</th><th>crew</th><th>old</th><th>new</th>${surfaceHead}</tr></thead><tbody>
${crewRows}
</tbody></table>
<details><summary>All ${pequodFix.length} addresses the correction touches</summary>
<p>Each crew colour also feeds the syntax, ANSI and data addresses that refer to it.</p>
${table("pequod", pequodFix, { below: 4.5 })}
</details>
<h3>The Ahab decision</h3>
<p>The brief sets the distance floor at the smallest distance in the old crew, between Ishmael and Tashtego: ${lightFloor} in Parchment, in OKLab. Once the other four colours reach AA, no set that leaves Ahab as he was holds it (routes B and C). Route E is applied. It darkens Ahab from lightness ${k0.L.toFixed(2)} to ${kE.L.toFixed(2)} and keeps his chroma near the old ${k0.C.toFixed(3)} (${kE.C.toFixed(3)}). Route A is the alternative. It keeps his lightness and raises his chroma to ${kA.C.toFixed(3)}, at hue ${kA.h.toFixed(0)} instead of ${k0.h.toFixed(0)}. The last row holds the brief's starting values, which miss the floor. The AA column counts the pairs of crew colour and surface, of ${CREW.length * surfacesIn("light").length}, that fall below the minimum.</p>
<table><thead><tr><th>set</th><th>Ahab</th><th>Starbuck</th><th>Ishmael</th><th>Stubb</th><th>Tashtego</th><th>AA on the four surfaces</th><th>smallest distance (floor ${lightFloor})</th><th></th></tr></thead><tbody>
${routeRows}
</tbody></table>
${darkNote}
<h3>Where the shipped themes won over pequod.json (decision D16)</h3>
<p>${cap(spell(pequodD16.length))} values. The old model read pequod.json. The shipped themes draw these values differently, and decision D16 lets the themes win. The shipped themes do not change here. The old column is pequod.json and the new column is the theme value the token file now holds.</p>
${table("pequod", pequodD16, { why: true })}`);

// ---------------------------------------------------------------------------------------------
// Goney
// ---------------------------------------------------------------------------------------------
const imum = changes.goney![0]!;
const aer = hexNow("goney", "light", "accents.aer")!;
const pageLight = hexNow("goney", "light", "roles.bg")!;
const goneyRow = (label: string, hex: string, cls: string) =>
  `<tr><td>${label}</td>${cell(aer)}${cell(hex)}<td class="n ${cls}">${oklabDistance(aer, hex).toFixed(3)}</td><td class="n">${contrastRatio(hex, pageLight).toFixed(2)}</td></tr>`;
sections.push(`<h2 id="goney">${esc(heading("goney"))}</h2>
<p>One change. Imum in light mode shared a value with Aer, so the two could not be told apart. It now has its own value, which is applied. The alternative is to keep the shared value, declare the pair an alias and take it out of the distinct set.</p>
${stripOf("goney", "light", "Light accents", keysOf("goney", "light", "accents."))}
<table><thead><tr><th></th><th>Aer</th><th>Imum</th><th>distance from Aer</th><th>Imum on the page</th></tr></thead><tbody>
${goneyRow("before, and the alias alternative", imum.from, "bad")}
${goneyRow("own value, applied", imum.to, "ok")}
</tbody></table>
<p>${esc(imum.why ?? "")}</p>`);

// ---------------------------------------------------------------------------------------------
// Jungfrau
// ---------------------------------------------------------------------------------------------
/** The family as it was before the repositioning: every changed address takes its old value. */
function asItWas(id: string, rows: Row[]): ResolvedFamily {
  const f = families[id]!;
  const modes = {} as ResolvedFamily["modes"];
  for (const m of MODES) {
    const colours = new Map(f.modes[m].colours);
    for (const r of rows) if (r.mode === m && r.from) colours.set(r.address, { hex: r.from, from: "before phase 2" });
    modes[m] = { ...f.modes[m], colours };
  }
  return { ...f, modes };
}
const nightBefore = night(asItWas("jungfrau", jungfrau), thresholds);
const nightAfter = night(families.jungfrau!, thresholds);
const verdict = (c: { ok: boolean; level: string; report?: boolean; detail: string }) => {
  const word = c.report ? "report" : c.ok ? "pass" : c.level === "warn" ? "warn" : "fail";
  return `<td class="${c.ok || c.report ? "" : "bad"}"><b>${word}</b> ${esc(c.detail)}</td>`;
};
const nightRows = nightAfter
  .map((after) => {
    const before = nightBefore.find((b) => b.id === after.id && b.mode === after.mode);
    return `<tr><td>${esc(after.id)}</td><td>${after.mode ?? ""}</td>${before ? verdict(before) : "<td></td>"}${verdict(after)}</tr>`;
  })
  .join("\n");

const GROUPS = ["roles", "extra", "accents", "surfaces", "syntax", "ansi", "terminal", "status", "data"];
const groupTables = GROUPS.map((g) => {
  const rows = jungfrau.filter((r) => r.address.split(".")[0] === g && r.from !== r.to);
  return rows.length ? `<h4>${g} (${rows.length})</h4>\n${table("jungfrau", rows)}` : "";
}).join("\n");
const core = ["roles.bg", "roles.surface", "roles.text", "roles.text-muted"];
sections.push(`<h2 id="jungfrau">${esc(heading("jungfrau"))}</h2>
<p>Repositioned as the night family. ${jungfrau.length} addresses changed. The equality test sees ${changes.jungfrau!.length} of them. The rest are surface, status and extra colours that the snapshot of the old model does not carry; they are listed in docs/migration/phase2/jungfrau-before-after.json and move with the others. The design record is scripts/design/jungfrau.ts.</p>
<h3>The night checks, before and after</h3>
<p>The same checks the test suite runs, on the old values and on the new ones. The limits and their reasons are in tests/environments.json.</p>
<table class="night"><colgroup><col style="width:12%"><col style="width:6%"><col style="width:41%"><col style="width:41%"></colgroup><thead><tr><th>check</th><th>mode</th><th>before</th><th>after</th></tr></thead><tbody>
${nightRows}
</tbody></table>
<h3>The two modes</h3>
${stripOf("jungfrau", "dark", `Try-Fire`, [...core, ...keysOf("jungfrau", "dark", "accents.")])}
${stripOf("jungfrau", "light", `Lamp-feeder`, [...core, ...keysOf("jungfrau", "light", "accents.")])}
<h3>Every changed address</h3>
${groupTables}`);

// ---------------------------------------------------------------------------------------------
// Rosebud
// ---------------------------------------------------------------------------------------------
sections.push(`<h2 id="rosebud">${esc(heading("rosebud"))}</h2>
<p>The light terminal set is authored. The old site reused the dark slots on the light ground. ${cap(spell(changes.rosebud!.length))} values change. Figures are judged against the minimum Rosebud declares for each pair: 4.5:1 for the normal slots and 3:1 for the bright slots and bright black, which are emphasis and dim colours.</p>
${table("rosebud", changes.rosebud!, { why: true, declared: true, below: 4.5 })}`);

// ---------------------------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------------------------
const host = (m: ModeName, a: string) => hexNow("pequod", m, a)!;
const tokens = (m: ModeName) =>
  `--bg:${host(m, "roles.bg")};--panel:${host(m, "roles.surface-raised")};--ink:${host(m, "roles.text")};--muted:${host(m, "roles.text-muted")};--rule:${host(m, "roles.border")};--link:${host(m, "roles.link")};--ok:${host(m, "status.success")};--bad:${host(m, "status.danger")}`;
const css = `
:root { ${tokens("light")}; color-scheme: light dark; }
@media (prefers-color-scheme: dark) { :root { ${tokens("dark")}; } }
body { font: 14px/1.5 system-ui, sans-serif; color: var(--ink); background: var(--bg); max-width: 1120px; margin: 2rem auto; padding: 0 1rem; }
h1, h2, h3, h4 { font-weight: 600; line-height: 1.25; margin: 1.8em 0 .5em; }
h2 { border-top: 1px solid var(--rule); padding-top: 1em; }
p, li { max-width: 62em; }
a { color: var(--link); }
table.night { table-layout: fixed; }
table { border-collapse: collapse; width: 100%; margin: .6em 0 1.2em; }
th, td { border-bottom: 1px solid var(--rule); padding: .3em .5em; text-align: left; vertical-align: middle; }
th { font-weight: 600; font-size: 12px; color: var(--muted); }
td.c, td.n { white-space: nowrap; font-variant-numeric: tabular-nums; }
td.why { font-size: 12px; max-width: 30em; color: var(--muted); }
.ok { color: var(--ok); font-weight: 600; }
.bad { color: var(--bad); font-weight: 600; text-decoration: underline; }
code { font: 12px ui-monospace, monospace; margin-left: .4em; }
td > code:first-child { margin-left: 0; }
.sw { display: inline-block; width: 3.4em; height: 1.5em; border: 1px solid var(--rule); border-radius: 3px; vertical-align: middle; }
.sw.none { background: transparent; border-style: dashed; }
.strip { display: flex; flex-wrap: wrap; gap: .8em; align-items: flex-end; margin: .6em 0; }
.strip > b { width: 7em; }
.pair { display: inline-flex; flex-direction: column; align-items: center; }
.pair .sw { width: 2.4em; border-radius: 0; }
.pair small { font-size: 11px; color: var(--muted); }
details { margin: .6em 0 1.2em; }
summary { cursor: pointer; }
`;

const contents = IDS.map((id) => `<li><a href="#${id}">${esc(heading(id))}</a>, ${rowsOf(id).length} ${rowsOf(id).length === 1 ? "address" : "addresses"}</li>`).join("\n");
const page = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Phase 2 swatches</title>
<style>${css}</style>
</head>
<body>
<h1>Phase 2: every changed value</h1>
<p>Old beside new, for the four families that changed. Generated by scripts/design/swatch-sheet.ts from the expected changes, the design records and the token files. Contrast is the WCAG 2.x ratio against the colour a value is read on: the page for roles and accents, the editor background for syntax, the terminal background for ANSI and terminal colours. A section that states a target marks each figure below it in the bad style: bold, underlined and in the status colour. Other figures are given without a verdict.</p>
<ul>
${contents}
</ul>
${sections.join("\n")}
</body>
</html>
`;
writeFileSync(join(root, "docs/migration/phase2/swatches.html"), page);
console.log(`wrote docs/migration/phase2/swatches.html (${page.length} bytes)`);
