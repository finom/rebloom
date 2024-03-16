/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable max-classes-per-file */
import { renderHook, act } from '@testing-library/react-hooks';
import { it, describe } from 'node:test';
import assert from 'node:assert';
import {
  createRecord, getUse, listen,
} from '../src';

describe('getUse', () => {
  it('Extends class', () => {
    class State {
      use = getUse<State>();

      x = 1;

      y = '2';
    }

    const state = new State();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use('x');
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state.x = 2; });

    assert.strictEqual(result.current, 2);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);
  });

  it('Extends static class', () => {
    class State {
      static use = getUse<typeof State>();

      static x = 1;
    }

    const state = State;

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use('x');
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state.x = 2; });

    assert.strictEqual(result.current, 2);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);
  });

  it('Extends object', () => {
    const use = getUse<typeof state>();

    const state = {
      get use() {
        return use;
      },
      x: 1,
    };

    Object.defineProperty(state, 'use', { enumerable: false });

    /* let data = { x: 1 };

    let state = {
      ...data,
      use: getUse<typeof data>(),
    }
    */

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use('x');
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state.x = 2; });

    assert.strictEqual(result.current, 2);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);
  });

  it('Works with readonly arrays', () => {
    class State {
      use = getUse<State>();

      x = 1;

      y = '2';
    }

    const state = new State();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use(['x', 'y']);
    });

    assert.deepStrictEqual(result.current satisfies [number, string], [1, '2']);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state.x = 2; });

    assert.deepStrictEqual(result.current, [2, '2']);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.y = '3'; });

    assert.deepStrictEqual(result.current, [2, '3']);
    assert.strictEqual(state.y, '3');
    assert.strictEqual(renderedTimes, 3);
  });

  it('Works with regular arrays', () => {
    class State {
      use = getUse<State>();

      x = 1;

      y = '2';
    }

    const state = new State();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      const keys = Array<keyof Pick<State, 'x' | 'y'>>();
      keys.push('x');
      keys.push('y');

      return state.use(keys);
    });

    assert.deepStrictEqual(result.current satisfies (string | number)[], [1, '2']);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state.x = 2; });

    assert.deepStrictEqual(result.current, [2, '2']);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.y = '3'; });

    assert.deepStrictEqual(result.current, [2, '3']);
    assert.strictEqual(state.y, '3');
    assert.strictEqual(renderedTimes, 3);
  });

  it('Supports symbols', () => {
    const x = Symbol('x');
    const y = Symbol('y');

    class State {
      use = getUse<State>();

      [x] = 1;

      [y] = '2';
    }

    const state = new State();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use(x);
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(state[x], 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state[x] = 2; });

    assert.strictEqual(result.current, 2);
    assert.strictEqual(state[x], 2);
    assert.strictEqual(renderedTimes, 2);
  });
});

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

describe('createRecord', () => {
  it.skip('Creates record with extended properties', () => {
    createRecord();
  });
});
