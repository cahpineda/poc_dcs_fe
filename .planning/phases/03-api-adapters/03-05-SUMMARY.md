---
phase: 03-api-adapters
plan: 05
completed: 2026-04-27
duration: 10m
---

# Plan 03-05: Cloud2SeatCommandAdapter + DependencyProvider wiring

Created `Cloud2SeatCommandAdapter` implementing `ISeatCommandService` — 5 tests GREEN. Replaced all stub adapters in `DependencyProvider.tsx` with real implementations (D from SOLID fulfilled).

## RED

Wrote 5 tests: assignSeat happy path, null command throws, HTTP 409 → "Seat is already occupied", blockSeat endpoint, reseatPassenger endpoint.

Test failed: `Cannot resolve import "../Cloud2SeatCommandAdapter"`.

## GREEN

Created `src/infrastructure/adapters/Cloud2SeatCommandAdapter.ts`:
- `assignSeat`: maps 409 → domain error "Seat is already occupied"
- `reseatPassenger`, `blockSeat`, `unblockSeat`: delegate to correct endpoints
- `isConflict()` helper checks AxiosError shape safely without importing axios type guards

## DependencyProvider Update

Replaced all stub adapters with real implementations:
- `services.seatQuery` = `new Cloud2SeatPlanAdapter(axiosInstance)`
- `services.seatCommand` = `new Cloud2SeatCommandAdapter(axiosInstance)`
- `services.seatPricing` stub kept — pricing adapter deferred to Phase 4
- `axiosInstance` created with `VITE_API_BASE_URL` + `withCredentials: true` for PHP session auth

## REFACTOR

Fixed TypeScript type assertions in both adapters to use `{ response?: { status?: unknown } }` pattern — avoids unsafe `as` conversions that fail strict mode.

## Verification

- `npm test` ✓ — 29/29 tests passing (6 files)
- `npm run build` ✓ — 139 modules bundled
- No component imports axios directly

## Commits

```
test(03-05): add failing tests for Cloud2SeatCommandAdapter write endpoints
feat(03-05): implement Cloud2SeatCommandAdapter + wire real adapters into DependencyProvider
refactor(03-05): fix TypeScript type assertions in adapter error helpers
```
