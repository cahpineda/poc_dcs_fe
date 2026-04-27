import { describe, it, expect } from 'vitest';
import { SwapSeatsCommand } from '../SwapSeatsCommand';

describe('SwapSeatsCommand', () => {
  it('creates with correct fields', () => {
    const cmd = SwapSeatsCommand.create({ flightId: 'FL001', seatA: '1B', seatB: '2C' });
    expect(cmd.flightId).toBe('FL001');
    expect(cmd.seatA).toBe('1B');
    expect(cmd.seatB).toBe('2C');
  });
  it('throws when seatA is missing', () => {
    expect(() => SwapSeatsCommand.create({ flightId: 'FL001', seatA: '', seatB: '2C' })).toThrow();
  });
  it('throws when seatB is missing', () => {
    expect(() => SwapSeatsCommand.create({ flightId: 'FL001', seatA: '1B', seatB: '' })).toThrow();
  });
});
