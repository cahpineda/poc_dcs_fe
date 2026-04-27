---
plan: 13-01
phase: 13
title: Domain passenger fields + UnassignSeat operation
status: complete
completed: 2026-04-27
---

## What Was Built

### Seat Domain — New Passenger Fields

`src/domain/seat/Seat.ts` gained five new fields on the `Seat` entity:

- `passengerKey: string | null` — raw passenger_key from DTO (e.g. "PAX-1234")
- `boardingGroup: number | null` — boarding group number
- `rushStatus: boolean` — whether passenger is flagged as rush
- `pnr: string | null` — booking reference
- `ssrs: string[]` — special service request codes

`resolvePassengerId()` was updated to return the real `passengerKey` value when present, falling back to the synthesized `PAX-<number>` stub only when `passengerKey` is null.

`seatPlanMapper.ts` was updated to map `passenger_key`, `boarding_group`, `rush_status`, `pnr`, and `ssrs` from the DTO into `Seat.create()`.

### UnassignSeatCommand Value Object

`src/domain/seat/commands/UnassignSeatCommand.ts` — immutable value object with `flightId: string` and `seatNumber: string`. Validates both fields on construction (throws on blank/null).

### ISeatCommandService Interface

`src/application/ports/ISeatCommandService.ts` — `unassignSeat(cmd: UnassignSeatCommand): Promise<void>` added alongside existing `reseatPassenger`.

### Cloud2SeatCommandAdapter

`src/infrastructure/adapters/Cloud2SeatCommandAdapter.ts` — implements `unassignSeat` via `POST /dc/unseat_passenger` with `{ flightId, seatNumber }` payload.

### MockSeatCommandAdapter

`src/infrastructure/adapters/MockSeatCommandAdapter.ts` — implements `unassignSeat` by removing the passenger assignment from the in-memory seat map (sets `passengerId` and `passengerKey` to null).

### useSeatUnassign Hook

`src/presentation/hooks/useSeatUnassign.ts` — React Query mutation hook wrapping `ISeatCommandService.unassignSeat`. Invalidates `seatPlan` cache on success and exposes `{ unassign, isLoading, error }`.

### PassengerDetailDrawer — UNSEAT Button

`src/presentation/components/PassengerDetailDrawer.tsx` — UNSEAT button added to the drawer footer. Calls `onUnassign(seat)` callback when clicked; button is disabled while `isUnassigning` is true.

### SeatPlanTab — handleUnassign Wiring

`src/presentation/components/SeatPlanTab.tsx` — `useSeatUnassign` instantiated at tab level. `handleUnassign` handler passed to `PassengerDetailDrawer` as `onUnassign`. Drawer closes after successful unassign.

---

## Tests Added This Phase

| File | Tests |
|------|-------|
| `src/domain/seat/commands/__tests__/seatCommands.test.ts` | 15 (UnassignSeatCommand validation + happy path) |
| `src/presentation/hooks/__tests__/useSeatUnassign.test.tsx` | 4 (mutation success, error, loading state, cache invalidation) |
| `src/infrastructure/adapters/__tests__/Cloud2SeatCommandAdapter.test.ts` | 6 (unassignSeat endpoint, payload, error handling) |
| `src/presentation/components/__tests__/SeatPlanTab.test.tsx` | 4 new (handleUnassign wiring, drawer close on success) |

**Tests added this phase: ~29**
**Cumulative suite total: 205 passing, 3 skipped (208)**

---

## TDD Phases Executed

All work followed strict RED-GREEN-REFACTOR. No implementation was written before a failing test was observed. No tests were skipped or pre-greened.
