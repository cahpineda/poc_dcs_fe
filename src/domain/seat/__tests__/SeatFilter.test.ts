import { describe, it, expect } from 'vitest';
import { SEAT_FILTER_IDS, SEAT_FILTER_LABELS, matchesFilters } from '../SeatFilter';
import type { SeatFilterId } from '../SeatFilter';
import { Seat } from '../Seat';
import { SeatNumber } from '../SeatNumber';
import type { SeatStatus } from '../SeatStatus';

function makeSeat(
  seatNumber: string,
  status: SeatStatus,
  attrs: SeatFilterId[] = []
) {
  return Seat.create({
    seatNumber: SeatNumber.create(seatNumber),
    status,
    cabinClass: 'Y',
    attributes: attrs,
  });
}

describe('SEAT_FILTER_IDS', () => {
  it('exports exactly the 11 expected filter ids', () => {
    expect(SEAT_FILTER_IDS).toHaveLength(11);
    expect(SEAT_FILTER_IDS).toContain('extra_leg_room');
    expect(SEAT_FILTER_IDS).toContain('stretcher');
    expect(SEAT_FILTER_IDS).toContain('no_smoke');
    expect(SEAT_FILTER_IDS).toContain('infant_eligible');
    expect(SEAT_FILTER_IDS).toContain('exit_emergency');
    expect(SEAT_FILTER_IDS).toContain('bulkhead');
    expect(SEAT_FILTER_IDS).toContain('galley_proximity');
    expect(SEAT_FILTER_IDS).toContain('usb_power');
    expect(SEAT_FILTER_IDS).toContain('window');
    expect(SEAT_FILTER_IDS).toContain('window_no_view');
    expect(SEAT_FILTER_IDS).toContain('other');
  });
});

describe('SEAT_FILTER_LABELS', () => {
  it('maps each id to the correct screenshot label', () => {
    expect(SEAT_FILTER_LABELS.extra_leg_room).toBe('Extra Leg Room');
    expect(SEAT_FILTER_LABELS.stretcher).toBe('Stretcher');
    expect(SEAT_FILTER_LABELS.no_smoke).toBe('No smoke seat');
    expect(SEAT_FILTER_LABELS.infant_eligible).toBe('Seat Available for adult with infant');
    expect(SEAT_FILTER_LABELS.exit_emergency).toBe('Exit and emergency exit');
    expect(SEAT_FILTER_LABELS.bulkhead).toBe('Bulkhead seat');
    expect(SEAT_FILTER_LABELS.galley_proximity).toBe('Galley Proximity');
    expect(SEAT_FILTER_LABELS.usb_power).toBe('USB Power Port');
    expect(SEAT_FILTER_LABELS.window).toBe('Window seat');
    expect(SEAT_FILTER_LABELS.window_no_view).toBe('Window seat without window');
    expect(SEAT_FILTER_LABELS.other).toBe('Other');
  });
});

describe('matchesFilters', () => {
  it('returns true when no filters are active (empty set)', () => {
    const seat = makeSeat('5C', 'available');
    expect(matchesFilters(seat, new Set())).toBe(true);
  });

  it('returns true when one active filter matches seat attributes', () => {
    const seat = makeSeat('5C', 'available', ['usb_power']);
    expect(matchesFilters(seat, new Set(['usb_power']))).toBe(true);
  });

  it('returns false when one active filter does not match seat attributes', () => {
    const seat = makeSeat('5C', 'available');
    expect(matchesFilters(seat, new Set(['usb_power']))).toBe(false);
  });

  it('returns true with multiple active filters if ANY match (OR semantics)', () => {
    const seat = makeSeat('5C', 'available', ['bulkhead']);
    expect(matchesFilters(seat, new Set(['usb_power', 'bulkhead']))).toBe(true);
  });

  it('returns false with multiple active filters if NONE match', () => {
    const seat = makeSeat('5C', 'available', ['galley_proximity']);
    expect(matchesFilters(seat, new Set(['usb_power', 'bulkhead']))).toBe(false);
  });

  it('returns true for non-available (occupied) seat regardless of active filters', () => {
    const seat = makeSeat('5C', 'occupied');
    expect(matchesFilters(seat, new Set(['usb_power']))).toBe(true);
  });

  it('returns true for blocked seat regardless of active filters', () => {
    const seat = makeSeat('5C', 'blocked');
    expect(matchesFilters(seat, new Set(['bulkhead']))).toBe(true);
  });
});
