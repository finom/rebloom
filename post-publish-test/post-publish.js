/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
const { execSync } = require('child_process');
const path = require('path');

execSync('rm -rf node_modules && yarn --no-lockfile', { cwd: __dirname });
// remove root dependencies to avoid usage of them
execSync('rm -rf ../node_modules', { cwd: __dirname });

const expect = require('expect.js');

const {
  default: Use0, of,
} = require('use-0');

for (const f of [of, Use0]) {
  expect(typeof f === 'function').to.be(true);
}

expect(Use0.of).to.be(of);

// return main dependencies back
execSync('yarn', { cwd: path.join(__dirname, '..') });
