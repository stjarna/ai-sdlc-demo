# Baseline verification

Executed on macOS with Node v25.9.0, npm 11.12.1, Playwright 1.64.1 and bundled Chromium 156.0.8078.4. These results describe the frozen CRUD baseline, not future changes.

| Check | Actual result | Evidence |
| --- | --- | --- |
| JavaScript syntax and local asset references | Passed, 16 modules | `demo/verification/static.log` |
| Unit tests | 15 passed; 0 failed or skipped | `demo/verification/unit.log` |
| HTTP integration tests | 5 passed; 0 failed or skipped | `demo/verification/integration.log` |
| Real-browser tests | 22 passed; 0 failed or skipped | `demo/verification/browser.log`, `browser-results.json` |
| BEFORE asset and source hashes | 15 assets and captured source verified | `demo/before/manifest.json`; `node scripts/verify-before.mjs --source` |

**42 automated tests passed.** The recorded suite ran with no retries. `demo/verification/summary.json` binds actual commands, exit codes, result counts and log hashes to the source/test hashes and confirms that source remained unchanged during execution. Absolute executable paths and temporary test locations in raw logs describe the actual execution environment; reproduction uses the relative commands in README.

Persistence was checked through SQLite reopen and actual server process restarts, including browser interaction after restart. Browser coverage includes complete/reopen, editing/autosave, cancellation, deletion confirmation, failed network operations, keyboard focus, literal text rendering and responsive layouts. Desktop and mobile viewport tests use Chromium; mobile emulation is not physical-device certification.

Final desktop and mobile screenshots were visually inspected. The recorded desktop walkthrough is 8.88 seconds; mobile is 6.20 seconds. Both WebM originals and MP4 transcodes are preserved, along with inspectable Playwright traces and fictional fixtures. These are executed UI walkthroughs; no synthetic human decisions or SDLC approvals are represented.

No due-date behavior, SDLC installation or Git push is included. Limitations are documented in `docs/baseline.md`.
