/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { it, describe } from 'node:test';
import assert from 'node:assert';
import { getListen } from '../src';

describe('getListen', () => {
  it('Extends class', () => {
    class State {
      listen = getListen<State>();

      x = 1;

      y = '2';
    }

    const state = new State();
    let prev: number;
    let triggerTimes = 0;

    const unlisten = state.listen('x', (x, key, prevObject) => {
      triggerTimes += 1;
      assert.strictEqual(x satisfies number, state.x);
      assert.strictEqual(prevObject[key], prev);
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

  it('Extends static class', () => {
    class State {
      static listen = getListen<typeof State>();

      static x = 1;

      static y = '2';
    }

    let prev: number;
    let triggerTimes = 0;

    const unlisten = State.listen('x', (x, key, prevObject) => {
      triggerTimes += 1;
      assert.strictEqual(x satisfies number, State.x);
      assert.strictEqual(prevObject[key], prev);
    });

    prev = State.x;
    State.x = 2;
    assert.strictEqual(triggerTimes, 1);
    prev = State.x;
    State.x = 3;
    assert.strictEqual(triggerTimes, 2);
    unlisten();
    prev = State.x;
    State.x = 4;
    assert.strictEqual(triggerTimes, 2);
    prev = State.x;
    State.x = 5;
    assert.strictEqual(triggerTimes, 2);
  });

  it('Extends object', () => {
    const listen = getListen<typeof state>();

    const state = {
      get listen() {
        return listen;
      },
      x: 1,
      y: '2',
    };

    let prev: number;
    let triggerTimes = 0;

    const unlisten = state.listen('x', (x, key, prevObject) => {
      triggerTimes += 1;
      assert.strictEqual(x satisfies number, state.x);
      assert.strictEqual(prevObject[key], prev);
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

  it('Works with arrays', () => {
    class State {
      listen = getListen<State>();

      x = 1;

      y = '2';
    }

    const state = new State();

    let prev: number;
    let triggerTimes = 0;

    const unlisten = state.listen(['x', 'y'], ([x, y], key, prevObject) => {
      triggerTimes += 1;
      assert.strictEqual(x satisfies number, state.x);
      assert.strictEqual(y satisfies string, state.y);
      assert.strictEqual(prevObject[key], prev);
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

  it('Supports symbols', () => {
    const x = Symbol('x');
    const y = Symbol('y');

    class State {
      listen = getListen<State>();

      [x] = 1;

      [y] = '2';
    }

    const state = new State();

    let prev: number;
    let triggerTimes = 0;

    const unlisten = state.listen(x, (xVal, key, prevObject) => {
      triggerTimes += 1;
      assert.strictEqual(xVal satisfies number, state[x]);
      assert.strictEqual(prevObject[key], prev);
    });

    prev = state[x];
    state[x] = 2;
    assert.strictEqual(triggerTimes, 1);
    prev = state[x];
    state[x] = 3;
    assert.strictEqual(triggerTimes, 2);
    unlisten();
    prev = state[x];
    state[x] = 4;
    assert.strictEqual(triggerTimes, 2);
    prev = state[x];
    state[x] = 5;
    assert.strictEqual(triggerTimes, 2);
  });
});
