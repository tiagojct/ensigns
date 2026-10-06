/// <reference lib="dom" />
const announcement=document.querySelector<HTMLElement>('#announcement')!;
export const announce=(message:string)=>{announcement.textContent=message;};
export async function copy(value:string) {
  try {await navigator.clipboard.writeText(value);announce(`Copied ${value.length<30 ? value : 'file contents'}`);}
  catch {announce('Copy is unavailable. Select the value or file preview and copy it manually.');}
}
const mode=document.querySelector<HTMLSelectElement>('#site-mode')!;
const family=document.querySelector<HTMLSelectElement>('#site-family')!;
family.value=document.documentElement.dataset.family ?? 'pequod';
family.addEventListener('change',()=>{
  document.documentElement.dataset.family=family.value;
  try{localStorage.setItem('ensigns-family',family.value);}catch{/* Selection still works for this page. */}
  announce(`Site family: ${family.selectedOptions[0]!.textContent}`);
});
mode.value=document.documentElement.dataset.mode ?? 'system';
mode.addEventListener('change',()=>{
  if(mode.value==='system')delete document.documentElement.dataset.mode;
  else document.documentElement.dataset.mode=mode.value;
  try{localStorage.setItem('ensigns-mode',mode.value);}catch{/* Appearance still works for this page. */}
});
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]'))button.addEventListener('click',()=>copy(button.dataset.copy!));
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-sample-action]'))button.addEventListener('click',()=>{button.textContent=button.textContent==='Saved' ? 'Save changes' : 'Saved';announce(button.textContent!);});
if(document.querySelector('#carpenter')) import('./carpenter.ts').then(x=>x.init()).catch(()=>{document.querySelector('#export-status')!.textContent='The workbench could not load. Ready-made downloads are available on each family page.';});
if(document.querySelector('.compare-panels'))import('./compare.ts').then(x=>x.init()).catch(()=>announce('Comparison controls could not load. The initial panels remain available.'));
