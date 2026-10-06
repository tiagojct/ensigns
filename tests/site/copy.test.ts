// The words on the site are checked against the patterns that mark generated prose. A hit is a
// sentence to rewrite, not a rule to relax. Each rule says what it looks for. The pages are
// rendered in memory and the review pages go to a temporary folder, so nothing here writes
// anything the other site tests read.
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildPages } from "../../scripts/pages/generate.ts";
import { catalogueEntries } from "../../scripts/site/build.ts";
import { pages } from "../../scripts/site/render.ts";
import { repoRoot } from "../../lib/model/load.ts";

const RULES: { id: string; re: RegExp }[] = [
  { id: "It's not X, it's Y", re: /\bit(?:'|’)s not\b[^.]{0,80}\bit(?:'|’)s\b/i },
  { id: "not just X but Y", re: /\bnot (?:just|only|merely) [^.]{1,80}\bbut\b/i },
  { id: "not because X, but because Y", re: /\bnot because\b[^.]{1,80}\bbut because\b/i },
  { id: "X is not Y, it is Z", re: /\b(?:is|are) not [^.,;]{1,60}[,;] (?:it|this|that) is\b/i },
  { id: "Not X. Not Y.", re: /\bNot [^.]{1,40}\. Not [^.]{1,40}\./ },
  { id: "magic adverb", re: /\b(?:quietly|deeply|fundamentally|remarkably|seamlessly|effortlessly|truly)\b/i },
  { id: "inflated word", re: /\b(?:delve|leverage[sd]?|leveraging|robust|streamlin\w*|tapestry|ecosystem|paradigm|cutting-edge|game-chang\w*|unlock\w*|elevate[sd]?|empower\w*|holistic|synerg\w*|testament)\b/i },
  { id: "serves as, stands as", re: /\b(?:serves|stands) as\b/i },
  { id: "filler transition", re: /\b(?:it(?:'|’)s worth noting|it is worth noting|worth noting that|importantly,|interestingly,|here(?:'|’)s the thing|let(?:'|’)s break this down|in conclusion,|in summary,|at the end of the day|needless to say)/i },
  { id: "participle tail", re: /, (?:highlighting|underscoring|showcasing|cementing|solidifying)\b/i },
  { id: "stock phrase", re: /\bwith a purpose\b|\bjourney\b|\bnext[- ]level\b|\bworld-class\b|\bstate-of-the-art\b|\bbest-in-class\b|\bdeep dive\b|\bdive into\b|\bsupercharg\w+|\bat your fingertips\b|\bone-stop\b|\ball-in-one\b/i },
  { id: "arrow", re: /[→←↔⇒⟶]/ },
  { id: "curly quote", re: /[“”‘’]/ },
  { id: "emoji", re: /\p{Extended_Pictographic}/u },
];

/** The words a reader sees. Code, scripts, styles, drawings and the verbatim quotations are left out. */
function visibleText(html: string): string {
  return html
    .replace(/<(script|style|svg|pre|code|blockquote)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findings(label: string, html: string): string[] {
  const text = visibleText(html);
  const out: string[] = [];
  for (const { id, re } of RULES) {
    const m = re.exec(text);
    if (m) out.push(`${label}: ${id}: "${text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40)}"`);
  }
  if ((text.match(/—/g) ?? []).length > 2) out.push(`${label}: more than two em dashes`);
  for (const h of html.matchAll(/<h[1-3][^>]*>([^<]*\?)<\/h[1-3]>/g)) out.push(`${label}: heading that asks a question: "${h[1]}"`);
  return out;
}

function* htmlFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (name.endsWith(".html")) yield path;
  }
}

describe("the words on the site", () => {
  it("carry no marker of generated prose in any page", () => {
    const { entries } = catalogueEntries();
    const offenders = [...pages(entries, "1.0.0")].flatMap(([path, html]) => findings(path, html));
    expect(offenders).toEqual([]);
  }, 60000);

  it("carry none in the review pages and the specimens", () => {
    const out = mkdtempSync(join(tmpdir(), "ensigns-copy-"));
    try {
      buildPages(repoRoot(), out);
      const offenders = [...htmlFiles(out)].flatMap((file) => findings(file.slice(out.length), readFileSync(file, "utf8")));
      expect(offenders).toEqual([]);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 60000);

  it("catches what it claims to", () => {
    expect(findings("t", "<p>It's not a palette, it's a system.</p>")).toHaveLength(1);
    expect(findings("t", "<p>A quietly robust design that serves as a landmark.</p>").length).toBeGreaterThanOrEqual(3);
    expect(findings("t", "<h2>Why ten?</h2><p>Because.</p>")).toHaveLength(1);
    expect(findings("t", "<p>Make an export →</p>")).toHaveLength(1);
    expect(findings("t", "<p>One — two — three — four.</p>")).toHaveLength(1);
    expect(findings("t", "<pre>quietly robust</pre><blockquote>It’s not, it’s</blockquote><p>Plain words.</p>")).toEqual([]);
  });
});
