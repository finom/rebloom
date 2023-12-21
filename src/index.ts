import { useValue } from 'use-change';

export type WithUse<T> = T & {
  use: ReturnType<typeof getUse<WithUse<T>>>;
};

export function getUse<T>() {
  return function use<KEY extends null | undefined | keyof T>(this: T, key: KEY) {
    return useValue<T, KEY>(() => this, key);
  };
}
