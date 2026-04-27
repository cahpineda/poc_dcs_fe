# Roadmap: poc_dcs_fe

## Overview

React POC migrating the seat_plan feature of the DCS (Departure Control System) from the cloud_2 PHP monolith to a modern React application. Phases progress from documentation through scaffold, API layer, UI implementation, and validation against cloud_2.

## Domain Expertise

None

## Phases

- [x] **Phase 1: Migration Context Document** - Capture full seat_plan feature inventory, API contracts, data models, and architecture spec
- [x] **Phase 2: React Project Scaffold** - Bootstrap React + Vite + TypeScript with screaming architecture folder structure
- [x] **Phase 3: API Adapter Layer** - Hexagonal port/adapter layer connecting React to cloud_2 REST APIs
- [x] **Phase 4: Seat Map UI** - Core seat map visualization with cabin layout, seat status, multi-deck
- [ ] **Phase 5: Seat Operations** - Seat assignment, blocking, reassignment, zone-balanced seating commands
- [ ] **Phase 6: Design Token Extraction** - Extract DCS visual tokens from cloud_2 CSS for future design system
- [ ] **Phase 7: Integration and Validation** - End-to-end validation against cloud_2, feature parity audit

## Phase Details

### Phase 1: Migration Context Document ✅
**Goal**: Produce MIGRATION-CONTEXT.md — comprehensive spec covering all seat_plan sub-features, API contracts, data models, UI component inventory, and architecture decisions. Single source of truth before any code is written.
**Depends on**: Nothing
**Completed**: 2026-04-27
**Plans**: 1 summary (context research, no code plans)

Plans:
- [x] 01-01: Cloud_2 seat_plan feature inventory, API contracts, domain types, UI component inventory, SOLID+Hexagonal+CQRS architecture spec

### Phase 2: React Project Scaffold ✅
**Goal**: Working React app (npm run dev) with domain folder structure, tooling configured, zero business logic.
**Depends on**: Phase 1
**Completed**: 2026-04-27
**Plans**: 4 plans

Plans:
- [x] 02-01: Vite 6 + React 18 + TypeScript 5 + Vitest (separate vitest.config.ts + mergeConfig)
- [x] 02-02: ESLint v9 flat config + Prettier + clean Vite boilerplate
- [x] 02-03: Screaming architecture folder structure + three port interface stubs
- [x] 02-04: TanStack Query v5 + Zustand v4 + Axios + DependencyProvider stub wiring

**Notes**:
- Removed `"type": "module"` (Vite default — breaks ink-tools.js CJS)
- Separate `vitest.config.ts` required due to vitest bundling its own Vite version
- ESLint v9: use `reactHooks.configs.recommended.rules` spread, not `.configs.flat`

### Phase 3: API Adapter Layer ✅
**Goal**: Typed hexagonal adapters for all cloud_2 seat_plan REST endpoints. Domain isolated from transport. TDD throughout.
**Depends on**: Phase 2
**Completed**: 2026-04-27
**Plans**: 5 plans (all TDD — 29 tests)

Plans:
- [x] 03-01: SeatNumber value object (format validation `^\d{1,3}[A-K]$`, 6 tests)
- [x] 03-02: SeatStatus discriminated union + Seat entity (immutable, status-aware, 6 tests)
- [x] 03-03: SeatPlanResult aggregate + seatPlanMapper (all 7 cloud_2 status codes, 8 tests)
- [x] 03-04: Cloud2SeatPlanAdapter implementing ISeatPlanQueryService (mocked axios, 4 tests)
- [x] 03-05: Cloud2SeatCommandAdapter implementing ISeatCommandService + real adapters wired into DependencyProvider (5 tests)

**Notes**:
- Port interfaces updated from `unknown` to concrete domain types after TDD implementation
- `VITE_API_BASE_URL` env var required for cloud_2 base URL
- `withCredentials: true` on axios instance (PHP session auth)

### Phase 4: Seat Map UI ✅
**Goal**: SeatMapView component with feature parity to cloud_2 dc_seat_plan_tab.js — cabin layout, seat states, classes, exit rows, multi-deck.
**Depends on**: Phase 3
**Completed**: 2026-04-27
**Plans**: 4 plans (28 tests — 57 total)

Plans:
- [x] 04-01: SeatCell (all 7 seat states, clickable logic, AisleGap) + SeatLegend (13+4 tests)
- [x] 04-02: SeatRow, CabinClassSection, CabinDeck layout composition (7 tests)
- [x] 04-03: useSeatPlan TanStack Query CQRS hook (4 tests)
- [x] 04-04: SeatMap + DeckToggle + SeatPlanTab assembly + MockSeatPlanAdapter dev preview

**Notes**:
- SeatCell uses STATUS_CLASS record mapping all 7 cloud_2 status codes to CSS class names
- CLICKABLE_STATUSES Set guards `onSelect` — only available/exit_row_available fire callback
- MockSeatPlanAdapter activated via `import.meta.env.DEV` in DependencyProvider (dev-only)
- Dev preview runs at localhost:5174 with 2 rows × 6 seats covering all visual states

### Phase 5: Seat Operations
**Goal**: Command handlers and UI interactions for seat assignment, blocking, reassignment, and zone-balanced seating.
**Depends on**: Phase 4
**Research**: Unlikely
**Plans**: 4 plans

Plans:
- [ ] 05-01: Typed command value objects (AssignSeatCommand, BlockSeatCommand, UnblockSeatCommand, ReseatPassengerCommand) + port type safety (TDD)
- [ ] 05-02: useSeatAssign + useSeatBlock + useSeatUnblock mutation hooks with cache invalidation (TDD)
- [ ] 05-03: autoAssignSeat zone-balanced pure domain algorithm (TDD)
- [ ] 05-04: SeatPlanTab wired with assign mutation + auto-assign button + MockSeatCommandAdapter dev preview (auto)

### Phase 6: Design Token Extraction
**Goal**: Extract DCS visual design tokens from cloud_2 CSS/templates and apply to React app. Foundation for future centralized design system.
**Depends on**: Phase 4
**Research**: Unlikely
**Plans**: 3 plans

Plans:
- [ ] 06-01: Extract color palette and typography from cloud_2 DCS CSS
- [ ] 06-02: Extract spacing, border, shadow tokens and create CSS custom properties
- [ ] 06-03: Apply tokens to seat map components and document inventory

### Phase 7: Integration and Validation
**Goal**: End-to-end validation against live cloud_2, feature parity audit, performance baseline, POC sign-off.
**Depends on**: Phase 5, Phase 6
**Research**: Unlikely
**Plans**: 3 plans

Plans:
- [ ] 07-01: Integration tests against cloud_2 API (real endpoint smoke tests)
- [ ] 07-02: Feature parity audit — cloud_2 DCS vs React POC checklist
- [ ] 07-03: Performance baseline and POC documentation for team review

