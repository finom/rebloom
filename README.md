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

> Type-safe React state library for scalable apps with zero setup and zero additional knowledge required. Here you'll find tiny documentation with very detailed examples on how use the library, how to use it with standard hooks such as `useEffect`, how to to protect private data and actions from being used by components, how to avoid direct access to root store and also how to structure your files for a large-scale app.

<!-- TOC -->

- [Quick start](#quick-start)
- [Intro](#intro)
- [Basics](#basics)
- [Split store into files](#split-store-into-files)
    - [Basic file structure](#basic-file-structure)
    - [Scalable file structure](#scalable-file-structure)
    - [Advanced data protection](#advanced-data-protection)
    - [Nested store](#nested-store)
    - [Conclusion](#conclusion)
- [Additional information](#additional-information)
    - [Split your methods](#split-your-methods)
    - [Alternative syntax](#alternative-syntax)
- [Use0.of](#use0of)

<!-- /TOC -->

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
  count = 1;
}

const store = new RootStore();

// 2. Use
export default () => {
  const count = store.use('count'); // same as store.count but works as a hook

  return (
    <div onClick={() => store.count++}>Clicks: {count}</div>
  );
}
```

## Intro

After you read this README you're going to have extensible and type-safe application state with unlimited structure. We're going to hide `store` variable to make it impossible to be used directly in your modules. Even though `store` is a nested object with all the methods and properties available, we're going to apply some TypeScript to reveal what components and other modules would need (for example you implement a method that's going to be used by store but it should not be available at components). 

Components aren't going to be able to use nested syntax to access the store. Instead, we're going to use one level of object nesting in components (which means no `foo.bar.baz` to access a property in a store). Methods aren't going to be available for direct calls (`users.loadUsers()`) and you're going to export them manually.

The goal is to provide to a component only what it needs but never full access to the store. We'll start from basic examples.

```ts
import users, { loadUsers } from './store/users';
import profile, { loadProfile, updateProfile } from './store/users/profiles';
import companies, { deleteCompany } from './store/companies';
import baz, { method1, method2, method3 } from './store/foo/bar/baz';

const MyComponent = () => {
  const ids = users.use('ids');
  const companyName = companies.use('name'); 

  // nested things such as users.profile, foo.bar.baz, users.loadUsers are unavailable
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

Shape of `RootStore` used at the example above:

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

## Basics

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

Call `use` method to access object properties in your component.

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

## Split store into files

### Basic file structure

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

Destructure methods for better code before they was used in your component.

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

### Scalable file structure

Another way to build your store is to export instances of sub-stores instead of classes. To make the root store to be available we're going to use `init` method instead of a constructor.

```ts
// ./store/users.ts
import Use0 from 'use-0';
import type { RootStore } from '.';

class Users extends Use0 {
  private store!: RootStore; // ! symbol allows to define "store" property outside of counstructor
  readonly init: (store: RootStore) => {
    this.store = store;
  }
  readonly loadUsers = () => {
    this.store.companies.doSomething();
    // ...
  }
}

const users = new Users();

export default users; // default export of the instance instead of the class
```

Then call `init` for every sub-store you have.

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
    // this.initStore(users, companies, ...rest);
    users.init(this);
    companies.init(this);
  }
}
```

You can create `initStore` method to handle that automatically.

```ts
export class RootStore extends Use0 {
  // ...
  constructor() {
    super();
    this.initStore();
  }

  initStore = () => {
    for(const member of Object.values(this)) {
      if(typeof member.init === 'function') member.init(this);
    }
  }
}
```

This way to architect the store makes possible to export sub-stores and their methods separate from the root store.

```ts
// ./store/users.ts
class Users extends Use0 {
  private store!: RootStore;
  ids = [1, 2, 3];
  readonly init: (store: RootStore) => { this.store = store; }
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

At this case if you don't need direct access to the root store you can delete export of the variable to keep code safer. You can also remove `extends Use0` from the `RootStore` class since its instance is not able to be used by components or other modules anymore.

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
import store from './store'; // store is undefined
// import sub-stores and methods instead
import users, { loadUsers, createUser } from './store/users';

const MyComponent = () => {
  // ...
}
```

Now the only way to access the root store is to use it at sub-store methods.

> Tip: Use `use` hook provided by experimental version of React to call your async methods in a nice manner.

```tsx
import { use } from 'react';
import users, { loadUsers } from './store/users';

const MyComponent = () => {
  const items = use(loadUsers()); // no await

  return (
    <div>{items.map(/* ... */)}</div>
  );
}
```

If you still need access to the root store for some particular module you can import store as `never` and then convert it back to `RootStore`.

```ts
class RootStore() {}

const store = new RootStore();

export const _store as never;
```

```ts
import { _store, RootStore } from './store';

console.log(_store); // error since _store has type "never"

const store = _store as RootStore;

console.log(store); // now it's OK
```

To fix ESLint error about `_` symbol in the variable name you can modify the following rule:

```ts
'@typescript-eslint/naming-convention': [2, { leadingUnderscore: true }]
```

If you need some root-level properties you can define another sub-store caled `App` or `Settings`.

```ts
// ./store/settings
class Settings extends Use0 {
  theme = 'dark';
}

const settings = new Settings();

export default settings;
```

----------

We import methods and sub-stores separately but you still can access methods of `users` instance. In other words you still have 2 ways to call the method from your components.

```ts
import users, { loadUsers, createUser } from './store/users';

const MyComponent = () => {
  const ids = users.use('ids');

  loadUsers(); // good

  users.loadUsers(); // bad
  // ...
}
```

To avoid that we can export the sub-store with its methods hidden. The simplest way is to use `OmitMethods` type.

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

  loadUsers(); // OK

  users.loadUsers(); // error
  // ...
}
```

Since we're re-defined default export we need to update `RootStore` so `users` has valid type. Nested sub-stores should follow the same pattern.

```ts
import Use0 from 'use-0';
import users, { type Users } from './users';

export class RootStore extends Use0 {
  readonly users = users as Users; // override back
  constructor() {
    super();
    this.users.init(this);
  }
}
```

Implementation of `OmitMethods`:

```ts
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];
  
export type OmitMethods<T> = Exclude<FunctionPropertyNames<T>, 'use'>;
```

The type also preserves `use` method to be used at hooks.

### Advanced data protection

Recommended way to protect your methods and other properties from being used by other modules is to define two classes: one for publically available properties and another for privately available at sub-stores properties and use the first class to override the default export type. At this case you don't need `OmitMethods` or any other fancy type anymore.

```ts
// public properties
class UsersPublic extends Use0 {
  ids = [1, 2, 3];
}

// protected properties
export class UsersProtected extends UsersPublic { // inherit it from UsersPublic
  readonly loadUsers = async () => {
    console.log(this.ids);
  }
}

const users = new UsersProtected();

export const { loadUsers } = users;

export default users as UsersPublic; // override
```

Use the same pattern at the root store to make `RootStore['users']` and other sub-stores to have all "protected" members available.

```ts
import Use0 from 'use-0';
import users, { type UsersProtected } from './users';
import companies, { type CompaniesProtected } from './companies';

export class RootStore extends Use0 {
  readonly users = users as UsersProtected; // override back
  readonly companies = companies as CompaniesProtected;
  constructor() {
    super();
    this.users.init(this);
    this.companies.init(this);
  }
}
```

With class splitting you can also hide other sub-stores.

```ts
class UsersPublic extends Use0 {
  ids = [1, 2, 3];
}

class UsersProtected extends UsersPublic {
  hiddenField = 1;
  readonly profiles: Profiles; // sub-store that is not visible by other modules
  readonly loadUsers = async () => {
    this.profiles.doSomething(this.ids);
  }
}

const users = new Users();

export default users as UsersPublic;
```

`profiles` sub-store (as well as the `hiddenField` field) is not available anymore when `users` is imported since it doesn't exist at `UsersPublic` class.

```ts
import users from './store/users';

users.profiles.doSomething(); // error since "profiles" doesn't exist at UsersPublic class

users.hiddenField++; // also error
```

And you cannot use nested store properties anymore since sub-stores are protected.

```ts
import users from './store/users';
import profiles from './store/users/profiles';

users.profiles.use('something'); // error

// but
profiles.use('something'); // no error
```

You still can define a nested object inside your public class.

```ts
class UsersPublic extends Use0 {
  ids = [1, 2, 3]
  nested: {
    foo: { bar: { baz: 'hello' }}
  };
}
```

And access it as expected.

```ts
import users from './store/users';

// works since "foo" property is public
console.log(users.foo.bar.baz);
```

### Nested store

For a nested sub-store follow the same pattern and call `init` method to provide access to the root store.

```ts
// ./store/users/index.ts
import profiles, { type Profiles } from './profiles';

// class UsersPublic extends Use0 { ... }

class UsersProtected extends UsersPublic {
  private store!: RootStore;
  readonly profiles = profiles as Profiles;
  readonly init: (store: RootStore) {
    this.store = store;
    this.profiles.init(store);
  }
}
```

```ts
// ./store/users/profiles/index.ts
class ProfilesPublic extends Use0 {
  myProfileEmail = 'hello@example.com';
}

class Profiles extends ProfilesPublic {
  private store!: RootStore;
  readonly init = (store: RootStore) => {
    this.store = store;
  }
  readonly updateProfile = async () => {
    // this.store.something.something();
  }
}

const profiles = new Profiles();

export const { updateProfile } = profiles;

export default profiles as ProfilesPublic;
```

Your file structure may look similar to this:

```
/index.ts
/companies/
  /index.ts
/users/
  /index.ts
  /profiles
    /index.ts
```

----------

To split sub-stores into smaller files you can:

- Define file for public properties class.
- Define file for protected properties class and extend it from the public properties class.
- Initialise the protected class at `index.ts` and export public modules.

You can define any file naming convention, but at this example I'm going to use `public.ts` for public properties and `protected.ts` for protected properties.

```ts
// ./store/users/public.ts
import Use0 from 'use-0';

export class UsersPublic extends Use0 {
  ids = [1, 2, 3];
}
```

```ts
// ./store/users/protected.ts
import { UsersPublic } from './public';

export class UsersProtected extends UsersPublic {
  private store!: RootStore;
  readonly loadUsers = async () => {
    console.log(this.ids);
  }
  readonly init = (store: RootStore) => { this.store = store; }
}
```

```ts
// ./store/users/index.ts
import { UsersPublic } from './public';
import { UsersProtected } from './protected';

const users = new UsersProtected();

export const { loadUsers } = users;
export type { UsersProtected }; // re-export for lower-level sub-stores
export default users as UsersPublic;
```

Your file structure is going to look like that:

```
/index.ts
/companies/
  /index.ts
  /public.ts
  /protected.ts
/users/
  /index.ts
  /public.ts
  /protected.ts
  /profiles
    /index.ts
    /public.ts
    /protected.ts
```

### Conclusion

1. Using patterns above we restrict the code and provide only one way to import the store by component modules: `import publicData, { method1, method2 } from './store/foo/bar/baz` where default export is used for public properties and named export is used for actions. It doesn't make sense to provide full store access to other modules that aren't related to the store.
2. Store class methods still have full access to the store and other-sub stores at their methods using privately available `this.store`.
3. You get unlimited scaling using a few lines code and no additional concepts to learn.

## Additional information

### Split your methods

If you have large methods the most obvious way to refactor your sub-store would be to create more classes. 

```ts
class UserPublic extends Use0 {
  ids: [1, 2, 3];
}

class UserMethodsPartOne extends UserPublic {
  readonly someLargeMethod = () => { /* ... */ }
}

class UserMethodsPartTwo extends UserMethodsPartOne {
  readonly anotherLargeMethod = () => { /* ... */ }
}

class Users extends UserMethodsPartTwo { /* ... */ }
```

But it's too hard to manage the enheritance chain. Instead, move methods as individual functions to another file.

```ts
// ./store/users/methods.ts
import type { UsersProtected } from ".";

export async function loadUsers(this: UsersProtected, something: string) {
  // this.store.increment();
  console.log(this.ids);
}

export default async function createUser(this: UsersProtected) { /* ... */ }
```

Or split them into individual files.

```ts
// ./store/users/methods/loadUsers.ts
// same pattern for createUser.ts
export default async function loadUsers(this: Users, something: string) {
  // this.store.increment();
  console.log(this.ids);
}
```

Then re-export them in one module.

```ts
// ./store/users/methods/index.ts
import loadUsers from './loadUsers';
import createUser from './createUser';

export { loadUsers, createUser };
```

Then to make the functions available at the class as methods you should update `this` context using `bind`.

```ts
// ./store/users/index.ts
import * as m from './methods';

export class Users extends Use0 {
  ids = [1, 2, 3];
  store!: RootStore;
  readonly loadUsers: typeof m.loadUsers;
  readonly createUser: typeof m.createUser;
  constructor() {
    super();
    // you can write a function that automates that
    // this.rebind(m) or super(m)
    this.loadUsers = m.loadUsers.bind(this);
    this.createUser = m.createUser.bind(this); // makes "this: Users" context available at the function
  }
}
```

You may want to define type of your method without `this` to unbind it preserving the context.

```ts
store.users.loadUsers(); // no error but ...

const { loadUsers } = store.users;

// error because "typeof m.loadUsers" requires "this: Users" context
loadUsers();
```

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

### Alternative syntax

If you don't like this fancy `object.use(key)` hook, you can avoid it. **use-0** is dependent on another project called [use-change](https://github.com/finom/use-change). It exports `useChange` hook that works just like `React.useState` but accepts sub-store (or any custom object) as first argument and key as second argument.

```ts
import useChange from 'use-change';
import users, { loadUsers } from './store/users';

const MyComponent = () => {
  const [ids, setIds] = useChange(users, 'ids');

  // ...

  console.log(ids);

  setIds([...ids, id]);

  setIds(ids => [...ids, id]);
}
```

To achive that:

1. Don't install **use-0**.
2. Install **use-change** with `npm i use-change`.
3. Don't inherit classes from `Use0` class.

```ts
class UsersPublic { /* ... */ } // don't "extend Use0"

class UsersProtected extends UsersPublic { /* ... */ }
```

The rest instructions from this README are the same.

## Use0.of

If you don't want to define a class, you can use this static method. `Use0.of<T>(data?: T): Use0 & T` returns an instance of `Use0` with the `use` method, and uses the first optional argument as initial data.

```ts
class RootStore extends Use0 {
  readonly coordinates = Use0.of({ x: 0, y: 100 });
  // ...
}

const MyComponent = () => {
  const x = store.coordinates.use('x');
  const y = store.coordinates.use('y');
  // ...
  // store.coordinates.x = 100;
}
```

You can also define a custom record:

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
// ./store.ts
import { of } from 'use-0';

const store = of({
  count: 1,
  companies: of({
    name: 'My company',
    someMethod: () => { console.log(store); },
  }),
});

export default store;
```

```ts
import store from './store';

const MyComponent = () => {
  const count = store.use('count'); // same as store.count but works as a hook
  const name = store.companies.use('name'); // same as store.companies.name but works as a hook

  // store.companies.someMethod();
  // store.companies.name = 'Hello'; // triggers the component to re-render
  // ...
}
```
