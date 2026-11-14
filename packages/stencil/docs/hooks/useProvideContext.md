---
layout: layout-api
package: studio
module: src/app/lib/haunted.ts
---

# Hooks >> useProvideContext

Studio extension for providing a `createContext()` value from inside a `component()` renderer (without defining a separate custom element provider).

Use `Context.Provider` as a custom element when the provider should be a stable tag in markup. Use `useProvideContext` when the provider logic lives in the same haunted component as the rest of the UI.

```js
import { component, html, createContext, useEffect, useProvideContext, useState } from 'haunted';

const StoreContext = createContext(null);

function StoreProvider(this: HTMLElement & { store }) {
  const store = this.store;
  const [state, setState] = useState(() => store.getState());

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, [store]);

  useProvideContext(
    StoreContext,
    { store, state, dispatch: store.dispatch },
    [state],
  );
  return html`<slot></slot>`;
}

customElements.define('store-provider', component(StoreProvider));
```

Pair with `useContext(StoreContext)` in descendants. For Redux-specific wiring, see [Studio state management](../../state-management.md).

## API

`useProvideContext(context, value, dependencies?)`

- **context** — object returned from `createContext()`
- **value** — value consumers receive via `useContext`
- **dependencies** — optional dependency array; when any entry changes, subscribed consumers are notified with the new `value`
