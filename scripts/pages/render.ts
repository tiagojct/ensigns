// HTML for the local family pages: the index, one page per family or candidate,
// and the standalone specimen pages. Colour reaches the markup only as a class, or
// as a data-scope and data-mode pair that assets/tokens.css styles. A hex value
// appears only as text, inside <code class="hex">.
import { contrastRatio } from "../../lib/colour/wcag.ts";
import type { Check, FamilyReport, ProfileReport, ProfileStatus } from "../../lib/harness/index.ts";
import { num } from "../../lib/harness/types.ts";
import type { Thresholds } from "../../lib/harness/types.ts";
import { flattenOver } from "../../lib/model/resolve.ts";
import { distinctMembers } from "../../lib/model/sets.ts";
import { CORE_ROLES, MODES } from "../../lib/model/types.ts";
import type { ClinicalLevel, Data, ModeName, Resolved, ResolvedFamily, ResolvedMode } from "../../lib/model/types.ts";
import { filtersSvg } from "./filters.ts";
import type { View } from "./filters.ts";
import { addressClass, designLeaves, designRefName } from "./tokens-css.ts";

export interface Entry {
  /** The family id, which is also its folder under families/. */
  id: string;
  /** The data-scope value and the page name: the id, or <id>--<candidate>. */
  scope: string;
  candidate?: string;
  /** The token file, relative to the repository root. */
  file: string;
  family: ResolvedFamily;
  report: FamilyReport;
}

export interface Group {
  id: string;
  main: Entry;
  candidates: Entry[];
  /** The specimen fragment, and whether a stylesheet goes with it. */
  specimen?: { html: string; css: boolean };
  /** README.md and CHANGELOG.md beside the token file, relative to the repository root, when they exist. */
  docs: { readme?: string; changelog?: string };
}

export interface Site {
  groups: Group[];
  thresholds: Thresholds;
  views: View[];
}

export const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const HEX = /#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?(?![0-9A-Za-z])/g;
/** Escaped prose, with any hex value in it marked as a displayed value. */
const text = (s: string): string => esc(s).replace(HEX, (h) => `<code class="hex">${h}</code>`);
const colourText = (c: Resolved): string => `<code class="hex">${c.hex}</code>${c.alpha === undefined ? "" : ` at ${Number((c.alpha * 100).toFixed(1))}%`}`;
const plural = (n: number, one: string): string => `${n} ${one}${n === 1 ? "" : "s"}`;
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const modeTitle = (mode: ModeName, label?: string): string => `${mode === "dark" ? "Dark" : "Light"}${label ? ` (${label})` : ""}`;
const code = (s: string): string => `<code>${esc(s)}</code>`;
const tags = (items: string[]): string => `<ul class="tags">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

function htmlDocument(title: string, stylesheets: string[], body: string, bodyAttributes = ""): string {
  return [
    "<!doctype html>",
    '<html lang="en-GB">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(title)}</title>`,
    ...stylesheets.map((href) => `<link rel="stylesheet" href="${esc(href)}">`),
    "</head>",
    `<body${bodyAttributes}>`,
    body,
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

function chapterLine(f: ResolvedFamily): string {
  const { chapter, chapterTitle, host } = f.meta;
  if (chapter === undefined) return host ? "The host ship, with no chapter of its own" : "No chapter";
  const numbers = Array.isArray(chapter) ? `Chapters ${chapter[0]} and ${chapter[1]}` : `Chapter ${chapter}`;
  return chapterTitle ? `${numbers}, ${chapterTitle}` : numbers;
}

const PROFILE_ICON: Record<ProfileStatus, string> = { pass: "✓", warn: "▲", fail: "✕", external: "◇", "not-implemented": "○" };
const profileChip = (status: ProfileStatus, profile?: string): string =>
  `<span class="chip ps-${status}"><span aria-hidden="true">${PROFILE_ICON[status]}</span> ${profile ? `${esc(profile)}: ` : ""}${status}</span>`;

type Outcome = "pass" | "fail" | "warning" | "waived" | "information";
const OUTCOME_CLASS: Record<Outcome, string> = { pass: "ps-pass", fail: "ps-fail", warning: "ps-warn", waived: "ps-waived", information: "ps-info" };
const outcomeWord = (o: Outcome): string => `<span class="${OUTCOME_CLASS[o]}">${o}</span>`;

function outcome(c: Check): Outcome {
  if (c.report) return "information";
  if (c.ok) return "pass";
  if (c.waived) return "waived";
  return c.level === "error" ? "fail" : "warning";
}

const fmtValue = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(Math.abs(v) >= 10 ? 1 : Math.abs(v) >= 1 ? 2 : 3));

const td = (html: string, cls = ""): string => `<td${cls ? ` class="${cls}"` : ""}>${html}</td>`;
const rowHead = (html: string): string => `<th scope="row">${html}</th>`;

/** A table in a container that scrolls sideways on a narrow screen. */
function table(label: string, head: string[], rows: string[][]): string {
  return [
    `<div class="scroll" tabindex="0" role="region" aria-label="${esc(label)}">`,
    "<table>",
    `<thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>`,
    "<tbody>",
    ...rows.map((cells) => `<tr>${cells.join("")}</tr>`),
    "</tbody>",
    "</table>",
    "</div>",
  ].join("\n");
}

/** Text in one colour on a background, over the family's page ground, in one scope and mode. */
const pairSample = (scope: string, mode: ModeName, fg: string, bg: string, label = "Aa"): string =>
  `<span class="pair" data-scope="${scope}" data-mode="${mode}" aria-hidden="true"><span class="pair-ground sw-roles-bg"><span class="pair-text sw-${addressClass(bg)} fg-${addressClass(fg)}">${esc(label)}</span></span></span>`;

// Family and candidate pages -------------------------------------------------

/** A swatch with its name, value and palette entry. extra is one more line, such as a contrast ratio. */
function swatchItem(address: string, c: Resolved, name: string, extra = ""): string {
  return (
    `<li><span class="swatch sw-${addressClass(address)}" aria-hidden="true"></span>` +
    `<span class="swatch-text"><span class="name">${esc(name)}</span><span class="meta">${colourText(c)}</span>${extra ? `<span class="meta">${extra}</span>` : ""}<span class="from">${esc(c.from)}</span></span></li>`
  );
}
const swatchList = (items: string[]): string => `<ul class="swatches">${items.join("")}</ul>`;

function coreRoles(m: ResolvedMode): string {
  const bg = m.colours.get("roles.bg")!;
  return swatchList(
    CORE_ROLES.map((role) => {
      const c = m.colours.get(`roles.${role}`)!;
      const ratio = contrastRatio(flattenOver(c, bg.hex), bg.hex);
      return swatchItem(`roles.${role}`, c, role, `${ratio.toFixed(2)}:1 on bg`);
    }),
  );
}

const GROUPS: [prefix: string, title: string][] = [
  ["accents.", "Accents"],
  ["surfaces.", "Surfaces"],
  ["extra.", "Extra roles"],
  ["status.", "Status"],
  ["syntax.", "Syntax"],
  ["ansi.", "ANSI"],
  ["terminal.", "Terminal"],
];

function ramp(m: ResolvedMode, name: string, label: string | undefined, steps: string[]): string {
  const boxes = steps.map((a) => `<span class="sw-${addressClass(a)}"></span>`).join("");
  const values = steps.map((a, i) => `<li><span class="step">${i + 1}</span> ${colourText(m.colours.get(a)!)}</li>`).join("");
  return `<figure class="ramp"><figcaption>${esc(name)}${label ? `: ${text(label)}` : ""}</figcaption><span class="strip" aria-hidden="true">${boxes}</span><ol class="values">${values}</ol></figure>`;
}

type Scales = Exclude<Data, { ref: string }>;

function dataBlock(site: Site, f: ResolvedFamily, mode: ModeName): string {
  const m = f.modes[mode];
  if (m.dataRef) {
    const target = site.groups.find((g) => g.id === m.dataRef);
    const name = target ? `<a href="${target.main.scope}.html">${esc(target.main.family.meta.name)}</a>` : esc(m.dataRef);
    return `<p>The data scales are ${name}'s.</p>`;
  }
  const source = f.source.modes[mode].data;
  const scales: Scales = source && !("ref" in source) ? source : {};
  const out: string[] = [];
  const pick = (prefix: string) => [...m.colours].filter(([a]) => a.startsWith(prefix)).map(([a, c]) => swatchItem(a, c, a.slice(prefix.length)));
  const categorical = pick("data.categorical.");
  if (categorical.length > 0) {
    out.push("<h5>Categorical</h5>");
    if (scales.categorical?.label) out.push(`<p class="aside">${text(scales.categorical.label)}</p>`);
    out.push(swatchList(categorical));
  }
  for (const kind of ["sequential", "diverging"] as const) {
    const defs = Object.entries(scales[kind] ?? {});
    if (defs.length === 0) continue;
    out.push(`<h5>${cap(kind)}</h5>`);
    for (const [name, def] of defs) out.push(ramp(m, name, def.label, def.colors.map((_, i) => `data.${kind}.${name}.${i + 1}`)));
  }
  const plot = pick("data.plot.");
  if (plot.length > 0) out.push("<h5>Plot</h5>", swatchList(plot));
  return out.length > 0 ? out.join("\n") : "<p>No data scales.</p>";
}

const STATUS_ICON: Record<string, string> = { danger: "✕", critical: "✕", warning: "▲", success: "✓", info: "●", hint: "?", conflict: "◆", neutral: "○" };

function statusChips(f: ResolvedFamily, mode: ModeName): string {
  const status = f.source.modes[mode].status;
  if (!status) return "";
  const chip = (level: string, classes: string, iconClass = "") =>
    `<li class="chip ${classes}"><span${iconClass ? ` class="${iconClass}"` : ""} aria-hidden="true">${STATUS_ICON[level]}</span> ${cap(level)}</li>`;
  const items: string[] = [];
  if (status.policy === "chromatic") {
    for (const level of ["danger", "warning", "success", "info", "hint", "conflict"] as const) {
      if (status[level] !== undefined) items.push(chip(level, `fg-status-${level}`));
    }
  } else {
    // Achromatic levels: the word in the text colour on the level's fill, the border and the icon in its accent.
    for (const level of ["neutral", "success", "warning", "critical"] as const) {
      const l = status[level];
      const accent = `status-${level}-accent`;
      items.push(chip(level, `edge-${l.edge} bw-${designRefName(l.weight)} sw-status-${level}-fill bc-${accent}`, `fg-${accent}`));
    }
  }
  return `<ul class="chips" aria-label="Status">${items.join("")}</ul>`;
}

function codeBlock(m: ResolvedMode): string {
  const tok = (role: string, s: string): string => {
    const style = m.colours.get(`syntax.${role}`)?.style;
    const styles = style ? style.split(" ").map((x) => ` sy-${x}`).join("") : "";
    return `<span class="fg-syntax-${role}${styles}">${esc(s)}</span>`;
  };
  const ground = m.colours.has("surfaces.editor") ? "sw-surfaces-editor" : "sw-roles-surface";
  const currentLine = m.colours.has("surfaces.editor-line") ? " sw-surfaces-editor-line" : "";
  const selection = m.colours.has("surfaces.editor-selection") ? "sw-surfaces-editor-selection" : "sw-roles-selection";
  const lines = [
    tok("decorator", "@logged"),
    `${tok("keyword", "function")} ${tok("function", "bearing")}${tok("punctuation", "(")}${tok("parameter", "ship")}${tok("punctuation", ":")} ${tok("type", "Ship")}${tok("punctuation", ",")} ${tok("parameter", "knots")} ${tok("operator", "=")} ${tok("number", "12")}${tok("punctuation", "):")} ${tok("type", "string")} ${tok("punctuation", "{")}`,
    `  ${tok("comment", "// the course the captain set")}`,
    `  ${tok("keyword", "const")} ${tok("constant", "HEADING")} ${tok("operator", "=")} ${tok("string", '"east-south-east"')}${tok("punctuation", ";")}`,
    `  ${tok("keyword", "return")} <span class="${selection}">${tok("variable", "ship")}${tok("punctuation", ".")}${tok("variable", "name")}</span> ${tok("operator", "+")} ${tok("constant", "HEADING")}${tok("punctuation", ";")}`,
    tok("punctuation", "}"),
  ];
  return `<pre class="code ${ground}"><code>${lines.map((l, i) => `<span class="line${i === 2 ? currentLine : ""}">${l}</span>`).join("")}</code></pre>`;
}

const HUES = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"] as const;

function terminalBlock(m: ResolvedMode): string {
  const has = (a: string) => m.colours.has(a);
  const slot = (name: string, s: string) => `<span class="fg-ansi-${name}">${esc(s)}</span>`;
  const ground = has("terminal.background") ? "sw-terminal-background fg-terminal-foreground" : "sw-roles-surface";
  const selection = has("terminal.selection-background") ? "sw-terminal-selection-background fg-terminal-selection-foreground" : "sw-roles-selection";
  const cursor = has("terminal.cursor") ? "sw-terminal-cursor fg-terminal-cursor-text" : "sw-roles-text fg-roles-bg";
  const lines = [
    `${slot("green", "ishmael@pequod")} ${slot("blue", "~/log")} $ ls`,
    `${slot("blue", "charts")}  ${slot("green", "try-works.sh")}  logbook.txt  ${slot("red", "leak.log")}`,
    `normal ${HUES.map((h) => slot(h, h)).join(" ")}`,
    `bright ${HUES.map((h) => slot(`bright-${h}`, h)).join(" ")}`,
    `$ echo <span class="${selection}">selected text</span>`,
    `$ <span class="${cursor}"> </span>`,
  ];
  return `<pre class="term ${ground}"><code>${lines.map((l) => `<span class="line">${l}</span>`).join("")}</code></pre>`;
}

function inUse(f: ResolvedFamily, mode: ModeName): string {
  const m = f.modes[mode];
  const parts = [
    '<p class="sample-title">A heading in the text colour</p>',
    '<p>Body text on the page ground, with <a href="#colours">a link</a> and <a class="hover" href="#colours">a link as it looks on hover</a>.</p>',
    '<p class="muted">Muted text, for captions and notes.</p>',
    '<p class="subtle">Subtle text, for large or quiet labels.</p>',
    '<p class="controls"><button type="button" class="btn">Button</button> <button type="button" class="btn focus">Button with the focus ring</button> <span class="accent-chip">Accent</span></p>',
    '<p class="selected">A selected line.</p>',
    statusChips(f, mode),
    m.colours.has("syntax.keyword") ? codeBlock(m) : "",
    m.colours.has("ansi.black") ? terminalBlock(m) : "",
  ];
  return `<div class="sample">\n${parts.filter(Boolean).join("\n")}\n</div>`;
}

function panel(site: Site, group: Group, entry: Entry, mode: ModeName): string {
  const f = entry.family;
  const m = f.modes[mode];
  const heading = `mode-${mode}`;
  const parts = [`<h3 id="${heading}">${esc(modeTitle(mode, m.label))}</h3>`, "<h4>Core roles</h4>", coreRoles(m)];
  for (const [prefix, title] of GROUPS) {
    const items = [...m.colours].filter(([a]) => a.startsWith(prefix)).map(([a, c]) => swatchItem(a, c, a.slice(prefix.length), c.style ?? ""));
    if (items.length > 0) parts.push(`<h4>${title}</h4>`, swatchList(items));
  }
  parts.push("<h4>Data</h4>", dataBlock(site, f, mode), "<h4>In use</h4>", inUse(f, mode));
  if (group.specimen) {
    parts.push(
      "<h4>Specimen</h4>",
      `<div class="specimen specimen-${group.id}">\n${group.specimen.html.replaceAll("{mode}", mode)}\n</div>`,
      `<p class="aside">The specimen alone: <a href="specimen/${entry.scope}--${mode}.html">${esc(modeTitle(mode, m.label))}</a>.</p>`,
    );
  }
  return `<section class="mode" data-scope="${entry.scope}" data-mode="${mode}" aria-labelledby="${heading}">\n${parts.join("\n")}\n</section>`;
}

function pairsTable(site: Site, entry: Entry): string {
  const f = entry.family;
  const rows: string[][] = [];
  for (const p of f.source.pairs ?? []) {
    for (const mode of p.modes ?? MODES) {
      // As the office-screen profile measures it: a translucent background over the page, a translucent foreground over that.
      const colours = f.modes[mode].colours;
      const bg = flattenOver(colours.get(p.bg)!, colours.get("roles.bg")!.hex);
      const ratio = contrastRatio(flattenOver(colours.get(p.fg)!, bg), bg);
      const min = p.min ?? num(site.thresholds, `common.wcag.${p.kind}.value`);
      rows.push([
        rowHead(code(p.fg)),
        td(code(p.bg)),
        td(p.kind),
        td(mode),
        td(pairSample(entry.scope, mode, p.fg, p.bg)),
        td(`${ratio.toFixed(2)}:1`, "num"),
        td(`${min}:1`, "num"),
        td(outcomeWord(ratio >= min ? "pass" : "fail")),
        td(p.why ? text(p.why) : "", p.why ? "wide" : ""),
      ]);
    }
  }
  if (rows.length === 0) return "<p>The family declares no pairs.</p>";
  return table("Declared pairs", ["Foreground", "Background", "Kind", "Mode", "Sample", "Contrast", "Needs", "Result", "Why"], rows);
}

function distinctTable(f: ResolvedFamily): string {
  const pairs = (xs?: [string, string][]) => esc((xs ?? []).map(([a, b]) => `${a} and ${b}`).join("; "));
  const rows = (f.source.distinct ?? []).map((d) => {
    const modes = d.modes ?? MODES;
    const members = d.members
      ? d.members.map(code).join(", ")
      : `${esc(d.set ?? "")}: ${esc(distinctMembers(f.modes[modes[0]!], d).map((x) => x.name).join(", "))}`;
    const scope = [d.modes ? `${d.modes.join(" and ")} only` : "", d.min !== undefined ? `minimum ${d.min}` : "", d.cvd === "report" ? "colour vision reported, not gated" : ""]
      .filter(Boolean)
      .join("; ");
    return [
      rowHead(esc(d.id)),
      td(members + (scope ? `<br><span class="aside">${esc(scope)}</span>` : ""), "wide"),
      td(esc((d.for ?? []).join(", "))),
      td(esc((d.patterned ?? []).join(", "))),
      td(pairs(d.reinforced) + (d.by ? `<br><span class="aside">By ${text(d.by)}</span>` : ""), d.reinforced?.length ? "wide" : ""),
      td(pairs(d.aliases)),
      td(d.note ? text(d.note) : "", d.note ? "wide" : ""),
    ];
  });
  if (rows.length === 0) return "<p>The family declares no distinct sets.</p>";
  return table("Distinct sets", ["Set", "Members", "For", "Patterned", "Reinforced", "Aliases", "Note"], rows);
}

function rulesTable(f: ResolvedFamily): string {
  const rules = f.source.rules ?? [];
  if (rules.length === 0) return "<p>The family declares no rules.</p>";
  const checked = rules.some((r) => r.check !== undefined);
  const rows = rules.map((r) => [
    rowHead(esc(r.id)),
    td(text(r.text), "wide"),
    ...(checked ? [td(r.check === undefined ? "" : (Array.isArray(r.check) ? r.check : [r.check]).map(code).join(", "))] : []),
  ]);
  return table("Rules", ["Rule", "Text", ...(checked ? ["Check"] : [])], rows);
}

function clinicalTable(entry: Entry, title: string, levels: ClinicalLevel[], critical: string): string {
  const badge = (mode: ModeName, l: ClinicalLevel) =>
    `<span class="pair" data-scope="${entry.scope}" data-mode="${mode}" aria-hidden="true"><span class="pair-ground sw-roles-bg"><span class="badge sw-${addressClass(l.fill)} fg-${addressClass(l.fg)} bc-${addressClass(l.border)}">${esc(l.label)}</span></span></span>`;
  const rows = levels.map((l) => [
    rowHead(esc(l.name) + (l.name === critical ? " (critical)" : "")),
    td(esc(l.label)),
    td(esc(l.icon)),
    td(code(l.fg)),
    td(code(l.fill)),
    td(code(l.border)),
    ...MODES.map((m) => td(badge(m, l))),
  ]);
  return `<h4>${title}</h4>\n${table(title, ["Level", "Word", "Icon", "Foreground", "Fill", "Border", ...MODES.map((m) => cap(m))], rows)}`;
}

function designSummary(entry: Entry): string {
  const f = entry.family;
  const design = f.source.design;
  const parts: string[] = [];
  if (design?.projector?.rooms) parts.push(`<p>Projector rooms gated: ${esc(design.projector.rooms.join(" and "))}.</p>`);
  if (design?.overlay) {
    const rows = design.overlay.fills.map((a) => [
      rowHead(code(a)),
      ...MODES.map((m) => td(`${pairSample(entry.scope, m, "roles.text", a)} ${colourText(f.modes[m].colours.get(a)!)}`)),
    ]);
    parts.push("<h4>Overlay fills</h4>", table("Overlay fills", ["Fill", ...MODES.map((m) => cap(m))], rows));
  }
  if (design?.clinical) {
    parts.push(clinicalTable(entry, "Severity levels", design.clinical.levels, design.clinical.critical));
    if (design.clinical.triage) parts.push(clinicalTable(entry, "Triage levels", design.clinical.triage, design.clinical.critical));
  }
  const other = [...designLeaves(design)].filter(([path]) => !["projector", "overlay", "clinical"].includes(path[0]!));
  if (other.length > 0) {
    const rows = other.map(([path, v]) => [rowHead(code(path.join("."))), td(code(String(v)))]);
    parts.push(`<details><summary>${plural(other.length, "further design token")}</summary>\n${table("Design tokens", ["Token", "Value"], rows)}\n</details>`);
  }
  if (f.source.derived?.length) parts.push(`<p>Derived by a documented rule, not tuned: ${esc(f.source.derived.join(", "))}.</p>`);
  if (f.source.targets?.exclude?.length) parts.push(`<p>Excluded targets: ${esc(f.source.targets.exclude.join(", "))}.</p>`);
  return parts.length > 0 ? parts.join("\n") : "<p>No design declarations.</p>";
}

function checksTable(label: string, checks: Check[]): string {
  return table(
    label,
    ["Check", "Result", "Mode", "Value", "Limit", "Detail"],
    checks.map((c) => [
      rowHead(text(c.id)),
      td(outcomeWord(outcome(c))),
      td(c.mode ?? ""),
      td(c.value === undefined ? "" : fmtValue(c.value), "num"),
      td(c.limit === undefined ? "" : fmtValue(c.limit), "num"),
      td(text(c.detail) + (c.waived ? `<br><span class="aside">Waived: ${text(c.waived)}</span>` : ""), "detail"),
    ]),
  );
}

function profileSection(site: Site, profile: string, p: ProfileReport): string {
  const id = `env-${profile}`;
  const why = (site.thresholds.profiles as Record<string, { why?: string }> | undefined)?.[profile]?.why;
  const parts = [`<h3 id="${id}">${esc(profile)} ${profileChip(p.status)}</h3>`];
  if (why) parts.push(`<p class="aside">${text(why)}</p>`);
  if (p.status === "external") {
    parts.push("<p>This profile renders a specimen in a browser. It runs in tests/environments/forced-colors.test.ts, not on the tokens.</p>");
  } else if (p.status === "not-implemented") {
    parts.push("<p>No runner exists for this profile yet.</p>");
  } else {
    const info = p.checks.filter((c) => c.report).length;
    parts.push(`<p>${plural(p.errors, "error")}, ${plural(p.warnings, "warning")}, ${p.waived} waived. ${plural(p.checks.length, "check")}${info > 0 ? `, ${info} of them information only` : ""}.</p>`);
    const notable = p.checks.filter((c) => !c.ok && !c.report);
    parts.push(notable.length > 0 ? checksTable(`${profile}: checks that fail, warn or are waived`, notable) : "<p>No check fails, warns or is waived.</p>");
    parts.push(`<details><summary>All ${plural(p.checks.length, "check")}</summary>\n${checksTable(`${profile}: all checks`, p.checks)}\n</details>`);
  }
  return `<section class="profile" aria-labelledby="${id}">\n${parts.join("\n")}\n</section>`;
}

function candidateLinks(group: Group, entry: Entry): string {
  return [group.main, ...group.candidates]
    .map((e) => {
      const name = e.candidate ?? "the family's token file";
      return e === entry ? `${esc(name)} (this page)` : `<a href="${e.scope}.html">${esc(name)}</a>`;
    })
    .join(", ");
}

export function familyPage(site: Site, group: Group, entry: Entry): string {
  const f = entry.family;
  const meta = f.meta;
  const typography = Object.entries(f.source.typography ?? {});
  const files = [
    `<a href="../${entry.file}">${code(entry.file)}</a>`,
    ...(group.docs.readme ? [`<a href="../${group.docs.readme}">README</a>`] : []),
    ...(group.docs.changelog ? [`<a href="../${group.docs.changelog}">changelog</a>`] : []),
  ];
  const facts: [string, string][] = [
    ["Version", `${esc(meta.version)}${meta.formerly ? `, formerly ${esc(meta.formerly.name)} ${esc(meta.formerly.version)}` : ""}`],
    ["Chapter", esc(chapterLine(f))],
    ["Goal", text(meta.goal)],
    ["Environments", tags(meta.environments)],
    ["Typography", typography.length > 0 ? typography.map(([role, name]) => `${esc(name)} (${esc(role)})`).join(", ") : "None named; the system typefaces stand in."],
    ["Files", files.join(", ")],
  ];
  if (group.candidates.length > 0) facts.push(["Candidates", candidateLinks(group, entry)]);

  const chapterRef =
    meta.chapter === undefined ? "" : Array.isArray(meta.chapter) ? `, chapters ${meta.chapter[0]} and ${meta.chapter[1]}` : `, chapter ${meta.chapter}`;
  const head = [
    '<header class="page-head">',
    '<nav class="crumbs" aria-label="Pages"><a href="index.html">All families</a></nav>',
    entry.candidate
      ? `<p class="note">Candidate ${esc(entry.candidate)} for ${esc(meta.name)}, from ${code(entry.file)}. A proposal under review, not the family's token file, which is on <a href="${group.main.scope}.html">the ${esc(group.main.family.meta.name)} page</a>.</p>`
      : "",
    `<h1>${esc(meta.name)}${entry.candidate ? `, candidate ${esc(entry.candidate)}` : ""}</h1>`,
    meta.tagline ? `<p class="tagline">${text(meta.tagline)}</p>` : "",
    meta.quote ? `<figure class="quote"><blockquote><p>${text(meta.quote)}</p></blockquote><figcaption>Moby-Dick${chapterRef}</figcaption></figure>` : "",
    `<dl class="facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`,
    '<nav class="toc" aria-label="On this page"><a href="#colours">Colours</a> <a href="#declarations">Declarations</a> <a href="#environments">Environments</a></nav>',
    "</header>",
  ];

  const views = site.views
    .map((v) => `<label><input type="radio" name="view" value="${v.id}"${v.id === "normal" ? " checked" : ""}> ${esc(v.label)}</label>`)
    .join("\n");
  const colours = [
    '<section id="colours" aria-labelledby="colours-h">',
    '<h2 id="colours-h">Colours</h2>',
    '<div class="sim">',
    `<fieldset class="views">\n<legend>View both modes as</legend>\n${views}\n</fieldset>`,
    `<div class="panels">\n${MODES.map((m) => panel(site, group, entry, m)).join("\n")}\n</div>`,
    "</div>",
    filtersSvg(site.views),
    "</section>",
  ];

  const declarations = [
    '<section id="declarations" aria-labelledby="declarations-h">',
    '<h2 id="declarations-h">Declarations</h2>',
    "<h3>Declared pairs</h3>",
    pairsTable(site, entry),
    "<h3>Distinct sets</h3>",
    distinctTable(f),
    "<h3>Rules</h3>",
    rulesTable(f),
    "<h3>Design</h3>",
    designSummary(entry),
    "</section>",
  ];

  const environments = [
    '<section id="environments" aria-labelledby="environments-h">',
    '<h2 id="environments-h">Environments</h2>',
    `<p>The harness report for ${code(entry.file)}, profile by profile.</p>`,
    ...Object.entries(entry.report.profiles).map(([profile, p]) => profileSection(site, profile, p)),
    "</section>",
  ];

  const body = [
    ...head,
    '<main id="main">',
    ...colours,
    ...declarations,
    ...environments,
    "</main>",
    `<footer class="page-foot"><p>Built by scripts/pages/build.ts from ${code(entry.file)}. A local preview for review, not the site.</p></footer>`,
  ];
  const stylesheets = ["assets/tokens.css", "assets/pages.css", ...(group.specimen?.css ? [`assets/specimen-${group.id}.css`] : [])];
  const title = `${meta.name}${entry.candidate ? `, candidate ${entry.candidate}` : ""} ${meta.version}: Ensigns family page`;
  return htmlDocument(title, stylesheets, body.filter(Boolean).join("\n"));
}

// The index -------------------------------------------------------------------

/** The roles that show a family at a glance, then its named hues and its categorical colours, each colour once. */
function stripAddresses(m: ResolvedMode): string[] {
  const wanted = ["roles.bg", "roles.surface", "roles.border", "roles.text-muted", "roles.text", "roles.accent", "roles.link", "roles.button"];
  for (const a of m.colours.keys()) if (a.startsWith("accents.") || a.startsWith("data.categorical.")) wanted.push(a);
  const seen = new Set<string>();
  return wanted.filter((a) => {
    const c = m.colours.get(a)!;
    const key = `${c.hex}/${c.alpha ?? 1}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function card(group: Group): string {
  const e = group.main;
  const f = e.family;
  const id = `card-${group.id}`;
  const strips = MODES.map(
    (m) =>
      `<div class="strip-row"><span class="strip-label">${esc(modeTitle(m, f.modes[m].label))}</span><span class="strip" data-scope="${e.scope}" data-mode="${m}" aria-hidden="true">${stripAddresses(f.modes[m])
        .map((a) => `<span class="sw-${addressClass(a)}"></span>`)
        .join("")}</span></div>`,
  ).join("");
  const profiles = Object.entries(e.report.profiles).map(([profile, r]) => `<li>${profileChip(r.status, profile)}</li>`).join("");
  return [
    `<li class="card"><article aria-labelledby="${id}">`,
    `<h2 id="${id}"><a href="${e.scope}.html">${esc(f.meta.name)}</a></h2>`,
    `<p class="card-meta">${esc(f.meta.version)}${f.meta.formerly ? `, formerly ${esc(f.meta.formerly.name)}` : ""}. ${esc(chapterLine(f))}.</p>`,
    `<p>${text(f.meta.goal)}</p>`,
    tags(f.meta.environments),
    `<ul class="chips" aria-label="Profiles">${profiles}</ul>`,
    `<div class="strips">${strips}</div>`,
    group.candidates.length > 0 ? `<p>Candidates: ${group.candidates.map((c) => `<a href="${c.scope}.html">${esc(c.candidate!)}</a>`).join(", ")}.</p>` : "",
    "</article></li>",
  ]
    .filter(Boolean)
    .join("\n");
}

export function indexPage(site: Site): string {
  const body = [
    '<header class="page-head">',
    "<h1>Ensigns family pages</h1>",
    '<p class="intro">Every family in the repository, in book order, built from its token file with its harness report. A family that has not been added yet is missing. This is a local preview for review, not the site.</p>',
    "</header>",
    '<main id="main">',
    `<ul class="cards">\n${site.groups.map(card).join("\n")}\n</ul>`,
    "</main>",
    '<footer class="page-foot"><p>Built by scripts/pages/build.ts from the token files.</p></footer>',
  ];
  return htmlDocument("Ensigns family pages", ["assets/tokens.css", "assets/pages.css"], body.join("\n"));
}

// Standalone specimens ----------------------------------------------------------

/** The family's specimen alone, once, in one mode: what the forced-colours test loads. */
export function standalonePage(group: Group, entry: Entry, mode: ModeName): string {
  const f = entry.family;
  const title = `${f.meta.name}${entry.candidate ? `, candidate ${entry.candidate}` : ""}: specimen, ${modeTitle(mode, f.modes[mode].label)}`;
  const stylesheets = ["../assets/tokens.css", "../assets/standalone.css", ...(group.specimen?.css ? [`../assets/specimen-${group.id}.css`] : [])];
  const body = `<main>\n<div class="specimen specimen-${group.id}">\n${group.specimen!.html.replaceAll("{mode}", mode)}\n</div>\n</main>`;
  return htmlDocument(title, stylesheets, body, ` data-scope="${entry.scope}" data-mode="${mode}"`);
}
