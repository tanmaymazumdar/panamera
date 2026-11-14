# @panamera/tsconfig

Shared TypeScript presets.

## Usage

`include` and `paths` intentionally live in the consuming package: relative paths in an
extended config resolve against the **preset's** directory, not the consumer's. Declare them
where the source actually is.

### Node packages

```jsonc
{
  "extends": "@panamera/tsconfig/node",
  "include": ["src"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo"
  }
}
```

Node packages must install `@types/node` (the preset only declares it as an optional peer):

```sh
pnpm add -D @types/node
```

### Web apps

```jsonc
{
  "extends": "@panamera/tsconfig/app",
  "include": ["src"],
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] },
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo"
  }
}
```

Add the tool-specific bits in the consumer as needed:

- Vite: `"types": ["vite/client"]` (or an `env.d.ts` reference).
- React: `"jsx": "react-jsx"`.

## Notes

- The presets are type-checking configs: `noEmit` is on and `allowImportingTsExtensions`
  requires it. Builds are handled by the package's bundler (e.g. tsdown); use
  `tsc --noEmit` (or `tsc -p tsconfig.json`) for checking.
- `erasableSyntaxOnly` forbids enums, namespaces, and parameter properties.
- A raw file can also be extended directly: `extends: "@panamera/tsconfig/tsconfig.node.json"`.
