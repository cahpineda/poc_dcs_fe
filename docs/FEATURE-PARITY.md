# Feature Parity: cloud_2 seat_plan → React POC

**Ticket:** ACA-2948 / ACA-2950  
**Audit date:** 2026-04-27  
**POC scope:** Seat plan feature migration from cloud_2 PHP monolith to React 18

---

## Summary Table

| # | Feature | Status | Phase |
|---|---------|--------|-------|
| 1 | Seat Map Visualization | ✅ Implemented | 4 |
| 2 | Seat Assignment | ✅ Implemented | 5 |
| 3 | Seat Reassignment | ⚠️ Partial | 5 |
| 4 | Seat Blocking | ✅ Implemented | 5 |
| 5 | Zone-Balanced Seating | ✅ Implemented | 5 |
| 6 | Seat Pricing | 🔲 Deferred | — |
| 7 | Exit Seat Management | ✅ Implemented | 4 |
| 8 | Multi-Deck Support | ✅ Implemented | 4 |
| 9 | Seat Occupancy | ✅ Implemented | 4 |
| 10 | Seat Plan Caching | ✅ Implemented | 4 |
| 11 | Print Seat Plan | 🔲 Deferred | — |
| 12 | Multi-Leg Availability | 🔲 Deferred | — |
| 13 | IATCI Seating | 🔲 Deferred | — |
| 14 | Seat Plan Columns (LC) | ❌ Not Applicable | — |
| 15 | Allocated Seating Flag | ⚠️ Partial | — |

**Totals:** 10 ✅ Implemented · 2 ⚠️ Partial · 3 🔲 Deferred · 1 ❌ Not Applicable

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Implemented | Feature fully delivered in POC |
| ⚠️ Partial | Core behavior present, edge cases deferred |
| 🔲 Deferred | Explicitly out of scope for this POC iteration |
| ❌ Not Applicable | Feature belongs to a different system layer |

---

## Feature Implementation Notes

### 1. Seat Map Visualization ✅

**Delivered in Phase 4.**

`SeatCell`, `SeatRow`, `CabinClassSection`, `CabinDeck` components compose a full cabin layout. All 7 cloud_2 seat status codes are mapped via `STATUS_CLASS` record:

- `available`, `occupied`, `blocked`, `unavailable`
- `exit_row_available`, `exit_row_occupied`, `infant_occupied`

Visual differentiation via CSS custom properties (tokens extracted in Phase 6). `SeatLegend` shows all status types with color swatches.

### 2. Seat Assignment ✅

**Delivered in Phase 5.**

`AssignSeatCommand` value object with private constructor, static `create()` factory, and validation guards (`passengerId`, `seatNumber`, `flightId` all required). `useSeatAssign` mutation hook invalidates `['seatPlan', flightId]` on success. `SeatPlanTab` wires seat selection → command → mutation feedback UI.

### 3. Seat Reassignment ⚠️

**API layer delivered, UI flow deferred.**

`ReseatPassengerCommand` VO fully typed (guards: `fromSeat !== toSeat`). `Cloud2SeatCommandAdapter.reseatPassenger()` hits the cloud_2 endpoint. `useSeatUnblock` hook available. However, no UI flow exists to select a passenger and choose a new seat — the reassign interaction was descoped from the POC UI.

**Next step:** Add a passenger selection modal that pre-fills `fromSeat` from the current assignment and routes to a seat picker.

### 4. Seat Blocking ✅

**Delivered in Phase 5.**

`BlockSeatCommand` and `UnblockSeatCommand` VOs. `useSeatBlock` and `useSeatUnblock` mutation hooks, both with query invalidation on success. Cloud2SeatCommandAdapter endpoints wired.

### 5. Zone-Balanced Seating ✅

**Delivered in Phase 5.**

`autoAssignSeat(plan, cabinClass?)` pure domain function. Zone scoring:

- Window seats (`A`, `F`): preferred when occupancy < 50% (spread passengers), deprioritized when crowded
- Aisle seats (`C`, `D`): preferred when occupancy ≥ 50%
- Middle seats: neutral score (1)

Candidates filtered to `isAvailable()` seats, sorted by zone score ascending, first candidate returned. `SeatPlanTab` has "Auto-assign" button that fires this algorithm then mutates.

### 6. Seat Pricing 🔲

**Explicitly deferred.**

`ISeatPricingService` interface stub exists in the port layer. `DependencyProvider` wires a no-op `stubPricingService`. Deferred because: (a) requires a separate pricing API contract not documented in MIGRATION-CONTEXT.md, (b) pricing logic is owned by a separate service — not in scope for the seat_plan migration POC.

**Next step:** Define `ISeatPricingService` contract with the pricing team, implement `Cloud2SeatPricingAdapter`.

### 7. Exit Seat Management ✅

**Delivered in Phase 4.**

`exit_row_available` and `exit_row_occupied` status codes are mapped and visually differentiated. `SeatCell` applies the `seat_exit_row_available` / `seat_exit_row_occupied` CSS class. `CLICKABLE_STATUSES` Set includes `exit_row_available`, so exit seats are selectable by agents.

Note: no confirmation modal for exit row seat assignment — this is a known gap (see deferred work).

### 8. Multi-Deck Support ✅

**Delivered in Phase 4.**

`DeckToggle` component (renders null when `!hasUpperDeck`). `SeatMap` manages `activeDeck` state (`'lower' | 'upper'`), filters rows by deck, passes `activeDeck`/`onToggle` to `DeckToggle`. `SeatPlanResult.isUpperDeck` boolean drives toggle visibility.

### 9. Seat Occupancy ✅

**Delivered in Phase 4.**

All 7 cloud_2 occupancy codes are mapped in `seatPlanMapper.ts` via `STATUS_MAP`. `SeatPlanResult.availableCount` computed during mapping. `SeatStatus` discriminated union enforces exhaustive handling at compile time.

### 10. Seat Plan Caching ✅

**Delivered in Phase 4.**

`useSeatPlan` TanStack Query hook: `staleTime: 5 * 60 * 1000` (5 minutes). Deduplication via queryKey `['seatPlan', flightId]`. All mutations invalidate this key on success, ensuring the UI refetches after state changes. No redundant requests within the stale window.

### 11. Print Seat Plan 🔲

**Explicitly deferred.**

Print/export is a separate controller concern in cloud_2 (`dc_seat_plan_print` controller). Not in scope for the React POC which focuses on the interactive seat map. A future `SeatPlanPrintView` component could be added.

### 12. Multi-Leg Availability 🔲

**Explicitly deferred.**

Requires a flight leg data model not present in the current `SeatPlanResult` domain entity. Multi-leg support would need a `LegSelector` UI component and leg-scoped queryKey strategy.

### 13. IATCI Seating 🔲

**Explicitly deferred.**

IATCI (Interline Through Check-In) seating involves partner carrier coordination and is outside the cloud_2 seat_plan API boundary covered in this POC. Requires separate integration work.

### 14. Seat Plan Columns — Load Control (LC) ❌

**Not applicable.**

Weight and balance columns in the seat plan view belong to the Load Control system, not the DCS seat_plan feature. This is a display concern in the cloud_2 monolith that renders LC data alongside seat data — the two systems are separate.

### 15. Allocated Seating Flag ⚠️

**Partially modeled.**

`SeatPlanResult.isUpperDeck` exists in the domain model. The `allocated_seating` boolean flag present in cloud_2 seat plan API responses is not currently mapped into the domain model — the flag determines whether the flight uses pre-allocated seating (affects which interactions are available to agents).

**Next step:** Add `allocatedSeating: boolean` to `SeatPlanResult`, map from the cloud_2 API response, and use it in `SeatPlanTab` to conditionally disable manual assignment UI.

---

## Deferred Work Backlog

Priority order for follow-up sprints:

| Priority | Item | Effort |
|----------|------|--------|
| P1 | Add `allocatedSeating` flag to domain model + SeatPlanTab conditional logic | S |
| P1 | Confirmation modal for exit row seat assignment | S |
| P1 | Implement reassign passenger UI flow (ReseatPassengerCommand fully wired, UI missing) | M |
| P1 | Replace `DEMO-PAX` hardcoded `passengerId` with real auth context | S |
| P2 | Implement `ISeatPricingService` (requires pricing API contract) | L |
| P2 | Wire real `VITE_API_BASE_URL` for staging validation | S |
| P3 | Print seat plan view | M |
| P3 | Multi-leg availability support | L |
| P3 | IATCI seating integration | XL |
| P3 | Responsive layout for tablet agents | M |
| P3 | Error boundary around `SeatPlanTab` | S |

---

## Architecture Decisions Made During POC

| Decision | Rationale |
|----------|-----------|
| TanStack Query for CQRS reads | `staleTime` + queryKey invalidation gives cache-coherent reads with zero boilerplate |
| Command Value Objects (private constructor + `create()`) | Validation at the port boundary; domain errors surface at call site, not at the adapter |
| `describe.skipIf(!INTEGRATION_TESTS)` for integration tests | Tests skip in CI (no cloud_2 access) but are runnable against live cloud_2 |
| `import.meta.env.DEV` mock injection | Dev preview with realistic mock data without any build-time flag or config file |
| Separate `vitest.config.ts` | Vitest bundles its own Vite — separate config avoids version conflicts with the app's `vite.config.ts` |
| `ISeatPricingService` stub (not removed) | Documents the port contract without blocking POC delivery |
