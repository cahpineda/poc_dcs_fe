---
phase: 07-integration-validation
plan: 01
completed: 2026-04-27
duration: 5m
---

# Plan 07-01: Integration Smoke Tests

Created `Cloud2IntegrationSuite.test.ts` with `describe.skipIf(!INTEGRATION_ENABLED)` guard. Tests use real adapter instances (no vi.mock). Suite skips in normal CI, runnable with `INTEGRATION_TESTS=true`.

## Created

`src/infrastructure/adapters/__tests__/integration/Cloud2IntegrationSuite.test.ts`

## Test suites (skipped in CI)

- `Cloud2 Integration — getSeatPlan`: 2 tests (SeatPlanResult structure, all status codes map without throwing)
- `Cloud2 Integration — Contract assertions`: 1 test (VITE_API_BASE_URL env var configured)

## Also fixed

`src/infrastructure/adapters/MockSeatCommandAdapter.ts`: renamed `_command` params to `_` and added `argsIgnorePattern: '^_'` to ESLint config — eliminates 4 lint errors.

## Verification

- `npm test`: ✅ 81/81, 3 skipped (not failed)
- `npm run lint`: ✅ 0 errors
