import type { Handler, KnownAny } from './types';

const changeMap = new WeakMap<KnownAny, Record<KnownAny, Handler<KnownAny>[]>>();

export default function listen<SLICE, KEY extends keyof SLICE>(
  givenObject: SLICE,
  key: KEY,
  handler: Handler<SLICE[KEY]>,
): () => void {
  const all: Record<KEY, Handler<SLICE[KEY]>[]> = changeMap.get(givenObject) ?? {};

  if (!Object.getOwnPropertyDescriptor(givenObject, key)?.get) {
    let value = givenObject[key];

    Object.defineProperty(givenObject, key, {
      enumerable: true,
      configurable: false,
      get: () => value,
      set: (newValue: SLICE[KEY]) => {
        const prevValue = givenObject[key];

        if (prevValue !== newValue) {
          value = newValue;

          all[key]?.forEach((h) => {
            h(newValue, prevValue);
          });
        }
      },
    });
  }

  changeMap.set(givenObject, all);

  const handlers = all[key] || [];

  if (!handlers.includes(handler)) {
    handlers.push(handler);
  }

  all[key] = handlers;

  return () => {
    all[key] = all[key].filter((h) => h !== handler);
  };
}
