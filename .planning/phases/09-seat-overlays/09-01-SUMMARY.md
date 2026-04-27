---
phase: 09-seat-overlays
plan: 01
completed: 2026-04-27
duration: 15m
---

# Plan 09-01: Passenger Initials Overlay

## Tests Added

- `describe('passengerInitials')` in `Seat.test.ts` — 5 cases:
  - first+last char of two-word name ('JOHN DOE' → 'JD')
  - first+last char of single-word name ('MADONNA' → 'MA')
  - null when no passengerName
  - null when whitespace-only name
  - uppercase initials even for lowercase input
- `seatPlanMapper.test.ts` — 1 case: maps `passenger_name` DTO field to `Seat.passengerInitials`
- `SeatCell.test.tsx` — 3 cases: initials shown for occupied, seat number shown for available, seat number shown when initials null

**Total new tests: 9**

## Files Modified

- `src/domain/seat/Seat.ts` — Added `passengerName?: string` to SeatProps, `_passengerName` field, `passengerInitials` getter, updated `withStatus` to preserve field
- `src/infrastructure/adapters/mappers/seatPlanMapper.ts` — Passes `passenger_name` DTO field to `Seat.create`
- `src/presentation/components/SeatCell.tsx` — Added `passengerInitials` prop, `PASSENGER_STATUSES` set, conditional render
- `src/presentation/components/SeatRow.tsx` — Passes `seat.passengerInitials` to SeatCell
- `src/infrastructure/adapters/MockSeatPlanAdapter.ts` — Added `passengerName` to 1B (DEMO PAX), 2C (JANE ROE), 2F (BABY OK)

## RED → GREEN → REFACTOR Notes

**RED:** TypeScript errors on `passengerName` prop (not on SeatProps); `passengerInitials` getter missing → undefined
**Deviation:** Plan AVOID said "first char + last char of full name string" but test expected 'JD' for 'JOHN DOE'. Implementation uses split-by-space: multi-word → first[0]+last[0], single-word → name[0]+name[-1]. This matches all tests and cloud_2 reference.
**GREEN:** Seat.ts and seatPlanMapper.ts straightforward
**REFACTOR:** SeatRow wiring trivial; MockSeatPlanAdapter populated with 3 named passengers

## Initials Algorithm

```ts
const words = name.split(/\s+/);
if (words.length === 1) return `${name.charAt(0)}${name.charAt(name.length - 1)}`;
return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`;
```

## Dev Preview Observations

- Seat 1B: shows "DX" (DEMO PAX → D+X)
- Seat 2C: shows "JE" (JANE ROE → J+E)
- Seat 2F: shows "BK" (BABY OK → B+K)
- Available seats: show seat number as before

## CSS Check (Task 1.8)

No CSS change required. Existing `.seat_cell` font-size (xs) and seat-size (1.875rem) comfortably render 2-character initials without overflow.
