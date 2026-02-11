## Unreleased

### Drift / Modernization
- Summary: Node 22 LTS requirement, CI added, tooling upgrades (ESLint 10, official Mocha, glob override), and documentation updates (API, compatibility, GMCP semantics).
- Why: Stabilize and modernize the telnet library for the v1.0 checklist.
- Impact: Development and CI now assume Node 22; linting/tooling behavior updated; no runtime API changes.
- Migration/Action: Use Node 22 LTS and rerun `npm ci` to refresh dependencies.
- References: v1.0 checklist completion commits on 2026-02-11.
- Timestamp: 2026.02.11 15:25
