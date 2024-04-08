/* eslint-disable @typescript-eslint/no-explicit-any */
import listenOne from './listenOne';

type Value<TState, TKey> = TState[TKey & keyof TState];

/*
o.listen('x', (x, key, prevObject) => ...);
o.listen(['x', 'y'], ([x, y], key, prevObject) => ...);
o.listenAll((o, key, prevObject) => ...);
*/
/*
export type Listen<TState> = {
  <TKey extends keyof TState>(this: TState, key: TKey, f: (val: Value<TState, TKey>, key: TKey, prevState: TState) => void): () => void;
  <TKeys extends readonly (keyof TState)[]>(this: TState, keys: readonly [...TKeys], f: (val: { [K in keyof TKeys]: Value<TState, TKeys[K]> }, key: TKeys[number], prevState: TState) => void): () => void;
};
*/

export default function getListen<TState>() {
  function listen<TKey extends keyof TState>(this: TState, key: TKey, f: (val: Value<TState, TKey>, key: TKey, prevState: TState) => void): () => void;
  function listen<TKeys extends readonly (keyof TState)[]>(this: TState, keys: readonly [...TKeys], f: (val: { [K in keyof TKeys]: Value<TState, TKeys[K]> }, key: TKeys[number], prevState: TState) => void): () => void;
  function listen(this: TState, givenKeys: keyof TState | readonly (keyof TState)[], f: (val: any, key: keyof TState, prevState: TState) => void) {
    const keys = givenKeys instanceof Array ? givenKeys : [givenKeys];

    const unlisten = keys.map((key) => {
      const handler = (val: unknown, prev: unknown) => {
        const prevState = { ...this, [key]: prev };
        if (givenKeys instanceof Array) {
          f(keys.map((k) => this[k]), key, prevState);
        } else {
          f(val, key, prevState);
        }
      };

      return listenOne(this, key, handler);
    });

    return () => {
      unlisten.forEach((u) => u());
    };
  }

  return listen;
}
