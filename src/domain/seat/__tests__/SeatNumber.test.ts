import { describe, it, expect } from 'vitest';
import { SeatNumber } from '../SeatNumber';

describe('SeatNumber', () => {
  // Test 1 — Happy path: valid seat number returns SeatNumber instance
  it('creates a SeatNumber for a valid format "12A"', () => {
    const sn = SeatNumber.create('12A');
    expect(sn.toString()).toBe('12A');
    expect(sn.rawValue).toBe('12A');
  });

  // Test 2 — Null/invalid: empty string throws
  it('throws for an empty string', () => {
    expect(() => SeatNumber.create('')).toThrow('Invalid seat number: empty');
  });

  // Test 3 — Error/boundary: letters-only (no row number) throws
  it('throws for letters-only input "ABC"', () => {
    expect(() => SeatNumber.create('ABC')).toThrow('Invalid seat number: ABC');
  });

  // Test 4 — single-digit row is valid
  it('creates a SeatNumber for single-digit row "1A"', () => {
    const sn = SeatNumber.create('1A');
    expect(sn.toString()).toBe('1A');
  });

  // Test 5 — equals compares two instances by value
  it('equals returns true when two SeatNumbers have the same value', () => {
    const a = SeatNumber.create('12A');
    const b = SeatNumber.create('12A');
    expect(a.equals(b)).toBe(true);
  });

  // Test 6 — equals returns false for different values
  it('equals returns false for different SeatNumbers', () => {
    const a = SeatNumber.create('12A');
    const b = SeatNumber.create('12B');
    expect(a.equals(b)).toBe(false);
  });
});
