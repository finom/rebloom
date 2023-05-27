# 🖤 use-0 - not a "redux"

> Type-safe React application state library with zero setup. Powered by `Object.defineProperty`.

## Quick start

```sh
npm i use-0
# yarn add use-0
```

```ts
import Use0 from 'use-0';

// 1. Define your root store
// Use0 adds "use" method to the RootStore instance, that's all what it does
class RootStore extends Use0 {
  count: 1,
}

const store = new RootStore();

// 2. Use
export default () => {
  const count = store.use('count'); // same as store['count'] but reactive

  return (
    <div onClick={() => store.count++}>Clicks: {count}</div>
  );
}
```

## Slow start

Create your store with ES6 classes extended by `Use0`. It's recommended to split it into multiple objects that I call "sub-stores". In the example below `Users` and `Companies` are sub-stores. Level of nesting is unlimited as for any other JavaScript object.

```ts
// store.ts
import Use0 from 'use-0';

class Users extends Use0 {
  ids = [1, 2, 3];
  readonly loadUsers = () => fetch('/users')
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

Use `readonly` prefix to protect class members to be reassigned.

Use `use` method to access `store` object properties in your component.

```ts
const MyComponent = () => {
  const count = store.use('count');
  const ids = store.users.use('ids');
  const name = store.companies.use('ids');
  // ...
```

To change value, assign a new value.

```ts
store.count++;
store.users.ids = [...store.users.ids, 4]
```

Call methods for actions.

```ts
useEffect(() => {
  store.users.loadUsers().then(() => {
    store.decrement();
    // ...
  });
}, []); // no dependencies for methods
```

Pass values returned from `use` as dependencies for hooks.

```ts
const count = store.use('count');

const callback = useCallback(() => { console.log(count); }, [count])
```

You can split sub-stores into multiple files and access root store using first argument.

```ts
// ./store/index.ts
import Users from './Users';
import Companies from './Companies';

export class RootStore {
  readonly users: Users;
  readonly companies: Companies;
  constructor() {
    this.users = new Users(this);
    this.companies = new Companies(this);
  }
}
```

```ts
// ./store/Users.ts (Companies.ts is similar)
import type { RootStore } from '.'; // "import type" avoids circular errors with ESLint

export default class Users {
  #store: RootStore;
  constructor(store: RootStore) {
    this.#store = store;
  }
  readonly loadUsers() {
    // you have access to any part of the store
    const something = this.#store.companies.doSomething();
    // ...
  }
}
```

I recommend to destructure all methods that are going to be called to make it obvious and to write less code at hooks and components.

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

If you don't want to define class you can use this static method. `Use0.of<T>(data?: T): Use0 & T` returns `Use0` instance with `use` method and uses firtst argument as initial values. 

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
class RootStore extends Use0 {
  data: Use0.of<Record<string, Item>>();
  // ...
}

// ...
```

And acces values as usual:

```ts
const MyComponent = ({ id }) => {
  const item = store.data.use(id); // same as store.data[id] but reactive 
  // ...
  // store.data[id] = someValue; // triggers the component to re-render
```

For a very small app you can define your entire application state using `Use0.of` method (also exported as a constant).

```ts
// store.ts
import { of } from 'use-0';

const store = of({
  count: 1,
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
  const count = store.use('count'); // same as store['count'] but reactive
  const name = store.companies.use('name'); // same as store.companies['name'] but reactive

  // store.companies.someMethod();
```
