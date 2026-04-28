import { describe, it, expect } from 'vitest';
import { SeatNumber } from '../SeatNumber';
import { Seat } from '../Seat';
import { SeatPlanResult } from '../SeatPlanResult';
import type { CabinRow } from '../CabinRow';

const makeOccupiedSeat = (num: string) =>
  Seat.create({
    seatNumber: SeatNumber.create(num),
    status: 'occupied',
    cabinClass: 'Y',
    passengerName: `Pax ${num}`,
    passengerKey: `KEY-${num}`,
  });

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

describe('SeatPlanResult.derivePassengers', () => {
  it('returns one Passenger per occupied seat in row/column order', () => {
    const rows: CabinRow[] = [
      { rowNumber: 1, seats: [makeOccupiedSeat('1A'), makeOccupiedSeat('1B')], isExitRow: false },
      { rowNumber: 2, seats: [makeOccupiedSeat('2A')], isExitRow: false },
    ];
    const result = SeatPlanResult.create({ rows, flightId: 'FL001', isUpperDeck: false });
    const passengers = result.derivePassengers();
    expect(passengers).toHaveLength(3);
    expect(passengers[0].currentSeatNumber).toBe('1A');
    expect(passengers[1].currentSeatNumber).toBe('1B');
    expect(passengers[2].currentSeatNumber).toBe('2A');
  });

  it('excludes unoccupied seats', () => {
    const rows: CabinRow[] = [
      {
        rowNumber: 1,
        seats: [
          makeOccupiedSeat('1A'),
          Seat.create({ seatNumber: SeatNumber.create('1B'), status: 'available', cabinClass: 'Y' }),
          Seat.create({ seatNumber: SeatNumber.create('1C'), status: 'blocked', cabinClass: 'Y' }),
        ],
        isExitRow: false,
      },
    ];
    const result = SeatPlanResult.create({ rows, flightId: 'FL001', isUpperDeck: false });
    expect(result.derivePassengers()).toHaveLength(1);
    expect(result.derivePassengers()[0].currentSeatNumber).toBe('1A');
  });

  it('returns empty array when no occupied seats', () => {
    const rows: CabinRow[] = [
      {
        rowNumber: 1,
        seats: [
          Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' }),
        ],
        isExitRow: false,
      },
    ];
    const result = SeatPlanResult.create({ rows, flightId: 'FL001', isUpperDeck: false });
    expect(result.derivePassengers()).toHaveLength(0);
  });
});
