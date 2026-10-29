import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { TaskError } from './tasks.mjs';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/calendar-date.js', ['calendar-date.js', 'text/javascript; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
]);
const root = new URL('../public/', import.meta.url);
const MAX_BODY = 16 * 1024;

async function jsonBody(request) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type'] ?? '')) {
    throw new TaskError('JSON_REQUIRED', 'Use an application/json request.', 415);
  }
  const chunks = []; let size = 0;
  await new Promise((resolve, reject) => {
    let oversized = false;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        if (!oversized) { oversized = true; chunks.length = 0; reject(new TaskError('BODY_TOO_LARGE', 'The request is too large.', 413)); }
        return; // Continue draining without buffering or destroying the response socket.
      }
      if (!oversized) chunks.push(chunk);
    });
    request.on('end', () => { if (!oversized) resolve(); });
    request.on('aborted', () => reject(new TaskError('INVALID_JSON', 'The request was interrupted.')));
    request.on('error', reject);
  });
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); }
  catch { throw new TaskError('INVALID_JSON', 'Supply valid UTF-8 JSON.'); }
}

export function createAppServer(store) {
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Cache-Control', 'no-store');
    const send = (status, value) => {
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(value));
    };
    try {
      const port = server.address().port;
      if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(request.headers.host)) {
        throw new TaskError('INVALID_HOST', 'Use the local application address.', 403);
      }
      const origin = `http://${request.headers.host}`;
      if (request.headers.origin && request.headers.origin !== origin) {
        throw new TaskError('FOREIGN_ORIGIN', 'Cross-origin requests are not allowed.', 403);
      }
      const url = new URL(request.url, origin);
      const method = request.method;
      if (url.pathname === '/api/tasks' && method === 'GET') return send(200, { tasks: store.list() });
      if (url.pathname === '/api/tasks' && method === 'POST') return send(201, { task: store.create(await jsonBody(request)) });
      const match = /^\/api\/tasks\/([0-9a-f-]{36})$/.exec(url.pathname);
      if (match) {
        if (method === 'GET') return send(200, { task: store.get(match[1]) });
        if (method === 'PATCH') return send(200, { task: store.update(match[1], await jsonBody(request)) });
        if (method === 'DELETE') { store.remove(match[1]); response.writeHead(204); return response.end(); }
        throw new TaskError('METHOD_NOT_ALLOWED', 'This operation is not supported.', 405);
      }
      const asset = assets.get(url.pathname);
      if (asset && ['GET','HEAD'].includes(method)) {
        const raw = await readFile(fileURLToPath(new URL(asset[0], root)));
        response.writeHead(200, { 'Content-Type': asset[1] });
        return response.end(method === 'HEAD' ? undefined : raw);
      }
      throw new TaskError('NOT_FOUND', 'This resource does not exist.', 404);
    } catch (error) {
      if (response.destroyed) return;
      if (error instanceof TaskError) return send(error.status, { error: { code: error.code, message: error.message, ...(error.field ? { field: error.field } : {}) } });
      console.error('Request failed:', error);
      send(500, { error: { code: 'SERVER_ERROR', message: 'Something went wrong. Your saved tasks have been kept.' } });
    }
  });
  server.requestTimeout = 10_000;
  server.headersTimeout = 10_000;
  return server;
}
