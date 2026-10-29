import json,subprocess,selectors,time,sys
from pathlib import Path
out=Path(sys.argv[1]);project=sys.argv[2];expected=str(Path.home()/'.agents/skills/sdlc/SKILL.md')
p=subprocess.Popen(['codex','app-server','--stdio'],cwd=project,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,bufsize=1)
selector=selectors.DefaultSelector();selector.register(p.stdout,selectors.EVENT_READ,'stdout');selector.register(p.stderr,selectors.EVENT_READ,'stderr')
raw=[];errors=[];requests=[]
def send(obj):
 requests.append(obj);p.stdin.write(json.dumps(obj)+'\n');p.stdin.flush()
def response(id):
 deadline=time.monotonic()+40
 while time.monotonic()<deadline:
  for key,_ in selector.select(1):
   line=key.fileobj.readline()
   if not line:continue
   if key.data=='stderr':errors.append(line);continue
   raw.append(line)
   try:obj=json.loads(line)
   except ValueError:continue
   if obj.get('id')==id:return obj
 raise RuntimeError('Timed out waiting for app-server response')
try:
 send({'id':1,'method':'initialize','params':{'clientInfo':{'name':'littlelist-adoption-evidence','version':'1.0.0'},'capabilities':{'experimentalApi':True}}});init=response(1)
 if 'error'in init:raise RuntimeError(str(init['error']))
 send({'method':'initialized','params':{}})
 send({'id':2,'method':'skills/list','params':{'cwds':[project],'forceReload':True}});result=response(2)
 if 'error'in result:raise RuntimeError(str(result['error']))
 entries=result['result']['data'];skills=[s for entry in entries if entry['cwd']==project for s in entry['skills'] if s['name']=='sdlc']
 good=[s for s in skills if s.get('enabled') and s.get('path')==expected]
 summary={'method':'actual local Codex CLI app-server skills/list; no model turn','cwd':project,'expected_path':expected,'sdlc_skills':skills,'errors':[e.get('errors',[])for e in entries],'verified':len(good)==1}
 (out/'metadata/codex-discovery.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
 if not summary['verified']:sys.exit(1)
finally:
 p.terminate()
 try:p.wait(timeout=10)
 except subprocess.TimeoutExpired:p.kill();p.wait()
 (out/'logs/codex-app-server.requests.jsonl').write_text(''.join(json.dumps(r)+'\n'for r in requests))
 (out/'logs/codex-app-server.responses.jsonl').write_text(''.join(raw))
 (out/'logs/codex-app-server.stderr.txt').write_text(''.join(errors))
