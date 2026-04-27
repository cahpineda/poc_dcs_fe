---
phase: 05-seat-operations
plan: 03
completed: 2026-04-27
duration: 4m
---

# Plan 05-03: autoAssignSeat Zone-Balanced Algorithm

Pure domain function with zone scoring — 6 tests GREEN (81 total).

## RED

Wrote 6 tests: null for no available seats, returns string when available, prefers window column A when <50% occupied, avoids blocked/occupied, cabin class filter (Y/C), null for unmatched cabin class.

Test failed: `Cannot resolve import "../autoAssignSeat"`.

## GREEN

Created `src/domain/seat/autoAssignSeat.ts`:
- `WINDOW_COLS = Set(['A', 'F'])` — preferred when occupancyRate < 0.5
- `AISLE_COLS = Set(['C', 'D'])` — preferred when occupancyRate >= 0.5
- `zoneScore()` returns 0 (preferred), 1 (middle), 2 (last resort) based on column and occupancy
- Filters by `s.isAvailable()` and optional `s.cabin === cabinClass`
- Sorts candidates by ascending score, returns first

No React/infrastructure imports — pure domain function.

## REFACTOR

None needed.

## Commits

```
test(05-03): add failing tests for autoAssignSeat algorithm
feat(05-03): implement zone-balanced autoAssignSeat pure domain function
```
