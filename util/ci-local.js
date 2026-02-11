#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) {
    throw result.error;
  }
  return result.status;
}

function runAudit(command) {
  const result = spawnSync(command, ['audit', '--json'], {
    encoding: 'utf8',
    shell: false,
  });
  if (result.error) {
    throw result.error;
  }
  const auditPath = path.join(process.cwd(), 'npm-audit.json');
  fs.writeFileSync(auditPath, result.stdout || '');
  return { status: result.status, auditPath };
}

function main() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  // CI: actions/checkout@v4 (SKIPPED)
  // Reason: local repo already checked out.

  // CI: actions/setup-node@v4 (SKIPPED)
  // Reason: local Node.js installation is assumed; this script does not manage runtimes.

  // CI: npm ci
  const ciStatus = runCommand(npmCommand, ['ci']);
  if (ciStatus !== 0) {
    process.exitCode = ciStatus;
    return;
  }

  // CI: npm test
  const testStatus = runCommand(npmCommand, ['test']);
  if (testStatus !== 0) {
    process.exitCode = testStatus;
    return;
  }

  // CI: npm audit (json)
  const auditResult = runAudit(npmCommand);
  if (auditResult.status !== 0) {
    process.stdout.write(
      `npm audit reported issues (exit ${auditResult.status}). ` +
      `Report saved to ${auditResult.auditPath}\n`
    );
  } else {
    process.stdout.write(`npm audit passed. Report saved to ${auditResult.auditPath}\n`);
  }

  // CI: Upload npm audit report (SKIPPED)
  // Reason: local run writes npm-audit.json to disk instead of uploading an artifact.
}

main();
