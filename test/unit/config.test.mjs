import { test } from 'node:test';
import assert from 'node:assert/strict';
import { databasePath } from '../../src/config.mjs';

test('default persistent data is outside the application and dependency directories', () => {
  assert.equal(databasePath({ override:'', home:'/user-home', project:'/application' }), '/user-home/.local/share/littlelist/tasks.sqlite');
});
test('relative database overrides resolve from the application root', () => {
  assert.equal(databasePath({ override:'local/tasks.sqlite', home:'/user-home', project:'/application' }), '/application/local/tasks.sqlite');
});
test('absolute database overrides retain their explicitly selected location', () => {
  assert.equal(databasePath({ override:'/isolated/task-data.sqlite', home:'/user-home', project:'/application' }), '/isolated/task-data.sqlite');
});
