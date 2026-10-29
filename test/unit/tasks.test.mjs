import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { createTaskStore, validateTaskInput } from '../../src/tasks.mjs';

function fixture(t) { const store = createTaskStore(':memory:'); t.after(() => store.close()); return store; }

test('creates an unfinished task with optional description and opaque stable identity', t => {
  const store = fixture(t); const task = store.create({ title: '  Read a chapter  ' });
  assert.match(task.id, /^[0-9a-f-]{36}$/); assert.deepEqual(task, { id: task.id, title: 'Read a chapter', description: '', completed: false, dueDate: null });
  assert.deepEqual(store.get(task.id), task);
});
test('newest-created tasks remain first when older tasks are edited', t => {
  const store = fixture(t); const first = store.create({ title: 'First' }); const next = store.create({ title: 'Second' });
  store.update(first.id, { title: 'Reworded first' }); assert.deepEqual(store.list().map(task => task.id), [next.id, first.id]);
});
test('updates title and multiline description while retaining identity and completion', t => {
  const store = fixture(t); const original = store.create({ title: 'Initial', description: 'Original' });
  store.update(original.id, { completed: true });
  const updated = store.update(original.id, { title: 'Updated', description: 'First line\nSecond line' });
  assert.deepEqual(updated, { id: original.id, title: 'Updated', description: 'First line\nSecond line', completed: true, dueDate: null });
});
test('completion is reversible without extra state transitions', t => {
  const store = fixture(t); const task = store.create({ title: 'Small step' });
  assert.equal(store.update(task.id, { completed: true }).completed, true);
  assert.equal(store.update(task.id, { completed: false }).completed, false);
});
test('deletes both unfinished and completed tasks permanently', t => {
  const store = fixture(t);
  for (const completed of [false, true]) { const task = store.create({ title: 'Remove' }); store.update(task.id, { completed }); store.remove(task.id); }
  assert.deepEqual(store.list(), []);
});
test('invalid edits preserve the last valid task', t => {
  const store = fixture(t); const task = store.create({ title: 'Keep me', description: 'Keep details' });
  for (const title of ['', '   ', null, 1, 'x'.repeat(121), 'Two\nlines']) {
    assert.throws(() => store.update(task.id, { title })); assert.deepEqual(store.get(task.id), task);
  }
});
test('validates input types, supported fields and exact content bounds', () => {
  for (const input of [null, [], '', { title: '' }, { title: 'x', description: null }, { title: 'x', completed: true }, { title: 'x', dueDate: 'unsupported' }]) assert.throws(() => validateTaskInput(input));
  for (const patch of [{}, { completed: 'true' }, { description: 'x'.repeat(2001) }, { description: '\0' }, { unexpected: true }]) assert.throws(() => validateTaskInput(patch, { partial: true }));
  assert.equal(validateTaskInput({ title: 'x'.repeat(120), description: 'x'.repeat(2000) }).description.length, 2000);
});
test('Unicode and markup remain literal user content', t => {
  const store = fixture(t); const task = store.create({ title: 'Přečíst knihu 🌿 <script>', description: "O'Brien — café & <img src=x>" });
  assert.deepEqual(store.get(task.id), task);
});
test('missing IDs produce a clear not-found diagnostic', t => {
  const store = fixture(t);
  for (const run of [() => store.get('missing'), () => store.update('missing', { title: 'x' }), () => store.remove('missing')]) assert.throws(run, error => error.code === 'TASK_NOT_FOUND' && error.status === 404);
});
test('stored tasks survive closing and reopening the database', t => {
  const dir = mkdtempSync(join(tmpdir(), 'littlelist-unit-')); t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, 'nested/tasks.sqlite'); const first = createTaskStore(path); const task = first.create({ title: 'Persist', description: 'Across restarts' });
  first.update(task.id, { completed: true }); first.close();
  const reopened = createTaskStore(path); t.after(() => reopened.close());
  assert.deepEqual(reopened.list(), [{ ...task, completed: true }]);
});
test('independent database connections preserve partial updates', t => {
  const dir = mkdtempSync(join(tmpdir(), 'littlelist-connections-')); t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, 'tasks.sqlite'); const one = createTaskStore(path); const two = createTaskStore(path);
  t.after(() => { one.close(); two.close(); });
  const task = one.create({ title: 'Shared task' }); one.update(task.id, { completed: true }); two.update(task.id, { description: 'Extra context' });
  assert.deepEqual(one.get(task.id), { ...task, completed: true, description: 'Extra context' });
});
test('unsupported database schema fails without deleting stored data', t => {
  const dir = mkdtempSync(join(tmpdir(), 'littlelist-schema-')); t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, 'tasks.sqlite'); const db = new DatabaseSync(path); db.exec('CREATE TABLE preserved(value TEXT); INSERT INTO preserved VALUES(\'keep\'); PRAGMA user_version=99;'); db.close();
  assert.throws(() => createTaskStore(path), /Unsupported database schema/);
  const check = new DatabaseSync(path); assert.equal(check.prepare('SELECT value FROM preserved').get().value, 'keep'); check.close();
});
