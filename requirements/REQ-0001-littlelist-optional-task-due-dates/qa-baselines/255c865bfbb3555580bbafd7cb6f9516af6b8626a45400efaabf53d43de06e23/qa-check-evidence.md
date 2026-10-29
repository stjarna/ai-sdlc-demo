{"check":"ui","evidence":"/Users/davidkrzystek/Development/Interview/ai-sdlc-demo/requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/ui-hqFw8I","note":"Fresh execution evidence; no historical report is overwritten."}

Running 15 tests using 1 worker

(node:53775) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓   1 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:27:1 › TC-001: empty optional due date creates a usable undated task (812ms)
  ✓   2 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:31:1 › TC-002 TC-003 TC-016: past/today/future dates accepted on creation and autosaved edits (3.2s)
  ✓   3 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:43:1 › TC-004 TC-005: edit and clear autosave without a separate save action (2.3s)
  ✓   4 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:52:1 › TC-006 TC-017: impossible calendar drafts preserve the saved valid leap day (2.0s)
  ✓   5 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:64:1 › TC-006: partial date input cannot silently clear the saved date (1.4s)
  ✓   6 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:84:1 › TC-007 TC-018: local date survives reload/restart and DST-adjacent editing in each timezone (1.6s)
  ✓   7 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:92:1 › TC-008 TC-009 TC-019: local year boundary, explicit subtle warning and unchanged ordering (726ms)
  ✓   8 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:99:1 › TC-010 TC-021: completion retains date, removes warning, reopening restores it without reordering (788ms)
  ✓   9 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:111:1 › TC-011 TC-022: Cancel keeps the latest saved date or saved cleared state, discarding only a draft (2.9s)
  ✓  10 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:124:1 › TC-012 TC-023: actual process restart retains dates, changes, clearing and completion (2.7s)
  ✓  11 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:137:3 › legacy v1 data › TC-013: legacy task fields/completion remain visible without dates after migration (431ms)
  ✓  12 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:145:1 › TC-014: title validation, CRUD, completion, reopening and confirmed deletion remain usable (1.8s)
  ✓  13 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:159:1 › TC-015: readable labelled date controls, responsive layout and restored keyboard focus (1.4s)
  ✓  14 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:171:1 › TC-020: next local calendar day changes overdue presentation without changing the saved date (537ms)
  ✓  15 [desktop-los-angeles] › qa/browser/due-dates.spec.mjs:177:1 › TC-002 TC-004: extended calendar years do not silently clear on editing another field (1.4s)

  15 passed (25.0s)
