---
phase: 09-seat-overlays
plan: 03
completed: 2026-04-27
duration: 10m
---

# Plan 09-03: Gender Badge Overlay

## Tests Added

- `describe('gender badge')` in `SeatCell.test.tsx` — 6 cases:
  - male badge (seat_gender_male class) when gender="M"
  - female badge (seat_gender_female class) when gender="F"
  - unaccompanied badge (seat_gender_unaccompanied class) when gender="U"
  - no badge when gender is undefined
  - no badge when gender is null
  - badge is aria-hidden="true" (decorative)
- `describe('gender')` in `Seat.test.ts` — 4 cases:
  - default null
  - exposes 'M' when set
  - accepts F and U
  - normalizes invalid code (e.g. 'X') to null at runtime
- `seatPlanMapper.test.ts` — 1 case: maps `gender` DTO field (M/F/null for missing)

**Total new tests: 11**

## Files Modified

- `src/domain/seat/Seat.ts` — Added `SeatGender = 'M' | 'F' | 'U'` type export; `gender?: SeatGender | null` in SeatProps; `_gender: SeatGender | null` field; `VALID_GENDERS` Set for runtime validation; `gender` getter; updated `withStatus`
- `src/infrastructure/adapters/mappers/seatPlanMapper.ts` — Passes `s.gender` cast to `'M' | 'F' | 'U'`; Seat.create normalizes invalid values
- `src/presentation/components/SeatCell.tsx` — Added `Gender` type alias and `GENDER_CLASS` lookup; `gender?: Gender | null` prop; renders `.seat_gender_badge` + modifier class as first child of button; aria-hidden="true"
- `src/presentation/components/SeatRow.tsx` — Passes `seat.gender` to SeatCell
- `src/infrastructure/adapters/MockSeatPlanAdapter.ts` — 1B gets gender='M', 2C gets gender='F', 2F gets gender='U'
- `src/styles/components.css` — Added `.seat_gender_badge`, `.seat_gender_male`, `.seat_gender_female`, `.seat_gender_unaccompanied` rules

## Design Token Decision

No `--color-gender-*` tokens were defined in `tokens.css`. Used hardcoded hex values as per plan spec: `#1565c0` (male), `#e91e63` (female), `#f57c00` (unaccompanied). No `var()` wrapper since no matching tokens exist.

## All Three Overlays Coexist

Final mock seat 2F demonstrates all overlays together:
- Orange gender badge (U) at top-left
- "BK" passenger initials in center
- Orange infant indicator at bottom-right

No visual overlap between the four corners (top-left=gender, bottom-right=infant, bottom-left=block, center=initials).

## Phase 9 Final Metrics

- Tests: 124 passing, 3 skipped (integration), 0 failing (up from 91 before Phase 9)
- TypeScript: 0 errors
- Build: 6.40 kB CSS, 234.54 kB JS

## Follow-ups for Phase 10

- Replace colored dot badges with SVG glyphs matching cloud_2 (out of scope for POC)
- Introduce `--color-gender-*` design tokens in tokens.css
