import { useEffect, useMemo, useState } from 'react';
import listenOne from './listenOne';

export default function getUse<TState>() {
  // function use <TKey extends readonly (keyof TState)[]>(this: TState, keys: TKey): { [K in keyof TKey]: TState[TKey[K] & keyof TState] };
  function use <TKey extends null | undefined>(this: TState, key: TKey): undefined;
  function use <TKey extends keyof TState>(this: TState, key: TKey): TState[TKey & keyof TState];
  function use <TKeys extends readonly (keyof TState)[]>(this: TState, keys: readonly [...TKeys]): { [K in keyof TKeys]: TState[TKeys[K] & keyof TState] };
  function use(this: TState, keys: null | undefined | keyof TState | readonly (keyof TState)[]) {
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
        if (keys instanceof Array) {
          const value = keys.map((key) => (key !== null && key !== undefined ? this[key] : undefined));
          return value;
        }

        const value = keys !== null && keys !== undefined ? this[keys] : undefined;
        return value;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [updateKey, updatedTimes],
    );
  }

  return use;
}
