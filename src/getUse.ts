import { useEffect, useMemo, useState } from 'react';
import listen from './listen';

type Value<TState, TKey> = TKey extends null | undefined ? undefined : TState[TKey & keyof TState];

type Use<TState> = {
  <TKey extends null | undefined | keyof TState>(this: TState, key: TKey): Value<TState, TKey>;
  <TKeys extends readonly (null | undefined | keyof TState)[]>(this: TState, keys: readonly [...TKeys]): { [K in keyof TKeys]: Value<TState, TKeys[K]> };
};

export default function getUse<TState>() {
  function use(this: TState, keys: null | undefined | keyof TState | readonly (null | undefined | keyof TState)[]) {
    const [updatedTimes, setUpdatedTimes] = useState(0);
    const updateKey = (keys instanceof Array ? keys : [keys]).map(String).join();

    useEffect(() => {
      const handler = () => {
        setUpdatedTimes((t) => t + 1);
      };

      const unsubscribe = (keys instanceof Array ? keys : [keys])
        .filter((key) => key !== null && key !== undefined)
        .map((key) => listen(this, key as keyof TState, handler));

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

  return use as Use<TState>;
}
