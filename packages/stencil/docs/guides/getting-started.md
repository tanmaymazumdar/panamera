# Guides >> Getting Started || 00

## Use

<code-tabs collection="package-managers" default-tab="npm" align="end">

```shell tab npm
npm install @panamera/stencil
```

```shell tab yarn
yarn add @panamera/stencil
```

```shell tab pnpm
pnpm add @panamera/stencil
```

</code-tabs>

For Internet Explorer 11, you'll need to use a proxy polyfill to use Stencil, in addition to the usual webcomponentsjs polyfills.

```html
<script src="https://cdn.jsdelivr.net/npm/proxy-polyfill@0.3.0/proxy.min.js"></script>
```

You can also use Custom Elements without the Shadow DOM if you need to:

```js
component(MyComponent, { useShadowDOM: false }));
```

## Importing

**Stencil** can be imported just like any other library when using a bundler of your choice:

```js
import {
  html,
  component,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useContext,
  useProvideContext
} from '@panamera/stencil'
```

The main entry point is intended for [lit-html](https://github.com/Polymer/lit-html) users.
