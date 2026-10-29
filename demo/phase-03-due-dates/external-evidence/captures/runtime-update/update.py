from pathlib import Path
import subprocess,json,hashlib,os,shutil
out=Path(__file__).parent
app=Path('/Users/davidkrzystek/Development/Interview/ai-sdlc-demo')
source=Path('/Users/davidkrzystek/Development/Interview/Alza')
root=Path.home()/'.agents/skills'; loader=root/'sdlc'
python=str(Path.home()/'.local/share/ai-sdlc/venv/bin/python')
old=json.loads((loader/'installation.json').read_text());oldruntime=Path(old['runtime'])
def inventory(path,skip=()):
 return {p.relative_to(path).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in path.rglob('*') if p.is_file() and not any(x in skip for x in p.relative_to(path).parts)}
def git(path,*args):
 return subprocess.check_output(['git','-c','core.fsmonitor=false','-C',str(path),*args],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip()
def run(name,args):
 r=subprocess.run(args,capture_output=True,text=True,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'})
 (out/(name+'.stdout.json')).write_text(r.stdout);(out/(name+'.stderr.txt')).write_text(r.stderr)
 if r.returncode:raise RuntimeError(f'{name} failed ({r.returncode}): {r.stdout} {r.stderr}')
 return json.loads(r.stdout)
before={'app':inventory(app,('.git','node_modules','__pycache__','.DS_Store')),'old_runtime':inventory(oldruntime),'loader':inventory(loader),'other_skills':{k:v for k,v in inventory(root).items() if not k.startswith('sdlc/')},'git':{k:git(app,*a) for k,a in {'head':['rev-parse','HEAD'],'tag':['rev-parse','baseline-crud'],'tag_commit':['rev-parse','baseline-crud^{}'],'status':['status','--porcelain=v1'],'diff':['diff','HEAD','--']}.items()}}
assert not (out/'before.json').exists(),'Refuse to overwrite capture'
(out/'before.json').write_text(json.dumps(before,indent=2))
verified=run('old-runtime-verify',[python,'-B',str(oldruntime/'orchestrator/scripts/install.py'),'verify','--runtime',str(oldruntime),'--expected-digest',old['snapshot_digest'],'--skill-root',str(root)])
assert verified['source_revision']=='d058e5fad9fd8459068951f0dea19dbfabba5fd6'
backup=out/'previous-sdlc-registration';assert not backup.exists()
loader.rename(backup)
try:
 installed=run('install',[python,'-B',str(source/'orchestrator/scripts/install.py'),'install','--source',str(source),'--revision','5a634bea716a51eede4baac7dd2c690dedc16be1','--project',str(app),'--python',python])
except BaseException:
 if not loader.exists():backup.rename(loader)
 raise
print(json.dumps(installed,indent=2))
