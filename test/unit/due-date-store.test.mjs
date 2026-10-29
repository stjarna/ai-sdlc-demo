import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createTaskStore } from '../../src/tasks.mjs';

function file(t) {
  const dir = mkdtempSync(join(tmpdir(), 'littlelist-due-')); t.after(() => rmSync(dir, { recursive: true, force: true }));
  return join(dir, 'tasks.sqlite');
}
function legacy(path, collision = false) {
  const db = new DatabaseSync(path);
  db.exec(`CREATE TABLE tasks(sequence INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', completed INTEGER NOT NULL DEFAULT 0${collision ? ', due_date TEXT' : ''});
    INSERT INTO tasks(id,title,description,completed) VALUES('old','Older','Original details',1),('new','Newer','',0);
    PRAGMA user_version=1;`); db.close();
}
test('optional date can be assigned, edited and cleared independently of completion', t => {
  const store = createTaskStore(':memory:'); t.after(() => store.close());
  const original = store.create({ title: 'Undated' }); assert.equal(original.dueDate, null);
  const dated = store.create({ title: 'Past', dueDate: '1900-01-01' }); assert.equal(dated.dueDate, '1900-01-01');
  assert.equal(store.update(dated.id, { dueDate: '10000-12-31' }).dueDate, '10000-12-31');
  assert.equal(store.update(dated.id, { completed: true }).dueDate, '10000-12-31');
  assert.equal(store.update(dated.id, { completed: false }).dueDate, '10000-12-31');
  assert.equal(store.update(dated.id, { dueDate: null }).dueDate, null);
  assert.deepEqual(store.list().map(v => v.id), [dated.id, original.id]);
});
test('invalid date writes preserve all previously saved fields', t => {
  const store = createTaskStore(':memory:'); t.after(() => store.close());
  const task = store.create({ title: 'Keep title', dueDate: '2026-10-29' });
  for (const dueDate of ['', '2026-02-30', '2026-01-01T12:00:00Z', false, 5, {}, [], undefined]) {
    assert.throws(() => store.update(task.id, { title: 'Must not save', dueDate }), e => e.code === 'INVALID_DUE_DATE' && e.field === 'dueDate' && e.status === 400);
    assert.deepEqual(store.get(task.id), task);
    assert.throws(() => store.create({ title: 'Invalid', dueDate }));
  }
  assert.equal(store.list().length, 1);
});
test('v1 migration preserves IDs, sequence, business fields and order and is idempotent', t => {
  const path = file(t); legacy(path);
  const store = createTaskStore(path);
  assert.deepEqual(store.list(), [{ id: 'new', title: 'Newer', description: '', completed: false, dueDate: null }, { id: 'old', title: 'Older', description: 'Original details', completed: true, dueDate: null }]);
  store.update('old', { dueDate: '2000-02-29' }); const created = store.create({ title: 'Newest' }); store.close();
  const reopened = createTaskStore(path); t.after(() => reopened.close());
  assert.deepEqual(reopened.list().map(v => v.id), [created.id, 'new', 'old']); assert.equal(reopened.get('old').dueDate, '2000-02-29');
  const db = new DatabaseSync(path); assert.equal(db.prepare('PRAGMA user_version').get().user_version, 2);
  assert.deepEqual(db.prepare('SELECT sequence FROM tasks ORDER BY sequence').all().map(v => v.sequence), [1, 2, 3]);
  assert.equal(db.prepare('PRAGMA table_info(tasks)').all().filter(v => v.name === 'due_date').length, 1); db.close();
});
test('failed migration rolls back without replacing data or advancing schema version', t => {
  const path = file(t); legacy(path, true);
  assert.throws(() => createTaskStore(path), /duplicate column/);
  const db = new DatabaseSync(path); assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1);
  assert.equal(db.prepare('SELECT title FROM tasks WHERE id=?').get('old').title, 'Older'); assert.equal(db.prepare('SELECT count(*) AS n FROM tasks').get().n, 2); db.close();
});
test('date edits survive an actual database close and reopen', t => {
  const path = file(t), first = createTaskStore(path);
  const task = first.create({ title: 'Persist date', dueDate: '2026-01-01' }); first.update(task.id, { dueDate: '2025-02-28', completed: true }); first.close();
  const second = createTaskStore(path); assert.equal(second.get(task.id).dueDate, '2025-02-28'); second.update(task.id, { dueDate: null }); second.close();
  const third = createTaskStore(path); t.after(() => third.close()); assert.equal(third.get(task.id).dueDate, null); assert.equal(third.get(task.id).completed, true);
});
