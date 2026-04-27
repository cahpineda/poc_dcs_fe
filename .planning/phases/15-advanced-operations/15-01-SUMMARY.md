---
phase: 15-advanced-operations
plan: 01
type: tdd
status: complete
completed: 2026-04-27
tests_added: 21
tests_total: 244
---

# Phase 15-01 Summary: Advanced Operations (Swap + Group Reseat)

## What was built

Implemented the two remaining Category 4 operations: seat swap (two-click flow) and group reseat (multi-select + MOVE GROUP).

### Value Objects
- `SwapSeatsCommand` — `{ flightId, seatA, seatB }` — private constructor + `static create()` factory
- `ReseatGroupCommand` — `{ flightId, passengerIds: string[], targetRow?: number }` — throws on empty passengerIds

### Port Interface (`ISeatCommandService.ts`)
Added:
```ts
swapSeats(command: SwapSeatsCommand): Promise<void>;
reseatGroup(command: ReseatGroupCommand): Promise<void>;
```

### Adapters
- `Cloud2SeatCommandAdapter` — `swapSeats` → `POST /dc/swap_seats`, `reseatGroup` → `POST /dc/reseat_group`
- `MockSeatCommandAdapter` — both methods with 300ms delay stub

### Hooks
- `useSeatSwap` — two-click state machine: first `selectSeat` stores `firstSeat`, second fires `SwapSeatsCommand`; `cancel()` clears state
- `useSeatGroupReseat` — `Set<string>` multi-select; `togglePassenger`, `confirm` (fires `ReseatGroupCommand`), `cancel`

### UI (`SeatPlanTab.tsx` + `PassengerDetailDrawer.tsx`)
- SWAP button in drawer for occupied seats → `handleSwap` → `swapHook.selectSeat(seat)`
- Swap mode banner (`role="status"`) visible when `swapHook.firstSeat !== null`
- GROUP RESEAT toolbar button → sets `groupReseatMode`
- Group select banner + MOVE GROUP button → calls `groupReseatHook.confirm()`
- Cancel buttons for both modes

### Conflict resolved
Existing tests used `/reseat/i` which matched the new "Group Reseat" button. Tightened to `/^reseat$/i` (anchored exact match) to preserve test intent.

## Tests

21 new tests:
- `SwapSeatsCommand` — 4 tests (create, validation, field access, immutability)
- `ReseatGroupCommand` — 4 tests (create, empty passengerIds throws, field access)
- `useSeatSwap` — 5 tests (idle state, first seat set, swap fires on second, cancel, isPending)
- `useSeatGroupReseat` — 4 tests (toggle, confirm, cancel, empty set)
- `SeatPlanTab` swap/group mode — 4 integration tests

## Metrics

- Tests: 244 total, 0 failures, 3 skipped (integration guards)
- TypeScript: 0 errors
- Category 4 (Operations): all gaps closed
- Target parity score: ~95/100
