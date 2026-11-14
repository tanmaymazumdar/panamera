# @panamera/stencil

Web Component library for creating UI.

`@panamera/stencil` is a framework-free web component library for composing UI out of custom
elements, with a lightweight hooks and context layer built on top of [Lit](https://lit.dev).

## About

`@panamera/stencil` wraps the rendering capabilities of [Lit](https://lit.dev) (via `lit-html`) and
adds a small Stencil-like API on top:

- **Components** — create custom elements from render functions with `component`, rendering via
  lit's `html` template tag and `render` function. Supports shadow DOM control through the
  `useShadowDOM` and `shadowRootInit` options.
- **Contexts** — typed contexts via `createContext`, providing shared state with `Provider` /
  `Consumer` pairs through the `useProvideContext` and `useContext` hooks.
- **Hooks** — `useState`, `useReducer`, `useContext`, `useMemo`, `useCallback`, `useEffect`,
  `useLayoutEffect`, and `useRef` for local state and side-effect management inside elements.

## Installation

```sh
pnpm add @panamera/stencil
```

`lit-html` is a peer dependency of the package.

## Usage

Define a component from a render function and register it as a custom element:

```ts
import { html, render, component } from '@panamera/stencil'

function MyComponent(this: HTMLElement) {
  // Return a lit `TemplateResult` or use `render(result, container)`
}

customElements.define('my-component', component(/* renderer for MyComponent */))
```

Create a typed context and consume it from within an element:

```ts
import { createContext, useContext } from '@panamera/stencil'

interface ThemeContextValue {
  theme: string
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light' })

function ThemeConsumer(this: HTMLElement) {
  const { theme } = useContext(ThemeContext)
  // ...
}
```

Manage state inside elements with the hooks:

```ts
import { useState, useMemo } from '@panamera/stencil'

function Counter(this: HTMLElement) {
  const [count, setCount] = useState(0)
  const doubled = useMemo(() => count * 2, [count])

  // ...
}
```

## Development

The package uses the shared tooling from the monorepo (`@panamera/tsconfig`) and is bundled with
[tsdown](https://tsdown.dev):

```sh
pnpm --filter @panamera/stencil build
pnpm --filter @panamera/stencil check-types
pnpm --filter @panamera/stencil lint
pnpm --filter @panamera/stencil fmt
```

## License

MIT
