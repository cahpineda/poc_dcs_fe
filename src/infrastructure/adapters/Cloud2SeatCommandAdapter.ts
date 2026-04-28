import type { AxiosInstance } from 'axios';
import type { ISeatCommandService } from '@/application/ports';
import type { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import type { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import type { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import type { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';
import type { UnassignSeatCommand } from '@/domain/seat/commands/UnassignSeatCommand';
import type { SwapSeatsCommand } from '@/domain/seat/commands/SwapSeatsCommand';
import type { ReseatGroupCommand } from '@/domain/seat/commands/ReseatGroupCommand';

function isConflict(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('isAxiosError' in err)) return false;
  const status = (err as { response?: { status?: unknown } }).response?.status;
  return status === 409;
}

export class Cloud2SeatCommandAdapter implements ISeatCommandService {
  constructor(private readonly http: AxiosInstance) {}

  async assignSeat(command: AssignSeatCommand): Promise<void> {
    try {
      await this.http.post('/ajax/seat_plan/assign_seat', {
        flight_id: command.flightId,
        seat_number: command.seatNumber,
        passenger_id: command.passengerId,
      });
    } catch (err) {
      if (isConflict(err)) throw new Error('Seat is already occupied');
      throw err;
    }
  }

  async reseatPassenger(command: ReseatPassengerCommand): Promise<void> {
    await this.http.post('/ajax/seat_plan/reseat_passenger', {
      flight_id: command.flightId,
      from_seat: command.fromSeat,
      to_seat: command.toSeat,
      passenger_id: command.passengerId,
    });
  }

  async blockSeat(command: BlockSeatCommand): Promise<void> {
    await this.http.post('/ajax/seat_plan/block_seat', {
      flight_id: command.flightId,
      seat_number: command.seatNumber,
      reason: command.reason,
    });
  }

  async unblockSeat(command: UnblockSeatCommand): Promise<void> {
    await this.http.post('/ajax/seat_plan/unblock_seat', {
      flight_id: command.flightId,
      seat_number: command.seatNumber,
    });
  }

  async unassignSeat(command: UnassignSeatCommand): Promise<void> {
    await this.http.post('/dc/unseat_passenger', {
      flight_id: command.flightId,
      seat_number: command.seatNumber,
    });
  }

  async swapSeats(command: SwapSeatsCommand): Promise<void> {
    await this.http.post('/dc/swap_seats', {
      flight_id: command.flightId,
      seat_a: command.seatA,
      seat_b: command.seatB,
    });
  }

  async reseatGroup(command: ReseatGroupCommand): Promise<void> {
    await this.http.post('/dc/reseat_group', {
      flight_id: command.flightId,
      passenger_ids: command.passengerIds,
      target_row: command.targetRow,
    });
  }
}
