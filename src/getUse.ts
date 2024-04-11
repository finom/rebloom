import { useEffect, useState } from 'react';
import listenOne from './listenOne';
import { KnownAny } from './types';

// type UseFKey<TState, TKey extends KeyExtends<TState>> = TKey extends null | undefined | keyof TState ? TKey : keyof TState;

// TODO: Add transform arg
// TODO: make it to be executed once if f returns the same object
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
  function use <TKey extends null | undefined, F extends (val: undefined, key: null, prev: TState) => KnownAny>(this: TState, key: TKey, f: F): ReturnType<F>;

  function use <TKey extends keyof TState>(this: TState, key: TKey): TState[TKey & keyof TState];
  function use <TKey extends keyof TState, F extends (val: TState[TKey & keyof TState], key: TKey & keyof TState | null, prev: TState) => KnownAny>(this: TState, key: TKey, f: F): ReturnType<F>;

  function use <TKey extends keyof TState | null | undefined>(this: TState, key: TKey): undefined | TState[TKey & keyof TState];
  function use <TKey extends keyof TState | null | undefined, F extends (val: undefined | TState[TKey & keyof TState], key: TKey & keyof TState | null, prev: TState) => KnownAny>(this: TState, key: TKey, f: F): ReturnType<F>;

  function use <TKeys extends readonly (keyof TState)[]>(this: TState, keys: readonly [...TKeys]): { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] };
  function use <TKeys extends readonly (keyof TState)[], F extends (val: { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] }, key: keyof TState | null, prev: TState) => KnownAny>(this: TState, keys: readonly [...TKeys], f: F): ReturnType<F>;

  function use <TKeys extends readonly (keyof TState)[] | null | undefined>(this: TState, keys: TKeys): TKeys extends null | undefined ? undefined : { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] };
  function use <TKeys extends readonly (keyof TState)[] | null | undefined, F extends (val: TKeys extends null | undefined ? undefined : { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] }, key: keyof TState | null, prev: TState) => KnownAny>(this: TState, keys: TKeys, f: F): ReturnType<F>;

  // function use <TKey extends KeyExtends<TState>, F extends (val: UseResult<TState, TKey>, key: TKey, prev: TState) => KnownAny>(this: TState, key: TKey, f: F): ReturnType<F>;
  function use(this: TState, keys: null | undefined | keyof TState | readonly (keyof TState)[], f?: (...args: KnownAny) => unknown): KnownAny {
    const updateKey = (keys instanceof Array ? keys : [keys]).map(String).join();
    const getRawState = () => {
      if (keys === null || keys === undefined) {
        return undefined;
      }

      if (keys instanceof Array) {
        const value = keys.map((key) => this[key]);
        return value;
      }

      const value = this[keys];
      return value;
    };

    const getState = (key?: keyof TState, prevValue?: unknown) => {
      const rawState = getRawState();
      if (typeof f === 'function') {
        return f(rawState, key ?? null, typeof key !== 'undefined' ? {
          ...this,
          [key]: prevValue,
        } : { ...this });
      }

      return rawState;
    };

    const [state, setState] = useState(() => getState());

    useEffect(() => {
      const handler = (key: keyof TState, prevValue: unknown) => setState(getState(key, prevValue));

      const unsubscribe = (keys instanceof Array ? keys : [keys])
        .filter((key) => key !== null && key !== undefined)
        .map((key) => listenOne(this, key as keyof TState, (_v, prevValue) => handler(key as keyof TState, prevValue)));

      return () => {
        unsubscribe.forEach((u) => u());
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateKey]);

    return state;
  }

  return use;
}
