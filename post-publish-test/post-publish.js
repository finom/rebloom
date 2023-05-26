/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
const { execSync } = require('child_process');

execSync('rm -rf node_modules && npm i --legacy-peer-deps --no-package-lock', { cwd: __dirname });
// remove root dependencies to avoid usage of them
execSync('rm -rf ../node_modules', { cwd: __dirname });

const expect = require('expect.js');

const {
  default: Act0, of,
} = require('act0');

for (const f of [of, Act0]) {
  expect(typeof f === 'function').to.be(true);
}

expect(Act0.of).to.be(of);

// return main dependencies back
execSync('npm i --legacy-peer-deps --prefix ..', { cwd: __dirname });
