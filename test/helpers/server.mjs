import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { resolve } from 'node:path';

export const projectRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
export async function startApp(dbPath) {
  const child = spawn(process.execPath, ['src/server.mjs'], {
    cwd: projectRoot, env: { ...process.env, PORT: '0', TODO_DB_PATH: dbPath }, stdio: ['ignore','pipe','pipe'],
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk.toString(); });
  const lines = createInterface({ input: child.stdout });
  const url = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`Server startup timed out: ${stderr}`)); }, 10_000);
    const cleanup = () => clearTimeout(timeout);
    child.once('error', error => { cleanup(); reject(error); });
    child.once('exit', code => { cleanup(); reject(new Error(`Server exited (${code}): ${stderr}`)); });
    lines.on('line', line => {
      try { const value = JSON.parse(line); if (value.event === 'listening') { cleanup(); resolve(value.url); } }
      catch { /* Non-ready diagnostics are retained on stderr. */ }
    });
  });
  return {
    url, child,
    async stop() {
      if (child.exitCode !== null || child.signalCode) { lines.close(); return; }
      const exited = once(child, 'exit'); child.kill('SIGTERM');
      const force = setTimeout(() => child.kill('SIGKILL'), 5000);
      try { await exited; } finally { clearTimeout(force); lines.close(); }
    },
  };
}
