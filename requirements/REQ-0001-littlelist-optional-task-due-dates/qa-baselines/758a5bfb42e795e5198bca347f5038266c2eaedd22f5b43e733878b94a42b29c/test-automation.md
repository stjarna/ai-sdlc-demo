# Test Automation — REQ-0001

## Authority and source

AI-authored QA automation prepared following the explicit `$sdlc start qa` instruction. This is a proposal for human automation review, not approval, advancement or successful execution.

Product authority: approved Analysis baseline 63329d63c760e41f166e1b99d277534aeb8063e3469e7383a26e45ce4ad5e649, handoff faa97785-1068-4c72-9d78-e3683828ed05. Approved scenario artifact b26987cde4fc49dcca36cf35122a44a2e2b4e745fc04facba52be9d935c975df retains all 23 specified cases and seven FR/fifteen AC expectations. Approved Engineering Design artifact 3acdf7a21a0b0fe061526e93fb8a055b19640d4597ee9a7eb319f1bdce99613a supplies the existing API, native/text date controls and v1-to-v2 storage interface; it does not redefine product expectations. Engineering remains in Verification with current implementation approval. Testing skill 1.3.0 and the pinned Test Automation template define expertise and layout. The CLI binds the exact Design and scenario approval on publication.

QA source fingerprint: db1e934326dd620732ab9e5d62ea763b44cc675bb7dd0479a53c44666a6498df. Reviewed paths: qa/README.md, qa/browser/due-dates.spec.mjs, qa/helpers.mjs, qa/integration.test.mjs, qa/package-lock.json, qa/package.json, qa/playwright.config.mjs, qa/run-check.mjs. Only QA-owned files are created. Engineering source fingerprint remains 57d145e36757a77ff8fa1d175357a9e3ea8d00a6c48843e20b3fe4811c8176a7; no application/developer test/Plan, root dependency or historical evidence change is part of this preparation.

## Product checks

- QA-API (integration): node qa/run-check.mjs integration, cwd ., timeout 120 seconds. Cases: TC-001, TC-002, TC-004, TC-005, TC-006, TC-012, TC-013, TC-014, TC-016, TC-017, TC-023. Real HTTP status/envelope/content assertions, optional/edit/clear handling, past/today/future acceptance, invalid writes preserving the last saved leap day, legacy-schema fixture migration, CRUD/order and actual process restart with dated/changed/cleared/completed records. The fixture is synthetic and matches the original v1 schema; it does not execute a historical baseline binary or claim personal-data migration testing.
- QA-UI-DESKTOP (ui): node qa/run-check.mjs ui desktop-los-angeles, cwd ., timeout 120 seconds. All TC-001 through TC-023 through actual Chromium UI in America/Los_Angeles at desktop size.
- QA-UI-MOBILE (ui): node qa/run-check.mjs ui mobile-kiritimati, cwd ., timeout 120 seconds. The same approved cases in a phone viewport with touch and Pacific/Kiritimati. Viewport emulation is not a claim of physical-device testing.

The browser source contains explicit case IDs in test names; related cases share executable tests. Both projects cover past/today/future native entry, list display and autosave, editing/clearing, leap-date rejection with server preservation, real native partial-date keyboard entry, cancellation after saved changes and after saved clearing, positive/negative-offset date stability including DST-adjacent values, year/day boundaries, completed/reopened overdue presentation without sorting changes, actual server restart, synthetic legacy-schema compatibility, original CRUD/deletion confirmation, labels, keyboard focus and 320/390/768/1440 layout overflow. A manual extended-year regression verifies that a native picker limit does not silently clear a saved date when another field changes.

The controlled local date is a reproducible fixture, never a new UTC product rule. Expected outcomes remain those approved in Analysis/scenarios. Integration requests are not called UI tests, and unit/static Engineering results are not substituted for these checks.

## Prototype limitation checks

None. limitation_checks is explicitly empty. No unresolved requirement, exclusion or prototype exception is used to narrow the expected product behavior. Negative outcomes are calendar-invalid representation checks, not rejection of past dates.

## Execution and evidence

Preparation executed node --check on the five QA JavaScript modules successfully and inspected scenario mappings, package/lock compatibility and source boundaries. No functional test, UI interaction, dependency installation or browser launch has been executed by this preparation. Availability and success remain unverified until the authorized checks run.

After separate human automation approval, separate QA advancement and an explicit execution request, use the three named qa-check-run operations. Each runner creates a unique subdirectory of requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/ and prints its path. Chromium retains actual screenshots, traces, videos, JSON results and an HTML report there. The orchestrator retains actual stdout, status, fingerprint, operation identity and requirement/case bindings in its immutable evidence. Historical evidence is never overwritten. Failures/timeouts are preserved and routed for authorized remediation, never hidden by changing expected outcomes.

All task data is fictional. Each test creates its own temporary SQLite database, starts the loopback application on a free port, and stops/removes it in teardown. No personal task data or historical fixture is opened. New presentation capture stays outside the repository. No Git operation is automatic.

## Unresolved items

No unresolved product/Analysis items, blocked/excluded approved requirements or authorized limitations exist in the current cycle. Runtime verification remains pending. Browser-specific native keyboard entry, clock behavior, autosave races and dependency/browser availability must be established by actual execution; a prepared source file or green syntax check is not functional evidence. Human review is still required; this AI-authored preparation is not independent certification or release approval.

## Dependency setup

QA-local package.json pins @playwright/test 1.64.1; package-lock.json preserves the exact transitive versions, registry URLs and integrity values from the existing application lockfile, with only the root package name changed. The root application package/lock remain unchanged. No registry lookup or install ran during preparation.

Request explicit authorization for local setup before executing npm ci --prefix qa and node qa/node_modules/@playwright/test/cli.js install chromium. Packages stay in qa/node_modules and the browser in the normal external Playwright cache. Do not install system dependencies or modify application files silently. Node 24–25 is required (observed 25.9.0). If setup is unavailable or fails, retain the actual diagnostic and report blocked rather than passing or using an unpinned browser substitution.
