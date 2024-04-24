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

    assert.deepStrictEqual(result.current satisfies readonly [number, 'x' | null, typeof state], [1, null, state]);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { state.x = 2; });

    assert.deepStrictEqual(result.current satisfies readonly [number, 'x' | null, typeof state], [2, 'x', {
      ...state,
      x: 1,
    }]);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.y = '3'; }); // not invoking the hook

    assert.deepStrictEqual(result.current satisfies readonly [number, 'x' | null, typeof state], [2, 'x', {
      ...state,
      y: '2',
      x: 1,
    }]);
    assert.strictEqual(state.y, '3');
    assert.strictEqual(renderedTimes, 2);
  });

  it('use with function and deps', () => {
    const use = getUse<typeof state>();

    const state = {
      get use() {
        return use;
      },
      x: 1,
    };

    Object.defineProperty(state, 'use', { enumerable: false });

    let renderedTimes = 0;
    let invokedTimes = 0;
    const { result, rerender } = renderHook(({ y }: { y: number } = { y: 0 }) => {
      renderedTimes += 1;

      return state.use('x', (x) => {
        invokedTimes += 1;
        return x + y;
      }, [y]);
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 1);
    assert.strictEqual(invokedTimes, 1);

    rerender({ y: 10 });

    assert.strictEqual(result.current, 11);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 2);
    assert.strictEqual(invokedTimes, 2);

    rerender({ y: 10 });

    assert.strictEqual(result.current, 11);
    assert.strictEqual(state.x, 1);
    assert.strictEqual(renderedTimes, 3);
    assert.strictEqual(invokedTimes, 2);
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
    let prev = { ...state };

    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.use(['x', 'y'], (values, key, prevArg) => {
        assert.ok(key === 'x' || key === null);
        assert.deepStrictEqual(prevArg, prev);
        return values;
      });
    });

    assert.strictEqual(renderedTimes, 1);
    assert.deepStrictEqual(result.current satisfies [number, string], [1, '2']);

    // -----
    prev = { ...state };
    act(() => {
      state.x = 2;
    });

    assert.strictEqual(renderedTimes, 2);
    assert.deepStrictEqual(result.current satisfies [number, string], [2, '2']);
  });

  it.skip('*** Overloads (supposed to be skipped)', () => {
    const use = getUse<typeof state>();

    const state = {
      get use() {
        return use;
      },
      x: 1,
      y: '2',
    };

    state.use('x') satisfies number;
    state.use('x', (val, key, prev) => {
      val satisfies number;
      key satisfies 'x' | null;
      prev satisfies typeof state;
      return val satisfies number;
    }) satisfies number;
    state.use(['x', 'y']) satisfies [number, string];
    state.use(['x', 'y'], (val, key, prevArg) => {
      key satisfies 'use' | 'x' | 'y' | null;
      prevArg satisfies typeof state;
      return val satisfies [number, string];
    }) satisfies [number, string];
    state.use(null) satisfies undefined;
    state.use(null, (val, key, prev) => {
      key satisfies null;
      prev satisfies typeof state;
      return val satisfies undefined;
    });
    state.use(undefined) satisfies undefined;
    state.use(undefined, (val, key, prev) => {
      key satisfies null;
      prev satisfies typeof state;
      return val satisfies undefined;
    }) satisfies undefined;
    state.use('x' as 'x' | null) satisfies number | undefined;
    // @ts-expect-error expected
    state.use('x' as 'x' | null) satisfies number;
    state.use('x' as 'x' | null, (val, key, prev) => {
      key satisfies 'x' | null;
      prev satisfies typeof state;
      // @ts-expect-error expected
      val satisfies number;
      return val satisfies number | undefined;
    }) satisfies number | undefined;
    state.use(['x', 'y'] as ['x', 'y'] | null) satisfies [number, string] | undefined;
    // @ts-expect-error expected
    state.use(['x', 'y'] as ['x', 'y'] | null) satisfies [number, string];
    state.use(['x', 'y'] as ['x', 'y'] | null, (val, key, prevArg) => {
      key satisfies 'use' | 'x' | 'y' | null;
      prevArg satisfies typeof state;
      // @ts-expect-error expected
      val satisfies [number, string];
      return val satisfies [number, string] | undefined;
    }) satisfies [number, string] | undefined;
  });
});
