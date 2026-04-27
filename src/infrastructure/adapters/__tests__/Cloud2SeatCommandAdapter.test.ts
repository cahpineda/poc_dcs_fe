import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosInstance, AxiosError } from 'axios';
import { Cloud2SeatCommandAdapter } from '../Cloud2SeatCommandAdapter';
import { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';
import { UnassignSeatCommand } from '@/domain/seat/commands/UnassignSeatCommand';
import { SwapSeatsCommand } from '@/domain/seat/commands/SwapSeatsCommand';
import { ReseatGroupCommand } from '@/domain/seat/commands/ReseatGroupCommand';

const mockPost = vi.fn();
const mockHttp = { post: mockPost } as unknown as AxiosInstance;

beforeEach(() => {
  mockPost.mockReset();
});

describe('Cloud2SeatCommandAdapter', () => {
  it('assignSeat posts to correct endpoint and resolves void', async () => {
    mockPost.mockResolvedValue({ data: { success: true } });
    const adapter = new Cloud2SeatCommandAdapter(mockHttp);
    const cmd = AssignSeatCommand.create({ passengerId: 'P1', seatNumber: '12A', flightId: 'FL001' });

    await adapter.assignSeat(cmd);

    expect(mockPost).toHaveBeenCalledWith('/ajax/seat_plan/assign_seat', cmd);
  });

  it('assignSeat maps HTTP 409 to domain error about occupied seat', async () => {
    const axiosError = {
      isAxiosError: true,
      response: { status: 409 },
    } as unknown as AxiosError;
    mockPost.mockRejectedValue(axiosError);
    const adapter = new Cloud2SeatCommandAdapter(mockHttp);
    const cmd = AssignSeatCommand.create({ passengerId: 'P1', seatNumber: '12A', flightId: 'FL001' });

    await expect(adapter.assignSeat(cmd)).rejects.toThrow('Seat is already occupied');
  });

  it('blockSeat posts to correct endpoint', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const adapter = new Cloud2SeatCommandAdapter(mockHttp);
    const cmd = BlockSeatCommand.create({ seatNumber: '12A', flightId: 'FL001', reason: 'crew' });

    await adapter.blockSeat(cmd);

    expect(mockPost).toHaveBeenCalledWith('/ajax/seat_plan/block_seat', cmd);
  });

  it('unblockSeat posts to correct endpoint', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const adapter = new Cloud2SeatCommandAdapter(mockHttp);
    const cmd = UnblockSeatCommand.create({ seatNumber: '12A', flightId: 'FL001' });

    await adapter.unblockSeat(cmd);

    expect(mockPost).toHaveBeenCalledWith('/ajax/seat_plan/unblock_seat', cmd);
  });

  it('reseatPassenger posts to correct endpoint', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const adapter = new Cloud2SeatCommandAdapter(mockHttp);
    const cmd = ReseatPassengerCommand.create({ passengerId: 'P1', fromSeat: '12A', toSeat: '14C', flightId: 'FL001' });

    await adapter.reseatPassenger(cmd);

    expect(mockPost).toHaveBeenCalledWith('/ajax/seat_plan/reseat_passenger', cmd);
  });

  it('unassignSeat posts to /dc/unseat_passenger with the command', async () => {
    const post = vi.fn().mockResolvedValue({});
    const adapter = new Cloud2SeatCommandAdapter({ post } as unknown as AxiosInstance);
    const cmd = UnassignSeatCommand.create({ flightId: 'FL001', seatNumber: '1B' });
    await adapter.unassignSeat(cmd);
    expect(post).toHaveBeenCalledWith('/dc/unseat_passenger', cmd);
  });

  it('swapSeats posts to /dc/swap_seats with the command', async () => {
    const post = vi.fn().mockResolvedValue({});
    const adapter = new Cloud2SeatCommandAdapter({ post } as unknown as AxiosInstance);
    const cmd = SwapSeatsCommand.create({ flightId: 'FL001', seatA: '1B', seatB: '2C' });
    await adapter.swapSeats(cmd);
    expect(post).toHaveBeenCalledWith('/dc/swap_seats', cmd);
  });

  it('reseatGroup posts to /dc/reseat_group with the command', async () => {
    const post = vi.fn().mockResolvedValue({});
    const adapter = new Cloud2SeatCommandAdapter({ post } as unknown as AxiosInstance);
    const cmd = ReseatGroupCommand.create({ flightId: 'FL001', passengerIds: ['PAX-001'] });
    await adapter.reseatGroup(cmd);
    expect(post).toHaveBeenCalledWith('/dc/reseat_group', cmd);
  });
});
