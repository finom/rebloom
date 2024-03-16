/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable max-classes-per-file */
import { renderHook, act } from '@testing-library/react-hooks';
import { it, describe } from 'node:test';
import assert from 'node:assert';
import { createRecord, extendedTimesSymbol } from '../src';

describe('createRecord', () => {
  it('use', () => {
    const state = createRecord({
      x: 1,
      y: '2',
    });

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

  it('useRecord & getRecord', () => {
    const state = createRecord({
      x: 1,
      y: '2',
    });

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.useRecord();
    });

    act(() => { state.extend({ x: 2 }); });

    assert.deepStrictEqual(result.current satisfies {
      x: number,
      y: string,
    }, { x: 2, y: '2' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.extend({ x: 2 }); });

    assert.deepStrictEqual(result.current, { x: 2, y: '2' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.extend({ x: 3 }); });

    assert.deepStrictEqual(result.current, { x: 3, y: '2' });
    assert.strictEqual(state[extendedTimesSymbol], 2);
    assert.strictEqual(state.x, 3);
    assert.strictEqual(renderedTimes, 3);

    assert.deepStrictEqual(state.getRecord(), { x: 3, y: '2' });
  });

  it('useRecordValues & getRecordValues', () => {
    const state = createRecord({
      x: 1,
      y: '2',
    });

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.useRecordValues();
    });

    act(() => { state.extend({ x: 2 }); });

    assert.deepStrictEqual(result.current satisfies (string | number)[], [2, '2']);
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.extend({ x: 2 }); });

    assert.deepStrictEqual(result.current, [2, '2']);
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => { state.extend({ x: 3 }); });

    assert.deepStrictEqual(result.current, [3, '2']);
    assert.strictEqual(state[extendedTimesSymbol], 2);
    assert.strictEqual(state.x, 3);
    assert.strictEqual(renderedTimes, 3);

    assert.deepStrictEqual(state.getRecordValues(), [3, '2']);
  });
});
