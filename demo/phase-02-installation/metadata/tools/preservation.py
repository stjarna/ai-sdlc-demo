import json,hashlib,subprocess,sys
from pathlib import Path
project=Path(sys.argv[1]);out=Path(sys.argv[2]);baseline='2f9578a04bd43aac788441e1407058a7532c8148'
def git(*args):return subprocess.check_output(['git','-C',str(project),*args])
names=git('ls-tree','-r','--name-only',baseline).decode().splitlines();files={};same=True
for name in names:
 original=git('show',baseline+':'+name);current=(project/name).read_bytes();equal=original==current;same &=equal
 files[name]={'sha256':hashlib.sha256(current).hexdigest(),'matches_baseline':equal}
data={'application_revision':git('rev-parse','HEAD').decode().strip(),'baseline_revision':baseline,'baseline_tag_object':git('rev-parse','refs/tags/baseline-crud').decode().strip(),'baseline_tag_target':git('rev-parse','baseline-crud^{commit}').decode().strip(),'tracked_files':len(files),'all_baseline_files_unchanged':same,'requirements_exists':(project/'requirements').exists(),'qa_exists':(project/'qa').exists(),'project_skill_exists':(project/'.agents').exists(),'files':files}
assert same and data['application_revision']==baseline and data['baseline_tag_target']==baseline
assert not data['requirements_exists'] and not data['qa_exists'] and not data['project_skill_exists']
(out/'metadata/preservation.json').write_text(json.dumps(data,indent=2)+'\n');print(json.dumps({k:v for k,v in data.items()if k!='files'},indent=2))
