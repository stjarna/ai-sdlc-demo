import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

export const project = fileURLToPath(new URL('../', import.meta.url));
export function seedLegacy(path) {
  // Disposable fixture using the original baseline v1 schema; never personal data.
  const db = new DatabaseSync(path);
  db.exec(`CREATE TABLE tasks(sequence INTEGER PRIMARY KEY AUTOINCREMENT,id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
    description TEXT NOT NULL DEFAULT '' CHECK(length(description)<=2000),completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)));
    INSERT INTO tasks(id,title,description,completed) VALUES
    ('00000000-0000-4000-8000-000000000001','Legacy active','Original active details',0),
    ('00000000-0000-4000-8000-000000000002','Legacy completed','Original completed details',1);
    PRAGMA user_version=1;`); db.close();
}
async function start(db) {
  const child = spawn(process.execPath, ['src/server.mjs'], {
    cwd: project, env: { ...process.env, PORT: '0', TODO_DB_PATH: db }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = ''; child.stderr.on('data', chunk => { stderr += chunk; });
  const lines = createInterface({ input: child.stdout });
  try {
    const url = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`Startup timeout: ${stderr}`)); }, 10_000);
      const fail = error => { clearTimeout(timer); reject(error); };
      child.once('error', fail); child.once('exit', code => fail(new Error(`Server exited ${code}: ${stderr}`)));
      lines.on('line', line => {
        try { const v = JSON.parse(line); if (v.event === 'listening') { clearTimeout(timer); resolve(v.url); } } catch { /* Retain stderr separately. */ }
      });
    });
    return { url, async stop() {
      if (child.exitCode !== null || child.signalCode) { lines.close(); return; }
      const exited = once(child, 'exit'); child.kill('SIGTERM');
      const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
      try { await exited; } finally { clearTimeout(timer); lines.close(); }
    } };
  } catch (error) { child.kill('SIGKILL'); lines.close(); throw error; }
}
export async function isolatedApp({ legacy = false } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'littlelist-qa-')); const db = join(dir, 'tasks.sqlite');
  try {
    if (legacy) seedLegacy(db);
    let running = await start(db);
    return { get url() { return running.url; }, async restart() { await running.stop(); running = await start(db); },
      async close() { try { await running.stop(); } finally { await rm(dir, { recursive: true, force: true }); } } };
  } catch (error) { await rm(dir, { recursive: true, force: true }); throw error; }
}
export async function request(app, path = '', method = 'GET', data) {
  return fetch(app.url + '/api/tasks' + path, { method, ...(data === undefined ? {} : {
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }) });
}
