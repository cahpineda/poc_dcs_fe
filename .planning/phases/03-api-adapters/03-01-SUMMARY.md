---
phase: 03-api-adapters
plan: 01
status: complete
---

# 03-01 SUMMARY: SeatNumber Value Object

## RED
Wrote `src/domain/seat/__tests__/SeatNumber.test.ts` with 6 test cases before any implementation existed.
Tests failed immediately with `Failed to resolve import "../SeatNumber"` — the file did not exist.

Test cases written:
1. Happy path: `SeatNumber.create("12A")` returns instance with correct value
2. Null/invalid: `SeatNumber.create("")` throws `"Invalid seat number: empty"`
3. Boundary: `SeatNumber.create("ABC")` throws `"Invalid seat number: ABC"`
4. Single-digit row `"1A"` is valid
5. `equals` returns `true` for same value
6. `equals` returns `false` for different values

## GREEN
Created `src/domain/seat/SeatNumber.ts`:
- Private constructor guards direct instantiation
- `static create(value: string)` validates against `/^\d{1,3}[A-K]$/`
- Empty string detected first → `"Invalid seat number: empty"`
- Invalid format → `"Invalid seat number: <value>"`
- `toString()`, `rawValue` getter, `equals()` implemented

All 6 tests passed immediately after implementation.

## REFACTOR
Updated `src/domain/seat/index.ts` to export `SeatNumber` from the domain barrel.
No structural changes to the implementation — it was clean on first pass.

## Verification
- `npm test`: 6/6 pass
- `npx tsc --noEmit`: no errors

## Files Modified
- `src/domain/seat/__tests__/SeatNumber.test.ts` — created (RED)
- `src/domain/seat/SeatNumber.ts` — created (GREEN)
- `src/domain/seat/index.ts` — updated barrel export (REFACTOR)
