# Code Crime Scene — Project Status

## Completed
- Preserved the six original case IDs and added fourteen advanced missions (20 total).
- Kept the cinematic React UI, local notebook keys, navigation, catalog-driven XP, and backend case API.
- Added authored traces, evidence selection, a basic test lab, and regression coverage for all catalog entries.

## Current milestone
- All 20 catalog cases have controlled repair fixtures, authored traces, two-clue requirements, and explanation coverage in the regression suite.
- `CCS-101` uses a deterministic transaction simulator, `CCS-102` uses a seeded read-only `sql.js` fixture, and `CCS-103` uses deterministic retrieval checks.
- Version 2 progress archives pre-upgrade solved IDs in `legacySolvedCases`; upgraded cases require a new verified completion.
- Case reports produce Bronze, Silver, or Gold ratings from hints and attempts; TRACE adapts to investigation stage without claiming a generative AI connection.
- Restored the missing Field Guide and Achievements routes after a user-side merge referenced components that were not present on disk.
- Integrated the supplied cinematic kit as the rendered root landing page; it uses the real 20-case catalog and local progress, while `/dashboard` remains a compatibility route to Command Center.

## Architecture decisions
- Learner code never runs in Express, Node `vm`, `eval`, or a shell.
- SQL uses a fictional in-memory `sql.js` fixture; unsafe domains use explicit deterministic simulators.
- Local browser storage remains the primary progress store; legacy progress is retained rather than reset.

## Last verified
- Frontend regression suite: 64 passing checks.
- Frontend lint and production build: passing after cinematic-kit integration.
- Local Vite routes `/`, `/dashboard`, `/cases`, and `/case/CCS-101`: HTTP 200.
- Backend catalog: 20 case records with authored traces.

## Pending
- Visual QA in a real browser against the supplied cinematic reference and a deliberate commit/push when approved.
