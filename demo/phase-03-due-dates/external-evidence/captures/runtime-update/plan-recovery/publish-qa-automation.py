from recover import *
from copy import deepcopy
qa=run('automation-publish-before',['qa-review','REQ-0001'])['review'];assert qa['stage']=='test_automation' and qa['approvals']['scenarios']['valid']
eng=run('automation-engineering-before',['engineering-review','REQ-0001'])['engineering'];expected=json.loads((out/'qa-start-engineering.json').read_text())['engineering'];assert eng['source_revision']==expected['source_revision'] and eng['approvals']['implementation']['valid'] and eng['stage']=='verification'
paths=sorted(p.relative_to(app).as_posix() for p in (app/'qa').rglob('*') if p.is_file())
assert len(paths)==8,paths
cases=qa['drafts']['scenarios']['payload']['cases'];case_map={v['id']:v for v in cases};assert len(cases)==23
browser=(app/'qa/browser/due-dates.spec.mjs').read_text();assert all(v in browser for v in case_map)
api_cases=['TC-001','TC-002','TC-004','TC-005','TC-006','TC-012','TC-013','TC-014','TC-016','TC-017','TC-023']
api_reqs=sorted({r for c in api_cases for r in case_map[c]['requirements']})
all_cases=sorted(case_map);all_reqs=sorted(qa['drafts']['scenarios']['payload']['coverage'])
checks=[{'id':'QA-API','category':'integration','argv':['node','qa/run-check.mjs','integration'],'cwd':'.','timeout':120,'requirements':api_reqs,'cases':api_cases,'scenario':'Actual HTTP API, persistence and process-boundary checks against an isolated running server; optional/past dates, invalid-write preservation, edit/clear, legacy-schema migration and CRUD/restart compatibility. No UI outcome is inferred.'}]
for id,project in [('QA-UI-DESKTOP','desktop-los-angeles'),('QA-UI-MOBILE','mobile-kiritimati')]:
 checks.append({'id':id,'category':'ui','argv':['node','qa/run-check.mjs','ui',project],'cwd':'.','timeout':120,'requirements':all_reqs,'cases':all_cases,'scenario':'Real Chromium interactions and observable assertions for all 23 approved scenarios in '+project+', with disposable databases, controlled local-day/timezone/DST/year fixtures, saved/invalid draft cancellation, completion/reopening, actual restart, original CRUD and responsive/focus checks. Screenshots, traces, videos and reports are retained in a fresh Epic evidence directory.'})
content=f'''# Test Automation — REQ-0001

## Authority and source

AI-authored QA automation prepared following the explicit `$sdlc start qa` instruction. This is a proposal for human automation review, not approval, advancement or successful execution.

Product authority: approved Analysis baseline {qa['analysis_baseline']}, handoff {qa['analysis_handoff']}. Approved scenario artifact {qa['drafts']['scenarios']['baseline_id']} retains all 23 specified cases and seven FR/fifteen AC expectations. Approved Engineering Design artifact {eng['drafts']['design']['baseline_id']} supplies the existing API, native/text date controls and v1-to-v2 storage interface; it does not redefine product expectations. Engineering remains in Verification with current implementation approval. Testing skill 1.3.0 and the pinned Test Automation template define expertise and layout. The CLI binds the exact Design and scenario approval on publication.

QA source fingerprint: {qa['qa_source_revision']}. Reviewed paths: {', '.join(paths)}. Only QA-owned files are created. Engineering source fingerprint remains {eng['source_revision']}; no application/developer test/Plan, root dependency or historical evidence change is part of this preparation.

## Product checks

- QA-API (integration): node qa/run-check.mjs integration, cwd ., timeout 120 seconds. Cases: {', '.join(api_cases)}. Real HTTP status/envelope/content assertions, optional/edit/clear handling, past/today/future acceptance, invalid writes preserving the last saved leap day, legacy-schema fixture migration, CRUD/order and actual process restart with dated/changed/cleared/completed records. The fixture is synthetic and matches the original v1 schema; it does not execute a historical baseline binary or claim personal-data migration testing.
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
'''
payload={'content':content,'coverage':deepcopy(qa['drafts']['scenarios']['payload']['coverage']),'unresolved':deepcopy(qa['drafts']['scenarios']['payload']['unresolved']),'paths':paths,'checks':checks,'source_revision':qa['qa_source_revision'],'limitation_checks':[]}
for v in payload['coverage'].values():v['reason']='Prepared approved-case automation mapping; no test execution or passing acceptance is claimed. '+v['reason']
file=out/'qa-automation-input.json';file.write_text(json.dumps(payload,indent=2)+'\n')
template=json.loads((out/'qa-automation-template.json').read_text())['templates']['pin']
run('publish-qa-automation',['qa-write','REQ-0001','--kind','automation','--expected-qa-revision',qa['revision'],'--operation-id',str(uuid.uuid4()),'--decision','AI-assisted preparation of QA automation explicitly requested by $sdlc start qa. Preserve approved scenario expectations; human automation approval, dependency setup and execution remain pending.','--expected-template-digest',template['digest'],'--input-file',str(file)])
after=run('qa-automation-persisted',['qa-review','REQ-0001'])['review'];assert after['stage']=='test_automation' and after['approvals']['scenarios']['valid'] and not after['approvals']['automation']['valid']
end=run('qa-automation-engineering-preserved',['engineering-review','REQ-0001'])['engineering'];assert end['stage']==eng['stage'] and end['source_revision']==eng['source_revision'] and end['approvals']==eng['approvals']
print(json.dumps({'stage':after['stage'],'approvals':after['approvals'],'document':after['drafts']['automation']['document'],'paths':paths,'engineering_approval_preserved':True},indent=2))
