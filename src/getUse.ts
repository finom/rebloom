import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import listenOne from './listenOne';
import { KnownAny } from './types';

// type UseFKey<TState, TKey extends KeyExtends<TState>> = TKey extends null | undefined | keyof TState ? TKey : keyof TState;

// that.use(['x', 'y'] as ['x', 'y'] | null, ([x, y], keyChanged, prev) => [x, y]);
export default function getUse<TState>() {
  // function use <TKey extends readonly (keyof TState)[]>(this: TState, keys: TKey): { [K in keyof TKey]: TState[TKey[K] & keyof TState] };
  // g function use <TKey extends readonly (keyof TState)[] | null | undefined>(keys: TKey): TKey extends null | undefined ? undefined : { [K in keyof TKey]: TState[TKey[K] & keyof TState] };
  // function use <TKey extends null | undefined>(this: TState, key: TKey): undefined;
  // g function use <TKey extends null | undefined | keyof TState>(key: TKey): TKey extends null | undefined ? undefined : TState[TKey & keyof TState];
  // function use <TKeys extends readonly (keyof TState)[]>(this: TState, keys: readonly [...TKeys]): { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] };
  /* function use <TKey extends  null | undefined | keyof TState | readonly (keyof TState)[]>(this: TState, key: TKey): TKey extends null | undefined ? undefined
  : TKey extends readonly (keyof TState)[] ? { [K in keyof TKey]: TState[TKey[K] & keyof TState] }
    : TState[TKey & keyof TState];
  function use <TKey extends KeyExtends<TState>, R>(this: TState, key: TKey, f: (val: UseResult<TState, TKey>, key: TKey, prev: TState) => R): R; */
  function use <TKey extends null | undefined>(this: TState, key: TKey): undefined;
  function use <TKey extends null | undefined, F extends (val: undefined, key: null, prev: TState) => KnownAny>(this: TState, key: TKey, f: F, deps?: KnownAny[]): ReturnType<F>;

  function use <TKey extends keyof TState>(this: TState, key: TKey): TState[TKey & keyof TState];
  function use <TKey extends keyof TState, F extends (val: TState[TKey & keyof TState], key: TKey & keyof TState | null, prev: TState) => KnownAny>(this: TState, key: TKey, f: F, deps?: KnownAny[]): ReturnType<F>;

  function use <TKey extends keyof TState | null | undefined>(this: TState, key: TKey): undefined | TState[TKey & keyof TState];
  function use <TKey extends keyof TState | null | undefined, F extends (val: undefined | TState[TKey & keyof TState], key: TKey & keyof TState | null, prev: TState) => KnownAny>(this: TState, key: TKey, f: F, deps?: KnownAny[]): ReturnType<F>;

  function use <TKeys extends readonly (keyof TState)[]>(this: TState, keys: readonly [...TKeys]): { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] };
  function use <TKeys extends readonly (keyof TState)[], F extends (val: { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] }, key: keyof TState | null, prev: TState) => KnownAny>(this: TState, keys: readonly [...TKeys], f: F, deps?: KnownAny[]): ReturnType<F>;

  function use <TKeys extends readonly (keyof TState)[] | null | undefined>(this: TState, keys: TKeys): TKeys extends null | undefined ? undefined : { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] };
  function use <TKeys extends readonly (keyof TState)[] | null | undefined, F extends (val: TKeys extends null | undefined ? undefined : { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] }, key: keyof TState | null, prev: TState) => KnownAny>(this: TState, keys: TKeys, f: F, deps?: KnownAny[]): ReturnType<F>;

  // function use <TKey extends KeyExtends<TState>, F extends (val: UseResult<TState, TKey>, key: TKey, prev: TState) => KnownAny>(this: TState, key: TKey, f: F): ReturnType<F>;
  function use(this: TState, keys: null | undefined | keyof TState | readonly (keyof TState)[], transform?: (...args: KnownAny) => unknown, deps?: KnownAny[]): KnownAny {
    // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unsafe-assignment
    const memoKeys = useMemo(() => keys, [JSON.stringify(keys)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unsafe-assignment
    const memoTransform = useMemo(() => transform, deps ?? []);

    const getRawState = useCallback(() => {
      if (memoKeys === null || memoKeys === undefined) {
        return undefined;
      }

      if (memoKeys instanceof Array) {
        const value = memoKeys.map((key) => this[key]);
        return value;
      }

      const value = this[memoKeys];
      return value;
    }, [memoKeys]);

    const getState = useCallback((key: keyof TState | null, prevValue?: unknown) => {
      const rawState = getRawState();
      if (typeof memoTransform === 'function') {
        return memoTransform(rawState, key ?? null, key !== null ? {
          ...this,
          [key]: prevValue,
        } : { ...this });
      }

      return rawState;
    }, [getRawState, memoTransform]);

    const [stateInfo, setStateInfo] = useState<{
      key: keyof TState | null,
      prevValue: unknown,
    }>({
      key: null,
      prevValue: undefined,
    });

    useEffect(() => {
      const handler = (key: keyof TState | null, prevValue: unknown) => setStateInfo({
        key,
        prevValue,
      });

      const unsubscribe = (memoKeys instanceof Array ? memoKeys : [memoKeys])
        .filter((key) => key !== null && key !== undefined)
        .map((key) => listenOne(this, key!, (_v, prevValue) => handler(key!, prevValue)));
      return () => {
        unsubscribe.forEach((u) => u());
      };
    }, [memoKeys]);

    return useMemo(() => getState(stateInfo.key, stateInfo.prevValue), [getState, stateInfo]);
  }

  return use;
}
