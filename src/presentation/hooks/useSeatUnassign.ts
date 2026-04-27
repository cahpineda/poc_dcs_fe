import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/infrastructure/DependencyProvider';
import type { UnassignSeatCommand } from '@/domain/seat/commands/UnassignSeatCommand';

export function useSeatUnassign(flightId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: UnassignSeatCommand) => services.seatCommand.unassignSeat(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seatPlan', flightId] }),
  });
}
