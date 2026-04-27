import { describe, it, expect } from 'vitest';
import { SeatNumber } from '../SeatNumber';
import { Seat } from '../Seat';
import { SeatPlanResult } from '../SeatPlanResult';
import type { CabinRow } from '../CabinRow';

const makeRow = (rowNumber: number): CabinRow => ({
  rowNumber,
  seats: [
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}A`), status: 'available', cabinClass: 'Y' }),
    Seat.create({ seatNumber: SeatNumber.create(`${rowNumber}B`), status: 'occupied', cabinClass: 'Y' }),
  ],
  isExitRow: false,
});

describe('SeatPlanResult', () => {
  it('creates a SeatPlanResult and counts totalSeats and availableCount', () => {
    const rows = [makeRow(1), makeRow(2)];
    const result = SeatPlanResult.create({ rows, flightId: 'FL001', isUpperDeck: false });
    expect(result.totalSeats).toBe(4);
    expect(result.availableCount).toBe(2);
    expect(result.flightId).toBe('FL001');
  });

  it('throws when rows is null', () => {
    expect(() =>
      SeatPlanResult.create({ rows: null as never, flightId: 'FL001', isUpperDeck: false })
    ).toThrow('SeatPlanResult requires rows array');
  });

  it('getSeat returns seat by string identifier, undefined for unknown seat', () => {
    const rows = [makeRow(5)];
    const result = SeatPlanResult.create({ rows, flightId: 'FL001', isUpperDeck: false });
    expect(result.getSeat('5A')).toBeDefined();
    expect(result.getSeat('99Z')).toBeUndefined();
  });

  it('availableCount is 0 for empty rows', () => {
    const result = SeatPlanResult.create({ rows: [], flightId: 'FL001', isUpperDeck: false });
    expect(result.totalSeats).toBe(0);
    expect(result.availableCount).toBe(0);
  });
});
