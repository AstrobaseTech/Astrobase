<div align=center>

# [Astrobase JS SDK](https://astrobase.me/docs/)

An extensible protocol suite for building multi-user apps with native privacy, security, and self-sovereignty.

[Website](https://astrobase.me) • [Docs](https://astrobase.me/docs/)

</div>

## Installation

```sh
npm i @astrobase/core
```

## Stability

This project is currently in a pre-release state as indicated by the `<1.0.0` version number. During this time, breaking changes will be more common.

- Breaking changes will occur on **minor** version numbers, i.e. the `x` of `v0.x.y`, where possible.

- Deprecation warnings will be added to the latest **patch** version prior to the minor version where possible.

Follow this process to keep your code up to date:

### Upgrade Guide

1. Upgrade to the latest **patch** release of the same **minor** version of the SDK that your project is currently on.

   > Ensure the version of `@astrobase/core` in your `package.json` begins with either a caret (`^`) or tilde (`~`) and run `npm upgrade`.

2. Identify deprecation warnings throughout your codebase and follow the recommendations to refactor your code to use updated APIs. **You must address all deprecations before proceeding.**

   > Deprecation warnings are generally visible with a ~~strikethrough~~ effect in most code editors. Hover the mouse over the symbol to reveal more information.

   > You could use tooling like [ESLint](https://eslint.org) with [`eslint-plugin-deprecation`](https://www.npmjs.com/package/eslint-plugin-deprecation) to aid with this or even integrate it into a CI process to flag up issues.

3. Bump the **minor** version number and ensure the **patch** number is set to `0`.

   > For instance, if you are on `^0.1.x` now, then bump the version in your `package.json` to `^0.2.0`.

4. Repeat steps 1-3 as necessary until you are on the latest minor version.
