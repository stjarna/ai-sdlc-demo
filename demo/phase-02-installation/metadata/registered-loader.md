---
name: sdlc
description: Guide existing applications through Discovery, human approvals, Functional Analysis and governed Engineering and QA using a pinned external SDLC runtime.
---

# Installed AI SDLC Assistant

Before operating, run this read-only integrity and environment check:

```sh
/Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python -B /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f/orchestrator/scripts/install.py verify --runtime /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f --expected-digest 64a774d6980d081f67ef7e99d4e7639443f0f7f821f155a14ed60a9f55b5934a
```

If verification fails, stop and report the diagnostic. Never install, upgrade or repair silently.
Then read and follow [d058e5fad9fd-64a774d6980d081f shared workflow](</Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f/orchestrator/skill/SKILL.md>).
Resolve every further resource from that canonical package location.
Use the current application repository as the explicit target project, never the runtime directory.
For first adoption, run `/Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python -B /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f/orchestrator/scripts/sdlc.py --project APPLICATION adoption-preflight`; resolve errors before `new`.
Keep existing project instructions, source, tests and Git history intact. Do not copy package AGENTS.md into the application.
Use `/Users/davidkrzystek/.local/share/ai-sdlc/venv/bin/python -B /Users/davidkrzystek/.local/share/ai-sdlc/runtimes/d058e5fad9fd-64a774d6980d081f/orchestrator/scripts/sdlc.py` for deterministic operations. Technical arguments stay internal to the assistant.
Codex CLI and IDE invocation is `$sdlc <command>` or `/skills`; natural language is also supported.
Approval, advancement, assignment and starting work remain separate human decisions.
Runtime base Git revision: d058e5fad9fd8459068951f0dea19dbfabba5fd6; preview: false.
Exact runtime snapshot: 64a774d6980d081f67ef7e99d4e7639443f0f7f821f155a14ed60a9f55b5934a.
This local pin detects changes; it is not a signature or authenticated authorization.
