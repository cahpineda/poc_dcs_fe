---
phase: 02-react-scaffold
plan: 03
completed: 2026-04-27
duration: 5m
---

# Plan 02-03: Screaming Architecture Folder Structure + Port Interfaces

Created all domain folder directories with empty barrel exports and declared the three port interfaces (ISeatPlanQueryService, ISeatCommandService, ISeatPricingService) using `unknown` for domain types (to be replaced in Phase 3 TDD).

## Tasks Completed

1. Created `src/domain/seat/`, `src/application/ports/`, `src/application/use-cases/`, `src/infrastructure/`, `src/presentation/components/`, `src/presentation/hooks/`, `src/shared/types/`, `src/shared/utils/` with `export {};` barrel files
2. Created three port interfaces in `src/application/ports/`:
   - `ISeatPlanQueryService` — getSeatPlan, getSeatOccupancy
   - `ISeatCommandService` — assignSeat, reseatPassenger, blockSeat, unblockSeat
   - `ISeatPricingService` — getSeatPricing
3. Updated `src/application/ports/index.ts` to export all three interfaces

## Key Decisions

- Ports use `unknown` for domain type parameters intentionally — concrete types (Seat, SeatPlanResult) are TDD-driven in Phase 3. This prevents Phase 3 from being blocked by circular deps.

## Suggested Commits

```
chore(02-03): create screaming architecture folder structure with port interface stubs
```

## Retrospective

- **Diagnosis accuracy**: Straightforward structural task, executed exactly as planned.
- **Reusable patterns**: `export {};` in empty barrel files avoids TypeScript isolatedModules error.
