import json,platform,subprocess,sys
from importlib.metadata import version
from pathlib import Path
project=Path(sys.argv[1]);out=Path(sys.argv[2]);data={'os':platform.platform(),'architecture':platform.machine(),'python':platform.python_version(),'pyyaml':version('PyYAML')}
for key,argv in [('git',['git','--version']),('node',['node','--version']),('npm',['npm','--version']),('codex',['codex','--version']),('ffmpeg',['ffmpeg','-version'])]:
 r=subprocess.run(argv,capture_output=True,text=True,check=True);data[key]=r.stdout.splitlines()[0]
data['playwright']=json.loads((project/'node_modules/@playwright/test/package.json').read_text())['version']
data['chromium']=json.loads((out/'metadata/after-application.json').read_text())['browser']
(out/'metadata/environment.json').write_text(json.dumps(data,indent=2)+'\n');print(json.dumps(data,indent=2))
