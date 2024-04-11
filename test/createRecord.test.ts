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

    await new Promise((resolve) => { setTimeout(resolve, 0); });

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

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.deepStrictEqual(result.current, { x: 2, y: '3' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => {
      state.x = 3;
      state.y = '4';
    });

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.deepStrictEqual(result.current, { x: 3, y: '4' });
    assert.strictEqual(state[extendedTimesSymbol], 2);
    assert.strictEqual(state.x, 3);
    assert.strictEqual(renderedTimes, 3);

    assert.deepStrictEqual(state, { x: 3, y: '4' });

    act(() => {
      Object.assign(state, { x: 4, y: '5' });
    });

    await new Promise((resolve) => { setTimeout(resolve, 0); });

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

    let foo = 'bar1';

    let renderedTimes = 0;
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.useAll((s) => ({ ...s, foo }));
    });

    act(() => {
      state.x = 2;
      state.y = '3';
    });

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.deepStrictEqual(result.current satisfies {
      x: number,
      y: string,
      foo: string,
    }, { x: 2, y: '3', foo: 'bar1' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    foo = 'bar2';

    act(() => {
      // not changed
      state.x = 2;
      state.y = '3';
    });

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.deepStrictEqual(result.current, { x: 2, y: '3', foo: 'bar1' });
    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(state.x, 2);
    assert.strictEqual(renderedTimes, 2);

    act(() => {
      state.x = 3;
      state.y = '4';
    });

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.deepStrictEqual(result.current, { x: 3, y: '4', foo: 'bar2' });
    assert.strictEqual(state[extendedTimesSymbol], 2);
    assert.strictEqual(state.x, 3);
    assert.strictEqual(renderedTimes, 3);

    assert.deepStrictEqual(state, { x: 3, y: '4' });

    foo = 'bar3';

    act(() => {
      Object.assign(state, { x: 4, y: '5' });
    });

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.deepStrictEqual(result.current, { x: 4, y: '5', foo: 'bar3' });
    assert.strictEqual(state[extendedTimesSymbol], 3);
    assert.strictEqual(state.x, 4);
    assert.strictEqual(renderedTimes, 4);
  });

  it('useAll with function that returns the same value', async () => {
    const state = createRecord({
      x: 1,
      y: 2,
    });

    let renderedTimes = 0;
    let keysChanged: (keyof typeof state)[] = [];
    let prev = { ...state };
    const { result } = renderHook(() => {
      renderedTimes += 1;

      return state.useAll((s, keysChangedArg, prevArg) => {
        assert.deepStrictEqual(keysChangedArg, keysChanged);
        assert.deepStrictEqual(prevArg, prev);
        return s.x + s.y;
      });
    });

    assert.strictEqual(result.current, 3);

    // -----
    keysChanged = ['x'];
    prev = { ...state };

    act(() => {
      // y is still 2
      state.x = 3;
    });

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.strictEqual(state[extendedTimesSymbol], 1);
    assert.strictEqual(renderedTimes, 2);
    assert.strictEqual(result.current, 5);

    // -----
    keysChanged = ['x', 'y'];
    prev = { ...state };

    act(() => {
      state.x = 2;
      state.y = 3;
    });

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.strictEqual(state[extendedTimesSymbol], 2);
    assert.strictEqual(renderedTimes, 2);
    assert.strictEqual(result.current, 5);
  });

  it('listen', () => {
    const state = createRecord({
      x: 1,
      y: '2',
    });

    let prev: number;
    let triggerTimes = 0;

    const unlisten = state.listen('x', (x, key, prevObject) => {
      triggerTimes += 1;
      assert.strictEqual(x satisfies number, state.x);
      assert.strictEqual(prevObject[key], prev);
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

  it('listenAll', async () => {
    const state = createRecord({
      x: 1,
      y: '2',
    });

    let prev: number;
    let triggerTimes = 0;

    const unlisten = state.listenAll((o, keysChanged, prevObject) => {
      triggerTimes += 1;
      assert.strictEqual(o.x, state.x);
      assert.strictEqual(o.y, state.y);
      assert.deepStrictEqual(keysChanged, ['x']);
      assert.strictEqual(prevObject.x, prev);
      assert.strictEqual(prevObject.y, state.y);
    });

    prev = state.x;
    state.x = 2;

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.strictEqual(triggerTimes, 1);
    prev = state.x;
    state.x = 3;

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.strictEqual(triggerTimes, 2);
    unlisten();
    prev = state.x;
    state.x = 4;

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.strictEqual(triggerTimes, 2);
    prev = state.x;
    state.x = 5;

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    assert.strictEqual(triggerTimes, 2);
  });

  it('toJSON', () => {
    // TODO: what else to test here?
    const state = createRecord({
      x: 1,
      y: '2',
    });

    assert.deepStrictEqual(state.toJSON(), { x: 1, y: '2' });

    act(() => {
      state.x = 2;
      state.y = '3';
    });

    assert.deepStrictEqual(state.toJSON(), { x: 2, y: '3' });
  });
});
