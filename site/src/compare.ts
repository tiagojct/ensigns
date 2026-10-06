/// <reference lib="dom" />
import { catalogue } from './catalogue.ts';
import { contrastRatio } from '../../lib/colour/wcag.ts';
import { at } from '../../lib/model/resolve.ts';
export async function init(){
  const {families}=await catalogue();
  const panels=document.querySelectorAll<HTMLElement>('.compare-panels .sample');
  const query=new URL(location.href);
  for(const [i,side] of ['a','b'].entries()){
    const family=document.querySelector<HTMLSelectElement>(`#compare-${side}`)!;
    const mode=document.querySelector<HTMLSelectElement>(`#compare-${side}-mode`)!;
    const id=query.searchParams.get(side),m=query.searchParams.get(`${side}-mode`);
    if(families.some(f=>f.meta.id===id))family.value=id!;
    if(m==='dark'||m==='light')mode.value=m;
    const update=()=>{
      const f=families.find(f=>f.meta.id===family.value)!,m=mode.value as 'light'|'dark',panel=panels[i]!;
      panel.dataset.scope=f.meta.id;panel.dataset.mode=m;
      const label=panel.querySelector('.sample-label')!;label.replaceChildren(document.createTextNode(`${f.meta.name} · ${f.modes[m].label ?? m} `));
      const span=document.createElement('span');span.textContent=m;label.append(span);
      const a=panel.querySelector<HTMLAnchorElement>('.sample-surface a')!;a.href=`/${f.meta.id}/`;a.textContent=`Explore ${f.meta.name}`;
      panel.querySelector('.ratio')!.textContent=`Body text ${contrastRatio(at(f.modes[m],'roles.text').hex,at(f.modes[m],'roles.bg').hex).toFixed(2)}:1 · measured against the page ground`;
      query.searchParams.set(side,f.meta.id);query.searchParams.set(`${side}-mode`,m);history.replaceState(null,'',query);
    };
    family.addEventListener('change',update);mode.addEventListener('change',update);update();
  }
}
