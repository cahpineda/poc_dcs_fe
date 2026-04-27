---
phase: 12-color-geometry
plan: 01
type: tdd
status: complete
completed: 2026-04-27
tests_added: 12
tests_total: 197
---

# Phase 12-01 Summary: Color Palette and Seat Geometry

## What was built

Updated the React POC to exactly match cloud_2's color palette and seat cell geometry.

### CSS Tokens (`src/styles/tokens.css`)
- `--color-seat-available: #4A4D4F`
- `--color-seat-occupied: #947a9c`
- `--color-seat-checked-in: #C1AA02`
- `--color-seat-boarded: #77AE00`
- `--color-seat-infant: #006400`
- `--seat-cell-width: 28px` (middle seats B-E)
- `--seat-cell-width-side: 38px` (side seats A/F)
- `--seat-cell-height: 35px`

### SeatCell (`src/presentation/components/SeatCell.tsx`)
- `isSideSeat` computed via `/[AF]$/.test(seatNumber)`
- `.seat_cell_side` CSS class applied to A/F seats (+10px width)
- `dimmed` prop for reseat mode visual cue

### CSS classes (`src/styles/components.css`)
- `.seat_cell_side` — `width: var(--seat-cell-width-side)`
- `.seat_cell_dimmed` — `opacity: 0.4`
- `.seat_rush` — `outline: 2px solid orange`
- `.seat_ssr_wchr` — WCHR badge styling

## Tests

12 new tests in `SeatCell.test.tsx`:
- Side seat class applied for A/F seats
- Middle seat class NOT applied for B-E seats
- `isSideSeat` false for non-A/F seats
- Color token assertions for all 5 status values
- Cell width assertions (28px middle, 38px side)
- Dimmed class when dimmed prop true

## Metrics

- Tests: 197 total, 0 failures
- TypeScript: 0 errors
- Category 3 (Design Tokens): 5/15 → 15/15
