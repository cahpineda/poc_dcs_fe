---
plan: 10-02
phase: 10
title: Block/Unblock wiring — connect mutations to drawer buttons
status: complete
completed: 2026-04-27
tests_added: 6
tests_total: 153
---

## What was built

Wired `useSeatBlock`/`useSeatUnblock` mutation hooks into `SeatPlanTab`'s `handleBlock`/`handleUnblock` handlers, replacing the stub noops from plan 10-01. Added pending-state tests for the drawer UI.

## Artifacts

### Modified files
- `src/presentation/components/SeatPlanTab.tsx`
  - Added imports for `BlockSeatCommand` and `UnblockSeatCommand`
  - `handleBlock(seat)` → `blockMutate(BlockSeatCommand.create({ seatNumber: seat.number.toString(), flightId, reason: '' }))` + closes drawer
  - `handleUnblock(seat)` → `unblockMutate(UnblockSeatCommand.create({ seatNumber: seat.number.toString(), flightId }))` + closes drawer
- `src/styles/feedback.css` — added `.drawer_action_pending { opacity: 0.6; cursor: wait; }`

### New tests
- `SeatPlanTab.test.tsx` — 2 new integration tests in `describe('SeatPlanTab — block/unblock wiring')`:
  - clicking Block seat calls `blockMutateSpy` with `BlockSeatCommand` for the correct seatNumber/flightId
  - clicking Unblock seat calls `unblockMutateSpy` with `UnblockSeatCommand` for the correct seatNumber/flightId
- `PassengerDetailDrawer.test.tsx` — 4 new pending-state tests:
  - Block button disabled + `drawer_action_pending` class when `blockPending=true`
  - Unblock button disabled + `drawer_action_pending` class when `unblockPending=true`
  - Reseat button disabled when `blockPending=true`
  - Reseat button disabled when `unblockPending=true`

## Key decisions

- **`reason: ''`** passed to `BlockSeatCommand.create` — the domain validates non-empty `seatNumber`/`flightId` only; reason is stored but not validated. A real UI would prompt for reason; this is deferred.
- **Drawer closes on mutation call** — `setSelectedSeatObj(null)` fires immediately on block/unblock click. Optimistic close avoids stale drawer state after cache invalidation.
- **Mock spies promoted to module-level** — `blockMutateSpy`/`unblockMutateSpy` are now module-level `vi.fn()` in `SeatPlanTab.test.tsx` so integration tests can assert on them.

## Test count
- 2 (SeatPlanTab integration) + 4 (PassengerDetailDrawer pending state) = 6 new tests
- Total: 153 passing
