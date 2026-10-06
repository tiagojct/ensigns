// The remaining export formats read the same resolved colours as the editor
// writers. No palette, syntax or chart scale is inferred from a family name.
import { at } from '../model/resolve.ts';
import { CORE_ROLES } from '../model/types.ts';
import type { ModeName, ResolvedFamily } from '../model/types.ts';
import { parseHex } from '../colour/srgb.ts';
import { cssColour, scopeProperties } from './css-properties.ts';
import { familyId, json, modesOf, provenance } from './common.ts';
import { terminalUnavailable } from './terminals.ts';
import type { ExportFile, ExportOptions, Generator } from './types.ts';

type Kind = 'web' | 'publishing' | 'data' | 'palettes' | 'terminals';
type Writer = (f: ResolvedFamily, modes: readonly ModeName[]) => ExportFile[];
const header = (f: ResolvedFamily, mark = '#') => `${mark} ${provenance(f)}\n`;
const file = (name: string, content: string | Uint8Array, mime = 'text/plain'): ExportFile => ({name, content, mime});
const role = (f: ResolvedFamily, m: ModeName, name: string) => cssColour(at(f.modes[m], `roles.${name}`));
const name = (s: string) => s.replaceAll('.', '-');
const camel = (s: string) => s.split(/[^a-zA-Z0-9]+/).map(x => x[0]!.toUpperCase() + x.slice(1)).join('');
const excluded = (f: ResolvedFamily, id: string, group: Kind) => f.source.targets?.exclude?.some(x => x === id || x === group);
const make = (id: string, label: string, group: Kind, writer: Writer): Generator => {
  const unavailable = (f: ResolvedFamily, opts?: ExportOptions): string | undefined => {
    if (excluded(f, id, group)) return `The family excludes ${group === 'terminals' ? 'terminal themes' : id}.`;
    if (group === 'terminals') return terminalUnavailable(f, opts);
    for (const m of modesOf(opts)) {
      if (group === 'data' && ![...f.modes[m].colours.keys()].some(a => a.startsWith('data.'))) {
        return `No authored chart scales in ${m} mode. Derived data palettes are not supplied.`;
      }
      if (group === 'data' && [...f.modes[m].colours].some(([a, c]) => c.alpha !== undefined && (group === 'data' ? a.startsWith('data.') : a.startsWith('roles.') && !a.startsWith('roles.extra')))) {
        return `${m} contains translucent colours unsupported by this format.`;
      }
    }
    return undefined;
  };
  return {id, label, unavailable, generate(f, opts) {
    familyId(f);
    const reason = unavailable(f, opts);
    if (reason) throw new Error(`${f.meta.id}: ${reason}`);
    return writer(f, modesOf(opts));
  }};
};

export const scss = make('scss', 'SCSS variables', 'web', (f, modes) => [file(`_${f.meta.id}.scss`, header(f, '//') + modes.map(m => `$${f.meta.id}-${m}: (\n${scopeProperties(f,m).map(([k,v]) => `  ${JSON.stringify(k.slice(2))}: ${JSON.stringify(v)},`).join('\n')}\n);`).join('\n\n'), 'text/x-scss')]);
const roleSets = (f: ResolvedFamily, modes: readonly ModeName[]) => Object.fromEntries(modes.map(m => [m,Object.fromEntries(CORE_ROLES.map(r => [r,role(f,m,r)]))]));
export const tailwind3 = make('tailwind3', 'Tailwind v3 configuration', 'web', (f,modes) => [file(`tailwind.${f.meta.id}.config.cjs`, header(f,'//') + `module.exports = ${json({theme:{extend:{colors:{[f.meta.id]:roleSets(f,modes)}}}})};\n`, 'text/javascript')]);
export const tailwind4 = make('tailwind4', 'Tailwind v4 theme', 'web', (f,modes) => [file(`${f.meta.id}.theme.css`, `/* ${provenance(f)} */\n@theme {\n${modes.flatMap(m => CORE_ROLES.map(r => `  --color-${f.meta.id}-${m}-${r}: ${role(f,m,r)};`)).join('\n')}\n}\n`, 'text/css')]);

// DTCG 2025.10 colour values use the colour-space object. Tokens Studio
// expects CSS values instead. All resolved addresses are retained in both.
function tokenTree(f: ResolvedFamily, modes: readonly ModeName[], studio: boolean) {
  const tree: Record<string, unknown> = {};
  const token = (c: {hex: string; alpha?: number; from: string; style?: string}) => studio
    ? {type:'color', value:cssColour(c as any), description:c.from, ...(c.style ? {extensions:{'eu.tiagojacinto.ensigns':{style:c.style}}}: {})}
    : {$type:'color', $value:{colorSpace:'srgb', components:parseHex(c.hex), alpha:c.alpha ?? 1}, $description:c.from, ...(c.style ? {$extensions:{'eu.tiagojacinto.ensigns':{style:c.style}}}: {})};
  for (const m of modes) tree[m] = Object.fromEntries([...f.modes[m].colours].map(([a,c]) => [name(a),token(c)]));
  tree.palette = Object.fromEntries([...f.palette].map(([a,c]) => [name(a),token(c)]));
  if (studio) tree.$metadata = {tokenSetOrder:['palette',...modes]};
  else tree.$description = provenance(f);
  // Non-colour cues travel alongside the colour values, not as fabricated colour tokens.
  tree.$extensions = {'eu.tiagojacinto.ensigns':{provenance:provenance(f), typography:f.source.typography ?? {}, design:f.source.design ?? {}, status:Object.fromEntries(modes.map(m=>[m,f.source.modes[m].status ?? null]))}};
  return tree;
}
export const dtcg = make('dtcg', 'DTCG design tokens', 'web', (f,m) => [file(`${f.meta.id}.tokens.json`,json(tokenTree(f,m,false)),'application/json')]);
export const tokensStudio = make('tokens-studio', 'Tokens Studio', 'web', (f,m) => [file(`${f.meta.id}.tokens-studio.json`,json(tokenTree(f,m,true)),'application/json')]);

export const quartoBrand = make('quarto-brand', 'Quarto brand', 'publishing', (f,modes) => {
  const m = modes.includes('light') ? 'light' : modes[0]!;
  const out = header(f) + `# This brand has one colour set: ${m}. Use Quarto SCSS for separate modes.\nmeta:\n  name: ${JSON.stringify(f.meta.name)}\n  link: https://ensigns.tiagojacinto.eu/${f.meta.id}/\ncolor:\n${Object.entries({foreground:'text',background:'bg',primary:'accent',secondary:'text-muted',link:'link'}).map(([k,r])=>`  ${k}: ${JSON.stringify(role(f,m,r))}`).join('\n')}\n`;
  return [file(`${f.meta.id}-brand.yml`,out,'text/yaml')];
});
export const quartoScss = make('quarto-scss', 'Quarto SCSS theme', 'publishing', (f,modes)=>modes.map(m=>file(`${f.meta.id}-${m}.scss`,header(f,'//')+`\n/*-- scss:defaults --*/\n$body-bg: ${role(f,m,'bg')};\n$body-color: ${role(f,m,'text')};\n$link-color: ${role(f,m,'link')};\n$link-hover-color: ${role(f,m,'link-hover')};\n$border-color: ${role(f,m,'border')};\n$primary: ${role(f,m,'accent')};\n$code-bg: ${role(f,m,'surface')};\n$navbar-bg: ${role(f,m,'surface')};\n\n/*-- scss:rules --*/\n:root { color-scheme: ${m}; }\n${syntaxCss(f,m)}\n*:focus-visible { outline: 2px solid ${role(f,m,'focus')}; outline-offset: 2px; }\n`,'text/x-scss')));
const PANDOC: Record<string,string> = {keyword:'.kw, .cf, .im',string:'.st, .ss, .vs',number:'.dv, .fl, .bn',comment:'.co, .do',function:'.fu',type:'.dt',constant:'.cn',variable:'.va',operator:'.op',decorator:'.at',parameter:'.ot'};
function syntaxCss(f: ResolvedFamily, m: ModeName): string {
  return Object.entries(PANDOC).flatMap(([s,selectors])=>{
    const c=f.modes[m].colours.get(`syntax.${s}`);
    return c ? [`${selectors.split(', ').map(x=>`.sourceCode ${x}`).join(', ')} { color: ${cssColour(c)}; font-weight: ${c.style?.includes('bold') ? 700 : 400}; font-style: ${c.style?.includes('italic') ? 'italic' : 'normal'}; text-decoration: ${c.style==='underline' ? 'underline' : c.style==='strikethrough' ? 'line-through' : 'none'}; }`] : [];
  }).join('\n');
}
export const pandocCss = make('pandoc-css','Pandoc HTML stylesheet','publishing',(f,modes)=>modes.map(m=>file(`${f.meta.id}-${m}-pandoc.css`,`/* ${provenance(f)} */\n:root { color-scheme: ${m}; }\nhtml { background: ${role(f,m,'bg')}; color: ${role(f,m,'text')}; font-family: system-ui, sans-serif; line-height: 1.6; }\nbody { max-width: 70ch; margin: auto; padding: 2rem; }\na { color: ${role(f,m,'link')}; }\na:hover { color: ${role(f,m,'link-hover')}; }\npre { background: ${role(f,m,'surface')}; padding: 1rem; overflow: auto; }\n::selection { background: ${role(f,m,'selection')}; }\n*:focus-visible { outline: 2px solid ${role(f,m,'focus')}; outline-offset: 2px; }\n${syntaxCss(f,m)}\n`,'text/css')));
export const typst = make('typst','Typst palette','publishing',(f,modes)=>[file(`${f.meta.id}.typ`,header(f,'//')+`#let ${f.meta.id.replaceAll('-','_')} = (\n${modes.map(m=>`  ${m}: (\n${[...f.modes[m].colours].filter(([,c])=>c.alpha===undefined).map(([a,c])=>`    ${JSON.stringify(name(a))}: rgb("${c.hex}"),`).join('\n')}\n  ),`).join('\n')}\n)\n`)]);
export const latex = make('latex','LaTeX xcolor definitions','publishing',(f,modes)=>[file(`${f.meta.id}-colours.tex`,header(f,'%')+'% Load xcolor before this file.\n'+modes.map(m=>[...f.modes[m].colours].filter(([,c])=>c.alpha===undefined).map(([a,c])=>`\\definecolor{${camel(f.meta.id)}${camel(m)}${camel(a)}}{HTML}{${c.hex.slice(1)}}`).join('\n')).join('\n')+'\n','text/x-tex')]);

export function chartView(f: ResolvedFamily,m: ModeName) {
  const entries=[...f.modes[m].colours];
  const categorical=Object.fromEntries(entries.filter(([a])=>a.startsWith('data.categorical.')).map(([a,c])=>[a.slice('data.categorical.'.length),c.hex]));
  const scales=(kind:string)=>{
    const out:Record<string,string[]>={};
    for(const [a,c] of entries.filter(([a])=>a.startsWith(`data.${kind}.`))){
      const [, , scale, step]=a.split('.');
      (out[scale!] ??= [])[Number(step)-1]=c.hex;
    }
    return out;
  };
  const get=(keys:string[],fallback:string)=>keys.map(k=>f.modes[m].colours.get(`data.plot.${k}`)?.hex).find(Boolean) ?? role(f,m,fallback);
  return {categorical,sequential:scales('sequential'),diverging:scales('diverging'),plot:{bg:get(['bg','background'],'bg'),panel:get(['panel','bg','background'],'surface'),grid:get(['grid'],'border'),text:get(['text'],'text'),muted:get(['muted','text-muted'],'text-muted')},design:f.source.design ?? {},distinct:f.source.distinct?.filter(x=>x.set==='data.categorical' || x.members?.some(a=>a.startsWith('data.'))) ?? []};
}
export const observable=make('observable','Observable Plot / D3','data',(f,modes)=>[file(`${f.meta.id}-scheme.js`,header(f,'//')+'// Keep labels and marker/pattern cues when using a colour scale.\n'+modes.map(m=>`export const ${m} = ${json(chartView(f,m))};`).join('\n'),'text/javascript')]);
const rquote=(s:string)=>JSON.stringify(s);
const rvec=(a:string[])=>`c(${a.map(rquote).join(', ')})`;
export const ggplot2=make('ggplot2','ggplot2 scales and theme','data',(f,modes)=>{
  const id=f.meta.id.replaceAll('-','_');
  let out=header(f)+'# Keep series labels and the authored marker/pattern cues in the accompanying JSON.\n';
  for(const m of modes){
    const v=chartView(f,m);
    out+=`${id}_${m} <- list(bg=${rquote(v.plot.bg)}, panel=${rquote(v.plot.panel)}, grid=${rquote(v.plot.grid)}, text=${rquote(v.plot.text)}, muted=${rquote(v.plot.muted)})\n`;
    if(Object.keys(v.categorical).length){
      out+=`${id}_series_${m} <- ${rvec(Object.values(v.categorical))}\n`;
      for(const aesthetic of ['colour','fill']) out+=`scale_${aesthetic}_${id}_${m} <- function(...) ggplot2::scale_${aesthetic}_manual(values=${id}_series_${m}, ...)\n`;
    }
    for(const kind of ['sequential','diverging'] as const) for(const [s,colours] of Object.entries(v[kind])){
      const n=`${id}_${m}_${kind}_${s.replaceAll('-','_')}`;
      out+=`${n} <- ${rvec(colours)}\n`;
      for(const aesthetic of ['colour','fill']) out+=`scale_${aesthetic}_${n} <- function(...) ggplot2::scale_${aesthetic}_gradientn(colours=${n}, ...)\n`;
    }
  }
  out+=`theme_${id} <- function(mode=${rquote(modes[0]!)}, base_size=11) {\n  if (!mode %in% ${rvec([...modes])}) stop("Unsupported mode")\n  m <- get(paste0("${id}_", mode), envir=environment(theme_${id}))\n  ggplot2::theme_minimal(base_size=base_size) + ggplot2::theme(plot.background=ggplot2::element_rect(fill=m$bg, colour=NA), panel.background=ggplot2::element_rect(fill=m$panel, colour=NA), panel.grid.major=ggplot2::element_line(colour=m$grid), panel.grid.minor=ggplot2::element_blank(), text=ggplot2::element_text(colour=m$text), axis.text=ggplot2::element_text(colour=m$muted), legend.background=ggplot2::element_rect(fill=m$bg, colour=NA))\n}\n`;
  return [file(`${f.meta.id}.R`,out,'text/x-r'),file(`${f.meta.id}-chart-cues.json`,json({provenance:provenance(f),modes:Object.fromEntries(modes.map(m=>[m,chartView(f,m)]))}),'application/json')];
});
export const matplotlib=make('matplotlib','matplotlib styles and colormaps','data',(f,modes)=>{
  const files=modes.map(m=>{
    const v=chartView(f,m), h=(x:string)=>x.slice(1);
    let out=header(f)+`figure.facecolor: ${h(v.plot.bg)}\naxes.facecolor: ${h(v.plot.panel)}\naxes.edgecolor: ${h(v.plot.grid)}\naxes.labelcolor: ${h(v.plot.text)}\ntext.color: ${h(v.plot.text)}\nxtick.color: ${h(v.plot.muted)}\nytick.color: ${h(v.plot.muted)}\ngrid.color: ${h(v.plot.grid)}\naxes.grid: True\naxes.spines.top: False\naxes.spines.right: False\nsavefig.facecolor: ${h(v.plot.bg)}\n`;
    if(Object.keys(v.categorical).length) out+=`axes.prop_cycle: cycler('color', [${Object.values(v.categorical).map(x=>`'${h(x)}'`).join(', ')}])\n`;
    return file(`${f.meta.id}-${m}.mplstyle`,out);
  });
  let py=header(f)+'from pathlib import Path\nimport json\nimport matplotlib.pyplot as plt\nimport matplotlib as mpl\nfrom matplotlib.colors import LinearSegmentedColormap\n\n';
  py+=`DATA = json.loads(${JSON.stringify(JSON.stringify(Object.fromEntries(modes.map(m=>[m,chartView(f,m)]))))})\n\ndef register_cmaps():\n`;
  let count=0;
  for(const m of modes) for(const kind of ['sequential','diverging'] as const) for(const s of Object.keys(chartView(f,m)[kind])){
    count++;
    py+=`    mpl.colormaps.register(LinearSegmentedColormap.from_list(${JSON.stringify(`${f.meta.id}_${m}_${s}`)}, DATA[${JSON.stringify(m)}][${JSON.stringify(kind)}][${JSON.stringify(s)}]), force=True)\n`;
  }
  if(!count)py+='    pass\n';
  py+=`\ndef use(mode=${JSON.stringify(modes[0])}):\n    if mode not in DATA:\n        raise ValueError("Unsupported mode")\n    plt.style.use(str(Path(__file__).with_name(${JSON.stringify(f.meta.id)} + "-" + mode + ".mplstyle")))\n`;
  files.push(file(`${f.meta.id.replaceAll('-','_')}_colours.py`,py,'text/x-python'));
  return files;
});

const paletteEntries=(f:ResolvedFamily)=>[...f.palette].filter(([,c])=>c.alpha===undefined).map(([name,c])=>({name,hex:c.hex}));
export const gpl=make('gpl','GIMP / Inkscape palette','palettes',(f)=>[file(`${f.meta.id}.gpl`,`GIMP Palette\nName: ${f.meta.name}\nColumns: 8\n`+header(f)+paletteEntries(f).map(e=>`${parseHex(e.hex).map(c=>String(Math.round(c*255)).padStart(3)).join(' ')}\t${e.name}`).join('\n')+'\n')]);
export const hexList=make('hex','Plain hex list','palettes',f=>[file(`${f.meta.id}-hex.txt`,header(f)+paletteEntries(f).map(e=>`${e.hex}  ${e.name}`).join('\n')+'\n')]);

/** Big-endian ASE 1.0. UTF-16 names include their terminating null. */
export function encodeAse(group: string, entries: {name:string;hex:string}[]):Uint8Array {
  const utf16=(s:string)=>{const b=new Uint8Array((s.length+1)*2),d=new DataView(b.buffer);for(let i=0;i<s.length;i++)d.setUint16(i*2,s.charCodeAt(i));return b;};
  const blocks:Uint8Array[]=[];
  const push=(type:number,body:Uint8Array)=>{const b=new Uint8Array(6+body.length),d=new DataView(b.buffer);d.setUint16(0,type);d.setUint32(2,body.length);b.set(body,6);blocks.push(b);};
  const label=(s:string)=>{const n=utf16(s),b=new Uint8Array(2+n.length);new DataView(b.buffer).setUint16(0,n.length/2);b.set(n,2);return b;};
  push(0xc001,label(group));
  for(const e of entries){const n=label(e.name),b=new Uint8Array(n.length+18),d=new DataView(b.buffer);b.set(n);b.set([82,71,66,32],n.length);parseHex(e.hex).forEach((c,i)=>d.setFloat32(n.length+4+i*4,c));d.setUint16(b.length-2,0);push(1,b);}
  push(0xc002,new Uint8Array());
  const out=new Uint8Array(12+blocks.reduce((n,b)=>n+b.length,0)),d=new DataView(out.buffer);out.set([65,83,69,70]);d.setUint16(4,1);d.setUint32(8,blocks.length);let offset=12;for(const b of blocks){out.set(b,offset);offset+=b.length;}return out;
}
export const ase=make('ase','Adobe Swatch Exchange','palettes',f=>[file(`${f.meta.id}.ase`,encodeAse(f.meta.name,paletteEntries(f)),'application/octet-stream'),file(`${f.meta.id}-ase-LICENCE.txt`,provenance(f)+'\nTranslucent entries are omitted: ASE supports opaque RGB swatches.\n')]);
