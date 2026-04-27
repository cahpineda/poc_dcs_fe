# poc_dcs_fe — DCS Seat Plan Frontend Migration (POC)

## What This Is

React proof-of-concept migrating the `seat_plan` feature of the **Departure Control System (DCS)** from the cloud_2 PHP monolith to a modern React frontend. The POC validates the migration architecture and serves as the template for migrating other DCS features.

**Source system:** `cloud_2` — PHP 8.2+ monolith, jQuery/vanilla JS frontend, MySQL backend  
**Target:** Standalone React application consuming cloud_2 REST APIs  
**Component:** Departure Control System (Desktop) — DCS  
**Jira:** ACA-2948 (Feature) / ACA-2950 (Dev sub-task)

---

## Goals

1. Migrate the `seat_plan` feature with full feature parity to cloud_2
2. Validate the chosen architecture for maintainability and scalability
3. Preserve the existing DCS UI design (no design system yet — extract it from the monolith)
4. Establish the React project scaffold and conventions for subsequent DCS feature migrations

---

## Requirements

### Validated

- ✓ cloud_2 exposes REST API (ws_v1.1–v1.8) for seat plan data — existing
- ✓ Seat plan data includes: rows, classes, seat types, exit seats, occupancy — existing
- ✓ Multi-deck aircraft support (lower/upper deck) — existing
- ✓ Seat pricing data available via API — existing

### Active

- [ ] Seat map visualization — aircraft cabin layout with rows, classes, seat status
- [ ] Seat assignment — agent assigns/reassigns passenger to a seat
- [ ] Seat blocking — block seats operationally (crew, weight & balance)
- [ ] Zone-balanced seating — automatic group assignment with zone balancing
- [ ] Seat pricing display — per-seat pricing / fare code display
- [ ] Exit seat identification — flag and handle exit row seats
- [ ] Multi-deck support — lower and upper deck rendering
- [ ] Seat occupancy tracking — real-time occupied/available/blocked status
- [ ] Seat plan caching — client-side cache for seat plan data
- [ ] Print seat plan — exportable seat plan layout
- [ ] Multi-leg seat availability — available seats across flight legs
- [ ] IATCI seating — interline seating for onward flights
- [ ] Design token extraction — extract colors, typography, spacing from cloud_2 UI

### Out of Scope (v1 POC)

- Backend changes to cloud_2 — consume APIs as-is
- Full design system implementation — only extract tokens; DS creation is a follow-up
- Other DCS features (passenger tab, boarding tab, etc.) — seat_plan only
- Authentication/SSO — use existing cloud_2 session mechanism
- Load control integration (ws_lc) — separate feature

---

## Architecture Decision

### Chosen: Screaming Architecture + Hexagonal (Ports & Adapters) + CQRS at service layer

**Rationale:** Natural fit for a DCS seat plan with clear domain boundaries and distinct read/write paths.

- **Screaming Architecture** — folder structure reflects domain (`seat-plan/`, `cabin/`, `passenger/`), not framework (`components/`, `pages/`)
- **Hexagonal (lite)** — domain logic is framework-agnostic; cloud_2 API is an adapter behind a port interface. If cloud_2 is replaced, only adapters change.
- **CQRS at service layer** — read services (seat map display, occupancy queries) are separate from command handlers (assign seat, block seat, reseat). React Query handles the query side natively.

**Pragmatic adjustments vs pure hexagonal:**
- React component tree IS the primary adapter — no need to abstract it further
- Full event sourcing is NOT needed — command pattern suffices for writes
- Feature-Sliced Design (FSD) naming conventions used within each domain slice

**Stack:**
- Vite + React 18 + TypeScript
- TanStack Query (React Query) — CQRS query side, caching, loading states
- Zustand — local UI state (selected seat, drag state)
- Axios — HTTP adapter for cloud_2 REST API
- React Testing Library + Vitest — unit/integration tests

---

## SOLID Principles

SOLID is a first-class constraint in this project — not a guideline. Violations are treated as bugs during code review.

| Principle | How it applies |
|-----------|---------------|
| **S** — Single Responsibility | Every file has one reason to change. `SeatCell` renders. `useSeatPlan` fetches. `Cloud2SeatPlanAdapter` translates HTTP. Never mixed. |
| **O** — Open/Closed | Domain and UI code are closed to modification. Adding a new backend (replace cloud_2) = new adapter class only, zero changes to domain or components. |
| **L** — Liskov Substitution | All `ISeatPlanRepository` implementations are drop-in substitutable. Mock adapter used in tests behaves identically to the production adapter from the caller's perspective. |
| **I** — Interface Segregation | Three separate port interfaces: `ISeatPlanQueryService` (reads), `ISeatCommandService` (writes), `ISeatPricingService` (pricing). Components receive only what they use. |
| **D** — Dependency Inversion | UI depends on interfaces, never on `axios` or `Cloud2SeatPlanAdapter`. All concrete bindings wired in `src/app/providers/DependencyProvider.tsx`. |

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SOLID as first-class constraint | Violations = bugs; enforced in code review; enables safe adapter replacement | Adopted |
| Screaming Arch + Hexagonal + CQRS | Best maintainability/scalability for DCS domain | Adopted |
| Consume cloud_2 REST API as-is | No backend changes in scope | Confirmed |
| Vite over CRA | Faster builds, better DX, future-proof | Adopted |
| TanStack Query for reads | Handles caching, loading, stale-while-revalidate natively | Adopted |
| Zustand for UI state | Lightweight, no boilerplate vs Redux | Adopted |
| Preserve cloud_2 design | No design system in v1 — extract tokens only | Confirmed |

---

## Project Context

- **cloud_2 repo:** `https://github.com/inkaviation/cloud_2` (indexed in project2context)
- **Key source files:**
  - `view_template_custom/dc_seat_plan_tab.js` — seat plan tab UI
  - `view_template_custom/departure_control.js` — DCS main controller
  - `view_template_custom/dc-seats-pricing.js` — seat pricing
  - `includes/ws_v1.8/ws_seat_plan.class.php` — latest REST API
  - `includes/seat_master.class.php` — seat assignment logic
  - `includes/zone_balanced_seating.class.php` — zone balancing
  - `modules/Mobile/v3_18_0/Traits/Seats.php` — touchsuite seat plan (lower/upper deck)

---

*Last updated: 2026-04-27 after initialization*
