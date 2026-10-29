# Littlelist Phase 3 — external evidence archive

This is a presentation and navigation archive of authentic existing CLI captures. It is separate from authoritative SDLC records and QA execution evidence. No lifecycle, approval, requirement, baseline or test result is created or changed by this archive.

## Verified product checkpoint

- Annotated tag: `verified-due-dates`.
- Exact product commit: `ffa27b6bbac96de84b4142960de92845388a38f1` (`feat(tasks): add optional due dates`).
- Replaced unpushed local product commit: `e037e6db36e6a0e59ad0134f6ca26e25812b6a52`. The user explicitly authorized the amendment and tag move to include exactly 181 ignored, byte-identical Playwright report attachment copies. The original message and parent history are preserved. [Recovery details](checkpoint-recovery.json) record both commit/tag identities and the four report attachment checks.
- Original `baseline-crud` tag is unchanged; original CRUD commit is `2f9578a04bd43aac788441e1407058a7532c8148`.
- Product Engineering and QA are Verified. The Final Verification Report binds exact source, approved inputs and actual checks. This is not release approval or a security certification.

Use the product tag to demonstrate or reproduce the verified source. This archive is added **after** that tag and changes the conservative project fingerprint. HEAD after the archive commit is a documentation checkpoint; it must not be represented as the exact source approved at the tag. Historical approvals remain intact. A read-only check confirmed that current-source gates report `E_APPROVAL_STALE` at archive HEAD and the current joined verification is not ready; the stored lifecycle still records the historical Verified outcome. This expected source divergence is not permission to reuse old approval for the archive source. Future governed work requires explicit source-baseline impact review/reconciliation through supported operations; do not edit metadata, ignore presentation files or bypass a stale gate.

## Inventory, integrity and privacy

[Inventory](inventory.json) lists all 657 known external Phase 3 candidate files with original absolute path, archive-relative destination, exact size/SHA-256, lifecycle/artifact association, evidence type and timestamp provenance. `/tmp` aliases are explicitly recorded alongside their canonical `/private/tmp` sources.

- 393 original payload files are copied byte-for-byte (15,997,406 bytes).
- 192 additional capture records reference identical archived bytes; 38 reference identical product-checkpoint files. Their original paths and associations remain separate inventory entries.
- 34 files remain external with explicit reasons: 23 local profile snapshots, two raw host-discovery payload/diagnostic files, two operator registration-backup files, one integrity snapshot containing unrelated skill registration inventory and six checkpoint-preparation captures. No credentials, user identity profile file or unrelated skill registration is installed or copied by this archive. Curated SDLC-only discovery evidence and native declared actor attribution remain available.
- No matching high-confidence private-key/token patterns were found in included payloads. Pattern inspection is not a comprehensive secrets-scanner certification.
- The sources are preserved in place. No redacted or reconstructed derivative replaces an original. Historical absolute paths in original captures are retained for audit; use inventory destinations and project-relative authoritative paths for portable navigation rather than replaying machine-local commands.
- A capture timestamp is left null unless explicitly recorded as capture time in the source. File mtime is labelled only as observed file mtime; operation timestamps are not invented as capture timestamps.
- Exact external file references found in structured captures all existed at inventory time. Runtime, interpreter and declared identity configuration intentionally remain external dependencies, not archived executable infrastructure.

Search covered the known external runtime-update/recovery capture root, Phase 3 `/private/tmp/littlelist*` files and their exact file references, the task’s visualization folder (empty), and the separate AI-SDLC documentation checkout (no presentation assets). Phase 2 temporary files and unrelated orchestrator acceptance projects are outside this Phase 3 inventory. No externally captured Phase 3 screenshots, videos, complete chat transcript or standalone storyboard were found. Do not claim missing media or infer that such captures occurred.

## Authentic captures versus presentation reconstruction

`captures/early-phase3/` and `captures/runtime-update/` preserve raw CLI command/results, operation inputs, source diffs, checks and integrity attestations. Captures describe the state at their original event; an old readiness message is not the current final status. Captured Python helpers are historical source evidence, **not** commands to replay: replay could perform obsolete mutations or approvals. Actual human decision wording is retained in native audit history; these captures are not a complete chat transcript.

[Journey index](journey.json) is a retrospective navigation index generated from existing metadata. It preserves recorded ordering and timestamps separately for lifecycle, Business, Analysis, Engineering and QA. It is not a screen recording, a new decision or an invented chronological interleaving of independent tracks. No reconstructed presentation scenes are included. Any future animated reconstruction must be labelled separately.

The earlier in-repository `../events/` captures stay byte-identical in the product tag because they were part of the approved fingerprint. Their original README is a historical index, not a live status report; this index provides final context without rewriting it.

## Authoritative product evidence (referenced, not duplicated here)

- `requirements/REQ-0001-littlelist-optional-task-due-dates/metadata.yaml`: lifecycle, declared identities, ownership and Engineering/QA audit histories.
- `idea.md`, `discovery.yaml`, `business.md`, `specification.md` and immutable Business/Analysis baselines under that request.
- `engineering-baselines/` and `qa-baselines/`: all immutable revisions, approvals, pinned domain skills/templates, named-check evidence, Security Review and Final Verification Report.
- `qa-execution/`: actual browser JSON/HTML reports, screenshots, traces and WebM recordings from both the original failed run and successful retests. Those are real test recordings, not presentation reconstructions. All 181 HTML attachment references resolve in the product checkpoint. Browser report data copies duplicate their original result attachments intentionally so the HTML reports remain self-contained.
- `execution-capture/development-0022/`: historical failed pre-development start evidence.

All five final named checks passed on their recorded source: 25 unit tests, static checks over 19 modules, six API/process tests and 15 real Chromium tests in each desktop/mobile project. The final report links 23 approved scenarios; aggregate command passes do not independently certify every semantic claim. No tests were rerun to create this archive.

## Reproduce and inspect

Use a disposable checkout at `verified-due-dates` for rehearsals; keep the tagged evidence untouched. Follow the repository README and `qa/README.md` for Node 25.9.0, pinned dependency setup and application launch. `npm start` serves the loopback app at http://127.0.0.1:3000; use an explicit disposable `TODO_DB_PATH` for demonstrations, never a personal database.

Original verification can be inspected without rerunning tests: browse the native baselines and `qa-execution/*/report/index.html` (serve the report directory locally if the browser restricts file URLs), or open retained trace/video/screenshot attachments. Report links are relative within each report; original trace metadata may retain historical absolute source paths.

For a **new rehearsal execution** in that disposable checkout after explicitly permitted dependency setup:

```sh
npm ci
npm ci --prefix qa
node qa/node_modules/@playwright/test/cli.js install chromium
npm run test:unit
npm run check
node qa/run-check.mjs integration
node qa/run-check.mjs ui desktop-los-angeles
node qa/run-check.mjs ui mobile-kiritimati
```

These commands are instructions, not newly claimed results. Rehearsal output is new evidence, not a replacement for recorded approvals or test history. No SDLC lifecycle operation, Git commit, tag or push is automatic. The externally installed Orchestrator remains separately pinned to `5a634bea716a51eede4baac7dd2c690dedc16be1`; install/verify it via its documented external procedure when governed operations are needed. Do not replay archived mutation helpers or copy local identity settings.

Verify archive bytes portably from the archive commit:

```sh
python3 -B demo/phase-03-due-dates/external-evidence/verify_archive.py
```

The optional `--compare-originals` additionally checks still-available original paths on the capture machine. Original absolute paths and optional external operator diagnostics are not runtime requirements for viewing the archived evidence.

## Retained limits

Only Chromium desktop/mobile emulation was verified, not physical phones or all browsers. Security Review is scoped source inspection and existing evidence, with no new vulnerability scan or penetration test. Local declared identities are not authenticated enterprise authorization. Git LFS was unavailable and was not introduced; included files are small enough for ordinary Git. Three trailing-whitespace lines in original failed-test Markdown were deliberately preserved rather than rewriting immutable evidence. All Phase 1/2 assets, approved artifacts and original timestamps/hashes remain unchanged.
