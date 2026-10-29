from recover import *
from copy import deepcopy
review=run('code-review-current',['engineering-review','REQ-0001'])['engineering'];assert review['stage']=='development'
plan=review['drafts']['plan'];source=review['source_revision']
checks={e['check_id']:e for e in review['evidence'] if e.get('source_revision')==source}
assert all(checks[k]['status']=='passed' and checks[k]['exit_code']==0 for k in ('ENG-UNIT','ENG-STATIC'))
def behavior(category,path,needle,observable,rid,reason):
 lines=(app/path).read_text().splitlines();line=next(i for i,s in enumerate(lines,1) if needle in s)
 return {'category':category,'path':path,'line':line,'observable_behavior':observable,'authority':{'kind':'requirement','id':rid},'assessment':'conforms','reason':reason}
behaviors=[
 behavior('validation','src/tasks.mjs',"dueDate !== null && !validCalendarDate",'Invalid calendar representations fail before any create/update mutation; the previous task is preserved.','AC-006','Approved real-calendar validation; unit invalid-write regression asserts last saved title/date and task count remain unchanged.'),
 behavior('negative_condition','public/calendar-date.js',"return !task.completed",'Only unfinished dated tasks strictly before the device-local day are Overdue; today, future and undated tasks are not.','FR-004','Approved overdue predicate, not an input rejection. Unit tests distinguish past/today/future/undated/completed.'),
 behavior('default','src/tasks.mjs',"Object.hasOwn(input, 'dueDate') ? input.dueDate : null",'Create omission defaults to no date; PATCH omission leaves the previously saved date unchanged.','FR-001','Approved optional/additive field. Store regression covers omission and completion-only PATCH retention.'),
 behavior('unsupported_operation','public/calendar-date.js',"typeof value !== 'string'",'Non-calendar wire representations (including timestamps and wrong types) are rejected; no past-date or year-window rejection is imposed.','FR-003','Approved date-only representation and real-calendar validation. Positive years of at least four digits are checked by arithmetic, including beyond four digits.'),
 behavior('validation','public/calendar-date.js',"validity.badInput",'An empty native badInput draft is invalid and cannot be treated as an intentional clear.','AC-006','The draft helper and editor validity gate preserve the saved value; helper unit regression exercises the native validity contract. Actual browser entry remains QA work.'),
 behavior('default','public/app.js',"field.type = 'text'",'Manual canonical text entry supplements the native calendar picker; opening an unrepresentable saved native value falls back to text without clearing it.','FR-003','Avoids introducing a platform year-range business restriction. Browser-specific interactions still require actual QA execution.'),
 behavior('negative_condition','public/calendar-date.js',"return !task.completed",'Completed tasks retain due dates without overdue emphasis; reopening restores the indication if applicable.','AC-010','Completion changes no saved date. Store and predicate unit tests cover retention, reopening and warning predicate.'),
 behavior('default','public/calendar-date.js',"now.getFullYear()",'Today is derived from local calendar components; saved date strings never become UTC timestamps.','AC-007','Opposite-timezone subprocess unit checks and calendar comparisons exercise date-only semantics.'),
 behavior('negative_condition','public/app.js',"clearTimeout(editor.timer); editor = null",'Cancel cancels only pending draft work and closes the editor; previous autosaves are not rolled back.','AC-011','Preserves existing cancellation contract. New date drafts join the same autosave/dirty state; real browser cancellation checks remain pending QA.'),
 behavior('validation','src/tasks.mjs',"const version = db.prepare",'Migration rechecks schema under a transaction; only the supported v1-to-v2 additive change runs, and failures roll back without replacing legacy tasks.','FR-006','Approved persistence/compatibility design. Store unit tests exercise migration, idempotency, rollback and reopen; existing unsupported-schema negative regression remains.'),
 behavior('default','src/tasks.mjs',"ORDER BY sequence DESC",'Date assignment, overdue state and completion do not reorder creation order.','FR-004','Existing sequence ordering remains unchanged; legacy migration and unit CRUD ordering regressions retain it.'),
 behavior('default','public/app.js',"function refreshDatePresentation",'Local day/visibility refresh updates only date labels, preserving task-control focus and open editor drafts.','AC-015','Date presentation update does not rebuild list buttons; this is author source review, with real keyboard/browser verification still pending.')]
coverage=deepcopy(plan['payload']['coverage'])
for rid,value in coverage.items():
 value['reason']=f'Engineering implementation coverage of {rid} by completed T-001 through T-005, within the approved Design and Plan. Current source-bound unit/build evidence is available; full HTTP/UI acceptance for this item is pending the independent QA workflow, not claimed passed here.'
content=f'''# Code Review — REQ-0001

## Scope and source

AI-authored implementation summary and author review for David Krzystek’s human code review. This is not independent review, code approval, QA verification or permission to advance.

Approved Engineering Plan: {plan['baseline_id']}. Current implementation source fingerprint: {source}. Approved Design, Business/Analysis requirements and independent QA scenario approval remain unchanged. All five planned tasks are implemented within their declared paths. No new dependency, prototype limitation, product exclusion or unresolved business decision was introduced.

## Verification evidence

The current-source ENG-UNIT operation actually executed npm run test:unit: 25 passed, zero failed/skipped/cancelled. It covers calendar/date-draft semantics, past/today/future validity, extended years, opposite local timezones, optional/edit/clear date persistence, completion retention, invalid-write preservation, additive legacy migration, migration rollback, repeated startup and original CRUD/store regressions.

The current-source ENG-STATIC operation actually executed npm run check: passed, checking syntax and local-asset references for 19 JavaScript modules. Both named checks exited zero and retain actual output and source fingerprints in immutable check artifacts. Earlier-source results are preserved as history rather than substituted for current evidence.

The complete tracked diff and all four new source/test/document files were inspected; git diff --check passed. Every changed application path belongs to the approved Plan. Existing demo captures and all pre-existing baseline files remained byte-identical. No personal database was opened or migrated; tests use isolated disposable databases.

Integration and browser tests have not been executed in this Engineering step. Existing browser assertions were only maintained to replace the obsolete no-dates assertion; all original CRUD/responsive checks remain. Independent QA automation and its human approval/verification gates are still required. No UI/E2E, Security Review or Final Verification pass is claimed.

## Semantic conformance

Author review by the AI implementation agent, not independent or human review. Reviewed consequential negative conditions, defaults, validation and unsupported-operation responses against approved FR/AC authority. The structured inventory records current file/line references and explicitly traces each behavior.

Past dates are accepted, including today and future dates; there is no min=today, artificial year window, UTC reference-day input rule or completed-task date rejection. Invalid calendar representations are distinct from chronological eligibility. Nullable omission/clearing, local overdue rules, completion retention, invalid-draft preservation and cancellation derive from approved requirements. The native calendar is supplemented by Type date entry to avoid a hidden browser year-window rule; saved values outside a native picker’s representation fall back to text without silent clearing. No limitation_refs exist because no prototype exception is proposed or authorized.

## Findings and limitations

No known unsupported business behavior was found in this author source review. This statement is limited to the inspected implementation and recorded unit/build checks; it is not proof of semantic completeness or independent review.

Remaining verification risks: real native partial-date entry and manual-date fallback, autosave/cancel/network races, actual keyboard/focus and responsive layout, day rollover/timezone changes in the running browser, HTTP-level invalid-date preservation, and full legacy-to-current application restart behavior. These remain for the independent QA workflow; they are not waived, product exclusions or authorized prototype limitations. The pure/store unit checks do not demonstrate the corresponding browser/HTTP outcomes.

## Change summary

- T-001: Shared calendar validation/comparison/local-day/draft helpers and focused unit regressions.
- T-002: Nullable dueDate DTO/storage, transactional v1-to-v2 migration and store/persistence regressions.
- T-003: Existing API/store boundary exposes date-only changes and a fixed allowlist entry for the helper; existing transport protections stay intact.
- T-004: Optional labelled creation/editor date controls, clear and manual-entry actions, autosave/draft preservation, date labels and subtle Overdue presentation with local-day refresh that preserves focused task controls.
- T-005: Preserve existing CRUD regressions while updating only additive DTO/date-control expectations; document behavior, migration/backup and old-binary incompatibility. Frozen evidence, package/lock files, runtime and QA-owned automation remain untouched.

Engineering is awaiting human code review. Approval, advancement and independent QA work remain separate decisions. No staging, commit or push occurred.
'''
payload={'content':content,'coverage':coverage,'unresolved':deepcopy(plan['payload']['unresolved']),'source_revision':source,'plan':plan['baseline_id'],'completed_tasks':[t['id'] for t in plan['payload']['tasks']],'limitation_refs':deepcopy(plan['payload']['limitation_refs']),'conformance':{'reviewer':'AI implementation agent','independence':'author_review','summary':'Source-bound author review against approved FR/AC authority; no unsupported restriction found. Unit/build executed; actual browser/HTTP QA and independent human code review remain pending.','reviewed_categories':['negative_condition','default','validation','unsupported_operation'],'behaviors':behaviors}}
inputfile=out/'implementation-review-input.json';inputfile.write_text(json.dumps(payload,indent=2)+'\n');template=json.loads((out/'implementation-review-template.json').read_text())['templates']['pin']
run('publish-code-review',['engineering-write','REQ-0001','--kind','implementation','--expected-engineering-revision',review['revision'],'--operation-id',str(uuid.uuid4()),'--decision','AI-authored implementation and source-bound author review after the explicitly authorized Development start and approved Plan. Present actual code/check evidence for human code approval; no human approval or advancement is inferred.','--expected-template-digest',template['digest'],'--input-file',str(inputfile)])
a=run('code-review-persisted',['engineering-review','REQ-0001'])['engineering'];assert a['stage']=='development' and a['source_revision']==source and not a['approvals']['implementation']['valid'];print(json.dumps({'stage':a['stage'],'document':a['drafts']['implementation']['document'],'approval':a['approvals']['implementation']},indent=2))
