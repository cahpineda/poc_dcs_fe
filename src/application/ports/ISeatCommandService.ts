import type { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import type { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import type { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import type { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';

export interface ISeatCommandService {
  assignSeat(command: AssignSeatCommand): Promise<void>;
  reseatPassenger(command: ReseatPassengerCommand): Promise<void>;
  blockSeat(command: BlockSeatCommand): Promise<void>;
  unblockSeat(command: UnblockSeatCommand): Promise<void>;
}
