// Calendar values stay strings, never UTC instants. BigInt avoids an arbitrary year window.
export function calendarParts(value) {
  if (typeof value !== 'string' || !/^(?:[0-9]{4}|[1-9][0-9]{4,})-[0-9]{2}-[0-9]{2}$/.test(value)) return null;
  const [yearText, monthText, dayText] = value.split('-');
  const year = BigInt(yearText), month = Number(monthText), day = Number(dayText);
  if (year < 1n || month < 1 || month > 12) return null;
  const leap = year % 4n === 0n && (year % 100n !== 0n || year % 400n === 0n);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= days[month - 1] ? { year, month, day } : null;
}
export function validCalendarDate(value) { return calendarParts(value) !== null; }
export function compareCalendarDates(left, right) {
  const a = calendarParts(left), b = calendarParts(right);
  if (!a || !b) throw new TypeError('Compare valid calendar dates.');
  for (const key of ['year', 'month', 'day']) {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
  }
  return 0;
}
export function localCalendarDate(now = new Date()) {
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function isOverdue(task, today = localCalendarDate()) {
  return !task.completed && validCalendarDate(task.dueDate) && compareCalendarDates(task.dueDate, today) < 0;
}
export function dateDraft(value, validity = {}) {
  // Native partial input can expose an empty value with badInput=true; never clear it.
  if (validity.badInput || validity.valid === false) return { valid: false, value: null };
  return { valid: value === '' || validCalendarDate(value), value: value === '' ? null : value };
}
