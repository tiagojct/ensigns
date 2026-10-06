// Package scaffolds around the same pure export files; no second palette.
import { at } from '../../lib/model/resolve.ts';
import type { ResolvedFamily } from '../../lib/model/types.ts';
import { GENERATORS } from '../../lib/generators/index.ts';
import { json } from '../../lib/generators/common.ts';
import { cssColour } from '../../lib/generators/css-properties.ts';
export function integrations(families:ResolvedFamily[],version:string):Record<string,string> {
  const out:Record<string,string>={};
  const generator=(id:string)=>GENERATORS.find(g=>g.id===id)!;
  const themes:unknown[]=[];
  let typst='';
  let v4='';
  const configs:Record<string,unknown>={};
  for(const f of families){
    const id=f.meta.id;
    const vs=generator('vscode');
    if(!vs.unavailable(f)){
      const files=vs.generate(f),manifest=JSON.parse(files.find(x=>x.name==='package.json')!.content as string);
      for(const t of manifest.contributes.themes)themes.push({...t,path:`./themes/${t.path.slice(2)}`});
      for(const file of files)if(file.name!=='package.json')out[`vscode/themes/${file.name}`]=file.content as string;
    }
    const zed=generator('zed');if(!zed.unavailable(f))out[`zed/themes/${id}.json`]=zed.generate(f)[0]!.content as string;
    const typ=generator('typst').generate(f)[0]!;out[`typst/themes/${typ.name}`]=typ.content as string;
    typst+=`#import "themes/${typ.name}": ${id.replaceAll('-','_')}\n`;
    v4+=generator('tailwind4').generate(f)[0]!.content as string;
    const code=generator('tailwind3').generate(f)[0]!.content as string;
    const raw=code.slice(code.indexOf('module.exports = ')+17).trim().replace(/;$/,'');
    Object.assign(configs,JSON.parse(raw).theme.extend.colors);
    const obs=generator('obsidian').generate(f)[0]!.content as string;
    out[`obsidian/${id}/theme.css`]=obs;
    out[`obsidian/${id}/manifest.json`]=json({name:`Ensigns ${f.meta.name}`,version, minAppVersion:'1.0.0',author:'Tiago Jacinto',authorUrl:'https://ensigns.tiagojacinto.eu'});
    for(const mode of ['light','dark'] as const){
      const r=(name:string)=>cssColour(at(f.modes[mode],`roles.${name}`));
      out[`firefox/${id}-${mode}/manifest.json`]=json({manifest_version:2,name:`Ensigns ${f.meta.name} ${mode}`,version,description:f.meta.goal,browser_specific_settings:{gecko:{id:`ensigns-${id}-${mode}@tiagojct.eu`}},theme:{colors:{frame:r('bg'),tab_background_text:r('text'),toolbar:r('surface'),toolbar_text:r('text'),toolbar_field:r('bg'),toolbar_field_text:r('text'),toolbar_field_border:r('border'),tab_selected:r('surface'),tab_text:r('text'),tab_line:r('accent'),popup:r('surface'),popup_text:r('text'),popup_border:r('border'),sidebar:r('bg'),sidebar_text:r('text'),sidebar_border:r('border')}}});
    }
  }
  out['vscode/package.json']=json({name:'ensigns',displayName:'Ensigns',version,publisher:'tiagojct',description:'Eight editor themes from four Ensigns families.',author:'Tiago Jacinto',license:'CC-BY-4.0',engines:{vscode:'^1.85.0'},categories:['Themes'],repository:{type:'git',url:'https://github.com/tiagojct/ensigns'},contributes:{themes}});
  out['zed/extension.toml']=`id = "ensigns"\nname = "Ensigns"\nversion = "${version}"\nschema_version = 1\nauthors = ["Tiago Jacinto"]\ndescription = "Eight editor themes from four Ensigns families."\nrepository = "https://github.com/tiagojct/ensigns"\n`;
  typst+=`\n#let families = (${families.map(f=>`${f.meta.id.replaceAll('-','_')}: ${f.meta.id.replaceAll('-','_')}`).join(', ')})\n#let palette(family: "pequod", mode: "light") = families.at(family).at(mode)\n#let document(body, family: "pequod", mode: "light") = {\n  let p = palette(family: family, mode: mode)\n  set page(fill: p.at("roles-bg"))\n  set text(fill: p.at("roles-text"))\n  body\n}\n`;
  out['typst/lib.typ']=typst;
  out['typst/typst.toml']=`[package]\nname = "ensigns"\nversion = "${version}"\nentrypoint = "lib.typ"\nauthors = ["Tiago Jacinto"]\nlicense = "MIT AND CC-BY-4.0"\ndescription = "Ten colour families for documents and figures"\nrepository = "https://github.com/tiagojct/ensigns"\n`;
  out['typst/example.typ']='#import "lib.typ": document\n#show: document.with(family: "pequod", mode: "light")\n= Call me Ishmael.\nA document on the selected family’s ground.\n';
  out['tailwind/v3.cjs']='// Ensigns. Colour data CC BY 4.0, Tiago Jacinto.\nmodule.exports = '+json({theme:{extend:{colors:configs}}})+';\n';
  out['tailwind/v4.css']=v4;
  out['tailwind/package.json']=json({name:'@tiagojct/ensigns-tailwind',version,type:'commonjs',description:'Ensigns presets for Tailwind 3 and 4',license:'CC-BY-4.0',exports:{'.':'./v3.cjs','./v3':'./v3.cjs','./v4.css':'./v4.css'}});
  const palettes=Object.fromEntries(families.map(f=>{
    const modes=Object.fromEntries(['light','dark'].map(mode=>{
      const m=mode as 'light'|'dark';const r=(key:string)=>at(f.modes[m],`roles.${key}`).hex;
      return [m,{bg:r('bg'),bgElev:r('surface-raised'),bgDeep:r('surface'),fg:r('text'),fgDim:r('text-muted'),fgGhost:r('text-subtle'),accent:r('accent'),accentLight:r('link'),accentDim:r('border'),border:r('border'),heading:r('text'),emphasis:r('text'),code:f.modes[m].colours.get('syntax.variable')?.hex ?? r('text'),marker:r('text-subtle')}];
    }));
    return [f.meta.id,{label:f.meta.name,modes:{light:f.modes.light.label,dark:f.modes.dark.label},...modes}];
  }));
  out['loomings/palettes.js']=`// Generated from current Ensigns tokens. Colour data CC BY 4.0, Tiago Jacinto.\nexport const PALETTE_KEYS = ${json(['bg','bgElev','bgDeep','fg','fgDim','fgGhost','accent','accentLight','accentDim','border'])};\nexport const PALETTES = ${json(palettes)};\nexport const FAMILY_ORDER = ${json(families.map(f=>f.meta.id))};\nexport const DEFAULT_FAMILY = "pequod";\nconst aliases = {glauca:"goney",tryworks:"jungfrau",ambergris:"rosebud"};\nfor (const [old,id] of Object.entries(aliases)) PALETTES[old] = PALETTES[id];\nexport function roles(family,mode) {\n  const f=PALETTES[family]; if(!f || !["light","dark"].includes(mode)) throw new Error("Unknown family or mode"); return {...f[mode]};\n}\nexport function cssVars(family,mode) {\n  const r=roles(family,mode); return Object.fromEntries(Object.entries({bg:"bg",bgElev:"bg-elev",bgDeep:"bg-deep",fg:"fg",fgDim:"fg-dim",fgGhost:"fg-ghost",accent:"accent",accentLight:"accent-light",accentDim:"accent-dim",border:"border",heading:"heading",emphasis:"emphasis",code:"code",marker:"marker"}).map(([k,v])=>["--"+v,r[k]]));\n}\nexport function contrast(a,b) {const y=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(s=>s<=0.04045 ? s/12.92 : ((s+0.055)/1.055)**2.4);return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;};const x=y(a),z=y(b);return (Math.max(x,z)+0.05)/(Math.min(x,z)+0.05);}\n`;
  return out;
}
