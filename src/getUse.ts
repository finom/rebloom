import { useEffect, useState } from 'react';
import listenOne from './listenOne';
import { KnownAny } from './types';

type KeyExtends<TState> = null | undefined | keyof TState | readonly (keyof TState)[];
type UseResult<TState, TKey extends KeyExtends<TState>> = TKey extends null | undefined ? undefined
  : TKey extends readonly (keyof TState)[] ? { [K in keyof TKey]: TState[TKey[K] & keyof TState] }
    : TState[TKey & keyof TState];
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
  function use <TKey extends KeyExtends<TState>>(this: TState, key: TKey): UseResult<TState, TKey>;
  function use <TKey extends KeyExtends<TState>, F extends (val: UseResult<TState, TKey>, key: TKey, prev: TState) => KnownAny>(this: TState, key: TKey, f: F): ReturnType<F>;
  function use(this: TState, keys: KeyExtends<TState>, f?: (...args: KnownAny) => unknown): KnownAny {
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
        // KEY!
        // PREV!
        // ?? null on first render?
        // ?? collect changes with setTimeout??
        // pass list of keys as they are to not fuck around???
        return f(rawState, keys as keyof TState, typeof key !== 'undefined' ? {
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
