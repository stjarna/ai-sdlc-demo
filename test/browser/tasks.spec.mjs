import { test, expect, addTask } from './fixtures.mjs';

const edit = (page,title) => page.getByRole('button',{ name:`Edit details for “${title}”`,exact:true }).click();
const toggle = (page,title,completed = false) => page.getByRole('button',{ name:`Mark “${title}” as ${completed ? 'unfinished' : 'complete'}`,exact:true }).click();

test('empty state, required title and quick creation without description', async ({ page }) => {
  await expect(page.getByRole('heading',{ name:'A clear space. A fresh start.' })).toBeVisible();
  await page.getByRole('button',{ name:'Add task',exact:true }).click();
  await expect(page.getByText('A title is required.',{ exact:true })).toBeVisible();
  await expect(page.locator('#new-title')).toBeFocused();
  await addTask(page,'Read a chapter');
  await expect(page.locator('.task-item')).toHaveCount(1);
  await expect(page.locator('.task-description')).toHaveCount(0);
  await expect(page.locator('#new-title')).toHaveValue('');
});
test('supports title and optional description, newest-first ordering and filters', async ({ page }) => {
  await addTask(page,'First task','Useful context.'); await addTask(page,'Second task');
  await expect(page.locator('.task-title')).toHaveText(['Second task','First task']);
  await toggle(page,'Second task'); await expect(page.locator('.task-title')).toHaveText(['First task']);
  await page.getByRole('button',{ name:/^Completed / }).click();
  await expect(page.locator('.task-title')).toHaveText(['Second task']);
  await toggle(page,'Second task',true); await expect(page.locator('.task-item')).toHaveCount(0);
  await page.getByRole('button',{ name:/^All / }).click();
  await expect(page.locator('.task-title')).toHaveText(['Second task','First task']);
});
test('autosaves valid edits and keeps previous valid title when draft is empty', async ({ page, app }) => {
  await addTask(page,'Original title','Original description'); await edit(page,'Original title');
  await page.getByRole('textbox',{ name:/^Task title/ }).fill('A better title');
  await page.getByRole('textbox',{ name:/^Description/ }).fill('A little more detail.');
  await expect(page.locator('#edit-save-status')).toHaveText('All changes saved');
  await expect.poll(async () => (await (await page.request.get(app.url+'/api/tasks')).json()).tasks[0].title).toBe('A better title');
  await page.getByRole('textbox',{ name:/^Task title/ }).fill('   ');
  await expect(page.locator('#edit-title-error')).toContainText('A title is required');
  await expect(page.locator('#edit-done')).toBeDisabled();
  await page.getByRole('button',{ name:'Cancel draft' }).click();
  await expect(page.locator('.task-title')).toHaveText(['A better title']);
  await edit(page,'A better title');
  await expect(page.locator('#edit-description')).toHaveValue('A little more detail.');
});
test('cancel discards only the unsaved draft, including a pending valid edit', async ({ page }) => {
  await addTask(page,'Saved title'); await edit(page,'Saved title');
  await page.clock.install({ time:0 }); await page.clock.pauseAt(1000);
  await page.locator('#edit-title').fill('Unsaved replacement');
  await page.getByRole('button',{ name:'Cancel draft' }).click();
  await page.clock.runFor(1000); await page.reload();
  await expect(page.locator('.task-title')).toHaveText(['Saved title']);
});
test('delete is confirmed, cancellable, and works for completed tasks too', async ({ page }) => {
  await addTask(page,'Keep or remove');
  await page.getByRole('button',{ name:'Delete “Keep or remove”',exact:true }).click();
  await expect(page.getByRole('dialog',{ name:'Delete this task?' })).toBeVisible();
  await expect(page.getByRole('button',{ name:'Keep task',exact:true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.locator('.task-item')).toHaveCount(1);
  await toggle(page,'Keep or remove'); await page.getByRole('button',{ name:/^Completed / }).click();
  await page.getByRole('button',{ name:'Delete “Keep or remove”',exact:true }).click();
  await page.getByRole('button',{ name:'Delete task',exact:true }).click();
  await expect(page.locator('.task-item')).toHaveCount(0);
  await page.getByRole('button',{ name:/^All / }).click(); await expect(page.locator('#task-total')).toHaveText('0');
});
test('tasks and completion survive browser reload and actual server process restart', async ({ page, app }) => {
  await addTask(page,'Persistent task','Stored in SQLite.'); await toggle(page,'Persistent task');
  await page.reload(); await page.getByRole('button',{ name:/^Completed / }).click();
  await expect(page.locator('.task-title')).toHaveText(['Persistent task']);
  await app.restart(); await page.goto(app.url);
  await page.getByRole('button',{ name:/^Completed / }).click();
  await expect(page.locator('.task-title')).toHaveText(['Persistent task']);
  await expect(page.locator('.task-description')).toHaveText(['Stored in SQLite.']);
});
test('keyboard focus remains usable after completion and deleting the final task', async ({ page }) => {
  await addTask(page,'First'); await addTask(page,'Second');
  const complete=page.getByRole('button',{ name:'Mark “Second” as complete',exact:true });
  await complete.focus(); await page.keyboard.press('Space');
  await expect(page.getByRole('button',{ name:'Mark “First” as complete',exact:true })).toBeFocused();
  await page.getByRole('button',{ name:'Delete “First”',exact:true }).click();
  await page.getByRole('button',{ name:'Delete task',exact:true }).click();
  await expect(page.locator('#new-title')).toBeFocused();
});
test('personal text is rendered literally and never interpreted as HTML', async ({ page }) => {
  const title='<img src=x onerror=alert(1)> Přečíst knihu 🌿';
  await addTask(page,title,'<script>alert(1)</script>');
  await expect(page.locator('.task-title')).toHaveText([title]);
  await expect(page.locator('.task-description script,.task-title img')).toHaveCount(0);
});
test('network failure keeps a new-task draft and supports a successful retry', async ({ page }) => {
  await page.route('**/api/tasks',route => route.request().method()==='POST' ? route.abort() : route.continue());
  await page.locator('#new-title').fill('Keep this draft'); await page.getByRole('button',{ name:'Add task',exact:true }).click();
  await expect(page.locator('#connection-error')).toBeVisible(); await expect(page.locator('#new-title')).toHaveValue('Keep this draft');
  await page.unroute('**/api/tasks'); await page.getByRole('button',{ name:'Add task',exact:true }).click();
  await expect(page.locator('.task-title')).toHaveText(['Keep this draft']);
});
test('failed autosave is visible and does not pretend that the draft was persisted', async ({ page, app }) => {
  await addTask(page,'Saved original'); await edit(page,'Saved original');
  await page.route('**/api/tasks/*',route => route.request().method()==='PATCH' ? route.fulfill({ status:503,contentType:'application/json',body:JSON.stringify({ error:{ message:'Storage unavailable for this test.' } }) }) : route.continue());
  await page.locator('#edit-title').fill('Unsaved failed edit');
  await expect(page.locator('#edit-error')).toContainText('Storage unavailable');
  await expect(page.locator('#edit-save-status')).toContainText('not saved');
  expect((await (await page.request.get(app.url+'/api/tasks')).json()).tasks[0].title).toBe('Saved original');
  await page.getByRole('button',{ name:'Cancel draft' }).click();
  await expect(page.locator('.task-title')).toHaveText(['Saved original']);
});
test('responsive layout has no horizontal overflow or date-related controls', async ({ page }) => {
  await addTask(page,'A comfortably long task title that remains readable in a narrow window','A longer description to exercise wrapping rather than horizontal scrolling.');
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({ width,height:900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width:320,height:700 });
  await expect(page.locator('input[type=date],input[type=datetime-local],input[type=time]')).toHaveCount(0);
  await edit(page,'A comfortably long task title that remains readable in a narrow window');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('#edit-title')).toBeFocused();
});
