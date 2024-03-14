import { useEffect, useMemo, useState } from 'react';
import listen from './listen';

export type WithUse<T extends object> = T & {
  use: ReturnType<typeof getUse<T>>;
};

export { listen };

export function getUse<STORE extends object>() {
  return function use<
    KEYS extends keyof STORE | null | undefined | Array<keyof STORE>,
  >(
    this: STORE,
    keysAsIs: KEYS,
  ): KEYS extends null | undefined
      ? undefined
      : KEYS extends keyof STORE
        ? STORE[KEYS]
        : KEYS extends ReadonlyArray<infer U>
          ? U extends keyof STORE
            ? { [K in keyof KEYS]: STORE[KEYS[K] & keyof STORE] }
            : never
          : KEYS extends Array<infer U>
            ? U extends keyof STORE
              ? STORE[U][]
              : never
            : never {
    const keys = keysAsIs instanceof Array ? keysAsIs : [keysAsIs];
    const [updatedTimes, setUpdatedTimes] = useState(0);
    const updateKey = keys.map(String).join();

    useEffect(() => {
      const handler = () => {
        setUpdatedTimes((t) => t + 1);
      };

      const unsubscribe = keys
        .filter((key) => key !== null && key !== undefined)
        .map((key) => listen(this, key as keyof STORE, handler));

      return () => {
        unsubscribe.forEach((u) => u());
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateKey]);

    return useMemo(() => {
      const value = keys.map((key) => (key !== null && key !== undefined ? this[key as keyof STORE] : undefined));

      return keysAsIs instanceof Array ? value : value[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateKey, updatedTimes]) as ReturnType<typeof use<KEYS>>;
  };
}
