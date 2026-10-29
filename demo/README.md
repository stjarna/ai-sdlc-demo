# BEFORE demonstration runbook

This directory preserves the independently built CRUD application baseline before introducing task due dates or installing the SDLC Orchestrator.

## Frozen assets

- `before/desktop-empty.png`, `desktop-tasks.png`: initial desktop states.
- `before/desktop-task-details.png`, `desktop-title-validation.png`: autosave and invalid-title behavior.
- `before/desktop-completed.png`, `desktop-delete-confirmation.png`: completion and safe deletion.
- `before/mobile-tasks.png`, `mobile-task-details.png`: responsive mobile presentation.
- `before/desktop-walkthrough.webm`, `mobile-walkthrough.webm`: actual browser recordings.
- Matching `.mp4` files, when ffmpeg was available: presentation-friendly transcodes of those recordings.
- Matching `*-trace.zip`: inspect actual interactions using `npx playwright show-trace demo/before/desktop-walkthrough-trace.zip`.
- `before/fixtures.json`: fictional seed content used through the UI.
- `before/manifest.json`: browser/runtime versions, capture actions, SHA-256 asset hashes and exact captured source hashes.
- `verification/`: actual unit/integration/browser logs, browser JSON report and hash-bound `summary.json`.

No installed dependencies, personal data, credentials or external runtime paths are needed to inspect these assets. Trace files contain only this fictional local demonstration; their ephemeral server URL is historical context, not a dependency for replaying the application.

## Reproduce

From the repository root:

```bash
npm ci
npx playwright install chromium
npm start
# Visit http://127.0.0.1:3000; stop with Ctrl+C.
npm test
npm run verify:before
```

Capture scripts start their own server with an isolated temporary database, seed it through the real UI, record CRUD and validate expected outcomes. They clean up the database and server. Optional ffmpeg creates MP4 copies; WebM capture itself needs no system ffmpeg. Never replace frozen evidence:

```bash
CAPTURE_DIR=demo/rehearsal-01 npm run capture:before
CAPTURE_DIR=demo/rehearsal-01 node scripts/verify-before.mjs --source
VERIFICATION_DIR=demo/verification-rehearsal-01 npm run test:record
```

Both capture and evidence recording refuse a nonempty target directory and require an output path inside this repository. Capture pacing is for readability; automated tests use assertions rather than recording delays. A new capture reproduces the same fixtures and actions, not byte-identical video (IDs, browser rendering and execution timing can differ).

At the baseline revision, `node scripts/verify-before.mjs --source` also verifies captured source hashes. After a future product change, use ordinary `npm run verify:before` to check frozen assets without requiring the current source to match the BEFORE version. Inspect the original source with `git show baseline-crud:src/tasks.mjs` or an independent checkout of the tag.

The local annotated `baseline-crud` tag records the baseline Git revision. It is intentionally not embedded into committed evidence, avoiding a self-referential commit hash. Preserve this directory during future adoption and capture AFTER evidence separately. No SDLC lifecycle approval is implied by the CRUD baseline.
