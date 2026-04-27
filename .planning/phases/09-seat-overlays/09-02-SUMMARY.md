---
phase: 09-seat-overlays
plan: 02
completed: 2026-04-27
duration: 12m
---

# Plan 09-02: Infant Indicator + Block Alert Overlay

## Tests Added

- `describe('overlay indicators')` in `SeatCell.test.tsx` — 7 cases:
  - infant indicator present when hasInfant=true
  - no indicator when hasInfant=false
  - no indicator when hasInfant=undefined
  - block indicator present with correct title when blockNote non-empty
  - no block indicator when blockNote is empty string
  - no block indicator when blockNote is undefined
  - infant indicator has aria-label="infant"
- `describe('infant and block flags')` in `Seat.test.ts` — 5 cases:
  - hasInfant defaults to false
  - hasInfant=true when set
  - blockNote defaults to null
  - blockNote preserved when provided
  - whitespace-only blockNote normalized to null
- `seatPlanMapper.test.ts` — 1 case: maps `has_infant` and `block_note` DTO fields

**Total new tests: 13**

## Files Modified

- `src/domain/seat/Seat.ts` — Added `hasInfant?: boolean` and `blockNote?: string` to SeatProps; `_hasInfant: boolean` and `_blockNote: string | null` fields; getters; updated `withStatus` to preserve all fields
- `src/infrastructure/adapters/mappers/seatPlanMapper.ts` — Passes `has_infant` and `block_note` from DTO
- `src/infrastructure/adapters/mappers/__tests__/seatPlanMapper.test.ts` — 1 new test
- `src/presentation/components/SeatCell.tsx` — Added `hasInfant?: boolean` and `blockNote?: string` props; renders `.seat_infant_indicator` and `.seat_block_indicator` inside button
- `src/presentation/components/SeatRow.tsx` — Passes `seat.hasInfant` and `seat.blockNote ?? undefined` to SeatCell
- `src/infrastructure/adapters/MockSeatPlanAdapter.ts` — Seat 1D gets `blockNote: 'Crew rest area'`; seat 2F gets `hasInfant: true`
- `src/styles/seat-states.css` — Added `position: relative` to `.seat_cell`; added `.seat_infant_indicator` and `.seat_block_indicator` rules

## RED → GREEN → REFACTOR Notes

**RED:** Only 3 of 7 tests initially failed (the `not.toBeInTheDocument` tests passed since elements didn't exist)
**GREEN:** Truthy check on `blockNote` correctly excludes empty string and undefined
**CSS:** `.seat_cell` lacked `position: relative` — added. Indicator colors use `var(--color-seat-infant, #f59e0b)` and `var(--color-seat-blocked, #dc2626)`. Tokens `--color-seat-infant` and `--color-seat-blocked` ARE already defined in `tokens.css` (Phase 6) — fallbacks are backup only.

## Dev Preview Observations

- Seat 1D: blocked (grey), red circle dot bottom-left, hover shows "Crew rest area" tooltip
- Seat 2F: infant_occupied (purple), orange rectangular dot bottom-right, "BK" initials
- Available seats: no indicators
- Indicators do not intercept clicks (pointer-events: none)
