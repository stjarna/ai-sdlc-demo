# Phase 02 — External SDLC installation

**Ready for a future governed change request: yes.** Installation, local Codex discovery and a read-only model interaction succeeded. No Discovery request, requirement, approval, work track or due-date functionality was created. Stop for human review.

## Application baseline and preservation

- Project: /Users/davidkrzystek/Development/Interview/ai-sdlc-demo
- Branch: main. HEAD and annotated baseline-crud target: 2f9578a04bd43aac788441e1407058a7532c8148.
- Tag object: 0d70b45339a407dcc0924a0128b061e1bf682fad; unchanged after installation.
- Remote: git@github.com:stjarna/ai-sdlc-demo.git.
- Initial and post-install/pre-capture working trees were clean. The origin/main [gone] annotation reflects the unpublished local initial commit, not a deleted local baseline.
- Git integrity check passed. All 51 tracked baseline files match their original Git bytes, including original BEFORE media and test evidence. See [preservation inventory](metadata/preservation.json).
- Actual task API fields remain id, title, description, completed; browser checks found no date inputs. Unchanged application source/schema contains no due-date implementation.

## Installed runtime and pins

- Source: /Users/davidkrzystek/Development/Interview/Alza; clean before and after.
- Committed revision: d058e5fad9fd8459068951f0dea19dbfabba5fd6; preview false.
- Runtime: /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f
- Snapshot digest: 64a774d6980d081f67ef7e99d4e7639443f0f7f821f155a14ed60a9f55b5934a
- Registration: /Users/davidkrzystek/.agents/skills/sdlc/SKILL.md
- Permanent Python environment: /Users/davidkrzystek/.local/share/ai-sdlc/venv; Python 3.13.7, PyYAML 6.0.3.
- Architecture, Development and Testing pins: 1.3.0; Security: 1.2.0. All 11 templates: 1.0.0. Exact package/content digests and validation contracts are retained in installer output and catalog snapshots.

The existing documented installer published committed bytes externally and created the thin user loader without replacing another registration. Runtime resources, historical domain versions, templates and docs remain together. No runtime, loader or project instructions were copied into Littlelist. Metadata includes only copies of public registration/manifests/catalogs for evidence, not an executable runtime installation.

## Preflight findings

Initial read-only preflight exited 0: ok, ready and baseline_ready true. No namespace conflicts, source symlinks, output-directory hazards or project instruction conflicts were reported. Two expected warnings: W_ADOPTION_UNREGISTERED and W_ADOPTION_SKILL_MISSING.

Installed-runtime preflight exited 0 with **no diagnostics**, ready true and baseline_ready true. Python requirements, resource links, domain pins and template integrity passed. Complete outputs: logs/12-adoption-preflight.* and logs/16-installed-preflight.*.

The final presentation directory intentionally makes the working tree dirty; it is the only new directory. Evidence participates in future source fingerprints. Review/freeze it before governed implementation approvals; use existing reviewed execution-evidence paths later. No source exclusion was added. No clean final tree is claimed.

## Codex verification boundaries

| Check | Observed result |
| --- | --- |
| Registration/integrity | Loader matches installer manifest; exact runtime digest/environment verification exited 0 |
| CLI discovery | Actual Codex app-server skills/list for Littlelist, force reload: one enabled user-scoped sdlc at the expected path; no discovery errors |
| Model interaction | Actual ephemeral read-only Codex invocation of $sdlc loaded the loader, executed its runtime verification, read shared instructions and listed operations |
| IDE discovery | **Not visually tested** in an IDE; standard user registration is installed |

See [discovery response](metadata/codex-discovery.json), [model result](metadata/codex-model-result.json), app-server protocol and model event logs (with explicitly documented privacy redactions in metadata/privacy-review.json). No local identity profile was read or copied. Skill availability implies no business approval or authorization to start work.

Official references: [skill discovery/invocation](https://learn.chatgpt.com/docs/build-skills), [app-server skills/list](https://learn.chatgpt.com/docs/app-server). These establish the mechanism; actual local results above establish acceptance evidence.

## Actual tests and application checks

| Suite | Before installation | After installation |
| --- | --- | --- |
| Unit | 15 passed | 15 passed |
| HTTP integration | 5 passed | 5 passed |
| Chromium desktop/mobile | 22 passed | 22 passed |
| Total | **42 passed** | **42 passed** |

Both complete npm test commands exited 0, with zero failures/skips and no retries. Raw stdout/stderr: logs/11-tests-before.* and logs/19-tests-after.*; browser JSON reports: metadata/browser-results-before.json and browser-results-after.json. Integration/browser tests actually restart server processes and verify retained tasks/completion. SQLite persistence was executed, not inferred from screenshots. Additional UI captures show live creation/completion before and after installation using isolated temporary databases.

## Presentation evidence and capture limitations

Six screenshots are 1920×1080. Two original real-browser WebM recordings and MP4 transcodes are in recordings/. The app walkthroughs hold approximately 2.5 seconds between actions. Fictional fixture tasks were inserted through the actual API; recorded creation/completion used the actual UI. Exact media durations/codecs are in metadata/media.json.

**Terminal fallback:** no native terminal screen video was captured in this automation session. Instead, terminal-transcript.txt preserves authentic UTC timestamps, commands, stdout/stderr and exit codes. metadata/commands.json retains exact argv, cwd and timings. Four command screenshots are explicitly labelled **recorded-output excerpts**, rendered from actual JSON responses, not live terminal screenshots. No typing animation or fabricated installation interaction is provided. The storyboard uses readable stills for terminal steps. This is the presentation limitation, not a failed installation check.

Evidence was initially spooled outside the repository to preserve a clean preflight, then copied here. Historical commands/reports retain actual temporary paths and ports; those are execution context, not future runtime dependencies. All final evidence and helper source are now permanent. No recording is claimed for the IDE. No final presentation video was assembled.

## Exact installation and reproduction

The complete executed commands, exit codes and output paths are in [commands.json](metadata/commands.json). Installation command:

    /Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python -B /Users/davidkrzystek/Development/Interview/Alza/orchestrator/scripts/install.py install --source /Users/davidkrzystek/Development/Interview/Alza --revision d058e5fad9fd8459068951f0dea19dbfabba5fd6 --project /Users/davidkrzystek/Development/Interview/ai-sdlc-demo --python /Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python

No preview flag was used. An identical retry verifies/reuses the registration. Never remove or overwrite another skill for filming.

Read-only rechecks from the application root:

    /Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python -B /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f/orchestrator/scripts/install.py verify --runtime /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f --expected-digest 64a774d6980d081f67ef7e99d4e7639443f0f7f821f155a14ed60a9f55b5934a --skill-root /Users/davidkrzystek/.agents/skills
    /Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python -B /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f/orchestrator/scripts/adoption.py --project /Users/davidkrzystek/Development/Interview/ai-sdlc-demo --runtime /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f --skill-root /Users/davidkrzystek/.agents/skills
    npm test
    node scripts/verify-before.mjs --source
    shasum -a 256 -c demo/phase-02-installation/checksums.sha256

Preflight now reports the expected dirty-evidence warning until human-reviewed persistence. For another authorized capture, use a new output directory: metadata/tools/capture-application.mjs takes PROJECT OUTPUT before-or-after; discover.py takes OUTPUT PROJECT and makes only a local discovery query. Preserve frozen evidence; helpers are the actual capture source, not application code. npm start still runs Littlelist on port 3000 without any SDLC service.

## Remaining limitations and scope

- IDE visual discovery is unverified. Reload/restart discovery if needed; the skill should be available on the next conversation turn.
- Codex emitted unrelated plugin-icon path and session-state fallback warnings. They remain in stderr; discovery and model verification succeeded. No host/plugin configuration was repaired.
- Local pins are integrity checks, not authenticated identity. External runtime and permanent interpreter must remain available.
- No source, historical evidence or tags were changed. No staging, commits or pushes. Only this evidence directory is new.
- No Due Dates phase has started. Wait for human review.

## Pre-commit privacy review

The original capture hashes were verified before review. The raw discovery protocol log then received limited, documented privacy redactions: local hostname and host installation identifier were replaced, and unrelated discovered skills were omitted. The SDLC discovery entry is unchanged. metadata/privacy-review.json records the original and redacted digests; the manifest and checksums describe the reviewed package. This protocol log is therefore an explicitly redacted capture, not a claim of complete unmodified host output. Runtime/project paths, tool versions and temporary capture paths remain intentionally for reproducibility. No credentials or local identity profiles are included. The earlier dirty-tree statements describe capture time; this package is now approved for a local evidence commit.
