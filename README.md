# act0 - not a "redux"

> Type-safe React application state library with zero setup. Powered by `Object.defineProperty`.

## Quick start

```sh
npm i act0
# yarn add act0
```

```ts
import Act0 from 'act0';

// 1. Define your root store
// Act0 adds "use" method to the RootStore instance, that's all what it does
class RootStore extends Act0 {
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

Create your store with ES6 classes extended by `Act0`. It's recommended to split it into multiple objects that I call "sub-stores". In the example below `Users` and `Companies` are sub-stores. Level of nesting is unlimited as for any other JavaScript object.

```ts
// store.ts
import Act0 from 'act0';

class Users extends Act0 {
  ids = [1, 2, 3];
  readonly loadUsers = () => fetch('/users')
}

class Companies extends Act0 {
  name = 'My Company';
}

class RootStore extends Act0 {
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
  constructor() {
    this.users = new Users(this);
  }
}
```

```ts
// ./store/Users.ts (Companies.ts is similar)
import type { RootStore } from '.'; // "import type" avoids circular errors

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
```

or better

```ts
const { increment, decrement, users: { loadUsers } } = store;

const MyComponent = ({ id }) => {
  // ...
```



## Act0.of

If you don't want to define class you can use this static method. `Act0.of<T>(data?: T): Act0 & T` returns `Act0` instance with `use` method as type union of `Act0` and first optional argument. 

```ts
class RootStore extends Act0 {
  readonly coordinates = Act0.of({ x: 0, y: 100 });
  // ...

const MyComponent = () => {
  const x = store.coordinates.use('x');
  const y = store.coordinates.use('y');
  // ..
  // store.coordinates.x = 100;
```

You can also define custom record:

```ts
class RootStore extends Act0 {
  data: Act0.of<Record<string, any>>();
  // ...
}

// ...
```

And acces values as usual:

```ts
const MyComponent = ({ id }) => {
  const item = store.data.use(id); // returns store.data[id]
  // ...
  // store.data[id] = someValue; // triggers the component to re-render
```

For a very small app you can define your entire application state using `Act0.of` method (also exported as a constant).

```ts
// store.ts
import { of as act } from 'act0';

const store = act({
  count: 1,
  companies: act({
    name: 'My company',
    orEvenSomeMethod() { /* ... */ }
  }),
});

export default store;
```

```ts
import store from './store';

const MyComponent = () => {
  const count = store.use('count'); // same as store['count'] but reactive
  const name = store.companies.use('name'); // same as store.companies['name'] but reactive

```
