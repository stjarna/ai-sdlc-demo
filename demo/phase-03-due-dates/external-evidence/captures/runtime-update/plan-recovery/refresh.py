from recover import *
from copy import deepcopy
review=run('before-refresh',['engineering-review','REQ-0001'])['engineering'];assert review['stage']=='implementation_planning'
prior=json.loads((out/'before-review.json').read_text())['engineering']['drafts']['plan']
payload={k:deepcopy(v) for k,v in prior['payload'].items() if k!='_request'}
needle='## Tasks\n'
note=('This is an AI-authored refresh following David Krzystek’s explicit feedback: “Refresh the Implementation Plan against the current project fingerprint. Business requirements and Technical Design remain unchanged.” The previous Plan and its approvals remain immutable historical evidence; they do not authorize this refreshed revision. The five task definitions, dependencies, allowed paths, FR/AC coverage, unit/build commands, exclusions and absence of prototype limitations are unchanged.\n\n'
      f'Current inspected project fingerprint: {review["source_revision"]}. Existing application source, active tests, package/lock files and build configuration remain unchanged from the CRUD baseline; the current fingerprint also includes the frozen supplemental presentation evidence already present in the project. No presentation paths are excluded from source integrity checks. Keep all new presentation captures outside the application repository throughout planning, approval and execution. This refresh does not approve the Plan, advance the lifecycle or start Development.\n\n')
payload['content']=payload['content'].replace(needle,note+needle,1)
old='Supplemental presentation captures participate in source fingerprints. Finish/freeze them before code-review and execution binding; capture later events from authoritative audit records or stage them externally until a safe final collection. Test outputs belong under reviewed Epic evidence or ignored dependency caches/temporary storage, never an unchecked source exclusion. No Git actions are automatic.'
new='Existing in-repository supplemental presentation captures are frozen and remain part of the source fingerprint. Keep every new supplemental presentation capture outside the Littlelist repository, including captures of Plan approval, advancement and start. Do not collect them back into the project while source-bound gates are active. Governed execution evidence is persisted through the supported CLI; other test outputs must follow the reviewed check and use isolated temporary storage. No new source exclusions or Git actions are authorized.'
assert old in payload['content'];payload['content']=payload['content'].replace(old,new)
for k in payload:
 if k!='content':assert payload[k]==prior['payload'][k],k
inputfile=out/'refreshed-plan-input.json';inputfile.write_text(json.dumps(payload,indent=2)+'\n')
template=json.loads((out/'template.json').read_text())['templates']['pin'];assert template==prior['template']
result=run('write-refreshed-plan',['engineering-write','REQ-0001','--kind','plan','--expected-engineering-revision',review['revision'],'--operation-id',str(uuid.uuid4()),'--decision','AI-assisted refresh explicitly requested by David Krzystek; preserve business requirements, approved Design, task scope and checks; bind to current project fingerprint and keep new presentation capture external. Not approval or advancement.','--expected-template-digest',template['digest'],'--input-file',str(inputfile)])
after=run('after-refresh',['engineering-review','REQ-0001'])['engineering'];assert after['stage']=='implementation_planning' and not after['approvals']['plan']['valid']
assert after['drafts']['plan']['baseline_id']!=prior['baseline_id']
print(json.dumps({'stage':after['stage'],'approvals':after['approvals'],'document':after['drafts']['plan']['document'],'template':after['drafts']['plan']['template']},indent=2))
