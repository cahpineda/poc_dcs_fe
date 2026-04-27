---
plan: 14-01
phase: 14
title: Passenger overlays — WCHR badge, rush status, boarding group/PNR, cabin dividers
status: complete
completed: 2026-04-27
---

## What Was Built

### Feature 1 — WCHR Badge on SeatCell

`src/presentation/components/SeatCell.tsx` gained a conditional badge element rendered when `seat.ssrs` includes `'WCHR'`. The badge carries class `seat_ssr_wchr` and displays the text `W`, making wheelchair-requiring passengers immediately visible on the seat map without opening the drawer.

`src/styles/components.css` received the `.seat_ssr_wchr` rule — a small absolute-positioned badge in the upper-right corner of the seat cell.

### Feature 2 — Rush Status Outline on SeatCell

`SeatCell.tsx` applies CSS class `seat_rush` to the root seat element when `rushStatus={true}` is passed as a prop. No badge is rendered; the class alone provides the visual marker (border/glow defined in CSS), keeping the overlay lightweight and composable with the WCHR badge.

### Feature 3 — Boarding Group and PNR in PassengerDetailDrawer

`src/presentation/components/PassengerDetailDrawer.tsx` now renders two conditional rows in the passenger details section:

- **Boarding Group** — shown as `Boarding Group: <number>` when `boardingGroup` is not null
- **PNR** — shown as `PNR: <string>` when `pnr` is not null

Both fields were already present on the `Seat` domain entity after Phase 13; this phase wires them into the UI. Rows are omitted entirely (no empty placeholder) when the value is null.

### Feature 4 — Cabin Class Dividers in CabinDeck

`src/presentation/components/CabinDeck.tsx` now inserts a `<CabinDivider>` component between consecutive `SeatRow` elements whose `cabinClass` values differ. The divider renders `<div class="cabin_divider">` with a human-readable label:

- `cabinClass === 'F'` → `First Class`
- `cabinClass === 'J'` → `Business`
- `cabinClass === 'Y'` → `Economy`

The `CabinDivider` component is colocated in `CabinDeck.tsx`. No divider is inserted when adjacent rows share the same cabin class, and no divider is prepended before the first row.

---

## Files Modified

| File | Change |
|------|--------|
| `src/presentation/components/SeatCell.tsx` | Added `ssrs` prop, `seat_ssr_wchr` badge, `rushStatus` prop, `seat_rush` class |
| `src/presentation/components/PassengerDetailDrawer.tsx` | Added boarding group and PNR conditional rows |
| `src/presentation/components/CabinDeck.tsx` | Added `CabinDivider` component, divider insertion logic |
| `src/styles/components.css` | Added `.seat_ssr_wchr` badge styles, `.seat_rush` outline styles, `.cabin_divider` styles |

---

## Tests Added This Phase

| File | New Tests | Description |
|------|-----------|-------------|
| `src/presentation/components/__tests__/SeatCell.test.tsx` | 6 | WCHR badge present/absent (3 cases), `seat_rush` class applied/not applied (3 cases) |
| `src/presentation/components/__tests__/PassengerDetailDrawer.test.tsx` | 4 | Boarding group shown/hidden, PNR shown/hidden |
| `src/presentation/components/__tests__/CabinDeck.test.tsx` | 4 | Divider between different classes, both F→J and J→Y transitions, label text, no divider when same class |

**Tests added this phase: 14**
**Cumulative suite total: 219 passing, 3 skipped (222)**

---

## TDD Phases Executed

All four features followed strict RED-GREEN-REFACTOR. No implementation was written before a failing test was observed. Each feature's tests were written and confirmed FAIL before any source file was touched. TypeScript compilation clean (`npx tsc --noEmit` zero errors).
