/* eslint-disable */
const { execSync } = require('child_process');
const { it, describe } = require('node:test');
const assert = require('node:assert');

execSync('rm -rf ../node_modules && npm --prefix .. --no-package-lock --legacy-peer-deps i use-0@latest', { cwd: __dirname });

const { getUse, listen } = require('use-0');

describe('Post-publish', () => {
  it('Published properly', () => {
    assert.strictEqual(typeof getUse === 'function', true);
    assert.strictEqual(typeof listen === 'function', true);
  });
});

// return main dependencies back
execSync('npm --prefix .. ci --legacy-peer-deps', { cwd: __dirname });
