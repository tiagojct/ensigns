import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { GENERATORS } from '../../lib/generators/index.ts';
import { chartView } from '../../lib/generators/formats.ts';
import { loadFamilies } from '../../lib/model/load.ts';
import { resolveFamily } from '../../lib/model/resolve.ts';
import { MODES } from '../../lib/model/types.ts';
import { parseHex } from '../../lib/colour/srgb.ts';
const families=loadFamilies().map(f=>resolveFamily(f.file));
const gen=(id:string)=>GENERATORS.find(g=>g.id===id)!;
const parseLua=createRequire(import.meta.url)('luaparse').parse;
const text=(id:string,f= families.find(f=>f.meta.id==='enderby')!)=>gen(id).generate(f)[0]!.content as string;

describe('complete export catalogue',()=>{
  it('has 29 unique formats and applies target exclusions to every terminal writer',()=>{
    expect(GENERATORS).toHaveLength(29);expect(new Set(GENERATORS.map(g=>g.id)).size).toBe(29);
    for(const id of ['wezterm','tmux','iterm2'])for(const f of families){
      if(f.source.targets?.exclude?.includes('terminals')){
        expect(gen(id).unavailable(f)).toContain('excludes');expect(()=>gen(id).generate(f)).toThrow('excludes');
      }else expect(gen(id).generate(f)).toHaveLength(2);
    }
  });
  it('preserves every authored chart ramp and reports missing chart data',()=>{
    for(const f of families)for(const m of MODES){
      if(f.source.derived?.includes('data')){
        for(const id of ['ggplot2','matplotlib','observable'])expect(gen(id).unavailable(f,{mode:m})).toContain('No authored');
      }else{
        const v=chartView(f,m);
        const entries=[...f.modes[m].colours].filter(([a])=>/^data\.(categorical|sequential|diverging)\./.test(a));
        for(const [a,c] of entries){
          const [,kind,s,n]=a.split('.');
          if(kind==='categorical')expect(v.categorical[s!]).toBe(c.hex);
          else expect((v[kind as 'sequential'|'diverging'][s!]!)[Number(n)-1]).toBe(c.hex);
        }
        for(const file of gen('observable').generate(f,{mode:m})){
          for(const [,c] of entries)expect(file.content).toContain(c.hex);
        }
      }
    }
    const v=chartView(families.find(f=>f.meta.id==='enderby')!,'dark');
    expect(Object.keys(v.sequential)).toHaveLength(3);expect(Object.keys(v.diverging)).toHaveLength(2);
  });
  it('retains DTCG sRGB values and opacity at every resolved address',()=>{
    for(const f of families){
      const output=JSON.parse(text('dtcg',f));
      for(const m of MODES)for(const [a,c] of f.modes[m].colours){
        expect(output[m][a.replaceAll('.','-')].$value).toEqual({colorSpace:'srgb',components:parseHex(c.hex),alpha:c.alpha ?? 1});
      }
      expect(output.$extensions['eu.tiagojacinto.ensigns'].design).toEqual(f.source.design ?? {});
      const studio=JSON.parse(text('tokens-studio',f));expect(studio.$metadata.tokenSetOrder).toEqual(['palette',...MODES]);
    }
  });
  it('parses all WezTerm tables independently as Lua 5.1',()=>{
    for(const f of families)if(!gen('wezterm').unavailable(f))for(const file of gen('wezterm').generate(f))expect(parseLua(file.content,{luaVersion:'5.1'}).body.at(-1).type).toBe('ReturnStatement');
  });
  it('decodes Adobe swatch blocks back to the canonical opaque palette',()=>{
    for(const f of families){
      const bytes=gen('ase').generate(f)[0]!.content as Uint8Array,dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
      expect(String.fromCharCode(...bytes.slice(0,4))).toBe('ASEF');expect(dv.getUint16(4)).toBe(1);
      const expected=[...f.palette].filter(([,c])=>c.alpha===undefined);expect(dv.getUint32(8)).toBe(expected.length+2);
      let p=12,index=0;
      while(p<bytes.length){
        const type=dv.getUint16(p),size=dv.getUint32(p+2),start=p+6;
        if(type===1){
          const length=dv.getUint16(start),end=start+2+length*2;
          const label=Array.from({length:length-1},(_,i)=>String.fromCharCode(dv.getUint16(start+2+i*2))).join('');
          expect(label).toBe(expected[index]![0]);
          expect(String.fromCharCode(...bytes.slice(end,end+4))).toBe('RGB ');
          parseHex(expected[index]![1].hex).forEach((c,i)=>expect(dv.getFloat32(end+4+i*4)).toBeCloseTo(c,6));index++;
        }
        p=start+size;
      }
      expect(p).toBe(bytes.length);expect(index).toBe(expected.length);
    }
  });
});
