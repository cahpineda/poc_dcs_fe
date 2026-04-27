---
phase: 03-api-adapters
plan: 02
completed: 2026-04-27
duration: 10m
---

# Plan 03-02: SeatStatus type + Seat entity

Created `SeatStatus` discriminated union (7 cloud_2 seat states) and `Seat` entity with immutable status transitions — 6 tests GREEN.

## RED

Wrote `src/domain/seat/__tests__/Seat.test.ts` with 6 test cases: happy path (available→isAvailable true), null seatNumber throws, occupied→isAvailable false, withStatus immutability, exit_row_available→isExitRow true, infant_occupied→isOccupied true.

Test failed: `Cannot resolve import "../Seat"` — Seat.ts did not exist.

## GREEN

Created `src/domain/seat/SeatStatus.ts` with 7 values matching cloud_2 status codes.
Created `src/domain/seat/Seat.ts` with:
- Static `create()` factory with null-guard on seatNumber
- `isAvailable()` — true for `available` and `exit_row_available`
- `isExitRow()` — true for any status starting with `exit_row_`
- `isOccupied()` — true for `occupied`, `exit_row_occupied`, `infant_occupied`
- `withStatus()` — returns new Seat (immutable)

All 12 tests pass (6 SeatNumber + 6 Seat).

## REFACTOR

None needed — implementation is minimal and clear.

## Commits

```
test(03-02): add failing tests for Seat entity with SeatStatus
feat(03-02): implement Seat entity with immutable status transitions
```
