# AGENTS.md

## Purpose

This file provides **explicit guidance** to AI coding agents (e.g., Codex) about how to work on this repository. Agents should treat these instructions as a binding contract unless otherwise overridden by a human prompt.

## Project Overview

- This repository implements a **Telnet/GMCP library** for Node.js.
- The repository has tests and CI; preservation of current behavior is paramount unless explicitly authorized by tests and a human prompt.

## Agent Role and Stance

Agents working in this repo must act as **senior maintainers**:

- Focus on **decision quality** and maintainability over speed or optimism.
- Prefer **explicit tradeoffs** and documented uncertainty over assumptions.
- Do **not** make sweeping changes; break changes into small, verifiable commits.
- Always preserve compatibility unless explicitly authorized to change it.

## Working Agreements

### Code Behavior

- Do **not** change code behavior unless:
  - There are **tests asserting current behavior**, and
  - The human prompt explicitly asks for behavior changes.
- If behavior is unclear:
  - Add a test that captures the *current* behavior first.
  - Document assumptions in code comments and commit messages.

### Tests

- Tests should use **Mocha** to maintain consistency with other Ranvier repos.
- Tests must assert actual behavior, even if the behavior seems undesirable.

### Commit Discipline

Agents must:

- Create **one logical change** per commit.
- Label commits clearly with purpose, risk, and rollback instructions.
- Keep commit messages human-readable and actionable.
- No drive-by refactors or formatting-only commits.
- Dependency, CI, or tooling changes must be isolated to their own commits.
- Each commit should be easy to revert independently.

### PR/Change Expectations

Every change submitted should include:

- What changed and *why*.
- How it was validated (test descriptions, edge cases).
- Known risks and rollback plan if applicable.

## Safety Rails (Before Behavioral Changes)

1. **Add CI** with a Node.js matrix v22 LTS.
2. **Add tests** covering current behavior.
3. Ensure tests are deterministic and pass in CI before any other changes.
4. Only after CI is green and tests exist should minor refactors or upgrades be proposed.

## Runtime compatibility policy

- Target runtime: **Node 22.13.0+ LTS**.
- CI should run on **Node 22.13.0+**.
- CommonJS remains the default module system.

## Public surface and compatibility guarantees

The following are **compatibility contracts**:

- Exported API surface (`Sequences`, `Options`, `TelnetSocket`, `TelnetServer`).
- Event names and argument shapes (`data`, `WILL/WONT/DO/DONT`, `SUBNEG`, `GMCP`, `unknownAction`).
- Telnet negotiation parsing and subnegotiation framing semantics.
- Socket lifecycle behaviors (`attach`, `write`, `end`, `destroy`) and `fresh` handling.

Do not change these unless explicitly authorized and tested.

## Package manager and install policy

- Use **npm**.
- CI must use `npm ci`.
- The lockfile is already at **lockfile v3** and must not be regenerated unless explicitly authorized.
- Do not change package manager or introduce alternates.

## What counts as a behavior change (compatibility-impacting)

Treat any externally observable change as a behavior change, including:

- exported symbols or event names
- event argument shapes or ordering
- telnet negotiation parsing or GMCP handling
- error vs non-error behavior during parsing
- logging output relied on by tooling or smoke tests

Assume compatibility matters unless explicitly instructed otherwise.

## Local CI parity policy

This repository must maintain a **local equivalent of CI** so changes are reproducible without relying on external systems.

- `npm test` **must always pass**.
- `npm run ci:local` **must exist** and **must always pass**
- GitHub Actions CI is the final gate, but agents must not claim CI is green unless they can directly observe it.

### CI change rule

If a PR or task changes GitHub Actions workflows or CI expectations:

- the same PR must update `ci:local` (and any underlying scripts) to mirror the change where possible
- if a CI step cannot be mirrored locally, the PR must explicitly document it as CI-only and explain why

### CI parity contract

`ci:local` must be a step-for-step mirror of `.github/workflows/ci.yml`.

- Each CI step must appear in `ci:local` in the same order and be functionally equivalent.
- If a CI step cannot be reproduced locally, the `ci:local` script must include an inline comment that names the CI step verbatim, explains why it is skipped, and notes any local substitute.

In the `ci:local` runner, annotate each step with `// CI: <step name>`. For skipped steps use `// CI: <step name> (SKIPPED)` and include a short reason on the next line.

### `ci:local` expectations

- agents must ensure `npm run ci:local` passes locally before stopping the current task.

## Required safety rails before risky changes

Before upgrading dependencies, changing runtime behavior, or touching boot logic:

- CI workflows must be syntactically valid and consistent with repo scripts.
- Deterministic installs via `npm ci` must be preserved.
- Ensure at least minimal coverage for:
  - boot on a clean clone
  - bundle loading
  - login flow or equivalent smoke test

Prefer a minimal smoke test over broad refactors.

## Modernization posture

This repository is in **maintenance mode**.

Default bias:

- document > test > guard > refactor
- configuration and tooling over code changes
- clarity and playability over elegance

Avoid:

- performance work without evidence
- speculative refactors
- “while we are here” improvements

## Pull request / change log expectations

Every PR must include:

- What changed and why
- How it was validated (local commands, CI, smoke test)
- Risks and rollback plan if applicable

User-visible changes, dependency removals, or security-motivated actions should be summarized clearly.

## Completion / stop rule

Stop work immediately when:

- all explicitly requested tasks or checklist items are complete
- `npm test` and `npm run ci:local` pass locally
- no new correctness issues are discovered in a final pass

Do not continue with “nice-to-have” improvements beyond the stated scope.

## Escalation rule for uncertainty

If behavior is unclear:

- Add a test that captures current behavior first, or
- Document the uncertainty explicitly in the PR description.
- Do **not** guess and move on.

If in doubt about any behavior or compatibility:

- Add a test to validate the existing behavior.
- Document the uncertainty in both the test and the change description.

## Test Commands for Agents

The project uses:

```sh
npm test
````

Agents should rely on this command for test execution in CI and local workflows.

## Commands

- **Install dependencies**: `npm ci`
- **Run tests**: `npm test`
- **Run local CI**: `npm run ci:local`

## What Not to Do

- Do **not** make unreversible refactors without tests.
- Do **not** change public API without explicit instruction and tests.
- Do **not** modify this file except to extend or refine guardrails.

---
