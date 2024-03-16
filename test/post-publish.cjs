/* eslint-disable */
const { execSync } = require('child_process');
const { it, describe } = require('node:test');
const assert = require('node:assert');

execSync('rm -rf ../node_modules && npm --prefix .. --legacy-peer-deps --no-package-lock --no-save i rebloom@latest', { cwd: __dirname });

const { getUse, listen, createRecord } = require('rebloom');

describe('Post-publish', () => {
  it('Published properly', () => {
    assert.strictEqual(typeof getUse === 'function', true);
    assert.strictEqual(typeof listen === 'function', true);
    assert.strictEqual(typeof createRecord === 'function', true);
  });
});

// return main dependencies back
execSync('npm --prefix .. --no-package-lock --legacy-peer-deps --no-save un rebloom', { cwd: __dirname });
execSync('npm --prefix .. ci --legacy-peer-deps', { cwd: __dirname });
