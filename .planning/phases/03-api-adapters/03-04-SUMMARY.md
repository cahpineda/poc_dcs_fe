---
phase: 03-api-adapters
plan: 04
completed: 2026-04-27
duration: 8m
---

# Plan 03-04: Cloud2SeatPlanAdapter (read endpoints)

Created `Cloud2SeatPlanAdapter` implementing `ISeatPlanQueryService` with constructor-injected AxiosInstance — 4 tests GREEN. Updated ISeatPlanQueryService to use concrete `SeatPlanResult` type.

## RED

Wrote 4 tests using a mock AxiosInstance (`{ get: vi.fn() }`): getSeatPlan happy path, empty flightId throws, HTTP 500 → domain error, getSeatOccupancy endpoint call.

Test failed: `Cannot resolve import "../Cloud2SeatPlanAdapter"`.

## GREEN

Created `src/infrastructure/adapters/Cloud2SeatPlanAdapter.ts`:
- Constructor injection of AxiosInstance (no module-level mock needed)
- `getSeatPlan` validates flightId, maps 500 errors to domain error
- `getSeatOccupancy` calls separate endpoint
- `isServerError()` helper checks AxiosError shape without importing axios

Updated `ISeatPlanQueryService` to return `Promise<SeatPlanResult>` (was `Promise<unknown>`).

## REFACTOR

None — implementation minimal and clear.

## Commits

```
test(03-04): add failing tests for Cloud2SeatPlanAdapter read endpoints
feat(03-04): implement Cloud2SeatPlanAdapter with constructor-injected axios
```
