import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isolatedApp, request } from './helpers.mjs';
async function fixture(t, options) { const app = await isolatedApp(options); t.after(() => app.close()); return app; }
async function create(app, value) { const r = await request(app, '', 'POST', value); assert.equal(r.status, 201); return (await r.json()).task; }
async function patch(app, id, value) { const r = await request(app, '/'+id, 'PATCH', value); assert.equal(r.status, 200); return (await r.json()).task; }
async function get(app, id) { const r = await request(app, '/'+id); assert.equal(r.status, 200); return (await r.json()).task; }

test('TC-001 / TC-002 / TC-016: optional dates and past/today/future acceptance through HTTP', async t => {
  const app = await fixture(t);
  const undated = await create(app, { title: 'Undated' }); assert.equal(undated.dueDate, null);
  for (const dueDate of ['2025-12-31', '2026-01-01', '2026-01-02', '0001-01-01', '10000-12-31']) {
    const task = await create(app, { title: dueDate, dueDate }); assert.equal(task.dueDate, dueDate);
    assert.equal((await patch(app, undated.id, { dueDate })).dueDate, dueDate);
  }
});
test('TC-004 / TC-005: edit, omit, clear, and completion-only PATCH preserve the correct saved date', async t => {
  const app = await fixture(t), task = await create(app, { title: 'Change', dueDate: '2026-01-01' });
  assert.equal((await patch(app, task.id, { dueDate: '2025-12-31' })).dueDate, '2025-12-31');
  assert.equal((await patch(app, task.id, { completed: true })).dueDate, '2025-12-31');
  assert.equal((await patch(app, task.id, { title: 'Edited' })).dueDate, '2025-12-31');
  assert.equal((await patch(app, task.id, { dueDate: null })).dueDate, null);
});
test('TC-006 / TC-017: invalid dates cannot overwrite a saved leap day or other task fields', async t => {
  const app = await fixture(t), task = await create(app, { title: 'Preserve', dueDate: '2024-02-29' });
  for (const dueDate of ['2025-02-29', '2024-02-30', '', '2026-01-01T00:00:00Z', false, {}, [], 1]) {
    const r = await request(app, '/'+task.id, 'PATCH', { dueDate, title: 'Must not save' }); assert.equal(r.status, 400);
    const body = await r.json(); assert.equal(body.error.code, 'INVALID_DUE_DATE'); assert.equal(body.error.field, 'dueDate'); assert.ok(body.error.message);
    assert.deepEqual(await get(app, task.id), task);
  }
});
test('TC-012 / TC-023: assigned, changed and cleared dates survive actual server process restart', async t => {
  const app = await fixture(t);
  const assigned = await create(app, { title: 'Assigned', dueDate: '2026-01-01' });
  const changed = await create(app, { title: 'Changed', dueDate: '2024-02-29' });
  const cleared = await create(app, { title: 'Cleared', dueDate: '2025-12-31' });
  const expected = [assigned, await patch(app, changed.id, { dueDate: '2026-03-29', completed: true }), await patch(app, cleared.id, { dueDate: null })];
  await app.restart(); for (const task of expected) assert.deepEqual(await get(app, task.id), task);
});
test('TC-013: original v1-schema fixture migrates without losing identity, fields, completion or order', async t => {
  const app = await fixture(t, { legacy: true });
  const tasks = (await (await request(app)).json()).tasks;
  assert.deepEqual(tasks, [
    { id: '00000000-0000-4000-8000-000000000002', title: 'Legacy completed', description: 'Original completed details', completed: true, dueDate: null },
    { id: '00000000-0000-4000-8000-000000000001', title: 'Legacy active', description: 'Original active details', completed: false, dueDate: null },
  ]);
  await app.restart(); assert.deepEqual((await (await request(app)).json()).tasks, tasks);
});
test('TC-014: original CRUD/completion semantics, errors and ordering remain available', async t => {
  const app = await fixture(t), first = await create(app, { title: 'First', description: 'Keep' });
  const second = await create(app, { title: 'Second', dueDate: '2025-12-31' });
  const edited = await patch(app, first.id, { title: 'Edited', description: 'Detail' });
  const invalid = await request(app, '/'+first.id, 'PATCH', { title: '' }); assert.equal(invalid.status, 400); assert.deepEqual(await get(app, first.id), edited);
  assert.equal((await patch(app, second.id, { completed: true })).completed, true);
  assert.equal((await patch(app, second.id, { completed: false })).completed, false);
  assert.deepEqual((await (await request(app)).json()).tasks.map(v => v.id), [second.id, first.id]);
  assert.equal((await request(app, '/'+first.id, 'DELETE')).status, 204); assert.equal((await request(app, '/'+first.id)).status, 404);
});
