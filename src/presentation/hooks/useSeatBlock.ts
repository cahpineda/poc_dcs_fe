import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/infrastructure/DependencyProvider';
import type { BlockSeatCommand } from '@/domain/seat/commands/BlockSeatCommand';
import type { UnblockSeatCommand } from '@/domain/seat/commands/UnblockSeatCommand';

export function useSeatBlock(flightId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: BlockSeatCommand) => services.seatCommand.blockSeat(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seatPlan', flightId] }),
  });
}

export function useSeatUnblock(flightId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: UnblockSeatCommand) => services.seatCommand.unblockSeat(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seatPlan', flightId] }),
  });
}
