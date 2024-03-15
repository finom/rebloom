/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable max-classes-per-file */
import { renderHook, act } from '@testing-library/react-hooks';
import { it, describe } from 'node:test';
import assert from 'node:assert';
import { WithUse, getUse, listen } from '../src';

describe('getUse', () => {
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

  it('Works with readonly arrays', () => {
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

    assert.deepStrictEqual(result.current satisfies [number, string], [1, '2']);
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

  it('Works with regular arrays', () => {
    class Store {
      use = getUse<Store>();

      x = 1;

      y = '2';
    }

    const store = new Store();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      const keys = Array<keyof Pick<Store, 'x' | 'y'>>();
      keys.push('x');
      keys.push('y');

      return store.use(keys);
    });

    assert.deepStrictEqual(result.current satisfies (string | number)[], [1, '2']);
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

describe('listen', () => {
  it('listen and returned unlisten', () => {
    const store = { x: 1 };
    let prev: number;
    let triggerTimes = 0;

    const unlisten = listen(store, 'x', (x, previous) => {
      triggerTimes += 1;
      assert.strictEqual(x satisfies number, store.x);
      assert.strictEqual(previous satisfies number, prev);
    });

    prev = store.x;
    store.x = 2;
    assert.strictEqual(triggerTimes, 1);
    prev = store.x;
    store.x = 3;
    assert.strictEqual(triggerTimes, 2);
    unlisten();
    prev = store.x;
    store.x = 4;
    assert.strictEqual(triggerTimes, 2);
    prev = store.x;
    store.x = 5;
    assert.strictEqual(triggerTimes, 2);
  });
});
