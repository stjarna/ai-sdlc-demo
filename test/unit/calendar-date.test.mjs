import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { validCalendarDate, compareCalendarDates, localCalendarDate, isOverdue, dateDraft } from '../../public/calendar-date.js';

test('accepts past, current and future calendar dates without a date window', () => {
  for (const value of ['0001-01-01', '1900-01-01', '2000-02-29', '2026-10-29', '9999-12-31', '10000-01-01', '123456789012345678900-02-28']) assert.equal(validCalendarDate(value), true, value);
  assert.equal(compareCalendarDates('9999-12-31', '10000-01-01'), -1);
  assert.equal(compareCalendarDates('10000-01-01', '9999-12-31'), 1);
  assert.equal(compareCalendarDates('2000-02-29', '2000-02-29'), 0);
});
test('rejects impossible dates, timestamps, malformed representations and wrong types', () => {
  for (const value of ['0000-01-01', '1900-02-29', '2100-02-29', '2026-04-31', '2026-00-01', '2026-13-01', '2026-01-00', '2026-1-01', '2026-01-01T00:00:00Z', '2026-01-01 ', '', null, 1, [], {}]) assert.equal(validCalendarDate(value), false, String(value));
  assert.throws(() => compareCalendarDates('bad', '2026-01-01'), TypeError);
});
test('overdue means unfinished and strictly before the local calendar day', () => {
  const today = '2026-10-29';
  assert.equal(isOverdue({ dueDate: '2026-10-28', completed: false }, today), true);
  for (const dueDate of [null, '2026-10-29', '2026-10-30']) assert.equal(isOverdue({ dueDate, completed: false }, today), false);
  assert.equal(isOverdue({ dueDate: '2026-10-28', completed: true }, today), false);
  assert.equal(isOverdue({ dueDate: '2026-10-28', completed: false }, today), true);
});
test('uses device-local calendar components across opposite timezones and DST', () => {
  for (const [zone, expected] of [['America/Los_Angeles', '2026-10-28'], ['Pacific/Kiritimati', '2026-10-29']]) {
    const code = `import {localCalendarDate} from './public/calendar-date.js';console.log(localCalendarDate(new Date('2026-10-29T01:00:00Z')));`;
    const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd: new URL('../../', import.meta.url), env: { ...process.env, TZ: zone }, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr); assert.equal(r.stdout.trim(), expected);
  }
  assert.equal(localCalendarDate(new Date(2026, 2, 29, 12)), '2026-03-29');
});
test('invalid and partial drafts cannot be mistaken for intentional clearing', () => {
  assert.deepEqual(dateDraft('', { badInput: true, valid: false }), { valid: false, value: null });
  assert.equal(dateDraft('2026-02-30').valid, false);
  assert.deepEqual(dateDraft('', { valid: true }), { valid: true, value: null });
  assert.deepEqual(dateDraft('2026-10-28', { valid: true }), { valid: true, value: '2026-10-28' });
});
