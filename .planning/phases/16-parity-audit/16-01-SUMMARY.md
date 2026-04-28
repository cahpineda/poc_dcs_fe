---
phase: 16
plan: "01"
completed: 2026-04-28
duration: 180m
---

# Phase 16-01 Parity Audit — Summary

**What was built:** Full cloud2 parity audit of the React seat-plan UI — 86 rows audited across visual (§1), functional (§2), and edge-case (§3) dimensions; 27 discrepancies fixed spanning CSS layout, API payload serialization, error display, and UX edge cases; test suite updated to match fixed behavior; 244 tests passing.

---

## Tasks Completed

| # | Task | Outcome |
|---|------|---------|
| 1 | Visual audit (§1) — 50 rows | 14 discrepancies found: V-011/V-050, V-021, V-026, V-029, V-032, V-035, V-036, V-040, V-042, V-043, V-044, V-045, V-046 |
| 2 | Functional audit (§2) — 28 rows | 15 discrepancies found: F-005, F-007, F-010, F-012, F-014, F-015, F-017, F-018, F-020, F-021, F-023, F-024, F-027, F-028 (deferred) |
| 3 | Edge-case audit (§3) — 8 rows | 3 discrepancies: E-003 (covered by F-015), E-005, E-008 |
| 4 | Apply all P0/P1/P2 fixes | 27 issues fixed; 2 test files updated to match parity behavior |
| 5 | Final validation — sign-off | 244 tests, tsc exit 0, build clean; §5 written |

---

## Fix Count by Priority

| Priority | Count | Refs |
|----------|-------|------|
| P0 | 13 | V-011/V-050, V-021, V-029, V-032, V-036, F-007, F-010, F-012, F-014, F-015/E-003, F-017, F-020, F-023 |
| P1 | 10 | V-026, V-043, V-044, V-045, V-046, F-018, F-021, F-024, F-027, E-005 |
| P2 | 5 | V-035, V-040, V-042, F-005, E-008 |
| Deferred | 1 | F-028 (getSeatOccupancy hook — future phase) |

---

## Files Modified

### CSS
- `src/styles/seat-states.css` — `.seat_cell_side` width rule, infant indicator repositioned (bottom-left)
- `src/styles/components.css` — WCHR badge to bottom-right, backdrop overlay, drawer action button styles, drawer width 320px
- `src/styles/layout.css` — `.column_label` side-column width fix

### Components
- `src/presentation/components/SeatRow.tsx` — `<AisleGap />` between C and D columns
- `src/presentation/components/SeatColumnHeaders.tsx` — aisle spacer + side-column width
- `src/presentation/components/CabinDeck.tsx` — first-cabin divider, empty-state message
- `src/presentation/components/SeatLegend.tsx` — labels: "Checked In", "Infant"; removed "Selected"
- `src/presentation/components/PassengerDetailDrawer.tsx` — SSR/rush display, action button classes, `infant_occupied` label, `DRAWER_STATUSES` extended
- `src/presentation/components/SeatPlanTab.tsx` — reseat/unassign/swap/group-reseat error displays, reseat pending indicator, backdrop, Esc key handler, `infant_occupied` in DRAWER_STATUSES, 404 error message improvement

### Infrastructure
- `src/infrastructure/adapters/Cloud2SeatCommandAdapter.ts` — snake_case serialization for all 7 POST commands

### Hooks
- `src/presentation/hooks/useSeatGroupReseat.ts` — exposed `isError` and `error` from mutation

### Server Fixtures
- `server/data/flights.js` — FL003 fixture (zero seats, for E-005 empty-flight test)

### Tests (updated to match parity-fixed behavior)
- `src/infrastructure/adapters/__tests__/Cloud2SeatCommandAdapter.test.ts` — expected payloads updated to snake_case
- `src/presentation/components/__tests__/SeatLegend.test.tsx` — updated labels, 9-entry count, no "Selected"

---

## Test Results

```
Test Files  24 passed | 1 skipped (25)
Tests       244 passed | 3 skipped (247)
TypeScript  exit 0 (0 errors)
Build       succeeded — 245.93 kB JS, 11.41 kB CSS
```

---

## Deferred Items

| ref | reason |
|-----|--------|
| F-028 | `getSeatOccupancy` endpoint exists in adapter but no hook or component consumes it — future integration phase |

---

## Retrospective

**Diagnosis accuracy:** Plan assumptions were accurate on API shape mismatches (camelCase vs snake_case was the dominant P0 class). CSS layout gaps (aisle gap, side-seat width, column header alignment) were correctly predicted as P0 severity.

**What surprised us:** The `useSeatSwap` hook already had `isError`/`error` exposed — only `useSeatGroupReseat` was missing it. The SeatLegend tests were written against the pre-parity labels and needed updating after V-040 landed, which is a standard pattern: tests document the intended behavior, so they should be updated when the intended behavior changes to match the reference system.

**Time sinks:** The Cloud2SeatCommandAdapter tests failed because they were asserting the raw command object was passed through — they needed to be updated to assert the mapped snake_case body. This is expected when adding a serialization layer but not obvious until the tests run.

**Reusable patterns:** When adding a serialization/mapping layer to an adapter, always update the adapter's unit tests in the same commit — the tests verify the wire format, not the domain object. Snake_case mapping is best done at the adapter boundary (not in the domain command) to keep domain objects clean.
