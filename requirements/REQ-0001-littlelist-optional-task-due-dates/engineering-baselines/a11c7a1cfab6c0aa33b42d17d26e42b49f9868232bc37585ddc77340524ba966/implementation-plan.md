# Implementation Plan — REQ-0001

## Authority and scope

AI-authored Engineering-only plan for human review. Approved Technical Design 3acdf7a21a0b0fe061526e93fb8a055b19640d4597ee9a7eb319f1bdce99613a consumes approved Analysis baseline 63329d63c760e41f166e1b99d277534aeb8063e3469e7383a26e45ce4ad5e649 under handoff faa97785-1068-4c72-9d78-e3683828ed05. Use Development skill 1.3.0, digest fbae39f676cddab88b6b43a74f30df67f6797382ee6f539c2e0546510c119750, and the pinned Implementation Plan template. Implement all 7 FRs/15 ACs; no blocked/excluded scope or authorized limitations. QA strategy and scenarios are already approved independently, but their automation and integration/UI execution remain separate. No coding or dependency installation is authorized by preparing or approving this plan.

This is an AI-authored refresh following David Krzystek’s explicit feedback: “Refresh the Implementation Plan against the current project fingerprint. Business requirements and Technical Design remain unchanged.” The previous Plan and its approvals remain immutable historical evidence; they do not authorize this refreshed revision. The five task definitions, dependencies, allowed paths, FR/AC coverage, unit/build commands, exclusions and absence of prototype limitations are unchanged.

Current inspected project fingerprint: 044b3675605155f4913f9d52ede3d9a6b36411d13fde0419947a56ea130788d4. Existing application source, active tests, package/lock files and build configuration remain unchanged from the CRUD baseline; the current fingerprint also includes the frozen supplemental presentation evidence already present in the project. No presentation paths are excluded from source integrity checks. Keep all new presentation captures outside the application repository throughout planning, approval and execution. This refresh does not approve the Plan, advance the lifecycle or start Development.

## Tasks

### T-001
Dependencies: None
Requirements: FR-003, FR-004, FR-005, AC-002, AC-006, AC-007, AC-008, AC-009, AC-010
Allowed paths: public/calendar-date.js, test/unit/calendar-date.test.mjs
Outcome: Implement shared pure calendar/date-draft helpers with meaningful unit cases: real-calendar validity, leap years, past/today/future acceptance, local-day comparison without UTC shifts, variable-length years without an arbitrary product window, and invalid draft versus intentional clearing. No browser DOM or HTTP pass is claimed by these unit tests.

### T-002
Dependencies: T-001
Requirements: FR-001, FR-002, FR-003, FR-005, FR-006, AC-001, AC-002, AC-004, AC-005, AC-006, AC-010, AC-012, AC-013, AC-014
Allowed paths: src/tasks.mjs, test/unit/tasks.test.mjs, test/unit/due-date-store.test.mjs
Outcome: Extend store validation, task DTO and prepared statements with nullable dueDate. Implement transactional additive v1-to-v2 migration, idempotent repeated startup, legacy row/order preservation and fail-closed unsupported versions. Add store unit tests for create/change/clear, completion retention, invalid PATCH preservation and database reopen using isolated temporary databases. Update existing unit DTO expectations for the approved additive field without deleting CRUD coverage.

### T-003
Dependencies: T-001, T-002
Requirements: FR-001, FR-002, FR-003, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006
Allowed paths: src/http.mjs
Outcome: Expose the approved additive date API behavior through the existing HTTP/store boundary and explicitly allowlist the shared calendar module. Retain Host/Origin, JSON/UTF-8/body-size/CSP controls and stable INVALID_DUE_DATE errors. Omitted PATCH preserves the date, null clears it and invalid representations do not mutate it. Dedicated new integration coverage belongs to separately approved QA automation.

### T-004
Dependencies: T-001, T-002, T-003
Requirements: FR-001, FR-002, FR-003, FR-004, FR-005, FR-007, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-015
Allowed paths: public/app.js, public/index.html, public/styles.css, public/calendar-date.js, test/unit/calendar-date.test.mjs
Outcome: Extend existing creation/editor/list UI with labelled optional date controls, explicit clearing, autosave/draft state, saved date text and local-calendar Overdue presentation. Preserve active/completed behavior, ordering, focus and responsive styling. Distinguish native invalid/incomplete date drafts from an intentional empty value. Keep saved changes on Cancel; serialize pending saves. Refresh date presentation at render/visibility/local-day changes without defining a new product time-of-day rule.

### T-005
Dependencies: T-001, T-002, T-003, T-004
Requirements: FR-006, FR-007, AC-013, AC-014, AC-015
Allowed paths: test/browser/tasks.spec.mjs, test/unit/tasks.test.mjs, test/unit/due-date-store.test.mjs, test/unit/calendar-date.test.mjs, README.md, docs/due-dates.md
Outcome: Maintain the active baseline regression harness and documentation for the approved feature: change only the obsolete no-date-control assertion in the existing browser suite while retaining every original CRUD/responsive assertion; preserve invalid-date negative tests. Document v2 migration/backup/old-binary incompatibility and current startup. Run approved unit/static checks through the orchestrator and present source-bound semantic conformance plus actual diff/results for later human code review. Do not modify frozen captures, historical reports, SDLC runtime or QA-owned qa/ automation.

## Checks

### ENG-UNIT — unit
Command argv: ["npm", "run", "test:unit"]
Working directory: .
Timeout: 120 seconds
Purpose: Execute actual developer unit tests for calendar/date-draft semantics and store persistence/migration/regression. This verifies computational/store behavior, not complete UI or HTTP acceptance. No QA execution is implied.

### ENG-STATIC — build
Command argv: ["npm", "run", "check"]
Working directory: .
Timeout: 120 seconds
Purpose: Run the existing no-bundler JavaScript syntax and local-asset reference check. This is the project build/static check, not a claim of browser usability or functional acceptance.

## Unresolved items and limitations

No unresolved business/Analysis/Design items and no prototype limitations. limitation_refs is empty. Do not add min=today, a UTC reference-day business rule, artificial date windows, completion-date rejection or silent invalid-draft clearing. Inspect consequential negative conditions, defaults, validation and unsupported-operation responses against approved FR/AC authority during source-bound Code Review; author review must not be labelled independent review.

No new integration/UI commands or functional scenario expectations are owned by this plan. QA automation stays under qa/ and requires separate preparation, approval and readiness. Existing regression-harness assertion maintenance is narrowly limited to the approved additive DTO/date controls; it does not authorize changing approved QA outcomes. No baseline media, archived evidence, frozen artifact or hash is rewritten. The historical baseline tag and old source remain inspectable.

Remaining engineering risks to verify rather than waive: invalid native input resembling clearing; saves racing draft changes; local-midnight/timezone errors; migration rollback/idempotency and legacy records; preserving source-bound evidence. Unit/static passes alone do not establish functional verification.

## Execution environment

<!-- Optional section; omit when not applicable. -->

Retain current Node 25.9.0, built-in SQLite and vanilla HTML/CSS/JavaScript; no build bundle or new runtime dependency. Existing npm lockfile remains unchanged. No installation is needed for these proposed Engineering unit/static checks; tool availability must be checked at execution time. Use isolated temporary databases; never migrate personal task data or an archived fixture merely to produce test output.

Execute named checks only after Plan approval, separate advancement and explicit development start. Preserve actual commands, exit codes and output through check-run; never report an unexecuted check as passed. Later QA owns actual integration/UI runs against a reviewed implementation.

All source changes must match the union of the declared exact task paths. Existing source outside those paths, test/integration/, QA namespace qa/, installed runtime, package/lock files and historical demo/ content are outside this implementation boundary. Governance artifacts are written only through existing deterministic operations.

Existing in-repository supplemental presentation captures are frozen and remain part of the source fingerprint. Keep every new supplemental presentation capture outside the Littlelist repository, including captures of Plan approval, advancement and start. Do not collect them back into the project while source-bound gates are active. Governed execution evidence is persisted through the supported CLI; other test outputs must follow the reviewed check and use isolated temporary storage. No new source exclusions or Git actions are authorized.
