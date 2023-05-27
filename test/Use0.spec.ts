/* eslint-disable max-classes-per-file */
import { renderHook, act } from '@testing-library/react-hooks';
import Use0, { of } from '../src';

describe('useValue', () => {
  it('Extends class', () => {
    class Store extends Use0 {
      public x = 1;

      users = Use0.of<{ ids: ReadonlyArray<number> }>({ ids: [1] as const });
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

  it('Extends class', () => {
    expect(of).toEqual(Use0.of);

    class Store extends Use0 {
      public data = Use0.of({ 
        x: '0',
        y: 1,
      });

      readonly coordinates = Use0.of({ x: 0, y: 100 });
    }

    const store = new Store();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;
      return store.data.use('y');
    });

    expect(result.current).toBe(1);
    expect(store.data.y).toBe(1);
    expect(renderedTimes).toBe(1);

    act(() => { store.data.y = 2; });

    expect(result.current).toBe(2);
    expect(store.data.y).toBe(2);
    expect(renderedTimes).toBe(2);
  });
});
