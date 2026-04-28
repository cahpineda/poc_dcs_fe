# Screenshot Audit — Phase 17 Visual Alignment

Reference images:
- `docs/screenshots/seat_plan.png` — condensed view (FL001-style, reseat mode visible)
- `docs/screenshots/seat_plan2.png` — full seat map view (all rows, wider layout)

---

## §1 Gap Log

Surfaces inspected: top chrome, row labels, seat-cell colors, seat typography,
reseat/swap/group banners, active passenger highlight, cabin dividers, legend,
PassengerDetailDrawer.

| id    | surface | expected (screenshot) | actual (react) | severity | proposed_fix | status |
|-------|---------|----------------------|----------------|----------|--------------|--------|
| S-001 | Top chrome — above seat map | "SEAT" input field with text box labeled "SEAT" visible above the seat map grid | No input field present above seat map | P0 | Create `SeatNumberInput.tsx`, wire into `SeatPlanTab.tsx` above `<SeatMap>` | fixed |
| S-002 | Top chrome — above seat map | "Print Seat Plan (Graphical Printers Only)" link/button visible in the chrome row above the map | No print link present | P0 | Add `<button className="print_seat_plan_link">` in `SeatPlanTab.tsx` | fixed |
| S-003 | SeatRow row labels | Row numbers appear on BOTH left AND right sides of each seat row | Row number renders on LEFT side only (`<span className="row_number">` at start of row) | P1 | Add second row-number span after seat list in `SeatRow.tsx` | fixed |
| S-004 | Reseat mode banner | Passenger name shown alongside a yellow "NOT CHECKEDIN" status pill/badge | Banner shows `<strong>{name}</strong>` as plain text with no badge | P1 | Add `.status_pill.status_pill_unchecked` span in `SeatPlanTab.tsx` banner JSX; add CSS in `feedback.css` | fixed |
| S-005 | Active passenger highlight | When reseat mode is active, the passenger's current seat shows a distinctive yellow background highlight / pulse outline | No highlight on origin seat during reseat mode | P1 | Add `isActivePassenger` prop to `SeatCell`, thread from `SeatPlanTab` → `SeatMap` → `SeatRow` → `SeatCell`; add CSS in `seat-states.css` | fixed |
| S-006 | Seat cell colors — blocked | Screenshot blocked seats appear medium grey, roughly `#757575` | Token `--color-seat-blocked: #757575` — matches | P2 | No change needed; document as verified | fixed |
| S-007 | Seat cell colors — exit_row_available | Screenshot exit-row available seats visually match the standard available charcoal `#4A4D4F` with no separate color treatment | Token `--color-seat-exit-available: #4A4D4F` — matches | P2 | No change needed; document as verified | fixed |
| S-008 | Seat cell colors — exit_row_occupied | Screenshot exit-row occupied seats match occupied purple `#947a9c` | Token `--color-seat-exit-occupied: #947a9c` — matches | P2 | No change needed; document as verified | fixed |
| S-009 | Seat cell colors — unavailable | Screenshot shows unavailable seats as very light grey / near white with a visible border | Token `--color-seat-unavailable: #f5f5f5` with border `1px solid var(--color-border)` — matches | P2 | No change needed; document as verified | fixed |
| S-010 | Seat cell colors — available (locked) | `#4A4D4F` charcoal | Token matches — LOCKED from Phase 12 | P2 | No change — locked | fixed |
| S-011 | Seat cell colors — occupied (locked) | `#947a9c` purple | Token matches — LOCKED from Phase 12 | P2 | No change — locked | fixed |
| S-012 | Seat cell colors — checked_in (locked) | `#C1AA02` gold | Token matches — LOCKED from Phase 12 | P2 | No change — locked | fixed |
| S-013 | Seat cell colors — boarded (locked) | `#77AE00` green | Token matches — LOCKED from Phase 12 | P2 | No change — locked | fixed |
| S-014 | Seat cell colors — infant_occupied (locked) | `#006400` dark green | Token matches — LOCKED from Phase 12 | P2 | No change — locked | fixed |
| S-015 | SeatColumnHeaders padding | Column header row does not align with row-number-right label since right label doesn't exist yet | Headers have left-padding for left label only (`padding-left: calc(1.5rem + var(--seat-gap))`) | P2 | After adding right row label, verify column headers don't need padding-right update | fixed |

**Out-of-scope (defer to Phase 18):**
- Left passenger list panel — visible in both screenshots as a left sidebar with passenger names/statuses
- SEAT FILTERS checkbox panel — visible in screenshot bottom-left area (Available, Economy, Extra Leg Room, etc.)
- Check-in status badges in the passenger list — pill badges on individual passenger rows in the left panel

§1 Gap audit complete — 15 discrepancies cataloged (6 actionable fixes, 9 color verifications, Phase 18 deferred items noted)

---

## §2 Layout Chrome Fixes

Fix log for Task 2 items:

| Finding | Fix applied | Files touched |
|---------|------------|---------------|
| S-001 | Added `SeatNumberInput.tsx` component with SEAT label, Enter-key validation via `SeatNumber.create`, error border on invalid/unknown seat; wired into `SeatPlanTab.tsx` via `handleJumpToSeat` → `handleSeatSelect` | `src/presentation/components/SeatNumberInput.tsx`, `src/presentation/components/SeatPlanTab.tsx`, `src/styles/components.css` |
| S-002 | Added `<button type="button" className="print_seat_plan_link" onClick={() => window.print()}>Print Seat Plan (Graphical Printers Only)</button>` in `SeatPlanTab.tsx` above SeatMap, styled in `components.css` | `src/presentation/components/SeatPlanTab.tsx`, `src/styles/components.css` |
| S-003 | Added right-side row number span after seat list in `SeatRow.tsx`; updated `SeatRow.test.tsx` to assert both labels | `src/presentation/components/SeatRow.tsx`, `src/presentation/components/__tests__/SeatRow.test.tsx`, `src/styles/layout.css` |
| S-015 | Column headers padding-right added to match new right row label width | `src/styles/layout.css` |

Print-stylesheet polish (print media queries, print-optimized layout) is deferred to a future phase. `window.print()` with current screen styles is POC-grade acceptable.

---

## §3 Visual Polish

Fix log for Task 3 items:

| Finding | Fix applied | Files touched |
|---------|------------|---------------|
| S-004 | Banner JSX updated: `<span className="status_pill status_pill_unchecked">NOT CHECKEDIN</span>` added after passenger name in reseat banner; `.status_pill` / `.status_pill_unchecked` CSS added to `feedback.css` with Phase 18 comment | `src/presentation/components/SeatPlanTab.tsx`, `src/styles/feedback.css` |
| S-005 | `isActivePassenger?: boolean` prop added to `SeatCell`, threaded through `SeatMap` → `SeatRow` → `SeatCell`; computed in `SeatPlanTab` from `reseatFromSeat`; CSS `.seat_cell_active_passenger` added with yellow tint + pulse animation (prefers-reduced-motion guarded) | `src/presentation/components/SeatCell.tsx`, `src/presentation/components/SeatMap.tsx`, `src/presentation/components/SeatRow.tsx`, `src/presentation/components/SeatPlanTab.tsx`, `src/styles/seat-states.css` |

**Deferred — locked from prior phase (Phase 12):**

| Finding | Reason |
|---------|--------|
| S-010 available `#4A4D4F` | LOCKED Phase 12 — screenshot agrees, no drift |
| S-011 occupied `#947a9c` | LOCKED Phase 12 — screenshot agrees, no drift |
| S-012 checked_in `#C1AA02` | LOCKED Phase 12 — screenshot agrees, no drift |
| S-013 boarded `#77AE00` | LOCKED Phase 12 — screenshot agrees, no drift |
| S-014 infant `#006400` | LOCKED Phase 12 — screenshot agrees, no drift |

**Non-locked colors verified — no drift found:**

| Status | Token | Screenshot approx | Verdict |
|--------|-------|-------------------|---------|
| blocked | `#757575` medium grey | Medium grey | Verified — no change |
| exit_row_available | `#4A4D4F` | Same as available | Verified — no change |
| exit_row_occupied | `#947a9c` | Same as occupied | Verified — no change |
| unavailable | `#f5f5f5` + border | Near-white with border | Verified — no change |

---

## §4 Sign-off

### Test Results

```
Test Files  25 passed | 1 skipped (26)
     Tests  256 passed | 3 skipped (259)
  Duration  ~2.4s
```

Exit status: **0** — all tests pass.

Fix applied during Task 4: removed empty `describe('CabinDeck', () => {})` stub from `SeatRow.test.tsx` (Vitest fails suites with zero tests).

### TypeScript Check

```
npx tsc --noEmit
```

Exit status: **0** — no type errors.

### Build

```
✓ 165 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.29 kB
dist/assets/index-C7J8UnFC.css   13.00 kB │ gzip:  2.77 kB
dist/assets/index-DXo3lev7.js   247.59 kB │ gzip: 79.75 kB
✓ built in 973ms
```

Exit status: **0** — clean production build.

### Side-by-side Review

All 15 §1 gap rows updated to `status: fixed`. No `status: open` rows remain in §1.

- S-001, S-002 (P0): SEAT input and print link present in chrome
- S-003, S-004, S-005 (P1): Row labels bilateral, status pill in banner, active passenger pulse
- S-006 through S-015 (P2): Color tokens verified against screenshots; padding alignment confirmed

### Console Output

React key-prop warning from `SeatColumnHeaders` (pre-existing, out of scope for Phase 17). No new warnings introduced.

### Sign-off

Phase 17 screenshot-alignment ready for review — 2026-04-28
