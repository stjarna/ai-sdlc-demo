# Test Scenarios — REQ-0001

## Authority

AI-authored QA draft from approved Functional Analysis baseline 63329d63c760e41f166e1b99d277534aeb8063e3469e7383a26e45ce4ad5e649 and explicit advancement faa97785-1068-4c72-9d78-e3683828ed05. The approved Business dependency is retained through that baseline. Testing skill 1.3.0, digest 86975e0917f3db19923051aeee52c367b1b5c9ceac62985190cd4a2f0594de1f. Product expectations derive only from approved FR/AC items; no Technical Design, implementation plan or prototype supplies expected outcomes. Scope: all 7 FRs and 15 ACs, local single-user Littlelist due dates and existing CRUD compatibility. No inherited unresolved items, excluded approved requirements or prototype limitations exist in this Analysis.

## Scenarios

### TC-001 — Create without a due date
References: FR-001, AC-001
Status: specified; not automated or executed.
Preconditions: A user is creating a task with a valid title.
Action: The user leaves the due date empty and creates the task.
Expected: The task is saved without a due date and remains usable.

### TC-002 — Past, today and future dates are accepted
References: FR-001, FR-003, AC-002
Status: specified; not automated or executed.
Preconditions: A user creates or edits a task and supplies a valid calendar date before, on or after device-local today.
Action: The task or date change is saved.
Expected: The selected date is accepted in all three cases; being past is never itself a rejection reason.

### TC-003 — Assigned date visible in task list
References: FR-001, AC-003
Status: specified; not automated or executed.
Preconditions: A task has a saved due date.
Action: The user views the task list.
Expected: The assigned calendar date is clearly visible for that task.

### TC-004 — Change an existing date
References: FR-002, AC-004
Status: specified; not automated or executed.
Preconditions: An existing task has a saved due date.
Action: The user selects another valid date and existing autosave completes.
Expected: The new date replaces the old date and is shown in the list.

### TC-005 — Clear an existing date
References: FR-002, AC-005
Status: specified; not automated or executed.
Preconditions: A task has a saved due date.
Action: The user clears it and existing autosave completes.
Expected: The date is removed; the task remains usable without a date and has no overdue indication.

### TC-006 — Invalid calendar draft preserves saved value
References: FR-003, AC-006
Status: specified; not automated or executed.
Preconditions: A task has a last valid saved due date.
Action: The user attempts to save an impossible calendar date.
Expected: The invalid date is rejected and the last valid saved date remains unchanged.

### TC-007 — No timezone-related date shift
References: FR-003, AC-007
Status: specified; not automated or executed.
Preconditions: A user selects a calendar date on a device with a local timezone different from UTC.
Action: The date is saved and the task is viewed or reopened after restart.
Expected: The same selected calendar date is displayed without shifting it through timezone conversion.

### TC-008 — Past unfinished task is overdue
References: FR-004, AC-008
Status: specified; not automated or executed.
Preconditions: An unfinished task has a due date earlier than device-local today.
Action: The user views the task list.
Expected: The task shows an explicit Overdue label and subtle warning styling without changing task ordering.

### TC-009 — Today, future and undated tasks are not overdue
References: FR-004, AC-009
Status: specified; not automated or executed.
Preconditions: Unfinished tasks have dates equal to today, after today, or no due date.
Action: The user views the task list.
Expected: None of these tasks shows overdue emphasis; ordering remains unchanged.

### TC-010 — Complete and reopen a dated task
References: FR-005, AC-010
Status: specified; not automated or executed.
Preconditions: An unfinished dated task is overdue.
Action: The user completes it and later reopens it.
Expected: Completion retains the date and removes overdue emphasis; reopening restores it if the date is still before local today.

### TC-011 — Cancel unsaved draft retains saved changes
References: FR-002, AC-011
Status: specified; not automated or executed.
Preconditions: A date change has already autosaved and the user then makes an unsaved or invalid date draft.
Action: The user cancels the draft.
Expected: Only that draft is discarded; the most recently autosaved date or saved cleared state remains.

### TC-012 — Dates and cleared state persist across restart
References: FR-006, AC-012
Status: specified; not automated or executed.
Preconditions: Tasks include an assigned date, a changed date and a cleared date.
Action: The application is stopped and restarted.
Expected: Each saved date or cleared state is retained for its task.

### TC-013 — Existing undated task compatibility
References: FR-006, AC-013
Status: specified; not automated or executed.
Preconditions: Existing task data was created by the original CRUD application with no due-date fields.
Action: The extended application opens that data.
Expected: Existing titles, descriptions and completion states remain intact and the tasks have no due date.

### TC-014 — Original CRUD and completion regression
References: FR-006, AC-014
Status: specified; not automated or executed.
Preconditions: Existing tasks and newly created tasks include dated and undated examples.
Action: The user creates, reads, edits, completes, reopens and confirms deletion of tasks.
Expected: The existing CRUD/completion behavior remains operational, including title validation and deletion confirmation.

### TC-015 — Consistent usable date controls
References: FR-007, AC-015
Status: specified; not automated or executed.
Preconditions: The user operates Littlelist in its existing desktop or phone layout.
Action: The user creates or edits a date and views its display and validation state.
Expected: Date controls and messages remain readable and usable, visually consistent with the existing Littlelist layout.

### TC-016 — Past, today and future dates are accepted
References: FR-001, FR-003, AC-002
Status: specified; not automated or executed.
Preconditions: Run with a controlled device-local today and a task without a date.
Action: Create and edit tasks using yesterday, today and tomorrow, independently through the actual UI and the supported integration boundary.
Expected: All valid dates are accepted and remain the selected calendar dates. No minimum-today restriction prevents past-date entry.

### TC-017 — Invalid calendar draft preserves saved value
References: FR-003, AC-006
Status: specified; not automated or executed.
Preconditions: An existing task has a valid saved due date. Use controlled fixtures containing 2024-02-29, 2025-02-29 and 2024-02-30.
Action: Save the valid leap-day value, then attempt impossible February dates through the supported data-entry and integration boundary.
Expected: The valid leap day saves. Impossible dates do not replace it. Validation communicates failure rather than claiming a save.

### TC-018 — No timezone-related date shift
References: FR-003, AC-007
Status: specified; not automated or executed.
Preconditions: Run equivalent date-entry fixtures in device timezones Pacific/Kiritimati and America/Los_Angeles, with the same selected calendar date.
Action: Create, save, reload and edit the date, including a fixture near a daylight-saving transition.
Expected: The selected calendar date never shifts forward or backward because of timezone conversion; no time-of-day meaning is introduced.

### TC-019 — Past unfinished task is overdue
References: FR-004, AC-008
Status: specified; not automated or executed.
Preconditions: Use two unfinished task fixtures around a controlled local year boundary: 31 December and 1 January.
Action: View the task list on 1 January device-local today.
Expected: 31 December is overdue; 1 January is not. Existing creation order remains unchanged.

### TC-020 — Today, future and undated tasks are not overdue
References: FR-004, AC-009
Status: specified; not automated or executed.
Preconditions: A task is due on device-local today; the test clock can advance to the following local day.
Action: View the list before midnight, advance the controlled local calendar day, then view the list again.
Expected: The date remains unchanged. It is not overdue on its due day and is overdue when viewed as unfinished the next day; no requirement for a background timer is invented.

### TC-021 — Complete and reopen a dated task
References: FR-005, AC-010
Status: specified; not automated or executed.
Preconditions: A task has a past due date and can be shown in the existing Active, Completed and All views.
Action: Complete it, inspect the completed task date, reopen it and inspect its overdue state.
Expected: The date is retained across completion and reopening. Completed presentation has no overdue emphasis; reopening restores it without reordering.

### TC-022 — Cancel unsaved draft retains saved changes
References: FR-002, AC-011
Status: specified; not automated or executed.
Preconditions: A task has an autosaved date change; separately exercise a task whose date was already cleared and saved.
Action: Enter an unsaved valid date draft or an invalid draft and cancel before it is saved.
Expected: The latest saved changed date or cleared state is preserved. Cancel does not restore an older date or save the draft.

### TC-023 — Dates and cleared state persist across restart
References: FR-006, AC-012
Status: specified; not automated or executed.
Preconditions: Prepare dated and cleared tasks with active/completed states using an isolated database.
Action: Stop the actual application process, restart with the same database, and inspect the saved task states through the UI and integration boundary.
Expected: Each date or absence of date, along with existing task identity/content/completion, survives restart. No personal database is used.

## Coverage and unresolved items

All 22 active FR/AC items have planned scenario coverage; 23 specified scenarios, none executed. Structured coverage disposition implemented means specified scenario coverage, not implemented automation or passed tests. No blocked, excluded or unresolved items; no authorized limitations. A new upstream Analysis cycle requires explicit impact reconciliation.

## Test data

<!-- Optional section; omit when not applicable. -->

Fictional tasks, controlled device-local today, yesterday/today/tomorrow, month/year boundaries, valid and invalid February dates, positive/negative UTC offset and DST fixtures, active/completed and dated/undated tasks, saved/unsaved/invalid drafts, isolated SQLite-compatible legacy task records. Exact automation mechanics follow approved interfaces; no product date range restriction is introduced.
