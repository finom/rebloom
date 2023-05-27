<p align="center">
<img src="assets/logo.svg" width="300">
<br><br>
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
const callback = useCallback(() => {
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

To access `store` variable using dev tools use this universal snippet:

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
