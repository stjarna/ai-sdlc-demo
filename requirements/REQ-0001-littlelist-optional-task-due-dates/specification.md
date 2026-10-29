# Functional Analysis — REQ-0001

Baseline: 76f0b3fbf7a093a9633e5ca10b3fc396174bde50e728c4d251ac02a03942250e
Approval: BD-0001
Handoff: 4d98af74-7793-4ab1-85b1-c822a7192d3e

## Functional requirements

### FR-001 — Optional due date and visible task date
Business sources: B-002
Discovery evidence: D-0002
Status: specified
Questions: -
Statement: Allow task creation with or without an optional due date, assignment during editing, and clear display of the assigned calendar date in the task list.

### FR-002 — Edit and clear with existing autosave
Business sources: B-002, B-011
Discovery evidence: D-0002, D-0019
Status: specified
Questions: -
Statement: Allow changing or clearing an assigned due date through existing editing/autosave behavior. Cancel discards only unsaved or invalid drafts and never undoes already saved changes.

### FR-003 — Calendar date eligibility and validation
Business sources: B-007, B-008
Discovery evidence: D-0009, D-0017
Status: specified
Questions: -
Statement: Accept past, present and future valid calendar dates. Use the device local calendar without timezone-related shifts. Reject invalid calendar dates while preserving the last valid saved date; absence of a date is valid.

### FR-004 — Overdue presentation without reordering
Business sources: B-009
Discovery evidence: D-0016
Status: specified
Questions: -
Statement: For an unfinished task with a date before device-local today, show an explicit Overdue label and subtle warning styling. Today, future dates and undated tasks are not overdue. Preserve existing ordering.

### FR-005 — Completion retains due dates
Business sources: B-010
Discovery evidence: D-0018
Status: specified
Questions: -
Statement: Completing a task retains its date without overdue emphasis. Reopening restores overdue indication if the retained date is before device-local today.

### FR-006 — Durability and CRUD compatibility
Business sources: B-003, B-004
Discovery evidence: D-0003, D-0004
Status: specified
Questions: -
Statement: Persist assigned, changed and cleared dates across restarts. Preserve existing undated records and CRUD/completion behavior.

### FR-007 — Consistent Littlelist experience
Business sources: B-005
Discovery evidence: D-0005
Status: specified
Questions: -
Statement: Present date creation, editing, clearing, display and validation as an intuitive, visually polished part of the existing Littlelist experience.

## Use cases

### UC-001 — Create task with optional date
Business sources: B-002, B-007, B-008, B-004, B-005
Discovery evidence: D-0002, D-0009, D-0017, D-0004, D-0005
Status: specified
Requirements: FR-001, FR-003, FR-006, FR-007
Questions: -
Actor: Littlelist user
Preconditions: Littlelist is running and the user is creating a task.
Trigger: The user creates a task.
Main flow: 1. The user enters a valid task title and optionally selects a calendar date.
  2. The application validates the date when supplied.
  3. The application saves the task and shows its assigned date in the list.
Alternative flows: Leaving the date empty is valid. A past date is valid. An impossible date is rejected without being saved; existing task validation remains intact.
Outcome: The task and any selected date are available in the list and remain saved across restart.

### UC-002 — Edit, validate or clear a due date
Business sources: B-002, B-011, B-008, B-004, B-005
Discovery evidence: D-0002, D-0019, D-0017, D-0004, D-0005
Status: specified
Requirements: FR-002, FR-003, FR-006, FR-007
Questions: -
Actor: Littlelist user
Preconditions: An existing task is available for editing.
Trigger: The user edits its due date.
Main flow: 1. The user opens the existing task editor.
  2. The user selects another date or clears the date.
  3. Valid changes follow existing autosave and update the task list.
Alternative flows: An invalid draft preserves the last valid saved date. Cancel discards only unsaved or invalid draft changes; previously autosaved changes remain saved.
Outcome: The valid new date or absence of date is saved; cancellation does not undo saved changes.

### UC-003 — View overdue state and complete or reopen
Business sources: B-002, B-009, B-010
Discovery evidence: D-0002, D-0016, D-0018
Status: specified
Requirements: FR-001, FR-004, FR-005
Questions: -
Actor: Littlelist user
Preconditions: Tasks are available in the list, with or without dates.
Trigger: The user views tasks or changes completion state.
Main flow: 1. The application shows assigned dates and identifies unfinished tasks dated before local today as Overdue.
  2. The user completes a task; the date remains and overdue emphasis disappears.
  3. The user reopens it; overdue indication returns when applicable.
Alternative flows: Today and future dates do not cause overdue status. Undated tasks remain supported. Existing ordering does not change.
Outcome: Dates and completion-related presentation reflect the current task state without changing ordering.

## Business rules

### BR-001 — No chronological rejection
Business sources: B-007
Discovery evidence: D-0009
Status: specified
Requirements: FR-003
Questions: -
Statement: A valid calendar date must not be rejected solely because it is before today; due dates are optional.

### BR-002 — Overdue predicate
Business sources: B-009, B-010
Discovery evidence: D-0016, D-0018
Status: specified
Requirements: FR-004, FR-005
Questions: -
Statement: Overdue emphasis applies only to unfinished tasks with a due date strictly before device-local today; completed or undated tasks receive no overdue emphasis.

### BR-003 — Cancel is not rollback of saved changes
Business sources: B-011
Discovery evidence: D-0019
Status: specified
Requirements: FR-002
Questions: -
Statement: Cancellation discards only the current unsaved or invalid draft; it does not revert earlier autosaved date changes.

## Acceptance criteria

### AC-001 — Create without a due date
Business sources: B-002
Discovery evidence: D-0002
Status: specified
Requirements: FR-001
Questions: -
Given: A user is creating a task with a valid title.
When: The user leaves the due date empty and creates the task.
Then: The task is saved without a due date and remains usable.

### AC-002 — Past, today and future dates are accepted
Business sources: B-002, B-007, B-008
Discovery evidence: D-0002, D-0009, D-0017
Status: specified
Requirements: FR-001, FR-003
Questions: -
Given: A user creates or edits a task and supplies a valid calendar date before, on or after device-local today.
When: The task or date change is saved.
Then: The selected date is accepted in all three cases; being past is never itself a rejection reason.

### AC-003 — Assigned date visible in task list
Business sources: B-002
Discovery evidence: D-0002
Status: specified
Requirements: FR-001
Questions: -
Given: A task has a saved due date.
When: The user views the task list.
Then: The assigned calendar date is clearly visible for that task.

### AC-004 — Change an existing date
Business sources: B-002, B-011
Discovery evidence: D-0002, D-0019
Status: specified
Requirements: FR-002
Questions: -
Given: An existing task has a saved due date.
When: The user selects another valid date and existing autosave completes.
Then: The new date replaces the old date and is shown in the list.

### AC-005 — Clear an existing date
Business sources: B-002, B-011
Discovery evidence: D-0002, D-0019
Status: specified
Requirements: FR-002
Questions: -
Given: A task has a saved due date.
When: The user clears it and existing autosave completes.
Then: The date is removed; the task remains usable without a date and has no overdue indication.

### AC-006 — Invalid calendar draft preserves saved value
Business sources: B-008
Discovery evidence: D-0017
Status: specified
Requirements: FR-003
Questions: -
Given: A task has a last valid saved due date.
When: The user attempts to save an impossible calendar date.
Then: The invalid date is rejected and the last valid saved date remains unchanged.

### AC-007 — No timezone-related date shift
Business sources: B-008
Discovery evidence: D-0017
Status: specified
Requirements: FR-003
Questions: -
Given: A user selects a calendar date on a device with a local timezone different from UTC.
When: The date is saved and the task is viewed or reopened after restart.
Then: The same selected calendar date is displayed without shifting it through timezone conversion.

### AC-008 — Past unfinished task is overdue
Business sources: B-009
Discovery evidence: D-0016
Status: specified
Requirements: FR-004
Questions: -
Given: An unfinished task has a due date earlier than device-local today.
When: The user views the task list.
Then: The task shows an explicit Overdue label and subtle warning styling without changing task ordering.

### AC-009 — Today, future and undated tasks are not overdue
Business sources: B-009
Discovery evidence: D-0016
Status: specified
Requirements: FR-004
Questions: -
Given: Unfinished tasks have dates equal to today, after today, or no due date.
When: The user views the task list.
Then: None of these tasks shows overdue emphasis; ordering remains unchanged.

### AC-010 — Complete and reopen a dated task
Business sources: B-010
Discovery evidence: D-0018
Status: specified
Requirements: FR-005
Questions: -
Given: An unfinished dated task is overdue.
When: The user completes it and later reopens it.
Then: Completion retains the date and removes overdue emphasis; reopening restores it if the date is still before local today.

### AC-011 — Cancel unsaved draft retains saved changes
Business sources: B-011
Discovery evidence: D-0019
Status: specified
Requirements: FR-002
Questions: -
Given: A date change has already autosaved and the user then makes an unsaved or invalid date draft.
When: The user cancels the draft.
Then: Only that draft is discarded; the most recently autosaved date or saved cleared state remains.

### AC-012 — Dates and cleared state persist across restart
Business sources: B-004
Discovery evidence: D-0004
Status: specified
Requirements: FR-006
Questions: -
Given: Tasks include an assigned date, a changed date and a cleared date.
When: The application is stopped and restarted.
Then: Each saved date or cleared state is retained for its task.

### AC-013 — Existing undated task compatibility
Business sources: B-003
Discovery evidence: D-0003
Status: specified
Requirements: FR-006
Questions: -
Given: Existing task data was created by the original CRUD application with no due-date fields.
When: The extended application opens that data.
Then: Existing titles, descriptions and completion states remain intact and the tasks have no due date.

### AC-014 — Original CRUD and completion regression
Business sources: B-003
Discovery evidence: D-0003
Status: specified
Requirements: FR-006
Questions: -
Given: Existing tasks and newly created tasks include dated and undated examples.
When: The user creates, reads, edits, completes, reopens and confirms deletion of tasks.
Then: The existing CRUD/completion behavior remains operational, including title validation and deletion confirmation.

### AC-015 — Consistent usable date controls
Business sources: B-005
Discovery evidence: D-0005
Status: specified
Requirements: FR-007
Questions: -
Given: The user operates Littlelist in its existing desktop or phone layout.
When: The user creates or edits a date and views its display and validation state.
Then: Date controls and messages remain readable and usable, visually consistent with the existing Littlelist layout.

## Business coverage

- **B-001** [contextual] - | Purpose and users; concrete behavior is elaborated by B-002.

- **B-002** [elaborated] FR-001, FR-002 | Optional dates, task-list display, changes and clearing.

- **B-003** [elaborated] FR-006 | Retain undated records and existing CRUD/completion.

- **B-004** [elaborated] FR-006 | Durable assigned, changed and cleared dates.

- **B-005** [elaborated] FR-007 | Consistent usable Littlelist experience.

- **B-006** [contextual] - | Local single-user demonstration boundary, not a new account/platform feature.

- **B-007** [elaborated] FR-003 | Any valid calendar date is permitted.

- **B-008** [elaborated] FR-003 | Local calendar interpretation and invalid-date preservation.

- **B-009** [elaborated] FR-004 | Overdue predicate, visible label and unchanged order.

- **B-010** [elaborated] FR-005 | Date retention across completion and reopening.

- **B-011** [elaborated] FR-002 | Autosave, clearing and cancel-draft behavior.

## Inherited unresolved items

None recorded.

## Analysis questions

None recorded.

## Analysis proposals

None recorded.
