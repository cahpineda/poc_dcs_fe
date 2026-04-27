import type { ISeatCommandService } from '@/application/ports';
import type { AssignSeatCommand } from '@/domain/seat/commands/AssignSeatCommand';
import type { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import type { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';
import type { ReseatPassengerCommand } from '@/domain/seat/commands/ReseatPassengerCommand';
import type { UnassignSeatCommand } from '@/domain/seat/commands/UnassignSeatCommand';
import type { SwapSeatsCommand } from '@/domain/seat/commands/SwapSeatsCommand';
import type { ReseatGroupCommand } from '@/domain/seat/commands/ReseatGroupCommand';

// Dev-only mock — simulates network delay, always succeeds
export class MockSeatCommandAdapter implements ISeatCommandService {
  private delay() {
    return new Promise<void>((resolve) => setTimeout(resolve, 300));
  }

  async assignSeat(_: AssignSeatCommand): Promise<void> {
    await this.delay();
  }

  async blockSeat(_: BlockSeatCommand): Promise<void> {
    await this.delay();
  }

  async unblockSeat(_: UnblockSeatCommand): Promise<void> {
    await this.delay();
  }

  async reseatPassenger(_: ReseatPassengerCommand): Promise<void> {
    await this.delay();
  }

  async unassignSeat(_: UnassignSeatCommand): Promise<void> {
    await this.delay();
  }

  async swapSeats(_: SwapSeatsCommand): Promise<void> {
    await this.delay();
  }

  async reseatGroup(_: ReseatGroupCommand): Promise<void> {
    await this.delay();
  }
}
