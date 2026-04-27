---
phase: 04-seat-map-ui
plan: 04
completed: 2026-04-27
duration: 10m
---

# Plan 04-04: SeatMap + DeckToggle + SeatPlanTab Assembly

Assembled all Phase 4 components into a working seat map tab — `npm run build` clean, 57 tests passing, dev server confirms cabin grid renders at localhost:5174.

## Task 1: SeatMap + DeckToggle

Created `DeckToggle.tsx`: renders two buttons (Lower Deck / Upper Deck) only when `hasUpperDeck=true`; active deck button gets `deck_active` class.

Created `SeatMap.tsx`: manages `activeDeck` state, renders `<DeckToggle>` + `<CabinDeck>` for active deck rows, wrapped in `seat_map_container` div.

## Task 2: SeatPlanTab + MockSeatPlanAdapter

Created `MockSeatPlanAdapter.ts` (dev-only): returns hardcoded 2-row SeatPlanResult with available, occupied, blocked, exit_row and infant_occupied seats for visual verification.

Updated `DependencyProvider.tsx`: conditional `import.meta.env.DEV` check swaps in `MockSeatPlanAdapter` for dev preview; production path uses `Cloud2SeatPlanAdapter`.

Created `SeatPlanTab.tsx`: CQRS read root — calls `useSeatPlan`, handles loading/error/data states, renders `<SeatMap>` + `<SeatLegend>` + selected seat info.

Updated `App.tsx`: wraps `<SeatPlanTab flightId="DEV-FLIGHT-001" />` inside `<DependencyProvider>`.

Updated `src/presentation/components/index.ts`: exports DeckToggle, SeatMap, SeatPlanTab.

## Human Verify

Dev server running at http://localhost:5174 — cabin grid renders with 2 rows, 12 seats showing available/occupied/blocked/exit_row states. Seat selection wired.

## Verification

- [x] `npm run build` passes (148 modules, 0 errors)
- [x] `npm test` passes (57/57, no regressions)
- [x] SeatPlanTab handles loading/error/data states
- [x] DeckToggle only visible for multi-deck aircraft
- [x] Dev server responds at localhost:5174

## Commits

```
feat(04-04): implement DeckToggle, SeatMap, SeatPlanTab assembly with mock dev data
```
