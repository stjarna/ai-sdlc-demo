# Security Review — REQ-0001

## Scope and method

AI-assisted source review by the implementation agent using pinned Security skill 1.2.0 (digest 5698ff24151fffff13837297dbe36e33a0c26ffb180256c95814c3f1c63c94ee) and the resolved Security Review template. This is an author-assisted review, not independent security certification.

Reviewed Engineering source: 57d145e36757a77ff8fa1d175357a9e3ea8d00a6c48843e20b3fe4811c8176a7. Authority: approved Analysis 63329d63c760e41f166e1b99d277534aeb8063e3469e7383a26e45ce4ad5e649, Design 3acdf7a21a0b0fe061526e93fb8a055b19640d4597ee9a7eb319f1bdce99613a, Engineering Plan a11c7a1cfab6c0aa33b42d17d26e42b49f9868232bc37585ddc77340524ba966, implementation/code review c6718055bb384664309173b74610e918ef3ba677dfe6ccdf5458f95dfad3adf8 and its current human approval. Independent QA is Verified with current scenario/automation approvals and matching combined execution context. The reviewed source has not changed since its human code approval or the passing checks.

Assets are personal task content, due-date integrity, SQLite data and preserved governance evidence. Boundaries are browser to local JSON API, input validation to prepared SQLite statements, local static assets and the local filesystem. The approved deployment is a trusted local machine with a loopback web app; this review does not authorize remote hosting, shared-user access or a new identity service.

Method: inspected current source and dependency declarations; compared the due-date change with approved Design/Plan; inspected exact-source unit/build evidence and joined API/browser results. No new tests, external advisory queries, scanner, fuzzing or penetration tests were executed during this review. Existing test presence is never substituted for an executed result.

## Findings

No open security findings were identified within the stated source-review scope. Structured findings is empty; no earlier Security findings exist in this cycle. This does not assert the absence of all vulnerabilities.

- Input/data integrity: src/tasks.mjs:46 validates calendar representation before mutation. Shared component validation (public/calendar-date.js:2) rejects impossible or malformed date values rather than chronological eligibility; past dates, null clearing and omitted PATCH behavior remain approved. Native invalid drafts are distinguished from clearing (public/calendar-date.js:29). The existing JSON boundary (src/http.mjs:16) limits request size, enforces JSON/UTF-8 and retains structured errors.
- Persistence: src/tasks.mjs:78 uses prepared statements for user task/date values. Migration checks the version under a write transaction (src/tasks.mjs:66) and rolls back failure; existing task identity/order/content remains preserved. This is not a claim of encrypted storage or enterprise backup.
- Browser output: task title/description and date labels use DOM textContent (public/app.js:67, public/app.js:89); no date string becomes executable HTML or script. Existing security headers remain in src/http.mjs:41.
- Exposure: binding is explicitly loopback (src/server.mjs:11); Host and Origin checks remain at src/http.mjs:51 and src/http.mjs:55. The fixed asset map (src/http.mjs:6) adds only calendar-date.js; no generic directory serving is introduced. Database, external identity profile, runtime and requirements/evidence are not in that allowlist.
- Configuration/dependencies: personal data remains outside the application/dependency tree (src/config.mjs:8). No new application runtime dependency is added. QA-local Playwright 1.64.1 and its lockfile are separate from the application. No credentials or authentication service are introduced by the reviewed change. This targeted inspection is not an exhaustive secrets scan.

## Evidence

- Current-source Engineering ENG-UNIT: actually executed, exit 0, 25 passed. Includes invalid input preserving saved records, Unicode literal storage, migration rollback/idempotency, date persistence and unsupported-schema handling.
- Current-source ENG-STATIC: actually executed, exit 0; syntax/local-asset checks passed for 19 modules. Syntax checking is not dynamic security validation.
- Current joined QA-API: actually executed, exit 0, six passed; covers HTTP date representation rejection with unchanged saved title/date, optional/edit/clear semantics, synthetic v1-schema compatibility, original CRUD/order and actual server restarts.
- Current joined QA-UI-DESKTOP: actual Chromium, exit 0, 15 passed, America/Los_Angeles.
- Current joined QA-UI-MOBILE: actual Chromium, exit 0, 15 passed, Pacific/Kiritimati. Browser checks cover invalid/partial drafts preserving the saved value and approved UI behavior; they do not constitute an exhaustive XSS/CSRF attack suite.
- QA completion is explicit and current for this Engineering source and reviewed automation. The original failed mobile test and its trace remain immutable history. Its native-keyboard sequence did not create an invalid draft; only QA interaction was refined and reapproved. The fresh checks passed without changing product expectations or Engineering source.
- The previously authorized QA npm ci setup actually reported zero audited vulnerabilities at installation time. This is a limited historical package-manager result, not a new advisory lookup or assurance about Node, SQLite, browsers or all dependencies.

The original baseline integration suite contains Host/Origin, media/UTF-8/body-size, static-header and traversal tests; those tests were inspected as source only and were not rerun in this Security Review. Accordingly these controls are source-inspected here, not newly demonstrated by a claimed security test run. Immutable named-check records retain actual outputs, versions/bindings, source context and report paths.

## Limitations and unresolved items

No unresolved product questions, blocked/excluded approved requirements or authorized prototype limitations are present. limitation_refs is empty. No past-date restriction, UTC business reference-day rule or artificial date window is authorized or introduced as a security mitigation.

Coverage is limited to the local PoC change and inspected controls. There is no authentication, multi-user authorization, TLS remote deployment, at-rest encryption or enterprise backup claim; the accepted trusted-local-machine boundary remains necessary. Filesystem account permissions and local machine integrity are environmental assumptions, not newly tested protections. The review does not establish resistance to a compromised local OS, disk access by another privileged process, denial-of-service under adversarial load, or supply-chain attacks. Those areas have not been tested or certified and no remote deployment is authorized.

No full dependency advisory refresh, dedicated secrets scanner, dynamic attack/fuzz suite, WebKit/Firefox or physical-device security check was performed. No risk was silently recorded as remediated or accepted on the user’s behalf. A later finding must be recorded with a stable identifier and authorized remediation; all open findings, including low severity, block finalization under the existing policy.

## Remediation

None required by the findings recorded in this review. No application code, QA automation, approved requirements, immutable baselines or prior test evidence was modified. Engineering remains in Security Review awaiting separate human authorization to advance toward Final Verification. This report is not release approval, deployment authorization or a lifecycle transition.
