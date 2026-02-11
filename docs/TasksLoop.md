# Task Loop: Implement Rantamuta 1.0 (Unattended, Sequential, Commit-Gated)

You are a datasource-file maintainer for this repository. Follow `AGENTS.md` strictly.

Reference documents:

- `AGENTS.md`
- `docs/Task.md`
- `README.md` section "## Rantamuta 1.0 Maintenance Checklist"
- `docs/ComplexityScale.md`
- `docs/CHANGELOG_POLICY.md`

Goal:
Fully implement Rantamuta 1.0 by completing all unchecked checklist items under `README.md` → "## Rantamuta 1.0 Maintenance Checklist", sequentially, without human review pauses.

Global invariant:

No behavior changes unless required for Node 22+ modernization. Prefer documentation, tests, and tooling over runtime code changes.

---

## Execution Model

- Work checklist items in order, top to bottom.
- Do NOT pick randomly.
- Do NOT skip items.
- Complete exactly one checklist item at a time.
- After completing one item fully, mark it `[x]` in README.
- Continue until all Rantamuta 1.0 checklist items are complete.
- Then stop.

There are NO human review pauses.

Instead, enforce commit gates as described below.

---

## Per-Checklist-Item Workflow

For EACH unchecked checklist item, execute Phases 0–6 in `docs/Task.md` without pausing for review.

Commit gates:

- If a phase does not change files, do NOT commit.
- If a phase changes files, run `git add -A` and commit immediately after that phase.
- Commit message format: `<full checklist item text>: Phase X` (e.g., `Add CI (GitHub Actions) to run tests/lint on push/PR: Phase 4A`).
- Use the exact checklist item text as written in `README.md`.
- If a checklist item is Epic, decompose it per `docs/Task.md` and continue with the first atomic subtask while preserving the original item as the parent context.

Testing gates:

- After Phase 4 and Phase 5, run `npm test` and `npm run ci:local`.
- If tests fail due to changes introduced in the current task, fix the code and re-run tests.
- After a good-faith attempt, if tests still fail, STOP and await further instructions.

Changelog gates:

- In Phase 6, review `docs/CHANGELOG_POLICY.md` and add a `CHANGELOG.md` entry if warranted.
- Insert newest entries immediately under `## Unreleased` in reverse chronological order.

---

## Loop Rule

After completing one checklist item:

- Move to the next unchecked item in order.
- Repeat the full workflow.
- Continue until no unchecked items remain under "## Rantamuta 1.0 Maintenance Checklist".

---

## Completion Condition

When all checklist items under "## Rantamuta 1.0 Maintenance Checklist" are checked:

- Verify `npm test` passes.
- Verify `npm run ci:local` passes.
- Provide a final summary of completed items and any blockers.

Then STOP.

---

## Hard Constraints

- Do not change behavior unless required for Node 22+ modernization.
- Do not refactor unrelated code.
- Keep changes minimal and mechanically justified.
- Prefer documentation and tests over code changes.
