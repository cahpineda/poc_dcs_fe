---
phase: 01-migration-context
plan: 01
subsystem: documentation
tags: seat-plan, migration, architecture, cloud2, dcs, solid, hexagonal, cqrs

requires: []
provides:
  - MIGRATION-CONTEXT.md with 15 seat_plan sub-features, REST API contracts, TypeScript domain types, 14 React components, SOLID+hexagonal+CQRS architecture spec
  - PROJECT.md with SOLID constraints, architecture decisions, cloud_2 key files
  - ROADMAP.md with 7 phases from scaffold to validation
affects: [02-react-scaffold, 03-api-adapters, 04-seat-map-ui, 05-seat-operations]

tech-stack:
  added: []
  patterns:
    - "Screaming Architecture: domain folders, not framework folders"
    - "Hexagonal (Ports & Adapters): ISeatPlanRepository, ISeatPlanQueryService, ISeatCommandService"
    - "CQRS: read hooks (useSeatPlan) separate from write hooks (useAssignSeat)"
    - "SOLID: S=one responsibility, O=new adapter without changing domain, L=substitutable ports, I=segregated interfaces, D=DependencyProvider wiring"

key-files:
  created:
    - .planning/PROJECT.md
    - .planning/ROADMAP.md
    - .planning/config.json
    - .planning/phases/01-migration-context/MIGRATION-CONTEXT.md
    - .planning/codebase/STACK.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/STRUCTURE.md
  modified:
    - .planning/STATE.md

key-decisions:
  - "Target cloud_2 REST API v1.8 only (ignore v1.1-v1.7)"
  - "Screaming Architecture + Hexagonal + CQRS + SOLID as first-class constraint"
  - "TanStack Query for CQRS query side; Zustand for UI state; Axios for HTTP adapter"
  - "Vite over CRA for build tooling"
  - "DependencyProvider.tsx is the single DIP wiring point — no component imports axios directly"
  - "IATCI seating deferred to post-POC (high complexity)"
  - "Design system extraction deferred to Phase 6; keep cloud_2 design for now"

patterns-established:
  - "Port interface naming: prefix I, e.g. ISeatPlanRepository"
  - "Segregated ports: query / command / pricing"
  - "TDD for domain entities, value objects, mappers (Phase 3+)"
  - "Standard plans for scaffold/config (Phase 2)"

issues-created: []
duration: 45min
completed: 2026-04-27
---

# Phase 1: Migration Context Document — Summary

**Full seat_plan feature inventory extracted from cloud_2 via project2context: 15 sub-features, 3 API groups, 8 TypeScript domain types, 14 React components, and SOLID+hexagonal+CQRS architecture spec — zero code written, full migration blueprint ready.**

## What Was Built

MIGRATION-CONTEXT.md is the single source of truth for the React migration. It contains:

- **15 sub-features** catalogued from cloud_2 source: seat map, assignment, reassignment, blocking, zone-balanced seating, pricing, exit seat management, multi-deck, occupancy tracking, caching, print, multi-leg availability, IATCI, load-control columns, allocated-seating flag
- **REST API contracts** for all 3 endpoint groups (read, write, mobile) with request/response shapes
- **TypeScript domain types**: `Seat`, `CabinRow`, `SeatPosition`, `SeatStatus`, `SeatPlanResult`, `SeatOccupancy`, and all command payloads
- **14 React component inventory** mapped from cloud_2 DOM structure
- **SOLID section** with concrete per-principle rules and violation examples
- **Architecture spec**: domain model, 3 port interfaces, CQRS query/command split, full folder structure
- **7 open questions** to resolve before Phase 2 (CORS, auth, real-time)

## Key Insight

cloud_2's `seat::get_seat_plan_for_touchsuite()` is the most complete API surface — it returns lower+upper deck, pricing errors, and allocated-seating flag in one call. Phase 3 should target this over the versioned `ws_v1.8` endpoint for the TouchSuite adapter.
