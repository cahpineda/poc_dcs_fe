import { describe, it, expect } from 'vitest';
import { autoAssignSeat } from '../autoAssignSeat';
import { SeatPlanResult } from '../SeatPlanResult';
import { Seat } from '../Seat';
import { SeatNumber } from '../SeatNumber';
import type { SeatStatus } from '../SeatStatus';

function makeSeat(seatNumber: string, status: SeatStatus, cabinClass = 'Y') {
  return Seat.create({ seatNumber: SeatNumber.create(seatNumber), status, cabinClass });
}

function buildPlan(seats: { seatNumber: string; status: SeatStatus; cabinClass?: string }[]) {
  return SeatPlanResult.create({
    flightId: 'FL001',
    isUpperDeck: false,
    rows: [
      {
        rowNumber: 1,
        isExitRow: false,
        seats: seats.map((s) => makeSeat(s.seatNumber, s.status, s.cabinClass)),
      },
    ],
  });
}

describe('autoAssignSeat', () => {
  it('returns null when no seats are available', () => {
    const plan = buildPlan([
      { seatNumber: '1A', status: 'occupied' },
      { seatNumber: '1B', status: 'occupied' },
    ]);
    expect(autoAssignSeat(plan)).toBeNull();
  });

  it('returns a seat string when seats are available', () => {
    const plan = buildPlan([
      { seatNumber: '1A', status: 'available' },
      { seatNumber: '1B', status: 'available' },
    ]);
    const result = autoAssignSeat(plan);
    expect(typeof result).toBe('string');
    expect(result).not.toBeNull();
  });

  it('prefers window seats (A column) when cabin is less than half occupied', () => {
    const plan = buildPlan([
      { seatNumber: '1A', status: 'available' },
      { seatNumber: '1C', status: 'available' },
      { seatNumber: '1D', status: 'available' },
    ]);
    expect(autoAssignSeat(plan)).toBe('1A');
  });

  it('avoids blocked and occupied seats', () => {
    const plan = buildPlan([
      { seatNumber: '1A', status: 'blocked' },
      { seatNumber: '1B', status: 'occupied' },
      { seatNumber: '1C', status: 'available' },
    ]);
    expect(autoAssignSeat(plan)).toBe('1C');
  });

  it('respects cabinClass filter — Y class only', () => {
    const plan = SeatPlanResult.create({
      flightId: 'FL001',
      isUpperDeck: false,
      rows: [
        {
          rowNumber: 1,
          isExitRow: false,
          seats: [
            makeSeat('1A', 'available', 'C'),
            makeSeat('1B', 'available', 'Y'),
          ],
        },
      ],
    });
    expect(autoAssignSeat(plan, 'Y')).toBe('1B');
    expect(autoAssignSeat(plan, 'C')).toBe('1A');
  });

  it('returns null when no seats match the cabin class filter', () => {
    const plan = buildPlan([{ seatNumber: '1A', status: 'available', cabinClass: 'C' }]);
    expect(autoAssignSeat(plan, 'Y')).toBeNull();
  });
});
