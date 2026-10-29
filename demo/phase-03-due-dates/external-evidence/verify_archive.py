"""Read-only integrity check; no SDLC/Git mutation and no external dependencies."""
from pathlib import Path
import hashlib,json,sys
root=Path(__file__).resolve().parents[3]
manifest=json.loads(Path(__file__).with_name('inventory.json').read_text())
checked=0;originals=0
for row in manifest['files']:
    if row['storage']=='excluded-retained-external':
        continue
    path=(root/row['relative_archive_destination']).resolve()
    assert path.is_relative_to(root) and path.is_file(),row['relative_archive_destination']
    raw=path.read_bytes()
    assert len(raw)==row['size_bytes'] and hashlib.sha256(raw).hexdigest()==row['sha256'],str(path)
    checked+=1
    if '--compare-originals' in sys.argv:
        original=Path(row['original_absolute_path'])
        assert original.is_file() and original.read_bytes()==raw,str(original)
        originals+=1
print(json.dumps({'capture_records_verified':checked,'original_sources_compared':originals,'excluded_records':sum(r['storage']=='excluded-retained-external' for r in manifest['files'])}))
