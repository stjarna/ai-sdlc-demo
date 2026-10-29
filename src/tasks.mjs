import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const LIMITS = Object.freeze({ title: 120, description: 2000 });
export class TaskError extends Error {
  constructor(code, message, status = 400, field) {
    super(message); this.code = code; this.status = status; this.field = field;
  }
}

export function validateTaskInput(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TaskError('INVALID_TASK', 'Supply a task object.');
  }
  const allowed = partial ? ['title', 'description', 'completed'] : ['title', 'description'];
  if (Object.keys(input).some(key => !allowed.includes(key)) || (partial && !Object.keys(input).length)) {
    throw new TaskError('INVALID_FIELDS', 'The task contains unsupported or missing fields.');
  }
  const result = {};
  if (!partial || Object.hasOwn(input, 'title')) {
    if (typeof input.title !== 'string' || !input.title.trim()) {
      throw new TaskError('TITLE_REQUIRED', 'A title is required.', 400, 'title');
    }
    const title = input.title.trim();
    if ([...title].length > LIMITS.title || /[\u0000-\u001f\u007f]/u.test(title)) {
      throw new TaskError('INVALID_TITLE', `Use a single-line title of ${LIMITS.title} characters or fewer.`, 400, 'title');
    }
    result.title = title;
  }
  if (!partial || Object.hasOwn(input, 'description')) {
    const description = input.description ?? (partial || Object.hasOwn(input, 'description') ? null : '');
    if (typeof description !== 'string' || [...description].length > LIMITS.description || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(description)) {
      throw new TaskError('INVALID_DESCRIPTION', `Use a description of ${LIMITS.description} characters or fewer.`, 400, 'description');
    }
    result.description = description.trim();
  }
  if (Object.hasOwn(input, 'completed')) {
    if (typeof input.completed !== 'boolean') throw new TaskError('INVALID_COMPLETION', 'Completion must be true or false.', 400, 'completed');
    result.completed = input.completed;
  }
  return result;
}

function task(row) {
  return row ? { id: row.id, title: row.title, description: row.description, completed: row.completed === 1 } : null;
}

export function createTaskStore(filename) {
  if (filename !== ':memory:') mkdirSync(dirname(resolve(filename)), { recursive: true });
  const db = new DatabaseSync(filename);
  try {
    db.exec('PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;');
    const version = db.prepare('PRAGMA user_version').get().user_version;
    if (![0, 1].includes(version)) throw new Error(`Unsupported database schema ${version}; existing data was not replaced.`);
    db.exec(`CREATE TABLE IF NOT EXISTS tasks (
      sequence INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
      description TEXT NOT NULL DEFAULT '' CHECK(length(description) <= 2000),
      completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1))
    ); PRAGMA user_version = 1;`);
    const queries = {
      list: db.prepare('SELECT id,title,description,completed FROM tasks ORDER BY sequence DESC'),
      get: db.prepare('SELECT id,title,description,completed FROM tasks WHERE id = ?'),
      create: db.prepare('INSERT INTO tasks(id,title,description) VALUES(?,?,?)'),
      update: db.prepare('UPDATE tasks SET title=?,description=?,completed=? WHERE id=?'),
      remove: db.prepare('DELETE FROM tasks WHERE id=?'),
    };
    let closed = false;
    const get = id => {
      const found = task(queries.get.get(id));
      if (!found) throw new TaskError('TASK_NOT_FOUND', 'This task no longer exists.', 404);
      return found;
    };
    return {
      list: () => queries.list.all().map(task),
      get,
      create(input) {
        const value = validateTaskInput(input); const id = randomUUID();
        queries.create.run(id, value.title, value.description); return get(id);
      },
      update(id, input) {
        const changes = validateTaskInput(input, { partial: true });
        // The synchronous transaction also protects partial updates across DB connections.
        db.exec('BEGIN IMMEDIATE');
        try {
          const value = { ...get(id), ...changes };
          queries.update.run(value.title, value.description, Number(value.completed), id);
          db.exec('COMMIT'); return get(id);
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      },
      remove(id) { get(id); queries.remove.run(id); },
      close() { if (!closed) { db.close(); closed = true; } },
    };
  } catch (error) { db.close(); throw error; }
}
