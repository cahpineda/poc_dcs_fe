---
plan: 10-03
phase: 10
title: Reseat flow — useSeatReseat hook + reseatMode prop threading + banner
status: complete
completed: 2026-04-27
tests_added: 18
tests_total: 171
---

## What was built

Full reseat workflow: agent opens drawer on occupied seat, clicks Reseat, seat map enters reseat mode (banner visible, non-available seats dimmed and unclickable), agent picks new available seat, ReseatPassengerCommand fires, on success banner clears.

## Artifacts

### New files
- `src/presentation/hooks/useSeatReseat.ts` — mirrors `useSeatAssign`, calls `services.seatCommand.reseatPassenger`, invalidates `['seatPlan', flightId]` on success
- `src/presentation/hooks/__tests__/useSeatReseat.test.tsx` — 4 tests: shape, service call, cache invalidation, no cross-flight invalidation

### Modified files
- `src/presentation/components/SeatCell.tsx`
  - Added `reseatMode?: boolean` prop (default false)
  - Replaced single `CLICKABLE_STATUSES` with `NORMAL_CLICKABLE` (all 7) and `RESEAT_MODE_CLICKABLE` (available + exit_row_available)
  - `clickableSet` computed conditionally; `isClickable` drives the `handleClick` gate
  - `dimmed = reseatMode && !isClickable && status !== 'unavailable'` → adds `.seat_cell_dimmed` class
- `src/presentation/components/SeatRow.tsx` — accepts + passes `reseatMode` to SeatCell
- `src/presentation/components/CabinDeck.tsx` — accepts + passes `reseatMode` to SeatRow
- `src/presentation/components/SeatMap.tsx` — accepts + passes `reseatMode` to CabinDeck
- `src/presentation/components/SeatPlanTab.tsx`
  - Added `useSeatReseat` import and 3 state fields: `reseatPassengerId`, `reseatFromSeat`, `reseatPassengerName`; derived `reseatMode`
  - Replaced stub `handleReseat` with real implementation: resolves passengerId via `'PAX-' + seat.number` (TODO comment for real passenger registry), sets reseat state, closes drawer
  - `handleSeatSelect` branches on `reseatMode` FIRST; fires `ReseatPassengerCommand` and clears state on success via `onSuccess` callback
  - Added `handleCancelReseat` to clear reseat state
  - Added reseat banner with `role="status"` rendering conditionally before SeatMap
  - Passes `reseatMode` to SeatMap
- `src/styles/feedback.css` — added `.reseat_mode_banner` (soft-yellow accent) and `.seat_cell_dimmed` (0.4 opacity)

### Tests
- `src/presentation/hooks/__tests__/useSeatReseat.test.tsx` — 4 tests
- `src/presentation/components/__tests__/SeatCell.test.tsx` — 6 new reseat-mode tests
- `src/presentation/components/__tests__/SeatPlanTab.test.tsx` — 6 new reseat-flow tests (drawer → banner → pick seat → command fires → mode exits; cancel flow; occupied seat ignored in reseat mode)

## Key decisions

- **`resolvePassengerId(seat)` synthesizes `'PAX-' + seat.number`**: Seat domain has no `passengerId` field. Real implementation deferred until a Passenger entity is introduced. TODO comment in place.
- **`reseatMode` is derived, not stored**: `const reseatMode = reseatPassengerId !== null` — no extra state needed.
- **Reseat mode check BEFORE occupied-branch in `handleSeatSelect`**: if reseat mode ran second, an occupied-seat click would incorrectly open the drawer instead of being ignored.
- **Prop threading over context**: tree is 4 levels shallow, only SeatCell consumes it; explicit props keep data flow auditable.
- **`onSuccess` callback on `reseatMutation.mutate`**: clears the three reseat state fields inline rather than relying on `invalidateQueries` side effects for UI cleanup.

## Test count
- 4 (useSeatReseat) + 6 (SeatCell reseatMode) + 6 (SeatPlanTab reseat flow) = 18 new tests
- Cumulative plan 10 total: 23 (10-01) + 6 (10-02) + 18 (10-03) = 47 new tests
- Grand total: 171 passing
