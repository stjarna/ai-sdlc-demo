import sys,subprocess,json,datetime,shlex,time
from pathlib import Path
root=Path(__file__).parent/'evidence';(root/'logs').mkdir(parents=True,exist_ok=True)
name=sys.argv[1];cwd=sys.argv[2];argv=sys.argv[3:]
start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
r=subprocess.run(argv,cwd=cwd,capture_output=True,text=True)
end=datetime.datetime.now(datetime.timezone.utc).isoformat()
(root/'logs'/f'{name}.stdout.txt').write_text(r.stdout)
(root/'logs'/f'{name}.stderr.txt').write_text(r.stderr)
entry=dict(name=name,started_at=start,finished_at=end,duration_seconds=round(time.monotonic()-t,3),cwd=cwd,argv=argv,command=shlex.join(argv),exit_code=r.returncode,stdout=f'logs/{name}.stdout.txt',stderr=f'logs/{name}.stderr.txt')
with (root/'commands.jsonl').open('a') as f:f.write(json.dumps(entry)+'\n')
with (root/'terminal-transcript.txt').open('a') as f:f.write(f'\n[{start}] cwd={cwd}\n$ {entry["command"]}\n'+r.stdout+('\n[stderr]\n'+r.stderr if r.stderr else '')+f'\n[{end}] exit={r.returncode}\n')
print(json.dumps(entry));print(r.stdout);print(r.stderr,file=sys.stderr)
sys.exit(r.returncode)
