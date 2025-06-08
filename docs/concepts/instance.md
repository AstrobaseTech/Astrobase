---
title: Instance
banner:
  content: Welcome to the Astrobase SDK documentation. This area is currently under development.
---

The "instance" refers to a stateful configuration object that is used throughout the SDK. The SDK does not manage the configuration. Instead, it is left up to the application to manage along with much of the rest of its state.

The most basic instance will look like this:

```js
import { Common } from '@astrobase/sdk/common';
import { createInstance } from '@astrobase/sdk/instance';

const instance = createInstance(Common);
```

`Common` provides most of what an app needs. Typically you'll also provide one or more clients for persistence:

```js
import { Common } from '@astrobase/sdk/common';
import { createInstance } from '@astrobase/sdk/instance';

const instance = createInstance(Common, {
  clients: [
    /* your client(s) */
  ],
});
```

Instance configuration is designed in such a way to keep the SDK tree-shakable. You can omit `Common` and instead provide a subset of only needed functionality. The SDK is side-effect free, so unimported functions can be shaked away by bundlers.
