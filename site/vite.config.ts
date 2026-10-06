import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';
const root=resolve(import.meta.dirname,'.generated');
const entries: Record<string,string>={index:join(root,'index.html')};
for(const dir of readdirSync(root,{withFileTypes:true})) if(dir.isDirectory()) entries[dir.name]=join(root,dir.name,'index.html');
export default defineConfig({
  root, publicDir:resolve(import.meta.dirname,'public'), appType:'mpa', clearScreen:false,
  server:{host:'127.0.0.1',port:5173,fs:{allow:[resolve(import.meta.dirname,'..')]}},
  preview:{host:'127.0.0.1',port:4174},
  build:{outDir:resolve(import.meta.dirname,'dist'),emptyOutDir:true,target:'es2022',sourcemap:false,rollupOptions:{input:entries}},
});
