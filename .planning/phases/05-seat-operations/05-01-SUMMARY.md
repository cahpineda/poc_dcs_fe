---
phase: 05-seat-operations
plan: 01
completed: 2026-04-27
duration: 6m
---

# Plan 05-01: Typed Command Value Objects

Replaced `unknown` command params with 4 typed VOs across the CQRS write boundary — 12 new tests GREEN (69 total).

## RED

Wrote 12 tests for AssignSeatCommand (4), BlockSeatCommand (3), UnblockSeatCommand (2), ReseatPassengerCommand (3). All validate required fields and ReseatPassengerCommand rejects fromSeat === toSeat.

Test failed: `Cannot resolve import "../AssignSeatCommand"`.

## GREEN

Created `src/domain/seat/commands/`:
- `AssignSeatCommand.ts` — passengerId, seatNumber, flightId (all required)
- `BlockSeatCommand.ts` — seatNumber, flightId, reason
- `UnblockSeatCommand.ts` — seatNumber, flightId
- `ReseatPassengerCommand.ts` — passengerId, fromSeat, toSeat, flightId (fromSeat ≠ toSeat guard)
- `index.ts` — barrel export

Updated `ISeatCommandService.ts` — all methods now use typed command params.

Updated `Cloud2SeatCommandAdapter.ts` — removed old `unknown` null guards, adapter passes typed command directly to `http.post`.

Updated `Cloud2SeatCommandAdapter.test.ts` — replaced null guard test with `unblockSeat` endpoint test; all command fixtures now use `create()` factory.

## REFACTOR

None — VOs minimal by design.

## Commits

```
test(05-01): add failing tests for command value objects
feat(05-01): implement typed command VOs and update port interface
```
