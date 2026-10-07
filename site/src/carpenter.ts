/// <reference lib="dom" />
import { zipSync, strToU8 } from 'fflate';
import { catalogue } from './catalogue.ts';
import { GENERATORS, generateAll } from '../../lib/generators/index.ts';
import { INSTALL } from '../../lib/generators/install.ts';
import { provenance } from '../../lib/generators/common.ts';
import { contrastRatio } from '../../lib/colour/wcag.ts';
import { simulateCvd } from '../../lib/colour/cvd.ts';
import { currentFamilyId } from '../../lib/model/renames.ts';
import type { ExportFile, ExportOptions } from '../../lib/generators/types.ts';
import { copy, announce } from './main.ts';
const select=(id:string)=>document.querySelector<HTMLSelectElement>(id)!;
const el=(tag:string,text?:string)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
function download(file:ExportFile){
  // Copy typed arrays into an ArrayBuffer for Blob implementations with strict buffer types.
  const bytes=typeof file.content==='string' ? file.content : new Uint8Array(file.content).buffer;
  const url=URL.createObjectURL(new Blob([bytes],{type:file.mime}));
  const a=document.createElement('a');a.href=url;a.download=file.name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function init(){
  const {families}=await catalogue();
  const family=select('#export-family'),mode=select('#export-mode'),format=select('#export-format');
  const query=new URL(location.href);
  // Old links carry the old ids (glauca, try-works, ambergris). An id that is not a family leaves the default.
  const wanted=currentFamilyId(query.searchParams.get('family') ?? '');
  if(families.some(f=>f.meta.id===wanted))family.value=wanted;
  if(GENERATORS.some(g=>g.id===query.searchParams.get('format')))format.value=query.searchParams.get('format')!;
  if(['both','light','dark'].includes(query.searchParams.get('mode') ?? ''))mode.value=query.searchParams.get('mode')!;
  const bundle=document.querySelector<HTMLButtonElement>('#export-bundle')!;
  bundle.disabled=false;
  const options=():ExportOptions=>({mode:mode.value as ExportOptions['mode']});
  const current=()=>families.find(f=>f.meta.id===family.value)!;
  const update=()=>{
    const f=current(),g=GENERATORS.find(g=>g.id===format.value)!;
    const reason=g.unavailable(f,options()),host=document.querySelector('#export-files')!;
    host.replaceChildren();
    document.querySelector('#export-title')!.textContent=`${f.meta.name} · ${g.label}`;
    document.querySelector('#export-install')!.textContent=INSTALL[g.id] ?? 'Download the file and import it into the corresponding application.';
    const link=document.querySelector<HTMLAnchorElement>('#export-family-link')!;link.href=`/${f.meta.id}/`;link.textContent=`Explore ${f.meta.name}`;
    query.searchParams.set('family',f.meta.id);query.searchParams.set('format',g.id);query.searchParams.set('mode',mode.value);history.replaceState(null,'',query);
    if(reason){
      document.querySelector('#export-status')!.textContent=reason;
      // The reason also goes where the files would be. An empty preview area keeps its reserved height.
      const note=el('p',reason);note.className='notice';host.append(note);
      return;
    }
    const files=g.generate(f,options());
    document.querySelector('#export-status')!.textContent=`${files.length} ${files.length===1 ? 'file' : 'files'} · ${f.meta.name} ${f.meta.version} · ${mode.value==='both' ? 'both modes' : mode.value+' mode'}`;
    for(const file of files){
      const card=el('section');card.className='export-file';
      const header=el('header'),h=el('h3',file.name),actions=el('div');actions.className='file-actions';
      const dl=el('button','Download') as HTMLButtonElement;dl.type='button';dl.setAttribute('aria-label',`Download ${file.name}`);dl.addEventListener('click',()=>{download(file);announce(`Downloaded ${file.name}`);});actions.append(dl);
      if(typeof file.content==='string'){
        const c=el('button','Copy') as HTMLButtonElement;c.type='button';c.setAttribute('aria-label',`Copy ${file.name}`);c.addEventListener('click',()=>copy(file.content as string));actions.append(c);
      }
      header.append(h,actions);card.append(header);
      if(typeof file.content==='string'){
        const pre=el('pre'),code=el('code',file.content);pre.tabIndex=0;pre.setAttribute('aria-label',`${file.name} contents`);pre.append(code);card.append(pre);
      }else {const p=el('p',`Binary swatch file · ${file.content.byteLength.toLocaleString()} bytes`);p.className='binary';card.append(p);}
      host.append(card);
    }
  };
  for(const s of [family,mode,format])s.addEventListener('change',update);
  document.querySelector('form')!.addEventListener('submit',e=>e.preventDefault());
  bundle.addEventListener('click',async()=>{
    bundle.disabled=true;
    const f=current();
    try{
      const results=generateAll(f,options()),tree:Record<string,Uint8Array>={};
      for(const result of results) for(const file of result.files)tree[`exports/${result.generator.id}/${file.name}`]=typeof file.content==='string' ? strToU8(file.content) : file.content;
      tree[`${f.meta.id}.tokens.json`]=strToU8(JSON.stringify(f.source,null,2)+'\n');
      tree['README.txt']=strToU8(provenance(f)+'\nMode: '+mode.value+'\n\n'+results.map(r=>`${r.generator.label}\n${r.reason ?? INSTALL[r.generator.id]}\n`).join('\n'));
      for(const licence of ['LICENSE-MIT','LICENSE-CC-BY-4.0']){
        const response=await fetch(`/releases/${licence}.txt`);if(!response.ok)throw new Error('Licence text unavailable');tree[licence+'.txt']=strToU8(await response.text());
      }
      download({name:`${f.meta.id}-${f.meta.version}-${mode.value}.zip`,content:zipSync(tree,{level:6,mtime:new Date('1980-01-01T00:00:00Z')}),mime:'application/zip'});
      announce('Family bundle downloaded');
    }catch {announce('The bundle could not be prepared. Use the ready-made bundle on the family page.');}
    finally{bundle.disabled=false;}
  });
  update();
  const fg=select('#checker-fg'),bg=select('#checker-bg');
  const colours=families.flatMap(f=>[...f.palette].filter(([,c])=>c.alpha===undefined).map(([a,c])=>({label:`${f.meta.name} · ${a} · ${c.hex}`,hex:c.hex,key:`${f.meta.id}/${a}`})));
  for(const s of [fg,bg])s.replaceChildren(...colours.map(c=>{const o=el('option',c.label) as HTMLOptionElement;o.value=c.key;return o;}));
  const start=current();
  fg.value=`${start.meta.id}/${start.modes.light.colours.get('roles.text')!.from}`;
  bg.value=`${start.meta.id}/${start.modes.light.colours.get('roles.bg')!.from}`;
  const check=()=>{
    const a=colours.find(c=>c.key===fg.value)!,b=colours.find(c=>c.key===bg.value)!;
    const host=document.querySelector('#checker-result')!;host.replaceChildren();
    const ratio=contrastRatio(a.hex,b.hex),p=el('p',`${ratio.toFixed(2)}:1 · AA body text ${ratio>=4.5 ? 'passes' : 'fails'} · AA large text ${ratio>=3 ? 'passes' : 'fails'} · AAA body text ${ratio>=7 ? 'passes' : 'fails'}`);host.append(p);
    const cards=el('div');cards.className='checker-cards';
    for(const [label,type] of [['As authored',null],['Protan simulation','protan'],['Deutan simulation','deutan'],['Tritan simulation','tritan']] as const){
      const x=type ? simulateCvd(a.hex,type) : a.hex,y=type ? simulateCvd(b.hex,type) : b.hex;
      const c=el('div');c.className='checker-card';c.style.setProperty('--checker-fg',x);c.style.setProperty('--checker-bg',y);
      c.append(el('strong','Call me Ishmael.'),el('p','The same words, on the selected ground.'),el('small',`${label} · ${contrastRatio(x,y).toFixed(2)}:1`));cards.append(c);
    }
    host.append(cards);
  };
  fg.addEventListener('change',check);bg.addEventListener('change',check);check();
}
