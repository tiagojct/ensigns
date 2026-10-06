/// <reference lib="dom" />
// Exercise the production build under the same CSP as nginx, including real downloads.
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { readFileSync, existsSync, readdirSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, extname } from 'node:path';
import { build } from 'vite';
import { unzipSync, strFromU8 } from 'fflate';
import type { Browser } from 'playwright';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { prepareSite } from '../../scripts/site/build.ts';
import { buildPackages } from '../../scripts/packages/build.ts';
import { loadFamilies, repoRoot } from '../../lib/model/load.ts';
import { RENAMED_FAMILIES } from '../../lib/model/renames.ts';
import { at, resolveFamily } from '../../lib/model/resolve.ts';
import { launchChromium } from '../environments/browser.ts';
import { GENERATORS } from '../../lib/generators/index.ts';
const root=repoRoot(),out=join(root,'site/dist');
const work=mkdtempSync(join(tmpdir(),'ensigns-site-'));
let browser:Browser|undefined,server:Server,url:string;
const csp=readFileSync(join(root,'site/deploy/nginx.conf'),'utf8').match(/Content-Security-Policy "([^"]+)"/)![1]!;
const mime:Record<string,string>={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.zip':'application/zip'};
const routes=['/','/compare/','/carpenter/','/about/',...loadFamilies().map(f=>`/${f.dir}/`)];
// Files that an earlier build could have left in the generated folders. A new build must remove them.
const STALE=['dist/packages/stale/file.txt','dist/releases/stale-0.0.1.zip','dist/exports/stale/file.txt','site/public/reports/stale.json','site/public/exports/stale/file.txt','site/public/review/stale.html','site/public/releases/stale-0.0.1.zip'];
beforeAll(async()=>{
  for(const path of STALE){mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),'stale');}
  await buildPackages(root);prepareSite(root);
  await build({configFile:join(root,'site/vite.config.ts'),logLevel:'silent'});
  server=createServer((req,res)=>{
    const path=decodeURIComponent(new URL(req.url!,'http://localhost').pathname);
    let file=join(out,path.endsWith('/') ? path+'index.html' : path);
    if(!existsSync(file)){res.statusCode=404;file=join(out,'404/index.html');}
    res.setHeader('Content-Security-Policy',csp);res.setHeader('Content-Type',mime[extname(file)] ?? 'text/plain');res.setHeader('X-Content-Type-Options','nosniff');res.end(readFileSync(file));
  });
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();if(!address || typeof address==='string')throw new Error('Server did not start');url=`http://127.0.0.1:${address.port}`;
  const found=await launchChromium();if('reason' in found){if(process.env.ENSIGNS_REQUIRE_BROWSER==='1')throw new Error(found.reason);}else browser=found.browser;
},60000);
afterAll(async()=>{await browser?.close();await new Promise<void>(resolve=>server.close(()=>resolve()));rmSync(work,{recursive:true,force:true});});

describe('finished static catalogue',()=>{
  it('leaves no file from an earlier build in the generated folders or the checksums',()=>{
    for(const path of STALE)expect(existsSync(join(root,path)),path).toBe(false);
    expect(readFileSync(join(root,'dist/releases/SHA256SUMS.txt'),'utf8')).not.toContain('stale');
    expect(existsSync(join(out,'releases/stale-0.0.1.zip'))).toBe(false);
  });
  it('renders every route with one main heading and local assets',()=>{
    for(const route of routes){
      const html=readFileSync(join(out,route,'index.html'),'utf8');
      expect(html).toContain('<html lang="en-GB"');expect(html).toContain('href="#main"');expect(html).toContain('<main id="main">');
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);expect(html).not.toMatch(/ style="|<script(?![^>]*\bsrc=)|\son[a-z]+="/);
      expect(html).not.toContain('/@fs');expect(html).not.toContain('gam.tiagojacinto.eu');
      expect(html).toContain('id="site-family"');expect(html).toContain('Site family');
      for(const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)){
        const path=match[1]!;expect(existsSync(join(out,path.endsWith('/') ? path+'index.html' : path)),`${route} -> ${path}`).toBe(true);
      }
    }
    expect(readFileSync(join(out,'sitemap.xml'),'utf8')).toContain('ensigns.tiagojacinto.eu/rachel/');
  });
  it('ships all families, licensed fonts, bundles and valid source-hash manifests',()=>{
    const model=JSON.parse(readFileSync(join(out,'catalogue.json'),'utf8'));expect(model.families).toHaveLength(10);
    const manifest=JSON.parse(readFileSync(join(out,'exports/manifest.json'),'utf8'));expect(manifest.families).toHaveLength(10);
    const family=unzipSync(readFileSync(join(out,'releases/rosebud-0.5.0.zip')));
    expect(strFromU8(family['LICENSE-CC-BY-4.0.txt']!)).toContain('Section 1');expect(family['exports/vscode/package.json']).toBeDefined();
    for(const source of JSON.parse(readFileSync(join(out,'fonts/sources.json'),'utf8')))expect(existsSync(join(out,'fonts',source.file))).toBe(true);
    expect(readdirSync(join(out,'assets')).filter(f=>f.endsWith('.js')).map(f=>readFileSync(join(out,'assets',f),'utf8')).join('\n')).not.toMatch(/from["'](?:ajv|apca-w3|colorparsley)|new Function\(|eval\(/);
  });
});
describe('production site in Chromium',()=>{
  it('shows the whole site in every family and mode while preserving scoped samples',async(context)=>{
    if(!browser)return context.skip('Chromium unavailable');
    const c=await browser.newContext(),p=await c.newPage(),errors:string[]=[];
    p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    try{
      await p.goto(url+'/');expect(await p.locator('#site-family option').count()).toBe(10);
      const pequod=resolveFamily(loadFamilies().find(f=>f.dir==='pequod')!.file);
      for(const width of [1440,1024,390,320]){
        await p.setViewportSize({width,height:900});
        for(const loaded of loadFamilies()){
          const f=resolveFamily(loaded.file);
          await p.locator('#site-family').selectOption(f.meta.id);
          for(const mode of ['light','dark'] as const){
            await p.locator('#site-mode').selectOption(mode);
            expect(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--roles-bg').trim())).toBe(at(f.modes[mode],'roles.bg').hex);
            expect(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--roles-text').trim())).toBe(at(f.modes[mode],'roles.text').hex);
            expect(await p.locator('.hero-samples .sample').first().evaluate(e=>getComputedStyle(e).getPropertyValue('--roles-bg').trim())).toBe(at(pequod.modes.light,'roles.bg').hex);
            const size=await p.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth}));
            expect(size.content,`${f.meta.id} ${mode} ${width}px`).toBeLessThanOrEqual(size.viewport+1);
          }
        }
      }
      await p.locator('#site-family').selectOption('goney');await p.locator('#site-mode').selectOption('system');
      for(const mode of ['light','dark'] as const){
        await p.emulateMedia({colorScheme:mode});
        const f=resolveFamily(loadFamilies().find(f=>f.dir==='goney')!.file);
        expect(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--roles-bg').trim())).toBe(at(f.modes[mode],'roles.bg').hex);
      }
      expect(errors).toEqual([]);
    }finally{await c.close();}
  },30000);
  it('restores the site family before the main script loads and keeps the choice across routes',async(context)=>{
    if(!browser)return context.skip('Chromium unavailable');const c=await browser.newContext(),p=await c.newPage();
    try{
      await p.goto(url+'/');await p.locator('#site-family').selectOption('rosebud');await p.locator('#site-mode').selectOption('dark');
      await p.getByRole('link',{name:'About',exact:true}).click();
      expect(await p.locator('#site-family').inputValue()).toBe('rosebud');expect(await p.locator('#site-mode').inputValue()).toBe('dark');
      await p.route('**/assets/main-*.js',route=>route.abort());await p.reload();
      expect(await p.locator('html').getAttribute('data-family')).toBe('rosebud');
      expect(await p.locator('html').getAttribute('data-mode')).toBe('dark');
      const f=resolveFamily(loadFamilies().find(f=>f.dir==='rosebud')!.file);
      expect(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--roles-bg').trim())).toBe(at(f.modes.dark,'roles.bg').hex);
      await p.unroute('**/assets/main-*.js');
      await p.evaluate(()=>{localStorage.setItem('ensigns-family','missing');localStorage.setItem('ensigns-mode','invalid');});await p.reload();
      expect(await p.locator('#site-family').inputValue()).toBe('pequod');expect(await p.locator('#site-mode').inputValue()).toBe('system');
    }finally{await c.close();}
  });
  it('lets family and mode controls work when storage is blocked',async(context)=>{
    if(!browser)return context.skip('Chromium unavailable');const c=await browser.newContext(),p=await c.newPage(),errors:string[]=[];
    await p.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable');}}));
    p.on('pageerror',e=>errors.push(e.message));
    try{
      await p.goto(url+'/');await p.locator('#site-family').selectOption('bachelor');await p.locator('#site-mode').selectOption('dark');
      expect(await p.locator('html').getAttribute('data-family')).toBe('bachelor');expect(await p.locator('html').getAttribute('data-mode')).toBe('dark');
      expect(await p.locator('#announcement').textContent()).toBe('Site family: Bachelor');expect(errors).toEqual([]);
    }finally{await c.close();}
  });
  for(const scheme of ['light','dark'] as const)it(`has no horizontal overflow or CSP failures in ${scheme}, desktop and mobile`,async(context)=>{
    if(!browser)return context.skip('Chromium unavailable');
    for(const width of [1440,390]){
      const c=await browser.newContext({viewport:{width,height:900},colorScheme:scheme}),page=await c.newPage(),errors:string[]=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      try{
        for(const route of ['/','/rosebud/','/compare/','/carpenter/?family=enderby&format=matplotlib']){
          await page.goto(url+route);if(route.startsWith('/carpenter'))await page.waitForSelector('.export-file');
          await page.evaluate(()=>document.fonts.ready);
          const size=await page.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth}));expect(size.content,route).toBeLessThanOrEqual(size.viewport+1);
          const links=await page.locator('.masthead nav a').count();expect(links).toBe(4);
        }
        expect(errors).toEqual([]);
      }finally{await c.close();}
    }
  },30000);
  it('persists appearance and supports keyboard focus under forced colours',async(context)=>{
    if(!browser)return context.skip('Chromium unavailable');const c=await browser.newContext({forcedColors:'active'}),p=await c.newPage();
    try{
      await p.goto(url+'/');await p.locator('#site-mode').selectOption('dark');await p.reload();expect(await p.locator('#site-mode').inputValue()).toBe('dark');
      await p.keyboard.press('Tab');expect(await p.evaluate(()=>document.activeElement?.className)).toBe('skip');
      const outline=await p.locator('.skip').evaluate(e=>getComputedStyle(e).outlineStyle);expect(outline).not.toBe('none');
    }finally{await c.close();}
  });
  it('changes comparison panels independently and preserves shareable state',async(context)=>{
    if(!browser)return context.skip('Chromium unavailable');const c=await browser.newContext(),p=await c.newPage();
    try{
      await p.goto(url+'/compare/');await p.waitForFunction(()=>location.search.includes('a='));await p.locator('#compare-a').selectOption('delight');await p.locator('#compare-a-mode').selectOption('dark');
      const panels=p.locator('.compare-panels .sample');expect(await panels.nth(0).getAttribute('data-scope')).toBe('delight');expect(await panels.nth(0).getAttribute('data-mode')).toBe('dark');expect(await panels.nth(1).getAttribute('data-scope')).toBe('rosebud');
      const state=p.url();await p.reload();await p.waitForFunction(()=>document.querySelector('.compare-panels .sample')?.getAttribute('data-scope')==='delight');expect(p.url()).toBe(state);
    }finally{await c.close();}
  });
  it('keeps a redirect page for each old family id',()=>{
    for(const [old,id] of Object.entries(RENAMED_FAMILIES)){
      const html=readFileSync(join(out,old,'index.html'),'utf8');
      expect(html,old).toContain(`url=/${id}/`);expect(html,old).toContain(`rel="canonical" href="https://ensigns.tiagojacinto.eu/${id}/"`);
    }
  });
  it('accepts an old family id in a Carpenter link and ignores an id that is no family',async(context)=>{
    if(!browser)return context.skip('Chromium unavailable');const c=await browser.newContext(),p=await c.newPage();
    try{
      for(const [old,id] of Object.entries(RENAMED_FAMILIES)){
        await p.goto(`${url}/carpenter/?family=${old}`);await p.waitForSelector('.export-file');
        expect(await p.locator('#export-family').inputValue(),old).toBe(id);
      }
      // Object.prototype names must not pass as old ids; the default is the first family in the list.
      await p.goto(`${url}/carpenter/?family=constructor`);await p.waitForSelector('.export-file');
      expect(await p.locator('#export-family').inputValue()).toBe(await p.locator('#export-family option').first().getAttribute('value'));
    }finally{await c.close();}
  });
  it('exports every available format, explains excluded formats and downloads real text, binary and ZIP files',async(context)=>{
    if(!browser)return context.skip('Chromium unavailable');const c=await browser.newContext({acceptDownloads:true}),p=await c.newPage(),errors:string[]=[];p.on('pageerror',e=>errors.push(e.message));
    try{
      await p.goto(url+'/carpenter/?family=pequod');await p.waitForSelector('.export-file');
      for(const g of GENERATORS){await p.locator('#export-format').selectOption(g.id);expect(await p.locator('.export-file').count(),g.id).toBeGreaterThan(0);}
      await p.locator('#export-format').selectOption('css');
      const [css]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'Download pequod.css',exact:true}).click()]);const cssPath=join(work,'pequod.css');await css.saveAs(cssPath);expect(readFileSync(cssPath,'utf8')).toContain('--roles-bg:');
      await p.locator('#export-format').selectOption('ase');const [ase]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'Download pequod.ase',exact:true}).click()]);const asePath=join(work,'pequod.ase');await ase.saveAs(asePath);expect(readFileSync(asePath).subarray(0,4).toString()).toBe('ASEF');
      await p.locator('#export-family').selectOption('rachel');await p.locator('#export-format').selectOption('vscode');expect(await p.locator('.export-file').count()).toBe(0);expect(await p.locator('#export-status').textContent()).toContain('excludes');
      await p.locator('#export-family').selectOption('rosebud');await p.locator('#export-mode').selectOption('dark');
      const [zip]=await Promise.all([p.waitForEvent('download'),p.locator('#export-bundle').click()]);const zipPath=join(work,'bundle.zip');await zip.saveAs(zipPath);const files=unzipSync(readFileSync(zipPath));expect(files['exports/vscode/package.json']).toBeDefined();expect(files['exports/ghostty/rosebud-dark']).toBeDefined();expect(files['exports/ghostty/rosebud-light']).toBeUndefined();expect(files['LICENSE-MIT.txt']).toBeDefined();
      const fg=p.locator('#checker-fg'),bg=p.locator('#checker-bg');await bg.selectOption(await fg.inputValue());expect(await p.locator('#checker-result').textContent()).toContain('1.00:1 · AA body text fails');expect(errors).toEqual([]);
    }finally{await c.close();}
  },30000);
});
