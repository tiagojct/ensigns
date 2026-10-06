// CI/local guard: independent builds of the current tokens have identical bytes.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildExports } from './generate.ts';
import { repoRoot } from '../../lib/model/load.ts';
const temp=mkdtempSync(join(tmpdir(),'ensigns-freshness-'));
try{
  const a=buildExports(repoRoot(),join(temp,'a')),b=buildExports(repoRoot(),join(temp,'b'));
  if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('Export paths differ between builds');
  for(const path of a)if(!readFileSync(join(temp,'a',path)).equals(readFileSync(join(temp,'b',path))))throw new Error(`Export bytes differ: ${path}`);
  console.log(`${a.length-1} exports and their source-hash manifest are repeatable.`);
}finally{rmSync(temp,{recursive:true,force:true});}
