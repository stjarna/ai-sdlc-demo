from pathlib import Path
import json,hashlib,subprocess,os
out=Path(__file__).parent;before=json.loads((out/'before.json').read_text());app=Path('/Users/davidkrzystek/Development/Interview/ai-sdlc-demo');root=Path.home()/'.agents/skills';python=str(Path.home()/'.local/share/ai-sdlc/venv/bin/python');old=json.loads((out/'previous-sdlc-registration/installation.json').read_text());oldruntime=Path(old['runtime'])
def inv(path,skip=()):return {p.relative_to(path).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in path.rglob('*') if p.is_file() and not any(x in skip for x in p.relative_to(path).parts)}
def git(path,*args):return subprocess.check_output(['git','-c','core.fsmonitor=false','-C',str(path),*args],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip()
assert inv(app,('.git','node_modules','__pycache__','.DS_Store'))==before['app']
assert inv(oldruntime)==before['old_runtime']
assert inv(out/'previous-sdlc-registration')==before['loader']
assert {k:v for k,v in inv(root).items() if not k.startswith('sdlc/')}==before['other_skills']
currentgit={k:git(app,*a) for k,a in {'head':['rev-parse','HEAD'],'tag':['rev-parse','baseline-crud'],'tag_commit':['rev-parse','baseline-crud^{}'],'status':['status','--porcelain=v1'],'diff':['diff','HEAD','--']}.items()};assert currentgit==before['git']
assert git(Path('/Users/davidkrzystek/Development/Interview/Alza'),'status','--porcelain=v1')==''
r=subprocess.run([python,'-B',str(oldruntime/'orchestrator/scripts/sdlc.py'),'--project',str(app),'validate'],capture_output=True,text=True);assert r.returncode==0
(out/'old-validate.stdout.json').write_text(r.stdout)
assert json.loads(r.stdout)['diagnostics']==json.loads((out/'validate.stdout.json').read_text())['diagnostics']
business=json.loads((out/'business-review.stdout.json').read_text());analysis=json.loads((out/'analysis-review.stdout.json').read_text());eng=json.loads((out/'engineering-review.stdout.json').read_text())['engineering'];qa=json.loads((out/'qa-review.stdout.json').read_text())['review']
assert business['approval']['valid'] and analysis['analysis_approval']['valid']
assert eng['approvals']['design']['valid'] and eng['approvals']['plan']['valid'] and qa['approvals']['scenarios']['valid']
assert eng['stage']=='ready_for_development' and eng['development_start']['code']=='E_APPROVAL_STALE' and not eng['development_start']['eligible']
summary={'preservation_passed':True,'littlelist_files_unchanged':len(before['app']),'previous_runtime_files_unchanged':len(before['old_runtime']),'previous_loader_files_preserved':len(before['loader']),'unrelated_skill_files_unchanged':len(before['other_skills']),'git':currentgit,'source_repository_clean':True,'existing_approvals_valid':['business','analysis','design','plan historical authority','qa scenarios'],'development_start':eng['development_start'],'existing_warnings_unchanged':True,'recovery_started':False,'development_started':False}
(out/'preservation-results.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))
