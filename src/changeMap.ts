/* eslint-disable no-underscore-dangle */
import type { Handler, KnownAny } from './types';

// allow to use one global WeakMap to support multiple instances of rebloom
// for example two different scripts that both use their own rebloom instance
// and they share one object to listen to
const globalObject = typeof window !== 'undefined'
  ? (window as { __useChangeObjectMap?: WeakMap<KnownAny, Record<KnownAny, Handler<KnownAny>[]>> })
  : {};

const changeMap = globalObject.__useChangeObjectMap
  || new WeakMap<KnownAny, Record<KnownAny, Handler<KnownAny>[]>>();

globalObject.__useChangeObjectMap = changeMap;

export default changeMap;
