# CRUD baseline contract

## Scope and implementation choices

The agreed baseline is a simple personal task list with title, optional description, completion/reopening, editing, confirmed deletion and persistent local data. This increment deliberately contains no date-related business behavior. It is built independently of the SDLC Orchestrator.

Implementation choices made under delegated engineering judgment:

- Responsive browser UI for desktop and phones; one local user/database, no authentication.
- Title: trimmed, 1–120 characters. Description: optional, trimmed, maximum 2,000 characters. Title control characters are rejected; descriptions allow ordinary line breaks and tabs.
- Edit autosave waits 450 ms. Failed saves retain the draft and show an error. Cancel draft cannot undo already saved edits. Done flushes valid changes; Cancel draft, Escape and the close button discard only the unsaved draft.
- Newest-created order uses a private SQLite sequence, with no timestamps. Editing or completion does not change creation order.
- Task IDs are opaque UUIDs. Public task fields are exactly `id`, `title`, `description`, `completed`.

## Components

`public/` contains semantic HTML, CSS and dependency-free JavaScript. Content is rendered as text, including strings that resemble HTML. Dialogs support keyboard dismissal and focus restoration; destructive confirmation initially focuses Keep task. Responsive tests cover widths 320, 390, 768, 1024 and 1440 pixels, plus desktop/mobile CRUD flows.

`src/tasks.mjs` owns validation and prepared SQLite statements. Database schema version 1 is tracked by SQLite user_version. Unsupported future schemas fail without rewriting data. WAL mode and a busy timeout support local durability. Updates merge fields within an immediate transaction.

`src/http.mjs` owns a small JSON HTTP API:

| Operation | Endpoint | Result |
| --- | --- | --- |
| List | GET /api/tasks | All tasks, newest first |
| Create | POST /api/tasks | Created task, HTTP 201 |
| Read | GET /api/tasks/:id | One task |
| Update | PATCH /api/tasks/:id | Updated task |
| Delete | DELETE /api/tasks/:id | HTTP 204 |

Failures use JSON diagnostics. Unknown fields, malformed JSON, non-UTF-8 data and oversized requests are rejected. The server restricts Host/Origin, accepts JSON mutations only, serves a fixed asset allowlist and sends restrictive CSP/security headers. It is intended for a trusted local machine; these controls do not provide multi-user authorization or production hosting security.

`src/config.mjs` chooses a persistent user-data directory. `src/server.mjs` starts the loopback HTTP server and shuts down on SIGINT/SIGTERM. No application database, dependencies or caches belong in Git.

## Verification boundaries

Unit tests cover validation, CRUD, schema safety and database persistence. Integration tests exercise actual HTTP and restart a server process. Browser tests exercise desktop/mobile behavior, keyboard focus, validation, autosave failures, literal text rendering, responsiveness and persistence across process restart.

Screenshots and recordings are actual automated UI sessions using fictional fixture content, not human product approvals. Test evidence includes execution timestamps; these are not task date functionality.

Known limits: a browser refresh during an unsaved edit can lose that draft; SQLite data has no built-in backup/export or cross-device synchronization. Concurrent browser edits use last-completed update semantics, with no multi-user conflict UI. No native iOS/Android distribution, broader browser certification, external accessibility audit or production deployment is included.
