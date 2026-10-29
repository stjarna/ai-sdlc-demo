# Business Refinement — REQ-0001

Source revision: c94b223731ca60b9267799c1adc2238a29d69b404cb8cc9349bc653a04fcc7d6

## Confirmed information

### Business purpose and users

- **B-001** [D-0001] Littlelist users can attach an optional due date to a personal task, see that date in the task list and manage it during editing; tasks without due dates remain supported.

### Feature scope and existing product compatibility

- **B-002** [D-0002] Due dates are optional. A user can assign one during task creation or editing, display it clearly in the list, and subsequently change or remove it.
- **B-003** [D-0003] Preserve existing tasks without due dates and all existing CRUD and completion/reopening behavior.
- **B-004** [D-0004] Due dates persist across application restarts alongside existing task data.
- **B-005** [D-0005] Provide an intuitive, visually polished experience consistent with Littlelist.
- **B-006** [D-0006] Keep the change scoped to the local single-user demonstrator.

### Date eligibility and interpretation

- **B-007** [D-0007, D-0009, D-0010] Permit any valid calendar date, including past dates, today and future dates. Due dates remain optional; never reject a valid date merely because it is in the past.
- **B-008** [D-0012, D-0017, D-0020] Treat due dates as calendar dates in the device's local calendar, without timezone-related date shifts. Reject invalid calendar dates without overwriting the last valid saved value.

### Overdue presentation and completion

- **B-009** [D-0011, D-0016, D-0020] An unfinished task whose due date is before device-local today displays an explicit "Overdue" label with subtle warning styling. A task due today is not overdue. Preserve existing task ordering.
- **B-010** [D-0013, D-0018, D-0020] Completing a task retains its due date but removes overdue emphasis. Reopening restores overdue indication when applicable.

### Editing and clearing

- **B-011** [D-0014, D-0019, D-0020] Due-date editing and clearing follow existing autosave behavior. Clearing removes the optional due date. Cancel discards only unsaved or invalid drafts; previously saved changes remain saved.

## Unresolved issues

None recorded.

## Unconfirmed proposals

None recorded.
