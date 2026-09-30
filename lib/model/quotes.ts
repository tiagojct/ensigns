// Quotations from Moby-Dick must be verbatim from the public-domain text in
// sources/moby-dick.txt (Project Gutenberg eBook #2701). The file marks
// italics with underscores and uses curly quotes, so a comparison normalises
// both sides first. Pure: the caller reads the file.

/** Strip italic markers, treat curly and straight quotes as equal, collapse white space. */
export function normaliseQuote(s: string): string {
  return s
    .replace(/_/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export interface ChapterText {
  number: number;
  /** Heading text without the number and the closing full stop. */
  title: string;
  /** Normalised body text of the chapter. */
  text: string;
}

const HEADING = /^CHAPTER (\d+)\. (.+?)\.?\s*$/gm;

/**
 * Chapters of the body. The text lists every heading twice, once in the
 * table of contents and once in the body; the last occurrence is the body.
 * The Epilogue is returned as chapter 136.
 */
export function parseChapters(raw: string): Map<number, ChapterText> {
  const start = raw.indexOf("*** START OF");
  const end = raw.indexOf("*** END OF");
  const body = raw.slice(start < 0 ? 0 : start, end < 0 ? raw.length : end);
  const heads: { number: number; title: string; index: number; after: number }[] = [];
  for (const m of body.matchAll(HEADING)) {
    heads.push({ number: Number(m[1]), title: m[2]!, index: m.index!, after: m.index! + m[0].length });
  }
  const last = new Map<number, (typeof heads)[number]>();
  for (const h of heads) last.set(h.number, h);
  const ordered = [...last.values()].sort((a, b) => a.index - b.index);
  const epilogue = [...body.matchAll(/^Epilogue\s*$/gm)].at(-1);
  const out = new Map<number, ChapterText>();
  ordered.forEach((h, i) => {
    const next = ordered[i + 1];
    const stop = next ? next.index : epilogue ? epilogue.index! : body.length;
    out.set(h.number, { number: h.number, title: h.title, text: normaliseQuote(body.slice(h.after, stop)) });
  });
  if (epilogue) out.set(136, { number: 136, title: "Epilogue", text: normaliseQuote(body.slice(epilogue.index! + epilogue[0].length)) });
  return out;
}

export function quoteIsIn(chapter: ChapterText | undefined, quote: string): boolean {
  return chapter !== undefined && chapter.text.includes(normaliseQuote(quote));
}
