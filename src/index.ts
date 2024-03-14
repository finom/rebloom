import { useEffect, useMemo, useState } from 'react';
import listen from './listen';

export type WithUse<T> = T & {
  use: ReturnType<typeof getUse<T>>;
};

export { listen };

export function getUse<STORE>() {
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
    const keys = useMemo(() => (keysAsIs instanceof Array ? keysAsIs : [keysAsIs]) as (keyof STORE)[], [keysAsIs]);
    const [updatedTimes, setUpdatedTimes] = useState(0);

    useEffect(() => {
      const handler = () => {
        setUpdatedTimes((t) => t + 1);
      };

      const unsubscribe = keys.filter(Boolean).map((key) => listen(this, key, handler));

      return () => {
        unsubscribe.forEach((u) => u());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keys.map(String).join()]);

    return useMemo(() => {
      const value = keys.map((key) => (key ? this[key] : undefined));

      return keysAsIs instanceof Array ? value : value[0];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keys.map(String).join(), updatedTimes]) as ReturnType<typeof use<KEYS>>;
  };
}

export default getUse;
