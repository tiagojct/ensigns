// Build the static catalogue from current tokens and measured reports.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import MarkdownIt from 'markdown-it';
import { Resvg } from '@resvg/resvg-js';
import { buildReport, loadContext } from '../../lib/harness/index.ts';
import type { Thresholds } from '../../lib/harness/types.ts';
import { loadFamilies, loadSchema, readJson, repoRoot } from '../../lib/model/load.ts';
import { resolveFamily } from '../../lib/model/resolve.ts';
import { validateFamily } from '../../lib/model/validate.ts';
import { tokensCss } from '../pages/tokens-css.ts';
import { buildPages } from '../pages/generate.ts';
import { buildExports } from '../export/generate.ts';
import { pages, ORIGIN } from './render.ts';
import type { CatalogueFamily } from './render.ts';
const write=(path:string,content:string|Uint8Array)=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,content);};
export function prepareSite(root=repoRoot()) {
  const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
  const loaded=loadFamilies(root),schema=loadSchema(root);
  for(const f of loaded){const errors=validateFamily(f.raw,schema).filter(x=>x.level==='error');if(errors.length)throw new Error(`${f.dir}: invalid tokens`);}
  const families=loaded.map(f=>resolveFamily(f.file)).sort((a,b)=>Number(b.meta.host ?? false)-Number(a.meta.host ?? false) || Number([a.meta.chapter].flat()[0])-Number([b.meta.chapter].flat()[0]));
  const ctx=loadContext(root),t=readJson(join(root,'tests/environments.json')) as Thresholds;
  const publicDir=join(root,'site/public'),generated=join(root,'site/.generated');
  rmSync(generated,{recursive:true,force:true});
  // These folders are build output. Clear them, so that a retired report, export, specimen or
  // archive does not reach site/dist. site/public/fonts is source and stays.
  for(const dir of ['reports','exports','review','releases'])rmSync(join(publicDir,dir),{recursive:true,force:true});
  const md=new MarkdownIt({html:false,linkify:false});
  const entries:CatalogueFamily[]=families.map(f=>{
    const report=buildReport(f,t,ctx),profiles=Object.values(report.profiles);
    write(join(publicDir,'reports',`${f.meta.id}.json`),JSON.stringify(report,null,2)+'\n');
    const documentation=md.render(readFileSync(join(root,'families',f.meta.id,'README.md'),'utf8')).replace(/<h1[\s\S]*?<\/h1>\n?/, '').replace(/href="(?!https?:|#|mailto:)([^"]+)"/g,(_:string,href:string)=>`href="https://github.com/tiagojct/ensigns/blob/main/families/${f.meta.id}/${href}"`);
    return {family:f,documentation,checks:profiles.reduce((n,p)=>n+p.checks.length,0),warnings:profiles.reduce((n,p)=>n+p.warnings,0),errors:profiles.reduce((n,p)=>n+p.errors,0)};
  });
  if(entries.some(e=>e.errors))throw new Error('Environment measurements failed; refusing to build the public site.');
  write(join(publicDir,'catalogue.json'),JSON.stringify({version:pkg.version,families:families.map(f=>f.source)})+'\n');
  const pq=families.find(f=>f.meta.id==='pequod')!;
  let css=tokensCss(families.map(f=>({scope:f.meta.id,family:f})),pq);
  css+='\n/* Site appearance is independent of the explicitly scoped specimens. */\n';
  for(const f of families){
    const root=`:root[data-family="${f.meta.id}"]`;
    const block=(selector:string,mode:'light'|'dark')=>`${selector} { color-scheme: ${mode};\n${scopeProperties(f,mode).map(([k,v])=>`  ${k}: ${v};`).join('\n')}\n}\n`;
    css+=block(root,'light');
    css+=`@media (prefers-color-scheme: dark) {\n${block(root,'dark')}}\n`;
    for(const mode of ['light','dark'] as const)css+=block(`${root}[data-mode="${mode}"]`,mode);
  }
  for(const f of families)for(const [a,c] of f.palette)if(c.alpha===undefined)css+=`.palette-${f.meta.id}-${a.replaceAll('.','-')} { background: ${c.hex}; }\n`;
  write(join(publicDir,'catalogue.css'),css);
  buildExports(root,join(publicDir,'exports'));
  buildPages(root,join(publicDir,'review'));
  // Specimens use the authored typefaces, served from this site's own origin.
  for(const n of ['pages.css','standalone.css']){
    const path=join(publicDir,'review/assets',n);writeFileSync(path,"@import url('/fonts/fonts.css');\n"+readFileSync(path,'utf8'));
  }
  const releases=join(root,'dist/releases');
  if(existsSync(releases))cpSync(releases,join(publicDir,'releases'),{recursive:true});
  const rendered=pages(entries,pkg.version);
  for(const [path,html] of rendered)write(join(generated,path,'index.html'),html);
  for(const [old,id] of [['glauca','goney'],['try-works','jungfrau'],['ambergris','rosebud']] as const){
    // A static redirect for hosts that do not use the nginx configuration.
    write(join(generated,old,'index.html'),`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>${id} · Ensigns</title><meta http-equiv="refresh" content="0; url=/${id}/"><link rel="canonical" href="${ORIGIN}/${id}/"></head><body><p>This family is now <a href="/${id}/">${id}</a>.</p></body></html>\n`);
  }
  write(join(publicDir,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...rendered.keys()].filter(x=>x!=='/404/').map(path=>`<url><loc>${ORIGIN}${path}</loc></url>`).join('')}</urlset>\n`);
  write(join(publicDir,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  const get=(r:string)=>pq.modes.light.colours.get(`roles.${r}`)!.hex;
  write(join(publicDir,'favicon.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="${get('bg')}"/><path d="M15 12h34v8H24v10h22v8H24v10h25v8H15z" fill="${get('text')}"/></svg>\n`);
  write(join(publicDir,'og.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${get('bg')}"/><text x="80" y="190" font-family="sans-serif" font-size="56" fill="${get('text-muted')}">ENSIGNS</text><text x="80" y="320" font-family="sans-serif" font-size="80" fill="${get('text')}">Ten ships. Ten ways to see.</text><text x="80" y="420" font-family="sans-serif" font-size="36" fill="${get('text-muted')}">Colour families for reading, code, figures and interfaces.</text>${families.map((f,i)=>`<rect x="${80+i*104}" y="510" width="104" height="60" fill="${f.modes.light.colours.get('roles.accent')!.hex}"/>`).join('')}</svg>`);
  const svg=readFileSync(join(publicDir,'og.svg'),'utf8');
  write(join(publicDir,'og.png'),new Resvg(svg,{font:{fontDirs:[join(publicDir,'fonts')],loadSystemFonts:false,defaultFontFamily:'Atkinson Hyperlegible Next'}}).render().asPng());
  console.log(`Prepared ${rendered.size+3} routes, ten families, exports, specimens and measured reports.`);
}
import { scopeProperties as scopeProperties } from '../../lib/generators/css-properties.ts';
if(import.meta.url===new URL(process.argv[1]!, 'file:').href)prepareSite();
