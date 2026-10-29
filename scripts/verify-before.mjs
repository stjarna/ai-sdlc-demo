import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const root=resolve(process.env.CAPTURE_DIR??'demo/before');
const manifest=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
const hash=raw=>createHash('sha256').update(raw).digest('hex');
const expected=Object.keys(manifest.files).sort();
const actual=(await readdir(root)).filter(name=>name!=='manifest.json').sort();
if(JSON.stringify(expected)!==JSON.stringify(actual))throw new Error('BEFORE asset file set changed.');
for(const [name,digest] of Object.entries(manifest.files)) {
  if(name.includes('/')||name.includes('\\')||name==='..')throw new Error('Unsafe capture file reference.');
  if(hash(await readFile(join(root,name)))!==digest)throw new Error(`BEFORE asset changed: ${name}`);
}
if(process.argv.includes('--source'))for(const [name,digest] of Object.entries(manifest.source)) {
  if(hash(await readFile(resolve(name)))!==digest)throw new Error(`Current source differs from captured baseline: ${name}`);
}
console.log(`Verified ${expected.length} BEFORE assets${process.argv.includes('--source')?' and captured application source':''}.`);
