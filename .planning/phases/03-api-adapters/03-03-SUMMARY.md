---
phase: 03-api-adapters
plan: 03
completed: 2026-04-27
duration: 12m
---

# Plan 03-03: SeatPlanResult aggregate + seatPlanMapper

Created `CabinRow` interface, `SeatPlanResult` aggregate with computed properties, and `seatPlanMapper` anti-corruption layer mapping cloud_2 DTO → domain objects — 8 new tests GREEN (20 total).

## RED

Wrote 4 tests for SeatPlanResult (totalSeats, null guard, getSeat, empty rows) and 4 tests for seatPlanMapper (happy path with counts, null input throws, missing seat_rows graceful, all 7 status codes mapped).

Tests failed: `Cannot resolve import "../SeatPlanResult"` and `Cannot resolve import "../seatPlanMapper"`.

## GREEN

Created `src/domain/seat/CabinRow.ts` — readonly interface with rowNumber, seats, isExitRow.

Created `src/domain/seat/SeatPlanResult.ts` — class with:
- `totalSeats` computed from rows
- `availableCount` using `seat.isAvailable()`
- `getSeat(string)` linear scan

Created `src/infrastructure/adapters/mappers/seatPlanMapper.ts`:
- STATUS_MAP lookup: A/O/B/EA/EO/U/I → SeatStatus values
- Null guard throws with clear message
- Missing `seat_rows` → empty rows (graceful degradation)
- Handles both `flight_id` and `flightId` field names

## REFACTOR

None — clean implementation on first pass.

## Commits

```
test(03-03): add failing tests for SeatPlanResult aggregate and seatPlanMapper
feat(03-03): implement SeatPlanResult, CabinRow, and cloud_2 DTO mapper
```
