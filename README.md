# 🌻 rebloom (WIP)

<br>
<p align="center">
  <a href="https://badge.fury.io/js/rebloom"><img src="https://badge.fury.io/js/rebloom.svg" alt="npm version" /></a>
  <a href="http://www.typescriptlang.org/"><img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" alt="TypeScript" /></a>
  <a href="https://github.com/finom/rebloom/actions"><img src="https://github.com/finom/rebloom/actions/workflows/main.yml/badge.svg" alt="Build status" /></a>
</p>

**rebloom** exports the `getUse` function that turns any object into a use-able object whose properties are listened to by the `use` property hook inside React components.

```ts
// appState.ts
import { getUse } from 'rebloom';

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
  // the component is re-rendered when 'count' or 'ids' are reassigned
  const count = appState.use('count');
  const ids = appState.use('ids');

  return (
    <div onClick={() => appState.count++}>Clicks: {count}</div>
  )
}

export default MyComponent;
```

A use-able object is a regular object, and all its properties and methods are used in the traditional way. Properties need to maintain immutability to invoke the [property accessor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty). The `readonly` prefix protects properties from being reassigned.


```ts
appState.count++;
appState.ids = [...state.users.ids, 4];
appState.increment();
appState.increment = () => {}; // error because of the "readonly" prefix
```

## Other ways to invoke

### Plain object

```ts
// appState.ts
import { type WithUse, getUse } from 'rebloom';

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

Use the same principle as with an instantiable class, but all class members are defined with the `static` prefix, and the class isn't instantiated but used directly as an object.


```ts
// appState.ts
import { getUse } from 'rebloom';

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
import AppState from './appState';

const MyComponent = () => {
  const count = AppState.use('count');
  const ids = AppState.use('ids');

  return (
    <div onClick={() => AppState.count++}>Clicks: {count}</div>
  )
}

export default MyComponent;
```
