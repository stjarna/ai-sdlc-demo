from pathlib import Path
import json,subprocess,uuid,hashlib,os
out=Path(__file__).parent
app=Path('/Users/davidkrzystek/Development/Interview/ai-sdlc-demo');base=Path('/Users/davidkrzystek/.local/share/ai-sdlc/runtimes/5a634bea716a-8f8d160de2f808fb');py='/Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python'
def run(name,args):
 argv=[py,'-B',str(base/'orchestrator/scripts/sdlc.py'),'--project',str(app),*args]
 (out/(name+'.command.json')).write_text(json.dumps(argv,indent=2)+'\n')
 r=subprocess.run(argv,capture_output=True,text=True,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'})
 (out/(name+'.json')).write_text(r.stdout);(out/(name+'.stderr.txt')).write_text(r.stderr)
 assert r.returncode==0,(name,r.stdout,r.stderr)
 d=json.loads(r.stdout);assert d['ok'],d
 return d
if __name__=='__main__':
 def inv(root):return {p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file() and not any(x in ('.git','node_modules','__pycache__','.DS_Store') for x in p.relative_to(root).parts)}
 snapshot=out/'files-before.json';assert not snapshot.exists();snapshot.write_text(json.dumps(inv(app),indent=2))
 before=run('fresh-before',['engineering-review','REQ-0001'])['engineering'];assert before['stage']=='ready_for_development' and before['development_start']['code']=='E_APPROVAL_STALE'
 identity=run('fresh-identity',['identity-show'])['identity']
 decision='Refresh the Implementation Plan against the current project fingerprint. Business requirements and Technical Design remain unchanged.'
 result=run('request-changes',['engineering-request-changes','REQ-0001','--kind','plan','--expected-engineering-revision',before['revision'],'--operation-id',str(uuid.uuid4()),'--expected-profile-revision',identity['profile_revision'],'--decision',decision])
 review=run('after-feedback',['engineering-review','REQ-0001'])['engineering'];assert review['stage']=='implementation_planning';print(json.dumps({'stage':review['stage'],'approvals':review['approvals'],'source_revision':review['source_revision']}))
