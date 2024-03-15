import changeMap from './changeMap';
import type { Handler } from './types';

export default function listen<TState, TKey extends keyof TState>(
  givenObject: TState,
  key: TKey,
  handler: Handler<TState[TKey]>,
): () => void {
  const all: Record<TKey, Handler<TState[TKey]>[]> = changeMap.get(givenObject) ?? {};

  if (!Object.getOwnPropertyDescriptor(givenObject, key)?.get) {
    let value = givenObject[key];

    Object.defineProperty(givenObject, key, {
      enumerable: true,
      configurable: false,
      get: () => value,
      set: (newValue: TState[TKey]) => {
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
