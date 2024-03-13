/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable max-classes-per-file */
import { renderHook, act } from '@testing-library/react-hooks';
import { it, describe } from 'node:test';
import assert from 'node:assert';
import { WithUse, getUse } from '../src';

describe('useValue', () => {
  it('Extends class', () => {
    class Store {
      use = getUse<Store>();

      x = 1;

      y = '2';
    }

    const store = new Store();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return store.use('x');
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(store.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { store.x = 2; });

    assert.strictEqual(result.current, 2);
    assert.strictEqual(store.x, 2);
    assert.strictEqual(renderedTimes, 2);
  });

  it('Extends static class', () => {
    class Store {
      static use = getUse<typeof Store>();

      static x = 1;
    }

    const store = Store;

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return store.use('x');
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(store.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { store.x = 2; });

    assert.strictEqual(result.current, 2);
    assert.strictEqual(store.x, 2);
    assert.strictEqual(renderedTimes, 2);
  });

  it('Extends object', () => {
    const store: WithUse<{ x: number }> = {
      use: getUse(),
      x: 1,
    };

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return store.use('x');
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(store.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { store.x = 2; });

    assert.strictEqual(result.current, 2);
    assert.strictEqual(store.x, 2);
    assert.strictEqual(renderedTimes, 2);
  });

  it('Works with arrays', () => {
    class Store {
      use = getUse<Store>();

      x = 1;

      y = '2';
    }

    const store = new Store();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return store.use(['x', 'y']);
    });

    // assert.deepStrictEqual is used for array equality
    assert.deepStrictEqual(result.current, [1, '2']);
    assert.strictEqual(store.x, 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { store.x = 2; });

    assert.deepStrictEqual(result.current, [2, '2']);
    assert.strictEqual(store.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { store.y = '3'; });

    assert.deepStrictEqual(result.current, [2, '3']);
    assert.strictEqual(store.y, '3');
    assert.strictEqual(renderedTimes, 3);
  });

  it('Supports symbols', () => {
    const x = Symbol('x');
    const y = Symbol('y');

    class Store {
      use = getUse<Store>();

      [x] = 1;

      [y] = '2';
    }

    const store = new Store();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return store.use(x);
    });

    assert.strictEqual(result.current, 1);
    assert.strictEqual(store[x], 1);
    assert.strictEqual(renderedTimes, 1);

    act(() => { store[x] = 2; });

    assert.strictEqual(result.current, 2);
    assert.strictEqual(store[x], 2);
    assert.strictEqual(renderedTimes, 2);
  });
});
