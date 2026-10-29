# Installation segment — 30-second edit plan

Proposed storyboard only; no assembled video. Use normal-speed app footage and readable still holds. Command stills are labelled output excerpts; do not imply filmed typing or an IDE interaction.

| Presentation time | Actual source | Scene / narration |
| --- | --- | --- |
| 0:00–0:05 | recordings/before-littlelist.mp4, approximately 0:00–0:05; clean screenshots/before-littlelist.png | “Start with a working, independently tested CRUD app.” |
| 0:05–0:12 | Hold screenshots/02-adoption-preflight.png | “Read-only preflight checks compatibility without changing source.” Actual preflight: 14:36:13.882–14:36:14.305 UTC, exit 0. |
| 0:12–0:17 | Hold screenshots/03-external-installation.png | “Install the approved, pinned runtime outside the application.” Actual installation: 14:37:13.582–14:37:14.163 UTC, exit 0. |
| 0:17–0:20 | Hold screenshots/04-runtime-verification.png | “Verify resources, dependencies, skill versions and templates.” Actual verification: 14:37:23.396–14:37:23.584 UTC. |
| 0:20–0:26 | Hold screenshots/05-codex-discovery.png | “Codex discovers the skill. A real read-only model turn also loads and verifies it.” Actual discovery: 14:37:24.011–14:37:24.712 UTC. |
| 0:26–0:30 | recordings/after-littlelist.mp4, approximately 0:00–0:04; screenshots/after-littlelist.png | “The app still works. All 42 tests pass again. Ready for a governed change.” |

The separate real model turn ran 14:37:43.473–14:38:15.975 UTC; complete events and actual response are preserved in logs/18-codex-model-inspection.*. Do not imply that it took six seconds or claim IDE visual discovery. No speed-up is needed: the command scenes use static evidence holds.

Both browser originals are 1920×1080 with approximately 2.5-second pauses between real actions; exact durations/codecs are in metadata/media.json. Command screenshots retain actual results and a clear excerpt label. Initial preflight warnings are expected and resolved by installation; do not crop them to imply a warning-free initial state. Installed preflight has no diagnostics in its full output.

Best hero shot: screenshots/before-littlelist.png. Strongest installation evidence: screenshots/03-external-installation.png. Discovery evidence: screenshots/05-codex-discovery.png. Do not assemble the final video or begin a product request during this phase.
