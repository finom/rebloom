/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { renderHook, act } from '@testing-library/react-hooks';
import { it, describe } from 'node:test';
import assert from 'node:assert';
import { getUse } from '../src';

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
      y: '2',
    };

    /*
    const state = {
      get use() {
        return getUse(state);
      },
      x: 1,
      y: '2',
    };
    */

    Object.defineProperty(state, 'use', { enumerable: false });

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use('x');
    });

    assert.strictEqual(result.current satisfies number, 1);
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

  it('use with function', () => {
    const use = getUse<typeof state>();

    const state = {
      get use() {
        return use;
      },
      x: 1,
      y: '2',
    };

    Object.defineProperty(state, 'use', { enumerable: false });

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use('x', (x, key, prev) => [x, key, prev] as const);
    });

    assert.deepStrictEqual(result.current satisfies readonly [number, 'x', typeof state], [1, 'x', state]);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state.x = 2; });

    assert.deepStrictEqual(result.current satisfies readonly [number, 'x', typeof state], [2, 'x', {
      ...state,
      x: 1,
    }]);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.y = '3'; }); // not invoking the hook

    assert.deepStrictEqual(result.current satisfies readonly [number, 'x', typeof state], [2, 'x', {
      ...state,
      y: '2',
      x: 1,
    }]);
    assert.strictEqual(state.y, '3');
    assert.strictEqual(renderedTimes, 2);
  });

  it('use with array and function', () => {
    const use = getUse<typeof state>();

    const state = {
      get use() {
        return use;
      },
      x: 1,
      y: '2',
    };

    Object.defineProperty(state, 'use', { enumerable: false });

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use(['x', 'y'], ([x, y], keyChanged, prev) => [x, y, keyChanged, prev] as const);
    });

    assert.deepStrictEqual(result.current satisfies readonly [number, string, readonly ['x', 'y'], typeof state], [1, '2', ['x', 'y'], state]);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state.x = 2; });

    assert.deepStrictEqual(result.current satisfies readonly [number, string, readonly ['x', 'y'], typeof state], [2, '2', ['x'], {
      ...state,
      x: 1,
    }]);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.y = '3'; });

    assert.deepStrictEqual(result.current satisfies readonly [number, string, readonly ['x', 'y'], typeof state], [2, '3', ['y'], {
      ...state,
      y: '2',
    }]);
    assert.strictEqual(state.y, '3');
    assert.strictEqual(renderedTimes, 3);
  });

  it.skip('use with array and function that returns the same value', () => {});

  it.skip('use with function that returns the same value', () => {});
});
