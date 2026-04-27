# Migration Context — seat_plan Feature

**Source:** cloud_2 (`https://github.com/inkaviation/cloud_2`, branch: main)
**Target:** React POC (`poc_dcs_fe`)
**Ticket:** ACA-2948 / ACA-2950
**Generated:** 2026-04-27
**Analysis method:** project2context (Neo4j indexed, 33,933 entities, 5,362 modules)

---

## 1. Feature Overview

`seat_plan` is the tab within the DCS (Departure Control System) agent interface that allows ground agents to visualize the aircraft cabin layout, manage seat assignments, and control seat availability for a given flight. It is embedded as one of several tabs in the DCS desktop application alongside passenger, boarding, and flight tabs.

**Entry point in cloud_2:**
- PHP controller: `includes/departure_control_controller.class.php`
- Frontend tab: `view_template_custom/dc_seat_plan_tab.js`
- Tab activation: `view_template_custom/departure_control.js` → `get_name_tab_by_name('seat_plan_tab')`

---

## 2. Sub-Feature Inventory

| # | Sub-Feature | Source File(s) | Description |
|---|-------------|----------------|-------------|
| 1 | Seat Map Visualization | `dc_seat_plan_tab.js`, `departure_control_helper.js` | Renders aircraft cabin as a grid: rows, columns, aisle separators, class zones |
| 2 | Seat Assignment | `seat_master.class.php`, `departure_control_ajax.js` | Agent clicks a seat to assign it to a selected passenger |
| 3 | Seat Reassignment | `departure_control_ajax.js` → `confirm_move_to_seat()` | Move passenger from one seat to another; triggers confirmation modal |
| 4 | Seat Blocking | `scheduled_flights/one_day_flight_generator.class.php` → `block_seats()` | Operationally block seats (e.g., weight & balance, crew rest) |
| 5 | Zone-Balanced Seating | `zone_balanced_seating.class.php` → `seat_group_of_passenger()` | Automatically assign seats to a passenger group using zone balancing |
| 6 | Seat Pricing | `dc-seats-pricing.js` → `DCSeatsPricing` | Display per-seat pricing / fare codes; seat selection may incur a charge |
| 7 | Exit Seat Management | `ws_v1.3/ws_seat_plan.class.php` → `exit_seat` field | Flag exit row seats; requires agent confirmation for assignment |
| 8 | Multi-Deck Support | `modules/Mobile/v3_18_0/Traits/Seats.php` → `lower_deck` / `upper_deck` | Render lower and upper deck separately (double-deck aircraft like A380) |
| 9 | Seat Occupancy | `boarding_master.class.js` → `format_seat_data()` | Real-time tracking of occupied / available / blocked status per seat |
| 10 | Seat Plan Caching | `departure_control_helper.js` → `seat_plan_cache` | Client-side cache to avoid re-fetching unchanged seat plan data |
| 11 | Print Seat Plan | `departure_control_controller.class.php` → `get_print_set_data($need_seat_plan_table=true)` | Export/print the seat layout for a flight |
| 12 | Multi-Leg Availability | `departure_control_flight_tab.js` → `remove_available_seats_in_legs()` | Show available seat count across all legs of a multi-segment route |
| 13 | IATCI Seating | `webci_controller.class.php` → `load_iatci_seat_plan()`, `set_iatci_seating_info()` | Interline check-in seating for onward flights operated by partner carriers |
| 14 | Seat Plan Columns (LC) | `ws_lc/ws_flight.class.php` → `get_seat_plan_columns()` | Expose seat column layout for load control weight & balance calculations |
| 15 | Allocated Seating Flag | `flight.is_allocated_seating` | Whether the flight uses allocated (pre-assigned) seating vs open seating |

---

## 3. REST API Contracts (cloud_2)

### 3.1 Read Endpoints

#### `GET /ws/v1.8/get_seat_plan` *(Latest version)*
Fetches the full cabin layout for a flight.

**Parameters:**
| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `station_iata` | Yes | string | Departure station IATA code |
| `flight_number` | Yes | string | Flight number (e.g., `IK100`) |
| `departure_date` | Yes | date | Departure date (`YYYY-MM-DD`) |

**Response:**
```json
{
  "carrier_name": "Ink Aviation",
  "carrier_code": "IK",
  "airplane_model": "Boeing 737-800",
  "cabin_configuration": "B738-Standard",
  "seat_plan_class": [
    {
      "class_name": "Economy",
      "rows": [
        {
          "row": "1",
          "seat_plan_position": [
            { "seat_number": "1A", "exit_seat": false, "type": "seat" },
            { "seat_number": "AISLE", "exit_seat": false, "type": "aisle" },
            { "seat_number": "1B", "exit_seat": false, "type": "seat" }
          ]
        }
      ]
    }
  ]
}
```

#### `GET /ws/v1.8/get_seat_plan` *(with occupancy)*
Same endpoint extended in v1.8 to include occupancy data when `passenger_keys[]` is provided.

#### `GET /ws_lc/get_seat_plan_columns`
Returns column layout for load control.

**Parameters:** `cabin_configuration_key` (int, required)

**Response:** Array of seat column definitions.

#### Mobile API: `get_seat_plan` (TouchSuite)
Used by the TouchSuite/mobile surface. Returns lower + upper deck separately.

**Parameters:** `flight_key`, `passenger_keys[]`, `reduce_data` (bool)

**Response:**
```json
{
  "lower_deck": { ... seat plan ... },
  "upper_deck": { ... seat plan ... },
  "cabin_configuration_key": 42,
  "error_code": null,
  "is_allocated_seating": 1
}
```

### 3.2 Write Endpoints

#### `POST /ajax/confirm_move_to_seat`
Move a passenger to a different seat.

**Parameters:** `flight_key`, `seat_key`, `validate_seat_key` (optional)

#### `POST /ajax/reseat_passenger` (DCS)
Reassign passenger seat from the DCS agent interface.

**Parameters:** `flight_key`, `passenger_key`, `seat_key`

#### `POST /webci/ajax_reseat_passeneger` (WebCI/Kiosk)
Reseat passenger from kiosk or web check-in context.

**Parameters:** `flight_key`, `passenger_key`, `seat_key`

#### `PUT /ws_crs_xml/update_seat_plan`
Update seat plan from CRS (Computer Reservation System) XML feed.

**Parameters:** `station_iata`, `external_flight_id`, `carrier_iata` + XML body

#### `POST /ajax/block_seats`
Block seats for a flight (operational block).

**Parameters:** `flight_key`, `seat_keys[]`, `origin_iata`

### 3.3 API Versioning Strategy

cloud_2 maintains 8 API versions (v1.1–v1.8) for backward compatibility. **The React POC should target v1.8 only.** Version differences are primarily in parameter naming (`flight_name` vs `flight_number`) and error codes.

---

## 4. Data Models

### 4.1 Core Domain Entities

```typescript
// Aircraft seat
interface Seat {
  seat_key: number;
  seat_number: string;          // e.g., "12C"
  seat_prefix: string;          // row number, e.g., "12"
  seat_suffix: string;          // column letter, e.g., "C"
  type_of_seat: 'seat' | 'aisle';
  is_near_exit: boolean;
  carrier_class_key: number;    // links to cabin class (Y/C/F)
  is_blocked: boolean;
  is_occupied: boolean;
  passenger_key?: number;       // assigned passenger if occupied
  fare_code?: string;           // pricing fare code
  price?: number;               // seat selection price (if priced)
}

// Cabin row
interface CabinRow {
  row: string;                  // row number
  class_name: string;           // "Economy", "Business", etc.
  seat_plan_position: SeatPosition[];
}

interface SeatPosition {
  seat_number: string;          // "12C" or "AISLE"
  exit_seat: boolean;
  type: 'seat' | 'aisle';
  status?: SeatStatus;
}

type SeatStatus = 'available' | 'occupied' | 'blocked' | 'selected' | 'exit';

// Full seat plan response
interface SeatPlanResult {
  carrier_name: string;
  carrier_code: string;
  airplane_model: string;
  cabin_configuration: string;
  seat_plan_class: SeatClass[];
  lower_deck?: CabinRow[];      // multi-deck aircraft
  upper_deck?: CabinRow[];      // multi-deck aircraft
  is_allocated_seating: boolean;
  error_code?: string;
}

// Seat occupancy (from boarding_master format_seat_data)
interface SeatOccupancy {
  seat_key: number;
  passenger_key: number;
  status_key: string;
  occupied: boolean;
}

// Cabin configuration
interface CabinConfiguration {
  cabin_configuration_key: number;
  cabin_configuration_name: string;
}

// Flight (seat-plan relevant fields)
interface FlightSeatContext {
  flight_key: number;
  cabin_configuration_key: number;
  is_allocated_seating: boolean;
  all_flight_keys_in_route: number[];  // for multi-leg
}
```

### 4.2 Command Payloads

```typescript
interface AssignSeatCommand {
  flight_key: number;
  passenger_key: number;
  seat_key: number;
}

interface ReseatPassengerCommand {
  flight_key: number;
  passenger_key: number;
  from_seat_key: number;
  to_seat_key: number;
  validate_seat_key?: boolean;
}

interface BlockSeatCommand {
  flight_key: number;
  seat_keys: number[];
  origin_iata: string;
}

interface ZoneBalancedSeatCommand {
  flight_key: number;
  passenger_keys: number[];
  force_assign: boolean;
}
```

---

## 5. Backend PHP Classes

| Class | File | Responsibility |
|-------|------|----------------|
| `departure_control_controller` | `includes/departure_control_controller.class.php` | Main DCS controller; orchestrates tabs, print, session |
| `seat_master` | `includes/seat_master.class.php` | Core seat assignment: `seat_group_of_passenger()` |
| `sky_seat_master` | `includes/sky_seat_master.class.php` | Alternative seat master (likely carrier-specific variant) |
| `zone_balanced_seating` | `includes/zone_balanced_seating.class.php` | Zone-balanced group seat assignment |
| `ws_seat_plan` (v1.8) | `includes/ws_v1.8/ws_seat_plan.class.php` | REST API handler for seat plan |
| `webci_controller` | `includes/webci_controller.class.php` | Web check-in kiosk controller (also handles `load_seat_plan`, `ajax_get_seat_plan`) |
| `amazon_bucket_export` | `includes/amazon_bucket_export.class.php` | `reduce_seat_plan()` for S3 export |
| `seat` | `includes/seat.class.php` (inferred) | Domain entity; `get_seats_info()`, `get_seat_plan_for_touchsuite()`, `get_seat_plan_cols()` |

---

## 6. Frontend Files in cloud_2

| File | Lines | Description |
|------|-------|-------------|
| `view_template_custom/dc_seat_plan_tab.js` | ~300 | Seat plan tab constructor, inherits from `tab` prototype |
| `view_template_custom/departure_control.js` | 1000+ | DCS main controller; tab management, `scroll_passenger_seat_plan()` |
| `view_template_custom/departure_control_helper.js` | ~500 | `seat_plan_cache` class for client-side caching |
| `view_template_custom/departure_control_ajax.js` | 1000+ | AJAX handlers; `confirm_move_to_seat()` with modal HTML generation |
| `view_template_custom/departure_control_flight_tab.js` | 1000+ | Flight tab; `remove_available_seats_in_legs()` |
| `view_template_custom/dc-seats-pricing.js` | ~200 | `DCSeatsPricing` class for per-seat pricing display |
| `view_template_custom/boarding_master.class.js` | 1500+ | Boarding master; `format_seat_data()` parses seat occupancy pipe-string |

**Key DOM structure in cloud_2:**
```
#div_seat_plan_holder          ← scrollable container
  .seat_plan_tab               ← tab wrapper
    .seat_map_container        ← cabin grid
      .cabin_row[n]            ← one row per prefix
        .seat_cell[status]     ← individual seat button
          .seat_number         ← "12C"
          .seat_price          ← price badge (if priced)
    .seat_legend               ← status legend
    .available_seats_in_legs_div ← multi-leg availability
```

---

## 7. UI Component Inventory

### 7.1 Components to Build (React)

| Component | cloud_2 Equivalent | Description |
|-----------|--------------------|-------------|
| `<SeatPlanTab>` | `dc_seat_plan_tab.js` | Root tab container; loads seat plan data |
| `<SeatMap>` | `div_seat_plan_holder` + `.seat_map_container` | Full cabin grid renderer |
| `<CabinDeck>` | Implicit in template loop | Single deck (lower or upper) |
| `<CabinClassSection>` | Cabin class grouping | Groups rows by class (Y/C/F) |
| `<SeatRow>` | `.cabin_row` | One row of seats + aisle |
| `<SeatCell>` | `.seat_cell` | Individual seat button with status styling |
| `<AisleGap>` | `type: 'aisle'` spacer | Visual aisle separator |
| `<SeatLegend>` | `.seat_legend` | Color key for seat statuses |
| `<DeckToggle>` | Custom | Switch between lower/upper deck |
| `<SeatPricingBadge>` | `DCSeatsPricing` | Per-seat price overlay |
| `<AssignConfirmModal>` | `confirm_move_to_seat()` modal | Confirmation dialog for seat reassignment |
| `<AvailableSeatsInLegs>` | `#available_seats_in_legs_div` | Multi-leg seat availability summary |
| `<ExitRowWarning>` | Implicit | Exit row seat selection confirmation |
| `<ZoneBalancingPanel>` | `zone_balanced_seating` | Trigger and status for auto zone assignment |

### 7.2 Seat States & Visual Encoding

| State | cloud_2 CSS Class | React Prop | Color/Style |
|-------|------------------|------------|-------------|
| Available | `.seat_available` | `status="available"` | White/green |
| Occupied | `.seat_occupied` | `status="occupied"` | Grey/dark |
| Blocked | `.seat_blocked` | `status="blocked"` | Red/orange |
| Selected | `.seat_selected` | `status="selected"` | Blue highlight |
| Exit row | `.seat_exit` | `isExit={true}` | Yellow border |
| Priced | `.seat_priced` | `price={n}` | Price badge overlay |
| Aisle | `.aisle_spacer` | `type="aisle"` | Transparent gap |

### 7.3 User Interaction Flows

**1. View Seat Map**
```
Agent opens flight → DCS loads → seat_plan_tab activated
→ GET /ws/v1.8/get_seat_plan (station_iata, flight_number, date)
→ Render cabin grid with occupancy overlay
```

**2. Assign Seat to Passenger**
```
Agent selects passenger (passenger_tab) → clicks seat cell
→ POST /ajax/assign_seat (flight_key, passenger_key, seat_key)
→ Optimistic UI update → seat status = occupied
→ On error: rollback + toast error
```

**3. Reassign Passenger**
```
Agent clicks occupied seat → confirm_move_to_seat modal
→ Confirm → POST /ajax/reseat_passenger
→ Old seat → available, new seat → occupied
```

**4. Block Seat**
```
Agent right-clicks seat (or uses block panel) → POST /ajax/block_seats
→ Seat status = blocked
```

**5. Zone-Balanced Auto-Assign**
```
Agent selects passenger group → triggers zone assignment
→ POST /ajax/zone_balanced_seat (passenger_keys[], force_assign)
→ Multiple seat updates applied
```

**6. Multi-Deck Toggle**
```
Aircraft is A380 / double-deck → DeckToggle visible
→ Click "Upper Deck" → fetch upper deck data
→ Re-render CabinDeck with upper_deck seats
```

---

## 8. Architecture Specification

### 8.1 Decision: Screaming Architecture + Hexagonal (Ports & Adapters) + CQRS

**Rationale for choosing over pure FSD (Feature-Sliced Design):**

| Criterion | FSD | Screaming + Hexagonal + CQRS | Winner |
|-----------|-----|------------------------------|--------|
| Domain isolation | Medium (layer-based) | High (domain folders) | Hexagonal |
| React ecosystem fit | Native | Good (ports map to hooks/services) | FSD slight edge |
| Testability | Good | Excellent (domain logic has no React deps) | Hexagonal |
| CQRS natural fit | No | Yes (read/write separation built-in) | Hexagonal |
| Team familiarity | High | Medium | FSD |
| Migration scalability | Medium | High (swap cloud_2 adapter without UI changes) | Hexagonal |

**Verdict:** Screaming + Hexagonal + CQRS wins on the criteria that matter for a long-term DCS migration (maintainability, testability, cloud_2 isolation).

### 8.2 Domain Model

```
Domain: SeatPlan
  Entities:
    - Seat           (seat_key, number, row, col, type, status, is_exit)
    - CabinLayout    (cabin_config_key, rows, classes, decks)
    - SeatAssignment (flight_key, passenger_key, seat_key, timestamp)
    - SeatBlock      (flight_key, seat_key, reason, blocked_by)
  Value Objects:
    - SeatNumber     ("12C" → row=12, col=C)
    - SeatStatus     (available | occupied | blocked | selected)
    - CabinClass     (economy | business | first)
    - DeckType       (lower | upper)
```

### 8.3 Hexagonal Port Interfaces

```typescript
// PRIMARY PORT (application → domain)
interface ISeatPlanQueryService {
  getSeatPlan(params: GetSeatPlanParams): Promise<SeatPlanResult>;
  getSeatOccupancy(flightKey: number): Promise<SeatOccupancy[]>;
  getSeatPlanColumns(cabinConfigKey: number): Promise<SeatColumn[]>;
}

// PRIMARY PORT (write side)
interface ISeatCommandService {
  assignSeat(cmd: AssignSeatCommand): Promise<void>;
  reseatPassenger(cmd: ReseatPassengerCommand): Promise<void>;
  blockSeat(cmd: BlockSeatCommand): Promise<void>;
  unblockSeat(cmd: UnblockSeatCommand): Promise<void>;
  zoneBalancedAssign(cmd: ZoneBalancedSeatCommand): Promise<SeatAssignment[]>;
}

// SECONDARY PORT (domain → infrastructure)
interface ISeatPlanRepository {
  fetchSeatPlan(params: GetSeatPlanParams): Promise<RawSeatPlanDTO>;
  fetchOccupancy(flightKey: number): Promise<RawOccupancyDTO[]>;
  postAssignSeat(payload: AssignSeatPayload): Promise<void>;
  postReseat(payload: ReseatPayload): Promise<void>;
  postBlock(payload: BlockPayload): Promise<void>;
}
```

### 8.4 SOLID Principles Applied

Each principle is mapped to a concrete rule in this codebase. Violations are treated as bugs.

#### S — Single Responsibility Principle
> *One reason to change per unit.*

| Unit | Single Responsibility | What it must NOT do |
|------|-----------------------|---------------------|
| `SeatCell.tsx` | Render one seat and emit user events | Fetch data, manage seat state, apply business rules |
| `useSeatPlan.ts` | Fetch and cache the seat plan (query) | Issue write commands or hold UI interaction state |
| `useAssignSeat.ts` | Execute the assign-seat command (mutation) | Validate business rules or render UI |
| `Cloud2SeatPlanAdapter.ts` | Translate HTTP ↔ domain types for cloud_2 | Contain business logic or React concerns |
| `SeatPlanMapper.ts` | Map raw DTO to domain entity | Make API calls |
| `AssignSeatCommand.ts` | Define the assign-seat use case | Know about React or HTTP |
| `SeatNumber.ts` | Parse and validate a seat number string | Know about flights or passengers |

**Rule:** If you need to describe a file with "and", split it.

---

#### O — Open/Closed Principle
> *Open for extension, closed for modification.*

The hexagonal port interfaces ARE the extension points. To add a new data source (e.g., replace cloud_2 with a microservice), write a new adapter — zero changes to domain or UI.

```typescript
// Closed (never modify this):
interface ISeatPlanRepository { ... }

// Open (add new implementations freely):
class Cloud2SeatPlanAdapter implements ISeatPlanRepository { ... }
class MockSeatPlanAdapter    implements ISeatPlanRepository { ... }  // tests
class NewMicroserviceAdapter implements ISeatPlanRepository { ... }  // future
```

**Rule:** Domain code (`domain/`, `application/`) must never import from `infrastructure/`. New behaviour = new class, not edited logic.

---

#### L — Liskov Substitution Principle
> *Any implementation of a port must be drop-in substitutable.*

All `ISeatPlanRepository` implementations must:
- Return the same domain types (no extra fields that callers depend on)
- Throw the same error types (`SeatPlanError`, `SeatNotFoundError`)
- Honor the same async contract (all methods return `Promise`)
- Not require callers to know which adapter is active

**Rule:** Tests run against the `ISeatPlanRepository` interface with the mock adapter. If production behavior differs, the adapter is broken — not the test.

---

#### I — Interface Segregation Principle
> *No client should be forced to depend on methods it does not use.*

Ports are split by responsibility. Never merge them:

```typescript
// ✅ Segregated — each consumer takes only what it needs
interface ISeatPlanQueryService {     // read-only consumers
  getSeatPlan(...): Promise<SeatPlanResult>;
  getSeatOccupancy(...): Promise<SeatOccupancy[]>;
}

interface ISeatCommandService {       // write consumers
  assignSeat(...): Promise<void>;
  reseatPassenger(...): Promise<void>;
  blockSeat(...): Promise<void>;
}

interface ISeatPricingService {       // pricing consumers
  getSeatPricing(...): Promise<SeatPricing[]>;
}

// ❌ Violation — fat interface forces unrelated dependencies
interface ISeatService {
  getSeatPlan(); assignSeat(); getSeatPricing(); blockSeat();
}
```

**Rule:** If a hook/component only reads, it receives `ISeatPlanQueryService`. It must never receive `ISeatCommandService`.

---

#### D — Dependency Inversion Principle
> *High-level modules must not depend on low-level modules. Both depend on abstractions.*

```
UI (high-level)
  → depends on: ISeatPlanQueryService, ISeatCommandService   ← abstraction
  
Application (use cases)
  → depends on: ISeatPlanRepository                          ← abstraction

Infrastructure (low-level)
  → implements: ISeatPlanRepository                          ← concrete

// Wiring happens at the app root (providers):
// App.tsx → QueryProvider → inject Cloud2SeatPlanAdapter as ISeatPlanRepository
```

**Concrete rules:**
- `SeatPlanTab.tsx` never imports `Cloud2SeatPlanAdapter`
- `AssignSeatCommand.ts` never imports `axios`
- All dependency wiring is in `src/app/providers/`
- Tests inject `MockSeatPlanAdapter` at the provider level — zero test-specific code in components

---

### 8.5 CQRS Split

**Query Side (React Query / TanStack Query):**
```
GetSeatPlanQuery        → useSeatPlan(flightKey, stationIata, date)
GetSeatOccupancyQuery   → useSeatOccupancy(flightKey)
GetSeatPlanColumnsQuery → useSeatPlanColumns(cabinConfigKey)
```

**Command Side (mutations with optimistic updates):**
```
AssignSeatCommand       → useAssignSeat()  → optimistic: seat.status = occupied
ReseatPassengerCommand  → useReseatPassenger() → optimistic swap
BlockSeatCommand        → useBlockSeat()   → optimistic: seat.status = blocked
UnblockSeatCommand      → useUnblockSeat() → optimistic: seat.status = available
ZoneBalancedSeatCommand → useZoneBalance() → no optimistic (bulk, server-authoritative)
```

### 8.5 Folder Structure (Screaming Architecture)

```
src/
├── seat-plan/                        ← DOMAIN: seat plan feature
│   ├── domain/                       ← Pure domain (no React, no HTTP)
│   │   ├── entities/
│   │   │   ├── Seat.ts
│   │   │   ├── CabinLayout.ts
│   │   │   └── SeatAssignment.ts
│   │   ├── value-objects/
│   │   │   ├── SeatNumber.ts
│   │   │   └── SeatStatus.ts
│   │   └── ports/
│   │       ├── ISeatPlanQueryService.ts
│   │       ├── ISeatCommandService.ts
│   │       └── ISeatPlanRepository.ts
│   ├── application/                  ← Use cases (CQRS)
│   │   ├── queries/
│   │   │   ├── GetSeatPlanQuery.ts
│   │   │   └── GetSeatOccupancyQuery.ts
│   │   └── commands/
│   │       ├── AssignSeatCommand.ts
│   │       ├── ReseatPassengerCommand.ts
│   │       └── BlockSeatCommand.ts
│   ├── infrastructure/               ← Cloud_2 adapters (SECONDARY)
│   │   ├── api/
│   │   │   ├── Cloud2SeatPlanAdapter.ts
│   │   │   └── dto/
│   │   │       ├── SeatPlanDTO.ts
│   │   │       └── SeatOccupancyDTO.ts
│   │   └── mappers/
│   │       └── SeatPlanMapper.ts
│   └── ui/                           ← React components (PRIMARY adapter)
│       ├── SeatPlanTab.tsx
│       ├── SeatMap.tsx
│       ├── SeatRow.tsx
│       ├── SeatCell.tsx
│       ├── DeckToggle.tsx
│       ├── SeatLegend.tsx
│       ├── SeatPricingBadge.tsx
│       ├── AssignConfirmModal.tsx
│       ├── AvailableSeatsInLegs.tsx
│       └── hooks/
│           ├── useSeatPlan.ts
│           ├── useAssignSeat.ts
│           └── useZoneBalance.ts
├── shared/                           ← Shared across domains
│   ├── design-tokens/                ← Extracted from cloud_2 CSS
│   ├── ui/                           ← Generic UI primitives
│   └── api/
│       └── axiosInstance.ts          ← Configured axios (base URL, auth)
└── app/                              ← App shell (DIP wiring point)
    ├── App.tsx
    └── providers/
        ├── QueryProvider.tsx         ← TanStack Query setup
        └── DependencyProvider.tsx    ← DIP: binds interfaces → adapters
            // Cloud2SeatPlanAdapter → ISeatPlanRepository
            // SeatPlanQueryService  → ISeatPlanQueryService
            // SeatCommandService    → ISeatCommandService
```

---

## 9. Migration Risks & Constraints

| Risk | Severity | Mitigation |
|------|----------|------------|
| cloud_2 API CORS policy | High | Confirm cloud_2 allows cross-origin requests or use proxy in dev |
| Session/auth — cloud_2 uses PHP session cookies | High | Shared session domain or token-based auth bridge |
| `seat_plan_for_touchsuite` vs `get_seat_plan` — different response shapes | Medium | Unify in adapter mapper layer |
| API v1.8 seat_plan doesn't include occupancy in base response | Medium | Combine seat plan + occupancy in parallel queries |
| Exit seat legal disclaimer UX | Medium | Implement confirmation modal matching DCS legal requirement |
| Zone-balanced seating is server-side algorithm | Low | Simply call the endpoint; no need to re-implement in React |
| IATCI seating requires partner carrier API calls | High | Defer IATCI to Phase 2 unless explicitly in scope |
| Multi-deck rare — most flights are single deck | Low | Build the toggle/structure, lazy-load upper deck |

---

## 10. Open Questions (Require Answer Before Phase 2)

1. **Base URL**: What is the cloud_2 API base URL for the dev/staging environment?
2. **Auth**: How does the React app authenticate to cloud_2? Same session cookie? Bearer token?
3. **CORS**: Is cloud_2 configured to accept requests from the React dev server (`localhost:5173`)?
4. **Seat assignment flow**: Does the DCS tab always have a pre-selected passenger, or can agents assign without a selected passenger?
5. **Pricing visibility**: Is seat pricing shown to all agents or only in specific carrier configs?
6. **IATCI scope**: Is IATCI seating in scope for this POC?
7. **Real-time updates**: Does the seat map need WebSocket/polling for real-time occupancy updates (other agents working concurrently)?

---

*Document generated from cloud_2 source analysis via project2context (2026-04-27)*
*Covers: Feature inventory (15 sub-features), 3 REST API groups, 8 TypeScript domain types, 14 React components, hexagonal architecture spec*
