// Tangerine keeps its original geometry and licence. Every recoloured slot
// and the override layer below resolve Rosebud's current palette.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ResolvedFamily } from '../../lib/model/types.ts';
import { at } from '../../lib/model/resolve.ts';
import { cssColour } from '../../lib/generators/css-properties.ts';
import { provenance } from '../../lib/generators/common.ts';
import { parseHex } from '../../lib/colour/srgb.ts';
export function mastodon(root:string,f:ResolvedFamily):string {
  const template=readFileSync(join(root,'packages/mastodon/vendor/tangerine-template.css'),'utf8');
  const values=JSON.parse(readFileSync(join(root,'packages/mastodon/vendor/tangerine-granite.values.json'),'utf8')) as Record<string,string>;
  const g=(name:string)=>f.palette.get('grey.'+name)!.hex;
  const a=(name:string)=>f.palette.get('accent.'+name)!.hex;
  const low=(hex:string)=>hex.slice(1).toLowerCase();
  const rgb=(hex:string)=>parseHex(hex).map(c=>Math.round(c*255)).join(', ');
  for(const key of Object.keys(values))if(key.startsWith('icon-') && !key.startsWith('icon-olympics')){
    const n=Number(key.slice(key.lastIndexOf('_')+1)),dark=n>=464 || key==='icon-collections-accent_250';
    values[key]=low(/-active|check-radio|check-box/.test(key) ? a(dark ? '400' : '600') : g(dark ? '300' : '950'));
  }
  // Recolour composite data-URI icons without changing their paths.
  for(const [key,from,to] of [['logo_260','1f2127',g('950')],['icon-olympics_458','1f2127',g('950')],['logo_464','c9cdd6',g('300')],['icon-olympics_641','c9cdd6',g('300')]])values[key!]=values[key!]!.replaceAll(from!,low(to!));
  Object.assign(values,{
    'variant-name_12':f.meta.name,'variant-emoji_13':'311',
    'color-bg_23':low(g('050')),'color-fg-muted_26':low(g('600')),'color-secondary-bg_27':low(g('100')),'color-secondary-separator_28':low(g('200')),'color-content-secondary-bg_34':low(g('050')),'color-content-secondary-separator_35':rgb(g('200')),'color-accent_38':low(a('600')),'color-accent-focus_39':low(a('500')),'color-accent-lines_40':rgb(a('500'))+', 0.12','color-accent-bg_41':low(a('050')),'color-accent-fg_43':low(g('000')),
    'color-fg_62':low(g('100')),'color-fg-muted_63':low(g('400')),'color-secondary-bg_64':low(g('950')),'color-secondary-separator_65':low(g('900')),'color-content-secondary-separator_72':rgb(g('800')),'color-accent_75':low(a('400')),'color-accent-focus_76':low(a('300')),'color-accent-lines_77':rgb(a('400')),'color-accent-bg_78':low(a('900')),'color-accent-fg_80':low(g('1000')),
  });
  for(const key of ['color-text-brand_172','color-text-status-links_173','color-bg-brand-base_175','color-border-brand_176','color-text-brand_190','color-text-status-links_191','color-bg-brand-base_193','color-border-brand_194'])values[key]=low(a('800'));
  for(const key of ['color-text-brand_209','color-text-status-links_210','color-bg-brand-base_212','color-border-brand_213','color-text-brand_227','color-text-status-links_228','color-bg-brand-base_230','color-border-brand_231'])values[key]=low(a('200'));
  let css=template.replace(/\{\{([^}]+)\}\}/g,(_,key:string)=>{if(!(key in values))throw new Error('Unknown Tangerine slot: '+key);return values[key]!;});
  for(const mode of ['light','dark'] as const){
    const colour=(role:string)=>cssColour(at(f.modes[mode],`roles.${role}`));
    const status=(s:string)=>cssColour(at(f.modes[mode],`status.${s}.accent`));
    const vars:Record<string,string>={'color-bg':colour('bg'),'color-fg':colour('text'),'color-fg-muted':colour('text-muted'),'color-content-bg':colour('surface'),'color-content-fg':colour('text'),'color-content-fg-bold':colour('text'),'color-content-fg-muted':colour('text-muted'),'color-content-secondary-bg':colour('surface-raised'),'color-secondary-bg':colour('surface'),'color-lines':colour('border'),'color-accent':colour('accent'),'color-accent-focus':colour('focus'),'color-accent-fg':colour('on-accent'),'color-confirm':status('success'),'color-warning':status('warning'),'color-error':status('critical')};
    const selector=mode==='dark' ? ':root[data-color-scheme="dark"], :root:not([data-color-scheme])' : ':root[data-color-scheme="light"]';
    css+=`\n${selector} {\n${Object.entries(vars).map(([k,v])=>`  --${k}: ${v};`).join('\n')}\n}\n`;
  }
  css+='\n:where(a,button,[role="button"],input,select,textarea):focus-visible { outline: 2px solid var(--color-content-fg); outline-offset: 2px; }\n.icon-button.active { color: var(--color-accent); }\n.notification-bar--error { border: 3px solid var(--color-error); }\n.notification-bar--warning { border: 2px dashed var(--color-warning); }\n';
  return `/* ${provenance(f)}\n   Tangerine Neue MIT, Niléane Dorffer. See TANGERINE-LICENSE.\n   Install through Mastodon Administration > Appearance > Custom CSS. */\n`+css;
}
