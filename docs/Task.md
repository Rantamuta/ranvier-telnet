# Task prompt

You are a ranvier-telnet maintainer for this repository. Follow AGENTS.md strictly.

Reference documents:

- AGENTS.md (governance and constraints)
- README.md (v1.0 Checklist)
- docs/ComplexityScale.md (task sizing rules)
- docs/CHANGELOG_POLICY.md (changelog rules)

Goal
Advance the v1.0 Checklist by addressing exactly ONE unchecked item, or by decomposing it if it is not atomic. The scope is stabilization and modernization only; no new features or behavior changes unless the checklist item explicitly calls for it and tests cover it.

Phase 0 — Select task

- Choose one unchecked checklist item with the best impact-to-effort ratio under maintenance constraints.
- Quote the checklist item verbatim.
- Do not change any code in this phase.

Phase 0.01 — Restate the task (goal confirmation)

- Restate the selected checklist item in your own words as a concrete, testable goal.
- Include:
  - what must be true when the task is complete
  - what is explicitly out of scope
- Limit to 2–3 sentences.

Do not propose solutions or plans yet.

Phase 0.02 — Define the invariant (mandatory)

Invariant:

- One sentence describing the property that must always hold when this task is complete.

Acceptable approximations:

- Exactly 2–3 bullets describing what this task intentionally covers.

Unacceptable outcomes:

- Exactly 2–3 bullets describing false positives or negatives this task must NOT introduce.

Do not propose implementation yet.

Phase 0.3 — Size the task (mandatory gate)
Using ComplexityScale.md:

- Assign a complexity score (Fibonacci: 1, 2, 3, 5, 8, 13, 21).
- Classify the task as:
  - Atomic (≤ 8), or
  - Epic (≥ 13).
- Provide a one-sentence justification referencing:
  - number of files/subsystems touched
  - verification complexity
  - behavior risk

Rules:

- Tasks scored 13 or higher MUST be decomposed.
- Do not proceed to implementation planning for Epic tasks.

If Epic:

- Propose a breakdown into 3–8 atomic checklist items.
- For each subtask:
  - one-sentence description
  - expected complexity score
  - exact “done when” condition
  - primary verification command
- Recommend which subtask should be tackled first and why.
- STOP for human review.

If Atomic:

- Proceed to Phase 1.

Phase 1 — Audit (no edits)

- Identify the minimal set of files and paths involved.
- Describe current behavior with references to file paths and functions.
- Typical files include: index.js, README.md, package.json, test/*, and any CI workflow files.
- List explicit constraints (what must not change).
- Public exports and event semantics must remain unchanged unless the checklist item explicitly allows change.
- List unknowns that must be resolved by tests rather than assumptions.

Do not propose changes yet.

Phase 2 — Plan (least intrusive)

- Propose the least intrusive plan that satisfies the checklist item.
- No refactors unless they are behavior-preserving and test-locked.
- Break the plan into ordered steps.
- For each step:
  - files touched
  - expected behavior impact: none | guarded | potential
  - verification command(s)

Include a rollback plan.

Phase 3 — Pre-mortem

- List the top 3 plausible failure modes or accidental behavior changes.
- For each, explain how the plan and tests detect or prevent it.

STOP for human review after Phases 0–3.

Phase 4 — Implement tests/tooling only
After approval:

- Implement only tests, CI, or tooling needed to lock in current behavior.
- Do not implement functional changes yet.
- Ensure:
  - `npm test` passes
  - `npm run ci:local` passes
STOP for human review.

Phase 5 — Implement the change
After approval:

- First step: MUST update the selected README checklist item to [x] (unless the approver explicitly defers it).
- Implement the planned change in minimal commits (one logical change per commit).
- Ensure:
  - `npm test` passes
  - `npm run ci:local` passes

Phase 6 — Final report

- Summarize what changed (3 bullets max).
- Provide exact verification commands.
- State the checklist item status update.
- List any follow-up TODOs discovered (do not act on them).
- Review docs/CHANGELOG_POLICY.md and add a CHANGELOG.md entry if warranted by the policy.
