---
phase: 04-seat-map-ui
plan: 01
completed: 2026-04-27
duration: 12m
---

# Plan 04-01: SeatCell + AisleGap + SeatLegend

Created the atomic seat UI unit — SeatCell with full status→CSS mapping, AisleGap spacer, and SeatLegend — 17 tests GREEN (46 total).

## RED

Wrote tests for SeatCell (13 tests) and SeatLegend (4 tests): status class mapping for all 7 statuses, exit row dual-class, onSelect only fires for clickable statuses, price badge renders, AisleGap has aisle_spacer class, SeatLegend renders 5 entries.

Tests failed: `Cannot resolve import "../SeatCell"` and `"../SeatLegend"`.

## GREEN

Created `src/presentation/components/SeatCell.tsx`:
- `STATUS_CLASS` record mapping all 7 SeatStatus values to cloud_2 CSS class names
- `CLICKABLE_STATUSES` set (`available`, `exit_row_available`)
- `AisleGap` co-located in same file (tiny component)

Created `src/presentation/components/SeatLegend.tsx`:
- `LEGEND_ENTRIES` const array with 5 status entries

## REFACTOR

None — clean first-pass implementation.

## Commits

```
test(04-01): add failing tests for SeatCell, AisleGap, SeatLegend
feat(04-01): implement SeatCell with status CSS mapping, AisleGap, SeatLegend
```
