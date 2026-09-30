// Every quotation is verbatim from sources/moby-dick.txt and sits in the
// chapter the family names.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { normaliseQuote, parseChapters, quoteIsIn } from "../../lib/model/quotes.ts";

const raw = readFileSync(join(repoRoot(), "sources", "moby-dick.txt"), "utf8");
const chapters = parseChapters(raw);
const families = loadFamilies();

describe("the source text", () => {
  it("parses all 135 chapters and the Epilogue", () => {
    expect(chapters.size).toBe(136);
    expect(chapters.get(1)?.title).toBe("Loomings");
    expect(chapters.get(135)?.title).toBe("The Chase.—Third Day");
  });

  it("normalises Gutenberg italics and curly quotes", () => {
    expect(normaliseQuote("a _clean_ one")).toBe("a clean one");
    expect(normaliseQuote("the Town-Ho’s Story")).toBe("the Town-Ho's Story");
    expect(normaliseQuote("one\n   two")).toBe("one two");
  });

  it("finds the chapter 81 phrase the brief quotes, which the file sets in italics", () => {
    expect(quoteIsIn(chapters.get(81), "a clean one (that is, an empty one)")).toBe(true);
  });

  it("rejects a paraphrase", () => {
    expect(quoteIsIn(chapters.get(52), "bleached like the skeleton of a stranded whale")).toBe(false);
    expect(quoteIsIn(chapters.get(52), "furred over with hoarfrost")).toBe(false);
  });
});

describe("family quotations", () => {
  for (const f of families) {
    const meta = f.file.meta;
    describe(f.dir, () => {
      if (meta.host) {
        it("is the host, so a chapter and a quote are optional", () => {
          expect(meta.host).toBe(true);
        });
      } else {
        it("names a chapter, a title and a quote", () => {
          expect(meta.chapter).toBeDefined();
          expect(meta.chapterTitle).toBeTruthy();
          expect(meta.quote).toBeTruthy();
        });
      }

      if (meta.chapter !== undefined) {
        const numbers = Array.isArray(meta.chapter) ? meta.chapter : [meta.chapter];
        it("has a chapter title that matches the headings of its chapters", () => {
          const titles = numbers.map((n) => chapters.get(n)?.title ?? "");
          const want = normaliseQuote(titles.join("; ")).toLowerCase();
          expect(normaliseQuote(meta.chapterTitle ?? "").toLowerCase()).toBe(want);
        });

        if (meta.quote) {
          it("has a primary quote that is verbatim and inside its chapter", () => {
            const inside = numbers.some((n) => quoteIsIn(chapters.get(n), meta.quote!));
            expect(inside, `"${meta.quote}" in chapter ${numbers.join(" or ")}`).toBe(true);
          });
        }
      }

      for (const q of meta.quotes ?? []) {
        it(`has a further quote that is verbatim: "${q.text.slice(0, 40)}"`, () => {
          const n = typeof q.chapter === "number" ? q.chapter : typeof q.chapter === "string" && /^\d+$/.test(q.chapter) ? Number(q.chapter) : undefined;
          if (n !== undefined) expect(quoteIsIn(chapters.get(n), q.text), `chapter ${n}`).toBe(true);
          else expect(normaliseQuote(raw)).toContain(normaliseQuote(q.text));
        });
      }
    });
  }
});

// Quotation marks promise the reader Melville's words. In a README, a model document or a family's
// specimen, any quoted span of four words or more is found in the text or listed, with a reason, in
// quotes-allowlist.json.
describe("quotations in documents", () => {
  const root = repoRoot();
  const allow = JSON.parse(readFileSync(join(root, "tests/shared/quotes-allowlist.json"), "utf8")) as Record<string, string>;
  const body = normaliseQuote(raw);

  const documents = ["README.md", "CLAUDE.md", "docs/model.md", "legacy/README.md", "scripts/migrate/README.md"];
  for (const dir of readdirSync(join(root, "families"))) {
    for (const doc of [join("families", dir, "README.md"), join("families", dir, "specimen", "specimen.html")]) {
      if (existsSync(join(root, doc))) documents.push(doc);
    }
  }

  /** A specimen is an HTML fragment: its text without the tags, with the entities for quotation marks read as the marks. */
  const textOf = (doc: string, source: string): string =>
    doc.endsWith(".html")
      ? source
          .replace(/<[^>]*>/g, " ")
          .replace(/&(?:quot|#34);/g, '"')
          .replace(/&(?:ldquo|#8220);/g, "\u201c")
          .replace(/&(?:rdquo|#8221);/g, "\u201d")
          .replace(/\s+/g, " ")
      : source;

  function quotedSpans(markdown: string): string[] {
    const plain = markdown.replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ");
    const spans: string[] = [];
    for (const m of plain.matchAll(/"([^"\n]{10,})"|\u201c([^\u201d\n]{10,})\u201d/g)) spans.push((m[1] ?? m[2])!);
    return spans.filter((s) => s.trim().split(/\s+/).length >= 4);
  }

  for (const doc of documents) {
    it(`${doc} quotes only Moby-Dick verbatim, or says why not`, () => {
      const offenders = quotedSpans(textOf(doc, readFileSync(join(root, doc), "utf8")))
        .filter((s) => !body.includes(normaliseQuote(s).replace(/[.,;:!?]+$/, "")) && !(s in allow))
        .map((s) => `${relative(root, join(root, doc))}: "${s}"`);
      expect(offenders).toEqual([]);
    });
  }

  it("gives every allowlist entry a reason", () => {
    for (const [quote, why] of Object.entries(allow)) expect(why.length, quote).toBeGreaterThan(20);
  });
});
