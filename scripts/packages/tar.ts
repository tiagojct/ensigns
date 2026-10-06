// Deterministic POSIX ustar. No operating-system attributes, owners or timestamps
// leak into the R source archive (macOS pax attributes break R's internal reader).
import { gzipSync } from 'fflate';
export function tarGzip(files: Record<string,Uint8Array>): Uint8Array {
  const blocks:Uint8Array[]=[];
  for(const [path,content] of Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))){
    const h=new Uint8Array(512),enc=new TextEncoder();
    const string=(at:number,size:number,value:string)=>{const b=enc.encode(value);if(b.length>=size)throw new Error(`Tar header value is too long: ${value}`);h.set(b,at);};
    const octal=(at:number,size:number,n:number)=>string(at,size,n.toString(8).padStart(size-1,'0'));
    string(0,100,path);octal(100,8,0o644);octal(108,8,0);octal(116,8,0);octal(124,12,content.length);octal(136,12,315532800);
    h.fill(32,148,156);h[156]=48;string(257,6,'ustar');h[263]=48;h[264]=48;
    const sum=h.reduce((n,v)=>n+v,0);string(148,7,sum.toString(8).padStart(6,'0'));h[155]=32;
    const body=new Uint8Array(Math.ceil(content.length/512)*512);body.set(content);blocks.push(h,body);
  }
  blocks.push(new Uint8Array(1024));const bytes=new Uint8Array(blocks.reduce((n,b)=>n+b.length,0));let at=0;for(const b of blocks){bytes.set(b,at);at+=b.length;}
  return gzipSync(bytes,{level:6,mtime:0});
}
