# Panamera Monorepo — AGENTS.md

## Quick reference

| Tool           | Config                                                                                             | Key flags                       |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------------------------- |
| pnpm 11.10.0   | `.npmrc` — `engine-strict=true`, `tag-version-prefix=""`                                           |                                 |
| Node >=24      | `.nvmrc` — v24.14.0                                                                                |                                 |
| oxlint         | `.oxclintrc.json` — unicorn, typescript, oxc; typeAware+typeCheck                                  | `pnpm lint` / `pnpm lint:check` |
| oxfmt          | `.oxfmtrc.json` — no semi, singleQuote, printWidth=120, LF                                         | `pnpm fmt` / `pnpm fmt:check`   |
| TypeScript 5.9 | `tsconfig.json` → `@panamera/tsconfig/node` — ES2022, bundler, strict, composite, declaration-only |                                 |

## Commands

```sh
pnpm install               # install all workspace deps
pnpm fmt                   # format (oxfmt)
pnpm fmt:check             # check formatting (CI)
pnpm lint                  # lint (oxlint)
pnpm lint:check            # lint with report (CI — generates gitlab-oxlint-report.json)
pnpm version               # print "studio-v{version}"

# Package-specific
pnpm --filter @panamera/dev exec tsx src/cli.ts   # run dev package
```

## Monorepo structure

```
packages/
  core/      @toolbox/core     — backend service using @tinyhttp/app
  data/      @toolbox/data     — shared database config, migrations, seeding data and connection through drizzle orm
  shell/     @toolbox/shell    — frontend entry point using lit web components
  stencil/   @toolbox/stencil  — internal web component library for creating small re-usable UI components
  tsconfig/  @toolbox/tsconfig — shared TS configs (exports ./node, ./app)
  ui/        @toolbox/ui       — shared UI components
```

No `apps/` directory exists yet (workspace pattern `apps/*` has no matches).

## Important to know

- **ESM only.** Every `package.json` has `"type": "module"`.
- **oxlint** is the linter, **oxfmt** is the formatter. No ESLint/Prettier.
- **oxfmt config:** no semicolons, single quotes, 120 print width, sorted imports with blank-line groups.
- **oxlint config:** type-aware + type-check enabled; plugins: unicorn, typescript, oxc.
- **Husky pre-commit** runs `npm test` — but root `package.json` has no `test` script, so pre-commit will fail.
- **No test framework** (vitest/jest/etc.) is configured.
- **CI** runs in GitLab CI (`.gitlab-ci.yml`): `lint` job does `pnpm install` → `pnpm run lint:check`. SonarCloud on merge_requests + main.
- **TypeScript:** composite projects, `emitDeclarationOnly: true`, `importHelpers: true` (tslib), `customConditions: ["panamera-monorepo"]`.
- **Root `tsconfig.json`** has project references to the two tsconfig files (no source project references yet — packages don't cross-reference via project refs).
- **Releases** are managed via `.changes/` files in each package (see `CONTRIBUTING.md` for the workflow).

## Agent configs present

- `.opencode.yml` — workspace_type: monorepo, package_manager: pnpm
- `opencode.json` — empty
- `.codex/config.toml` — Chrome DevTools MCP + Postman MCP
- `.gemini/antigravity/mcp_config.json`
- `.agents/skills/` + `.opencode/skill/` — react-best-practice, web-design-guidelines skills
- `CLAUDE.md` — refer to AGENTS.md file for instruction
