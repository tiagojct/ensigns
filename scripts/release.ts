// One portable delivery: the built static site, packages, tokens and owner instructions.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { strToU8, zipSync } from 'fflate';
import { repoRoot } from '../lib/model/load.ts';
const root=repoRoot(),version=JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
const tree:Record<string,Uint8Array>={};
function collect(dir:string,prefix:string){for(const e of readdirSync(dir,{withFileTypes:true})){if(e.isDirectory())collect(join(dir,e.name),prefix+e.name+'/');else tree[prefix+e.name]=new Uint8Array(readFileSync(join(dir,e.name)));}}
collect(join(root,'site/dist'),'site/');
collect(join(root,'dist/packages'),'packages/');
for(const file of ['README.md','docs/RELEASE.md','docs/migration/CHECKPOINT-4.md','LICENSE-MIT','LICENSE-CC-BY-4.0','CITATION.cff'])tree[file]=new Uint8Array(readFileSync(join(root,file)));
tree['START-HERE.txt']=strToU8(`Ensigns ${version}\n\nsite/ is the finished static site. Serve it over HTTP (for example python3 -m http.server 8080 --directory site) and open http://localhost:8080.\n\npackages/ holds the local installable packages and consumer files. Downloadable family bundles are in site/releases/. docs/RELEASE.md has installation, deployment and owner publication steps.\n\nCode MIT. Tokens, generated colour values and documentation CC BY 4.0, Tiago Jacinto. Fonts and the Tangerine template retain their licences.\n`);
const out=join(root,'dist',`ensigns-${version}.zip`);mkdirSync(join(root,'dist'),{recursive:true});const zip=zipSync(tree,{level:6,mtime:new Date('1980-01-01T00:00:00Z')});writeFileSync(out,zip);writeFileSync(out+'.sha256',`${createHash('sha256').update(zip).digest('hex')}  ensigns-${version}.zip\n`);console.log(`Delivery: ${out} (${(zip.length/1024/1024).toFixed(1)} MB)`);
