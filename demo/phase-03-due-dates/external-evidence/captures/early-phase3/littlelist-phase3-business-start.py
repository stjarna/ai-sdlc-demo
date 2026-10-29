from pathlib import Path
import subprocess,json,datetime,uuid,shlex,hashlib
project=Path('/Users/davidkrzystek/Development/Interview/ai-sdlc-demo');runtime=Path('/Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f');py='/Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python';cli=[py,'-B',str(runtime/'orchestrator/scripts/sdlc.py'),'--project',str(project)]
event=project/'demo/phase-03-due-dates/events/0004-discovery-complete-business-draft';event.mkdir(exist_ok=False)
def call(name,args):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=project,capture_output=True,text=True)
 (event/(name+'.stdout.json')).write_text(r.stdout);(event/(name+'.stderr.txt')).write_text(r.stderr)
 (event/(name+'.command.json')).write_text(json.dumps({'started_at':start,'finished_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cwd':str(project),'argv':args,'command':shlex.join(args),'exit_code':r.returncode},indent=2)+'\n')
 assert r.returncode==0,(name,r.stdout,r.stderr)
 return json.loads(r.stdout)
call('01-runtime-verify',[py,'-B',str(runtime/'orchestrator/scripts/install.py'),'verify','--runtime',str(runtime),'--expected-digest','64a774d6980d081f67ef7e99d4e7639443f0f7f821f155a14ed60a9f55b5934a'])
identity=call('02-identity',cli+['identity-show'])['identity'];original=call('03-open-discovery',cli+['open','REQ-0001'])['epic'];assert original['metadata']['status']=='discovery'
decision='I confirm that Discovery for REQ-0001 is complete. I explicitly authorize the transition to Business Refinement readiness.'
(event/'human-authorization.txt').write_text('I confirm that Discovery for REQ-0001 is complete.\nI explicitly authorize the transition to Business Refinement readiness.\nPlease record this decision with my Requester attribution and proceed using the supported SDLC workflow.\nContinue autonomously where permitted, preparing the Business Refinement artifact using its pinned template and applicable domain guidance.\nDo not treat this authorization as approval of the Business artifact or any subsequent lifecycle transition. Pause at the next mandatory human approval gate.\nContinue capturing authentic lifecycle events, artifact provenance and evidence for the Alza demonstration.\n')
completed=call('04-discovery-complete',cli+['discovery-complete','REQ-0001','--expected-revision',original['revision'],'--operation-id',str(uuid.uuid4()),'--expected-profile-revision',identity['profile_revision'],'--decision',decision])
ready=call('05-verify-readiness',cli+['open','REQ-0001'])['epic'];assert ready['metadata']['status']=='ready_for_refinement';assert ready['ownership']['owner']==identity['display_name'];assert ready['ownership']['assignment_status']=='awaiting_handoff'
template=call('06-business-template',cli+['templates','business'])['templates'];assert template['manifest']['required_sections']==['Confirmed information','Unresolved issues','Unconfirmed proposals']
confirmed='''### Business purpose and users

- **B-001** [D-0001] Littlelist users can attach an optional due date to a personal task, see that date in the task list and manage it during editing; tasks without due dates remain supported.

### Feature scope and existing product compatibility

- **B-002** [D-0002] Due dates are optional. A user can assign one during task creation or editing, display it clearly in the list, and subsequently change or remove it.
- **B-003** [D-0003] Preserve existing tasks without due dates and all existing CRUD and completion/reopening behavior.
- **B-004** [D-0004] Due dates persist across application restarts alongside existing task data.
- **B-005** [D-0005] Provide an intuitive, visually polished experience consistent with Littlelist.
- **B-006** [D-0006] Keep the change scoped to the local single-user demonstrator.

### Date eligibility and interpretation

- **B-007** [D-0007, D-0009, D-0010] Permit any valid calendar date, including past dates, today and future dates. Due dates remain optional; never reject a valid date merely because it is in the past.
- **B-008** [D-0012, D-0017, D-0020] Treat due dates as calendar dates in the device's local calendar, without timezone-related date shifts. Reject invalid calendar dates without overwriting the last valid saved value.

### Overdue presentation and completion

- **B-009** [D-0011, D-0016, D-0020] An unfinished task whose due date is before device-local today displays an explicit "Overdue" label with subtle warning styling. A task due today is not overdue. Preserve existing task ordering.
- **B-010** [D-0013, D-0018, D-0020] Completing a task retains its due date but removes overdue emphasis. Reopening restores overdue indication when applicable.

### Editing and clearing

- **B-011** [D-0014, D-0019, D-0020] Due-date editing and clearing follow existing autosave behavior. Clearing removes the optional due date. Cancel discards only unsaved or invalid drafts; previously saved changes remain saved.'''
content=template['content']
for key,value in {'epic_id':'REQ-0001','source_revision':ready['source_revision'],'confirmed_information':confirmed,'unresolved_issues_or_none_recorded':'None recorded.','unconfirmed_proposals_or_none_recorded':'None recorded.'}.items():content=content.replace('{{'+key+'}}',value)
assert '{{'not in content
payload=event/'07-business-input.md';payload.write_text(content)
generated=call('07-business-generate',cli+['business-generate','REQ-0001','--expected-source-revision',ready['source_revision'],'--operation-id',str(uuid.uuid4()),'--editor','AI SDLC Assistant (AI-authored draft)','--reason','User authorized drafting from completed Discovery; no Business approval or further advancement authorized.','--document-file',str(payload),'--expected-template-digest',template['pin']['digest']])
review=call('08-business-review',cli+['business-review','REQ-0001']);opened=call('09-open-business',cli+['open','REQ-0001'])['epic'];validation=call('10-validate',cli+['validate','REQ-0001'])
assert opened['metadata']['status']=='business_refinement';assert opened['idea']==original['idea'];assert opened['discovery']==original['discovery'];assert not opened['approval']['valid'];assert opened['ownership']['owner']==identity['display_name'];assert opened['ownership']['assignment_status']=='awaiting_handoff';assert not opened['analysis']
for name in subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD'],cwd=project,text=True).splitlines():assert (project/name).read_bytes()==subprocess.check_output(['git','show','HEAD:'+name],cwd=project)
summary={'event':'Requester completed Discovery; authorized AI Business drafting prepared for PO review','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'request_id':'REQ-0001','stage':'business_refinement','actor':identity['display_name'],'identity_source':'local_profile','identity_authenticated':False,'required_approval_role':'Product Owner','owner_retained':opened['ownership']['owner'],'assignment_status':opened['ownership']['assignment_status'],'runtime_revision':'d058e5fad9fd8459068951f0dea19dbfabba5fd6','draft_author':'AI SDLC Assistant','template':template['pin'],'review_revision':opened['review_revision'],'open_items':opened['open_items'],'business_approval':opened['approval'],'analysis_started':False,'baseline_application_and_prior_evidence_unchanged':True,'test_execution':'Not run; no application changes. Structural validation executed.','next_human_decision':'Approve the reviewed Business specification as Product Owner or request changes. Ownership handoff remains pending; no assignment was inferred.'}
(event/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
root=project/'demo/phase-03-due-dates/README.md';text=root.read_text().replace('Current stage: Discovery. Responsible Requester: David Krzystek.','Current stage: Business Refinement. Accountable owner remains David Krzystek, awaiting Product Owner handoff.').replace('The four remaining defaults are now explicitly confirmed. Discovery completion is pending a separate Requester decision.','Discovery completion was explicitly authorized and recorded. The AI-authored Business specification is prepared; Product Owner review and approval are pending.');text+='\n- events/0004-discovery-complete-business-draft/: explicit Requester completion, verified readiness transition, pinned Business template, AI-authored source-traceable draft, history and approval context. No Business approval or further advancement.\n';root.write_text(text)
files={p.relative_to(project).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(event.rglob('*'))if p.is_file()}
for name in ['metadata.yaml','idea.md','discovery.yaml','business.md','business-history.yaml']:
 p=Path(opened['directory'])/name;files[p.relative_to(project).as_posix()]=hashlib.sha256(p.read_bytes()).hexdigest()
(event/'checksums.sha256').write_text(''.join(f'{digest}  {name}\n'for name,digest in sorted(files.items())))
print(json.dumps({'stage':opened['metadata']['status'],'ownership':opened['ownership'],'review_keys':list(review),'open_items':opened['open_items'],'approval':opened['approval'],'diagnostic_errors':[d for d in validation['diagnostics']if d['severity']=='error'],'template':template['pin'],'prior_files_unchanged':True},indent=2))
