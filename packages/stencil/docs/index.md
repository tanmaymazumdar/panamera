# Docs || 10

## Studio runtime

Haunted is vendored in **`src/app/lib/haunted.ts`** (not the npm `haunted` package). Import with `from 'haunted'` — Vite and TypeScript resolve that to the vendored module (`vite.config.ts` + `tsconfig.json` paths).

**Included:** `component`, `createContext`, `html`, `render`, and the hooks listed under [Hooks](#hooks), including **`useProvideContext`**.

**Not included (by design):** `virtual()`, `useController`.

**Redux:** You can expose the store through `createContext` + `useProvideContext` or `<Context.Provider>`, then consume with `useContext` in haunted components. Redux remains the source of truth; see [state management](../state-management.md).

## Examples

- [Getting Started](./guides/getting-started/)
- [Bring your Own Renderer](./guides/renderers/)
- [Attributes](./guides/attributes/)
- [Properties](./guides/properties/)
- [API](./guides/api/)
- [Dispatching Events](./guides/events/)
- [TypeScript](./guides/typescript/)

## Hooks

- [useCallback](./hooks/useCallback/)
- [useContext](./hooks/useContext/)
- [useProvideContext](./hooks/useProvideContext/)
- [useEffect](./hooks/useEffect/)
- [useLayoutEffect](./hooks/useLayoutEffect/)
- [useMemo](./hooks/useMemo/)
- [useReducer](./hooks/useReducer/)
- [useRef](./hooks/useRef/)
- [useState](./hooks/useState/)
