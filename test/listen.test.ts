/* eslint-disable @typescript-eslint/no-floating-promises */

import { it, describe } from 'node:test';
import assert from 'node:assert';
import {
  listen,
} from '../src';

describe('listen', () => {
  it('listen and returned unlisten', () => {
    const state = { x: 1 };
    let prev: number;
    let triggerTimes = 0;

    const unlisten = listen(state, 'x', (x, previous) => {
      triggerTimes += 1;
      assert.strictEqual(x satisfies number, state.x);
      assert.strictEqual(previous satisfies number, prev);
    });

    prev = state.x;
    state.x = 2;
    assert.strictEqual(triggerTimes, 1);
    prev = state.x;
    state.x = 3;
    assert.strictEqual(triggerTimes, 2);
    unlisten();
    prev = state.x;
    state.x = 4;
    assert.strictEqual(triggerTimes, 2);
    prev = state.x;
    state.x = 5;
    assert.strictEqual(triggerTimes, 2);
  });
});
