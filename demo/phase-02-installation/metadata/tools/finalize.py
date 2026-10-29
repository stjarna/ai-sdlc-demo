"""Verify and inventory this evidence package without changing application files."""
from pathlib import Path
import json, subprocess, hashlib, datetime, time, shlex, re, struct, sys
root=Path(__file__).resolve().parents[2]
project=root.parents[1]
assert project.name=='ai-sdlc-demo' and root.name=='phase-02-installation'
commands=[json.loads(x)for x in(root/'commands.jsonl').read_text().splitlines()]
def run(name,argv,cwd=project):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 p=subprocess.run(argv,cwd=cwd,capture_output=True,text=True)
 end=datetime.datetime.now(datetime.timezone.utc).isoformat()
 (root/'logs'/f'{name}.stdout.txt').write_text(p.stdout)
 (root/'logs'/f'{name}.stderr.txt').write_text(p.stderr)
 row={'name':name,'started_at':start,'finished_at':end,'duration_seconds':round(time.monotonic()-t,3),'cwd':str(cwd),'argv':list(map(str,argv)),'command':shlex.join(list(map(str,argv))),'exit_code':p.returncode,'stdout':f'logs/{name}.stdout.txt','stderr':f'logs/{name}.stderr.txt'}
 commands.append(row)
 with(root/'terminal-transcript.txt').open('a')as f:f.write(f'\n[{start}] cwd={cwd}\n$ {row["command"]}\n'+p.stdout+('\n[stderr]\n'+p.stderr if p.stderr else '')+f'\n[{end}] exit={p.returncode}\n')
 assert p.returncode==0,(name,p.stderr)
 return p.stdout
def read(name):return json.loads((root/'logs'/f'{name}.stdout.txt').read_text())
install=read('14-external-installation');runtime=Path(install['runtime']);py='/Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python'
status=run('30-final-working-tree',['git','status','--porcelain=v1','--untracked-files=all'])
assert all(line.startswith('?? demo/phase-02-installation/')for line in status.splitlines())
assert status
run('31-diff-whitespace',['git','diff','--check'])
run('32-tracked-diff',['git','diff','--exit-code','2f9578a04bd43aac788441e1407058a7532c8148','--'])
run('33-original-before-hashes',['node','scripts/verify-before.mjs','--source'])
current=json.loads(run('34-current-preflight',[py,'-B',str(runtime/'orchestrator/scripts/adoption.py'),'--project',str(project),'--runtime',str(runtime),'--skill-root','/Users/davidkrzystek/.agents/skills']))
assert current['ready'] and not current['baseline_ready']
assert [d['code']for d in current['diagnostics']]==['W_ADOPTION_DIRTY']
run('35-source-checkout',['git','status','--porcelain=v1'],Path('/Users/davidkrzystek/Development/Interview/Alza'))
assert not (root/'logs/35-source-checkout.stdout.txt').read_text()
for name in ['capture-application.mjs','capture-command-screenshots.mjs']:
 run('36-syntax-'+name,['node','--check',str(root/'metadata/tools'/name)])
for file in(root/'metadata/tools').glob('*.py'):compile(file.read_text(),str(file),'exec')
media={}
for path in sorted((root/'recordings').glob('*')):
 raw=run('37-media-'+path.stem+path.suffix.replace('.','-'),['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','json',str(path)])
 data=json.loads(raw);assert data['streams'][0]['width']==1920 and data['streams'][0]['height']==1080
 media[path.relative_to(root).as_posix()]=data
(root/'metadata/media.json').write_text(json.dumps(media,indent=2)+'\n')
for path in(root/'screenshots').glob('*.png'):
 raw=path.read_bytes();assert raw[:8]==b'\x89PNG\r\n\x1a\n';assert struct.unpack('>II',raw[16:24])==(1920,1080)
preservation=json.loads((root/'metadata/preservation.json').read_text())
for name,item in preservation['files'].items():assert hashlib.sha256((project/name).read_bytes()).hexdigest()==item['sha256']
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=project,text=True).strip()==preservation['baseline_revision']
assert subprocess.check_output(['git','rev-parse','refs/tags/baseline-crud'],cwd=project,text=True).strip()==preservation['baseline_tag_object']
assert not(project/'requirements').exists() and not(project/'qa').exists()
results={}
for phase,name in [('before','11-tests-before'),('after','19-tests-after')]:
 row=next(c for c in commands if c['name']==name);assert row['exit_code']==0
 log=(root/row['stdout']).read_text()
 counts=list(map(int,re.findall(r'ℹ tests (\d+)',log)));passed=list(map(int,re.findall(r'ℹ pass (\d+)',log)));fails=list(map(int,re.findall(r'ℹ fail (\d+)',log)))
 assert counts==passed==[15,5] and fails==[0,0]
 browser=json.loads((root/f'metadata/browser-results-{phase}.json').read_text())['stats']
 assert browser['expected']==22 and browser['unexpected']==browser['flaky']==browser['skipped']==0
 results[phase]={'unit':15,'integration':5,'real_browser':22,'total_passed':42,'failures':0,'skipped':0,'exit_code':0,'command':'npm test','evidence':row['stdout']}
(root/'commands.jsonl').write_text(''.join(json.dumps(c)+'\n'for c in commands))
(root/'metadata/commands.json').write_text(json.dumps(commands,indent=2)+'\n')
# Inspect text captures for common credential token formats without disclosing matching text.
for path in root.rglob('*'):
 if path.is_file() and path.suffix in('.json','.jsonl','.txt','.md','.py','.mjs','.yaml'):
  text=path.read_text()
  assert not re.search(r'(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{35,}|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----)',text),f'Potential credential in {path.name}; inspect privately.'
files={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(root.rglob('*'))if p.is_file()and p not in[root/'metadata/manifest.json',root/'checksums.sha256']}
manifest={'schema_version':1,'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'project':str(project),'baseline_commit':preservation['baseline_revision'],'baseline_tag':'baseline-crud','baseline_tag_object':preservation['baseline_tag_object'],'runtime_revision':install['source_revision'],'runtime_path':install['runtime'],'runtime_snapshot_digest':install['snapshot_digest'],'preview':install['preview'],'registration_path':install['registration']+'/SKILL.md','environment':json.loads((root/'metadata/environment.json').read_text()),'domain_skills':install['environment']['skills'],'templates':install['environment']['templates'],'preflight':{'before':read('12-adoption-preflight'),'after_install_before_evidence':read('16-installed-preflight'),'final_with_untracked_evidence':current},'commands':commands,'tests':results,'verification':{'runtime_integrity':read('15-runtime-verification')['ok'],'cli_discovery':json.loads((root/'metadata/codex-discovery.json').read_text())['verified'],'read_only_model_invocation':json.loads((root/'metadata/codex-model-result.json').read_text())['completed'],'ide_visual_discovery':'not performed','all_51_baseline_files_unchanged':True,'baseline_tag_unchanged':True,'orchestrator_clean':True,'discovery_created':False,'due_dates_implemented':False,'staged':False,'committed':False,'pushed':False},'capture':{'resolution':[1920,1080],'terminal_method':'authentic timestamped transcript and labelled JSON-output-excerpt screenshots; no native terminal video captured','application_method':'actual Playwright browser screenshots and recordings, API-seeded fictional fixture, temporary SQLite DB, real UI actions','media':media},'files':files}
(root/'metadata/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
allfiles={**files,'metadata/manifest.json':hashlib.sha256((root/'metadata/manifest.json').read_bytes()).hexdigest()}
(root/'checksums.sha256').write_text(''.join(f'{digest}  demo/phase-02-installation/{name}\n'for name,digest in sorted(allfiles.items())))
print(json.dumps({'ready':True,'files_inventoried':len(allfiles),'before_tests':42,'after_tests':42,'current_diagnostics':[d['code']for d in current['diagnostics']],'media':{k:v['format']['duration']for k,v in media.items()}},indent=2))
