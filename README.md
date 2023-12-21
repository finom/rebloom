<p align="center">
  <picture>
    <source width="350" media="(prefers-color-scheme: dark)" srcset=".assets/use-0-white.svg">
    <source width="350" media="(prefers-color-scheme: light)" srcset=".assets/use-0.svg">
    <img width="350" alt="vovk" src=".assets/use-0.svg">
  </picture>
</p>
<br>
<p align="center">
  <a href="https://badge.fury.io/js/use-0">
      <img src="https://badge.fury.io/js/use-0.svg" alt="npm version" />
  </a>
  <a href="http://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript" />
  </a>
  <a href="https://github.com/finom/use-0/actions">
      <img src="https://github.com/finom/use-0/actions/workflows/main.yml/badge.svg" alt="Build status" />
  </a>
</p>

> The simplest application state library ever

**use-0** exports `getUse` function that turns any object into a use-able object whose properties are going to be listened by `use` hook.

```ts
// appState.ts
import { getUse } from 'use-0';

class AppState {
  // define "use"
  readonly use = getUse<AppState>();

  // define other properties
  count = 0;
  ids: number[] = [];
  
  // define methods
  readonly increment = () => this.count++;
  readonly decrement = () => this.count--;
}

// instantiate the class and export the instance
const appState = new AppState();

export default appState;
```

```ts
// MyComponent.ts
import appState from './appState';

const MyComponent = () => {
  // the component is re-rendered when count or ids are re-assigned
  const count = appState.use('count');
  const ids = appState.use('ids');

  return (
    <div onClick={() => appState.count++}>Clicks: {count}</div>
  )
}

export default MyComponent;
```

A use-able object is a regular object and all its properties and methods are used in the traditional way. Properties need to maintain immutability to invoke the property accessor. `readonly` prefix protects properties to be reassigned.

```ts
appState.count++;
appState.ids = [...store.users.ids, 4];
appState.increment();
```

## Other ways to invoke

### Plain object

```ts
// appState.ts
import { type WithUse, getUse } from 'use-0';

type AppState = WithUse<{
  count: number;
  ids: number[];
}>;

const appState: AppState = {
  use: getUse(),
  count: 0,
  ids: [],
}
```

### Static class

```ts
// appState.ts
import { getUse } from 'use-0';

export default class AppState {
  // define "use"
  static readonly use = getUse<typeof AppState>();

  // define other properties
  static count = 0;
  static ids: number[] = [];
  
  // define methods
  static readonly increment = () => this.count++;
  static readonly decrement = () => this.count--;
}
```

```ts
// MyComponent.ts
const MyComponent = () => {
  const count = AppState.use('count');
  const ids = AppState.use('ids');

  return (
    <div onClick={() => AppState.count++}>Clicks: {count}</div>
  )
}
```

## State structure

It's recommended to split application state into files and then collect them into the centralised application state object. At the example below we create two classes that are instantiated in `AppState` class. They also implement constructor that accepts the `appState` as an argument and defines `#appState` property that can be used by other methods.

```ts
// PostState.ts
import { getUse } from 'use-0';
import type { AppState } from './appState';

class PostState {
  readonly use = getUse<PostState>();
  
  ids: number[] = [];
  
  readonly loadPosts = async () => await fetch(/* ... */)

  readonly #appState: AppState;

  constructor(appState: AppState) {
    this.#appState = appState;
  }
}
```

```ts
// CommentState.ts
import { getUse } from 'use-0';
import type { AppState } from './appState';

class CommentState {
  readonly use = getUse<CommentState>();
  
  ids: number[] = [];
  
  readonly loadComments = async () => await fetch(/* ... */)

  readonly #appState: AppState;

  constructor(appState: AppState) {
    this.#appState = appState;
  }
}
```

```ts
// appState.ts
import { getUse } from 'use-0';
import PostState from './PostState';
import CommentState from './CommentState';

class AppState {
  readonly use = getUse<AppState>();

  readonly post: PostState;
  readonly comment: CommentState;

  constructor() {
    this.post = new PostState(this);
    this.comment = new CommentState(this);
  }
}

// instantiate the class and export the instance
const appState = new AppState();

export type { AppState };

export default appState;
```

Components can import `appState` and access other use-able objects.

```ts
// MyComponent.ts
// ...
useEffect(() => {
  void appState.post.loadPosts().then((ids) => {
    appState.post.ids = ids;
  });
})
// ...

```