---
phase: 02-react-scaffold
plan: 01
completed: 2026-04-27
duration: 15m
---

# Plan 02-01: Vite + React 18 + TypeScript 5 + Vitest

Initialized Vite React-TS project and configured Vitest with jsdom environment, path alias, and jest-dom matchers — test suite passes with 0 tests.

## Tasks Completed

1. Ran `npm create vite@latest . -- --template react-ts` — generated package.json, vite.config.ts, tsconfig.json (composite: app + node)
2. Installed vitest, @testing-library/react, jsdom, jest-dom — created `src/test/setup.ts` importing jest-dom
3. Configured Vitest in vite.config.ts: globals, jsdom environment, setupFiles
4. Added `@types/node` and path alias `@/*` → `src/*` in vite.config.ts and tsconfig.app.json
5. Added vitest/globals to tsconfig.app.json types, vite/client for import.meta.env

## Key Deviations

- **Rule 1 (auto-fix)**: Vitest config extracted to `vitest.config.ts` using `mergeConfig` — `defineConfig` from `vitest/config` conflicted with vite's bundled version (different Vite instances). Separate file resolves cleanly.
- **Rule 3 (auto-fix)**: Removed `"type": "module"` from package.json — Vite template adds it, but it breaks ink-tools.js (CommonJS). Vite/Vitest detect ESM from file extensions; no functionality lost.
- **Rule 1 (auto-fix)**: ESLint config rewritten as flat config (`eslint.config.js`) — Vite 6 generates flat config format; old `.eslintrc.json` not needed.

## Suggested Commits

```
chore(02-01): initialize Vite+React18+TS5 with Vitest and path alias
```

## Retrospective

- **Diagnosis accuracy**: Plan assumed `vitest/config` would work cleanly — it doesn't when vitest bundles its own Vite. Separate vitest.config.ts is the correct pattern for Vite 6 projects.
- **What surprised us**: `"type": "module"` in Vite 6 template is default but breaks CJS tooling (ink-tools).
- **Time sinks**: ESLint v9 flat config vs v8 legacy config; vitest/vite version mismatch.
- **Reusable patterns**: Always use `vitest.config.ts` + `mergeConfig` for Vite 6 projects. Remove `"type": "module"` when ink-tools is present.
