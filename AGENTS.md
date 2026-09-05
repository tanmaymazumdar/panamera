# Birkin — React + TypeScript + Vite

## Commands

- `pnpm dev` — Vite dev server (reads `.env`; `PORT=9000`, but Vite uses its own port unless configured)
- `pnpm build` — Typecheck + build: `tsc -b && vite build`
- `pnpm lint` / `pnpm lint:fix` — **Oxlint** (not ESLint); config `.oxlintrc.json`
- `pnpm fmt` / `pnpm fmt:check` — **oxfmt** formatter; config `.oxfmtrc.json`
- `pnpm ut` — Vitest run (`vitest --run`); `pnpm ut:coverage` enforces thresholds
- `pnpm preview` — Serve built output

## Toolchain quirks

- Formatter is `oxfmt`, not Prettier. It **sorts imports and Tailwind classes** (see `.oxfmtrc.json`). Don't hand-tune import/Tailwind ordering; run `pnpm fmt`.
- Linter is `oxlint`, not ESLint. Plugins: `eslint, import, oxc, promise, react, react-perf, typescript, vitest`.
- `tsc` is project-reference based (`tsconfig.app.json` for `src`, `tsconfig.node.json` for config files).
- Package manager is **pnpm** (holds `pnpm-lock.yaml`).
- Redux store uses the **legacy `createStore`** API (`redux` v5 removed/deprecated it) via `@redux-devtools/extension` and `redux-thunk` `withExtraArgument()`. Keep this pattern; don't "modernize" to the new API without explicit ask.

## Path aliases

- `@/` → `src/` (tsconfig + vite/vitest configs). Always use `@/` imports.

## Architecture

- Entry: `src/main.tsx` — `createRoot` inside `startTransition`, wraps `Provider` (Redux) + `RouterProvider`.
- Router: `src/router.tsx` — `createBrowserRouter` with lazy route pages. Route pages export a named `Component` (not default) and are loaded via `lazy: () => import('./pages/...')`.
- Store: `src/store/` — `index.ts` (configureStore + shared instance), `reducers.ts` (combineReducers), `auth.ts` (slice pattern: ACTION_TYPE consts + actions + reducer + reselect selectors).
- Env/config: `src/globals.ts` reads `process.env.BASE_API_URL` / `BASE_URL` from `.env`. Note this uses `process.env.*` in browser code (not `import.meta.env`), so dumping new env vars here requires matching Vite define/bundler handling.
- UI: multiple component trees under `src/components/` — `ui/` (shadcn/base-luma), `8starlabs-ui/`, `ai-elements/`, `approvals-ui/`. `src/lib/utils.ts` has the `cn()` class-merge helper (`clsx` + `tailwind-merge`).
- Domain logic: `src/lib/approvals-ui/` — Zod-based approval policy DAG (guards live on steps, not edges; see `policy.ts`).

## Conventions

- Primitives come from `@base-ui/react` (e.g. Button primitives), composed with `cva` + `cn`. Don't reach for Radix unless the codebase doesn't already use base-ui.
- `verbatimModuleSyntax: true` — use `import type` for type-only imports.
- `noUnusedLocals` / `noUnusedParameters` are on.
- `components.json`: shadcn style `base-luma`, baseColor `olive`, icon library `lucide`, css at `src/index.css`. Tailwind CSS v4 via `@tailwindcss/vite`.

## Testing

- Config: `vitest.config.ts` — jsdom env, globals on, setup at `src/tests/setup.ts` (jest-dom + auto cleanup).
- Coverage thresholds enforced on `ut:coverage`: branches 61%, functions 46%, lines 72.5%, statements 69%.
- Use `src/tests/custom-render.tsx` (`customRender`) to render components wrapped in Redux `Provider` + router stub (see `src/tests/mocks/store.ts` for the shared store fixture). No test files exist yet.
