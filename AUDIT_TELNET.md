# Ranvier Telnet Audit (Phase 0)

## Summary of Current State
- Single-module package with all runtime logic in `index.js`; no test suite, CI config, or build tooling in the repository. The package exports constants (`Sequences`, `Options`) and two classes (`TelnetSocket`, `TelnetServer`) used to handle Telnet negotiation and GMCP, and to wrap a `net.Server` connection flow. The README documents usage and supported events. 【F:index.js†L1-L359】【F:README.md†L1-L70】
- Node engine requirement is `>=7`, which is far below modern LTS and implies untracked compatibility with Node 22. 【F:package.json†L1-L21】【F:README.md†L1-L70】

## Exported API Surface
- `Sequences`: numeric Telnet command bytes (IAC, DO, DONT, WILL, WONT, SB, SE, GA, EOR). 【F:index.js†L7-L19】
- `Options`: numeric telnet options (ECHO, EOR, GMCP). 【F:index.js†L21-L27】
- `TelnetSocket`: EventEmitter-based wrapper with methods:
  - `attach(connection)`: binds to a raw socket, parses incoming data, and emits events (`data`, `WILL`, `WONT`, `DO`, `DONT`, `SUBNEG`, `GMCP`, `unknownAction`). 【F:index.js†L140-L338】
  - `input(inputbuf)`: parses telnet IAC sequences, handles GMCP decoding, filters control bytes, and emits events. 【F:index.js†L202-L338】
  - `telnetCommand(willingness, command)`: sends IAC sequences for options/subnegotiation. 【F:index.js†L103-L117】
  - `toggleEcho()`: flips echo state and sends WILL/WONT ECHO. 【F:index.js†L119-L122】
  - `sendGMCP(gmcpPackage, data)`: emits GMCP subnegotiation data. 【F:index.js†L124-L138】
  - Socket lifecycle helpers: `write`, `end`, `setEncoding`, `pause`, `resume`, `destroy`, `address`, and `readable/writable` accessors. 【F:index.js†L39-L101】
- `TelnetServer`: minimal wrapper around `net.createServer` that sets `socket.fresh = true` and invokes the provided listener. 【F:index.js†L343-L357】

## Node 22 Compatibility Assessment
### Direct Compatibility Risks
- **Deprecated Buffer constructors**: `new Buffer(...)` is used multiple times, which is deprecated and can throw in strict environments or be flagged by tooling; Node 22 still supports it but emits warnings and may be blocked by future hardening policies. 【F:index.js†L55-L77】【F:index.js†L103-L117】【F:index.js†L131-L138】【F:index.js†L140-L191】
- **Potential parsing edge cases** that may surface in modern Node due to stricter buffer handling:
  - In `write()`, escaped IAC handling builds a new buffer `b` but never assigns it back to `data`, so the escaping is effectively a no-op. This is a behavioral invariant to preserve until explicitly changed with tests. 【F:index.js†L55-L81】
  - In `attach()`, the look-ahead for CR/LF has a likely typo: `(databuf[i+1] === 10 || databuf[i+1 === 13])` which compares the boolean `i+1 === 13` rather than `databuf[i+1] === 13`. This is a latent bug and should be covered by tests before any fix. 【F:index.js†L169-L181】
- **JSON parsing without try/catch** in GMCP (`JSON.parse`) can throw if clients send malformed GMCP payloads; if this is accepted behavior today it must be tested/locked before modifying. 【F:index.js†L295-L306】

### Dependency Risk
- No dependencies are declared; compatibility is driven by Node core APIs (`net`, `events`) and Buffer usage only. 【F:package.json†L1-L21】【F:index.js†L1-L4】

## Critical Invariants to Protect with Tests
The minimal deterministic test suite should capture current behavior (including quirks) before any modernization:
1. **TelnetServer accept flow**
   - `net.createServer` listener is invoked with a socket having `fresh = true`. 【F:index.js†L349-L353】
2. **TelnetSocket data path**
   - Control bytes `< 32` are skipped, but printable data is emitted through `data` events when `fresh` is false. 【F:index.js†L225-L337】
   - When `fresh` is true and no newline is received, parsing is deferred until negotiation ends. 【F:index.js†L162-L166】【F:index.js†L328-L331】
3. **Negotiation events**
   - `WILL/WONT/DO/DONT` events are emitted with the option byte (except for EOR toggling `gaMode`). 【F:index.js†L238-L283】
   - `unknownAction` is emitted for unrecognized IAC command bytes. 【F:index.js†L316-L323】
4. **GMCP handling**
   - `SB/SE` subnegotiation frames are parsed; GMCP parses package and JSON payload, emitting `GMCP` events. 【F:index.js†L284-L306】
5. **Subnegotiation passthrough**
   - Non-GMCP `SB/SE` sequences emit `SUBNEG` with option and raw buffer. 【F:index.js†L284-L313】
6. **Write path escaping quirk**
   - The current IAC escaping logic does not modify `data`; verify the emitted output to avoid accidental behavior changes. 【F:index.js†L55-L81】
7. **CR/LF splitting behavior**
   - Split logic in `attach()` with the `databuf[i+1 === 13]` typo should be asserted to capture current behavior before correcting. 【F:index.js†L169-L181】

## Staged Upgrade Plan (Modernization with Checkpoints & Rollback)
### Stage 0: Safety Rails (this phase)
- Add CI that runs Node 18/20/22 to establish current behavior and catch regressions early.
- Add a minimal, deterministic test suite capturing the invariants above (no API changes).
- **Checkpoint**: CI green on existing code (with any known warnings recorded).
- **Rollback**: Revert CI/test additions if they introduce environment-specific failures.

### Stage 1: Node 22 Readiness (no behavior change)
- Replace deprecated `new Buffer(...)` with `Buffer.from` / `Buffer.alloc` without changing data flow.
- Add linting or runtime checks for Buffer usage in CI.
- **Checkpoint**: Tests pass on Node 22; no runtime warnings in CI.
- **Rollback**: revert Buffer changes if any protocol output changes are detected.

### Stage 2: Targeted Bug Fixes (behavior change only when tested)
- Fix the CR/LF look-ahead typo and any other confirmed bugs **only after** adding tests that assert current behavior and updating them intentionally.
- Consider adding GMCP parse error handling if tests show a crash path; document behavior.
- **Checkpoint**: Tests updated to reflect intended fixed behavior; CI green.
- **Rollback**: revert individual bug fixes if compatibility regressions are detected.

### Stage 3: Engine & Packaging Updates
- Update `engines.node` to `>=18` (or `>=20`) first, then `>=22` after tests confirm behavior, maintaining semver discipline.
- Add a changelog and release notes for each step.
- **Checkpoint**: published package works in Node 22 on CI; no consumer-visible API changes.
- **Rollback**: restore prior engine constraints if consumer issues surface.

### Stage 4: Optional Quality Improvements
- Add type definitions or JSDoc improvements for better tooling (non-breaking).
- Add example usage tests or integration tests (local only).
- **Checkpoint**: CI remains green; no changes to public API.

---

## Notes & Assumptions
- No CI or test tooling exists today; everything above must be introduced carefully to preserve current behavior. 【F:package.json†L1-L21】
- All modernization steps must be applied in small, reviewable increments with a bias toward preserving behavior unless tests prove otherwise.
