---
phase: 04-seat-map-ui
plan: 02
completed: 2026-04-27
duration: 8m
---

# Plan 04-02: SeatRow + CabinClassSection + CabinDeck

Created the layout composition layer — SeatRow renders a row of SeatCells, CabinDeck stacks rows in the cabin grid — 7 tests GREEN (53 total).

## RED

Wrote 4 tests for SeatRow (row number label, empty seats, exit_row class, click propagation) and 3 tests for CabinDeck (renders all rows, empty deck, seat_map_container wrapper).

Tests failed: `Cannot resolve import "../SeatRow"` and `"../CabinDeck"`.

## GREEN

Created `SeatRow.tsx`: renders `cabin_row` div with optional `exit_row` class, row number label span, maps `row.seats` to `SeatCell` with `isSelected` derived by comparing to `selectedSeat` prop.

Created `CabinClassSection.tsx`: groups rows under a class label — not directly tested but used by future SeatMap.

Created `CabinDeck.tsx`: wraps all `SeatRow` components in `seat_map_container` div.

## REFACTOR

None needed.

## Commits

```
test(04-02): add failing tests for SeatRow and CabinDeck
feat(04-02): implement SeatRow, CabinClassSection, CabinDeck layout components
```
