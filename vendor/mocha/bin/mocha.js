#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const testFiles = args.length
  ? args
  : fs.readdirSync(path.join(process.cwd(), 'test'))
    .filter((entry) => entry.endsWith('.js'))
    .map((entry) => path.join('test', entry));

const tests = [];
const suiteStack = [];

global.describe = (name, fn) => {
  suiteStack.push(name);
  try {
    fn();
  } finally {
    suiteStack.pop();
  }
};

global.it = (name, fn) => {
  tests.push({
    name,
    fn,
    suite: suiteStack.slice(),
  });
};

function runTest(fn) {
  return new Promise((resolve, reject) => {
    if (fn.length > 0) {
      let finished = false;
      const done = (err) => {
        if (finished) {
          return;
        }
        finished = true;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };

      try {
        fn(done);
      } catch (error) {
        reject(error);
      }
      return;
    }

    try {
      Promise.resolve(fn()).then(resolve, reject);
    } catch (error) {
      reject(error);
    }
  });
}

for (const file of testFiles) {
  require(path.resolve(process.cwd(), file));
}

(async () => {
  let failures = 0;

  for (const test of tests) {
    const fullName = [...test.suite, test.name].join(' ');
    try {
      await runTest(test.fn);
      process.stdout.write(`\u2713 ${fullName}\n`);
    } catch (error) {
      failures += 1;
      process.stderr.write(`\u2717 ${fullName}\n`);
      process.stderr.write(`${error && error.stack ? error.stack : error}\n`);
    }
  }

  if (failures) {
    process.exitCode = 1;
  }
})();
