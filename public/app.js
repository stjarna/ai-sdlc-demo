import { dateDraft, isOverdue, localCalendarDate } from './calendar-date.js';

const $ = selector => document.querySelector(selector);
const list = $('#task-list');
const createForm = $('#create-form');
const editDialog = $('#edit-dialog');
const deleteDialog = $('#delete-dialog');
let tasks = [];
let filter = 'active';
let loaded = false;
let editor = null;
let deleting = null;
let toastTimer;
const pending = new Set();

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('icon'); svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`); svg.append(use); return svg;
}

async function api(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`/api/tasks${path}`, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch { throw new Error('Could not reach the local server. Make sure it is running, then try again.'); }
  if (response.status === 204) return null;
  const value = await response.json();
  if (!response.ok) throw new Error(value.error?.message ?? 'The request could not be saved. Please try again.');
  return value;
}

function showError(message) {
  $('#connection-message').textContent = message; $('#connection-error').hidden = false;
}
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 2600);
  $('#announcer').textContent = message;
}
function visibleTasks() { return tasks.filter(task => filter === 'all' || task.completed === (filter === 'completed')); }
function replaceTask(task) { tasks = tasks.map(item => item.id === task.id ? task : item); }
function actionButton(action, label, symbol, extra = '') {
  const button = document.createElement('button'); button.type = 'button';
  button.className = `icon-button ${extra}`; button.dataset.action = action;
  button.setAttribute('aria-label', label); button.title = label; button.append(icon(symbol)); return button;
}
function render() {
  const completed = tasks.filter(task => task.completed).length;
  const active = tasks.length - completed;
  $('#nav-count').textContent = tasks.length; $('#task-total').textContent = tasks.length;
  $('#count-all').textContent = tasks.length; $('#count-active').textContent = active; $('#count-completed').textContent = completed;
  $('#progress-copy').textContent = tasks.length ? `${completed} of ${tasks.length} complete. Keep going gently.` : 'A little progress starts here.';
  const visible = visibleTasks(); const fragment = document.createDocumentFragment();
  for (const task of visible) {
    const row = document.createElement('li'); row.className = `task-item${task.completed ? ' completed' : ''}`;
    row.dataset.id = task.id;
    const check = actionButton('toggle', `Mark “${task.title}” as ${task.completed ? 'unfinished' : 'complete'}`, 'check');
    check.className = 'task-check'; check.setAttribute('aria-pressed', String(task.completed));
    if (!task.completed) check.replaceChildren();
    const text = document.createElement('div'); text.className = 'task-text';
    const title = document.createElement('button'); title.type = 'button'; title.className = 'task-title';
    title.dataset.action = 'edit'; title.textContent = task.title; title.setAttribute('aria-label', `Edit “${task.title}”`);
    text.append(title);
    if (task.description) {
      const description = document.createElement('p'); description.className = 'task-description';
      description.textContent = task.description; text.append(description);
    }
    if (task.dueDate) {
      const due = document.createElement('p'); due.className = 'task-due-date';
      updateDateLabel(task, due);
      row.classList.toggle('overdue', isOverdue(task));
      text.append(due);
    }
    const actions = document.createElement('div'); actions.className = 'task-actions';
    actions.append(actionButton('edit', `Edit details for “${task.title}”`, 'edit'), actionButton('delete', `Delete “${task.title}”`, 'trash', 'delete-button'));
    row.append(check, text, actions); fragment.append(row);
  }
  list.replaceChildren(fragment); list.hidden = !loaded || visible.length === 0;
  $('#empty-state').hidden = !loaded || visible.length > 0;
  const empty = !tasks.length ? ['A clear space. A fresh start.', 'Add your first task above. Small is a good place to start.'] : filter === 'completed' ? ['Good things take small steps.', 'Your completed tasks will appear here. Check one off when you’re ready.'] : ['A little lighter already.', 'You’ve cleared your active list. Enjoy the breathing room, or add something new.'];
  $('#empty-title').textContent = empty[0]; $('#empty-copy').textContent = empty[1];
}
function updateDateLabel(task, label) {
  label.textContent = `Due ${task.dueDate}`;
  if (isOverdue(task)) {
    const badge = document.createElement('span'); badge.className = 'overdue-label';
    badge.textContent = 'Overdue'; label.append(' ', badge);
  }
}
function refreshDatePresentation() {
  // Updating only date labels preserves focus and in-progress task interactions.
  for (const row of list.querySelectorAll('[data-id]')) {
    const task = tasks.find(item => item.id === row.dataset.id);
    const label = row.querySelector('.task-due-date');
    if (task && label) { updateDateLabel(task, label); row.classList.toggle('overdue', isOverdue(task)); }
  }
}
function focusList(index = 0) {
  const checks = [...list.querySelectorAll('.task-check')];
  (checks[Math.min(index, checks.length - 1)] ?? $('#new-title')).focus({ preventScroll: true });
}

async function load() {
  $('#create-button').disabled = true; $('#loading').hidden = false;
  try {
    tasks = (await api()).tasks; loaded = true; $('#connection-error').hidden = true;
    render();
  } catch (error) { showError(error.message); }
  finally { $('#loading').hidden = true; $('#create-button').disabled = !loaded; }
}

createForm.addEventListener('submit', async event => {
  event.preventDefault();
  const title = $('#new-title').value.trim();
  if (!title) {
    $('#new-title-error').textContent = 'A title is required.'; $('#new-title-error').hidden = false;
    $('#new-title').setAttribute('aria-invalid', 'true'); $('#new-title').focus(); return;
  }
  const date = dateDraft($('#new-due-date').value, $('#new-due-date').validity);
  if (!date.valid) {
    showDateError('new', true); $('#new-due-date').focus(); return;
  }
  showDateError('new', false);
  const description = $('#new-description').value;
  const fields = [...createForm.querySelectorAll('input,textarea,button')]; fields.forEach(field => { field.disabled = true; });
  try {
    const { task } = await api('', { method: 'POST', body: JSON.stringify({ title, description, dueDate: date.value }) });
    tasks.unshift(task); createForm.reset(); $('#new-title-error').hidden = true;
    $('#new-title').removeAttribute('aria-invalid'); $('#new-description-section').hidden = true;
    $('#description-toggle').setAttribute('aria-expanded', 'false');
    $('#description-toggle span').textContent = 'Add a description';
    $('#connection-error').hidden = true; render(); toast('A small step added to your list.');
  } catch (error) { showError(error.message); }
  finally { fields.forEach(field => { field.disabled = false; }); $('#new-title').focus(); }
});
$('#new-title').addEventListener('input', () => {
  if ($('#new-title').value.trim()) { $('#new-title-error').hidden = true; $('#new-title').removeAttribute('aria-invalid'); }
});
$('#description-toggle').addEventListener('click', () => {
  const expanded = $('#description-toggle').getAttribute('aria-expanded') !== 'true';
  $('#description-toggle').setAttribute('aria-expanded', String(expanded));
  $('#new-description-section').hidden = !expanded;
  $('#description-toggle span').textContent = expanded ? 'Hide description' : 'Add a description';
  if (expanded) $('#new-description').focus();
});
$('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]'); if (!button) return;
  filter = button.dataset.filter;
  for (const item of document.querySelectorAll('[data-filter]')) {
    item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button));
  }
  render();
});

list.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const row = button.closest('[data-id]'); const task = tasks.find(item => item.id === row.dataset.id);
  if (!task || pending.has(task.id)) return;
  if (button.dataset.action === 'edit') return openEditor(task);
  if (button.dataset.action === 'delete') return openDelete(task);
  const index = visibleTasks().findIndex(item => item.id === task.id);
  pending.add(task.id); button.setAttribute('aria-disabled', 'true');
  try {
    const result = await api(`/${task.id}`, { method: 'PATCH', body: JSON.stringify({ completed: !task.completed }) });
    const restore = document.activeElement === button;
    replaceTask(result.task); render();
    if (restore) focusList(index);
    toast(result.task.completed ? 'One less thing on your mind.' : 'Task moved back to your active list.');
  } catch (error) { showError(error.message); }
  finally { pending.delete(task.id); button.removeAttribute('aria-disabled'); }
});

function showDateError(prefix, invalid) {
  const field = $(`#${prefix}-due-date`), error = $(`#${prefix}-due-date-error`);
  field.setAttribute('aria-invalid', String(invalid)); error.hidden = !invalid;
  error.textContent = invalid ? 'Enter a valid calendar date, or use Clear due date. Your saved value is unchanged.' : '';
}
for (const prefix of ['new', 'edit']) {
  $(`#${prefix}-type-date`).addEventListener('click', () => {
    const field = $(`#${prefix}-due-date`);
    if (field.validity.badInput) { showDateError(prefix, true); field.focus(); return; }
    field.type = 'text'; field.placeholder = 'YYYY-MM-DD';
    $(`#${prefix}-type-date`).hidden = true; field.focus();
  });
}
$('#new-due-date').addEventListener('input' , () => {
  showDateError('new', !dateDraft($('#new-due-date').value, $('#new-due-date').validity).valid);
});
$('#new-clear-date').addEventListener('click', () => {
  $('#new-due-date').value = ''; showDateError('new', false); $('#new-due-date').focus();
});

function draftValid() {
  return editor && editor.dateValid && Boolean(editor.draft.title.trim()) && [...editor.draft.title.trim()].length <= 120 && [...editor.draft.description].length <= 2000;
}
function dirty() { return editor && (editor.draft.title.trim() !== editor.saved.title || editor.draft.description.trim() !== editor.saved.description || editor.draft.dueDate !== editor.saved.dueDate || !editor.dateValid); }
function editorStatus(message) { $('#edit-save-status').textContent = message; }
function validateEditor() {
  const invalid = !editor.draft.title.trim();
  $('#edit-title-error').hidden = !invalid;
  $('#edit-title-error').textContent = invalid ? 'A title is required. Your previous saved title is unchanged.' : '';
  $('#edit-title').setAttribute('aria-invalid', String(invalid));
  showDateError('edit', !editor.dateValid);
  $('#edit-done').disabled = !draftValid() || Boolean(editor.saving);
}
function openEditor(task) {
  editor = { id: task.id, saved: { ...task }, draft: { title: task.title, description: task.description, dueDate: task.dueDate }, dateValid: true, timer: null, saving: null };
  $('#edit-due-date').value = task.dueDate ?? '';
  if (task.dueDate && $('#edit-due-date').value !== task.dueDate) {
    $('#edit-due-date').type = 'text'; $('#edit-due-date').placeholder = 'YYYY-MM-DD';
    $('#edit-due-date').value = task.dueDate; $('#edit-type-date').hidden = true;
  }
  $('#edit-title').value = task.title; $('#edit-description').value = task.description;
  $('#edit-error').hidden = true; $('#edit-cancel').disabled = false; $('#edit-close').disabled = false;
  validateEditor(); editorStatus('All changes saved'); editDialog.showModal(); $('#edit-title').focus();
}
function onDraftInput() {
  if (!editor) return;
  const date = dateDraft($('#edit-due-date').value, $('#edit-due-date').validity);
  editor.dateValid = date.valid;
  editor.draft = { title: $('#edit-title').value, description: $('#edit-description').value, dueDate: date.value };
  clearTimeout(editor.timer); $('#edit-error').hidden = true; validateEditor();
  editorStatus(dirty() ? 'Unsaved draft' : 'All changes saved');
  if (draftValid() && dirty()) editor.timer = setTimeout(() => { void saveEditor(); }, 450);
}
async function saveEditor() {
  const state = editor; if (!state) return false;
  clearTimeout(state.timer);
  if (state.saving) { await state.saving; return editor === state ? saveEditor() : false; }
  if (!draftValid()) return false;
  if (!dirty()) return true;
  const patch = { title: state.draft.title.trim(), description: state.draft.description.trim(), dueDate: state.draft.dueDate };
  editorStatus('Saving changes…'); $('#edit-cancel').disabled = true; $('#edit-close').disabled = true; $('#edit-done').disabled = true;
  let success = false;
  state.saving = (async () => {
    try {
      const { task } = await api(`/${state.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      state.saved = task; replaceTask(task); render(); success = true;
      editorStatus(dirty() ? 'Unsaved draft' : 'All changes saved');
    } catch (error) {
      $('#edit-error').textContent = error.message; $('#edit-error').hidden = false;
      editorStatus('Changes were not saved. Your saved task is unchanged.');
    } finally {
      state.saving = null;
      $('#edit-cancel').disabled = false; $('#edit-close').disabled = false; validateEditor();
    }
  })();
  await state.saving; return success;
}
function cancelEditor() {
  if (!editor || editor.saving) return;
  const id = editor.id;
  clearTimeout(editor.timer); editor = null; editDialog.close();
  // Autosave replaces list buttons, so restore the matching task's focus explicitly.
  (list.querySelector(`[data-id="${id}"] .task-title`) ?? $('#new-title')).focus({ preventScroll: true });
}
$('#edit-title').addEventListener('input', onDraftInput);
$('#edit-description').addEventListener('input', onDraftInput);
$('#edit-due-date').addEventListener('input', onDraftInput);
$('#edit-clear-date').addEventListener('click', () => {
  $('#edit-due-date').value = ''; onDraftInput(); $('#edit-due-date').focus();
});
$('#edit-cancel').addEventListener('click', cancelEditor);
$('#edit-close').addEventListener('click', cancelEditor);
editDialog.addEventListener('cancel', event => { event.preventDefault(); cancelEditor(); });
$('#edit-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!editor || !draftValid()) return;
  $('#edit-title').disabled = true; $('#edit-description').disabled = true; $('#edit-due-date').disabled = true; $('#edit-clear-date').disabled = true;
  try { if (await saveEditor()) cancelEditor(); }
  finally { $('#edit-title').disabled = false; $('#edit-description').disabled = false; $('#edit-due-date').disabled = false; $('#edit-clear-date').disabled = false; }
});

function openDelete(task) {
  deleting = { task, index: visibleTasks().findIndex(item => item.id === task.id) };
  $('#delete-task-title').textContent = task.title; $('#delete-error').hidden = true;
  $('#delete-confirm').disabled = false; $('#delete-cancel').disabled = false;
  deleteDialog.showModal(); $('#delete-cancel').focus();
}
$('#delete-cancel').addEventListener('click', () => { deleting = null; deleteDialog.close(); });
deleteDialog.addEventListener('cancel', event => {
  if ($('#delete-confirm').disabled) event.preventDefault(); else deleting = null;
});
$('#delete-confirm').addEventListener('click', async () => {
  if (!deleting) return;
  const state = deleting; $('#delete-confirm').disabled = true; $('#delete-cancel').disabled = true;
  try {
    await api(`/${state.task.id}`, { method: 'DELETE' });
    tasks = tasks.filter(task => task.id !== state.task.id); deleting = null;
    deleteDialog.close(); render(); focusList(state.index); toast('Task deleted. A little more space.');
  } catch (error) { $('#delete-error').textContent = error.message; $('#delete-error').hidden = false; }
  finally { $('#delete-confirm').disabled = false; $('#delete-cancel').disabled = false; }
});
$('#retry-load').addEventListener('click', load);
let dayTimer;
function scheduleDayRefresh() {
  clearTimeout(dayTimer);
  const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  dayTimer = setTimeout(() => { refreshDatePresentation(); scheduleDayRefresh(); }, next.getTime() - now.getTime() + 50);
}
let displayedDay = localCalendarDate();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { refreshDatePresentation(); scheduleDayRefresh(); }
});
window.addEventListener('focus', () => { refreshDatePresentation(); scheduleDayRefresh(); });
// Also notices clock/timezone changes while the app remains open.
setInterval(() => {
  const today = localCalendarDate();
  if (today !== displayedDay) { displayedDay = today; refreshDatePresentation(); scheduleDayRefresh(); }
}, 60_000);
scheduleDayRefresh();
await load();
