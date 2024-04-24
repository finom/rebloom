/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-confusing-arrow */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import getUse from './getUse';
import { extendedTimesSymbol } from './symbols';
import getListen from './getListen';
import listenOne from './listenOne';
import { KnownAny } from './types';

type Symbols = { [extendedTimesSymbol]: number };

type RebloomRecordRaw<T> = {
  [extendedTimesSymbol]: number;
  use: ReturnType<typeof getUse<T & Symbols>>;
  listen: ReturnType<typeof getListen<T & Symbols>>;
  useAll: {
    <F extends (o: T, keysChanged: (keyof T)[], prev: T) => any>(f: F, deps?: KnownAny[]): ReturnType<F>;
    (): T;
  };
  listenAll: (h: (o: T, keysChanged: (keyof T)[], prev: T) => void) => () => void;
  toJSON: () => T;
};

type RebloomRecord<T> = T & RebloomRecordRaw<T>;

// document this:
// [record] = useState(() => createRecord({ x: 1, y: '2' }))

export default function createRecord<T extends object>(init?: T) {
  let keysChanged: (keyof T)[] = [];
  let prev: T = { ...init } as T;
  const target: RebloomRecord<T> = {
    ...init as T,
    [extendedTimesSymbol]: 0,
    use: getUse<T & Symbols>(),
    listen: getListen<T & Symbols>(),
    useAll(this: RebloomRecord<T>, transform?: (o: T, keysChanged: (keyof T)[], prev: T) => any, deps?: KnownAny[]) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const memoTransform = useMemo(() => transform, deps ?? []);
      const [state, setState] = useState(() => memoTransform ? memoTransform({ ...this }, keysChanged, prev) : { ...this });
      const stateRef = useRef(state); // workaround to reduce # of renders when the same value is returned

      useEffect(() => {
        const handler = () => {
          const newState = memoTransform ? memoTransform({ ...this }, keysChanged, prev) : { ...this };
          if (newState !== stateRef.current) {
            stateRef.current = newState;
            setState(newState);
          }
        };

        return listenOne(target, extendedTimesSymbol, handler);
      }, [memoTransform]); // TODO: Add deps array to useAll (?)

      useEffect(() => {
        if (!deps) return;
        const newState = memoTransform ? memoTransform({ ...this }, keysChanged, prev) : { ...this };
        if (newState !== stateRef.current) {
          stateRef.current = newState;
          setState(newState);
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [memoTransform]);

      return state;
    },
    listenAll(this: RebloomRecord<T>, h: (o: T, keysChanged: (keyof T)[], prev: T) => void) {
      return listenOne(target, extendedTimesSymbol, () => {
        h({ ...this }, keysChanged, prev);
      });
    },
    toJSON(this: RebloomRecord<T>) {
      return { ...this };
    },
  };

  let immediate: NodeJS.Timeout | null = null;

  target.use = target.use.bind(target) as ReturnType<typeof getUse<T & Symbols>>;
  target.useAll = target.useAll.bind(target);
  target.listen = target.listen.bind(target) as ReturnType<typeof getListen<T & Symbols>>;
  target.listenAll = target.listenAll.bind(target);
  target.toJSON = target.toJSON.bind(target);

  Object.defineProperties(target, {
    [extendedTimesSymbol]: { enumerable: false, writable: true, configurable: true },
    use: { enumerable: false, writable: false, configurable: false },
    listen: { enumerable: false, writable: false, configurable: false },
    useAll: { enumerable: false, writable: false, configurable: false },
    listenAll: { enumerable: false, writable: false, configurable: false },
    toJSON: { enumerable: false, writable: false, configurable: false },
  });

  return new Proxy(target, {
    set: (obj, prop, value) => {
      if (target[prop as keyof T] !== value) {
        prev[prop as keyof T] = target[prop as keyof T];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        target[prop as keyof T] = value;
        keysChanged.push(prop as keyof T); // TODO: Turn into Set

        if (!immediate) {
          immediate = setTimeout(() => {
            immediate = null;
            target[extendedTimesSymbol] += 1;
            keysChanged = [];
            prev = { ...target };
          }, 0);
        }
      }

      return true;
    },

    deleteProperty: (obj, prop) => {
      if (prop in target) {
        prev[prop as keyof T] = target[prop as keyof T];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete target[prop as keyof T];
        keysChanged.push(prop as keyof T);

        if (!immediate) {
          immediate = setTimeout(() => {
            immediate = null;
            target[extendedTimesSymbol] += 1;
            keysChanged = [];
            prev = { ...target };
          }, 0);
        }
      }

      return true;
    },
  });
}
