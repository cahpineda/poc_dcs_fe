---
phase: 06-design-tokens
plan: 03
completed: 2026-04-27
duration: 5m
---

# Plan 06-03: Style Wiring + Component Class Alignment

Wired all stylesheets into the app and aligned component class names. Build bundles 5.21 kB CSS, 81/81 tests green.

## Created

`src/styles/index.css` — barrel importing all 5 stylesheets in dependency order.

## Updated

`src/main.tsx`:
- Added `import './styles/index.css'`
- Removed redundant `DependencyProvider` wrapper (already in `App.tsx`)

`src/presentation/components/SeatCell.tsx`:
- Fixed `AisleGap` class: `aisle_spacer` → `aisle_gap` (matches seat-states.css)

`src/presentation/components/SeatLegend.tsx`:
- Switched from `<ul>/<li>` to `<div>` structure with `legend_item`/`legend_swatch` divs
- Fixed exit row legend class: `seat_exit` → `seat_exit_row_available`
- Swatches now inherit background color from seat-states.css

## Test fixes

- `SeatCell.test.tsx`: updated 3 `aisle_spacer` → `aisle_gap`
- `SeatLegend.test.tsx`: updated `seat_exit` → `seat_exit_row_available`

## Verification

- `npm run build`: ✅ 153 modules, 5.21 kB CSS, 0 errors
- `npm test`: ✅ 81/81
- `npx tsc --noEmit`: ✅ 0 errors
- Dev preview at http://localhost:5173: styled seat map with colored seat buttons
