from pathlib import Path
import json,subprocess,os,hashlib,shutil
out=Path(__file__).parent;app=Path('/Users/davidkrzystek/Development/Interview/ai-sdlc-demo');root=Path.home()/'.agents/skills'
python=str(Path.home()/'.local/share/ai-sdlc/venv/bin/python');installed=json.loads((out/'install.stdout.json').read_text());runtime=Path(installed['runtime'])
def run(name,args):
 r=subprocess.run(args,capture_output=True,text=True,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'})
 (out/(name+'.stdout.json')).write_text(r.stdout);(out/(name+'.stderr.txt')).write_text(r.stderr)
 assert r.returncode==0,(name,r.returncode,r.stdout[:1500],r.stderr)
 value=json.loads(r.stdout);assert value.get('ok',True),name
 return value
v=run('new-runtime-verify',[python,'-B',str(runtime/'orchestrator/scripts/install.py'),'verify','--runtime',str(runtime),'--expected-digest',installed['snapshot_digest'],'--skill-root',str(root)])
assert v['source_revision']=='5a634bea716a51eede4baac7dd2c690dedc16be1' and not v['preview']
print('Runtime integrity, dependencies, domain pins, template pins and loader verified.')
for command in ('validate','business-review','analysis-review','engineering-review','track-review','qa-review'):
 args=[python,'-B',str(runtime/'orchestrator/scripts/sdlc.py'),'--project',str(app),command]
 if command!='validate':args+=['REQ-0001']
 result=run(command,args)
 print(command, 'ok', 'top-level keys:',','.join(result.keys()))
(out/'metadata').mkdir(exist_ok=True);(out/'logs').mkdir(exist_ok=True)
shutil.copyfile(app/'demo/phase-02-installation/metadata/tools/discover.py',out/'discover.py')
r=subprocess.run([python,'-B',str(out/'discover.py'),str(out),str(app)],capture_output=True,text=True)
(out/'discovery.stdout.txt').write_text(r.stdout);(out/'discovery.stderr.txt').write_text(r.stderr)
assert r.returncode==0,(r.stdout,r.stderr)
print('Actual Codex CLI skills/list discovery verified.')
