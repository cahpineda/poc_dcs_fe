import { describe, it, expect } from 'vitest';
import { AssignSeatCommand } from '../AssignSeatCommand';
import { BlockSeatCommand } from '../BlockSeatCommand';
import { UnblockSeatCommand } from '../UnblockSeatCommand';
import { ReseatPassengerCommand } from '../ReseatPassengerCommand';
import { UnassignSeatCommand } from '../UnassignSeatCommand';

describe('AssignSeatCommand', () => {
  it('creates with valid fields', () => {
    const cmd = AssignSeatCommand.create({ passengerId: 'P1', seatNumber: '12A', flightId: 'FL001' });
    expect(cmd.passengerId).toBe('P1');
    expect(cmd.seatNumber).toBe('12A');
    expect(cmd.flightId).toBe('FL001');
  });

  it('throws if passengerId is empty', () => {
    expect(() => AssignSeatCommand.create({ passengerId: '', seatNumber: '12A', flightId: 'FL001' }))
      .toThrow('passengerId is required');
  });

  it('throws if seatNumber is empty', () => {
    expect(() => AssignSeatCommand.create({ passengerId: 'P1', seatNumber: '', flightId: 'FL001' }))
      .toThrow('seatNumber is required');
  });

  it('throws if flightId is empty', () => {
    expect(() => AssignSeatCommand.create({ passengerId: 'P1', seatNumber: '12A', flightId: '' }))
      .toThrow('flightId is required');
  });
});

describe('BlockSeatCommand', () => {
  it('creates with valid fields', () => {
    const cmd = BlockSeatCommand.create({ seatNumber: '3B', flightId: 'FL001', reason: 'crew' });
    expect(cmd.seatNumber).toBe('3B');
    expect(cmd.flightId).toBe('FL001');
    expect(cmd.reason).toBe('crew');
  });

  it('throws if seatNumber is empty', () => {
    expect(() => BlockSeatCommand.create({ seatNumber: '', flightId: 'FL001', reason: 'crew' }))
      .toThrow('seatNumber is required');
  });

  it('throws if flightId is empty', () => {
    expect(() => BlockSeatCommand.create({ seatNumber: '3B', flightId: '', reason: 'crew' }))
      .toThrow('flightId is required');
  });
});

describe('UnblockSeatCommand', () => {
  it('creates with valid fields', () => {
    const cmd = UnblockSeatCommand.create({ seatNumber: '3B', flightId: 'FL001' });
    expect(cmd.seatNumber).toBe('3B');
    expect(cmd.flightId).toBe('FL001');
  });

  it('throws if seatNumber is empty', () => {
    expect(() => UnblockSeatCommand.create({ seatNumber: '', flightId: 'FL001' }))
      .toThrow('seatNumber is required');
  });
});

describe('ReseatPassengerCommand', () => {
  it('creates with valid fields', () => {
    const cmd = ReseatPassengerCommand.create({ passengerId: 'P1', fromSeat: '12A', toSeat: '14C', flightId: 'FL001' });
    expect(cmd.passengerId).toBe('P1');
    expect(cmd.fromSeat).toBe('12A');
    expect(cmd.toSeat).toBe('14C');
    expect(cmd.flightId).toBe('FL001');
  });

  it('throws if fromSeat equals toSeat', () => {
    expect(() => ReseatPassengerCommand.create({ passengerId: 'P1', fromSeat: '12A', toSeat: '12A', flightId: 'FL001' }))
      .toThrow('fromSeat and toSeat must differ');
  });

  it('throws if passengerId is empty', () => {
    expect(() => ReseatPassengerCommand.create({ passengerId: '', fromSeat: '12A', toSeat: '14C', flightId: 'FL001' }))
      .toThrow('passengerId is required');
  });
});

describe('UnassignSeatCommand', () => {
  it('creates with valid flightId and seatNumber', () => {
    const cmd = UnassignSeatCommand.create({ flightId: 'FL001', seatNumber: '1A' });
    expect(cmd.flightId).toBe('FL001');
    expect(cmd.seatNumber).toBe('1A');
  });

  it('throws if flightId is missing/empty', () => {
    expect(() => UnassignSeatCommand.create({ flightId: '', seatNumber: '1A' }))
      .toThrow('flightId is required');
  });

  it('throws if seatNumber is missing/empty', () => {
    expect(() => UnassignSeatCommand.create({ flightId: 'FL001', seatNumber: '' }))
      .toThrow('seatNumber is required');
  });
});
