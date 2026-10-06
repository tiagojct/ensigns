// What a sample card says about a family: the contrast of the roles a reader meets first.
// Pure, so the build and the comparison panels print the same numbers.
import { contrastRatio } from '../../lib/colour/wcag.ts';
import { at } from '../../lib/model/resolve.ts';
import type { ResolvedFamily } from '../../lib/model/types.ts';

export interface Measure { label: string; ratio: string; grade: string }

/** The text every sample card shows. The tests check the quotation against the book. */
export const SAMPLE = {
  heading: 'Call me Ishmael.',
  quote: 'I thought I would sail about a little and see the watery part of the world.',
  cite: 'Moby-Dick, chapter 1',
};

/** The rows of a sample card's measures list. Labels and numbers are fixed strings, so nothing needs escaping. */
export const measuresHtml = (measures: Measure[]) =>
  measures.map((m) => `<div><dt>${m.label}</dt><dd>${m.ratio}</dd><dd class="grade">${m.grade}</dd></div>`).join('');

/** The WCAG level a ratio reaches. Text needs 4.5 for AA and 7 for AAA; a ring or an edge needs 3. */
export function grade(ratio: number, kind: 'text' | 'component'): string {
  if (kind === 'component') return ratio >= 3 ? 'AA' : 'below AA';
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'below AA';
}

export function sampleMeasures(f: ResolvedFamily, mode: 'light' | 'dark'): Measure[] {
  const m = f.modes[mode];
  const row = (label: string, fg: string, bg: string, kind: 'text' | 'component'): Measure => {
    const value = contrastRatio(at(m, fg).hex, at(m, bg).hex);
    return { label, ratio: `${value.toFixed(2)}:1`, grade: grade(value, kind) };
  };
  return [
    row('Text', 'roles.text', 'roles.bg', 'text'),
    row('Link', 'roles.link', 'roles.bg', 'text'),
    row('Button label', 'roles.on-button', 'roles.button', 'text'),
    row('Focus ring', 'roles.focus', 'roles.bg', 'component'),
  ];
}
