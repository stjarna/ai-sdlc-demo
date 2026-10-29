import { mkdtemp,mkdir,readFile,writeFile,rename,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve,join } from 'node:path';
import { pathToFileURL } from 'node:url';
const [projectArg,outputArg,phase]=process.argv.slice(2);const project=resolve(projectArg);const output=resolve(outputArg);
const {chromium,expect}=await import(pathToFileURL(join(project,'node_modules/@playwright/test/index.mjs')));
const {startApp}=await import(pathToFileURL(join(project,'test/helpers/server.mjs')));
await mkdir(join(output,'screenshots'),{recursive:true});await mkdir(join(output,'recordings'),{recursive:true});await mkdir(join(output,'metadata'),{recursive:true});
const temp=await mkdtemp(join(tmpdir(),'littlelist-phase02-ui-'));let app,browser;
try {
 app=await startApp(join(temp,'tasks.sqlite'));browser=await chromium.launch();
 const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,colorScheme:'light',locale:'en-US',reducedMotion:'reduce',recordVideo:{dir:join(output,'recordings',phase+'-raw'),size:{width:1920,height:1080}}});
 const fixture=JSON.parse(await readFile(join(project,'scripts/demo-fixtures.json'),'utf8'));
 for(const t of fixture){const r=await context.request.post(app.url+'/api/tasks',{data:{title:t.title,description:t.description}});expect(r.status()).toBe(201);const {task}=await r.json();if(t.completed)expect((await context.request.patch(app.url+'/api/tasks/'+task.id,{data:{completed:true}})).ok()).toBeTruthy();}
 const page=await context.newPage();const video=page.video();await page.goto(app.url);await expect(page.locator('#task-total')).toHaveText('6');
 await page.screenshot({path:join(output,'screenshots',phase+'-littlelist.png')});await page.waitForTimeout(2500);
 await page.locator('#new-title').fill('Keep things simple');await page.getByRole('button',{name:'Add task',exact:true}).click();await expect(page.locator('#task-total')).toHaveText('7');await page.waitForTimeout(2500);
 await page.getByRole('button',{name:'Mark “Keep things simple” as complete',exact:true}).click();await page.getByRole('button',{name:/^Completed /}).click();await expect(page.getByRole('button',{name:'Edit “Keep things simple”',exact:true})).toBeVisible();await page.waitForTimeout(2500);
 const tasks=await (await context.request.get(app.url+'/api/tasks')).json();expect(tasks.tasks.every(t=>Object.keys(t).sort().join(',')==='completed,description,id,title')).toBe(true);expect(await page.locator('input[type=date],input[type=datetime-local]').count()).toBe(0);
 await context.close();await rename(await video.path(),join(output,'recordings',phase+'-littlelist.webm'));await rm(join(output,'recordings',phase+'-raw'),{recursive:true});
 await writeFile(join(output,'metadata',phase+'-application.json'),JSON.stringify({captured_at:new Date().toISOString(),project,url:app.url,viewport:{width:1920,height:1080},browser:browser.version(),fixture_method:'Fictional tasks seeded through real HTTP API into isolated temporary SQLite database; recorded creation and completion use actual browser UI.',task_fields:Object.keys(tasks.tasks[0]),date_controls:0,checks_passed:true},null,2)+'\n');
 console.log(JSON.stringify({phase,url:app.url,checks_passed:true,browser:browser.version(),screenshot:phase+'-littlelist.png',recording:phase+'-littlelist.webm'}));
} finally {await browser?.close();await app?.stop();await rm(temp,{recursive:true,force:true});}
