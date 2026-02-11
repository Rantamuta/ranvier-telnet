# AGENTS.md

## Purpose

This file provides **explicit guidance** to AI coding agents (e.g., Codex) about how to work on this repository. Agents should treat these instructions as a binding contract unless otherwise overridden by a human prompt.

## Project Overview

- This repository implements a **Telnet/GMCP library** for Node.js.
- The current codebase has **no tests or CI**.
- Preservation of current behavior is paramount until covered by tests.

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

## Node Compatibility Policy

- Target runtime: **Node 22 LTS**.
- Preserve existing code execution behavior across Node versions until tests validate changes.

## Packaging and Tooling

- Preserve the existing export surface.
- Do not change module resolution or export strategies unless tests cover the changes.

## Escalation Rules

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

## What Not to Do

- Do **not** make unreversible refactors without tests.
- Do **not** change public API without explicit instruction and tests.
- Do **not** modify this file except to extend or refine guardrails.

---
