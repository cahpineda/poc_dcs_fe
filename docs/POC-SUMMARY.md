# POC Summary: poc_dcs_fe

**Tickets:** ACA-2948 / ACA-2950  
**Completed:** 2026-04-27 (single-session implementation)  
**Status:** Complete — 7 phases delivered

---

## 1. Overview

**Goal:** Migrate the `seat_plan` feature from the cloud_2 PHP monolith to a React 18 application using a hexagonal, CQRS-aligned architecture.

**Scope:** Interactive seat map visualization, seat assignment, blocking, reassignment command layer, zone-balanced auto-assign algorithm, multi-deck support, exit row handling, and design token extraction. Integration validation with feature parity audit.

**Not in scope (explicit deferrals):** Seat pricing, multi-leg availability, IATCI seating, print view. See `docs/FEATURE-PARITY.md` for full breakdown.

---

## 2. What Was Built

### Architecture Layers

```
┌─────────────────────────────────────────┐
│  Presentation Layer                     │
│  SeatPlanTab, SeatMap, SeatCell,        │
│  DeckToggle, SeatLegend, SeatRow,       │
│  CabinClassSection, CabinDeck           │
├─────────────────────────────────────────┤
│  Application Ports (Hooks)              │
│  useSeatPlan, useSeatAssign,            │
│  useSeatBlock, useSeatUnblock           │
├─────────────────────────────────────────┤
│  Domain                                 │
│  SeatNumber, SeatStatus, Seat,          │
│  SeatRow, SeatPlanResult,               │
│  AssignSeatCommand, BlockSeatCommand,   │
│  UnblockSeatCommand, ReseatPassengerCmd │
│  autoAssignSeat                         │
├─────────────────────────────────────────┤
│  Infrastructure Adapters                │
│  Cloud2SeatPlanAdapter (ISeatPlanQueryService)  │
│  Cloud2SeatCommandAdapter (ISeatCommandService) │
│  MockSeatPlanAdapter (dev-only)         │
│  MockSeatCommandAdapter (dev-only)      │
└─────────────────────────────────────────┘
```

### Phases Delivered

| Phase | Description | Plans | Tests |
|-------|-------------|-------|-------|
| 1 | Migration Context Document | 1 | 0 |
| 2 | React Project Scaffold | 4 | 0 |
| 3 | API Adapter Layer | 5 | 29 |
| 4 | Seat Map UI | 4 | 28 |
| 5 | Seat Operations | 4 | 24 |
| 6 | Design Token Extraction | 3 | 0 |
| 7 | Integration & Validation | 3 | 3 (skipped in CI) |
| **Total** | | **24 plans** | **81 tests** |

---

## 3. Architecture Decisions

### Screaming Architecture + Hexagonal + CQRS + SOLID

Folder structure screams the domain: `src/domain/seat/`, `src/application/ports/`, `src/infrastructure/adapters/`, `src/presentation/`. The domain has zero framework dependencies — `SeatPlanResult` and all command VOs are pure TypeScript classes.

Port interfaces (`ISeatPlanQueryService`, `ISeatCommandService`, `ISeatPricingService`) decouple domain from transport. The adapter layer can be swapped (e.g., `MockSeatPlanAdapter` for dev, `Cloud2SeatPlanAdapter` for production) without touching any domain or presentation code.

### TanStack Query for CQRS Reads

`useSeatPlan` wraps `ISeatPlanQueryService.getSeatPlan()` with TanStack Query:

- `staleTime: 5 * 60 * 1000` — prevents redundant requests within 5 minutes
- `queryKey: ['seatPlan', flightId]` — per-flight cache keys
- All mutations call `queryClient.invalidateQueries({ queryKey: ['seatPlan', flightId] })` on success, keeping UI coherent after state changes

TanStack Query was chosen over raw `useEffect` + `useState` because it gives stale-while-revalidate semantics and deduplication for free, which matters when multiple components may mount and request the same flight plan.

### Typed Command Value Objects

Port interfaces use concrete domain types, not `unknown`:

```ts
interface ISeatCommandService {
  assignSeat(command: AssignSeatCommand): Promise<void>;
  blockSeat(command: BlockSeatCommand): Promise<void>;
  unblockSeat(command: UnblockSeatCommand): Promise<void>;
  reseatPassenger(command: ReseatPassengerCommand): Promise<void>;
}
```

Each command VO has a private constructor and static `create()` factory that validates at construction time. This pushes validation to the call site (port boundary) rather than the adapter, preventing invalid commands from ever reaching the HTTP layer.

### Separate `vitest.config.ts`

Vitest bundles its own version of Vite. Using a merged config (`mergeConfig` from `vite`) avoids version conflicts where the app's `vite.config.ts` might import a different Vite instance than the one Vitest uses internally.

### Dev Mock Injection via `import.meta.env.DEV`

`DependencyProvider.tsx` conditionally swaps real adapters for mocks in dev mode:

```ts
seatQuery: import.meta.env.DEV
  ? new MockSeatPlanAdapter()
  : new Cloud2SeatPlanAdapter(axiosInstance),
```

No build flag, no env var, no config file — `import.meta.env.DEV` is a Vite constant resolved at build time (tree-shaken from production bundles). `MockSeatPlanAdapter` returns a realistic 2-row seat plan covering all 7 status types so developers see a fully styled map immediately.

### Integration Test Skip Guard

```ts
const INTEGRATION_ENABLED = Boolean(process.env.INTEGRATION_TESTS);
describe.skipIf(!INTEGRATION_ENABLED)('Cloud2 Integration — getSeatPlan', () => { ... });
```

Integration tests use real adapter instances (no `vi.mock`) against a live cloud_2 base URL. They skip in normal CI runs (no `INTEGRATION_TESTS` env var) and can be run manually against any environment.

---

## 4. Metrics

| Metric | Value |
|--------|-------|
| Tests | **81 passing, 0 failing** (3 integration tests skipped) |
| Test files | 15 |
| JS bundle | **232.27 kB** (75.91 kB gzip) |
| CSS bundle | **5.21 kB** (1.35 kB gzip) |
| Build modules | 153 |
| TypeScript errors | **0** |
| ESLint errors | **0** |
| Build time | ~993ms |

---

## 5. How to Run

```bash
npm install

# Dev preview with mock data (localhost:5173)
npm run dev

# Unit tests
npm test

# Production build
npm run build

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Integration tests against live cloud_2
INTEGRATION_TESTS=true VITE_API_BASE_URL=http://cloud2.host INTEGRATION_FLIGHT_ID=IK100 npm test
```

**Required env vars (production):**

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | cloud_2 base URL (e.g. `http://cloud2-staging.internal`) |
| `INTEGRATION_TESTS` | Set to `true` to run integration tests |
| `INTEGRATION_FLIGHT_ID` | Flight ID to use for integration tests |

---

## 6. Recommended Next Steps

Priority-ordered items before production deployment:

| Priority | Item | Effort |
|----------|------|--------|
| P1 | Wire real `VITE_API_BASE_URL` for staging validation and run integration tests | S |
| P1 | Replace `DEMO-PAX` hardcoded `passengerId` with real auth context (session token / user store) | S |
| P1 | Add `allocatedSeating: boolean` to `SeatPlanResult` domain model + conditional UI in `SeatPlanTab` | S |
| P1 | Add confirmation modal for exit row seat assignment (regulatory requirement) | S |
| P1 | Implement reassign passenger UI flow (`ReseatPassengerCommand` and adapter endpoint are ready; only the UI flow is missing) | M |
| P2 | Implement `ISeatPricingService` once pricing API contract is defined | L |
| P2 | Add error boundary around `SeatPlanTab` | S |
| P3 | CSS: responsive layout for tablet agents | M |
| P3 | Print seat plan view | M |
| P3 | Multi-leg availability (requires leg data model extension) | L |
| P3 | IATCI seating integration | XL |

---

## 7. Feature Parity Summary

Full audit: [`docs/FEATURE-PARITY.md`](./FEATURE-PARITY.md)

| Status | Count | Features |
|--------|-------|---------|
| ✅ Implemented | 10 | Seat Map, Assignment, Blocking, Zone-Balanced Auto-assign, Exit Rows, Multi-Deck, Occupancy, Caching |
| ⚠️ Partial | 2 | Seat Reassignment (API ready, UI missing), Allocated Seating Flag (not in domain model) |
| 🔲 Deferred | 3 | Seat Pricing, Print, Multi-Leg, IATCI |
| ❌ Not Applicable | 1 | Load Control columns (separate system) |

**Coverage: 10/15 features fully implemented, 2/15 partially implemented, 3/15 explicitly deferred.**
