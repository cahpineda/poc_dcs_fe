# Phase 1: Migration Context Document

**Goal:** Produce `MIGRATION-CONTEXT.md` — comprehensive spec covering all seat_plan sub-features, API contracts, data models, UI component inventory, and architecture decisions. Single source of truth before any code is written.

**Ticket:** ACA-2950 (parent: ACA-2948)
**Status:** In Progress

---

## Plan 01-01: Cloud_2 Feature Inventory

**Objective:** Document all seat_plan sub-features, REST API endpoints, data models, and backend PHP classes from cloud_2 source analysis (project2context).

### Tasks

- [x] 1. Query cloud_2 repository via project2context
- [x] 2. Identify all seat_plan sub-features from source files
- [x] 3. Map REST API endpoints (ws_v1.1–v1.8) and their contracts
- [x] 4. Document data models (seat, cabin_configuration, flight, passenger)
- [x] 5. Identify backend PHP classes and their responsibilities
- [ ] 6. Write feature inventory section in MIGRATION-CONTEXT.md

---

## Plan 01-02: UI Component Inventory

**Objective:** Catalog all UI components, screens, interactions, and visual patterns from cloud_2 DCS seat_plan templates.

### Tasks

- [x] 1. Identify frontend JS files: dc_seat_plan_tab.js, departure_control.js, dc-seats-pricing.js
- [ ] 2. Map all UI states (seat available, occupied, blocked, exit, pricing)
- [ ] 3. Document user interactions (click to assign, drag to move, hover states)
- [ ] 4. Identify tab structure and navigation (seat_plan_tab within DCS tabs)
- [ ] 5. Write UI component inventory section in MIGRATION-CONTEXT.md

---

## Plan 01-03: Architecture Specification

**Objective:** Define the React architecture: domain model, hexagonal port interfaces, CQRS command/query split, folder structure.

### Tasks

- [x] 1. Evaluate Screaming Architecture + Hexagonal + CQRS for this domain
- [x] 2. Define domain entities (Seat, Cabin, Flight, SeatAssignment)
- [x] 3. Define port interfaces (ISeatPlanRepository, ISeatCommandService)
- [x] 4. Define CQRS split (queries vs commands)
- [x] 5. Define folder structure (screaming arch)
- [ ] 6. Write architecture spec section in MIGRATION-CONTEXT.md

---

## Output

`.planning/phases/01-migration-context/MIGRATION-CONTEXT.md`
