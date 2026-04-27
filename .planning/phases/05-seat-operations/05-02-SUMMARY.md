---
phase: 05-seat-operations
plan: 02
completed: 2026-04-27
duration: 5m
---

# Plan 05-02: Seat Mutation Hooks

Created `useSeatAssign`, `useSeatBlock`, `useSeatUnblock` — CQRS write-side hooks symmetric with `useSeatPlan` — 6 new tests GREEN (75 total).

## RED

Wrote 6 tests across two files: useSeatAssign (3) and useSeatBlock/useSeatUnblock (3). Each test verifies service call, error surfacing, and `['seatPlan', flightId]` cache invalidation on success.

Test failed: `Cannot resolve import "../useSeatAssign"` and `"../useSeatBlock"`.

## GREEN

Created `useSeatAssign.ts` — `useMutation` wrapping `services.seatCommand.assignSeat`, invalidates `['seatPlan', flightId]` on success.

Created `useSeatBlock.ts` — exports both `useSeatBlock` and `useSeatUnblock`, same invalidation pattern.

Updated `hooks/index.ts` — exports all three new hooks.

## REFACTOR

None — minimal by design, symmetric with useSeatPlan.

## Commits

```
test(05-02): add failing tests for useSeatAssign and useSeatBlock hooks
feat(05-02): implement useSeatAssign, useSeatBlock, useSeatUnblock mutation hooks
```
