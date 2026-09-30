// Enderby 0.1.0: the specimen. Writes families/enderby/specimen/specimen.html and specimen.css.
//
// Six figures in inline SVG (bar, line, scatter, heatmap, diverging heatmap, small multiples), a key to the
// markers and dash patterns, and the scales as strips. The data are invented and come from a seeded generator,
// so the output is the same on every run. Colours reach the page only as the custom properties the page builder
// writes from the token file (--data-categorical-c1, --data-sequential-lagoon-3, --data-plot-text and so on).
// The markers and dash patterns come from design.markers and design.lines. The ramp steps that get an outline
// are the ones that fall below 3:1 on the figure ground in either mode, read from the resolved colours.
//
//   node scripts/design/enderby-specimen.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { LUMINANCE_WEIGHTS, contrastRatio } from "../../lib/colour/wcag.ts";
import { readJson, repoRoot } from "../../lib/model/load.ts";
import { resolveFamily } from "../../lib/model/resolve.ts";
import type { FamilyFile } from "../../lib/model/types.ts";

const root = repoRoot();
const file = readJson(join(root, "families/enderby/enderby.tokens.json")) as FamilyFile;
const fam = resolveFamily(file);
const design = file.design as unknown as {
  markers: Record<string, { shape: string; fill: string }>;
  lines: Record<string, { name: string; dash: number[] }>;
};
const RAMPS = { sequential: Object.keys(file.modes.light.data && "sequential" in file.modes.light.data ? file.modes.light.data.sequential ?? {} : {}), diverging: Object.keys(file.modes.light.data && "diverging" in file.modes.light.data ? file.modes.light.data.diverging ?? {} : {}) };
const SHORT: Record<string, string> = { "blue-orange": "bo", "teal-brass": "tb" };
const short = (name: string) => SHORT[name] ?? name;

// ---------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------
const n1 = (x: number) => String(Math.round(x * 10) / 10);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
const linear = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

const svg = (label: string, w: number, h: number, inner: string) => `<svg class="sp-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${inner}</svg>`;
const rect = (x: number, y: number, w: number, h: number, cls: string) => `<rect class="${cls}" x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}"/>`;
const line = (x1: number, y1: number, x2: number, y2: number, cls: string) => `<line class="${cls}" x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}"/>`;
const text = (x: number, y: number, s: string, cls: string, anchor?: "end" | "middle") => `<text class="${cls}" x="${n1(x)}" y="${n1(y)}"${anchor ? ` text-anchor="${anchor}"` : ""}>${esc(s)}</text>`;
const path = (d: string, cls: string) => `<path class="${cls}" d="${d}"/>`;
const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${n1(x)} ${n1(y)}`).join(" ");

/** The marker of series i at (cx, cy), from design.markers. */
function marker(i: number, cx: number, cy: number, r = 3.6): string {
  const m = design.markers[String(i)]!;
  const cls = `sp-mk sp-c${i} sp-mk-${m.fill}`;
  switch (m.shape) {
    case "circle": return `<circle class="${cls}" cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}"/>`;
    case "square": return rect(cx - r, cy - r, 2 * r, 2 * r, cls);
    case "triangle-up": return path(`M${n1(cx)} ${n1(cy - 1.2 * r)} L${n1(cx + 1.05 * r)} ${n1(cy + 0.85 * r)} L${n1(cx - 1.05 * r)} ${n1(cy + 0.85 * r)} Z`, cls);
    default: return path(`M${n1(cx)} ${n1(cy - 1.25 * r)} L${n1(cx + 1.25 * r)} ${n1(cy)} L${n1(cx)} ${n1(cy + 1.25 * r)} L${n1(cx - 1.25 * r)} ${n1(cy)} Z`, cls);
  }
}
/** Round tick values from 0 or from `lo` to `hi`. */
function ticks(lo: number, hi: number, step: number): number[] {
  const out: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

const W = 400;
/** The frame of a chart: the panel, horizontal grid lines with their labels, and the x axis line. */
function frame(x0: number, x1: number, y0: number, y1: number, yTicks: number[], y: (v: number) => number, yTitle: string): string {
  let s = rect(x0, y0, x1 - x0, y1 - y0, "sp-panel");
  for (const t of yTicks) {
    s += line(x0, y(t), x1, y(t), t === yTicks[0] ? "sp-axis" : "sp-grid");
    s += text(x0 - 6, y(t) + 3.5, String(t), "sp-tick", "end");
  }
  s += text(x0 - 6, y0 - 9, yTitle, "sp-axis-title");
  return s;
}

// ---------------------------------------------------------------------------------------------
// The six figures
// ---------------------------------------------------------------------------------------------
function bar(): string {
  const data: [string, number][] = [["A", 86], ["B", 77], ["C", 71], ["D", 64], ["E", 52], ["F", 47], ["G", 35], ["H", 24]];
  const x0 = 46, x1 = W - 14, y0 = 28, y1 = 214;
  const y = linear(0, 100, y1, y0);
  let s = frame(x0, x1, y0, y1, ticks(0, 100, 20), y, "Median wait, days");
  const band = (x1 - x0) / data.length;
  data.forEach(([k, v], i) => {
    const bx = x0 + i * band + (band - 30) / 2;
    s += rect(bx, y(v), 30, y1 - y(v), `sp-bar sp-c${i + 1}`);
    s += text(bx + 15, y(v) - 5, String(v), "sp-value", "middle");
    s += text(bx + 15, y1 + 15, k, "sp-tick", "middle");
  });
  s += text((x0 + x1) / 2, y1 + 32, "Site", "sp-axis-title", "middle");
  return svg("Bar chart of the median wait at eight sites, from 86 days at site A to 24 days at site H", W, 250, s);
}

function lines(): string {
  const x0 = 46, x1 = W - 74, y0 = 28, y1 = 214;
  const y = linear(0, 100, y1, y0);
  const x = linear(0, 11, x0 + 8, x1 - 8);
  const base = [74, 60, 47, 35, 22], amp = [9, 7, 11, 6, 5], phase = [0.3, 1.4, 2.6, 0.9, 2.0], trend = [0.5, -0.4, 0.6, 0.3, 0.7];
  const series = base.map((b, k) => Array.from({ length: 12 }, (_, m) => b + amp[k]! * Math.sin((2 * Math.PI * m) / 12 + phase[k]!) + trend[k]! * m));
  let s = frame(x0, x1, y0, y1, ticks(0, 100, 20), y, "Admissions, hundreds");
  ["Jan", "Mar", "May", "Jul", "Sep", "Nov"].forEach((m, i) => { s += text(x(i * 2), y1 + 15, m, "sp-tick", "middle"); });
  const ends = series.map((v, k) => ({ k, y: y(v[11]!) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i]!.y - ends[i - 1]!.y < 13) ends[i]!.y = ends[i - 1]!.y + 13;
  series.forEach((v, k) => {
    const pts = v.map((val, m) => [x(m), y(val)] as [number, number]);
    s += path(poly(pts), `sp-line sp-c${k + 1} sp-ln-${k + 1}`);
    pts.forEach(([px, py], m) => { if (m % 2 === 0 || m === 11) s += marker(k + 1, px, py, 3.3); });
  });
  for (const e of ends) s += text(x1 + 6, e.y + 3.5, `Clinic ${e.k + 1}`, "sp-label");
  return svg("Line chart of monthly admissions for five clinics over twelve months; each line has its own marker and dash pattern and is named at its right end", W, 250, s);
}

function scatter(): string {
  const r = rng(11);
  const x0 = 46, x1 = W - 14, y0 = 28, y1 = 196;
  const x = linear(150, 195, x0 + 6, x1 - 6);
  const y = linear(2, 6, y1, y0);
  let s = frame(x0, x1, y0, y1, ticks(2, 6, 1), y, "FEV1, litres");
  for (const t of ticks(150, 190, 10)) s += text(x(t), y1 + 15, String(t), "sp-tick", "middle");
  s += text((x0 + x1) / 2, y1 + 31, "Height, cm", "sp-axis-title", "middle");
  const groups = [{ i: 1, off: 0.1 }, { i: 2, off: 0.65 }, { i: 3, off: -0.45 }];
  for (const g of groups) {
    for (let n = 0; n < 22; n++) {
      const h = 152 + r() * 40;
      const v = 0.052 * (h - 150) + 2.6 + g.off + gauss(r) * 0.3;
      s += marker(g.i, x(h), y(Math.min(5.8, Math.max(2.1, v))), 3.4);
    }
  }
  let lx = x0;
  for (const [i, name] of [[1, "Group A"], [2, "Group B"], [3, "Group C"]] as const) {
    s += marker(i, lx + 6, y1 + 46, 3.4) + text(lx + 15, y1 + 50, name, "sp-label");
    lx += 86;
  }
  return svg("Scatter plot of FEV1 against height for three groups; circles, squares and triangles mark the groups", W, 262, s);
}

const STEPS = 9;
const cell = (cls: string, x: number, yy: number, w: number, h: number) => rect(x, yy, w, h, cls);

function heatmap(): string {
  const r = rng(5);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const x0 = 46, y0 = 14, cw = 26, ch = 26, gap = 2;
  let s = "";
  days.forEach((d, row) => {
    s += text(x0 - 7, y0 + row * (ch + gap) + ch / 2 + 3.5, d, "sp-tick", "end");
    for (let hcol = 0; hcol < 12; hcol++) {
      const weekday = row < 5;
      const v = (weekday ? 100 : 34) * Math.exp(-((hcol - 3.5 - (row % 2)) ** 2) / 9) + (weekday ? 0 : 16 * Math.exp(-((hcol - 7) ** 2) / 12)) + r() * 12;
      const step = Math.min(STEPS, Math.max(1, 1 + Math.floor((Math.min(v, 99.9) / 100) * STEPS)));
      s += cell(`sp-cell sp-x-lagoon-${step}`, x0 + hcol * (cw + gap), y0 + row * (ch + gap), cw, ch);
    }
  });
  const yb = y0 + 7 * (ch + gap);
  for (let hcol = 0; hcol < 12; hcol += 2) s += text(x0 + hcol * (cw + gap) + cw / 2, yb + 13, String(8 + hcol), "sp-tick", "middle");
  s += text(x0 + 6 * (cw + gap) - gap / 2, yb + 30, "Hour of day", "sp-axis-title", "middle");
  const ly = yb + 44;
  for (let k = 1; k <= STEPS; k++) s += cell(`sp-cell sp-x-lagoon-${k}`, x0 + (k - 1) * 30, ly, 30, 12);
  s += text(x0, ly + 26, "0", "sp-tick") + text(x0 + 270, ly + 26, "100", "sp-tick", "end") + text(x0 + 135, ly + 26, "Appointments per hour", "sp-axis-title", "middle");
  return svg("Heatmap of appointments by weekday and hour on the lagoon ramp; weekday mornings are busiest", W, ly + 34, s);
}

function divergingHeatmap(): string {
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const n = labels.length;
  const x0 = 46, y0 = 14, size = 34, gap = 2;
  const value = (i: number, j: number) => (i === j ? 1 : Math.max(-0.95, Math.min(0.95, 0.85 * Math.sin((Math.min(i, j) + 1) * (Math.max(i, j) + 2) * 1.37) * Math.exp(-Math.abs(i - j) / 7))));
  let s = "";
  labels.forEach((a, i) => {
    s += text(x0 - 7, y0 + i * (size + gap) + size / 2 + 3.5, a, "sp-tick", "end");
    labels.forEach((_, j) => {
      const step = Math.min(STEPS, Math.max(1, 1 + Math.floor(((value(i, j) + 1) / 2) * STEPS * 0.9999)));
      s += cell(`sp-cell sp-x-bo-${step}`, x0 + j * (size + gap), y0 + i * (size + gap), size, size);
    });
  });
  const yb = y0 + n * (size + gap);
  labels.forEach((b, j) => { s += text(x0 + j * (size + gap) + size / 2, yb + 13, b, "sp-tick", "middle"); });
  const ly = yb + 30;
  for (let k = 1; k <= STEPS; k++) s += cell(`sp-cell sp-x-bo-${k}`, x0 + (k - 1) * 32, ly, 32, 12);
  s += text(x0, ly + 26, "-1", "sp-tick") + text(x0 + 144, ly + 26, "0", "sp-tick", "middle") + text(x0 + 288, ly + 26, "+1", "sp-tick", "end");
  s += text(x0 + 144, ly + 42, "Correlation between indicators", "sp-axis-title", "middle");
  return svg("Diverging heatmap of the correlation between eight indicators on the blue to orange ramp; the neutral centre is zero", W, ly + 50, s);
}

function multiples(): string {
  const r = rng(23);
  const cols = 3, pw = 108, ph = 92, gx = 12, gy = 34, x0 = 40, y0 = 22;
  const y = linear(0, 100, ph, 0);
  const x = linear(0, 9, 4, pw - 4);
  const all = Array.from({ length: 6 }, (_, k) => Array.from({ length: 10 }, (_, t) => 30 + 6 * k + 18 * Math.sin((t + k) / 2.2) + t * (k % 3) * 1.4 + gauss(r) * 3));
  let s = "";
  for (let p = 0; p < 6; p++) {
    const px = x0 + (p % cols) * (pw + gx);
    const py = y0 + Math.floor(p / cols) * (ph + gy);
    let g = rect(0, 0, pw, ph, "sp-panel");
    for (const t of [0, 50, 100]) {
      g += line(0, y(t), pw, y(t), t === 0 ? "sp-axis" : "sp-grid");
      if (p % cols === 0) g += text(-5, y(t) + 3.5, String(t), "sp-tick", "end");
    }
    all.forEach((v, k) => { if (k !== p) g += path(poly(v.map((val, t) => [x(t), y(val)])), "sp-ctx"); });
    const focus = all[p]!;
    g += path(poly(focus.map((val, t) => [x(t), y(val)])), "sp-focus");
    g += `<circle class="sp-focus-dot" cx="${n1(x(9))}" cy="${n1(y(focus[9]!))}" r="3.2"/>`;
    g += text(0, -7, `Ward ${p + 1}`, "sp-label");
    if (p >= cols) for (const t of [0, 9]) g += text(x(t), ph + 14, String(t + 1), "sp-tick", "middle");
    s += `<g transform="translate(${px} ${py})">${g}</g>`;
  }
  s += text(x0 + (3 * pw + 2 * gx) / 2, y0 + 2 * ph + gy + 28, "Week", "sp-axis-title", "middle");
  return svg("Small multiples: weekly visits on six wards, one ward in the focus colour in each panel and the other five in the context grey", W, y0 + 2 * ph + gy + 34, s);
}

function key(): string {
  let s = "";
  for (let i = 1; i <= 8; i++) {
    const yy = 14 + (i - 1) * 21;
    s += path(`M12 ${yy} L56 ${yy}`, `sp-line sp-c${i} sp-ln-${i}`) + marker(i, 34, yy, 3.6);
    s += text(70, yy + 3.5, `c${i}, ${design.markers[String(i)]!.fill} ${design.markers[String(i)]!.shape}, ${design.lines[String(i)]!.name}`, "sp-label");
  }
  return svg("Key to the eight series: each has a colour, a marker and a dash pattern", W, 14 + 8 * 21, s);
}

// ---------------------------------------------------------------------------------------------
// Scales as strips
// ---------------------------------------------------------------------------------------------
const chip = (cls: string, tag: string) => `<li><span class="sp-chip ${cls}"></span><span class="sp-tag">${esc(tag)}</span></li>`;
function strip(label: string, items: string, extra = ""): string {
  return `<div class="sp-scale"><p class="sp-scale-name">${esc(label)}</p><ol class="sp-strip${extra}">${items}</ol></div>`;
}
function scales(): string {
  const cat = Array.from({ length: 8 }, (_, i) => chip(`sp-x-c${i + 1}`, `c${i + 1}`)).join("");
  const ramp = (name: string, tags: [string, string]) => Array.from({ length: STEPS }, (_, k) => chip(`sp-x-${short(name)}-${k + 1}`, k === 0 ? tags[0] : k === STEPS - 1 ? tags[1] : String(k + 1))).join("");
  let out = strip("Categorical", cat);
  out += strip("Categorical in greyscale", cat, " sp-grey");
  for (const name of RAMPS.sequential) out += strip(`Sequential ${name}`, ramp(name, ["low", "high"]));
  for (const name of RAMPS.diverging) out += strip(`Diverging ${name}`, ramp(name, ["-", "+"]));
  return out;
}

// ---------------------------------------------------------------------------------------------
// The page fragment
// ---------------------------------------------------------------------------------------------
/**
 * The greyscale strip needs a filter. The page's own views sit in a hidden svg that the standalone specimen pages do not
 * carry, so the fragment brings the same matrix: relative luminance in linear light, with the weights of lib/colour/wcag.ts.
 * The {mode} in the id is replaced by the builder, because a family page holds the fragment once per mode.
 */
const [wr, wg, wb] = LUMINANCE_WEIGHTS;
const greyFilter = `<svg class="sp-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="sp-grey-{mode}" x="0" y="0" width="1" height="1"><feColorMatrix type="matrix" color-interpolation-filters="linearRGB" values="${[wr, wg, wb, 0, 0, wr, wg, wb, 0, 0, wr, wg, wb, 0, 0, 0, 0, 0, 1, 0].join(" ")}"/></filter></svg>`;
const fig = (title: string, svgText: string, caption: string) => `<figure class="sp-fig"><h6 class="sp-title">${esc(title)}</h6>${svgText}<figcaption class="sp-caption">${esc(caption)}</figcaption></figure>`;
const html = [
  greyFilter,
  `<header class="sp-head">`,
  `<h5 class="sp-h">Figures from invented data</h5>`,
  `<p class="prose">Figures for papers, reports and dashboards. Every figure below uses invented data and only the colours of the family. On the family page, the view selector shows them under colour vision deficiency, in greyscale or under flare.</p>`,
  `<blockquote class="sp-quote"><p>"Most statistical tables are parchingly dry in the reading"</p><footer>Moby-Dick, chapter 101</footer></blockquote>`,
  `</header>`,
  `<div class="sp-figs">`,
  fig("Bar", bar(), "Median wait by site, in days. Each bar takes the next colour of the set, in order. The value sits above the bar, so no text sits on a colour."),
  fig("Line", lines(), "Monthly admissions at five clinics. Each line has the marker and the dash pattern of its number and its name at the right end, so the lines can be told apart without colour."),
  fig("Scatter", scatter(), "FEV1 against height for three groups of 22 invented measurements. Circle, square and triangle mark the groups as well as colour."),
  fig("Heatmap", heatmap(), "Appointments by weekday and hour, in the nine steps of the lagoon ramp. The steps below 3:1 on the ground carry the outline colour."),
  fig("Diverging heatmap", divergingHeatmap(), "Correlation between eight invented indicators on the blue to orange ramp. The neutral centre is zero, and the two sides stay apart under protan, deutan and tritan simulation."),
  fig("Small multiples", multiples(), "Weekly visits on six wards. Each panel shows one ward in the focus colour and the other five in the context grey."),
  fig("Series key", key(), "The marker and the dash pattern that each of the eight series takes."),
  `</div>`,
  `<section class="sp-scales"><h5 class="sp-h">Scales</h5>${scales()}</section>`,
].join("\n") + "\n";

// ---------------------------------------------------------------------------------------------
// The stylesheet. Colours only as custom properties; dash patterns from design.lines.
// ---------------------------------------------------------------------------------------------
const below = (name: string, kind: "sequential" | "diverging", step: number): boolean =>
  (["light", "dark"] as const).some((m) => {
    const colours = fam.modes[m].colours;
    return contrastRatio(colours.get(`data.${kind}.${name}.${step}`)!.hex, colours.get("data.plot.background")!.hex) < 3;
  });
const dash = (i: number) => { const d = design.lines[String(i)]!.dash; return d.length === 0 ? "none" : d.join(" "); };
let fills = "";
const edged: string[] = [];
for (const kind of ["sequential", "diverging"] as const) {
  for (const name of RAMPS[kind]) {
    for (let k = 1; k <= STEPS; k++) {
      const cls = `.sp-x-${short(name)}-${k}`;
      fills += `${cls} { fill: var(--data-${kind}-${name}-${k}); background-color: var(--data-${kind}-${name}-${k}); }\n`;
      if (below(name, kind, k)) edged.push(cls);
    }
  }
}
for (let i = 1; i <= 8; i++) fills += `.sp-x-c${i} { fill: var(--data-categorical-c${i}); background-color: var(--data-categorical-c${i}); }\n`;
const seriesColours = Array.from({ length: 8 }, (_, i) => `.sp-c${i + 1} { --sp-c: var(--data-categorical-c${i + 1}); }`).join("\n");
const dashes = Array.from({ length: 8 }, (_, i) => `.sp-ln-${i + 1} { stroke-dasharray: ${dash(i + 1)}; }`).join("\n");

const css = `/* Enderby specimen. Generated by scripts/design/enderby-specimen.ts.
   Colours come only from the custom properties the page builder writes from the token file. */
.specimen-enderby {
  position: relative;
  box-sizing: border-box;
  padding: 20px 16px 32px;
  background: var(--roles-bg);
  color: var(--roles-text);
  font-family: var(--font-sans, Inter, system-ui, sans-serif);
  font-size: var(--design-type-body);
  line-height: var(--design-type-leading);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}
.specimen-enderby *, .specimen-enderby *::before, .specimen-enderby *::after { box-sizing: border-box; }
.specimen-enderby h5, .specimen-enderby h6, .specimen-enderby p, .specimen-enderby ol, .specimen-enderby blockquote, .specimen-enderby figure { margin: 0; padding: 0; }
.sp-head { display: grid; gap: 10px; max-width: 62ch; margin-bottom: 24px; }
.sp-h { font-family: var(--font-display, var(--font-sans, Inter, system-ui, sans-serif)); font-size: var(--design-type-figure); font-weight: 600; line-height: 1.15; }
.specimen-enderby .prose { color: var(--roles-text-muted); }
.sp-quote { border-left: var(--design-stroke-focus) solid var(--roles-accent); padding-left: 12px; color: var(--roles-text-muted); }
.sp-quote footer { font-size: var(--design-type-label); color: var(--roles-text-subtle); margin-top: 2px; }
.sp-figs { display: grid; gap: 28px 24px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); align-items: start; }
.sp-fig { display: grid; gap: 8px; min-width: 0; }
.sp-title { font-family: var(--font-display, var(--font-sans, Inter, system-ui, sans-serif)); font-size: var(--design-type-title); font-weight: 600; line-height: 1.2; }
.sp-caption { font-size: var(--design-type-label); color: var(--roles-text-muted); max-width: 56ch; }
.sp-svg { display: block; width: 100%; height: auto; max-width: 560px; background: var(--data-plot-background); font-family: inherit; }
.sp-panel { fill: var(--data-plot-panel); }
.sp-grid { stroke: var(--data-plot-grid); stroke-width: var(--design-stroke-grid); fill: none; }
.sp-axis { stroke: var(--data-plot-axis); stroke-width: var(--design-stroke-axis); fill: none; }
.sp-tick { fill: var(--data-plot-muted); font-size: var(--design-type-tick); }
.sp-axis-title { fill: var(--data-plot-muted); font-size: var(--design-type-label); }
.sp-label { fill: var(--data-plot-text); font-size: var(--design-type-label); }
.sp-value { fill: var(--data-plot-text); font-size: var(--design-type-tick); }
${seriesColours}
.sp-bar { fill: var(--sp-c); }
.sp-line { fill: none; stroke: var(--sp-c); stroke-width: var(--design-stroke-series); stroke-linejoin: round; }
${dashes}
.sp-mk-solid { fill: var(--sp-c); stroke: var(--sp-c); stroke-width: 1; }
.sp-mk-open { fill: var(--data-plot-panel); stroke: var(--sp-c); stroke-width: 1.6; }
.sp-ctx { fill: none; stroke: var(--data-plot-context); stroke-width: var(--design-stroke-context); }
.sp-focus { fill: none; stroke: var(--data-plot-focus); stroke-width: var(--design-stroke-focus); stroke-linejoin: round; }
.sp-focus-dot { fill: var(--data-plot-focus); }
.sp-cell { stroke: none; }
${edged.join(",\n")} { stroke: var(--data-plot-outline); stroke-width: var(--design-stroke-outline); }
${fills}
.sp-scales { display: grid; gap: 14px; margin-top: 32px; max-width: 560px; }
.sp-scale { display: grid; gap: 4px; }
.sp-scale-name { font-size: var(--design-type-label); color: var(--roles-text-muted); }
.sp-strip { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 2px; }
.sp-strip li { display: grid; gap: 2px; justify-items: center; min-width: 0; }
.sp-chip { display: block; width: 100%; height: 28px; border: 1px solid transparent; }
${edged.map((c) => c.replace(".sp-x-", ".sp-chip.sp-x-")).join(",\n")} { border-color: var(--data-plot-outline); }
.sp-tag { font-size: var(--design-type-tick); color: var(--roles-text-muted); }
.sp-defs { position: absolute; width: 0; height: 0; overflow: hidden; }
[data-mode="dark"] .sp-grey { filter: url(#sp-grey-dark); }
[data-mode="light"] .sp-grey { filter: url(#sp-grey-light); }
@media (max-width: 420px) {
  .specimen-enderby { padding: 16px 12px 24px; }
  .sp-strip { gap: 1px; }
}
`;

writeFileSync(join(root, "families/enderby/specimen/specimen.html"), html);
writeFileSync(join(root, "families/enderby/specimen/specimen.css"), css);
console.log(`specimen.html ${html.length} bytes, specimen.css ${css.length} bytes; outlined steps: ${edged.length} of ${(RAMPS.sequential.length + RAMPS.diverging.length) * STEPS}`);
