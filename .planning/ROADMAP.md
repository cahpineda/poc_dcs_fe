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
- [x] **Phase 5: Seat Operations** - Seat assignment, blocking, reassignment, zone-balanced seating commands
- [x] **Phase 6: Design Token Extraction** - Extract DCS visual tokens from cloud_2 CSS for future design system
- [x] **Phase 7: Integration and Validation** - End-to-end validation against cloud_2, feature parity audit
- [x] **Phase 8: Visual Fidelity** - Match cloud_2 visual design: column headers, correct color palette, checked-in/boarded states, legend completeness
- [x] **Phase 9: Seat Information Overlays** - Passenger name/initials on seats, infant icon, block alert graphic, gender badge
- [x] **Phase 10: Agent Interaction Completeness** - Click occupied seat → passenger detail, block/unblock UI, reseat UI flow
- [x] **Phase 11: Mock Backend Server** - Standalone Express mock server (port 3001) with FL001/FL002 in-memory data for local E2E testing
- [x] **Phase 12: Color Palette and Seat Geometry** - Align colors to cloud_2 exact values, proportional seat cell sizing (38×35 / 28×35px)
- [x] **Phase 13: Domain Passenger Fields and Unseat** - Real passenger_key, boardingGroup, rushStatus, pnr fields + UNSEAT operation
- [x] **Phase 14: Passenger Overlays and Cabin Dividers** - WCHR badge, rush outline, boarding group/PNR in drawer, cabin section dividers
- [x] **Phase 15: Advanced Operations** - Seat swap (two-click) and group reseat (multi-select) — closes remaining Category 4 gaps
- [ ] **Phase 16: Parity Audit and Fix** - Full visual/functional audit against cloud2, document and fix all discrepancies (ACA-2953)

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

### Phase 5: Seat Operations ✅
**Goal**: Command handlers and UI interactions for seat assignment, blocking, reassignment, and zone-balanced seating.
**Depends on**: Phase 4
**Completed**: 2026-04-27
**Plans**: 4 plans (24 tests — 81 total)

Plans:
- [x] 05-01: Typed command value objects (AssignSeatCommand, BlockSeatCommand, UnblockSeatCommand, ReseatPassengerCommand) + port type safety (TDD)
- [x] 05-02: useSeatAssign + useSeatBlock + useSeatUnblock mutation hooks with cache invalidation (TDD)
- [x] 05-03: autoAssignSeat zone-balanced pure domain algorithm (TDD)
- [x] 05-04: SeatPlanTab wired with assign mutation + auto-assign button + MockSeatCommandAdapter dev preview (auto)

**Notes**:
- Command VOs use private constructor + static `create()` factory pattern for port-boundary validation
- `useSeatAssign`/`useSeatBlock`/`useSeatUnblock` invalidate `['seatPlan', flightId]` on success
- `autoAssignSeat` zone scoring: window seats preferred at low occupancy, aisle at high occupancy
- `MockSeatCommandAdapter` resolves after 300ms delay (realistic dev preview)

### Phase 6: Design Token Extraction ✅
**Goal**: Create DCS seat map design token system (CSS custom properties) and apply visual styles to all seat map components.
**Depends on**: Phase 4
**Completed**: 2026-04-27
**Plans**: 3 plans

Plans:
- [x] 06-01: Color palette + seat-status tokens as CSS custom properties (tokens.css + seat-states.css)
- [x] 06-02: Layout, component, and feedback stylesheets (layout.css + components.css + feedback.css)
- [x] 06-03: Wire styles into app via main.tsx + align component class names + human verify in browser

**Notes**:
- 5 focused stylesheets with barrel import via `src/styles/index.css`
- Build bundles 5.21 kB CSS (1.35 kB gzip)
- AisleGap class: `aisle_gap` (not `aisle_spacer`)
- Exit row legend class: `seat_exit_row_available` (not `seat_exit`)

### Phase 7: Integration and Validation ✅
**Goal**: End-to-end validation against live cloud_2, feature parity audit, performance baseline, POC sign-off.
**Depends on**: Phase 5, Phase 6
**Completed**: 2026-04-27
**Plans**: 3 plans

Plans:
- [x] 07-01: Integration smoke tests against cloud_2 API (`describe.skipIf(!INTEGRATION_TESTS)` guard, real adapter instances)
- [x] 07-02: Feature parity audit — all 15 cloud_2 features mapped to status (10✅ 2⚠️ 3🔲 1❌)
- [x] 07-03: POC summary doc — architecture decisions, live metrics, next steps for stakeholder sign-off

**Notes**:
- Integration tests skip in CI, runnable with `INTEGRATION_TESTS=true VITE_API_BASE_URL=http://cloud2 npm test`
- `docs/FEATURE-PARITY.md`: full 15-feature audit with deferred backlog
- `docs/POC-SUMMARY.md`: stakeholder-ready summary with 81 tests, 0 errors, next steps

### Phase 8: Visual Fidelity ✅
**Goal**: Close the visual gap between the React POC and cloud_2. Match color palette, add missing seat states (checked_in, boarded), add column headers (A-F), fix legend, align cell sizes.
**Depends on**: Phase 7
**Completed**: 2026-04-27
**Audit score to beat**: Grid 18/30, States 28/40, Tokens 5/15
**Plans**: 3 plans

Plans:
- [x] 08-01: Extend SeatStatus — add `checked_in` + `boarded`; update STATUS_MAP (C/D codes), STATUS_CLASS, Seat.isOccupied(), CSS classes (TDD)
- [x] 08-02: SeatColumnHeaders component — sticky A-F labels above seat grid, integrated into CabinDeck (TDD)
- [x] 08-03: Color palette alignment to cloud_2 (all tokens), cell geometry 30px, legend completeness (9 states) (auto)

**Wave layout**: 08-01 and 08-02 parallel → 08-03 depends on both

### Phase 9: Seat Information Overlays ✅
**Goal**: Display passenger context directly on seat cells — name/initials on occupied seats, infant icon, block alert graphic, gender badge — matching cloud_2 agent UX.
**Depends on**: Phase 8
**Completed**: 2026-04-27
**Plans**: 3 plans (33 new tests — 124 total)

Plans:
- [x] 09-01: Passenger initials overlay — extend Seat domain + seatPlanMapper + SeatCell to show 2-char initials on occupied seats (TDD)
- [x] 09-02: Infant indicator + block alert icon — absolute-positioned overlays in SeatCell (TDD)
- [x] 09-03: Gender badge — M/F/U dot overlay at top-left of cell, color-coded (TDD)

**Wave layout**: Sequential (all touch Seat.ts + SeatCell.tsx)

### Phase 10: Agent Interaction Completeness ✅
**Goal**: Complete the agent workflow interactions — click occupied seat → passenger detail drawer, block/unblock UI, reseat flow.
**Depends on**: Phase 9
**Completed**: 2026-04-27
**Plans**: 3 plans (47 new tests — 171 total)

Plans:
- [x] 10-01: PassengerDetailDrawer — slide-in panel on occupied seat click, passenger info + action stubs (TDD)
- [x] 10-02: Block/Unblock wiring — connect useSeatBlock/useSeatUnblock to drawer buttons, pending state (TDD)
- [x] 10-03: Reseat flow — useSeatReseat hook + reseatMode prop threading + banner + ReseatPassengerCommand (TDD)

**Wave layout**: Strictly sequential (all modify SeatPlanTab.tsx)

### Phase 11: Mock Backend Server ✅
**Goal**: Standalone Node.js/Express mock server replacing the real cloud_2 backend for local development. Stateful in-memory data covering all 9 seat statuses. Required by phases 12-15 for real HTTP round-trips.
**Depends on**: Phase 10
**Completed**: 2026-04-27
**Plans**: 1 plan

Plans:
- [x] 11-01: Express server (port 3001) + FL001/FL002 in-memory data + GET seat_plan/occupancy + POST assign/block/unblock/reseat/unseat/swap/reseat_group + CORS for localhost:5174

**Notes**:
- `npm run server` starts from project root
- FL001: wide-body 3-cabin (F/J/Y) 6 rows, all 9 seat statuses, gender/infant/SSR/rush scenarios
- FL002: narrow-body 2-cabin (J/Y) 4 rows, simpler clean-slate testing
- In-memory state — no persistence, resets on restart

### Phase 12: Color Palette and Seat Geometry ✅
**Goal**: Align React POC colors and seat cell dimensions exactly to cloud_2 values. Category 3 (Design Tokens) 5/15 → 15/15.
**Depends on**: Phase 11
**Completed**: 2026-04-27
**Plans**: 1 plan

Plans:
- [x] 12-01: Update tokens.css with exact cloud_2 hex codes (#4A4D4F available, #947a9c occupied, #C1AA02 checked-in, #77AE00 boarded, #006400 infant) + seat geometry (38×35px side, 28×35px middle) (TDD)

**Notes**:
- `isSideSeat` computed from seat number ending in A or F
- `.seat_cell_side` class adds 10px width to side columns

### Phase 13: Domain Passenger Fields and Unseat Operation ✅
**Goal**: Add real `passenger_key` + extended fields (boardingGroup, rushStatus, pnr) to Seat domain. Add UNSEAT operation end-to-end. Category 1 +5, Category 4 +5.
**Depends on**: Phase 11
**Completed**: 2026-04-27
**Plans**: 1 plan

Plans:
- [x] 13-01: Seat.passengerKey + boardingGroup + rushStatus + pnr fields; UnassignSeatCommand; useSeatUnassign hook; UNSEAT button in PassengerDetailDrawer (TDD)

**Notes**:
- Replaces `resolvePassengerId()` workaround with real `seat.passengerKey`
- UNSEAT calls POST /dc/unseat_passenger on mock server

### Phase 14: Passenger Overlays and Cabin Dividers ✅
**Goal**: Add WCHR SSR badge, rush status outline, boarding group/PNR in drawer, cabin class section dividers. Category 2 +4, Category 5 +4.
**Depends on**: Phase 13
**Completed**: 2026-04-27
**Plans**: 1 plan

Plans:
- [x] 14-01: SeatCell WCHR badge + rush outline; PassengerDetailDrawer boarding group + PNR; CabinDeck cabin dividers between F/J/Y (TDD)

**Notes**:
- WCHR badge: 'W' at bottom-right of cell when ssrs includes 'WCHR'
- Rush: orange outline on SeatCell
- CabinDivider: labeled row inserted between cabin transitions

### Phase 15: Advanced Operations (Swap + Group Reseat) ✅
**Goal**: Implement seat swap (two-click flow) and group reseat (multi-select + MOVE). Final Category 4 items. Target: ~95/100 parity score.
**Depends on**: Phase 14
**Completed**: 2026-04-27
**Plans**: 1 plan

Plans:
- [x] 15-01: SwapSeatsCommand + ReseatGroupCommand; useSeatSwap two-click state machine; useSeatGroupReseat multi-select; full UX in SeatPlanTab with banners and cancel flows (TDD)

**Notes**:
- Swap: click occupied → banner → click second seat → SwapSeatsCommand fires
- Group reseat: GROUP RESEAT button → group mode → multi-click occupied seats → MOVE GROUP fires ReseatGroupCommand
- 244 total tests, 0 failures after this phase

### Phase 16: Parity Audit and Fix
**Goal**: Full visual and functional audit of the React POC against cloud2. Document every discrepancy, fix all gaps, validate all user flows against the mock server. Deliver evidence (console clean, all tests pass) for ACA-2953 sign-off.
**Depends on**: Phase 15
**Jira**: ACA-2953
**Plans**: 1 plan

Plans:
- [ ] 16-01: Parity audit — catalogue cloud2 UI states/interactions/API contracts, compare React component by component, fix all discrepancies found (TDD where applicable)

