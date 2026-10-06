import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { integrations } from '../../scripts/packages/integrations.ts';
import { mastodon } from '../../scripts/packages/mastodon.ts';
import { loadFamilies, repoRoot } from '../../lib/model/load.ts';
import { at, resolveFamily } from '../../lib/model/resolve.ts';
const families=loadFamilies().map(f=>resolveFamily(f.file));
const files=integrations(families,'1.0.0');

describe('installable integrations',()=>{
  it('links every VS Code theme to its shipped file and keeps excluded families out',()=>{
    const manifest=JSON.parse(files['vscode/package.json']!);
    expect(manifest.contributes.themes).toHaveLength(8);
    for(const theme of manifest.contributes.themes){
      const file=files['vscode/'+theme.path.slice(2)];
      expect(file,theme.path).toBeDefined();
      expect(JSON.parse(file!).colors['editor.background']).toBeDefined();
    }
    expect(Object.keys(files).filter(f=>f.startsWith('zed/themes/'))).toHaveLength(4);
    for(const f of families)if(f.source.targets?.exclude?.includes('editors')){
      expect(Object.keys(files).some(p=>p.startsWith('vscode/themes/'+f.meta.id+'-'))).toBe(false);
      expect(files['zed/themes/'+f.meta.id+'.json']).toBeUndefined();
    }
  });
  it('includes all ten document palettes and correctly references package entry points',()=>{
    for(const f of families)expect(files['typst/lib.typ']).toContain(`themes/${f.meta.id}.typ`);
    const manifest=JSON.parse(files['tailwind/package.json']!);
    for(const entry of Object.values(manifest.exports) as string[])expect(files['tailwind/'+entry.slice(2)]).toBeDefined();
    for(const f of families)expect(files['tailwind/v4.css']).toContain(`--color-${f.meta.id}-light-bg: ${at(f.modes.light,'roles.bg').hex}`);
  });
  it('writes independently installable Firefox and Obsidian theme manifests from resolved roles',()=>{
    for(const f of families){
      const obs=JSON.parse(files[`obsidian/${f.meta.id}/manifest.json`]!);
      expect(obs.name).toBe(`Ensigns ${f.meta.name}`);expect(files[`obsidian/${f.meta.id}/theme.css`]).toBeDefined();
      for(const mode of ['light','dark'] as const){
        const manifest=JSON.parse(files[`firefox/${f.meta.id}-${mode}/manifest.json`]!);
        expect(manifest.theme.colors.frame).toBe(at(f.modes[mode],'roles.bg').hex);
        expect(manifest.theme.colors.toolbar_text).toBe(at(f.modes[mode],'roles.text').hex);
        expect(manifest.browser_specific_settings.gecko.id).toContain(f.meta.id);
      }
    }
  });
  it('preserves the Loomings consumer API and old family aliases',async()=>{
    const module=await import('data:text/javascript;base64,'+Buffer.from(files['loomings/palettes.js']!).toString('base64'));
    expect(module.FAMILY_ORDER).toHaveLength(10);expect(module.DEFAULT_FAMILY).toBe('pequod');
    for(const [old,id] of Object.entries({glauca:'goney',tryworks:'jungfrau',ambergris:'rosebud'}))expect(module.PALETTES[old]).toBe(module.PALETTES[id]);
    for(const f of families)for(const mode of ['light','dark'] as const){
      const roles=module.roles(f.meta.id,mode);
      expect(roles.bg).toBe(at(f.modes[mode],'roles.bg').hex);
      expect(module.cssVars(f.meta.id,mode)['--bg']).toBe(roles.bg);
      expect(module.contrast(roles.bg,roles.fg)).toBeGreaterThan(4.5);
      roles.bg='changed';expect(module.roles(f.meta.id,mode).bg).not.toBe('changed');
    }
    expect(()=>module.roles('missing','dark')).toThrow('Unknown');
  });
  it('recolours the Mastodon template and status overrides from current Rosebud tokens',()=>{
    const family=families.find(f=>f.meta.id==='rosebud')!;
    const css=mastodon(repoRoot(),family);
    expect(css).not.toMatch(/\{\{[^}]+\}\}/);expect(css).toContain('TANGERINE-LICENSE');
    // The attribution spells the holder's name as the licence file does, accent included.
    const holder=readFileSync(join(repoRoot(),'packages/mastodon/vendor/TANGERINE-LICENSE'),'utf8').match(/Copyright \(c\) \d{4} (.+)/)![1]!;
    expect(holder).toContain('é');expect(css).toContain(`Tangerine Neue MIT, ${holder}.`);
    for(const mode of ['light','dark'] as const)for(const [name,status] of Object.entries({confirm:'success',warning:'warning',error:'critical'})){
      expect(css).toContain(`--color-${name}: ${at(family.modes[mode],`status.${status}.accent`).hex};`);
    }
    expect(css).toContain(':focus-visible');expect(css).toContain('2px dashed var(--color-warning)');
  });
});
