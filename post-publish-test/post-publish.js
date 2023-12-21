/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
const { execSync } = require('child_process');
const path = require('path');

execSync('rm -rf node_modules && npm ci', { cwd: __dirname });
// remove root dependencies to avoid usage of them
execSync('rm -rf ../node_modules', { cwd: __dirname });

const expect = require('expect.js');

const {
  getUse,
} = require('use-0');

expect(typeof getUse === 'function').to.be(true);

// return main dependencies back
execSync('npm ci', { cwd: path.join(__dirname, '..') });
