# Technical Design — REQ-0001

## Context and authority

AI-authored Technical Design for human review, not implementation authorization. Authority is approved Analysis baseline 63329d63c760e41f166e1b99d277534aeb8063e3469e7383a26e45ce4ad5e649 selected by explicit Analysis advancement faa97785-1068-4c72-9d78-e3683828ed05, retaining approved Business baseline 76f0b3fbf7a093a9633e5ca10b3fc396174bde50e728c4d251ac02a03942250e. Architecture 1.3.0 and Security 1.2.0 are the pinned contributors. QA strategy/scenarios already derive independently from Analysis; they do not authorize this design and are unchanged. All seven FRs and fifteen ACs are specified; no unresolved Business/Analysis items or exceptions exist.

Observed existing code: Node 25.9.0, built-in SQLite, a loopback-only JSON server and vanilla HTML/CSS/JavaScript with 450 ms edit autosave, prepared statements, required title, optional description, completion/reopening and confirmed deletion. Task DTO has id/title/description/completed, SQL has a private creation-order sequence, and schema user_version is 1. These observations inform the technical proposal; approved Analysis remains the business authority.

## Proposed solution

Retain the existing stack and module boundaries. Add no runtime dependency, external service, account system or new SDLC stage.

1. Add a small pure calendar-date helper usable by browser and Node validation, served through the existing fixed asset allowlist. It validates canonical date-only strings using calendar components/leap-year arithmetic, never timestamp parsing. Backend validation is authoritative; the browser provides immediate feedback. Absent dates are supported, with no comparison against today as an input-permission rule (FR-001/FR-003, AC-001/002/006/007).
2. Extend src/tasks.mjs DTO, validation, prepared CRUD statements and transactions with nullable dueDate. Add a transactional, additive SQLite v1-to-v2 migration that adds nullable due_date and preserves IDs, sequence, title, description and completion. Fresh databases use the same final schema. Recheck version under the migration lock; fail without replacing data on unsupported versions or migration failure. Date changes, clears and completion persist normally (FR-006, AC-012/013/014).
3. Extend the existing creation form and edit dialog with a labelled optional native calendar control, plus an explicit accessible clear action. Do not set min=today or any product date-window restriction. Use the platform calendar picker with readable saved date text, retain the existing visual language and phone/desktop responsiveness (FR-001/002/007, AC-001 through AC-005 and AC-015).
4. Extend draft/saved editor state and dirty checking to include dueDate. A valid change uses the existing 450 ms autosave. Detect native validity.badInput and incomplete/invalid drafts before converting an empty field to null. An explicit clear or genuinely empty valid field means absence; an invalid draft must never become a clearing PATCH. Keep last valid saved data until a valid save succeeds. Cancel stops unsaved work and keeps prior autosaves; while a save is in flight retain the current protective controls and serialize subsequent edits (FR-002/003, AC-004/005/006/011).
5. Render a date label as text on dated rows. Derive today from browser-local year/month/day, compare calendar tuples without converting the saved date to UTC, and set Overdue text plus subtle warning style only for incomplete tasks strictly before today. Compute again when rendering, on returning to the visible page and at the next local day boundary while open; date retention and existing creation-order sorting remain unchanged (FR-004/005, AC-008/009/010). Clock scheduling is a technical means to keep the confirmed rule current, not a new time-of-day requirement.
6. Preserve original CRUD behavior and failure handling. Unit/build checks stay with Engineering. QA may later bind the approved interface contract to separately reviewed automation; existing QA scenarios remain independent. No coding, dependency setup or tests are executed by this design draft.

## Security considerations

Security-by-design contribution, not a completed Security Review or certification. Assets are local task content, SQLite integrity and preserved evidence. Boundaries are browser input to JSON API, API to SQLite and the local filesystem. A malicious local page, malformed payload, invalid calendar or script-looking string must not corrupt data or execute markup.

Retain the fixed loopback binding, trusted Host/Origin checks, JSON-only requests, UTF-8/body-size handling, fixed static asset allowlist, CSP, no-store and prepared SQL. Serve the pure calendar helper only by an explicit allowlist entry, not directory traversal. Render task/date/error strings with textContent. Do not expose the database, local profile, runtime or SDLC evidence through HTTP. Validate dates before any mutation; failed PATCHes preserve saved data. Existing title/description and transport constraints are unchanged.

Threats/verification: reject malformed types/arrays/objects and impossible dates; exercise hostile text rendering and foreign-origin mutation protections; check failed edits and migration rollback on disposable copies. Preserve existing future-schema fail-closed handling. Do not impose past-date rejection, a UTC reference day, silent clearing, date sorting or restrictions on completed-date editing as a security shortcut; each would require business authority. No new authentication, external telemetry, credential storage or generic security infrastructure is proposed. A trusted local machine remains the deployment boundary.

## Coverage and uncertainty

Every active FR/AC is designed below; structured disposition implemented means planned design coverage, not code or passing tests.

- FR-001 / AC-001/002/003: optional creation/edit assignment and clear list display.
- FR-002 / AC-004/005/011: editing, clearing, serialized autosave and cancellation of only unsaved/invalid draft state.
- FR-003 / AC-002/006/007: past/today/future acceptance; real-calendar validation and timezone-stable date-only values.
- FR-004 / AC-008/009: visible local-calendar overdue predicate, no overdue on today/future/undated tasks and unchanged ordering.
- FR-005 / AC-010: completion retains dates, removes warning emphasis and restores it on reopening when applicable.
- FR-006 / AC-012/013/014: additive migration, real restart persistence and regression of existing CRUD/completion.
- FR-007 / AC-015: cohesive date controls, labels, validation, responsive layout and keyboard/focus behavior consistent with the existing app.

No unresolved business questions, unconfirmed assumptions or blocked requirements remain. The proposed module layout, nullable wire representation and migration are technical choices presented for Design approval. Risks requiring verification are ambiguous native invalid input versus clearing, autosave races, local-midnight/timezone day shifts and migration data safety; none is waived. No performance budget or certification absent from Analysis is invented.

The semantic conformance review must trace every negative condition/default: impossible dates to AC-006, optional omission/clear to AC-001/005, no warning on today/completed/undated to AC-009/010, last-saved preservation to AC-006/011. A source-bound Code Review must reject a hidden min=today, UTC-based day comparison, overwritten invalid draft, lost legacy record or unsupported date-window restriction. Final Verification must use actual joined Engineering/QA evidence, not this design coverage.

## Prototype limitations

None proposed. The governed limitation list is explicitly empty. All approved product behavior remains in scope. Generic Design approval will not authorize later observable exceptions, runtime rejection of otherwise permitted input or narrower behavior. Any consequential new limitation needs separate explicit effect authorization through the existing governance mechanism, preferably resolving the business behavior upstream instead.

## Alternatives

<!-- Optional section; omit when not applicable. -->

Keep the existing Node/SQLite/vanilla UI rather than a new frontend framework, ORM or hosted service: the change is small and the current architecture already supports persistence and browser testing. Store a nullable date-only string rather than an epoch timestamp: the requirement is a calendar date and must not shift across timezones. Use the existing editor/autosave rather than a separate Save workflow: preserves confirmed behavior. Use native calendar entry plus explicit validation/clear handling instead of a custom calendar dependency; browser-specific entry behavior must be checked through real UI tests. A third-party date library is unnecessary for this focused calendar operation; no dependency-security claim is inferred.

## Interfaces and data

<!-- Optional section; omit when not applicable. -->

Proposed task JSON becomes {id, title, description, completed, dueDate}, where dueDate is null or a canonical date-only string (for example 2026-10-29). No createdAt, due time, timezone identifier or overdue flag is persisted. The browser computes overdue using its own local calendar. This is an additive field; clients omitting it keep the existing create/update behavior.

- POST /api/tasks: missing dueDate or null creates an undated task; a valid calendar-date string assigns it. Existing title/description requirements remain.
- PATCH /api/tasks/:id: omitted dueDate preserves it, null clears it, a valid string replaces it. Empty strings, wrong types, date-time values, malformed/impossible calendar values are representation/validity errors, not past-date errors. UI maps an intentional valid empty/clear state to null.
- GET collection/item: return dueDate for each task, including null on legacy/undated records. No endpoint change. DELETE/completion behavior is retained; a completion-only PATCH does not change the date.
- Invalid date: HTTP 400 with the existing JSON error envelope, a stable INVALID_DUE_DATE code, field dueDate and a human-readable correction message; no write. Existing title and transport diagnostic behavior remains intact.
- Calendar representation uses zero-padded numeric year-month-day, with year represented by at least four digits. Use component validation and arithmetic for calendar validity; do not introduce a fixed four-digit-year maximum, rolling date window, epoch-range restriction, min=today, or UTC conversion. Calendar formatting and comparisons must not silently narrow the accepted date-only domain. Any platform input limitation must be surfaced for review rather than relabelled a business rule.
- SQLite v2 adds nullable due_date TEXT. v1 rows receive NULL without rewriting business data or the private sequence. Migration and user_version update commit together; a failure rolls back. Repeated startup is idempotent. Older baseline application binaries should not be used against v2 databases; retain an offline copy before a real migration if rollback is required. Development/QA must use disposable databases and never mutate archived evidence or personal data merely to test migration.
- Test seams: pure calendar validation/comparison/local-today helpers, store migration and CRUD, HTTP boundary, and real UI create/edit/clear/complete/cancel. Later QA automation owns qa/ paths and can use isolated legacy database fixtures plus controlled browser-local clocks/timezones. Avoid editing frozen BEFORE scripts/evidence to make new DTO assertions pass; update relevant active tests while preserving historical baseline fixtures/records.
- Before implementation/source-bound approval, finish and freeze supplemental presentation captures. Keep execution-generated output outside fingerprinted source or under reviewed Epic evidence paths. No new source exclusion is proposed. Engineering files stay outside qa/; this design does not modify the orchestrator.
