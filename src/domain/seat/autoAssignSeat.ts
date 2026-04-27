import type { SeatPlanResult } from './SeatPlanResult';

const WINDOW_COLS = new Set(['A', 'F']);
const AISLE_COLS = new Set(['C', 'D']);

function zoneScore(seatNumber: string, occupancyRate: number): number {
  const col = seatNumber.slice(-1);
  if (WINDOW_COLS.has(col)) return occupancyRate < 0.5 ? 0 : 2;
  if (AISLE_COLS.has(col)) return occupancyRate >= 0.5 ? 0 : 2;
  return 1;
}

export function autoAssignSeat(plan: SeatPlanResult, cabinClass?: string): string | null {
  const occupancyRate =
    plan.totalSeats > 0 ? (plan.totalSeats - plan.availableCount) / plan.totalSeats : 0;

  const candidates = plan.rows
    .flatMap((row) => row.seats)
    .filter((s) => s.isAvailable() && (!cabinClass || s.cabin === cabinClass));

  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) =>
      zoneScore(a.number.toString(), occupancyRate) -
      zoneScore(b.number.toString(), occupancyRate)
  );

  return candidates[0].number.toString();
}
