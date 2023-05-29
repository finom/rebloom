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

> Type-safe React state library for scalable apps with zero setup and zero additional knowledge required. No reducers, sagas or observers anymore, only TypeScript!

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

After you read this README you're going to have well-built, extensible and type-safe application state with unlimited structure. We're going to hide `store` variable to make it impossible to be used directly in your modules. Even though `store` is a nested object with all the methods and properties available, we're going to apply some TypeScript to reveal what components and other modules would need (for example you implement a method that's going to be used by store but it should not be available at components). 

Components aren't going to be able to use nested syntax to access the store. Instead, we're going to use one level of object nesting in components (which means no `foo.bar.baz` to access a property in a store). Methods aren't going to be available for direct calls (`users.loadUsers()`) and you're going to need to export them manually.

```ts
import users, { loadUsers } from './store/users';
import profile, { loadProfile, updateProfile } from './store/users/profiles';
import companies, { deleteCompany } from './store/companies';
import baz, { method1, method2, method3 } from './store/foo/bar/baz';

const MyComponent = () => {
  const ids = users.use('ids');
  const companyName = companies.use('name'); 

  // nested things such as users.profile, foo.bar.baz, users.loadUsers are unabailable
  // users.loadUsers(); // error

  useEffect(() => {
    loadUsers().then(() => {
      // ...
      users.ids = [...user.ids, id];
      companies.name = 'Hello world';
    });
  }, [ids]);

  // ...
}
```

Shape of `RootStore` used at the example:

```ts
interface RootStore {
  users: {
    ids: string[];
    loadUsers: () => Promise<void>;

    profile: {
      loadProfile: () => Promise<void>;
      updateProfile: () => Promise<void>;
    }
  }

  companies: {
    name: string;
    deleteCompany: () => Promise<void>;
  }

  foo: {
    bar: {
      baz: {
        method1: () => void;
        method2: () => void;
        method3: () => void;
      }
    }
  }
}
```

----------

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

To access `store` variable available at `window.store` use this universal snippet:

```ts
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as { store: RootStore }).store = store;
}
```

### Split store into files

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
  readonly loadUsers = () => {
    // you have access to any part of the store
    this.store.companies.doSomething();
    // ...
  }
}
```

Destructure methods before they was used for better code.

```ts
const MyComponent = () => {
  const { increment, decrement, users: { loadUsers } } = store;
  // ...
}

// or destructure above the component

const { increment, decrement, users: { loadUsers } } = store;

const MyComponent = () => {
  // ...
}
```

----------

Another way to build your store is to export instances of sub-stores instead of classes.

```ts
// ./store/users.ts
import Use0 from 'use-0';
import type { RootStore } from '.';

class Users extends Use0 {
  store!: RootStore; // ! allows to define "store" property later
  readonly loadUsers = () => {
    // you have access to any part of the store
    this.store.companies.doSomething();
    // ...
  }
}

const users = new Users();

export default users;
```

Then assign `store` value to sub-stores manually.

```ts
import Use0 from 'use-0';
import users from './users';
import companies from './companies';

export class RootStore extends Use0 {
  readonly users = users;
  readonly companies = companies;
  constructor() {
    super();
    // you can write a function that automates that:
    // this.assignStore(users, companies, ...rest);
    users.store = this;
    companies.store = this;
  }
}
```

This way to architect the store makes possible to export sub-stores and their methods separate from the root store.

```ts
// ./store/users.ts
class Users extends Use0 {
  store!: RootStore;
  ids = [1, 2, 3];
  readonly loadUsers = async () => {
    // this.store.doSomething();
  }
  readonly createUser = async () => {
    // ...
  }
}

const users = new Users();

export const { loadUsers, createUser } = users;

export default users;
```

Then you can import the sub-store and the methods to your component.

```ts
import users, { loadUsers, createUser } from './store/users';
// import companies, { loadCompanies, doSomething } from './store/companies';

const MyComponent = () => {
  const ids = users.use('ids');

  useEffect(() => {
    createUser().then(() => {
      // ...
      users.ids = [...ids, id];
    })
  }, [ids]);
}
```

At this case if you don't need direct access to the root store you can delete export of the variable to keep code safer.

```ts
export class RootStore {
  // ...
}

new RootStore(); // don't export, just initialise
// optionally create a variable that is available at window.store
```

After that import the module somewhere to initialise the store.

```ts
import './store';
```

Now it's impossible to import the root store from other modules.

```ts
// does not work anymore
import store from './store'; 
// import sub-stores and methods instead
import users, { loadUsers, createUser } from './store/users';

const MyComponent = () => {
  // ...
}
```

----------

We import methods and sub-stores separately but you still can access methods of `users` instance. In other words you still have 2 ways to call the method from your components.

```ts
import users, { loadUsers, createUser } from './store/users';

const MyComponent = () => {
  const ids = users.use('ids');

  loadUsers();

  users.loadUsers();
  // ...
}
```

To avoid that and make code stricter we can export the sub-store with its methods hidden.

```ts
export class Users extends Use0 {
  // ...
}

const users = new Users();

export const { loadUsers, createUser } = users;

export default users as OmitMethods<Users>; // override
```

Now we're not able to use methods but we have our all other properties available.

```ts
import users, { loadUsers, createUser } from './store/users';


const MyComponent = () => {
  const ids = users.use('ids');

  // userd.ids = [...ids, 4];

  loadUsers();

  users.loadUsers(); // error
  // ...
}
```

Since we're re-defined default export we need to update `RootStore` so `users` has valid type.

```ts
import Use0 from 'use-0';
import users, { Users } from './users';

export class RootStore extends Use0 {
  readonly users = users as Users; // override back
  constructor() {
    super();
    users.store = this;
  }
}
```

Implementation of `OmitMethods`:

```ts
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];
  
export type OmitMethods<T> = Omit<T, Exclude<FunctionPropertyNames<T>, 'use'> | 'store'>;
```

The type also preserves `use` method and hides `store` property.

An alternative way to protect your methods from being used by other module is to apply similar pattern but define two classes: one for data, another for methods and use `users as UserData` to override the default export type. At this case you don't need `OmitMethods` type anymore.

```ts
class UserData extends Use0 {
  ids = [1, 2, 3];
}

export class User extends UserData {
  readonly loadUsers = async () => {
    console.log(this.ids);
  }
}

const users = new Users();

export const { loadUsers } = users;

export default users as UserData; // override
```

Use the same code for the root store to make `RootStore['users']` have all the methods available.

```ts
import Use0 from 'use-0';
import users, { Users } from './users';
import companies, { Companies } from './companies';

export class RootStore extends Use0 {
  readonly users = users as Users; // override back
  readonly companies = companies as Companies; // override back
  constructor() {
    super();
    users.store = this;
    companies.store = this;
  }
}
```

Using either `OmitMethods` or class splitting you can also hide other sub-stores.

```ts
class UserData extends Use0 {
  ids = [1, 2, 3];
}

class User extends UserData {
  readonly profiles: Profiles; // <--
  readonly loadUsers = async () => {
    console.log(this.ids);
  }
}

const users = new Users();

export default users as UserData;
```

`profiles` sub-store is not available anymore when `users` is imported.

```ts
import users from './store/users';

users.profiles.doSomething(); // error since "profiles" doesn't exist at UserData class
```

Your complex component module imports are going to look similar to this:

```ts
import users, { loadUsers } from './store/users';
import profile, { loadProfile, updateProfile } from './store/users/profiles';
import companies, { deleteCompany } from './store/companies';
import baz, { method1, method2, method3 } from './store/foo/bar/baz';

const MyComponent = () => {
  const ids = users.use('ids');

  useEffect(() => {
    loadUsers();
  }, [ids]);

  // ...
}
```

And you cannot use nested store properties anymore since sub-stores are protected.

```ts
users.profiles.use('something'); // error

// but
profiles.use('something'); // no error
```

### Conclusion

1. Using patterns above we restrict the code and provide only one way to import the store by component modules: `import subStoreWithNoMethods, { method1, method2 } from './store/foo/bar/baz` where default export is used for "data" and named export is used for actions. It doesn't make sense to provide full store access to other modules that aren't related to the store.
2. Store class methods still have full access to the store and other-sub stores at their methods using `this.store`.
3. You get infinite scaling using less code and no additional concepts to learn.

### (Optional) Split your methods

In case if a class is too big because of long methods you can move them to another file. This way allows to refactor further by moving methods to individual files and re-exporting them in one file.

```ts
// ./store/users/methods.ts
import type { Users } from ".";

export async function loadUsers(this: Users, something: string) {
  // this.store.increment();
  console.log(this.ids);
}
```

Then make the methods available at the class by binding instance context to the methods using `bind`.

```ts
// ./store/users/index.ts
import * as m from './methods';

export class Users extends Use0 {
  store!: RootStore;
  readonly loadUsers: typeof m.loadUsers;
  ids = [1, 2, 3];
  constructor() {
    super();
    // you can write a function that automates that
    // this.rebind(m) or super(m)
    this.loadUsers = m.loadUsers.bind(this); // makes "this: Users" context available at the function
  }
}
```

You may want to define your method with this type that allows to unbind it preserving the `this` context.

```ts
type RemoveThis<F extends (this: any, ...args: any[]) => any> = F extends (this: infer T, ...args: infer A) => infer R ? (...args: A) => R : never;
```

```ts
export class Users extends Use0 {
  readonly loadUsers: RemoveThis<typeof m.loadUsers>;
  // ...
}
```

Type `RemoveThis` allows to fix a TypeScript error that appears when you assign the method to a variable.

```ts
const { loadUsers } = store.users; // no error
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
  count = 1,
  companies: of({
    name: 'My company',
    someMethod:() { /* ... */ }
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
