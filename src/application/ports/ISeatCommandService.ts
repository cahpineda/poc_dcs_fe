import type { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import type { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import type { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import type { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';
import type { UnassignSeatCommand } from '@/domain/seat/commands/UnassignSeatCommand';
import type { SwapSeatsCommand } from '@/domain/seat/commands/SwapSeatsCommand';
import type { ReseatGroupCommand } from '@/domain/seat/commands/ReseatGroupCommand';

export interface ISeatCommandService {
  assignSeat(command: AssignSeatCommand): Promise<void>;
  reseatPassenger(command: ReseatPassengerCommand): Promise<void>;
  blockSeat(command: BlockSeatCommand): Promise<void>;
  unblockSeat(command: UnblockSeatCommand): Promise<void>;
  unassignSeat(command: UnassignSeatCommand): Promise<void>;
  swapSeats(command: SwapSeatsCommand): Promise<void>;
  reseatGroup(command: ReseatGroupCommand): Promise<void>;
}
