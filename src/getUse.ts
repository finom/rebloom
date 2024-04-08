import { useEffect, useMemo, useState } from 'react';
import listenOne from './listenOne';
import { KnownAny } from './types';

export default function getUse<TState>() {
  // function use <TKey extends readonly (keyof TState)[]>(this: TState, keys: TKey): { [K in keyof TKey]: TState[TKey[K] & keyof TState] };
  // g function use <TKey extends readonly (keyof TState)[] | null | undefined>(keys: TKey): TKey extends null | undefined ? undefined : { [K in keyof TKey]: TState[TKey[K] & keyof TState] };
  // function use <TKey extends null | undefined>(this: TState, key: TKey): undefined;
  // g function use <TKey extends null | undefined | keyof TState>(key: TKey): TKey extends null | undefined ? undefined : TState[TKey & keyof TState];
  // function use <TKeys extends readonly (keyof TState)[]>(this: TState, keys: readonly [...TKeys]): { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] };
  function use <TKey extends null | undefined | keyof TState | readonly (keyof TState)[]>(this: TState, key: TKey): TKey extends null | undefined ? undefined
    : TKey extends readonly (keyof TState)[] ? { [K in keyof TKey]: TState[TKey[K] & keyof TState] }
      : TState[TKey & keyof TState];
  function use(this: TState, keys: null | undefined | keyof TState | readonly (keyof TState)[]): KnownAny {
    const [updatedTimes, setUpdatedTimes] = useState(0);
    const updateKey = (keys instanceof Array ? keys : [keys]).map(String).join();

    useEffect(() => {
      const handler = () => {
        setUpdatedTimes((t) => t + 1);
      };

      const unsubscribe = (keys instanceof Array ? keys : [keys])
        .filter((key) => key !== null && key !== undefined)
        .map((key) => listenOne(this, key as keyof TState, handler));

      return () => {
        unsubscribe.forEach((u) => u());
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateKey]);

    return useMemo(
      () => {
        if (keys === null || keys === undefined) {
          return undefined;
        }

        if (keys instanceof Array) {
          const value = keys.map((key) => this[key]);
          return value;
        }

        const value = this[keys];
        return value;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [updateKey, updatedTimes],
    );
  }

  return use;
}
