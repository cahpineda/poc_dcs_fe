---
phase: 04-seat-map-ui
plan: 03
completed: 2026-04-27
duration: 8m
---

# Plan 04-03: useSeatPlan CQRS Query Hook

Created `useSeatPlan(flightId)` wrapping TanStack Query — the single CQRS read boundary for all seat map components — 4 tests GREEN (57 total).

## RED

Wrote 4 tests: success state returns SeatPlanResult, empty flightId disables query (fetchStatus=idle), error surfaces correctly, different flightIds use separate queryKeys.

Used `vi.mock('@/infrastructure/DependencyProvider')` to mock services; `makeWrapper()` factory creates a fresh `QueryClient` per test to prevent cache bleed.

Test failed: `Cannot resolve import "../useSeatPlan"`.

## GREEN

Created `src/presentation/hooks/useSeatPlan.ts` — 9 lines:
- `queryKey: ['seatPlan', flightId]` — scoped cache per flight
- `enabled: Boolean(flightId)` — disabled when empty, no network call
- `staleTime: 5 * 60 * 1000` — matches DependencyProvider default

## REFACTOR

None — minimal and complete on first pass.

## Commits

```
test(04-03): add failing tests for useSeatPlan CQRS hook
feat(04-03): implement useSeatPlan TanStack Query hook
```
