import type { AxiosInstance } from 'axios';
import type { ISeatCommandService } from '@/application/ports';
import type { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import type { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import type { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import type { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';

function isConflict(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('isAxiosError' in err)) return false;
  const status = (err as { response?: { status?: unknown } }).response?.status;
  return status === 409;
}

export class Cloud2SeatCommandAdapter implements ISeatCommandService {
  constructor(private readonly http: AxiosInstance) {}

  async assignSeat(command: AssignSeatCommand): Promise<void> {
    try {
      await this.http.post('/ajax/seat_plan/assign_seat', command);
    } catch (err) {
      if (isConflict(err)) throw new Error('Seat is already occupied');
      throw err;
    }
  }

  async reseatPassenger(command: ReseatPassengerCommand): Promise<void> {
    await this.http.post('/ajax/seat_plan/reseat_passenger', command);
  }

  async blockSeat(command: BlockSeatCommand): Promise<void> {
    await this.http.post('/ajax/seat_plan/block_seat', command);
  }

  async unblockSeat(command: UnblockSeatCommand): Promise<void> {
    await this.http.post('/ajax/seat_plan/unblock_seat', command);
  }
}
