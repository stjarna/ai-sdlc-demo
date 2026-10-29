from pathlib import Path
import subprocess,json,datetime,hashlib,shlex
project=Path('/Users/davidkrzystek/Development/Interview/ai-sdlc-demo')
runtime=Path('/Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f')
python='/Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python'
cli=[python,'-B',str(runtime/'orchestrator/scripts/sdlc.py'),'--project',str(project)]
root=project/'demo/phase-03-due-dates';event=root/'events/0001-discovery-start'
assert not root.exists(), 'Existing Phase 3 evidence must be resumed, never overwritten.'
# Run clean-state checks before materializing capture files.
runs=[]
def call(name,args):
 started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 r=subprocess.run(args,cwd=project,capture_output=True,text=True)
 entry={'name':name,'started_at':started,'finished_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cwd':str(project),'argv':args,'command':shlex.join(args),'exit_code':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
 runs.append(entry)
 if event.exists():save(entry)
 assert r.returncode==0,(name,r.stderr,r.stdout)
 return json.loads(r.stdout)
def save(entry):
 stem=entry['name'];(event/(stem+'.stdout.json')).write_text(entry['stdout']);(event/(stem+'.stderr.txt')).write_text(entry['stderr'])
 (event/(stem+'.command.json')).write_text(json.dumps({k:v for k,v in entry.items()if k not in ['stdout','stderr']},indent=2)+'\n')
verify=call('01-runtime-verify',[python,'-B',str(runtime/'orchestrator/scripts/install.py'),'verify','--runtime',str(runtime),'--expected-digest','64a774d6980d081f67ef7e99d4e7639443f0f7f821f155a14ed60a9f55b5934a','--skill-root','/Users/davidkrzystek/.agents/skills'])
pre=call('02-adoption-preflight',cli+['adoption-preflight']);assert pre['baseline_ready'] and not pre['diagnostics']
existing=call('03-project-validation',cli+['validate']);assert existing['validated_ids']==[]
template=call('04-idea-template',cli+['templates','idea'])['templates']
assert template['manifest']['required_sections']==['Problem','Users','Expected value','Initial scope','Success criteria','Assumptions','Open questions']
event.mkdir(parents=True)
for entry in runs:save(entry)
attachment=Path('/Users/davidkrzystek/.codex/attachments/f4645643-529b-4e64-8bb9-5cfa367415b3/Pasted text.txt')
(event/'human-phase3-instructions.txt').write_bytes(attachment.read_bytes())
idea='Littlelist users should be able to optionally assign a due date to a task, view that date in their task list and manage it when editing a task. Existing tasks without due dates must remain supported.'
created=call('05-create-request',cli+['new','--title','Littlelist optional task due dates','--idea',idea,'--expected-template-digest',template['pin']['digest']])
print(json.dumps(created,indent=2))
