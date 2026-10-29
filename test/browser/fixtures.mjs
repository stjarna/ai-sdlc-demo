import { test as base, expect } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startApp } from '../helpers/server.mjs';

export const test = base.extend({
  app: async ({}, use) => {
    const dir = await mkdtemp(join(tmpdir(),'littlelist-browser-')); const db = join(dir,'tasks.sqlite');
    let running = await startApp(db);
    try {
      await use({ get url() { return running.url; }, async restart() { await running.stop(); running = await startApp(db); } });
    } finally { await running.stop(); await rm(dir,{ recursive:true,force:true }); }
  },
  page: async ({ page, app }, use) => {
    const errors=[]; page.on('pageerror',error => errors.push(error.message));
    await page.goto(app.url); await expect(page.getByText('Opening your list…')).toBeHidden();
    await use(page); expect(errors,'No unhandled application errors').toEqual([]);
  },
});
export { expect };
export async function addTask(page,title,description) {
  await page.getByRole('textbox',{ name:'New task title',exact:true }).fill(title);
  if (description !== undefined) {
    if (await page.locator('#new-description-section').isHidden()) await page.getByRole('button',{ name:/Add a description/ }).click();
    await page.getByRole('textbox',{ name:'Task description',exact:true }).fill(description);
  }
  await page.getByRole('button',{ name:'Add task',exact:true }).click();
  await expect(page.getByRole('button',{ name:`Edit “${title}”`,exact:true })).toBeVisible();
}
