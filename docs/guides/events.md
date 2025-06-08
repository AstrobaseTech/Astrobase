---
title: Events
banner:
  content: Welcome to the Astrobase SDK documentation. This area is currently under development.
sidebar:
  hidden: true
---

> Note: This module is currently completely unused. It is here for future reference, we'll need primitives for events and observables or signals as Astrobase implements realtime APIs.

This module implements a simple, generic but type-safe event emitter system that includes support for custom topics.

## Custom Topics

> Note: In future this will be handled by ambient types.

All functions accept a type parameter for a map of custom topics and their emitted value types. This enables support for strongly typed custom topics without emitting additional JavaScript.

Note: The topic must also be provided as a type parameter when using this method. This seems to be a limitation of TypeScript.

```ts
// Define a type to emit for user events
interface User {
  id: number;
  name: string;
  company: string;
}

// Define a map of custom topics and their emitted values
type UserTopics = {
  'user:create': User;
  'user:delete': User;
  'user:update': User;
};

// Listen for `user:create` events and log the value
on<UserTopics, 'user:create'>('user:create', (user) => {
  console.log('New user:', user);
});

// Emit a `user:create` event
emit<UserTopics, 'user:create'>('user:create', {
  id: 1999,
  name: 'Phillip J. Fry',
  company: 'Planet Express',
});
```

### Multiple Custom Topic Providers

Say you're an app developer and you are using Astrobase with multiple extensions that each provide custom topics. You may find it more convenient to wrap the type boilerplate together in one place.

Each extension should provide a custom topic map type (consult their documentation) for you to wrap, with the base topics, into a single [intersection type](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types).

You can also create wrappers for the different event functions such that they always offer strict types without requiring type parameters be given each time they are called, but be aware that this will emit some extra JavaScript code in your bundle.

```ts
import { emit as baseEmit, on as baseOn, off as baseOn, type Listener } from '@astrobase/sdk';
import { FooTopics } from 'astrobase-foo';
import { BarTopics } from 'astrobase-bar';

// Intersection type of ALL topic maps
export type Topics = FooTopics & BarTopics;

// Function wrappers (emits additional JS)
export function emit<T extends keyof Topics>(topic: T, value: Topics[T], instanceID?: string) {
  return baseEmit<Topics, T>(topic, value, instanceID);
}
export function on<T extends keyof Topics>(topic: T, listener: Listener<Topics[T]>) {
  return baseOn<Topics, T>(topic, listener);
}
export function off<T extends keyof Topics>(topic: T, listener: Listener<Topics[T]>) {
  return baseOff<Topics, T>(topic, listener);
}

// No need for type parameters, intellisense just works
on('foo:topic', (event) => {
  /* do something */
});
on('bar:topic', (event) => {
  /* do something */
});
```
