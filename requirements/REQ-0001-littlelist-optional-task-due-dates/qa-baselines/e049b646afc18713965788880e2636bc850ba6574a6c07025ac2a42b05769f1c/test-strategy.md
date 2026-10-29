# Test Strategy — REQ-0001

## Authority and scope

AI-authored QA draft from approved Functional Analysis baseline 63329d63c760e41f166e1b99d277534aeb8063e3469e7383a26e45ce4ad5e649 and explicit advancement faa97785-1068-4c72-9d78-e3683828ed05. The approved Business dependency is retained through that baseline. Testing skill 1.3.0, digest 86975e0917f3db19923051aeee52c367b1b5c9ceac62985190cd4a2f0594de1f. Product expectations derive only from approved FR/AC items; no Technical Design, implementation plan or prototype supplies expected outcomes. Scope: all 7 FRs and 15 ACs, local single-user Littlelist due dates and existing CRUD compatibility. No inherited unresolved items, excluded approved requirements or prototype limitations exist in this Analysis.

## Test approach

Engineering owns unit/build checks. QA will later prepare separately approved integration and real-browser UI automation; no checks have run at this design stage. Keep exact Analysis and case links, controlled data and observable assertions. Cover positive, negative, boundary and regression paths: optional/mutable dates, chronological permission, impossible dates, local-calendar/timezone stability, overdue boundaries, completion, autosave/cancel, real process restart and original undated records.

Use isolated databases and deterministic device-local clocks; test past/today/future without converting the product rule to UTC. Include desktop and phone layouts consistent with Littlelist. HTTP-only checks do not count as UI evidence; real browser actions must assert visible states. Preserve failed output, source-bound results and defects. Baseline CRUD tests are regression context, not evidence that the unimplemented feature passes.

After scenario approval, require separate advancement, approved Design interfaces, authorized QA automation preparation under qa/, separate automation approval, reviewed Engineering implementation and execution readiness before runs. No dependency installation, automation coding, Engineering edits or lifecycle advancement is authorized by this draft.

## Coverage and unresolved items

All 22 active FR/AC items have planned scenario coverage; 23 specified scenarios, none executed. Structured coverage disposition implemented means specified scenario coverage, not implemented automation or passed tests. No blocked, excluded or unresolved items; no authorized limitations. A new upstream Analysis cycle requires explicit impact reconciliation.

## Risks

<!-- Optional section; omit when not applicable. -->

The main risks are unsupported past-date rejection, timezone day shifts, midnight/year-boundary errors, invalid drafts overwriting saved values, autosave races, lost legacy records and false UI-test claims. Cases explicitly challenge these risks. Concrete API/selector/runner details await approved Design interfaces; this is an automation dependency, not an unresolved business requirement. Qualitative UI consistency requires real visual inspection alongside browser assertions; no external accessibility certification is claimed.
