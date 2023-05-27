# 🖤 use-0 - not redux

[![npm version](https://badge.fury.io/js/use-0.svg)](https://badge.fury.io/js/use-0) [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/) [![Build status](https://github.com/finom/use-0/actions/workflows/main.yml/badge.svg)](https://github.com/finom/use-0/actions)

<svg width="456" height="178.07406795535508" viewBox="0 0 249.99999999999997 97.62832672990956" class="css-1j8o68f"><defs id="SvgjsDefs1807"></defs><g id="SvgjsG1808" featurekey="ewgXDI-0" transform="matrix(4.683402264206603,0,0,4.683402264206603,-4.215062484429988,2.8362659743136085)" fill="#111111"><path d="M4.82 20.16 c-1.94 0 -3.92 -1.3 -3.92 -4.6 l0 -5.96 l3.16 0 l0 5.74 c0 1.58 0.54 2.08 1.54 2.08 c1.42 0 2.24 -1.38 2.44 -1.98 l0 -5.84 l3.16 0 l0 10.4 l-3.16 0 l0 -1.8 c-0.2 0.5 -1.26 1.96 -3.22 1.96 z M18.18 12.879999999999999 c-0.28 -0.72 -0.7 -0.96 -1.16 -0.96 c-0.42 0 -0.84 0.24 -0.84 0.64 c0 0.38 0.24 0.6 0.7 0.76 l1.32 0.46 c1.48 0.54 2.98 1.08 2.98 3.16 c0 2.1 -2.1 3.3 -4.26 3.3 c-1.94 0 -3.76 -1.14 -4.2 -2.96 l2.48 -0.78 c0.26 0.58 0.72 1.24 1.72 1.24 c0.68 0 1.12 -0.44 1.12 -0.84 c0 -0.2 -0.16 -0.46 -0.66 -0.66 l-1.22 -0.44 c-2.08 -0.76 -3.06 -1.82 -3.06 -3.3 c0 -1.94 1.8 -3.08 3.78 -3.08 c2.02 0 3.36 1.1 3.96 2.76 z M27.96 9.42 c2.36 0 5.66 1.78 5 6.48 l-7.26 0 c0.36 1.08 1.3 1.64 2.56 1.64 c1.28 0 1.68 -0.28 2.4 -0.58 l1.74 1.68 c-0.92 0.9 -2.16 1.56 -4.26 1.56 c-2.58 0 -5.66 -1.78 -5.66 -5.36 c0 -3.64 3.12 -5.42 5.48 -5.42 z M27.96 12.120000000000001 c-0.9 0 -1.82 0.52 -2.22 1.56 l4.42 0 c-0.32 -1.04 -1.3 -1.56 -2.2 -1.56 z M40.84 13.219999999999999 l0 2.64 l-6.2 0 l0 -2.64 l6.2 0 z M48.46 5.800000000000001 c3.12 0 5.82 2.34 5.82 7.2 c0 4.88 -2.7 7.2 -5.82 7.2 c-3.08 0 -5.82 -2.32 -5.82 -7.2 c0 -4.86 2.74 -7.2 5.82 -7.2 z M48.46 8.56 c-2.36 0 -2.76 2.58 -2.76 4.44 c0 1.88 0.4 4.44 2.76 4.44 s2.78 -2.56 2.78 -4.44 c0 -1.86 -0.42 -4.44 -2.78 -4.44 z"></path></g></svg>

> Type-safe React application state library with zero setup. Powered by `Object.defineProperty`.

## Quick start

```sh
npm i use-0
# yarn add use-0
```

```ts
import Use0 from 'use-0';

// 1. Define your root store
// Use0 adds a "use" method to the RootStore instance; that's all it does.
class RootStore extends Use0 {
  count: 1;
}

const store = new RootStore();

// 2. Use
export default () => {
  const count = store.use('count'); // same as store['count'] but works as a hook

  return (
    <div onClick={() => store.count++}>Clicks: {count}</div>
  );
}
```

TypeScript output:

<img width="560" alt="image" src="https://github.com/finom/use-0/assets/1082083/2edf53c6-3f0b-418e-a366-ff2d7158513f">


## Slow start

Create your store with ES6 classes extended by `Use0`. It's recommended to split it into multiple objects that I call "sub-stores". In the example below `Users` and `Companies` are sub-stores. Level of nesting is unlimited as for any other JavaScript object.

```ts
// store.ts
import Use0 from 'use-0';

class Users extends Use0 {
  ids = [1, 2, 3];
  readonly loadUsers = async () => await fetch('/users');
}

class Companies extends Use0 {
  name = 'My Company';
}

class RootStore extends Use0 {
  readonly users = new Users();
  readonly companies = new Companies();
  readonly increment = () => this.count++;
  readonly decrement = () => this.count--;
  count = 0;
}

const store = new RootStore();

export default store;
```

Use the `readonly` prefix to prevent class members from being reassigned.

Call `use` method to access `store` object properties in your component.

```ts
import store from './store';

const MyComponent = () => {
  const count = store.use('count');
  const ids = store.users.use('ids');
  const name = store.companies.use('name');
  // ...
```

To change value, assign a new value.

```ts
store.count++;
store.users.ids = [...store.users.ids, 4];
store.companies.name = 'Hello';
```

Pass values returned from `use` as dependencies for hooks.

```ts
const ids = store.users.use('ids');

useEffect(() => { console.log(ids); }, [ids])
```

Call methods for actions.

```ts
useEffect(() => {
  store.users.loadUsers().then(() => {
    store.decrement();
    // ...
  });
}, []); // methods don't need to be dependencies
```

You can split sub-stores into multiple files and access the root store using the first argument.

```ts
// ./store/index.ts
import Use0 from 'use-0';
import Users from './Users';
import Companies from './Companies';

export class RootStore extends Use0 {
  readonly users: Users;
  readonly companies: Companies;
  constructor() {
    super();
    this.users = new Users(this);
    this.companies = new Companies(this);
  }
}
```

```ts
// ./store/Users.ts (Companies.ts is similar)
import Use0 from 'use-0';
import type { RootStore } from '.'; // "import type" avoids circular errors with ESLint

export default class Users extends Use0 {
  constructor(private readonly store: RootStore) {} // fancy syntax to define private member
  readonly loadUsers() {
    // you have access to any part of the store
    const something = this.store.companies.doSomething();
    // ...
  }
}
```

To access the store using dev tools use this snippet:

```ts
// ./store/index.ts
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as { store: RootStore }).store = store;
}
```

It's recommended to destructure all methods that are going to be called to make it obvious and to write less code at hooks and components.

```ts
const MyComponent = ({ id }) => {
  const { increment, decrement, users: { loadUsers } } = store;
  // ...
}
```

or better

```ts
const { increment, decrement, users: { loadUsers } } = store;

const MyComponent = ({ id }) => {
  // ...
}
```

## Use0.of

If you don't want to define a class, you can use this static method. `Use0.of<T>(data?: T): Use0 & T` returns an instance of `Use0` with the `use` method, and uses the first optional argument as initial data.

```ts
class RootStore extends Use0 {
  readonly coordinates = Use0.of({ x: 0, y: 100 });
  // ...

const MyComponent = () => {
  const x = store.coordinates.use('x');
  const y = store.coordinates.use('y');
  // ..
  // store.coordinates.x = 100;
```

TypeScript output:      

<img width="439" alt="image" src="https://github.com/finom/use-0/assets/1082083/0f105911-62db-457c-a732-cbd5d55782e7">

You can also define custom record:

```ts
interface Item {
  hello: string;
}

class RootStore extends Use0 {
  data: Use0.of<Record<string, Item>>();
  // ...
}

// ...
```

And access values as expected using regular variable:

```ts
const MyComponent = ({ id }: { id: string }) => {
  const item = store.data.use(id); // same as store.data[id] but works as a hook
  // ...
  // store.data[id] = someValue; // triggers the component to re-render
```

For a very small app you can define your entire application state using `Use0.of` method (also exported as a constant).

```ts
// store.ts
import { of } from 'use-0';

const store = of({
  count: 1;
  companies: of({
    name: 'My company',
    someMethod() { /* ... */ }
  }),
});

export default store;
```

```ts
import store from './store';

const MyComponent = () => {
  const count = store.use('count'); // same as store['count'] but works as a hook
  const name = store.companies.use('name'); // same as store.companies['name'] but works as a hook

  // store.companies.someMethod();
  // store.companies.name = 'Hello'; // triggers the component to re-render
  // ...
}
```
