import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import http from 'node:http';
import { startApp } from '../helpers/server.mjs';

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'littlelist-http-')); const db = join(dir, 'tasks.sqlite');
  let app = await startApp(db);
  t.after(async () => { await app.stop(); await rm(dir, { recursive: true, force: true }); });
  return { get app() { return app; }, async restart() { await app.stop(); app = await startApp(db); } };
}
async function request(app, path = '', method = 'GET', data, headers = {}) {
  return fetch(app.url + '/api/tasks' + path, { method, headers: { ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
}

test('real HTTP CRUD, completion, ordering and persistence across server process restart', async t => {
  const f = await fixture(t); assert.deepEqual(await (await request(f.app)).json(), { tasks: [] });
  const created = await request(f.app, '', 'POST', { title: 'Read the book', description: 'A chapter at a time.' }); assert.equal(created.status, 201);
  const original = (await created.json()).task;
  const second = (await (await request(f.app, '', 'POST', { title: 'Second task' })).json()).task;
  const edited = await request(f.app, '/'+original.id, 'PATCH', { title: 'Read a few chapters', description: 'Revised details.' }); assert.equal(edited.status, 200);
  const completed = (await (await request(f.app, '/'+original.id, 'PATCH', { completed: true })).json()).task;
  assert.equal(completed.completed, true);
  assert.deepEqual((await (await request(f.app)).json()).tasks.map(task => task.id), [second.id, original.id]);
  await f.restart();
  assert.deepEqual((await (await request(f.app, '/'+original.id)).json()).task, completed);
  assert.equal((await (await request(f.app, '/'+original.id, 'PATCH', { completed: false })).json()).task.completed, false);
  assert.equal((await request(f.app, '/'+original.id, 'DELETE')).status, 204);
  assert.equal((await request(f.app, '/'+second.id, 'DELETE')).status, 204);
  await f.restart(); assert.deepEqual((await (await request(f.app)).json()).tasks, []);
});
test('invalid edits and unsupported fields do not alter persisted task content', async t => {
  const { app } = await fixture(t); const task = (await (await request(app, '', 'POST', { title: 'A valid title' })).json()).task;
  for (const patch of [{ title: '' }, { title: '  ' }, { completed: 'yes' }, { dueDate: 'unsupported' }, {}, { description: 'x'.repeat(2001) }]) {
    const response = await request(app, '/'+task.id, 'PATCH', patch); assert.equal(response.status, 400);
    assert.deepEqual((await (await request(app, '/'+task.id)).json()).task, task);
  }
});
test('rejects malformed JSON, unexpected nodes, unsupported media and oversized bodies', async t => {
  const { app } = await fixture(t);
  for (const body of ['{bad', '[]', 'null']) {
    const response = await fetch(app.url+'/api/tasks', { method:'POST', headers:{'Content-Type':'application/json'}, body }); assert.equal(response.status, 400);
  }
  assert.equal((await fetch(app.url+'/api/tasks', { method:'POST', body:'title=form' })).status, 415);
  const oversized = await fetch(app.url+'/api/tasks', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ title:'x', description:'x'.repeat(17000) }) });
  assert.equal(oversized.status, 413);
  const invalidUtf8 = await fetch(app.url+'/api/tasks', { method:'POST', headers:{'Content-Type':'application/json'}, body:Buffer.from([0xc3,0x28]) }); assert.equal(invalidUtf8.status, 400);
  assert.deepEqual((await (await request(app)).json()).tasks, []);
});
test('serves local assets, rejects traversal and unknown methods, and emits protective headers', async t => {
  const { app } = await fixture(t);
  for (const path of ['/', '/app.js', '/styles.css', '/favicon.svg']) {
    const response = await fetch(app.url+path); assert.equal(response.status, 200); assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  }
  assert.equal((await fetch(app.url+'/%2e%2e/package.json')).status, 404);
  assert.equal((await fetch(app.url+'/.env')).status, 404);
  const task = (await (await request(app, '', 'POST', { title:'Task' })).json()).task;
  assert.equal((await request(app, '/'+task.id, 'PUT', { title:'Task' })).status, 405);
});
test('rejects foreign browser origins and untrusted Host headers without mutations', async t => {
  const { app } = await fixture(t);
  assert.equal((await request(app, '', 'POST', { title:'Blocked' }, { Origin:'https://foreign.invalid' })).status, 403);
  const status = await new Promise((resolve,reject) => {
    const req = http.request(app.url+'/api/tasks', { headers:{ Host:'foreign.invalid' } }, response => { response.resume(); resolve(response.statusCode); });
    req.on('error', reject); req.end();
  });
  assert.equal(status, 403); assert.deepEqual((await (await request(app)).json()).tasks, []);
});
