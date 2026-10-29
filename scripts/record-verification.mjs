/** Preserve real test output without replacing earlier evidence. */
import { spawnSync } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { projectRoot } from '../test/helpers/server.mjs';
const output=resolve(projectRoot,process.env.VERIFICATION_DIR??'demo/verification');
if(!output.startsWith(projectRoot+'/'))throw new Error('Evidence must stay inside the repository.');
await mkdir(output,{recursive:true});
if(!(await realpath(output)).startsWith((await realpath(projectRoot))+'/'))throw new Error('Evidence resolves outside the repository.');
if((await readdir(output)).length)throw new Error('Evidence directory is not empty; choose another VERIFICATION_DIR.');
async function inventory() {
  const files={};
  async function walk(dir) { for(const entry of await readdir(join(projectRoot,dir),{withFileTypes:true})) {
    const name=dir+'/'+entry.name;if(entry.isDirectory())await walk(name);else files[name]=createHash('sha256').update(await readFile(join(projectRoot,name))).digest('hex');
  }}
  for(const dir of ['src','public','test','scripts'])await walk(dir);
  for(const name of ['package.json','package-lock.json','playwright.config.mjs','.nvmrc'])files[name]=createHash('sha256').update(await readFile(join(projectRoot,name))).digest('hex');
  return files;
}
const source=await inventory();const results=[];
function run(name,command,args) {
  const result=spawnSync(command,args,{cwd:projectRoot,encoding:'utf8',maxBuffer:20*1024*1024,env:{...process.env,PLAYWRIGHT_JSON_OUTPUT_FILE:join(output,'browser-results.json')}});
  const log=(result.stdout??'')+(result.stderr??'')+(result.error?'\n'+result.error.message:'');
  results.push({name,command:[command,...args],exitCode:result.status,passed:result.status===0,log:name+'.log'});
  return writeFile(join(output,name+'.log'),log);
}
await run('static',process.execPath,['scripts/check.mjs']);
for(const group of ['unit','integration']) {
  const files=(await readdir(join(projectRoot,'test',group))).filter(n=>n.endsWith('.test.mjs')).sort().map(n=>'test/'+group+'/'+n);
  await run(group,process.execPath,['--test','--test-reporter=tap',...files]);
  const log=await readFile(join(output,group+'.log'),'utf8');
  results.at(-1).counts=Object.fromEntries(['tests','pass','fail','skipped'].map(key=>[key,Number(log.match(new RegExp('^# '+key+' (\\d+)','m'))?.[1]??0)]));
}
await run('browser',process.execPath,['node_modules/@playwright/test/cli.js','test']);
try { results.at(-1).counts=JSON.parse(await readFile(join(output,'browser-results.json'),'utf8')).stats; } catch { results.at(-1).passed=false; }
const unchanged=JSON.stringify(source)===JSON.stringify(await inventory());
const files={};for(const name of (await readdir(output)).sort())files[name]=createHash('sha256').update(await readFile(join(output,name))).digest('hex');
const report={schemaVersion:1,recordedAt:new Date().toISOString(),node:process.version,source,sourceUnchanged:unchanged,passed:unchanged&&results.every(r=>r.passed),results,files};
await writeFile(join(output,'summary.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,results},null,2));
if(!report.passed)process.exitCode=1;
