# Littlelist independent QA automation — REQ-0001

This suite implements the existing 23 approved scenarios without changing their expected outcomes. Approved Functional Analysis is the product authority; approved Design supplies API/DOM and SQLite interfaces. Engineering code, developer tests, dependencies, Plan and original evidence are not edited by QA.

## Proposed checks (await human automation approval and separate advancement)

- `QA-API`: `node qa/run-check.mjs integration` — real HTTP plus actual application process restarts using isolated temporary databases. Covers TC-001/002/004/005/006/012/013/014/016/017/023.
- `QA-UI-DESKTOP`: `node qa/run-check.mjs ui desktop-los-angeles` — real Chromium interaction at desktop size in America/Los_Angeles.
- `QA-UI-MOBILE`: `node qa/run-check.mjs ui mobile-kiritimati` — real Chromium at a phone viewport with touch in Pacific/Kiritimati.

Each browser check covers all TC-001 through TC-023. Test titles expose the case mapping; several related cases share a single executable test. Both projects also exercise 320/390/768/1440 width overflow checks. This is browser emulation, not a physical-device or all-browser certification. A fixed local-day fixture controls the test, not the product’s date rules. Positive and negative offsets, DST-adjacent dates, a year boundary and next-day presentation are explicit fixtures.

Integration checks assert status/body/storage outcomes through HTTP, never claim UI behavior. Browser checks use actual page controls and observable labels/errors/focus, plus server reads only to independently establish no invalid destructive autosave. The partial-date regression uses real native keyboard input on desktop. Mobile uses the actual Type date control to enter an incomplete calendar value, because the mobile native picker does not expose desktop keyboard segments. Both branches assert the same visible validation, disabled Done action and unchanged saved date; no validity stubs or skipped product expectations are introduced. Saved/unsaved/invalid and cleared states, past-date acceptance, manual extended-year fallback, completion/reopening, migration compatibility and actual process restarts are retained.

`helpers.mjs` creates only fictional v1-schema fixtures in the OS temporary directory. This is a schema-compatible synthetic fixture; it does not run the historical baseline binary or modify its data. Each server is loopback-only on a free port and is stopped/removed after its test. Personal databases and historical demo fixtures are never opened.

## Dependency setup (not yet authorized or executed)

QA declares its own `@playwright/test` 1.64.1 dependency. The QA lockfile reuses the existing root lockfile’s exact registry URLs and integrity pins while changing only the root package name; no dependency lookup/install has been run. Root application package and lock files remain unchanged.

After explicit setup authorization:

```sh
npm ci --prefix qa
node qa/node_modules/@playwright/test/cli.js install chromium
```

This installs QA-local npm packages and Playwright’s pinned Chromium in the normal external browser cache. It introduces no application runtime dependency. No system package or external service is installed by these commands. Node 24–25 is required; the current environment is Node 25.9.0. If a required browser cannot be installed/launched, report it as blocked and preserve the actual diagnostic.

## Evidence and limits

Run functional checks only through the approved SDLC `qa-check-run` operations after automation approval and separate advancement. The runner assigns a fresh directory below `requirements/REQ-0001-littlelist-optional-task-due-dates/qa-execution/` for each invocation. Browser JSON/HTML reports, screenshots, traces and videos are stored there; no historical evidence is overwritten. CLI output prints the exact directory and is retained with the immutable named-check result. Test exit statuses propagate to the orchestrator. All three checks have a maximum declared duration of 120 seconds each; any timeout/failure remains evidence, not a pass.

Initial execution evidence is preserved: API 6 passed, desktop 15 passed, mobile 14 passed and one partial-input precondition failure. The mobile interaction refinement requires renewed automation approval and source-bound execution; historical results are not claimed for the revised QA source. Preparation of this refinement provides syntax checks and case-mapping inspection only. Passing a named command supports the assertions actually executed; it is not independent proof of every acceptance criterion or release authorization. New failures must be reported and routed to the relevant track without rewriting the approved expectations. No unresolved items, excluded approved requirements or prototype limitations are currently defined, so supplemental limitation checks are explicitly empty.

Keep new supplemental presentation capture outside the application repository. Test evidence belongs in the reviewed Epic evidence location. No Git actions or application edits are performed by these runners.
