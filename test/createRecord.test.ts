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

  it('useAll', async () => {
    const state = createRecord({
      x: 1,
      y: '2',
    });

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.useAll();
    });

    act(() => {
      state.x = 2;
      state.y = '3';
    });

    await new Promise((resolve) => { setImmediate(resolve); });

    assert.deepStrictEqual(result.current satisfies {
      x: number,
      y: string,
    }, { x: 2, y: '3' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => {
      state.x = 2;
      state.y = '3';
    });

    await new Promise((resolve) => { setImmediate(resolve); });

    assert.deepStrictEqual(result.current, { x: 2, y: '3' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => {
      state.x = 3;
      state.y = '4';
    });

    await new Promise((resolve) => { setImmediate(resolve); });

    assert.deepStrictEqual(result.current, { x: 3, y: '4' });
    assert.strictEqual(state[extendedTimesSymbol], 2);
    assert.strictEqual(state.x, 3);
    assert.strictEqual(renderedTimes, 3);

    assert.deepStrictEqual(state, { x: 3, y: '4' });

    act(() => {
      Object.assign(state, { x: 4, y: '5' });
    });

    await new Promise((resolve) => { setImmediate(resolve); });

    assert.deepStrictEqual(result.current, { x: 4, y: '5' });
    assert.strictEqual(state[extendedTimesSymbol], 3);
    assert.strictEqual(state.x, 4);
    assert.strictEqual(renderedTimes, 4);
  });

  it('useAll with function', async () => {
    const state = createRecord({
      x: 1,
      y: '2',
    });

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.useAll((d) => ({ ...d, foo: 'bar' }));
    });

    act(() => {
      state.x = 2;
      state.y = '3';
    });

    await new Promise((resolve) => { setImmediate(resolve); });

    assert.deepStrictEqual(result.current satisfies {
      x: number,
      y: string,
      foo: string,
    }, { x: 2, y: '3', foo: 'bar' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => {
      state.x = 2;
      state.y = '3';
    });

    await new Promise((resolve) => { setImmediate(resolve); });

    assert.deepStrictEqual(result.current, { x: 2, y: '3', foo: 'bar' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => {
      state.x = 3;
      state.y = '4';
    });

    await new Promise((resolve) => { setImmediate(resolve); });

    assert.deepStrictEqual(result.current, { x: 3, y: '4', foo: 'bar' });
    assert.strictEqual(state[extendedTimesSymbol], 2);
    assert.strictEqual(state.x, 3);
    assert.strictEqual(renderedTimes, 3);

    assert.deepStrictEqual(state, { x: 3, y: '4' });

    act(() => {
      Object.assign(state, { x: 4, y: '5' });
    });

    await new Promise((resolve) => { setImmediate(resolve); });

    assert.deepStrictEqual(result.current, { x: 4, y: '5', foo: 'bar' });
    assert.strictEqual(state[extendedTimesSymbol], 3);
    assert.strictEqual(state.x, 4);
    assert.strictEqual(renderedTimes, 4);
  });
});
