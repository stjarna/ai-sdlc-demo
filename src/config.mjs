import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
export function databasePath({ override = process.env.TODO_DB_PATH, home = homedir(), project = root } = {}) {
  // Personal data survives restarts and stays separate from source and dependencies.
  return override ? resolve(project, override) : join(home, '.local', 'share', 'littlelist', 'tasks.sqlite');
}
