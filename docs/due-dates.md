# Optional task due dates

This change follows the approved Business, Functional Analysis and Technical Design for REQ-0001. It introduces no prototype exceptions or new business limitations.

Use the optional Due date control when creating or editing a task. Past dates, today and future dates are allowed. Clear due date removes it. Valid edits autosave after the existing 450 ms pause. Invalid or incomplete drafts show a correction message without replacing the last saved value. Cancel draft discards only unsaved/invalid changes; completed autosaves remain saved.

Saved dates are calendar strings, not UTC instants. Overdue means an unfinished task strictly before the device-local day. Completed tasks keep dates without overdue emphasis; reopening restores the indication when applicable. Tasks remain ordered by creation. The display refreshes at local midnight and on return to the page; no due time is introduced.

## Storage and compatibility

SQLite schema v2 adds nullable `due_date TEXT` to the original v1 table. The additive migration runs in a write transaction, rechecks the version under the lock and preserves IDs, creation order, descriptions and completion. Repeated startup does not repeat migration. Unsupported schema versions and failed migration stop startup rather than replacing data.

Before using this version with real data, stop the app and preserve an offline backup of the database (and any SQLite WAL/SHM files as a consistent set). Never use the old baseline binary against a migrated v2 database. For rollback, retain the old binary and its pre-migration database copy together; there is no destructive downgrade.

POST accepts omitted dueDate or null for no date. PATCH omission preserves it; null clears it; a canonical valid calendar string assigns it. Invalid representations return HTTP 400 / INVALID_DUE_DATE / field dueDate before mutation. Calendar validation uses Gregorian components and positive years of at least four digits without a rolling date window. The native picker is the default; Type date provides canonical calendar-text entry without the native picker’s year-range constraints. Saved values the native control cannot represent reopen in text mode without clearing them. Browser-specific entry and draft behavior still require QA verification.

## Development checks and evidence

Startup and dependencies remain as documented in the main README; no new dependencies. `npm run test:unit` tests calendar semantics and isolated store/migration behavior. `npm run check` runs syntax/local-asset checks. These are Engineering checks, not proof of complete HTTP/UI acceptance. Separately approved QA automation owns integration/browser verification.

The frozen BEFORE assets, baseline tag and all historical SDLC baselines remain unchanged. New presentation captures are stored outside this repository to preserve source-bound approvals. Unit tests use disposable databases, never personal or historical data.
