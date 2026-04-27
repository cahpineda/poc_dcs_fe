import { describe, it, expect } from 'vitest';
import { SeatNumber } from '../SeatNumber';
import { Seat } from '../Seat';
import type { SeatStatus } from '../SeatStatus';

describe('passenger extended fields', () => {
  it('exposes passengerKey getter (default null)', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' });
    expect(seat.passengerKey).toBeNull();
  });
  it('exposes passengerKey when provided', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1B'), status: 'occupied', cabinClass: 'Y', passengerKey: 'PAX-001' });
    expect(seat.passengerKey).toBe('PAX-001');
  });
  it('exposes boardingGroup getter (default null)', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' });
    expect(seat.boardingGroup).toBeNull();
  });
  it('exposes boardingGroup when provided', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1B'), status: 'occupied', cabinClass: 'Y', boardingGroup: 2 });
    expect(seat.boardingGroup).toBe(2);
  });
  it('exposes rushStatus (default false)', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' });
    expect(seat.rushStatus).toBe(false);
  });
  it('exposes rushStatus=true when set', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'occupied', cabinClass: 'Y', rushStatus: true });
    expect(seat.rushStatus).toBe(true);
  });
  it('exposes pnr getter (default null)', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' });
    expect(seat.pnr).toBeNull();
  });
  it('exposes pnr when provided', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1B'), status: 'occupied', cabinClass: 'Y', pnr: 'ABC123' });
    expect(seat.pnr).toBe('ABC123');
  });
  it('exposes ssrs (default empty array)', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'available', cabinClass: 'Y' });
    expect(seat.ssrs).toEqual([]);
  });
  it('exposes ssrs array when provided', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('1A'), status: 'occupied', cabinClass: 'Y', ssrs: ['WCHR'] });
    expect(seat.ssrs).toEqual(['WCHR']);
  });
});

describe('passengerInitials', () => {
  it('returns first+last char of two-word name', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'occupied',
      cabinClass: 'Y',
      passengerName: 'JOHN DOE',
    });
    expect(seat.passengerInitials).toBe('JD');
  });

  it('returns first+last char of single-word name', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'occupied',
      cabinClass: 'Y',
      passengerName: 'MADONNA',
    });
    expect(seat.passengerInitials).toBe('MA');
  });

  it('returns null when no passengerName provided', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'available',
      cabinClass: 'Y',
    });
    expect(seat.passengerInitials).toBeNull();
  });

  it('handles whitespace-only name as null', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'occupied',
      cabinClass: 'Y',
      passengerName: '   ',
    });
    expect(seat.passengerInitials).toBeNull();
  });

  it('returns uppercase initials even for lowercase input', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'occupied',
      cabinClass: 'Y',
      passengerName: 'john doe',
    });
    expect(seat.passengerInitials).toBe('JD');
  });
});

describe('gender', () => {
  it('exposes gender getter (default null)', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'available', cabinClass: 'Y' });
    expect(seat.gender).toBeNull();
  });

  it('exposes gender when set to "M"', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'occupied', cabinClass: 'Y', gender: 'M' });
    expect(seat.gender).toBe('M');
  });

  it('accepts F and U values', () => {
    expect(Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'occupied', cabinClass: 'Y', gender: 'F' }).gender).toBe('F');
    expect(Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'occupied', cabinClass: 'Y', gender: 'U' }).gender).toBe('U');
  });

  it('normalizes invalid gender code to null', () => {
    // @ts-expect-error — testing runtime guard against bad data
    const seat = Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'occupied', cabinClass: 'Y', gender: 'X' });
    expect(seat.gender).toBeNull();
  });
});

describe('infant and block flags', () => {
  it('exposes hasInfant getter (default false)', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'available', cabinClass: 'Y' });
    expect(seat.hasInfant).toBe(false);
  });

  it('exposes hasInfant=true when set', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'occupied', cabinClass: 'Y', hasInfant: true });
    expect(seat.hasInfant).toBe(true);
  });

  it('exposes blockNote getter (default null)', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'blocked', cabinClass: 'Y' });
    expect(seat.blockNote).toBeNull();
  });

  it('exposes blockNote when provided', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'blocked', cabinClass: 'Y', blockNote: 'Crew rest' });
    expect(seat.blockNote).toBe('Crew rest');
  });

  it('normalizes empty/whitespace blockNote to null', () => {
    const seat = Seat.create({ seatNumber: SeatNumber.create('12A'), status: 'blocked', cabinClass: 'Y', blockNote: '  ' });
    expect(seat.blockNote).toBeNull();
  });
});

describe('Seat', () => {
  // Test 1 — Happy path: valid seat is created and isAvailable returns true for 'available' status
  it('creates a Seat with status "available" and reports isAvailable() true', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'available',
      cabinClass: 'Y',
    });
    expect(seat.isAvailable()).toBe(true);
    expect(seat.number.toString()).toBe('12A');
    expect(seat.cabin).toBe('Y');
  });

  // Test 2 — Null/invalid: null seatNumber throws
  it('throws when seatNumber is null', () => {
    expect(() =>
      Seat.create({
        seatNumber: null as never,
        status: 'available',
        cabinClass: 'Y',
      })
    ).toThrow('Seat requires a SeatNumber');
  });

  // Test 3 — Boundary: occupied seat reports isAvailable() false
  it('creates a Seat with status "occupied" and reports isAvailable() false', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('1A'),
      status: 'occupied',
      cabinClass: 'Y',
    });
    expect(seat.isAvailable()).toBe(false);
    expect(seat.isOccupied()).toBe(true);
  });

  // Test 4 — Immutability: withStatus returns a new instance
  it('withStatus returns a new Seat instance leaving original unchanged', () => {
    const original = Seat.create({
      seatNumber: SeatNumber.create('5C'),
      status: 'available',
      cabinClass: 'C',
    });
    const updated = original.withStatus('blocked');
    expect(updated.status).toBe('blocked');
    expect(original.status).toBe('available');
    expect(updated).not.toBe(original);
  });

  // Test 5 — exit_row_available status: isExitRow and isAvailable both true
  it('reports isExitRow() true for status "exit_row_available"', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('14F'),
      status: 'exit_row_available',
      cabinClass: 'Y',
    });
    expect(seat.isExitRow()).toBe(true);
    expect(seat.isAvailable()).toBe(true);
  });

  // Test 6 — isOccupied for 'infant_occupied'
  it('reports isOccupied() true for status "infant_occupied"', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('10B'),
      status: 'infant_occupied',
      cabinClass: 'Y',
    });
    expect(seat.isOccupied()).toBe(true);
    expect(seat.isAvailable()).toBe(false);
  });

  // Test 7 — accepts checked_in status
  it('accepts checked_in status', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'checked_in' as SeatStatus,
      cabinClass: 'Y',
    });
    expect(seat.status).toBe('checked_in');
  });

  // Test 8 — accepts boarded status
  it('accepts boarded status', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'boarded' as SeatStatus,
      cabinClass: 'Y',
    });
    expect(seat.status).toBe('boarded');
  });

  // Test 9 — checked_in and boarded are treated as occupied
  it('treats checked_in and boarded as occupied', () => {
    const ci = Seat.create({
      seatNumber: SeatNumber.create('12A'),
      status: 'checked_in' as SeatStatus,
      cabinClass: 'Y',
    });
    const bd = Seat.create({
      seatNumber: SeatNumber.create('12B'),
      status: 'boarded' as SeatStatus,
      cabinClass: 'Y',
    });
    expect(ci.isOccupied()).toBe(true);
    expect(ci.isAvailable()).toBe(false);
    expect(bd.isOccupied()).toBe(true);
    expect(bd.isAvailable()).toBe(false);
  });
});
