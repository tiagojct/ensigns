// Build local distributables. This script never contacts or publishes to a registry.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { build as bundleLibrary } from 'vite';
import { strToU8, zipSync } from 'fflate';
import { loadFamilies, repoRoot } from '../../lib/model/load.ts';
import { resolveFamily } from '../../lib/model/resolve.ts';
import { generateAll } from '../../lib/generators/index.ts';
import { INSTALL } from '../../lib/generators/install.ts';
import { json, provenance } from '../../lib/generators/common.ts';
import { buildExports } from '../export/generate.ts';
import { tarGzip } from './tar.ts';
import { integrations } from './integrations.ts';
import { mastodon } from './mastodon.ts';

const write=(path:string,content:string|Uint8Array)=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,content);};
const fixedTime=new Date('1980-01-01T00:00:00Z');
const readTree=(dir:string,prefix=''):Record<string,Uint8Array>=>{
  const files:Record<string,Uint8Array>={};
  for(const e of readdirSync(dir,{withFileTypes:true})){
    const key=prefix+e.name;
    if(e.isDirectory())Object.assign(files,readTree(join(dir,e.name),key+'/'));
    else files[key]=new Uint8Array(readFileSync(join(dir,e.name)));
  }
  return files;
};
export async function buildPackages(root=repoRoot(),out=join(root,'dist')){
  const version=JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version as string;
  const families=loadFamilies(root).map(f=>resolveFamily(f.file));
  const pkgDir=join(out,'packages'),releases=join(out,'releases'),exportsDir=join(out,'exports');
  // Every generated folder starts empty. A renamed export or an older version then leaves nothing
  // behind in the checksums, the archives or the npm package.
  for(const dir of [pkgDir,releases,exportsDir])rmSync(dir,{recursive:true,force:true});
  mkdirSync(releases,{recursive:true});
  buildExports(root,exportsDir);
  const licences=Object.fromEntries(['LICENSE-MIT','LICENSE-CC-BY-4.0'].map(n=>[`${n}.txt`,new Uint8Array(readFileSync(join(root,n)))]));
  for(const [n,content] of Object.entries(licences))write(join(releases,n),content);
  const collection:Record<string,Uint8Array>={...licences};
  for(const f of families){
    const tree:Record<string,Uint8Array>={...licences};
    tree[`${f.meta.id}.tokens.json`]=strToU8(json(f.source));
    tree['README.md']=new Uint8Array(readFileSync(join(root,'families',f.meta.id,'README.md')));
    tree['CHANGELOG.md']=new Uint8Array(readFileSync(join(root,'families',f.meta.id,'CHANGELOG.md')));
    const exports=generateAll(f);
    for(const result of exports)for(const file of result.files)tree[`exports/${result.generator.id}/${file.name}`]=typeof file.content==='string' ? strToU8(file.content) : file.content;
    tree['INSTALL.txt']=strToU8(provenance(f)+'\n\n'+exports.map(r=>`${r.generator.label}\n${r.reason ?? INSTALL[r.generator.id]}\n`).join('\n'));
    tree['manifest.json']=strToU8(json({family:f.meta.id,version:f.meta.version,files:Object.fromEntries(Object.entries(tree).map(([n,v])=>[n,createHash('sha256').update(v).digest('hex')]))}));
    write(join(releases,`${f.meta.id}-${f.meta.version}.zip`),zipSync(tree,{level:6,mtime:fixedTime}));
    for(const [path,data] of Object.entries(tree))collection[`${f.meta.id}/${path}`]=data;
  }
  collection['exports-manifest.json']=new Uint8Array(readFileSync(join(out,'exports/manifest.json')));
  write(join(releases,`ensigns-${version}.zip`),zipSync(collection,{level:6,mtime:fixedTime}));
  const npm=join(pkgDir,'npm');mkdirSync(npm,{recursive:true});
  await bundleLibrary({configFile:false,root,logLevel:'warn',build:{outDir:npm,emptyOutDir:false,target:'es2022',lib:{entry:join(root,'lib/index.ts'),formats:['es'],fileName:()=> 'index.js'},rollupOptions:{external:['culori']}}});
  execFileSync(join(root,'node_modules/.bin/tsc'),['--ignoreConfig','--declaration','--emitDeclarationOnly','--noEmit','false','--target','ES2023','--module','ESNext','--moduleResolution','Bundler','--allowImportingTsExtensions','--skipLibCheck','--outDir',join(npm,'types'),join(root,'lib/index.ts')],{cwd:root,stdio:'pipe'});
  write(join(npm,'package.json'),json({name:'@tiagojct/ensigns',version,type:'module',description:'Ten colour families and browser-safe export generators.',license:'SEE LICENSE IN LICENSE-MIT.txt',author:'Tiago Jacinto',homepage:'https://ensigns.tiagojacinto.eu',repository:{type:'git',url:'https://github.com/tiagojct/ensigns'},exports:{'.':{types:'./types/index.d.ts',import:'./index.js'},'./tokens/*':'./tokens/*.json','./exports/*':'./exports/*'},files:['index.js','types','tokens','exports','README.md','LICENSE-MIT.txt','LICENSE-CC-BY-4.0.txt'],dependencies:{culori:'^4.0.2'}}));
  write(join(npm,'README.md'),'# Ensigns\n\nTen colour families. Code MIT; tokens and generated colour values CC BY 4.0, Tiago Jacinto.\n\n```js\nimport { resolveFamily, generateAll } from "@tiagojct/ensigns";\nimport tokens from "@tiagojct/ensigns/tokens/pequod" with { type: "json" };\nconst files = generateAll(resolveFamily(tokens));\n```\n\nThe public API includes the pure model, colour calculations and 29 generators. File-system loading, schema validation and APCA are not included. Some families deliberately exclude formats.\n');
  for(const [n,v] of Object.entries(licences))write(join(npm,n),v);
  for(const f of families)write(join(npm,'tokens',`${f.meta.id}.json`),json(f.source));
  cpSync(join(out,'exports'),join(npm,'exports'),{recursive:true});
  // npm pack creates the conventional package/ tarball without lifecycle scripts.
  const packed=JSON.parse(execFileSync('npm',['pack','--cache',join(out,'.npm-cache'),'--offline','--ignore-scripts','--json','--pack-destination',releases],{cwd:npm,encoding:'utf8'}))[0];
  const tar=readFileSync(join(releases,packed.filename));rmSync(join(releases,packed.filename));write(join(releases,`ensigns-npm-${version}.tgz`),tar);
  const py=join(pkgDir,'python'),r=join(pkgDir,'r','ensigns');
  for(const f of families){
    const resolved=generateAll(f).find(x=>x.generator.id==='json')!.files[0]!.content;
    write(join(py,'src/ensigns/data',`${f.meta.id}.json`),resolved);
    write(join(r,'inst/tokens',`${f.meta.id}.json`),resolved);
    const charts=generateAll(f).find(x=>x.generator.id==='matplotlib')!;
    for(const file of charts.files)write(join(py,'src/ensigns/styles',file.name),file.content);
  }
  write(join(py,'pyproject.toml'),`[build-system]\nrequires = ["setuptools>=77"]\nbuild-backend = "setuptools.build_meta"\n\n[project]\nname = "ensigns"\nversion = "${version}"\ndescription = "Ten Ensigns colour families and matplotlib styles"\nrequires-python = ">=3.9"\nlicense = "MIT AND CC-BY-4.0"\nlicense-files = ["LICENSE-MIT.txt", "LICENSE-CC-BY-4.0.txt"]\n\n[project.optional-dependencies]\nplot = ["matplotlib>=3.8"]\n\n[tool.setuptools.packages.find]\nwhere = ["src"]\n\n[tool.setuptools.package-data]\nensigns = ["data/*.json", "styles/*"]\n`);
  cpSync(join(root,'packages/python/ensigns.py'),join(py,'src/ensigns/__init__.py'));
  write(join(r,'DESCRIPTION'),`Package: ensigns\nType: Package\nTitle: Ensigns Colour Families\nVersion: ${version}\nAuthor: Tiago Jacinto [aut, cre]\nMaintainer: Tiago Jacinto <tiagojacinto@med.up.pt>\nAuthors@R: person("Tiago", "Jacinto", role = c("aut", "cre"), email = "tiagojacinto@med.up.pt")\nDescription: Ten colour families and their resolved tokens, with ggplot2 themes and authored chart scales. Colour data are CC BY 4.0; code is MIT.\nLicense: MIT + file LICENSE\nEncoding: UTF-8\nImports: jsonlite\nSuggests: ggplot2\n`);
  write(join(r,'LICENSE'),'YEAR: 2026\nCOPYRIGHT HOLDER: Tiago Jacinto\n');
  write(join(r,'NAMESPACE'),'export(ensigns_tokens)\nexport(ensigns_colours)\nexport(theme_ensigns)\nexport(scale_colour_ensigns)\nexport(scale_fill_ensigns)\n');
  mkdirSync(join(r,'R'),{recursive:true});mkdirSync(join(r,'man'),{recursive:true});
  cpSync(join(root,'packages/r/ensigns.R'),join(r,'R/ensigns.R'));
  cpSync(join(root,'packages/r/ensigns.Rd'),join(r,'man/ensigns.Rd'));
  for(const dir of [py,r]){
    for(const [n,v] of Object.entries(licences))write(join(dir,n),v);
    write(join(dir,'README.md'),'# Ensigns\n\nLocal package from Ensigns '+version+'. Code MIT; colour data CC BY 4.0, Tiago Jacinto. See https://ensigns.tiagojacinto.eu/about/ and the included licence texts.\n');
  }
  write(join(releases,`ensigns-python-${version}.zip`),zipSync(readTree(py),{level:6,mtime:fixedTime}));
  write(join(releases,`ensigns-r-${version}.tar.gz`),tarGzip(readTree(r,'ensigns/')));
  write(join(pkgDir,'mastodon/RosebudUI.css'),mastodon(root,families.find(f=>f.meta.id==='rosebud')!));
  cpSync(join(root,'packages/mastodon/vendor/TANGERINE-LICENSE'),join(pkgDir,'mastodon/TANGERINE-LICENSE'));
  const integrated=integrations(families,version);
  for(const [path,content] of Object.entries(integrated))write(join(pkgDir,path),content);
  for(const group of ['typst','vscode','zed','tailwind','loomings','obsidian','firefox','mastodon']){
    const dir=join(pkgDir,group);
    for(const [n,v] of Object.entries(licences))write(join(dir,n),v);
    // Each independently installable theme keeps its attribution beside its manifest.
    if(group==='obsidian' || group==='firefox')for(const entry of readdirSync(dir,{withFileTypes:true})){
      if(entry.isDirectory())for(const [n,v] of Object.entries(licences))write(join(dir,entry.name,n),v);
    }
    if(group==='typst')write(join(dir,'LICENSE'),readFileSync(join(root,'LICENSE-MIT'),'utf8')+'\n'+readFileSync(join(root,'LICENSE-CC-BY-4.0'),'utf8'));
    write(join(dir,'README.md'),'# Ensigns '+group+'\n\nGenerated from Ensigns '+version+'. Code MIT; colour data CC BY 4.0, Tiago Jacinto. Installation: https://github.com/tiagojct/ensigns/blob/main/docs/RELEASE.md\n');
    write(join(releases,`ensigns-${group}-${version}.zip`),zipSync(readTree(dir),{level:6,mtime:fixedTime}));
  }
  const files=readdirSync(releases).filter(n=>n!== 'SHA256SUMS.txt').sort();
  write(join(releases,'SHA256SUMS.txt'),files.map(n=>`${createHash('sha256').update(readFileSync(join(releases,n))).digest('hex')}  ${n}`).join('\n')+'\n');
  return releases;
}
if(import.meta.url===new URL(process.argv[1]!, 'file:').href)await buildPackages();
