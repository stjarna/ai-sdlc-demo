{"check":"ui","evidence":"/Users/davidkrzystek/Development/Interview/ai-sdlc-demo/requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/ui-Wb5uYF","note":"Fresh execution evidence; no historical report is overwritten."}

Running 15 tests using 1 worker

(node:49564) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓   1 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:27:1 › TC-001: empty optional due date creates a usable undated task (595ms)
  ✓   2 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:31:1 › TC-002 TC-003 TC-016: past/today/future dates accepted on creation and autosaved edits (3.2s)
  ✓   3 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:43:1 › TC-004 TC-005: edit and clear autosave without a separate save action (2.2s)
  ✓   4 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:52:1 › TC-006 TC-017: impossible calendar drafts preserve the saved valid leap day (1.9s)
  ✘   5 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:64:1 › TC-006: native partial date input cannot silently clear the saved date (5.9s)
(node:49676) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓   6 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:75:1 › TC-007 TC-018: local date survives reload/restart and DST-adjacent editing in each timezone (1.6s)
  ✓   7 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:83:1 › TC-008 TC-009 TC-019: local year boundary, explicit subtle warning and unchanged ordering (675ms)
  ✓   8 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:90:1 › TC-010 TC-021: completion retains date, removes warning, reopening restores it without reordering (721ms)
  ✓   9 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:102:1 › TC-011 TC-022: Cancel keeps the latest saved date or saved cleared state, discarding only a draft (2.7s)
  ✓  10 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:115:1 › TC-012 TC-023: actual process restart retains dates, changes, clearing and completion (2.6s)
  ✓  11 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:128:3 › legacy v1 data › TC-013: legacy task fields/completion remain visible without dates after migration (363ms)
  ✓  12 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:136:1 › TC-014: title validation, CRUD, completion, reopening and confirmed deletion remain usable (1.7s)
  ✓  13 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:150:1 › TC-015: readable labelled date controls, responsive layout and restored keyboard focus (1.4s)
  ✓  14 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:162:1 › TC-020: next local calendar day changes overdue presentation without changing the saved date (503ms)
  ✓  15 [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:168:1 › TC-002 TC-004: extended calendar years do not silently clear on editing another field (1.4s)


  1) [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:64:1 › TC-006: native partial date input cannot silently clear the saved date 

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

    Call Log:
    - Timeout 5000ms exceeded while waiting on the predicate

      67 |   // Real keyboard interaction with the first native date segment, not a mocked validity object.
      68 |   await date.press('ArrowLeft'); await date.press('ArrowLeft'); await date.press('ArrowLeft'); await date.press('Delete');
    > 69 |   await expect.poll(() => date.evaluate(el => el.validity.badInput)).toBe(true);
         |                                                                      ^
      70 |   await expect(page.locator('#edit-due-date-error')).toBeVisible(); await expect(page.locator('#edit-done')).toBeDisabled();
      71 |   await page.waitForTimeout(650);
      72 |   const task = (await (await page.request.get(app.url + '/api/tasks')).json()).tasks[0]; expect(task.dueDate).toBe('2024-02-29');
        at /Users/davidkrzystek/Development/Interview/ai-sdlc-demo/qa/browser/due-dates.spec.mjs:69:70

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/ui-Wb5uYF/results/due-dates-TC-006-native-pa-4e84d-lently-clear-the-saved-date-mobile-kiritimati/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/ui-Wb5uYF/results/due-dates-TC-006-native-pa-4e84d-lently-clear-the-saved-date-mobile-kiritimati/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/ui-Wb5uYF/results/due-dates-TC-006-native-pa-4e84d-lently-clear-the-saved-date-mobile-kiritimati/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/ui-Wb5uYF/results/due-dates-TC-006-native-pa-4e84d-lently-clear-the-saved-date-mobile-kiritimati/trace.zip
    Usage:

        npx playwright show-trace requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/ui-Wb5uYF/results/due-dates-TC-006-native-pa-4e84d-lently-clear-the-saved-date-mobile-kiritimati/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    [mobile-kiritimati] › qa/browser/due-dates.spec.mjs:64:1 › TC-006: native partial date input cannot silently clear the saved date 
  14 passed (28.8s)
