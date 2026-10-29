# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: due-dates.spec.mjs >> TC-006: native partial date input cannot silently clear the saved date
- Location: qa/browser/due-dates.spec.mjs:64:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Skip to tasks" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=e3]:
    - complementary "Workspace" [ref=e4]:
      - link "Littlelist home" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e9]: littlelist.
      - generic [ref=e10]:
        - generic [ref=e11]: My tasks
        - generic [ref=e12]: "1"
    - main [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: My tasks
        - generic [ref=e16]: Saved locally
      - region [ref=e19]:
        - generic [ref=e21]:
          - paragraph [ref=e22]: A LITTLE SPACE TO THINK
          - heading "Room for what matters." [level=1] [ref=e23]
          - paragraph [ref=e24]: Keep the everyday out of your head and on your list.
        - region "Add a task" [ref=e29]:
          - generic [ref=e30]:
            - generic [ref=e31]:
              - generic [ref=e32]: New task title
              - textbox "New task title" [ref=e33]:
                - /placeholder: What would you like to get done?
              - button "Add task" [ref=e34] [cursor=pointer]
            - generic [ref=e36]:
              - generic [ref=e37]: Due date optional
              - generic [ref=e38]:
                - textbox "Due date optional" [ref=e39]
                - button "Type date" [ref=e40] [cursor=pointer]
                - button "Clear due date" [ref=e41] [cursor=pointer]
            - button "Add a description optional" [ref=e42] [cursor=pointer]:
              - generic [ref=e43]: Add a description
              - generic [ref=e44]: optional
        - region [ref=e45]:
          - generic [ref=e46]:
            - heading "Your tasks 1" [level=2] [ref=e47]:
              - text: Your tasks
              - generic [ref=e48]: "1"
            - generic [ref=e49]: Newest first
          - group "Filter tasks" [ref=e51]:
            - button "Active 1" [pressed] [ref=e52] [cursor=pointer]
            - button "Completed 0" [ref=e53] [cursor=pointer]
            - button "All 1" [ref=e54] [cursor=pointer]
          - list "Tasks" [ref=e55]:
            - listitem [ref=e56]:
              - button "Mark “Native draft” as complete" [ref=e57] [cursor=pointer]
              - generic [ref=e58]:
                - button "Edit “Native draft”" [ref=e59] [cursor=pointer]: Native draft
                - paragraph [ref=e60]:
                  - text: Due 2024-02-29
                  - generic [ref=e61]: Overdue
              - generic [ref=e62]:
                - button "Edit details for “Native draft”" [ref=e63] [cursor=pointer]
                - button "Delete “Native draft”" [ref=e64] [cursor=pointer]
          - generic [ref=e65]: Your list stays here, even when you close the app.
  - dialog [ref=e68]:
    - generic [ref=e69]:
      - generic [ref=e70]:
        - paragraph [ref=e71]: MAKE IT YOURS
        - heading "Task details" [level=2] [ref=e72]
      - button "Close task details" [ref=e73] [cursor=pointer]
    - generic [ref=e74]:
      - generic [ref=e75]: Task title required
      - textbox "Task title required" [ref=e76]: Native draft
      - generic [ref=e77]: Description optional
      - textbox "Description optional" [ref=e78]:
        - /placeholder: Add a little context…
      - generic [ref=e79]:
        - generic [ref=e80]: Due date optional
        - generic [ref=e81]:
          - textbox "Due date optional" [active] [ref=e82]: 2024-02-29
          - button "Type date" [ref=e83] [cursor=pointer]
          - button "Clear due date" [ref=e84] [cursor=pointer]
      - status [ref=e85]: All changes saved
      - generic [ref=e86]: Changes save automatically. Cancel discards only your unsaved draft; saved changes stay saved.
      - generic [ref=e87]:
        - button "Cancel draft" [ref=e88] [cursor=pointer]
        - button "Done" [ref=e89] [cursor=pointer]
  - generic [ref=e90]: A small step added to your list.
```

# Test source

```ts
  1   | import { test as base, expect } from '@playwright/test';
  2   | import { isolatedApp } from '../helpers.mjs';
  3   | const test = base.extend({
  4   |   legacy: [false, { option: true }],
  5   |   app: async ({ legacy }, use) => { const app = await isolatedApp({ legacy }); try { await use(app); } finally { await app.close(); } },
  6   |   page: async ({ page, app }, use) => {
  7   |     const errors = []; page.on('pageerror', e => errors.push(e.message));
  8   |     // Same local 1 January in both projects. This controls test data, not a product rule.
  9   |     await page.clock.install({ time: new Date('2026-01-01T08:00:00Z') });
  10  |     await page.goto(app.url); await expect(page.locator('#loading')).toBeHidden();
  11  |     await use(page); expect(errors, 'No unhandled browser application errors').toEqual([]);
  12  |   },
  13  | });
  14  | function row(page, title) { return page.locator('.task-item').filter({ has: page.getByRole('button', { name: `Edit “${title}”`, exact: true }) }); }
  15  | async function create(page, title, dueDate) {
  16  |   await page.locator('#new-title').fill(title);
  17  |   if (dueDate !== undefined) await page.locator('#new-due-date').fill(dueDate);
  18  |   await page.getByRole('button', { name: 'Add task', exact: true }).click();
  19  |   await expect(row(page, title)).toBeVisible();
  20  | }
  21  | async function edit(page, title) { await page.getByRole('button', { name: `Edit details for “${title}”`, exact: true }).click(); await expect(page.locator('#edit-dialog')).toBeVisible(); }
  22  | async function saved(page) { await expect(page.locator('#edit-save-status')).toHaveText('All changes saved'); }
  23  | async function close(page) { await page.getByRole('button', { name: 'Cancel draft', exact: true }).click(); await expect(page.locator('#edit-dialog')).not.toBeVisible(); }
  24  | async function textMode(page) { if (await page.locator('#edit-type-date').isVisible()) await page.locator('#edit-type-date').click(); }
  25  | async function all(page) { await page.getByRole('button', { name: /^All / }).click(); }
  26  | 
  27  | test('TC-001: empty optional due date creates a usable undated task', async ({ page }) => {
  28  |   await create(page, 'No date'); await expect(row(page, 'No date').locator('.task-due-date')).toHaveCount(0);
  29  |   await edit(page, 'No date'); await expect(page.locator('#edit-due-date')).toHaveValue(''); await close(page);
  30  | });
  31  | test('TC-002 TC-003 TC-016: past/today/future dates accepted on creation and autosaved edits', async ({ page }) => {
  32  |   await expect(page.locator('#new-due-date')).not.toHaveAttribute('min', /.+/);
  33  |   for (const [name, date] of [['Past', '2025-12-31'], ['Today', '2026-01-01'], ['Future', '2026-01-02']]) {
  34  |     await create(page, name, date); await expect(row(page, name).locator('.task-due-date')).toContainText(date);
  35  |   }
  36  |   await edit(page, 'Today');
  37  |   for (const date of ['2025-12-31', '2026-01-01', '2026-01-02']) {
  38  |     await page.locator('#edit-due-date').fill(date); await saved(page);
  39  |     await expect(row(page, 'Today').locator('.task-due-date')).toContainText(date);
  40  |   }
  41  |   await close(page);
  42  | });
  43  | test('TC-004 TC-005: edit and clear autosave without a separate save action', async ({ page }) => {
  44  |   await create(page, 'Edit date', '2026-01-01'); await edit(page, 'Edit date');
  45  |   await page.locator('#edit-due-date').fill('2025-12-31'); await saved(page);
  46  |   await expect(row(page, 'Edit date').locator('.overdue-label')).toBeVisible();
  47  |   await page.locator('#edit-clear-date').click(); await saved(page); await close(page);
  48  |   await expect(row(page, 'Edit date').locator('.task-due-date')).toHaveCount(0);
  49  |   await expect(row(page, 'Edit date').locator('.overdue-label')).toHaveCount(0);
  50  |   await edit(page, 'Edit date'); await expect(page.locator('#edit-due-date')).toHaveValue('');
  51  | });
  52  | test('TC-006 TC-017: impossible calendar drafts preserve the saved valid leap day', async ({ page, app }) => {
  53  |   await create(page, 'Leap day', '2024-02-29'); await edit(page, 'Leap day'); await textMode(page);
  54  |   for (const value of ['2025-02-29', '2024-02-30']) {
  55  |     await page.locator('#edit-due-date').fill(value);
  56  |     await expect(page.locator('#edit-due-date-error')).toBeVisible(); await expect(page.locator('#edit-done')).toBeDisabled();
  57  |     // Let the real autosave interval elapse; asserting the server proves no destructive save occurred.
  58  |     await page.waitForTimeout(650);
  59  |     const tasks = (await (await page.request.get(app.url + '/api/tasks')).json()).tasks;
  60  |     expect(tasks[0].dueDate).toBe('2024-02-29');
  61  |   }
  62  |   await close(page); await expect(row(page, 'Leap day').locator('.task-due-date')).toContainText('2024-02-29');
  63  | });
  64  | test('TC-006: native partial date input cannot silently clear the saved date', async ({ page, app }) => {
  65  |   await create(page, 'Native draft', '2024-02-29'); await edit(page, 'Native draft');
  66  |   const date = page.locator('#edit-due-date'); await date.focus();
  67  |   // Real keyboard interaction with the first native date segment, not a mocked validity object.
  68  |   await date.press('ArrowLeft'); await date.press('ArrowLeft'); await date.press('ArrowLeft'); await date.press('Delete');
> 69  |   await expect.poll(() => date.evaluate(el => el.validity.badInput)).toBe(true);
      |                                                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  70  |   await expect(page.locator('#edit-due-date-error')).toBeVisible(); await expect(page.locator('#edit-done')).toBeDisabled();
  71  |   await page.waitForTimeout(650);
  72  |   const task = (await (await page.request.get(app.url + '/api/tasks')).json()).tasks[0]; expect(task.dueDate).toBe('2024-02-29');
  73  |   await close(page); await expect(row(page, 'Native draft').locator('.task-due-date')).toContainText('2024-02-29');
  74  | });
  75  | test('TC-007 TC-018: local date survives reload/restart and DST-adjacent editing in each timezone', async ({ page, app }) => {
  76  |   await create(page, 'Same calendar', '2026-03-29'); await page.reload();
  77  |   await expect(row(page, 'Same calendar').locator('.task-due-date')).toContainText('2026-03-29');
  78  |   await app.restart(); await page.goto(app.url); await edit(page, 'Same calendar');
  79  |   await expect(page.locator('#edit-due-date')).toHaveValue('2026-03-29');
  80  |   await page.locator('#edit-due-date').fill('2026-03-28'); await saved(page); await close(page);
  81  |   await expect(row(page, 'Same calendar').locator('.task-due-date')).toContainText('2026-03-28');
  82  | });
  83  | test('TC-008 TC-009 TC-019: local year boundary, explicit subtle warning and unchanged ordering', async ({ page }) => {
  84  |   await create(page, 'Yesterday', '2025-12-31'); await create(page, 'Today', '2026-01-01'); await create(page, 'Tomorrow', '2026-01-02'); await create(page, 'Undated');
  85  |   await expect(page.locator('.task-title')).toHaveText(['Undated', 'Tomorrow', 'Today', 'Yesterday']);
  86  |   const badge = row(page, 'Yesterday').locator('.overdue-label'); await expect(badge).toHaveText('Overdue');
  87  |   expect(await badge.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  88  |   for (const name of ['Today', 'Tomorrow', 'Undated']) await expect(row(page, name).locator('.overdue-label')).toHaveCount(0);
  89  | });
  90  | test('TC-010 TC-021: completion retains date, removes warning, reopening restores it without reordering', async ({ page }) => {
  91  |   await create(page, 'Overdue task', '2025-12-31'); await create(page, 'Newer'); await all(page);
  92  |   await row(page, 'Overdue task').getByRole('button', { name: 'Mark “Overdue task” as complete', exact: true }).click();
  93  |   await expect(row(page, 'Overdue task')).toHaveClass(/completed/);
  94  |   await expect(row(page, 'Overdue task').locator('.task-due-date')).toHaveText('Due 2025-12-31');
  95  |   await expect(row(page, 'Overdue task').locator('.overdue-label')).toHaveCount(0);
  96  |   await page.getByRole('button', { name: /^Completed / }).click(); await expect(row(page, 'Overdue task')).toBeVisible();
  97  |   await row(page, 'Overdue task').getByRole('button', { name: 'Mark “Overdue task” as unfinished', exact: true }).click();
  98  |   await page.getByRole('button', { name: /^Active / }).click();
  99  |   await expect(row(page, 'Overdue task').locator('.overdue-label')).toBeVisible();
  100 |   await expect(page.locator('.task-title')).toHaveText(['Newer', 'Overdue task']);
  101 | });
  102 | test('TC-011 TC-022: Cancel keeps the latest saved date or saved cleared state, discarding only a draft', async ({ page }) => {
  103 |   await create(page, 'Cancel safely', '2026-01-01'); await edit(page, 'Cancel safely');
  104 |   await page.locator('#edit-due-date').fill('2024-02-29'); await saved(page); await close(page);
  105 |   for (const state of ['2024-02-29', '']) {
  106 |     if (state === '') { await edit(page, 'Cancel safely'); await page.locator('#edit-clear-date').click(); await saved(page); await close(page); }
  107 |     await edit(page, 'Cancel safely'); await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  108 |     await page.locator('#edit-due-date').fill('2026-01-02'); await close(page); await page.clock.runFor(1000); await page.clock.resume();
  109 |     await edit(page, 'Cancel safely'); await expect(page.locator('#edit-due-date')).toHaveValue(state);
  110 |     await textMode(page); await page.locator('#edit-due-date').fill('2025-02-29');
  111 |     await expect(page.locator('#edit-due-date-error')).toBeVisible(); await close(page);
  112 |     await edit(page, 'Cancel safely'); await expect(page.locator('#edit-due-date')).toHaveValue(state); await close(page);
  113 |   }
  114 | });
  115 | test('TC-012 TC-023: actual process restart retains dates, changes, clearing and completion', async ({ page, app }) => {
  116 |   await create(page, 'Assigned', '2026-01-01'); await create(page, 'Changed', '2026-01-01'); await create(page, 'Cleared', '2025-12-31');
  117 |   await edit(page, 'Changed'); await page.locator('#edit-due-date').fill('2026-03-29'); await saved(page); await close(page);
  118 |   await edit(page, 'Cleared'); await page.locator('#edit-clear-date').click(); await saved(page); await close(page);
  119 |   await row(page, 'Assigned').getByRole('button', { name: 'Mark “Assigned” as complete', exact: true }).click();
  120 |   await app.restart(); await page.goto(app.url); await all(page);
  121 |   await expect(row(page, 'Assigned')).toHaveClass(/completed/);
  122 |   await expect(row(page, 'Assigned').locator('.task-due-date')).toHaveText('Due 2026-01-01');
  123 |   await expect(row(page, 'Changed').locator('.task-due-date')).toContainText('2026-03-29');
  124 |   await expect(row(page, 'Cleared').locator('.task-due-date')).toHaveCount(0);
  125 | });
  126 | test.describe('legacy v1 data', () => {
  127 |   test.use({ legacy: true });
  128 |   test('TC-013: legacy task fields/completion remain visible without dates after migration', async ({ page }) => {
  129 |     await all(page); await expect(page.locator('.task-title')).toHaveText(['Legacy completed', 'Legacy active']);
  130 |     await expect(row(page, 'Legacy active').locator('.task-description')).toHaveText('Original active details');
  131 |     await expect(row(page, 'Legacy completed')).toHaveClass(/completed/);
  132 |     await expect(row(page, 'Legacy completed').locator('.task-description')).toHaveText('Original completed details');
  133 |     await expect(page.locator('.task-due-date')).toHaveCount(0);
  134 |   });
  135 | });
  136 | test('TC-014: title validation, CRUD, completion, reopening and confirmed deletion remain usable', async ({ page }) => {
  137 |   await create(page, 'CRUD task', '2025-12-31'); await edit(page, 'CRUD task');
  138 |   await page.locator('#edit-title').fill(''); await expect(page.locator('#edit-title-error')).toBeVisible(); await close(page);
  139 |   await expect(row(page, 'CRUD task')).toBeVisible(); await edit(page, 'CRUD task');
  140 |   await page.locator('#edit-title').fill('Updated task'); await page.locator('#edit-description').fill('Updated description'); await saved(page); await close(page);
  141 |   await all(page); await row(page, 'Updated task').getByRole('button', { name: 'Mark “Updated task” as complete', exact: true }).click();
  142 |   await expect(row(page, 'Updated task')).toHaveClass(/completed/);
  143 |   await row(page, 'Updated task').getByRole('button', { name: 'Mark “Updated task” as unfinished', exact: true }).click();
  144 |   await expect(row(page, 'Updated task')).not.toHaveClass(/completed/);
  145 |   await row(page, 'Updated task').getByRole('button', { name: 'Delete “Updated task”', exact: true }).click();
  146 |   await page.getByRole('button', { name: 'Keep task', exact: true }).click(); await expect(row(page, 'Updated task')).toBeVisible();
  147 |   await row(page, 'Updated task').getByRole('button', { name: 'Delete “Updated task”', exact: true }).click();
  148 |   await page.getByRole('button', { name: 'Delete task', exact: true }).click(); await expect(row(page, 'Updated task')).toHaveCount(0);
  149 | });
  150 | test('TC-015: readable labelled date controls, responsive layout and restored keyboard focus', async ({ page }) => {
  151 |   await expect(page.getByLabel('Due date optional', { exact: true }).first()).toBeVisible();
  152 |   await create(page, 'Focus and layout', '2025-12-31');
  153 |   for (const width of [320, 390, 768, 1440]) {
  154 |     await page.setViewportSize({ width, height: 900 });
  155 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  156 |     await expect(row(page, 'Focus and layout').locator('.overdue-label')).toBeVisible();
  157 |   }
  158 |   await edit(page, 'Focus and layout'); await expect(page.locator('#edit-title')).toBeFocused();
  159 |   await page.locator('#edit-due-date').fill('2026-01-01'); await saved(page); await close(page);
  160 |   await expect(page.getByRole('button', { name: 'Edit “Focus and layout”', exact: true })).toBeFocused();
  161 | });
  162 | test('TC-020: next local calendar day changes overdue presentation without changing the saved date', async ({ page }) => {
  163 |   await create(page, 'Day rollover', '2026-01-01'); await expect(row(page, 'Day rollover').locator('.overdue-label')).toHaveCount(0);
  164 |   await page.clock.fastForward(24 * 60 * 60 * 1000); await page.reload();
  165 |   await expect(row(page, 'Day rollover').locator('.overdue-label')).toBeVisible();
  166 |   await expect(row(page, 'Day rollover').locator('.task-due-date')).toContainText('2026-01-01');
  167 | });
  168 | test('TC-002 TC-004: extended calendar years do not silently clear on editing another field', async ({ page }) => {
  169 |   await page.locator('#new-type-date').click(); await create(page, 'Extended year', '123456789012345678900-02-28');
```