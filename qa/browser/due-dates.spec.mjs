import { test as base, expect } from '@playwright/test';
import { isolatedApp } from '../helpers.mjs';
const test = base.extend({
  legacy: [false, { option: true }],
  app: async ({ legacy }, use) => { const app = await isolatedApp({ legacy }); try { await use(app); } finally { await app.close(); } },
  page: async ({ page, app }, use) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    // Same local 1 January in both projects. This controls test data, not a product rule.
    await page.clock.install({ time: new Date('2026-01-01T08:00:00Z') });
    await page.goto(app.url); await expect(page.locator('#loading')).toBeHidden();
    await use(page); expect(errors, 'No unhandled browser application errors').toEqual([]);
  },
});
function row(page, title) { return page.locator('.task-item').filter({ has: page.getByRole('button', { name: `Edit “${title}”`, exact: true }) }); }
async function create(page, title, dueDate) {
  await page.locator('#new-title').fill(title);
  if (dueDate !== undefined) await page.locator('#new-due-date').fill(dueDate);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(row(page, title)).toBeVisible();
}
async function edit(page, title) { await page.getByRole('button', { name: `Edit details for “${title}”`, exact: true }).click(); await expect(page.locator('#edit-dialog')).toBeVisible(); }
async function saved(page) { await expect(page.locator('#edit-save-status')).toHaveText('All changes saved'); }
async function close(page) { await page.getByRole('button', { name: 'Cancel draft', exact: true }).click(); await expect(page.locator('#edit-dialog')).not.toBeVisible(); }
async function textMode(page) { if (await page.locator('#edit-type-date').isVisible()) await page.locator('#edit-type-date').click(); }
async function all(page) { await page.getByRole('button', { name: /^All / }).click(); }

test('TC-001: empty optional due date creates a usable undated task', async ({ page }) => {
  await create(page, 'No date'); await expect(row(page, 'No date').locator('.task-due-date')).toHaveCount(0);
  await edit(page, 'No date'); await expect(page.locator('#edit-due-date')).toHaveValue(''); await close(page);
});
test('TC-002 TC-003 TC-016: past/today/future dates accepted on creation and autosaved edits', async ({ page }) => {
  await expect(page.locator('#new-due-date')).not.toHaveAttribute('min', /.+/);
  for (const [name, date] of [['Past', '2025-12-31'], ['Today', '2026-01-01'], ['Future', '2026-01-02']]) {
    await create(page, name, date); await expect(row(page, name).locator('.task-due-date')).toContainText(date);
  }
  await edit(page, 'Today');
  for (const date of ['2025-12-31', '2026-01-01', '2026-01-02']) {
    await page.locator('#edit-due-date').fill(date); await saved(page);
    await expect(row(page, 'Today').locator('.task-due-date')).toContainText(date);
  }
  await close(page);
});
test('TC-004 TC-005: edit and clear autosave without a separate save action', async ({ page }) => {
  await create(page, 'Edit date', '2026-01-01'); await edit(page, 'Edit date');
  await page.locator('#edit-due-date').fill('2025-12-31'); await saved(page);
  await expect(row(page, 'Edit date').locator('.overdue-label')).toBeVisible();
  await page.locator('#edit-clear-date').click(); await saved(page); await close(page);
  await expect(row(page, 'Edit date').locator('.task-due-date')).toHaveCount(0);
  await expect(row(page, 'Edit date').locator('.overdue-label')).toHaveCount(0);
  await edit(page, 'Edit date'); await expect(page.locator('#edit-due-date')).toHaveValue('');
});
test('TC-006 TC-017: impossible calendar drafts preserve the saved valid leap day', async ({ page, app }) => {
  await create(page, 'Leap day', '2024-02-29'); await edit(page, 'Leap day'); await textMode(page);
  for (const value of ['2025-02-29', '2024-02-30']) {
    await page.locator('#edit-due-date').fill(value);
    await expect(page.locator('#edit-due-date-error')).toBeVisible(); await expect(page.locator('#edit-done')).toBeDisabled();
    // Let the real autosave interval elapse; asserting the server proves no destructive save occurred.
    await page.waitForTimeout(650);
    const tasks = (await (await page.request.get(app.url + '/api/tasks')).json()).tasks;
    expect(tasks[0].dueDate).toBe('2024-02-29');
  }
  await close(page); await expect(row(page, 'Leap day').locator('.task-due-date')).toContainText('2024-02-29');
});
test('TC-006: partial date input cannot silently clear the saved date', async ({ page, app, isMobile }) => {
  await create(page, 'Native draft', '2024-02-29'); await edit(page, 'Native draft');
  const date = page.locator('#edit-due-date');
  if (isMobile) {
    // Mobile native pickers do not expose desktop keyboard segments. Use the actual
    // user-facing text-entry alternative to establish the same invalid partial draft.
    await page.locator('#edit-type-date').click();
    await date.fill('2024-02-');
    await expect(date).toHaveValue('2024-02-');
  } else {
    await date.focus();
    // Retain real native partial-input coverage on desktop; never mock validity.
    await date.press('ArrowLeft'); await date.press('ArrowLeft'); await date.press('ArrowLeft'); await date.press('Delete');
    await expect.poll(() => date.evaluate(el => el.validity.badInput)).toBe(true);
  }
  await expect(page.locator('#edit-due-date-error')).toBeVisible(); await expect(page.locator('#edit-done')).toBeDisabled();
  await page.waitForTimeout(650);
  const task = (await (await page.request.get(app.url + '/api/tasks')).json()).tasks[0]; expect(task.dueDate).toBe('2024-02-29');
  await close(page); await expect(row(page, 'Native draft').locator('.task-due-date')).toContainText('2024-02-29');
});
test('TC-007 TC-018: local date survives reload/restart and DST-adjacent editing in each timezone', async ({ page, app }) => {
  await create(page, 'Same calendar', '2026-03-29'); await page.reload();
  await expect(row(page, 'Same calendar').locator('.task-due-date')).toContainText('2026-03-29');
  await app.restart(); await page.goto(app.url); await edit(page, 'Same calendar');
  await expect(page.locator('#edit-due-date')).toHaveValue('2026-03-29');
  await page.locator('#edit-due-date').fill('2026-03-28'); await saved(page); await close(page);
  await expect(row(page, 'Same calendar').locator('.task-due-date')).toContainText('2026-03-28');
});
test('TC-008 TC-009 TC-019: local year boundary, explicit subtle warning and unchanged ordering', async ({ page }) => {
  await create(page, 'Yesterday', '2025-12-31'); await create(page, 'Today', '2026-01-01'); await create(page, 'Tomorrow', '2026-01-02'); await create(page, 'Undated');
  await expect(page.locator('.task-title')).toHaveText(['Undated', 'Tomorrow', 'Today', 'Yesterday']);
  const badge = row(page, 'Yesterday').locator('.overdue-label'); await expect(badge).toHaveText('Overdue');
  expect(await badge.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  for (const name of ['Today', 'Tomorrow', 'Undated']) await expect(row(page, name).locator('.overdue-label')).toHaveCount(0);
});
test('TC-010 TC-021: completion retains date, removes warning, reopening restores it without reordering', async ({ page }) => {
  await create(page, 'Overdue task', '2025-12-31'); await create(page, 'Newer'); await all(page);
  await row(page, 'Overdue task').getByRole('button', { name: 'Mark “Overdue task” as complete', exact: true }).click();
  await expect(row(page, 'Overdue task')).toHaveClass(/completed/);
  await expect(row(page, 'Overdue task').locator('.task-due-date')).toHaveText('Due 2025-12-31');
  await expect(row(page, 'Overdue task').locator('.overdue-label')).toHaveCount(0);
  await page.getByRole('button', { name: /^Completed / }).click(); await expect(row(page, 'Overdue task')).toBeVisible();
  await row(page, 'Overdue task').getByRole('button', { name: 'Mark “Overdue task” as unfinished', exact: true }).click();
  await page.getByRole('button', { name: /^Active / }).click();
  await expect(row(page, 'Overdue task').locator('.overdue-label')).toBeVisible();
  await expect(page.locator('.task-title')).toHaveText(['Newer', 'Overdue task']);
});
test('TC-011 TC-022: Cancel keeps the latest saved date or saved cleared state, discarding only a draft', async ({ page }) => {
  await create(page, 'Cancel safely', '2026-01-01'); await edit(page, 'Cancel safely');
  await page.locator('#edit-due-date').fill('2024-02-29'); await saved(page); await close(page);
  for (const state of ['2024-02-29', '']) {
    if (state === '') { await edit(page, 'Cancel safely'); await page.locator('#edit-clear-date').click(); await saved(page); await close(page); }
    await edit(page, 'Cancel safely'); await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await page.locator('#edit-due-date').fill('2026-01-02'); await close(page); await page.clock.runFor(1000); await page.clock.resume();
    await edit(page, 'Cancel safely'); await expect(page.locator('#edit-due-date')).toHaveValue(state);
    await textMode(page); await page.locator('#edit-due-date').fill('2025-02-29');
    await expect(page.locator('#edit-due-date-error')).toBeVisible(); await close(page);
    await edit(page, 'Cancel safely'); await expect(page.locator('#edit-due-date')).toHaveValue(state); await close(page);
  }
});
test('TC-012 TC-023: actual process restart retains dates, changes, clearing and completion', async ({ page, app }) => {
  await create(page, 'Assigned', '2026-01-01'); await create(page, 'Changed', '2026-01-01'); await create(page, 'Cleared', '2025-12-31');
  await edit(page, 'Changed'); await page.locator('#edit-due-date').fill('2026-03-29'); await saved(page); await close(page);
  await edit(page, 'Cleared'); await page.locator('#edit-clear-date').click(); await saved(page); await close(page);
  await row(page, 'Assigned').getByRole('button', { name: 'Mark “Assigned” as complete', exact: true }).click();
  await app.restart(); await page.goto(app.url); await all(page);
  await expect(row(page, 'Assigned')).toHaveClass(/completed/);
  await expect(row(page, 'Assigned').locator('.task-due-date')).toHaveText('Due 2026-01-01');
  await expect(row(page, 'Changed').locator('.task-due-date')).toContainText('2026-03-29');
  await expect(row(page, 'Cleared').locator('.task-due-date')).toHaveCount(0);
});
test.describe('legacy v1 data', () => {
  test.use({ legacy: true });
  test('TC-013: legacy task fields/completion remain visible without dates after migration', async ({ page }) => {
    await all(page); await expect(page.locator('.task-title')).toHaveText(['Legacy completed', 'Legacy active']);
    await expect(row(page, 'Legacy active').locator('.task-description')).toHaveText('Original active details');
    await expect(row(page, 'Legacy completed')).toHaveClass(/completed/);
    await expect(row(page, 'Legacy completed').locator('.task-description')).toHaveText('Original completed details');
    await expect(page.locator('.task-due-date')).toHaveCount(0);
  });
});
test('TC-014: title validation, CRUD, completion, reopening and confirmed deletion remain usable', async ({ page }) => {
  await create(page, 'CRUD task', '2025-12-31'); await edit(page, 'CRUD task');
  await page.locator('#edit-title').fill(''); await expect(page.locator('#edit-title-error')).toBeVisible(); await close(page);
  await expect(row(page, 'CRUD task')).toBeVisible(); await edit(page, 'CRUD task');
  await page.locator('#edit-title').fill('Updated task'); await page.locator('#edit-description').fill('Updated description'); await saved(page); await close(page);
  await all(page); await row(page, 'Updated task').getByRole('button', { name: 'Mark “Updated task” as complete', exact: true }).click();
  await expect(row(page, 'Updated task')).toHaveClass(/completed/);
  await row(page, 'Updated task').getByRole('button', { name: 'Mark “Updated task” as unfinished', exact: true }).click();
  await expect(row(page, 'Updated task')).not.toHaveClass(/completed/);
  await row(page, 'Updated task').getByRole('button', { name: 'Delete “Updated task”', exact: true }).click();
  await page.getByRole('button', { name: 'Keep task', exact: true }).click(); await expect(row(page, 'Updated task')).toBeVisible();
  await row(page, 'Updated task').getByRole('button', { name: 'Delete “Updated task”', exact: true }).click();
  await page.getByRole('button', { name: 'Delete task', exact: true }).click(); await expect(row(page, 'Updated task')).toHaveCount(0);
});
test('TC-015: readable labelled date controls, responsive layout and restored keyboard focus', async ({ page }) => {
  await expect(page.getByLabel('Due date optional', { exact: true }).first()).toBeVisible();
  await create(page, 'Focus and layout', '2025-12-31');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(row(page, 'Focus and layout').locator('.overdue-label')).toBeVisible();
  }
  await edit(page, 'Focus and layout'); await expect(page.locator('#edit-title')).toBeFocused();
  await page.locator('#edit-due-date').fill('2026-01-01'); await saved(page); await close(page);
  await expect(page.getByRole('button', { name: 'Edit “Focus and layout”', exact: true })).toBeFocused();
});
test('TC-020: next local calendar day changes overdue presentation without changing the saved date', async ({ page }) => {
  await create(page, 'Day rollover', '2026-01-01'); await expect(row(page, 'Day rollover').locator('.overdue-label')).toHaveCount(0);
  await page.clock.fastForward(24 * 60 * 60 * 1000); await page.reload();
  await expect(row(page, 'Day rollover').locator('.overdue-label')).toBeVisible();
  await expect(row(page, 'Day rollover').locator('.task-due-date')).toContainText('2026-01-01');
});
test('TC-002 TC-004: extended calendar years do not silently clear on editing another field', async ({ page }) => {
  await page.locator('#new-type-date').click(); await create(page, 'Extended year', '123456789012345678900-02-28');
  await edit(page, 'Extended year'); await expect(page.locator('#edit-due-date')).toHaveValue('123456789012345678900-02-28');
  await page.locator('#edit-description').fill('Preserve the calendar date'); await saved(page); await close(page);
  await expect(row(page, 'Extended year').locator('.task-due-date')).toContainText('123456789012345678900-02-28');
});
