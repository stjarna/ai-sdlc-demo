from pathlib import Path
import subprocess,json,datetime,hashlib,uuid,shlex
project=Path('/Users/davidkrzystek/Development/Interview/ai-sdlc-demo');runtime=Path('/Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f');py='/Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python';cli=[py,'-B',str(runtime/'orchestrator/scripts/sdlc.py'),'--project',str(project)]
event=project/'demo/phase-03-due-dates/events/0003-confirmed-date-behavior';event.mkdir(exist_ok=False)
def call(name,args):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=project,capture_output=True,text=True)
 (event/(name+'.stdout.json')).write_text(r.stdout);(event/(name+'.stderr.txt')).write_text(r.stderr)
 (event/(name+'.command.json')).write_text(json.dumps({'started_at':start,'finished_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cwd':str(project),'argv':args,'command':shlex.join(args),'exit_code':r.returncode},indent=2)+'\n')
 assert r.returncode==0,(name,r.stdout,r.stderr)
 return json.loads(r.stdout)
call('01-runtime-verify',[py,'-B',str(runtime/'orchestrator/scripts/install.py'),'verify','--runtime',str(runtime),'--expected-digest','64a774d6980d081f67ef7e99d4e7639443f0f7f821f155a14ed60a9f55b5934a'])
identity=call('02-declared-identity',cli+['identity-show'])['identity'];epic=call('03-open-request',cli+['open','REQ-0001'])['epic']
assert identity['display_name']=='David Krzystek' and not identity['authenticated'];assert epic['metadata']['status']=='discovery'
intro='I confirm all four proposed defaults as my explicit business decisions:'
choices=[('D-0011','overdue_presentation','Overdue: unfinished tasks with due dates before today display an "Overdue" label and subtle warning styling. Today is not overdue. Existing task ordering remains unchanged.'),('D-0012','calendar_interpretation',"Date interpretation: use calendar dates in the device's local calendar without timezone-related date shifts. Invalid dates must be rejected without overwriting the last valid saved value."),('D-0013','completed_due_dates','Completed tasks: retain their due dates without overdue emphasis. Reopening restores the overdue indication when applicable.'),('D-0014','date_editing','Editing and clearing: follow the existing autosave behavior. Clearing a due date is supported. Cancel discards only unsaved or invalid drafts; previously saved changes remain.')]
quote=intro+'\n\n'+'\n'.join('- '+text for _,_,text in choices)
(event/'human-decision-quote.txt').write_text(quote+'\n\nPlease persist these decisions with the correct human attribution and continue the governed Discovery workflow. Do not treat this confirmation as approval of any subsequent artifact or lifecycle advancement.\n\nContinue autonomously wherever allowed and pause only for mandatory human decisions or approvals.\n')
records=[{'kind':'human_decision','topic':topic,'text':identity['display_name']+' (declared Requester) explicitly confirms: '+text,'source':{'actor':'user','quote':intro+'\n\n- '+text},'action':'confirm','target':target}for target,topic,text in choices]
records.append({'kind':'human_decision','topic':'remaining_date_behavior','text':'David Krzystek (declared Requester) explicitly accepts all four proposed date-behavior defaults. This resolves the bundled Discovery question and does not approve a subsequent artifact or lifecycle transition.','source':{'actor':'user','quote':quote},'action':'answer','target':'D-0015'})
payload=event/'04-discovery-input.json';payload.write_text(json.dumps({'records':records},indent=2)+'\n')
updated=call('04-discovery-update',cli+['discovery-update','REQ-0001','--expected-revision',epic['revision'],'--operation-id',str(uuid.uuid4()),'--changes-file',str(payload)])
opened=call('05-open-review',cli+['open','REQ-0001'])['epic'];valid=call('06-validate',cli+['validate','REQ-0001']);context=call('07-review-context',cli+['command-context','review','--request','REQ-0001'])
state=opened['discovery_state'];assert all(q['status']=='answered'for q in state['questions']);assert all(a['status']=='confirmed'for a in state['assumptions']);assert opened['metadata']['status']=='discovery';assert opened['idea']==epic['idea'];assert not opened['approval']['valid']
for name in subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD'],cwd=project,text=True).splitlines():assert (project/name).read_bytes()==subprocess.check_output(['git','show','HEAD:'+name],cwd=project)
review='''# Discovery review — Littlelist optional task due dates

Requester: David Krzystek, from the local declared identity profile; unauthenticated, with informational roles.

## Confirmed scope

- Optional due dates can be assigned during task creation or editing, shown clearly in the list, changed and cleared.
- Past dates, today and future valid dates are permitted. A past date alone is never a validation failure.
- Unfinished tasks dated before device-local today display Overdue text plus subtle warning styling. Today is not overdue. Existing ordering stays unchanged.
- Due dates are calendar dates without timezone shifts. Invalid calendar dates are rejected without overwriting the last valid saved value.
- Completed tasks retain dates without overdue emphasis. Reopening restores overdue indication when applicable.
- Editing/clearing follows existing autosave. Cancel discards only unsaved/invalid drafts; previously saved changes remain.
- Existing undated tasks, CRUD, completion and SQLite persistence remain supported. Due dates persist across restarts. UI stays consistent with Littlelist, for this local single-user demonstrator.

## Open questions and assumptions

Both recorded business questions are answered. All five AI proposals have explicit linked human confirmations, with original proposal kinds and provenance preserved. There are no remaining unconfirmed assumptions or deferred questions in the current Discovery records. No prototype limitations have been proposed or authorized.

## Readiness and next decision

AI recommendation: the confirmed scope is sufficiently clear to prepare a Business specification. This is a readiness assessment, not approval. No delivery metrics, reminders, priority changes, new sorting, account features or other unsupported functionality have been added to the confirmed scope.

Required next decision: explicit Requester confirmation that Discovery is complete and authorization to transition to Business Refinement readiness. This confirmation of defaults did not authorize that transition. Business specification preparation, ownership handoff, artifact approval and later lifecycle advancement remain governed separately.

The original idea is unchanged. Structural validation has no errors; completeness warnings refer to intentionally untouched sections of the original idea, not missing decisions in the structured Discovery history. No application tests ran because this was a Discovery-only update. Existing application source, baseline tag and Phase 1/2 evidence remain unchanged.
'''
(event/'discovery-review.md').write_text(review)
summary={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'event':'Four proposed defaults explicitly confirmed; Discovery review prepared','stage':'discovery','request_id':'REQ-0001','responsible_person':identity['display_name'],'responsible_role':'Requester / Business Stakeholder','identity_source':identity['identity_source'],'authenticated':False,'profile_revision':identity['profile_revision'],'runtime_revision':'d058e5fad9fd8459068951f0dea19dbfabba5fd6','record_ids':updated['record_ids'],'discovery_state':state,'reviewed_revision':opened['revision'],'ai_readiness_recommendation':'Sufficiently clear for Business specification drafting, subject to explicit Requester Discovery completion.','next_human_decision':'Confirm Discovery completion and authorize transition to Business Refinement readiness.','artifact_approval_recorded':False,'lifecycle_advanced':False,'baseline_files_unchanged':True,'test_execution':'Not run; no implementation changes.'}
(event/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
index=project/'demo/phase-03-due-dates/README.md';text=index.read_text();text=text.replace('Human confirmation of the proposed remaining defaults is pending.','The four remaining defaults are now explicitly confirmed. Discovery completion is pending a separate Requester decision.');text += '\n- events/0003-confirmed-date-behavior/: explicit linked human confirmations, resolved question, declared identity attribution and Discovery review. This decision did not advance the lifecycle.\n';index.write_text(text)
files={p.relative_to(project).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(event.rglob('*'))if p.is_file()}
for name in ['metadata.yaml','idea.md','discovery.yaml']:
 p=Path(opened['directory'])/name;files[p.relative_to(project).as_posix()]=hashlib.sha256(p.read_bytes()).hexdigest()
(event/'checksums.sha256').write_text(''.join(f'{digest}  {name}\n'for name,digest in sorted(files.items())))
print(json.dumps({'stage':opened['metadata']['status'],'record_ids':updated['record_ids'],'questions':state['questions'],'assumptions':state['assumptions'],'structural_errors':[d for d in valid['diagnostics']if d['severity']=='error'],'all_baseline_files_unchanged':True},indent=2))
