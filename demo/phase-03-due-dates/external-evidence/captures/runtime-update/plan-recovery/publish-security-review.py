from recover import *
from copy import deepcopy
review=run('security-publication-before',['engineering-review','REQ-0001'])['engineering'];qa=run('security-publication-qa',['qa-review','REQ-0001'])['review']
assert review['stage']=='security_review' and review['approvals']['implementation']['valid'] and qa['stage']=='verified' and qa['integration']['ready']
assert not review['drafts'].get('security'),'Do not erase prior findings'
source=review['source_revision'];plan=review['drafts']['plan'];implementation=review['drafts']['implementation'];design=review['drafts']['design']
protected={p.relative_to(app).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in app.rglob('*') if p.is_file() and not any(x in ('.git','node_modules','__pycache__','.DS_Store') for x in p.relative_to(app).parts)}
(cap if False else out/'security-protected-before.json').write_text(json.dumps(protected,indent=2))
def ref(path,needle):
 lines=(app/path).read_text().splitlines();line=next(i for i,v in enumerate(lines,1) if needle in v);return f'{path}:{line}'
refs={
 'network':ref('src/server.mjs',"server.listen(port, '127.0.0.1'"),
 'json':ref('src/http.mjs','async function jsonBody'),
 'host':ref('src/http.mjs','includes(request.headers.host)'),
 'origin':ref('src/http.mjs','request.headers.origin &&'),
 'headers':ref('src/http.mjs',"response.setHeader('Content-Security-Policy'"),
 'allowlist':ref('src/http.mjs',"const assets = new Map"),
 'date':ref('src/tasks.mjs',"dueDate !== null && !validCalendarDate"),
 'sql':ref('src/tasks.mjs','const queries ='),
 'migration':ref('src/tasks.mjs',"const version = db.prepare"),
 'dom':ref('public/app.js','title.textContent = task.title'),
 'date_dom':ref('public/app.js','label.textContent = `Due'),
 'calendar':ref('public/calendar-date.js','export function calendarParts'),
 'draft':ref('public/calendar-date.js','validity.badInput'),
 'data_path':ref('src/config.mjs',"join(home, '.local'")}
checks={v['check_id']:v for v in qa['evidence']}
assert all(checks[k]['status']=='passed' for k in ['QA-API','QA-UI-DESKTOP','QA-UI-MOBILE'])
content=f'''# Security Review — REQ-0001

## Scope and method

AI-assisted source review by the implementation agent using pinned Security skill 1.2.0 (digest 5698ff24151fffff13837297dbe36e33a0c26ffb180256c95814c3f1c63c94ee) and the resolved Security Review template. This is an author-assisted review, not independent security certification.

Reviewed Engineering source: {source}. Authority: approved Analysis {review['analysis_baseline']}, Design {design['baseline_id']}, Engineering Plan {plan['baseline_id']}, implementation/code review {implementation['baseline_id']} and its current human approval. Independent QA is Verified with current scenario/automation approvals and matching combined execution context. The reviewed source has not changed since its human code approval or the passing checks.

Assets are personal task content, due-date integrity, SQLite data and preserved governance evidence. Boundaries are browser to local JSON API, input validation to prepared SQLite statements, local static assets and the local filesystem. The approved deployment is a trusted local machine with a loopback web app; this review does not authorize remote hosting, shared-user access or a new identity service.

Method: inspected current source and dependency declarations; compared the due-date change with approved Design/Plan; inspected exact-source unit/build evidence and joined API/browser results. No new tests, external advisory queries, scanner, fuzzing or penetration tests were executed during this review. Existing test presence is never substituted for an executed result.

## Findings

No open security findings were identified within the stated source-review scope. Structured findings is empty; no earlier Security findings exist in this cycle. This does not assert the absence of all vulnerabilities.

- Input/data integrity: {refs['date']} validates calendar representation before mutation. Shared component validation ({refs['calendar']}) rejects impossible or malformed date values rather than chronological eligibility; past dates, null clearing and omitted PATCH behavior remain approved. Native invalid drafts are distinguished from clearing ({refs['draft']}). The existing JSON boundary ({refs['json']}) limits request size, enforces JSON/UTF-8 and retains structured errors.
- Persistence: {refs['sql']} uses prepared statements for user task/date values. Migration checks the version under a write transaction ({refs['migration']}) and rolls back failure; existing task identity/order/content remains preserved. This is not a claim of encrypted storage or enterprise backup.
- Browser output: task title/description and date labels use DOM textContent ({refs['dom']}, {refs['date_dom']}); no date string becomes executable HTML or script. Existing security headers remain in {refs['headers']}.
- Exposure: binding is explicitly loopback ({refs['network']}); Host and Origin checks remain at {refs['host']} and {refs['origin']}. The fixed asset map ({refs['allowlist']}) adds only calendar-date.js; no generic directory serving is introduced. Database, external identity profile, runtime and requirements/evidence are not in that allowlist.
- Configuration/dependencies: personal data remains outside the application/dependency tree ({refs['data_path']}). No new application runtime dependency is added. QA-local Playwright 1.64.1 and its lockfile are separate from the application. No credentials or authentication service are introduced by the reviewed change. This targeted inspection is not an exhaustive secrets scan.

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
'''
coverage=deepcopy(implementation['payload']['coverage'])
for rid,item in coverage.items():item['reason']=f'Retains approved Plan/implementation disposition for {rid}; security source inspection and actual current joined evidence are described in this report. No broader security certification or new behavior is claimed.'
payload={'content':content,'coverage':coverage,'unresolved':deepcopy(implementation['payload']['unresolved']),'source_revision':source,'plan':plan['baseline_id'],'findings':[],'limitation_refs':deepcopy(implementation['payload']['limitation_refs'])}
f=out/'security-review-input.json';f.write_text(json.dumps(payload,indent=2)+'\n');template=json.loads((out/'security-template.json').read_text())['templates']['pin']
run('publish-security-review',['engineering-write','REQ-0001','--kind','security','--expected-engineering-revision',review['revision'],'--operation-id',str(uuid.uuid4()),'--decision','AI-assisted source-bound Security Review explicitly requested by $sdlc start engineering. Inspect current source and actual joined evidence, disclose unperformed checks, and preserve human advancement as a separate decision.','--expected-template-digest',template['digest'],'--input-file',str(f)])
a=run('security-review-persisted',['engineering-review','REQ-0001'])['engineering'];q=run('security-review-qa-preserved',['qa-review','REQ-0001'])['review']
assert a['stage']=='security_review' and a['source_revision']==source and a['approvals']==review['approvals']
assert q['stage']=='verified' and q['integration']['ready'] and q['evidence']==qa['evidence'] and q['approvals']==qa['approvals']
now={p.relative_to(app).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in app.rglob('*') if p.is_file() and not any(x in ('.git','node_modules','__pycache__','.DS_Store') for x in p.relative_to(app).parts)}
changed=[k for k,v in protected.items() if now.get(k)!=v];added=sorted(set(now)-set(protected));assert all(k.startswith('requirements/') for k in changed+added) and all('baselines/' not in k for k in changed)
summary={'stage':a['stage'],'qa_stage':q['stage'],'findings':a['drafts']['security']['payload']['findings'],'source_approvals_evidence_preserved':True,'checks_rerun':False,'document':a['drafts']['security']['document'],'changed_files':changed,'added_files':added}
(out/'security-review-verification.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
