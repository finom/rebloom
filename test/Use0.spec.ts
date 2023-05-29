/* eslint-disable max-classes-per-file */
import { renderHook, act } from '@testing-library/react-hooks';
import Use0, { of } from '../src';

describe('useValue', () => {
  it('Extends class', () => {
    class Store extends Use0 {
      x = 1;

      users = Use0.of<{ ids: ReadonlyArray<number> }>({ ids: [1] });
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

  it('Uses "of"', () => {
    expect(of).toEqual(Use0.of);

    class Store extends Use0 {
      public data = Use0.of<Record<string, number>>();

      readonly coordinates = Use0.of({ x: 0, y: 1 });
    }

    const store = new Store();

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;
      return store.coordinates.use('y');
    });

    expect(result.current).toBe(1);
    expect(store.coordinates.y).toBe(1);
    expect(renderedTimes).toBe(1);

    act(() => { store.coordinates.y = 2; });

    expect(result.current).toBe(2);
    expect(store.coordinates.y).toBe(2);
    expect(renderedTimes).toBe(2);
  });
});
