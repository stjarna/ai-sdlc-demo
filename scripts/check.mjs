import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(root) {
  const result=[];
  for (const entry of await readdir(root,{ withFileTypes:true })) {
    const path=join(root,entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (/\.(mjs|js)$/.test(path)) result.push(path);
  }
  return result;
}
const files=[...await walk('src'),...await walk('public'),...await walk('scripts'),...await walk('test'),'playwright.config.mjs'];
for (const path of files) {
  const result=spawnSync(process.execPath,['--check',path],{ encoding:'utf8' });
  if (result.status!==0) { console.error(result.stderr);process.exit(1); }
}
const html=await readFile('public/index.html','utf8');
for (const asset of ['/app.js','/styles.css','/favicon.svg']) {
  if (!html.includes(asset)) throw new Error(`Missing local asset reference: ${asset}`);
}
console.log(`Syntax and local-asset checks passed (${files.length} JavaScript modules).`);
