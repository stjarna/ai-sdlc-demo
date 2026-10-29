/** Automated, actual UI walkthroughs. Never overwrites a captured evidence directory. */
import { chromium, expect } from '@playwright/test';
import { mkdtemp, mkdir, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { startApp, projectRoot } from '../test/helpers/server.mjs';

const output=resolve(projectRoot,process.env.CAPTURE_DIR ?? 'demo/before');
if (output===projectRoot || !output.startsWith(projectRoot+'/')) throw new Error('Capture assets must stay inside this repository.');
await mkdir(output,{ recursive:true });
if (!(await realpath(output)).startsWith((await realpath(projectRoot))+'/')) throw new Error('Capture directory resolves outside this repository.');
if ((await readdir(output)).length) throw new Error('Capture directory is not empty. Preserve BEFORE evidence; choose a new CAPTURE_DIR.');
const temp=await mkdtemp(join(tmpdir(),'littlelist-capture-'));
let app;
let browser;
const fixturesRaw=await readFile(new URL('./demo-fixtures.json',import.meta.url));
const fixtures=JSON.parse(fixturesRaw);
const actions=[];
const hash=raw=>createHash('sha256').update(raw).digest('hex');
const pause=page=>page.waitForTimeout(650); // Recording pacing only; assertions govern test correctness.
async function ready(page) { await page.goto(app.url); await expect(page.getByText('Opening your list…')).toBeHidden(); }
async function add(page,title,description='') {
  await page.locator('#new-title').fill(title);
  if (description) {
    if (await page.locator('#new-description-section').isHidden()) await page.getByRole('button',{ name:/Add a description/ }).click();
    await page.locator('#new-description').fill(description);
  }
  await page.getByRole('button',{ name:'Add task',exact:true }).click();
  await expect(page.getByRole('button',{ name:`Edit “${title}”`,exact:true })).toBeVisible();
}
async function toggle(page,title,completed=false) {
  await page.getByRole('button',{ name:`Mark “${title}” as ${completed?'unfinished':'complete'}`,exact:true }).click();
}
async function shot(page,name,fullPage=false) { await page.screenshot({ path:join(output,name),fullPage,animations:'disabled' }); }
async function recording(name,viewport,run) {
  const context=await browser.newContext({ viewport,deviceScaleFactor:1,colorScheme:'light',locale:'en-US',reducedMotion:'reduce',recordVideo:{ dir:join(output,'.recordings'),size:viewport } });
  const errors=[];const page=await context.newPage();const video=page.video();
  page.on('pageerror',error=>errors.push(error.message));
  await context.tracing.start({ screenshots:true,snapshots:true,sources:true });
  try { await ready(page);await run(page);expect(errors).toEqual([]); }
  finally { await context.tracing.stop({ path:join(output,name+'-trace.zip') });await context.close(); }
  await rename(await video.path(),join(output,name+'.webm'));
}
const sourceFiles=['package.json','package-lock.json','.nvmrc','scripts/capture-before.mjs','scripts/demo-fixtures.json','test/helpers/server.mjs'];
for (const dir of ['src','public']) for(const name of await readdir(join(projectRoot,dir)))sourceFiles.push(dir+'/'+name);
async function sourceInventory() {
  const source={};for(const name of sourceFiles.sort())source[name]=hash(await readFile(join(projectRoot,name)));
  return source;
}
const capturedSource=await sourceInventory();
try {
  app=await startApp(join(temp,'capture.sqlite'));
  browser=await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel:process.env.PLAYWRIGHT_CHANNEL } : {});
  const setup=await browser.newContext({ viewport:{ width:1440,height:1000 },colorScheme:'light',locale:'en-US' });
  const page=await setup.newPage();await ready(page);
  await shot(page,'desktop-empty.png');
  for (const task of fixtures) { await add(page,task.title,task.description);if(task.completed)await toggle(page,task.title); }
  await expect(page.locator('#task-total')).toHaveText('6');await setup.close();
  await writeFile(join(output,'fixtures.json'),fixturesRaw);
  await recording('desktop-walkthrough',{ width:1440,height:1000 },async page=>{
    await shot(page,'desktop-tasks.png');await pause(page);
    const initial='Make a little room for a new idea';const revised='Make room for a good idea';
    await add(page,initial,'One small step is enough to get started.');await pause(page);actions.push('Desktop: create task with optional description through the UI.');
    await page.getByRole('button',{ name:`Edit details for “${initial}”`,exact:true }).click();
    await page.locator('#edit-title').fill(revised);await page.locator('#edit-description').fill('Write a few notes, then choose one small next step.');
    await expect(page.locator('#edit-save-status')).toHaveText('All changes saved');
    await expect(page.locator('#toast')).toBeHidden();
    await shot(page,'desktop-task-details.png');await pause(page);actions.push('Desktop: edit title/description and wait for actual autosave.');
    await page.locator('#edit-title').fill('');await expect(page.locator('#edit-title-error')).toBeVisible();
    await shot(page,'desktop-title-validation.png');await pause(page);
    await page.getByRole('button',{ name:'Cancel draft' }).click();
    await expect(page.getByRole('button',{ name:`Edit “${revised}”`,exact:true })).toBeVisible();
    actions.push('Desktop: empty draft rejected; cancel retains previously autosaved title.');
    await toggle(page,revised);await page.getByRole('button',{ name:/^Completed / }).click();
    await expect(page.getByRole('button',{ name:`Edit “${revised}”`,exact:true })).toBeVisible();
    await shot(page,'desktop-completed.png');await pause(page);
    await toggle(page,revised,true);await page.getByRole('button',{ name:/^Active / }).click();await pause(page);
    actions.push('Desktop: complete, filter, and reopen task without confirmation.');
    await page.getByRole('button',{ name:`Delete “${revised}”`,exact:true }).click();await shot(page,'desktop-delete-confirmation.png');await pause(page);
    await page.getByRole('button',{ name:'Keep task',exact:true }).click();
    await expect(page.getByRole('button',{ name:`Edit “${revised}”`,exact:true })).toBeVisible();
    await page.getByRole('button',{ name:`Delete “${revised}”`,exact:true }).click();await page.getByRole('button',{ name:'Delete task',exact:true }).click();
    await expect(page.locator('#task-total')).toHaveText('6');await pause(page);actions.push('Desktop: cancel deletion, then confirm permanent deletion.');
  });
  await recording('mobile-walkthrough',{ width:390,height:844 },async page=>{
    await shot(page,'mobile-tasks.png',true);await pause(page);
    await add(page,'Pack a small bag');await pause(page);
    await page.getByRole('button',{ name:'Edit details for “Pack a small bag”',exact:true }).click();
    await page.locator('#edit-title').fill('Pack the essentials');await page.locator('#edit-description').fill('A book, a water bottle, and a little room to spare.');
    await expect(page.locator('#edit-save-status')).toHaveText('All changes saved');await shot(page,'mobile-task-details.png');await pause(page);
    await page.getByRole('button',{ name:'Done',exact:true }).click();
    await toggle(page,'Pack the essentials');await page.getByRole('button',{ name:/^Completed / }).click();await pause(page);
    await toggle(page,'Pack the essentials',true);await page.getByRole('button',{ name:/^Active / }).click();
    await page.getByRole('button',{ name:'Delete “Pack the essentials”',exact:true }).click();await pause(page);
    await page.getByRole('button',{ name:'Delete task',exact:true }).click();await expect(page.locator('#task-total')).toHaveText('6');await pause(page);
    actions.push('Mobile: create, autosave edits, complete/reopen, and confirm deletion through the responsive UI.');
  });
  await rm(join(output,'.recordings'),{ recursive:true,force:true });
  const source=await sourceInventory();
  if(JSON.stringify(source)!==JSON.stringify(capturedSource)) throw new Error('Source changed during recording; capture is not a stable baseline.');
  const ffmpeg=spawnSync('ffmpeg',['-version'],{ encoding:'utf8' });
  let transcoder=null;
  if(ffmpeg.status===0) {
    transcoder=ffmpeg.stdout.split('\n')[0];
    for(const name of ['desktop-walkthrough','mobile-walkthrough']) {
      const converted=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-n','-i',join(output,name+'.webm'),'-c:v','libx264','-preset','slow','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-an',join(output,name+'.mp4')],{ encoding:'utf8',timeout:120000 });
      if(converted.status!==0)throw new Error('Presentation MP4 conversion failed: '+converted.stderr);
    }
  }
  const files={};for(const name of (await readdir(output)).sort())files[name]=hash(await readFile(join(output,name)));
  const pkg=JSON.parse(await readFile(new URL('../node_modules/@playwright/test/package.json',import.meta.url),'utf8'));
  const manifest={ schemaVersion:1,purpose:'BEFORE: standalone CRUD baseline, prior to SDLC adoption',
    actor:'Automated real-browser capture; no human decisions or approvals simulated',capturedAt:new Date().toISOString(),
    node:process.version,playwright:pkg.version,browser:browser.version(),transcoder,browserChannel:process.env.PLAYWRIGHT_CHANNEL??'bundled chromium',
    desktopViewport:{width:1440,height:1000},mobileViewport:{width:390,height:844},
    fixturesDigest:hash(fixturesRaw),source,actions,files };
  await writeFile(join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({ output:relative(projectRoot,output),assets:Object.keys(files),browser:manifest.browser,actions:actions.length },null,2));
} finally {
  try { await browser?.close(); }
  finally { try { await app?.stop(); } finally { await rm(temp,{ recursive:true,force:true }); } }
}
