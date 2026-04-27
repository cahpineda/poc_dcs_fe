---
phase: 05-seat-operations
plan: 04
completed: 2026-04-27
duration: 6m
---

# Plan 05-04: SeatPlanTab Command Wiring + Dev Preview

Wired useSeatAssign and autoAssignSeat into SeatPlanTab — assign flow with loading/error/success feedback — build clean, 81 tests passing.

## Task 1: MockSeatCommandAdapter

Created `src/infrastructure/adapters/MockSeatCommandAdapter.ts` — implements ISeatCommandService, resolves all mutations after 300ms delay (simulates network for dev preview). All 4 methods (`assignSeat`, `blockSeat`, `unblockSeat`, `reseatPassenger`) resolve with `void`.

## Task 2: DependencyProvider update

Added `MockSeatCommandAdapter` import. Swapped `seatCommand` to `import.meta.env.DEV ? new MockSeatCommandAdapter() : new Cloud2SeatCommandAdapter(axiosInstance)` — symmetric with `seatQuery` swap.

## Task 3: SeatPlanTab command wiring

Updated `SeatPlanTab.tsx`:
- `useSeatAssign(flightId)` mutation hooked in
- `handleSeatSelect` fires `AssignSeatCommand.create({ passengerId: 'DEMO-PAX', seatNumber, flightId })` on click
- `handleAutoAssign` calls `autoAssignSeat(seatPlan)` → mutate on result
- Mutation status: `isPending` → "Assigning…", `isError` → error message, `isSuccess` → "Seat assigned"
- Auto-assign button disabled while mutation is pending

## Human Verify

Dev server at http://localhost:5173 — clicking available seat shows "Assigning…" → "Seat assigned"; Auto-assign button highlights zone-balanced seat.

## Commits

```
feat(05-04): wire useSeatAssign + autoAssignSeat into SeatPlanTab, add MockSeatCommandAdapter dev mock
```
