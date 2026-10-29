import { databasePath } from './config.mjs';
import { createTaskStore } from './tasks.mjs';
import { createAppServer } from './http.mjs';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer between 0 and 65535.');
const dbPath = databasePath();
const store = createTaskStore(dbPath);
const server = createAppServer(store);
server.on('error', error => { console.error(error.message); store.close(); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => {
  console.log(JSON.stringify({ event: 'listening', url: `http://127.0.0.1:${server.address().port}`, dbPath }));
});
let stopping = false;
function stop() {
  if (stopping) return; stopping = true;
  server.close(() => { store.close(); });
  server.closeAllConnections();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
