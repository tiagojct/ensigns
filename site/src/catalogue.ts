/// <reference lib="dom" />
import { resolveFamily } from '../../lib/model/resolve.ts';
import type { FamilyFile } from '../../lib/model/types.ts';
export async function catalogue(){
  const response=await fetch('/catalogue.json');
  if(!response.ok)throw new Error('Catalogue unavailable');
  const data=await response.json() as {version:string;families:FamilyFile[]};
  return {...data,families:data.families.map(resolveFamily)};
}
