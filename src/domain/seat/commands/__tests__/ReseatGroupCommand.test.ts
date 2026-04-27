import { describe, it, expect } from 'vitest';
import { ReseatGroupCommand } from '../ReseatGroupCommand';

describe('ReseatGroupCommand', () => {
  it('creates with correct fields', () => {
    const cmd = ReseatGroupCommand.create({ flightId: 'FL001', passengerIds: ['PAX-001', 'PAX-002'] });
    expect(cmd.flightId).toBe('FL001');
    expect(cmd.passengerIds).toEqual(['PAX-001', 'PAX-002']);
    expect(cmd.targetRow).toBeUndefined();
  });
  it('accepts optional targetRow', () => {
    const cmd = ReseatGroupCommand.create({ flightId: 'FL001', passengerIds: ['PAX-001'], targetRow: 5 });
    expect(cmd.targetRow).toBe(5);
  });
  it('throws when passengerIds is empty', () => {
    expect(() => ReseatGroupCommand.create({ flightId: 'FL001', passengerIds: [] })).toThrow();
  });
});
