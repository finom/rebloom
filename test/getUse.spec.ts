/* eslint-disable max-classes-per-file */
import { renderHook, act } from '@testing-library/react-hooks';
import { WithUse, getUse } from '../src';

describe('useValue', () => {
  it('Extends class', () => {
    class Store {
      use = getUse<Store>();

      x = 1;
    }

    const store = new Store();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return store.use('x');
    });

    expect(result.current).toBe(1);
    expect(store.x).toBe(1);
    expect(renderedTimes).toBe(1);

    act(() => { store.x = 2; });

    expect(result.current).toBe(2);
    expect(store.x).toBe(2);
    expect(renderedTimes).toBe(2);
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

    expect(result.current).toBe(1);
    expect(store.x).toBe(1);
    expect(renderedTimes).toBe(1);

    act(() => { store.x = 2; });

    expect(result.current).toBe(2);
    expect(store.x).toBe(2);
    expect(renderedTimes).toBe(2);
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

    expect(result.current).toBe(1);
    expect(store.x).toBe(1);
    expect(renderedTimes).toBe(1);

    act(() => { store.x = 2; });

    expect(result.current).toBe(2);
    expect(store.x).toBe(2);
    expect(renderedTimes).toBe(2);
  });
});
