import { describe, it, expect } from 'vitest';
import { Seat } from '../Seat';
import { SeatNumber } from '../SeatNumber';
import { Passenger } from '../Passenger';

function makeOccupiedSeat(overrides: Partial<Parameters<typeof Seat.create>[0]> = {}) {
  return Seat.create({
    seatNumber: SeatNumber.create('3C'),
    status: 'occupied',
    cabinClass: 'Y',
    passengerName: 'John Doe',
    passengerKey: 'PKY-001',
    boardingGroup: 2,
    pnr: 'ABC123',
    gender: 'M',
    ssrs: ['WCHR'],
    hasInfant: false,
    rushStatus: false,
    ...overrides,
  });
}

describe('Passenger.fromSeat', () => {
  it('returns a Passenger from an occupied seat with all fields mapped', () => {
    const seat = makeOccupiedSeat();
    const passenger = Passenger.fromSeat(seat);
    expect(passenger).not.toBeNull();
    expect(passenger!.name).toBe('John Doe');
    expect(passenger!.passengerKey).toBe('PKY-001');
    expect(passenger!.currentSeatNumber).toBe('3C');
    expect(passenger!.boardingGroup).toBe(2);
    expect(passenger!.pnr).toBe('ABC123');
    expect(passenger!.gender).toBe('M');
    expect(passenger!.ssrs).toEqual(['WCHR']);
    expect(passenger!.hasInfant).toBe(false);
    expect(passenger!.rushStatus).toBe(false);
  });

  it('returns null when seat has no passengerName (unoccupied)', () => {
    const seat = Seat.create({
      seatNumber: SeatNumber.create('4A'),
      status: 'available',
      cabinClass: 'Y',
    });
    expect(Passenger.fromSeat(seat)).toBeNull();
  });

  it('isCheckedIn is true when status is checked_in', () => {
    const seat = makeOccupiedSeat({ status: 'checked_in' });
    const passenger = Passenger.fromSeat(seat)!;
    expect(passenger.isCheckedIn).toBe(true);
    expect(passenger.checkInLabel).toBe('Checked');
  });

  it('isCheckedIn is true when status is boarded', () => {
    const seat = makeOccupiedSeat({ status: 'boarded' });
    const passenger = Passenger.fromSeat(seat)!;
    expect(passenger.isCheckedIn).toBe(true);
    expect(passenger.checkInLabel).toBe('Checked');
  });

  it('isCheckedIn is false when status is occupied (not checked in)', () => {
    const seat = makeOccupiedSeat({ status: 'occupied' });
    const passenger = Passenger.fromSeat(seat)!;
    expect(passenger.isCheckedIn).toBe(false);
    expect(passenger.checkInLabel).toBe('Unchecked');
  });
});

describe('Passenger.formattedName', () => {
  it('converts "John Doe" to "DOE,JOHN" (last word is last name, uppercase, no space)', () => {
    const seat = makeOccupiedSeat({ passengerName: 'John Doe' });
    const passenger = Passenger.fromSeat(seat)!;
    expect(passenger.formattedName).toBe('DOE,JOHN');
  });

  it('handles multi-word first names: "Mary Jane Watson" → "WATSON,MARY JANE"', () => {
    const seat = makeOccupiedSeat({ passengerName: 'Mary Jane Watson' });
    const passenger = Passenger.fromSeat(seat)!;
    expect(passenger.formattedName).toBe('WATSON,MARY JANE');
  });

  it('falls through unchanged when only one word is present', () => {
    const seat = makeOccupiedSeat({ passengerName: 'Madonna' });
    const passenger = Passenger.fromSeat(seat)!;
    expect(passenger.formattedName).toBe('Madonna');
  });
});

describe('Passenger.equals', () => {
  it('returns true when two passengers share the same passengerKey', () => {
    const seat1 = makeOccupiedSeat({ passengerKey: 'PKY-001', seatNumber: SeatNumber.create('1A') });
    const seat2 = makeOccupiedSeat({ passengerKey: 'PKY-001', seatNumber: SeatNumber.create('2B') });
    const p1 = Passenger.fromSeat(seat1)!;
    const p2 = Passenger.fromSeat(seat2)!;
    expect(p1.equals(p2)).toBe(true);
  });

  it('returns false when passengerKeys differ', () => {
    const seat1 = makeOccupiedSeat({ passengerKey: 'PKY-001', seatNumber: SeatNumber.create('1A') });
    const seat2 = makeOccupiedSeat({ passengerKey: 'PKY-002', seatNumber: SeatNumber.create('1A') });
    const p1 = Passenger.fromSeat(seat1)!;
    const p2 = Passenger.fromSeat(seat2)!;
    expect(p1.equals(p2)).toBe(false);
  });

  it('falls back to name + seatNumber equality when passengerKey is null', () => {
    const seat1 = makeOccupiedSeat({ passengerKey: undefined, seatNumber: SeatNumber.create('1A') });
    const seat2 = makeOccupiedSeat({ passengerKey: undefined, seatNumber: SeatNumber.create('1A') });
    const p1 = Passenger.fromSeat(seat1)!;
    const p2 = Passenger.fromSeat(seat2)!;
    expect(p1.equals(p2)).toBe(true);
  });
});
