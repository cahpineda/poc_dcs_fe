---
phase: 02-react-scaffold
plan: 04
completed: 2026-04-27
duration: 8m
---

# Plan 02-04: TanStack Query + Zustand + Axios + DependencyProvider

Installed TanStack Query v5, Zustand v4, and Axios, then created `DependencyProvider.tsx` as the single DIP wiring point with stub adapters implementing all three port interfaces.

## Tasks Completed

1. Installed `@tanstack/react-query@^5`, `zustand@^4`, `axios`, `@tanstack/react-query-devtools`
2. Created `src/infrastructure/DependencyProvider.tsx`:
   - QueryClientProvider with 5min staleTime
   - Three stub adapters (throw "Not implemented" — replaced in Phase 3)
   - `services` const export for future hook consumption
   - ReactQueryDevtools in DEV mode only
3. Updated `src/main.tsx` to wrap App with `<DependencyProvider>`
4. Updated `src/infrastructure/index.ts` to export DependencyProvider and services

## Key Decisions

- DependencyProvider.tsx is the ONLY file where adapters are instantiated — enforces D (Dependency Inversion) from SOLID. No component or hook will ever import axios.
- Stub adapters throw errors deliberately — failing loudly better than silent no-ops during integration testing.

## Verification

- `npm run build` ✓
- `npm test` ✓ (0 tests, passing)
- `npm run lint` ✓

## Suggested Commits

```
feat(02-04): add TanStack Query + Zustand + Axios with DependencyProvider stub wiring
```

## Retrospective

- **Diagnosis accuracy**: Plan executed as designed. The `import.meta.env` typing required adding `vite/client` to tsconfig.app.json types.
- **Reusable patterns**: Always add `vite/client` to tsconfig types when using `import.meta.env` in non-config files.
