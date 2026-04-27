---
plan: 10-01
phase: 10
title: PassengerDetailDrawer — slide-in panel on occupied seat click
status: complete
completed: 2026-04-27
tests_added: 23
tests_total: 147
---

## What was built

`PassengerDetailDrawer` component and full wiring into `SeatPlanTab` so agents can view passenger details and trigger actions by clicking occupied, checked_in, boarded, or blocked seats.

## Artifacts

### New files
- `src/presentation/components/PassengerDetailDrawer.tsx` — aside panel, `seat: Seat | null` prop, renders passengerName/seatNumber/status label, conditional Block/Unblock/Reseat buttons
- `src/presentation/components/__tests__/PassengerDetailDrawer.test.tsx` — 17 tests covering null render, all status labels, all callback props, button visibility rules

### Modified files
- `src/domain/seat/Seat.ts` — added `get passengerName()` public getter (was stored in `_passengerName` but never exposed)
- `src/presentation/components/SeatCell.tsx` — widened `CLICKABLE_STATUSES` to include `occupied`, `exit_row_occupied`, `checked_in`, `boarded`, `blocked`; these now fire `onSelect` so SeatPlanTab can intercept them
- `src/presentation/components/SeatPlanTab.tsx` — added `selectedSeatObj: Seat | null` state; `handleSeatSelect` branches on `DRAWER_STATUSES` (occupied/checked_in/boarded/blocked → open drawer, available → assign mutation); stub `handleReseat`/`handleBlock`/`handleUnblock` (wired in 10-02/10-03); renders `<PassengerDetailDrawer />`
- `src/presentation/components/__tests__/SeatCell.test.tsx` — updated "occupied seat does not call onSelect" test to match new clickable behavior
- `src/styles/components.css` — added `.passenger_drawer*` layout and action styles

### Integration tests
- `src/presentation/components/__tests__/SeatPlanTab.test.tsx` — 6 integration tests for drawer open/close/content (fixture plan with available/occupied/checked_in/blocked seats)

## Key decisions

- **String-based onSelect preserved**: `SeatCell.onSelect(seatNumber: string)` unchanged; SeatPlanTab does `seatPlan.getSeat(seatNumber)` lookup to get the full `Seat` object. Avoids breaking `SeatRow.test.tsx` which asserts `onSelect` called with string `'12A'`.
- **DRAWER_STATUSES local to SeatPlanTab**: Keeps the routing decision (open drawer vs fire mutation) in the coordinator, not in the domain.
- **Stub handlers for block/unblock/reseat**: `handleBlock`/`handleUnblock` are noops — wired in 10-02. `handleReseat` is a noop — wired in 10-03.

## Test count
- 17 (PassengerDetailDrawer unit) + 6 (SeatPlanTab integration) = 23 new tests
- Total: 147 passing
